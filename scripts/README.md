# Scripts Directory

This directory contains utility scripts for database migrations and maintenance.

## Available Scripts

### `run-migration.ts`

**Purpose:** Execute database migrations to add performance indexes

**Usage:**
```bash
npm run migrate-db
```

**Requirements:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` (preferred) or `SUPABASE_ANON_KEY`

**Example:**
```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... \
npm run migrate-db
```

**Note:** If you don't have the service role key, use the manual migration method documented in `migrations/MANUAL_MIGRATION.md`

---

### `migrate-passwords.ts`

**Purpose:** Migrate admin passwords to bcrypt hashing

**Usage:**
```bash
npm run migrate-passwords
```

---

## Getting Supabase Credentials

### Option 1: From Vercel Dashboard
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Option 2: From Supabase Dashboard
1. Go to https://app.supabase.com/project/YOUR-PROJECT-ID
2. Click Settings > API
3. Copy your project URL and service role key

---

## Troubleshooting

**"Missing environment variables" error:**
- Make sure you've set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Verify the values are correct (no quotes, no extra spaces)

**"Permission denied" error:**
- Your ANON key doesn't have permission to create indexes
- Use the manual migration method (see `migrations/MANUAL_MIGRATION.md`)
- Or get your SERVICE_ROLE_KEY from Supabase Dashboard

**"Connection failed" error:**
- Check your SUPABASE_URL is correct
- Verify your network connection
- Check Supabase service status
