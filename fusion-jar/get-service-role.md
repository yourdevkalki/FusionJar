# How to Get Your Supabase Service Role Key

## Step-by-Step Instructions

1. **Go to your Supabase project dashboard**

   - Visit: https://supabase.com/dashboard/project/trlzbqhoxpxwqghunoxg
   - Sign in if needed

2. **Navigate to Settings**

   - Click on the gear icon (⚙️) in the left sidebar
   - Or go to: Project Settings → API

3. **Find the Service Role Key**

   - Look for the "service_role" key (NOT the "anon" key)
   - It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Click the "Copy" button next to it

4. **Update your .env.local file**

   ```bash
   # Replace this line in .env.local:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # With your actual service role key:
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRybHpicWhveHB4d3FnaHVub3hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4NTI3NSwiZXhwIjoyMDY5MzYxMjc1fQ.ACTUAL_KEY_HERE
   ```

## Important Notes

- **Never share your service role key publicly**
- **The service role key has admin privileges**
- **Keep it in your .env.local file only**
- **Don't commit it to version control**

## Test Your Setup

After updating the service role key, run:

```bash
node test-db.js
```

This will test your database connection and verify everything is working.
