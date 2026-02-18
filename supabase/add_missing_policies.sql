-- =====================================================
-- ADD MISSING RLS POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- PROJECTS: Add INSERT, UPDATE, DELETE policies
CREATE POLICY "Owners can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

CREATE POLICY "Creators can update their projects"
ON projects FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can delete projects"
ON projects FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- EXPENSES: All CRUD policies
CREATE POLICY "Authenticated users can view expenses"
ON expenses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create expenses"
ON expenses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their expenses"
ON expenses FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can delete expenses"
ON expenses FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- PROFILES: User profile policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Verify all policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('projects', 'expenses', 'profiles')
ORDER BY tablename, cmd;
