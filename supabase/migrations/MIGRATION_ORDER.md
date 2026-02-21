# Migration Execution Order

## Overview
This document describes the correct order to execute the Supabase migrations for fixing the `audit_logs` table schema.

## Current Issue
The `audit_logs` table has duplicate columns with different naming conventions:
- **camelCase columns**: `"userId"`, `"projectId"`, `"userName"`, `"entityType"`, `"entityId"`, `"ipAddress"`, `"timestamp"`
- **snake_case columns**: `user_id`, `project_id`, `user_name`, `entity_type`, `entity_id`, `ip_address`, `created_at`

## Migration Files

### 1. `fix_audit_logs_schema.sql` (Run First)
**Purpose**: Ensures all required snake_case columns exist in the table.

**What it does**:
- Creates backup table
- Adds missing snake_case columns if they don't exist
- Creates indexes on snake_case columns
- Adds foreign key constraints
- Creates audit triggers for expenses and projects

**Run this first** because:
- It's idempotent (safe to run multiple times)
- It ensures the target columns exist before data migration

### 2. `fix_audit_logs_user_id.sql` (Run Second)
**Purpose**: Specifically adds `user_id` column and creates audit triggers.

**What it does**:
- Adds `user_id` column if missing
- Creates foreign key to `auth.users`
- Creates expense audit trigger
- Creates generic audit trigger function

**Note**: This may be partially redundant with `fix_audit_logs_schema.sql`. If you've already run `fix_audit_logs_schema.sql`, this may skip most operations.

### 3. `fix_audit_logs_user_id_dependency.sql` (Run Third - Critical for Dependency Issues)
**Purpose**: Fixes the specific error "cannot drop column userId because other objects depend on it".

**What it does**:
- Checks for and drops the `vw_audit_summary` view that depends on `userId` column
- Safely removes the problematic camelCase `"userId"` column
- Ensures snake_case `user_id` column is properly configured
- Recreates the `vw_audit_summary` view using the correct snake_case schema
- Updates trigger functions to use snake_case column names
- Creates proper indexes for view performance

**Run this third** because:
- It handles the specific dependency issue that prevents column removal
- It must run after the snake_case columns are established
- It recreates any views that were dropped due to dependencies

### 4. `consolidate_audit_logs_schema.sql` (Run Last)
**Purpose**: Migrates data from remaining camelCase to snake_case columns and removes duplicates.

**What it does**:
- Creates another backup (safety measure)
- Migrates data: `"projectId"` → `project_id`, `"userName"` → `user_name`, etc.
- Drops remaining duplicate camelCase columns
- Drops duplicate foreign key constraints
- Recreates indexes with correct names

**Run this last** because:
- It requires snake_case columns to exist first
- It permanently removes the camelCase columns

## Execution Commands

Run these in the Supabase SQL Editor in order:

```sql
-- Step 1: Run fix_audit_logs_schema.sql
-- (Copy and paste the contents of fix_audit_logs_schema.sql)

-- Step 2: Run fix_audit_logs_user_id.sql
-- (Copy and paste the contents of fix_audit_logs_user_id.sql)

-- Step 3: Run fix_audit_logs_user_id_dependency.sql
-- (Copy and paste the contents of fix_audit_logs_user_id_dependency.sql)

-- Step 4: Run consolidate_audit_logs_schema.sql
-- (Copy and paste the contents of consolidate_audit_logs_schema.sql)
```

## Verification

After running all migrations, verify the schema:

```sql
-- Check final column structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
ORDER BY ordinal_position;

-- Expected columns:
-- id, user_id, project_id, user_name, action, entity_type, 
-- entity_id, details, old_values, new_values, ip_address, created_at

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'audit_logs';
```

## Rollback

If something goes wrong, restore from backup:

```sql
-- Drop the current table
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Restore from backup
ALTER TABLE audit_logs_migration_backup RENAME TO audit_logs;

-- You may need to recreate constraints and indexes
```

## Fresh Installation

For a fresh database, use `complete_setup.sql` which has the corrected schema:

```sql
-- Run complete_setup.sql for fresh installations
-- (Copy and paste the contents of complete_setup.sql)
```
