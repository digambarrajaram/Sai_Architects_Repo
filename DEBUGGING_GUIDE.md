# Expense Visibility Debugging Guide

## Issue: Expenses Not Visible in Project Detail Screens

### Step 1: Check Console Logs

The updated screens now include debug logging. Open your React Native development console and look for these logs:

**For Project Detail Owner Screen:**
```
[ProjectDetailOwnerScreen] Fetching expenses with dateRange: { startDate: Date, endDate: Date }
[ProjectDetailOwnerScreen] Project ID: [project-id]
[ProjectDetailOwnerScreen] Date filter: all_time
[ProjectDetailOwnerScreen] Fetched expenses: [number]
[ProjectDetailOwnerScreen] Stats: { total: [number], count: [number], average: [number] }
```

**For Project Detail Supervisor Screen:**
```
[ProjectDetailSupervisorScreen] Fetching expenses with dateRange: { start: Date, end: Date }
[ProjectDetailSupervisorScreen] Project ID: [project-id]
[ProjectDetailSupervisorScreen] Date filter: daily
[ProjectDetailSupervisorScreen] Fetched expenses: [number]
[ProjectDetailSupervisorScreen] All expenses loaded: [number]
[ProjectDetailSupervisorScreen] First expense: [expense-object]
[ProjectDetailSupervisorScreen] Filtered expenses: [number]
```

### Step 2: Check Project ID

Make sure you're navigating to the project detail screen with a valid project ID that has expenses.

**Valid Project IDs with Mock Expenses:**
- `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` (Downtown Office Complex)
- `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` (Residential Tower Phase 1)
- `cccccccc-cccc-cccc-cccc-cccccccccccc` (Shopping Mall Renovation)

### Step 3: Check Date Filtering

The issue might be with date filtering. The mock expenses have these dates:
- `2026-01-05` (Materials)
- `2026-01-10` (Labor)
- `2026-01-12` (Machinery)
- `2026-01-15` (Transport)
- `2026-01-20` (Survey Equipment)

**Date Filter Behavior:**
- **All Time**: Shows all expenses (no date filtering)
- **Daily**: Shows only today's expenses (likely empty unless today is 2026-01-05, 01-10, 01-12, 01-15, or 01-20)
- **Weekly**: Shows last 7 days (likely empty unless within 7 days of expense dates)
- **Monthly**: Shows current month (likely empty unless current month is January 2026)

### Step 4: Force All Time Filter

If you're seeing empty expense lists, try switching to "All Time" filter:

1. Open the project detail screen
2. Look for the filter toggle buttons (All, Daily, Weekly, Monthly, Custom)
3. Tap "All" to show all expenses regardless of date

### Step 5: Check Supabase Configuration

If you have Supabase configured, the mock data won't be used. Check:

1. **Environment Variables**: Make sure `.env` file has proper Supabase URL and anon key
2. **Database Tables**: Ensure `expenses` table exists with proper schema
3. **RLS Policies**: Check that Row Level Security policies allow access
4. **Authentication**: Ensure user is properly authenticated

### Step 6: Test with Mock Data

To force mock data usage, temporarily modify the expense service:

```typescript
// In src/services/expenseService.ts, change:
const shouldUseMockData = (): boolean => {
  return !isSupabaseConfigured();
};

// To:
const shouldUseMockData = (): boolean => {
  return true; // Force mock data
};
```

### Step 7: Check Database Data

If using Supabase, verify your database has expense data:

```sql
-- Check if expenses table exists and has data
SELECT * FROM expenses WHERE project_id = 'your-project-id';

-- Check expense_date format
SELECT expense_date, expense_date::date FROM expenses;
```

### Step 8: Common Issues and Solutions

**Issue**: Empty expense list with "All Time" filter
**Solution**: Check project ID matches expenses in database/mock data

**Issue**: Empty expense list with date filters
**Solution**: Switch to "All Time" filter or ensure expense dates fall within selected range

**Issue**: No debug logs appearing
**Solution**: Ensure `__DEV__` is true (development mode)

**Issue**: Authentication errors
**Solution**: Check Supabase auth session and RLS policies

### Step 9: Quick Test

Create a simple test to verify the expense service works:

```typescript
// Add this to any component temporarily
useEffect(() => {
  const testExpenses = async () => {
    try {
      const expenses = await expenseService.getExpensesByProject(
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        {} // All time
      );
      console.log('Test expenses:', expenses);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };
  testExpenses();
}, []);
```

### Step 10: Expected Results

With mock data and project ID `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`:

**All Time Filter:**
- Should show 2 expenses (Materials: ₹120,000, Labor: ₹85,000)
- Total: ₹205,000
- Count: 2

**Other Filters:**
- Will likely show 0 expenses unless current date matches expense dates

### Next Steps

1. Check the console logs for the debug output
2. Verify project ID and date filter settings
3. Try the "All Time" filter first
4. If still not working, check Supabase configuration or force mock data
5. Share console logs if issue persists for further debugging

The debug logs will show exactly what's happening with the data fetching and filtering process.