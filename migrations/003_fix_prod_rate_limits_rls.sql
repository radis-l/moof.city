-- Migration: Fix prod_rate_limits RLS policy
-- Created: 2026-02-05
-- Issue: prod_rate_limits had RLS enabled but no policy, blocking all operations
-- This caused the admin dashboard to fail loading data with error:
--   "new row violates row-level security policy for table prod_rate_limits"
--
-- Root cause: When creating dev/prod table separation, dev_rate_limits got an
-- RLS policy but prod_rate_limits did not. The admin API rate limiting check
-- fails when it can't write to prod_rate_limits, causing the entire request to fail.

CREATE POLICY "Enable all for anon"
ON prod_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);
