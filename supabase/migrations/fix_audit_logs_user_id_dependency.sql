-- =====================================================
-- Migration: Fix audit_logs userId column dependency issue
-- Issue: Cannot drop column userId because vw_audit_summary depends on it
-- Solution: Drop dependent view, fix schema, recreate view
-- =====================================================

-- =====================================================
-- Step 1: Check if the problematic view exists
-- =====================================================

-- Check for vw_audit_summary view
DO $$
DECLARE
    view_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_name = 'vw_audit_summary'
    ) INTO view_exists;
    
    IF view_exists THEN
        RAISE NOTICE 'vw_audit_summary view exists and depends on userId column';
    ELSE
        RAISE NOTICE 'vw_audit_summary view does not exist';
    END IF;
END $$;

-- =====================================================
-- Step 2: Drop the dependent view if it exists
-- =====================================================

-- Drop vw_audit_summary view if it exists
DROP VIEW IF EXISTS vw_audit_summary;

-- =====================================================
-- Step 3: Drop the problematic userId column (camelCase)
-- =====================================================

-- Drop the camelCase userId column that's causing the dependency issue
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "userId";

-- =====================================================
-- Step 4: Ensure snake_case user_id column exists and is properly configured
-- =====================================================

-- Add user_id column if it doesn't exist (snake_case)
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_logs_user_id' 
        AND table_name = 'audit_logs'
    ) THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT fk_audit_logs_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- Step 5: Create or recreate the audit summary view with correct schema
-- =====================================================

-- Create vw_audit_summary view using snake_case user_id column
CREATE OR REPLACE VIEW vw_audit_summary AS
SELECT 
    al.id,
    al.user_id,
    p.full_name as user_name,
    al.project_id,
    pr.name as project_name,
    al.action,
    al.entity_type,
    al.entity_id,
    al.details,
    al.old_values,
    al.new_values,
    al.ip_address,
    al.created_at
FROM audit_logs al
LEFT JOIN auth.users au ON al.user_id = au.id
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN projects pr ON al.project_id = pr.id
ORDER BY al.created_at DESC;

-- =====================================================
-- Step 6: Create indexes for the view performance
-- =====================================================

-- Ensure indexes exist for view performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- Step 7: Update trigger function to use snake_case user_id
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_audit_expenses ON expenses;

-- Create or replace the audit log trigger function
CREATE OR REPLACE FUNCTION log_expense_audit()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
    old_values JSONB;
    new_values JSONB;
    current_user_id UUID;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Determine action type and capture values
    IF TG_OP = 'INSERT' THEN
        action_type := 'INSERT';
        old_values := NULL;
        new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        old_values := to_jsonb(OLD);
        new_values := NULL;
    END IF;

    -- Insert into audit_logs with snake_case column names
    INSERT INTO audit_logs (
        project_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(NEW.project_id, OLD.project_id),
        current_user_id,
        action_type,
        'expense',
        COALESCE(NEW.id, OLD.id),
        old_values,
        new_values,
        NOW()
    );

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on expenses table
CREATE TRIGGER trg_audit_expenses
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION log_expense_audit();

-- =====================================================
-- Step 8: Verify the fix
-- =====================================================

-- Verify column structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Verify view exists and works
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'vw_audit_summary';

-- Test view query (should work without errors)
SELECT COUNT(*) as total_audit_logs FROM vw_audit_summary;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
/*
-- To rollback this migration:

-- Drop the trigger and function
DROP TRIGGER IF EXISTS trg_audit_expenses ON expenses;
DROP FUNCTION IF EXISTS log_expense_audit();

-- Drop the view
DROP VIEW IF EXISTS vw_audit_summary;

-- Drop the snake_case user_id column
ALTER TABLE audit_logs DROP COLUMN IF EXISTS user_id;

-- Recreate the camelCase userId column (if needed for rollback)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "userId" UUID;

-- Recreate any original view that was dropped
-- (You would need to recreate the original vw_audit_summary view here)
*/

-- =====================================================
-- FINAL VERIFICATION
-- =====================================================
/*
-- Run these queries to verify the fix:

-- 1. Check audit_logs table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'audit_logs';

-- 2. Check if view exists and works
SELECT * FROM vw_audit_summary LIMIT 5;

-- 3. Test trigger functionality
INSERT INTO expenses (project_id, amount, category, description, expense_date, created_by) 
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000, 'Test', 'Test expense', NOW(), '11111111-1111-1111-1111-111111111111');

-- 4. Verify audit log was created
SELECT * FROM audit_logs WHERE entity_type = 'expense' ORDER BY created_at DESC LIMIT 1;
*/