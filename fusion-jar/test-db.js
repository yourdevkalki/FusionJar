const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.log("Please set:");
  console.log("- NEXT_PUBLIC_SUPABASE_URL");
  console.log("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test 1: Check if tables exist
    console.log("1. Checking if tables exist...");

    const { data: intents, error: intentsError } = await supabase
      .from("investment_intents")
      .select("count")
      .limit(1);

    if (intentsError) {
      console.log("❌ investment_intents table not found");
      console.log("   Error:", intentsError.message);
      console.log("\n💡 Please run the database schema first:");
      console.log("   1. Go to Supabase SQL Editor");
      console.log("   2. Copy contents of database/schema.sql");
      console.log("   3. Execute the script");
      return;
    }

    console.log("✅ investment_intents table exists");

    const { data: executions, error: executionsError } = await supabase
      .from("investment_executions")
      .select("count")
      .limit(1);

    if (executionsError) {
      console.log("❌ investment_executions table not found");
      return;
    }

    console.log("✅ investment_executions table exists");

    const { data: gamification, error: gamificationError } = await supabase
      .from("gamification_data")
      .select("count")
      .limit(1);

    if (gamificationError) {
      console.log("❌ gamification_data table not found");
      return;
    }

    console.log("✅ gamification_data table exists");

    // Test 2: Insert test data
    console.log("\n2. Testing data insertion...");

    const testIntent = {
      user_address: "0x1234567890123456789012345678901234567890",
      source_token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      source_chain: 1,
      target_token: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C",
      target_chain: 1,
      amount_usd: 5.0,
      frequency: "weekly",
      fee_tolerance: 0.5,
      status: "active",
    };

    const { data: insertData, error: insertError } = await supabase
      .from("investment_intents")
      .insert(testIntent)
      .select();

    if (insertError) {
      console.log("❌ Failed to insert test data");
      console.log("   Error:", insertError.message);
      return;
    }

    console.log("✅ Test data inserted successfully");
    console.log("   Inserted ID:", insertData[0].id);

    // Test 3: Query data
    console.log("\n3. Testing data query...");

    const { data: queryData, error: queryError } = await supabase
      .from("investment_intents")
      .select("*")
      .eq("user_address", "0x1234567890123456789012345678901234567890")
      .limit(1);

    if (queryError) {
      console.log("❌ Failed to query data");
      console.log("   Error:", queryError.message);
      return;
    }

    console.log("✅ Data query successful");
    console.log("   Found records:", queryData.length);

    // Test 4: Clean up test data
    console.log("\n4. Cleaning up test data...");

    const { error: deleteError } = await supabase
      .from("investment_intents")
      .delete()
      .eq("user_address", "0x1234567890123456789012345678901234567890");

    if (deleteError) {
      console.log("❌ Failed to clean up test data");
      console.log("   Error:", deleteError.message);
      return;
    }

    console.log("✅ Test data cleaned up");

    console.log("\n🎉 Database connection test successful!");
    console.log("   Your Fusion Jar database is ready to use.");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
  }
}

testDatabase();
