-- Migration: Add Performance Indexes
-- Created: 2026-02-04
-- Purpose: Optimize database queries for admin dashboard and email lookups at scale
--
-- Performance Impact:
-- 1. idx_prod_fortunes_email: Improves email lookup from O(n) to O(log n)
--    - Speeds up duplicate email checks during fortune generation
--    - Critical for the checkEmail() API endpoint
--
-- 2. idx_prod_fortunes_generated_at: Optimizes sorting and pagination
--    - Enables efficient ORDER BY generated_at DESC queries
--    - Prevents full table scans when loading admin dashboard
--    - Expected improvement: 10-100x faster on datasets > 10k rows

-- Index for email lookups (used by checkEmail API)
-- This index will dramatically speed up duplicate email detection
CREATE INDEX IF NOT EXISTS idx_prod_fortunes_email 
ON prod_fortunes(email);

-- Index for timestamp-based sorting and pagination
-- DESC order matches the common query pattern in getAllFortunes()
-- This allows PostgreSQL to use the index directly without additional sorting
CREATE INDEX IF NOT EXISTS idx_prod_fortunes_generated_at 
ON prod_fortunes(generated_at DESC);

-- Verify indexes were created
-- Run this query to confirm:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'prod_fortunes';
