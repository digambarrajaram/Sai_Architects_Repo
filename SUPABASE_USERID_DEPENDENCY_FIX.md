 # Supabase Audit Logs userId Dependency Fix

## Problem Description

When trying to run SQL migrations to fix the `audit_logs` table schema, the following error occurred:

```
ERROR: 2BP01: cannot drop column userId of table audit_logs because other objects depend on it
DETAIL: view vw_audit_summary depends on column userId of table audit_logs
HINT: Use DROP ... CASCADE to drop the dependent objects too.
```

## Root Cause Analysis

The issue was caused by:

1. **Schema Inconsistency**: The `audit_logs` table had duplicate columns with different naming conventions:
   - camelCase: `"userId"`, `"projectId"`, `"userName"`, etc.
   - snake_case: `user_id`, `project_id`, `user_name`, etc.

2. **View Dependency**: A view called `vw_audit_summary` was created that depended on the camelCase `"userId"` column.

3. **Migration Conflict**: When trying to drop the camelCase columns to consolidate the schema, PostgreSQL prevented the operation because the view depended on these columns.

## Solution Strategy

The fix involves a systematic approach to handle the dependency issue:

### 1. **Drop Dependent View First**
   - Check if `vw_audit_summary` view exists
   - Drop the view safely before removing the column it depends on

### 2. **Remove Problematic Column**
   - Drop the camelCase `"userId"` column that's causing the dependency issue
   - Ensure the snake_case `user_id` column is properly configured

### 3. **Recreate View with Correct Schema**
   - Recreate `vw_audit_summary` view using the snake_case `user_id` column
   - Ensure proper joins with `auth.users` and `profiles` tables

### 4. **Update Trigger Functions**
   - Update audit trigger functions to use snake_case column names
   - Ensure consistent data insertion into the audit logs

## Files Created/Modified

### New Migration File
- **`supabase/migrations/fix_audit_logs_user_id_dependency.sql`**
  - Handles the specific dependency issue
  - Drops and recreates the problematic view
  - Updates trigger functions
  - Ensures proper schema consolidation

### Updated Documentation
- **`supabase/migrations/MIGRATION_ORDER.md`**
  - Added the new migration to the execution order
  - Updated execution commands to include the dependency fix

## Migration Execution Order

The migrations must be run in this specific order:

1. **`fix_audit_logs_schema.sql`** - Ensures snake_case columns exist
2. **`fix_audit_logs_user_id.sql`** - Adds user_id column and triggers
3. **`fix_audit_logs_user_id_dependency.sql`** - **NEW** - Handles dependency issue
4. **`consolidate_audit_logs_schema.sql`** - Migrates data and removes duplicates

## Key Features of the Fix

### 1. **Safe View Handling**
```sql
-- Check if view exists before dropping
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
    END IF;
END $$;

-- Drop view safely
DROP VIEW IF EXISTS vw_audit_summary;
```

### 2. **Proper Column Management**
```sql
-- Drop problematic camelCase column
ALTER TABLE audit_logs DROP COLUMN IF EXISTS "userId";

-- Ensure snake_case column exists
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_id UUID;
```

### 3. **Recreated View with Correct Schema**
```sql
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
```

### 4. **Updated Trigger Functions**
```sql
-- Updated trigger function using snake_case columns
INSERT INTO audit_logs (
    project_id,
    user_id,  -- snake_case instead of "userId"
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
```

## Verification Steps

After running the migrations, verify the fix with these queries:

```sql
-- 1. Check audit_logs table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'audit_logs';

-- 2. Verify view exists and works
SELECT * FROM vw_audit_summary LIMIT 5;

-- 3. Test trigger functionality
INSERT INTO expenses (project_id, amount, category, description, expense_date, created_by) 
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1000, 'Test', 'Test expense', NOW(), '11111111-1111-1111-1111-111111111111');

-- 4. Verify audit log was created
SELECT * FROM audit_logs WHERE entity_type = 'expense' ORDER BY created_at DESC LIMIT 1;
```

## Rollback Plan

If issues occur, the migration can be rolled back:

```sql
-- Drop the trigger and function
DROP TRIGGER IF EXISTS trg_audit_expenses ON expenses;
DROP FUNCTION IF EXISTS log_expense_audit();

-- Drop the view
DROP VIEW IF EXISTS vw_audit_summary;

-- Drop the snake_case user_id column
ALTER TABLE audit_logs DROP COLUMN IF EXISTS user_id;

-- Recreate the camelCase userId column (if needed for rollback)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS "userId" UUID;
```

## Benefits of This Fix

1. **Resolves Dependency Error**: Eliminates the "cannot drop column because other objects depend on it" error
2. **Consistent Schema**: Ensures all columns use snake_case naming convention
3. **Maintains Functionality**: Preserves all audit logging functionality
4. **Safe Execution**: Uses proper checks and safeguards throughout
5. **Future-Proof**: Prevents similar issues with other camelCase columns

## Next Steps

1. Run the migrations in the specified order
2. Verify the schema consolidation is complete
3. Test the application to ensure audit logging still works correctly
4. Monitor for any performance issues with the new view

This fix ensures that the `audit_logs` table schema is properly consolidated and that the dependency issue preventing column removal is resolved.