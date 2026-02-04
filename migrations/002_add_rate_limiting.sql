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
