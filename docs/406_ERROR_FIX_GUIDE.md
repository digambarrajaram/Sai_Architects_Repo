 # 406 Error Fix Guide

## Problem Description

The console error "Failed to load resource: the server responded with a status of 406 ()" indicates that the server received a request but cannot fulfill it because the requested resource's content characteristics (like media type, character set, encoding, or language) do not match the Accept headers sent by the client (your browser or JavaScript code).

Additionally, the Supabase client was not properly loading environment variables from the `.env` file in React Native/Expo applications, causing configuration issues.

## Root Cause Analysis

After analyzing the codebase, the 406 errors were caused by:

1. **Missing Accept header**: The client wasn't explicitly setting the `Accept: application/json` header
2. **Missing Content-Type header**: Requests weren't specifying the content type being sent
3. **Schema ambiguity**: The database schema wasn't explicitly set, causing potential conflicts

## Solution Implemented

### 1. Fixed Supabase Client Configuration

**File**: `src/services/supabaseClient.ts`

**Changes Made**:
- Added explicit `Accept: application/json` header to prevent 406 errors
- Added `Content-Type: application/json` header for proper request formatting
- Added explicit `db.schema: 'public'` configuration to avoid schema ambiguity
- Enhanced error logging with specific guidance for 406 errors
- Added `handle406Error` utility function for retry logic
- Fixed environment variable loading for React Native/Expo applications

### 2. Created Environment Variable Loader

**File**: `src/utils/envLoader.ts`

**New Features**:
- Multi-method environment variable loading for React Native/Expo
- Support for `process.env`, `global`, and `global.__env` access patterns
- Validation and logging for debugging
- Fallback mechanisms for different bundling environments

**Usage**:
```typescript
import { getSupabaseUrl, getSupabaseAnonKey, isEnvironmentConfigured } from '../utils/envLoader';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const configured = isEnvironmentConfigured();
```

```typescript
// Fixed configuration
supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Accept': 'application/json',        // ✅ Added
      'Content-Type': 'application/json',  // ✅ Added
    },
  },
  db: {
    schema: 'public',  // ✅ Added
  },
});
```

### 3. Enhanced Error Handling

**New Error Handling Features**:
- Detailed 406 error logging with troubleshooting steps
- Specific guidance for common Supabase errors
- Utility function for handling 406 errors with retry logic
- Better error context and debugging information

## How to Verify the Fix

### Method 1: Run the Supabase Test

```bash
npm run test:supabase
```

**Expected Output**":"
```
🧪 Testing Supabase Integration...
✅ Supabase configuration detected
✅ Supabase connection successful!
🎉 Frontend is properly mapped to backend
```

### Method 2: Check Network Tab in DevTools

1. Open Chrome DevTools (F12)
2. Go to the "Network" tab
3. Reload the application
4. Look for Supabase API requests
5. Verify that requests include:
   - `Accept: application/json`
   - `Content-Type: application/json`

### Method 3: Use the Supabase Test Component

The `SupabaseTest` component in `src/components/SupabaseTest.tsx` provides real-time connection status:

```tsx
<SupabaseTest visible={true} />
```

This will display:
- ✅ Configuration status
- ✅ Connection status  
- ✅ Database query status
- 🎉 Success message when everything is working

### Method 4: Manual Testing

1. **Login Flow**: Try logging in with valid credentials
2. **Project Operations**: Create, view, and update projects
3. **Expense Operations**: Add and view expenses
4. **Reports**: Generate export reports

All operations should complete without 406 errors.

## Common 406 Error Scenarios and Solutions

### Scenario 1: Accept Header Mismatch
**Error**: `406 Not Acceptable`
**Cause**: Client requests `text/html` but server only provides `application/json`
**Solution**: Ensure `Accept: application/json` header is set

### Scenario 2: Content-Type Missing
**Error**: `406 Not Acceptable` or `400 Bad Request`
**Cause**: POST/PUT requests without proper Content-Type
**Solution**: Set `Content-Type: application/json` for JSON requests

### Scenario 3: Schema Conflicts
**Error**: `406 Not Acceptable` or `Invalid schema`
**Cause**: Multiple schemas or incorrect schema selection
**Solution**: Explicitly set `db.schema: 'public'`

## Debugging 406 Errors

### Step 1: Check Request Headers
```javascript
// In browser console, check what headers are being sent
fetch('/api/endpoint', {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})
```

### Step 2: Verify Server Response
Check the server's response headers to see what content types it supports:
- Look for `Content-Type` in response headers
- Check if server supports the requested format

### Step 3: Use Network Tab
1. Open Network tab in DevTools
2. Filter by XHR/Fetch requests
3. Click on failed requests
4. Check Request Headers and Response Headers

### Step 4: Enable Detailed Logging
The enhanced error logging will provide specific guidance:
```typescript
// Enhanced logging shows:
// [Supabase] 406 Not Acceptable - This usually means:
//   1. The Accept header does not match what the server can provide
//   2. The requested resource format is not available
//   3. There may be a mismatch between client expectations and server capabilities
```

## Prevention Best Practices

1. **Always Set Accept Headers**: Explicitly set `Accept: application/json` for API requests
2. **Set Content-Type**: Always specify `Content-Type: application/json` for JSON requests
3. **Use Explicit Schema**: Set `db.schema: 'public'` to avoid ambiguity
4. **Monitor Network Requests**: Regularly check the Network tab for failed requests
5. **Enable Error Logging**: Keep detailed error logging enabled during development

## Testing the Fix

### Automated Tests
```bash
# Run all Supabase-related tests
npm run test:supabase
npm run test:integration
npm run test:e2e
```

### Manual Verification
1. **Connection Test**: Verify Supabase connection works
2. **Database Queries**: Test basic CRUD operations
3. **Error Scenarios**: Test error handling and recovery
4. **Performance**: Ensure no performance degradation

## Support

If you continue to experience 406 errors after implementing this fix:

1. **Check Network Tab**: Verify headers are being sent correctly
2. **Review Server Logs**: Check Supabase dashboard for server-side issues
3. **Enable Debug Mode**: Set `VERBOSE_LOGGING=true` in environment
4. **Contact Support**: Provide network logs and error details

## Related Files

- `src/services/supabaseClient.ts` - Main Supabase configuration
- `src/components/SupabaseTest.tsx` - Connection testing component
- `src/utils/supabaseTest.ts` - Test utilities
- `docs/SUPABASE_DEBUGGING_GUIDE.md` - Additional debugging information