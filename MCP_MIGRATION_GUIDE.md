# 🔄 Supabase MCP Migration Guide

## ✅ Configuration Updated!

The `opencode.json` has been updated to use the full Supabase MCP with OAuth authentication.

---

## 🎯 What Was Changed

### Before (PostgREST MCP):
```json
{
  "supabase": {
    "type": "local",
    "command": ["npx", "-y", "@supabase/mcp-server-postgrest", ...],
    "timeout": 10000
  }
}
```

### After (Full Supabase MCP):
```json
{
  "supabase": {
    "type": "remote",
    "url": "https://mcp.supabase.com/mcp?project_ref=wbyjptteluydlesmqeva&read_only=false&features=database,docs,debugging",
    "oauth": {},
    "timeout": 15000
  }
}
```

**Key improvements:**
- ✅ OAuth authentication (no token env var issues)
- ✅ DDL support via `apply_migration` tool
- ✅ Debugging tools (logs, advisors)
- ✅ Latest version (v0.6.3, updated 18 hours ago)
- ✅ Project-scoped (moof.city only)
- ✅ 20+ tools vs 2 tools

---

## 📋 NEXT STEPS (You Need to Complete)

### Step 1: Restart OpenCode Session

**Current session needs restart to load new MCP config.**

```bash
# In your current OpenCode session:
exit

# Or press: Ctrl+C or Ctrl+D
```

---

### Step 2: Start Fresh OpenCode Session

```bash
cd ~/Projects/moof.city
opencode
```

**What will happen:**
- OpenCode loads new remote MCP config
- Attempts to connect to https://mcp.supabase.com/mcp
- Detects you're not authenticated yet
- May prompt for authentication

---

### Step 3: Authenticate with Supabase (OAuth Flow)

**Option A: If prompted automatically**
- OpenCode will detect 401 and show: "Run: opencode mcp auth supabase"
- Follow the prompt

**Option B: Manual authentication**
```bash
# In terminal (outside OpenCode):
opencode mcp auth supabase
```

**OAuth Flow:**
1. ✅ Browser window opens automatically
2. ✅ Redirects to Supabase authentication page
3. ✅ Login with: **radis@moof.city**
4. ✅ Select organization that contains moof.city project
5. ✅ Click "Authorize OpenCode"
6. ✅ Browser shows: "Authentication successful!"
7. ✅ Terminal shows: "✅ Successfully authenticated with supabase"

**Tokens stored in:** `~/.local/share/opencode/mcp-auth.json`

---

### Step 4: Verify MCP Connection

**In OpenCode chat, try:**

```
list all supabase mcp tools available to me
```

**Expected response:**
```
Available Supabase MCP tools:

Database:
- list_tables
- list_extensions  
- list_migrations
- apply_migration ⭐
- execute_sql

Development:
- get_project_url
- get_publishable_keys
- generate_typescript_types

Debugging:
- get_logs
- get_advisors
```

**Test a simple query:**
```
use supabase to list all tables in my database
```

**Expected:**
```
Tables found:
- prod_admin_config
- prod_fortunes
```

---

### Step 5: Apply rate_limits Migration via MCP

**This is the main goal - creating the table via chat!**

**Command in OpenCode:**
```
use supabase apply_migration tool to execute the SQL from migrations/002_add_rate_limiting.sql file. Name the migration "002_add_rate_limiting"
```

**Or if you prefer to paste directly:**
```
use supabase apply_migration to create this migration named "002_add_rate_limiting":

CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON rate_limits(reset_time);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
```

**Expected result:**
```
✅ Migration applied successfully!
✅ Created table: rate_limits
✅ Created index: idx_rate_limits_reset_time
✅ Created index: idx_rate_limits_identifier
✅ Migration "002_add_rate_limiting" tracked in database
```

---

### Step 6: Verify Table Created

**Check table exists:**
```
use supabase list_tables to confirm rate_limits table exists
```

**Expected:** `rate_limits` appears in list

**Query the table:**
```
use supabase execute_sql to SELECT * FROM rate_limits LIMIT 1
```

