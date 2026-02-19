-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'supervisor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'planning', 'completed', 'on_hold')),
  due_date DATE,
  budget NUMERIC DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- PROFILES POLICIES
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

-- PROJECTS POLICIES
CREATE POLICY "Authenticated users can view projects"
ON projects FOR SELECT
TO authenticated
USING (true);

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

-- EXPENSES POLICIES
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

-- AUDIT LOGS POLICIES
CREATE POLICY "Owners can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to create/update profile
CREATE OR REPLACE FUNCTION create_profile(
  p_user_id UUID,
  p_full_name TEXT,
  p_role TEXT
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

-- Function to create expense with audit
CREATE OR REPLACE FUNCTION create_expense(
  p_project_id UUID,
  p_amount NUMERIC,
  p_category TEXT,
  p_description TEXT,
  p_expense_date DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expense_id UUID;
  v_role TEXT;
BEGIN
  -- Check user role
  SELECT role INTO v_role
  FROM profiles
  WHERE id = auth.uid();

  IF v_role NOT IN ('owner', 'supervisor') THEN
    RAISE EXCEPTION 'Unauthorized: Only owners and supervisors can create expenses';
  END IF;

  -- Insert expense
  INSERT INTO expenses (
    project_id,
    amount,
    category,
    description,
    expense_date,
    created_by
  )
  VALUES (
    p_project_id,
    p_amount,
    p_category,
    p_description,
    p_expense_date,
    auth.uid()
  )
  RETURNING id INTO v_expense_id;

  -- Create audit log
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    auth.uid(),
    'INSERT',
    'expense',
    v_expense_id,
    jsonb_build_object(
      'amount', p_amount,
      'category', p_category,
      'project_id', p_project_id
    )
  );

  RETURN v_expense_id;
END;
$$;

-- =====================================================
-- 5. SEED DATA (FOR TESTING)
-- =====================================================

-- Insert profiles (use actual auth user IDs in production)
INSERT INTO profiles (id, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Owner One', 'owner'),
('22222222-2222-2222-2222-222222222222', 'Owner Two', 'owner'),
('33333333-3333-3333-3333-333333333333', 'Supervisor One', 'supervisor'),
('44444444-4444-4444-4444-444444444444', 'Supervisor Two', 'supervisor')
ON CONFLICT (id) DO NOTHING;

-- Insert projects
INSERT INTO projects (id, name, status, due_date, budget, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Highway Expansion', 'active', '2026-06-30', 5000000, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bridge Construction', 'active', '2026-12-31', 3200000, '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Metro Survey', 'planning', '2026-03-31', 1200000, '22222222-2222-2222-2222-222222222222'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Downtown Office Complex', 'active', '2026-06-30', 500000, '11111111-1111-1111-1111-111111111111'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Residential Tower Phase 1', 'active', '2026-09-15', 750000, '11111111-1111-1111-1111-111111111111'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Shopping Mall Renovation', 'planning', '2026-12-01', 300000, '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Insert expenses
INSERT INTO expenses (project_id, amount, category, description, expense_date, created_by) VALUES
-- Highway Expansion expenses
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 120000, 'Materials', 'Concrete and steel procurement', '2026-01-05', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 85000, 'Labor', 'Construction workers wages', '2026-01-10', '33333333-3333-3333-3333-333333333333'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 45000, 'Machinery', 'Heavy equipment rental', '2026-01-15', '44444444-4444-4444-4444-444444444444'),

-- Bridge Construction expenses
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 95000, 'Machinery', 'Crane rental', '2026-01-12', '44444444-4444-4444-4444-444444444444'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 45000, 'Transport', 'Material delivery', '2026-01-15', '44444444-4444-4444-4444-444444444444'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 30000, 'Materials', 'Safety equipment', '2026-01-20', '33333333-3333-3333-3333-333333333333'),

-- Metro Survey expenses
('cccccccc-cccc-cccc-cccc-cccccccccccc', 30000, 'Survey Equipment', 'GPS and surveying tools', '2026-01-20', '33333333-3333-3333-3333-333333333333'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 15000, 'Consulting', 'Engineering consultation', '2026-01-25', '33333333-3333-3333-3333-333333333333'),

-- Downtown Office Complex expenses
('dddddddd-dddd-dddd-dddd-dddddddddddd', 120000, 'Materials', 'Steel and glass facade', '2026-01-05', '33333333-3333-3333-3333-333333333333'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 85000, 'Labor', 'Foundation work', '2026-01-10', '33333333-3333-3333-3333-333333333333'),

-- Residential Tower expenses
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 50000, 'Materials', 'Initial material purchase', '2026-01-15', '44444444-4444-4444-4444-444444444444')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Run these to verify setup:
-- SELECT * FROM profiles;
-- SELECT * FROM projects;
-- SELECT * FROM expenses;
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('projects', 'expenses', 'profiles');