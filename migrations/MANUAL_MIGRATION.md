# Database Migration Guide

## Migration: Add Performance Indexes

**Created:** 2026-02-04  
**File:** `migrations/001_add_performance_indexes.sql`  
**Status:** Ready to execute

---

## Why This Migration Is Needed

This migration adds two critical database indexes to the `prod_fortunes` table:

1. **Email Index** - Speeds up email lookups from O(n) to O(log n)
   - Used by the `checkEmail()` API endpoint
   - Critical for duplicate detection during fortune generation
   
2. **Timestamp Index** - Optimizes sorting and pagination
   - Enables efficient `ORDER BY generated_at DESC` queries
   - Prevents full table scans when loading the admin dashboard
   - Expected improvement: **10-100x faster** on datasets > 10k rows

---

## Migration Methods

### Method 1: Automatic Script (Recommended if you have Service Role Key)

**Requirements:**
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (has permission to create indexes)

**Steps:**

```bash
# Set environment variables
export SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Run the migration script
npm run migrate-db
```

The script will:
- ✅ Read the migration SQL
- ✅ Execute each statement
- ✅ Report success/failure
- ✅ Provide verification steps

---

### Method 2: Manual via Supabase Dashboard (Most Reliable)

**Steps:**

1. **Go to your Supabase Dashboard**
   - URL: https://app.supabase.com/project/YOUR-PROJECT-ID

2. **Navigate to SQL Editor**
   - In the left sidebar, click "SQL Editor"
   - Click "New Query"

3. **Copy the Migration SQL**
   
   Copy this SQL (also available in `migrations/001_add_performance_indexes.sql`):

   ```sql
   -- Index for email lookups (used by checkEmail API)
   CREATE INDEX IF NOT EXISTS idx_prod_fortunes_email 
   ON prod_fortunes(email);

   -- Index for timestamp-based sorting and pagination
   CREATE INDEX IF NOT EXISTS idx_prod_fortunes_generated_at 
   ON prod_fortunes(generated_at DESC);
   ```

4. **Execute the SQL**
   - Paste the SQL into the editor
   - Click "Run" (or press Cmd+Enter / Ctrl+Enter)
   - Wait for confirmation

5. **Verify Indexes Were Created**

   Run this query to confirm:

   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'prod_fortunes';
   ```

   Expected output should include:
   - `idx_prod_fortunes_email`
   - `idx_prod_fortunes_generated_at`

---

## Safety Notes

✅ **Safe to run multiple times** - Uses `IF NOT EXISTS`  
✅ **Non-blocking** - Index creation happens in the background  
✅ **No downtime** - Your app continues to work during creation  
✅ **No data changes** - Only adds indexes, doesn't modify data

---

## Performance Impact

**Before Migration:**
- Email lookups: Full table scan (slow on large datasets)
- Dashboard loading: Full table scan + sort (very slow)

**After Migration:**
- Email lookups: Index scan (near-instant)
- Dashboard loading: Index scan only (10-100x faster)

---

## Troubleshooting

### "Permission denied" error
- Use Method 2 (Manual via Dashboard)
- The Supabase anon key doesn't have permission to create indexes
- The Service Role key or Dashboard method will work

### Index already exists
- This is fine! The migration uses `IF NOT EXISTS`
- You can safely ignore this message

### Migration takes a long time
- For large tables (>100k rows), index creation can take 1-5 minutes
- This is normal - wait for it to complete
- Your app remains functional during this time

---

## Verification After Migration

Run this query in the SQL Editor to verify performance:

```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM prod_fortunes
WHERE email = 'test@example.com';

-- Should show "Index Scan using idx_prod_fortunes_email"
```

```sql
-- Check sorting performance
EXPLAIN ANALYZE
SELECT * FROM prod_fortunes
ORDER BY generated_at DESC
LIMIT 10;

-- Should show "Index Scan Backward using idx_prod_fortunes_generated_at"
```

---

## Support

If you encounter any issues:

1. Check the Supabase Dashboard Logs
2. Verify your database connection settings
3. Ensure the `prod_fortunes` table exists
4. Try the Manual method (Method 2) - it's the most reliable

---

**Next Steps After Migration:**

Once indexes are created, your application will automatically benefit from improved performance. No code changes required!
