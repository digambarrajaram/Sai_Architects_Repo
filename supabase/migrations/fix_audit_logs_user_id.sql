-- =====================================================
-- Migration: Fix audit_logs table - Add user_id column
-- Issue: Column "user_id" does not exist in audit_logs table
-- Error Code: 42703
-- =====================================================

-- Step 1: Add user_id column to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: Add comment to document the column
COMMENT ON COLUMN audit_logs.user_id IS 'UUID of the user who performed the action';

-- Step 3: Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Step 4: Add foreign key constraint (optional, but recommended)
-- This ensures referential integrity with auth.users table
-- Use DO block to check if constraint exists before adding
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
-- Update or Create Trigger Function for audit_logs
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

    -- Insert into audit_logs with correct column names
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
-- Alternative: Generic audit trigger function
-- Can be used for any table
-- =====================================================

CREATE OR REPLACE FUNCTION generic_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    record_id TEXT;
    project_id_value UUID;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Try to get project_id from the record if it exists
    BEGIN
        IF TG_OP = 'DELETE' THEN
            project_id_value := OLD.project_id;
            record_id := OLD.id::TEXT;
        ELSE
            project_id_value := NEW.project_id;
            record_id := NEW.id::TEXT;
        END IF;
    EXCEPTION
        WHEN undefined_column THEN
            project_id_value := NULL;
            record_id := NULL;
    END;

    -- Insert audit record
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
        project_id_value,
        current_user_id,
        TG_OP,
        TG_TABLE_NAME,
        record_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Verify the trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_audit_expenses';

-- =====================================================
-- Rollback Script (if needed)
-- =====================================================
/*
-- To rollback this migration, run:

DROP TRIGGER IF EXISTS trg_audit_expenses ON expenses;
DROP FUNCTION IF EXISTS log_expense_audit();
DROP FUNCTION IF EXISTS generic_audit_trigger();
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS user_id;
*/