**Expected:** Query succeeds (may be empty, that's ok)

**Check migration history:**
```
use supabase list_migrations
```

**Expected:** Shows `002_add_rate_limiting` in migration history

---

### Step 7: Test Production Rate Limiting

**Wait for production traffic or trigger manually:**

```bash
# In terminal, make multiple requests:
for i in {1..15}; do
  curl -X POST "https://moof-city.vercel.app/api/fortune" \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","ageRange":"26-35","birthDay":"Monday","bloodGroup":"A"}' \
    -w "\nStatus: %{http_code}\n" &
done
wait
```

**Then check rate_limits table:**
```
use supabase execute_sql to SELECT identifier, count, reset_time FROM rate_limits ORDER BY created_at DESC LIMIT 10
```

**Expected:**
```
Results:
- fortune:xxx.xxx.xxx.xxx | count: 15 | reset_time: [timestamp]
- admin-login:xxx.xxx.xxx.xxx | count: 2 | reset_time: [timestamp]
```

**This proves:**
- ✅ Rate limiting is working in production
- ✅ Using Supabase backend (not in-memory)
- ✅ Distributed across Vercel instances

---

### Step 8: Commit Configuration Change

```bash
cd ~/Projects/moof.city
git add opencode.json
git commit -m "feat: upgrade to full Supabase MCP with OAuth and DDL support

- Replace @supabase/mcp-server-postgrest with remote Supabase MCP
- Enable OAuth 2.1 authentication (eliminates token env var issues)
- Add apply_migration tool for DDL operations
- Add debugging tools: get_logs, get_advisors
- Add development tools: generate_typescript_types
- Project-scoped to moof.city only
- Features enabled: database, docs, debugging
- Successfully applied rate_limits migration via MCP
- No more manual SQL Editor needed for schema changes"

git push
```

---

## 🎊 SUCCESS CRITERIA

After completing all steps, you should have:

✅ **MCP Configuration:**
- Using remote Supabase MCP
- OAuth authenticated
- Project-scoped to moof.city

✅ **Database:**
- rate_limits table created
- Indexes in place
- Migration tracked

✅ **Functionality:**
- Can create tables via chat
- Can query data via chat
- Can view logs via chat
- Can get advisors via chat

✅ **Production:**
- Rate limiting working with Supabase backend
- No more in-memory fallback
- Distributed across instances

---

## 🛠️ TROUBLESHOOTING

### Issue: OAuth browser doesn't open

**Solution:**
```bash
# Get the auth URL manually:
opencode mcp auth supabase --print-url

# Then open in browser manually
```

---

### Issue: Wrong organization selected

**Solution:**
```bash
# Logout and re-authenticate:
opencode mcp logout supabase
opencode mcp auth supabase

# Be sure to select the correct organization this time
```

---

### Issue: apply_migration fails

**Check error message. Common issues:**

1. **Permission denied:**
   - Ensure you selected the right organization
   - Verify OAuth token has write permissions

2. **Syntax error in SQL:**
   - Check the SQL syntax
   - Try running in Supabase SQL Editor first

3. **Table already exists:**
   - Use `IF NOT EXISTS` (already in our SQL)
   - Or drop table first: `DROP TABLE IF EXISTS rate_limits;`

**Fallback:**
```bash
# If MCP fails, use manual SQL Editor as before:
https://supabase.com/dashboard/project/wbyjptteluydlesmqeva/sql/new
```

---

### Issue: MCP tools not available

**Check MCP status:**
```bash
opencode mcp list
```

**Expected output:**
```
supabase:
  Status: ✅ Authenticated
  Type: remote
  URL: https://mcp.supabase.com/mcp?project_ref=...
  Tools: 13 tools available
```

**If shows "Not authenticated":**
```bash
opencode mcp auth supabase
```

---

### Issue: Rate limiting still using in-memory

**Check production logs in Vercel:**
- Should see: `[Rate Limit] Using Supabase rate limiter`
- If sees: `[Rate Limit] Using In-Memory rate limiter`

**Cause:** rate_limits table doesn't exist yet

**Solution:** Complete Step 5 above (apply migration)

---

## 🎯 BENEFITS YOU'LL GET

### Before (Manual Process):
```
Need to create table:
1. Write SQL in migration file
2. Open browser
3. Navigate to Supabase Dashboard
4. Go to SQL Editor
5. Copy/paste SQL
6. Click Run
7. Check for errors
8. Verify in Table Editor

Time: 5-10 minutes
```

### After (MCP Process):
```
Need to create table:
"use supabase apply_migration to create [table description]"

Time: 30 seconds
```

### Additional Capabilities:
```
# Debug production issues:
"use supabase get_logs from postgres service - show me errors from last hour"

# Get optimization suggestions:
"use supabase get_advisors - any performance issues?"

# Generate types:
"use supabase generate_typescript_types and save to src/types/database.ts"

# Analyze data:
"use supabase execute_sql to SELECT age_range, COUNT(*) FROM prod_fortunes GROUP BY age_range"
```

---

## 📞 SUPPORT

### Check MCP Status:
```bash
opencode mcp list        # Show all MCPs and auth status
opencode mcp debug supabase  # Debug connection issues
```

### View OAuth Tokens:
```bash
cat ~/.local/share/opencode/mcp-auth.json
# Should show encrypted tokens for supabase
```

### Rollback if Needed:
```bash
cd ~/Projects/moof.city
cp opencode.json.postgrest-backup opencode.json
# Restart OpenCode
```

---

## ✅ COMPLETION CHECKLIST

Mark these off as you complete each step:

- [ ] Exit current OpenCode session
- [ ] Start new OpenCode session
- [ ] Authenticate: `opencode mcp auth supabase`
- [ ] Test: List tables
- [ ] Test: Execute SQL query
- [ ] Apply migration: Create rate_limits table
- [ ] Verify: Table exists
- [ ] Verify: Migration tracked
- [ ] Test: Query rate_limits table
- [ ] Test: Production rate limiting working
- [ ] Commit: Git commit configuration
- [ ] Push: Git push to GitHub
- [ ] Celebrate: You can now create tables via chat! 🎉

---

## 🚀 YOU'RE READY!

The configuration has been updated. Follow the steps above to:
1. Restart OpenCode
2. Authenticate with Supabase
3. Use MCP to create the rate_limits table
4. Enjoy full Supabase platform access via chat!

**Next command to run:**
```bash
exit  # (exit current OpenCode session)
```

Then open new terminal and:
```bash
cd ~/Projects/moof.city
opencode
```

Good luck! 🎊
