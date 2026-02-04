# Migration Instructions for Rate Limiting

## 🎯 Purpose
Enable distributed rate limiting across Vercel serverless instances using Supabase.

## ⚠️ Required: Create rate_limits Table

The application code has been updated to use Supabase for rate limiting, but the database table needs to be created manually.

### Steps to Complete Migration:

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/wbyjptteluydlesmqeva/sql/new
   - Or navigate to: Dashboard → Your Project (moof-city) → SQL Editor → New Query

2. **Copy and paste this SQL:**

```sql
-- Rate Limiting Table for moof.city
-- Purpose: Distributed rate limiting across Vercel serverless instances

CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time 
  ON rate_limits(reset_time);

-- Index for identifier lookups (primary key already provides this, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier 
  ON rate_limits(identifier);

-- Comments for documentation
COMMENT ON TABLE rate_limits IS 'Stores rate limiting data for fortune generation and admin operations';
COMMENT ON COLUMN rate_limits.identifier IS 'Unique identifier: format is "{type}:{ip}" or "{type}:{ip}:{user}"';
COMMENT ON COLUMN rate_limits.count IS 'Number of requests made within the current window';
COMMENT ON COLUMN rate_limits.reset_time IS 'Timestamp when the rate limit window resets';
```

3. **Click "Run" or press Ctrl+Enter**

4. **Verify table was created:**
   - Go to: Dashboard → Table Editor
   - You should see a new `rate_limits` table in the public schema

5. **Optional: Enable Row Level Security (RLS)**
   
   Since this table is accessed via the service_role key, RLS is optional. However, for extra security:

```sql
-- Enable RLS on rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies needed since we use service_role key
-- Service role bypasses RLS by default
```

## ✅ Verification

After creating the table, the application will automatically use Supabase rate limiting in production.

You can verify by checking the logs:
```
[Rate Limit] Using Supabase rate limiter
```

## 🔄 Fallback Behavior

**Until table is created:**
- App uses in-memory rate limiting (works but not distributed)
- No impact on functionality
- Rate limits reset on each serverless cold start

**After table is created:**
- App automatically switches to Supabase rate limiting
- Rate limits persist across serverless instances
- Protection works across all Vercel Edge functions

## 📊 Table Structure

| Column | Type | Description |
|--------|------|-------------|
| identifier | TEXT (PK) | Unique ID: format is "{type}:{ip}" or "{type}:{ip}:{user}" |
| count | INTEGER | Number of requests in current window |
| reset_time | TIMESTAMP | When the rate limit resets |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## 🗑️ Cleanup

The table will grow over time. Cleanup happens automatically via:
- Opportunistic cleanup on each request (10% chance)
- Old entries (past reset_time) are deleted

To manually cleanup:
```sql
DELETE FROM rate_limits WHERE reset_time < NOW();
```

## 🚨 Troubleshooting

**If rate limiting isn't working:**
1. Check that table exists: `SELECT * FROM rate_limits LIMIT 1;`
2. Check environment variables are set (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Check application logs for "[Rate Limit] Using..." message
4. Verify Supabase credentials have INSERT/UPDATE/DELETE permissions

**If you see errors:**
- "Table 'rate_limits' not found" → Run the migration SQL above
- "Permission denied" → Check your API key has proper permissions
- App will gracefully fallback to in-memory until issue is resolved
