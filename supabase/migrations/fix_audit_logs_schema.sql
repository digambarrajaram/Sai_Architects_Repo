-- =====================================================
-- Migration: Fix audit_logs table schema
-- Issue: Missing columns causing 400 Bad Request (code 42703)
-- Error: column "user_id" and "entity" do not exist
-- =====================================================

-- =====================================================
-- Step 1: Check current table structure and backup
-- =====================================================

-- Create a backup of existing data (if any)
CREATE TABLE IF NOT EXISTS audit_logs_backup AS 
SELECT * FROM audit_logs;

-- =====================================================
-- Step 2: Drop existing constraints and triggers
-- =====================================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS trg_audit_expenses ON expenses;
DROP TRIGGER IF EXISTS trg_audit_projects ON projects;
DROP TRIGGER IF EXISTS trg_audit_logs ON audit_logs;

-- Drop existing functions
DROP FUNCTION IF EXISTS log_expense_audit();
DROP FUNCTION IF EXISTS log_project_audit();
DROP FUNCTION IF EXISTS audit_trigger_func();

-- =====================================================
-- Step 3: Recreate audit_logs table with correct schema
-- =====================================================

-- If table needs to be recreated (uncomment if needed)
-- DROP TABLE IF EXISTS audit_logs CASCADE;

-- Ensure all required columns exist
-- Add columns if they don't exist (safe approach)

-- Primary key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'id') THEN
        ALTER TABLE audit_logs ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Project ID (required)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'project_id') THEN
        ALTER TABLE audit_logs ADD COLUMN project_id UUID;
    END IF;
END $$;

-- User ID (required - was missing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
        ALTER TABLE audit_logs ADD COLUMN user_id UUID;
    END IF;
END $$;

-- User Name (optional, for display purposes)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_name') THEN
        ALTER TABLE audit_logs ADD COLUMN user_name TEXT;
    END IF;
END $$;

-- Action (required: INSERT, UPDATE, DELETE, VIEW, EXPORT)
-- NOTE: Adding NOT NULL column to populated table requires DEFAULT value to avoid error 23502
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'action') THEN
        -- Add column with DEFAULT to populate existing rows automatically
        ALTER TABLE audit_logs ADD COLUMN action TEXT NOT NULL DEFAULT 'UNKNOWN';
    END IF;
END $$;

-- Entity Type (required: expense, project, user, report)
-- NOTE: Adding NOT NULL column to populated table requires DEFAULT value to avoid error 23502
-- Error 23502 (not_null_violation) occurs because PostgreSQL cannot assign NULL to existing rows
-- Solution: Add column with DEFAULT, then optionally remove default after column is populated
-- 
-- IMPORTANT: Some legacy schemas use 'entity' column instead of 'entity_type'
-- We need to handle both cases to resolve error 42703 (column "entity" does not exist)

-- First, check if 'entity' column exists and rename it to 'entity_type'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type') THEN
        -- Rename existing 'entity' column to 'entity_type'
        ALTER TABLE audit_logs RENAME COLUMN entity TO entity_type;
    END IF;
END $$;

-- Then, add entity_type if neither column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type') THEN
        -- Add column with DEFAULT to populate existing rows automatically
        ALTER TABLE audit_logs ADD COLUMN entity_type TEXT NOT NULL DEFAULT 'unknown';
    END IF;
END $$;

-- Optionally remove the default after column is added (future inserts must provide value)
-- Uncomment the following line if you don't want a permanent default:
-- ALTER TABLE audit_logs ALTER COLUMN entity_type DROP DEFAULT;

-- Entity ID (required - the ID of the affected record)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_id') THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id TEXT;
    END IF;
END $$;

-- Details (optional: description of the action)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'details') THEN
        ALTER TABLE audit_logs ADD COLUMN details TEXT;
    END IF;
END $$;

-- Old Values (optional: JSON of old record for UPDATE/DELETE)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'old_values') THEN
        ALTER TABLE audit_logs ADD COLUMN old_values JSONB;
    END IF;
END $$;

-- New Values (optional: JSON of new record for INSERT/UPDATE)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'new_values') THEN
        ALTER TABLE audit_logs ADD COLUMN new_values JSONB;
    END IF;
END $$;

-- IP Address (optional)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE audit_logs ADD COLUMN ip_address TEXT;
    END IF;
