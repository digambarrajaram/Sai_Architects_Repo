/**
 * Test script to verify Supabase fixes
 * Run this to test if the schema configuration is working correctly
 */

const { supabase, testSupabaseConnection, testDatabaseQuery } = require('./src/services/supabaseClient.js');

async function testSupabaseFixes() {
  console.log('🧪 Testing Supabase fixes...\n');

  // Test 1: Check if Supabase is configured
  console.log('1. Checking Supabase configuration...');
  const isConfigured = require('./src/services/supabaseClient.js').isSupabaseConfigured();
  console.log(`   Configured: ${isConfigured}\n`);

  if (!isConfigured) {
    console.log('⚠️  Supabase not configured - using mock data mode');
    console.log('   Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env to enable Supabase\n');
    return;
  }

  // Test 2: Test connection
  console.log('2. Testing Supabase connection...');
  const connectionSuccess = await testSupabaseConnection();
  console.log(`   Connection: ${connectionSuccess ? '✅ Success' : '❌ Failed'}\n`);

  // Test 3: Test database queries
  console.log('3. Testing database queries...');
  const queryResult = await testDatabaseQuery();
  console.log(`   Query: ${queryResult.success ? '✅ Success' : '❌ Failed'}`);
  if (queryResult.success) {
    console.log(`   Table used: ${queryResult.table || 'N/A'}`);
  } else {
    console.log(`   Error: ${queryResult.error}`);
  }

  // Test 4: Test specific table queries
  console.log('\n4. Testing specific table queries...');
  
  try {
    // Test profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(1);

    if (profilesError) {
      console.log(`   Profiles table: ❌ ${profilesError.message}`);
    } else {
      console.log(`   Profiles table: ✅ Success (${profiles?.length || 0} records)`);
    }

    // Test projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, status')
      .limit(1);

    if (projectsError) {
      console.log(`   Projects table: ❌ ${projectsError.message}`);
    } else {
      console.log(`   Projects table: ✅ Success (${projects?.length || 0} records)`);
    }

    // Test expenses table
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('id, project_id, amount')
      .limit(1);

    if (expensesError) {
      console.log(`   Expenses table: ❌ ${expensesError.message}`);
    } else {
      console.log(`   Expenses table: ✅ Success (${expenses?.length || 0} records)`);
    }

  } catch (error) {
    console.log(`   Table tests: ❌ ${error.message}`);
  }

  console.log('\n🎉 Supabase fix testing complete!');
  console.log('\n📝 Summary:');
  console.log('   - Schema configuration: Changed from "api" to "public"');
  console.log('   - This should resolve 404 errors for tables in public schema');
  console.log('   - If tables are in "api" schema, they need to be moved or created there');
}

// Run the test
testSupabaseFixes().catch(console.error);