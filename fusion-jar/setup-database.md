# Database Setup Guide

## Step 1: Get Your Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/trlzbqhoxpxwqghunoxg
2. Navigate to Settings → API
3. Copy the "service_role" key (not the anon key)
4. Update your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## Step 2: Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `database/schema.sql`
5. Click "Run" to execute the script

## Step 3: Verify Tables

After running the schema, you should see these tables in the "Table Editor":

- `investment_intents`
- `investment_executions`
- `gamification_data`
- `resolver_data`

## Step 4: Test Database Connection

Once you've updated the service role key and run the schema, restart your development server:

```bash
npm run dev
```

The application should now work without database errors!
