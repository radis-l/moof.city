# Vercel KV Database Setup Guide

## Problem
In production on Vercel, the file system is read-only, causing admin functions to fail with:
```
EROFS: read-only file system, open '/var/task/data/fortune-data.json'
```

## Solution
The app now uses **hybrid storage**:
- **Development**: Local JSON files (as before)
- **Production**: Vercel KV (Redis database)

## Setup Steps

### 1. Create Vercel KV Database
1. Go to your Vercel dashboard
2. Select your project (`moof.city`)
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Choose a name (e.g., `fortune-kv`)
7. Select region (closest to your users)
8. Click **Create**

### 2. Connect Database
1. After creation, click **Connect**
2. Select your project
3. Vercel automatically adds these environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN` 
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

### 3. Deploy Changes
The database solution is already coded and ready. Just push changes:

```bash
git push
```

Vercel will automatically deploy with KV storage enabled.

## How It Works

### Development (localhost:3000)
- Uses local `data/fortune-data.json` file
- Admin functions work normally
- No database setup required

### Production (moof.city)
- Automatically detects Vercel environment
- Uses KV Redis for all data operations
- Admin functions work in production
- Zero configuration needed

## Features
- ✅ **Automatic switching**: Dev uses files, production uses KV
- ✅ **Same API**: No code changes needed
- ✅ **Admin dashboard**: Works in both environments
- ✅ **Data persistence**: Survives deployments
- ✅ **Fast performance**: Redis is very fast
- ✅ **Free tier**: Vercel KV has generous free limits

## Verification
After setup, visit `https://moof.city/admin` to verify:
- Data loads correctly
- Delete functions work
- Clear all data works
- CSV export works

The error `EROFS: read-only file system` should be gone!