END $$;

-- Created At (required: timestamp of the action)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'created_at') THEN
        ALTER TABLE audit_logs ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- Step 4: Add indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- Step 5: Add foreign key constraints
-- =====================================================

-- Add foreign key to projects (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_audit_logs_project_id' 
        AND table_name = 'audit_logs'
    ) THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT fk_audit_logs_project_id 
        FOREIGN KEY (project_id) REFERENCES projects(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key to auth.users (if not exists)
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
-- Step 6: Create trigger function for expenses
-- =====================================================

CREATE OR REPLACE FUNCTION log_expense_audit()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    action_type TEXT;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'CREATE';
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
    END IF;

    -- Insert into audit_logs
    INSERT INTO audit_logs (
        project_id,
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(NEW.project_id, OLD.project_id),
        current_user_id,
        action_type,
        'expense',
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Created expense: ' || COALESCE(NEW.category, 'Unknown') || ' - ₹' || COALESCE(NEW.amount::TEXT, '0')
            WHEN TG_OP = 'UPDATE' THEN 'Updated expense: ' || COALESCE(NEW.category, 'Unknown')
            WHEN TG_OP = 'DELETE' THEN 'Deleted expense: ' || COALESCE(OLD.category, 'Unknown')
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
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
-- Step 7: Create trigger function for projects
-- =====================================================

CREATE OR REPLACE FUNCTION log_project_audit()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    action_type TEXT;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'CREATE';
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
    END IF;

    -- Insert into audit_logs
    INSERT INTO audit_logs (
        project_id,
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        old_values,
        new_values,
        created_at
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        current_user_id,
        action_type,
        'project',
        COALESCE(NEW.id::TEXT, OLD.id::TEXT),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Created project: ' || COALESCE(NEW.name, 'Unknown')
            WHEN TG_OP = 'UPDATE' THEN 'Updated project: ' || COALESCE(NEW.name, 'Unknown')
            WHEN TG_OP = 'DELETE' THEN 'Deleted project: ' || COALESCE(OLD.name, 'Unknown')
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
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

-- Create the trigger on projects table
CREATE TRIGGER trg_audit_projects
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_audit();

-- =====================================================
-- Step 8: Add comments to document the schema
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Audit trail for all actions in the system';
COMMENT ON COLUMN audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN audit_logs.project_id IS 'UUID of the associated project';
COMMENT ON COLUMN audit_logs.user_id IS 'UUID of the user who performed the action (from auth.uid())';
COMMENT ON COLUMN audit_logs.user_name IS 'Display name of the user (optional, for convenience)';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: CREATE, UPDATE, DELETE, VIEW, EXPORT';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity: expense, project, user, report';
COMMENT ON COLUMN audit_logs.entity_id IS 'UUID of the affected entity';
COMMENT ON COLUMN audit_logs.details IS 'Human-readable description of the action';
COMMENT ON COLUMN audit_logs.old_values IS 'JSON representation of the entity before the action (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'JSON representation of the entity after the action (for INSERT/UPDATE)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client (optional)';
COMMENT ON COLUMN audit_logs.created_at IS 'Timestamp when the action occurred';

-- =====================================================
-- Verification: Check the final table structure
-- =====================================================

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
/*
-- To rollback this migration:

DROP TRIGGER IF EXISTS trg_audit_expenses ON expenses;
DROP TRIGGER IF EXISTS trg_audit_projects ON projects;
DROP FUNCTION IF EXISTS log_expense_audit();
DROP FUNCTION IF EXISTS log_project_audit();

-- Restore from backup if needed
-- DROP TABLE audit_logs;
-- ALTER TABLE audit_logs_backup RENAME TO audit_logs;

-- Or just drop the added columns
ALTER TABLE audit_logs DROP COLUMN IF EXISTS user_id;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS user_name;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS old_values;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS new_values;
*/

-- =====================================================
-- Enable RLS on audit_logs (optional but recommended)
-- =====================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view all audit logs
-- Use DROP IF EXISTS + CREATE to handle re-runs
DROP POLICY IF EXISTS "Owners can view all audit logs" ON audit_logs;
CREATE POLICY "Owners can view all audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'owner'
        )
    );

-- Policy: Users can insert their own audit logs
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
CREATE POLICY "Users can insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Policy: System can insert audit logs (for triggers)
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
