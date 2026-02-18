-- =====================================================
-- Supabase RLS Policies for CivManager
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow insert during signup (handled by trigger/function)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- =====================================================
-- 3. PROJECTS TABLE POLICIES
-- =====================================================

-- All authenticated users can view projects
-- Adjust this if you need project-specific access control
CREATE POLICY "Authenticated users can view projects"
ON projects
FOR SELECT
TO authenticated
USING (true);

-- Only owners can create projects
CREATE POLICY "Owners can create projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Project creators can update their projects
CREATE POLICY "Creators can update their projects"
ON projects
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Only owners can delete projects
CREATE POLICY "Owners can delete projects"
ON projects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- =====================================================
-- 4. EXPENSES TABLE POLICIES
-- =====================================================

-- All authenticated users can view expenses
CREATE POLICY "Authenticated users can view expenses"
ON expenses
FOR SELECT
TO authenticated
USING (true);

-- All authenticated users can create expenses
CREATE POLICY "Authenticated users can create expenses"
ON expenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Expense creators can update their expenses
CREATE POLICY "Creators can update their expenses"
ON expenses
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Only owners can delete expenses
CREATE POLICY "Owners can delete expenses"
ON expenses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- =====================================================
-- 5. AUDIT LOGS TABLE POLICIES
-- =====================================================

-- Only owners can view audit logs
CREATE POLICY "Owners can view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- System can insert audit logs (via trigger)
-- No direct insert policy for users
CREATE POLICY "System can insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- No updates or deletes allowed on audit logs
-- This is append-only for compliance

-- =====================================================
-- 6. HELPER FUNCTION: create_profile
-- =====================================================

CREATE OR REPLACE FUNCTION create_profile(
  p_user_id uuid,
  p_full_name text,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (p_user_id, p_full_name, p_role)
  ON CONFLICT (id) DO UPDATE
  SET full_name = p_full_name, role = p_role;
END;
$$;

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Run these to verify policies are created:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('projects', 'expenses', 'profiles', 'audit_logs')
-- ORDER BY tablename, policyname;

-- =====================================================
-- 8. TROUBLESHOOTING
-- =====================================================

-- If you get "new row violates row-level security policy":
-- 1. Check if user is authenticated: SELECT auth.uid();
-- 2. Check user's role: SELECT * FROM profiles WHERE id = auth.uid();
-- 3. Verify the policy matches your action (SELECT, INSERT, UPDATE, DELETE)

-- To temporarily disable RLS for debugging (NOT for production):
-- ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- To drop a specific policy:
-- DROP POLICY "Policy Name" ON table_name;
