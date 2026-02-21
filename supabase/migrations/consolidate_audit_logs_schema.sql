-- =====================================================
-- Migration: Consolidate audit_logs table schema
-- Issue: Duplicate columns with different naming conventions
-- - userId/user_id, projectId/project_id, userName/user_name
-- - entityType/entity_type, entityId/entity_id, ipAddress/ip_address
-- - timestamp/created_at
-- Also: Duplicate foreign key constraints
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- Step 1: Create backup of existing data
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs_migration_backup AS 
SELECT * FROM audit_logs;

-- =====================================================
-- Step 2: Migrate data from camelCase columns to snake_case
-- NOTE: PostgreSQL stores camelCase columns with quotes, must use quotes to reference
-- =====================================================

-- Migrate "userId" -> user_id (if userId has data and user_id is null)
UPDATE audit_logs 
SET user_id = "userId" 
WHERE "userId" IS NOT NULL AND user_id IS NULL;

-- Migrate "projectId" -> project_id
UPDATE audit_logs 
SET project_id = "projectId" 
WHERE "projectId" IS NOT NULL AND project_id IS NULL;

-- Migrate "userName" -> user_name
UPDATE audit_logs 
SET user_name = "userName" 
WHERE "userName" IS NOT NULL AND user_name IS NULL;

-- Migrate "entityType" -> entity_type
UPDATE audit_logs 
SET entity_type = "entityType" 
WHERE "entityType" IS NOT NULL AND entity_type IS NULL;

-- Migrate "entityId" -> entity_id (note: entityId is UUID, entity_id is text)
UPDATE audit_logs 
SET entity_id = "entityId"::text 
WHERE "entityId" IS NOT NULL AND entity_id IS NULL;

-- Migrate "ipAddress" -> ip_address
UPDATE audit_logs 
SET ip_address = "ipAddress" 
WHERE "ipAddress" IS NOT NULL AND ip_address IS NULL;

-- Migrate "timestamp" -> created_at
UPDATE audit_logs 
SET created_at = "timestamp" 
WHERE "timestamp" IS NOT NULL AND created_at IS NULL;

-- =====================================================
-- Step 3: Drop duplicate foreign key constraints
-- =====================================================

-- Drop camelCase foreign keys (keep snake_case ones)
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_projectId_fkey;

-- Keep the snake_case foreign keys:
-- fk_audit_logs_user_id (references auth.users)
-- fk_audit_logs_project_id (references projects)

-- =====================================================
-- Step 4: Drop duplicate camelCase columns
-- NOTE: Must use quotes to reference case-sensitive column names
-- =====================================================

-- Drop columns that have been migrated
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "userId";
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "projectId";
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "userName";
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "entityType";
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "entityId";
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "ipAddress";
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "timestamp";

-- Drop metadata column if it exists (we use old_values/new_values instead)
-- Only drop if old_values and new_values exist and metadata is redundant
-- ALTER TABLE audit_logs DROP COLUMN IF EXISTS metadata;

-- Drop details column if it's redundant with old_values/new_values
-- Keeping it for now as it provides human-readable descriptions

-- =====================================================
-- Step 5: Ensure required columns have proper defaults
-- =====================================================

-- Ensure entity_type has a default
ALTER TABLE audit_logs ALTER COLUMN entity_type SET DEFAULT 'unknown';

-- Ensure created_at has a default
ALTER TABLE audit_logs ALTER COLUMN created_at SET DEFAULT now();

-- =====================================================
-- Step 6: Add missing NOT NULL constraints where needed
-- =====================================================

-- Make action NOT NULL (with default for safety)
ALTER TABLE audit_logs ALTER COLUMN action SET NOT NULL;

-- Make entity_type NOT NULL (already has default)
ALTER TABLE audit_logs ALTER COLUMN entity_type SET NOT NULL;

-- =====================================================
-- Step 7: Recreate indexes (drop old camelCase ones)
-- NOTE: Index names may also be case-sensitive
-- =====================================================

-- Drop old indexes if they exist (try both quoted and unquoted)
DROP INDEX IF EXISTS "idx_audit_logs_userId";
DROP INDEX IF EXISTS "idx_audit_logs_projectId";
DROP INDEX IF EXISTS idx_audit_logs_userId;
DROP INDEX IF EXISTS idx_audit_logs_projectId;

-- Ensure snake_case indexes exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- Step 8: Verify final schema
-- =====================================================

-- Check final column structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'audit_logs';

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
/*
-- To rollback this migration, restore from backup:

-- Drop the current table
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Restore from backup
ALTER TABLE audit_logs_migration_backup RENAME TO audit_logs;

-- Recreate constraints and indexes as needed
*/

-- =====================================================
-- FINAL SCHEMA (for reference)
-- =====================================================
/*
-- Corrected audit_logs table schema:
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'unknown',
    entity_id TEXT,
    details TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes:
-- idx_audit_logs_project_id ON audit_logs(project_id)
-- idx_audit_logs_user_id ON audit_logs(user_id)
-- idx_audit_logs_action ON audit_logs(action)
-- idx_audit_logs_entity_type ON audit_logs(entity_type)
-- idx_audit_logs_created_at ON audit_logs(created_at DESC)

-- Foreign Keys:
-- fk_audit_logs_user_id: user_id -> auth.users(id)
-- fk_audit_logs_project_id: project_id -> projects(id)
*/
