# Database Index Optimization for Expense Queries

This document provides SQL commands to create indexes that optimize expense fetching and filtering performance in Supabase/PostgreSQL.

## Required Indexes

Run these SQL commands in your Supabase SQL Editor to create the necessary indexes:

### 1. Index on `project_id` column

This index optimizes queries that filter expenses by project.

```sql
-- Create index on project_id for faster project-based filtering
CREATE INDEX IF NOT EXISTS idx_expenses_project_id 
ON expenses(project_id);
```

### 2. Index on `expense_date` column

This index optimizes queries that filter by date range.

```sql
-- Create index on expense_date for faster date-based filtering
CREATE INDEX IF NOT EXISTS idx_expenses_date 
ON expenses(expense_date);
```

### 3. Composite index on `project_id` and `expense_date`

This composite index is the most important for the expense filtering queries used in the app. It optimizes queries that filter by both project and date range simultaneously.

```sql
-- Create composite index for project_id + expense_date queries
-- This is the most critical index for expense filtering performance
CREATE INDEX IF NOT EXISTS idx_expenses_project_date 
ON expenses(project_id, expense_date DESC);
```

### 4. Composite index for common query patterns

This index covers the most common query pattern: filtering by project, ordering by date, and selecting specific columns.

```sql
-- Create covering index for common expense queries
-- Includes frequently accessed columns to avoid table lookups
-- Note: Adjust the INCLUDE columns based on your actual table schema
CREATE INDEX IF NOT EXISTS idx_expenses_project_date_covering 
ON expenses(project_id, expense_date DESC) 
INCLUDE (amount, category, created_by, created_at);
```

**Important**: If your expenses table has additional columns like `notes`, `vendor`, or `remarks`, update the INCLUDE clause accordingly. Check your table schema first:

```sql
-- Check your expenses table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expenses';
```

## Verification

After creating the indexes, verify they exist:

```sql
-- Check all indexes on the expenses table
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'expenses';
```

## Expected Query Performance Improvements

With these indexes in place, the following queries will be significantly faster:

1. **Get expenses by project**: Uses `idx_expenses_project_id` or `idx_expenses_project_date`
2. **Get expenses by date range**: Uses `idx_expenses_date`
3. **Get expenses by project AND date range**: Uses `idx_expenses_project_date` (most common)
4. **Get expense stats (total, count)**: Uses the covering index for faster aggregation

## Query Examples

### Example 1: Get expenses by project with date filter

```sql
-- This query will use idx_expenses_project_date_covering
SELECT id, project_id, amount, category, description, expense_date, created_by, created_at
FROM expenses
WHERE project_id = 'some-project-uuid'
  AND expense_date >= '2026-01-01'
  AND expense_date <= '2026-01-31'
ORDER BY expense_date DESC;
```

### Example 2: Get expense count by project with date filter

```sql
-- This query will use idx_expenses_project_date
SELECT COUNT(*)
FROM expenses
WHERE project_id = 'some-project-uuid'
  AND expense_date >= '2026-01-01'
  AND expense_date <= '2026-01-31';
```

### Example 3: Get total expenses by project with date filter

```sql
-- This query will use idx_expenses_project_date_covering
SELECT SUM(amount)
FROM expenses
WHERE project_id = 'some-project-uuid'
  AND expense_date >= '2026-01-01'
  AND expense_date <= '2026-01-31';
```

## Maintenance

### Analyze table statistics

After creating indexes, run ANALYZE to update statistics:

```sql
ANALYZE expenses;
```

### Monitor index usage

Check if indexes are being used:

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'expenses'
ORDER BY idx_scan DESC;
```

## Notes

1. **Index Size**: These indexes will increase storage usage. Monitor index size:

```sql
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes 
WHERE tablename = 'expenses';
```

2. **Write Performance**: Indexes slightly slow down INSERT/UPDATE operations. For expense tracking, this trade-off is acceptable since reads are more frequent than writes.

3. **RLS Policies**: Ensure your Row Level Security policies work efficiently with these indexes. The policies should filter by `project_id` which is already indexed.

## Complete Migration Script

Run this complete script in Supabase SQL Editor:

```sql
-- Expense Query Optimization Indexes
-- Run this in Supabase SQL Editor

-- 1. Index on project_id
CREATE INDEX IF NOT EXISTS idx_expenses_project_id 
ON expenses(project_id);

-- 2. Index on expense_date
CREATE INDEX IF NOT EXISTS idx_expenses_date 
ON expenses(expense_date);

-- 3. Composite index for project + date filtering (CRITICAL)
CREATE INDEX IF NOT EXISTS idx_expenses_project_date 
ON expenses(project_id, expense_date DESC);

-- 4. Covering index for common queries
-- Note: Adjust INCLUDE columns based on your actual table schema
CREATE INDEX IF NOT EXISTS idx_expenses_project_date_covering 
ON expenses(project_id, expense_date DESC) 
INCLUDE (amount, category, created_by, created_at);

-- Update statistics
ANALYZE expenses;

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'expenses';
```

## Expected Results

After implementing these indexes:

- **Expense list loading**: 10-100x faster for large datasets
- **Date filtering**: Near-instant response for any date range
- **Stats calculation**: Fast aggregation without full table scans
- **Overall app performance**: Smoother user experience on Project Detail screen
