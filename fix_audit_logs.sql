-- Fix for audit_logs table: Add missing entityType column
-- Run this in your Supabase SQL Editor

-- The trigger on expenses table is trying to use "entityType" (camelCase)
-- but the column is named "entity_type" (snake_case) in the schema

-- Option 1: Add the entityType column that the trigger expects
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS "entityType" text DEFAULT 'unknown';

-- Option 2: If you want to use the existing entity_type column, 
-- you'd need to fix the trigger in your database
-- Check for triggers on the expenses table:
-- SELECT trigger_name, event_object_table FROM information_schema.triggers 
-- WHERE trigger_name LIKE '%audit%';
