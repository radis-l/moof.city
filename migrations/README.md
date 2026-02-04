# Database Migrations

This directory contains SQL migration files for the moof.city production database (Supabase).

## Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `001_add_performance_indexes.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Verify success in the **Table Editor** → **prod_fortunes** → **Indexes** tab

### Option 2: Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (run this once)
supabase link --project-ref your-project-ref

# Run the migration
supabase db execute < migrations/001_add_performance_indexes.sql
```

## Migration Files

### `001_add_performance_indexes.sql`

**Purpose:** Add database indexes to optimize query performance at scale.

**Indexes Created:**
- `idx_prod_fortunes_email` - Index on `email` column
- `idx_prod_fortunes_generated_at` - Descending index on `generated_at` column

**Performance Benefits:**

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Email lookup (`checkEmail`) | Full table scan | Index seek | 10-100x faster |
| Admin dashboard load (sorted) | Full table scan + sort | Index scan | 10-100x faster |
| Pagination queries | Full scan + offset | Index range scan | 5-50x faster |

**Expected Impact by Dataset Size:**

- **< 1,000 rows:** Minimal difference (< 10ms improvement)
- **1,000 - 10,000 rows:** Noticeable improvement (50-200ms → 5-10ms)
- **> 10,000 rows:** Dramatic improvement (1000ms+ → 10-50ms)

**Rollback:**

If you need to remove these indexes:

```sql
DROP INDEX IF EXISTS idx_prod_fortunes_email;
DROP INDEX IF EXISTS idx_prod_fortunes_generated_at;
```

## Verification

After running the migration, verify the indexes were created:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'prod_fortunes';
```

You should see both indexes listed in the output.

## Notes

- ✅ Safe to run multiple times (`IF NOT EXISTS` prevents duplicates)
- ✅ No data modification - only adds indexes
- ✅ No downtime required - PostgreSQL creates indexes online
- ✅ Automatic index maintenance by PostgreSQL
- ⚠️ Initial index creation may take 1-2 minutes on large datasets

## Future Migrations

When creating new migrations:

1. Use sequential numbering: `002_`, `003_`, etc.
2. Include descriptive names
3. Add comments explaining the purpose
4. Include rollback instructions
5. Test on development database first
