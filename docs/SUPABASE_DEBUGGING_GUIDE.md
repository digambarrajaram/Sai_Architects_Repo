# Supabase HTTP Error Debugging Guide

## Complete Analysis & Fixes for 400 Bad Request and 406 Not Acceptable Errors

---

## 1. ROOT CAUSE OF 400 BAD REQUEST

### Identified Issues in Your Code:

#### A. Column Name Mismatch
Your [`projectService.ts`](src/services/projectService.ts:146) queries:
```typescript
.select(`
  id,
  name,
  status,
  due_date,
  budget,
  created_by,
  created_at,
  updated_at,
  expenses(amount)
`)
```

**Problem:** Your backend schema in [`Backend_Migration_Plan_&_Structure.md`](Backend_Migration_Plan_&_Structure.md:95) shows:
- `due_date` column exists ✓
- `updated_at` column does NOT exist in the schema ✗

**Fix:** Either add `updated_at` to your database schema OR remove it from the query.

#### B. Nested Select with Missing Foreign Key
The query `expenses(amount)` assumes:
1. An `expenses` table exists
2. A foreign key relationship is defined
3. RLS policies allow reading expenses

**If any of these are missing, you get 400.**

#### C. Status Filter Value Mismatch
Your code converts filter values:
```typescript
query = query.eq('status', filters.status.toLowerCase().replace(' ', '_'));
```

This converts "In Progress" → "in_progress", but your database stores "active".

---

## 2. ROOT CAUSE OF 406 NOT ACCEPTABLE

### Identified Issues:

#### A. Accept Header Configuration
Your [`supabaseClient.ts`](src/services/supabaseClient.ts:43) correctly sets:
```typescript
global: {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}
```

**However**, PostgREST (Supabase's REST API) can return 406 when:
1. The `Accept` header is too restrictive
2. The response format doesn't match what was requested
3. A `.single()` modifier is used but multiple rows are returned

#### B. `.single()` Modifier Issue
In [`projectService.ts`](src/services/projectService.ts:249):
```typescript
.eq('id', projectId)
.single();
```

If no project matches OR multiple projects match, this can cause issues.

---

## 3. CORRECT SUPABASE QUERY PATTERNS

### Basic Query (Safe Pattern)
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*');
```

### With Join (Safe Pattern)
```typescript
const { data, error } = await supabase
  .from('projects')
  .select(`
    id,
    name,
    status,
    due_date,
    budget,
    created_by,
    created_at,
    expenses (
      id,
      amount,
      category
    )
  `);
```

### With Filter (Safe Pattern)
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

### With MaybeSingle (Safer than .single())
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .maybeSingle();  // Returns null instead of error if not found
```

---

## 4. CORRECT HEADERS FORMAT

### Required Headers for Supabase REST API
```
apikey: YOUR_ANON_KEY
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
Accept: application/json
Prefer: return=representation  (for inserts/updates)
```

### Using fetch() directly:
```typescript
const response = await fetch('https://your-project.supabase.co/rest/v1/projects', {
  method: 'GET',
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

---

## 5. RLS POLICY EXAMPLES

### Enable RLS
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Projects Policies
```sql
-- Allow users to view all projects (adjust based on your needs)
CREATE POLICY "Users can view projects"
ON projects
FOR SELECT
TO authenticated
USING (true);

-- Allow owners to create projects
CREATE POLICY "Owners can create projects"
ON projects
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- Allow project creators to update their projects
CREATE POLICY "Users can update their projects"
ON projects
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());
```

### Expenses Policies
```sql
-- Allow users to view expenses for accessible projects
CREATE POLICY "Users can view expenses"
ON expenses
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT id FROM projects
  )
);

-- Allow authenticated users to create expenses
CREATE POLICY "Users can create expenses"
ON expenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
```

### Profiles Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());
```

---

## 6. PRODUCTION-SAFE SERVICE LAYER

See the updated [`projectService.ts`](src/services/projectService.ts) with:
- Proper error handling
- Safe logging
- Null response handling
- RLS-aware queries

---

## 7. FINAL VERIFICATION CHECKLIST

### Before Testing:
- [ ] Verify Supabase project is running (check Supabase dashboard)
- [ ] Verify tables exist: `projects`, `expenses`, `profiles`
- [ ] Verify RLS is enabled on all tables
- [ ] Verify at least one RLS policy exists per table
- [ ] Verify environment variables are set correctly

### Network Request Verification:
- [ ] Request URL format: `https://YOUR_PROJECT.supabase.co/rest/v1/projects`
- [ ] Request Method: GET
- [ ] Headers include: `apikey`, `Authorization`, `Accept`
- [ ] No typos in table or column names

### Response Verification:
- [ ] Check Response tab in DevTools for error details
- [ ] Check Console for JavaScript errors
- [ ] Verify user is authenticated before querying

---

## DEBUGGING COMMANDS

### Test Supabase Connection
```typescript
// In browser console
const { data, error } = await supabase.from('projects').select('*').limit(1);
console.log('Data:', data);
console.log('Error:', error);
```

### Check Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Check RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('projects', 'expenses', 'profiles');
```

---

## COMMON ERROR CODES

| Code | Meaning | Fix |
|------|---------|-----|
| PGRST116 | No rows found with `.single()` | Use `.maybeSingle()` or handle null |
| 42501 | Insufficient privilege | Check RLS policies |
| PGRST200 | Multiple rows with `.single()` | Use `.maybeSingle()` or add unique filter |
| 406 | Not Acceptable | Check Accept header, use `application/json` |
| 400 | Bad Request | Check column names, table exists, query syntax |
