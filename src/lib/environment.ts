// Environment detection and validation utilities

export const getEnvironmentInfo = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  const isVercel = process.env.VERCEL === '1'
  const isClient = typeof window !== 'undefined'
  const isDevelopment = !isProduction && !isVercel

  // Check if required environment variables are present
  // Note: These are only available on the server
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD
  const hasJwtSecret = !!process.env.JWT_SECRET
  const hasSupabaseKeys = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)

  // Detect Edge Runtime vs Node.js Runtime
  // Edge Runtime doesn't have process.version or certain Node.js APIs
  const isEdgeRuntime = typeof (globalThis as { EdgeRuntime?: string }).EdgeRuntime !== 'undefined'

  return {
    isProduction,
    isVercel,
    isDevelopment,
    isClient,
    isEdgeRuntime,
    hasAdminPassword,
    hasJwtSecret,
    hasSupabaseKeys,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
}

export const validateEnvironment = () => {
  const env = getEnvironmentInfo()
  const warnings: string[] = []
  const errors: string[] = []

  // Critical checks
  if (!env.hasJwtSecret && !env.isClient) {
    errors.push('JWT_SECRET environment variable is missing')
  }

  if (env.isDevelopment && !env.hasAdminPassword && !env.isClient) {
    errors.push('ADMIN_PASSWORD environment variable is missing in development')
  }

  // Warning checks
  if (env.isDevelopment && env.hasSupabaseKeys) {
    warnings.push('Supabase keys detected in development - app will use SQLite unless forced')
  }

  if (env.isProduction && !env.hasSupabaseKeys && !env.isClient) {
    errors.push('CRITICAL: Supabase keys missing in production environment. Data persistence will fail.')
  }

  return { warnings, errors, isValid: errors.length === 0 }
}

export const getStorageMode = () => {
  const env = getEnvironmentInfo()
  const forceSupabase = process.env.USE_SUPABASE_PRIMARY === 'true'

  // 1. Explicitly forced via Env Var
  if (forceSupabase && env.hasSupabaseKeys) {
    return 'supabase'
  }

  // 2. Production/Vercel - MUST use Supabase
  if (env.isProduction || env.isVercel) {
    if (env.hasSupabaseKeys) {
      return 'supabase'
    }
    // If we're on the server and keys are missing, it's a critical error
    if (!env.isClient) {
      console.error('CRITICAL: Supabase configuration error in production.')
      return 'error-missing-keys'
    }
    return 'checking...'
  }
  
  // 3. Local Development - Default to SQLite
  return 'sqlite'
}

export const getEnvironmentBadge = () => {
  const env = getEnvironmentInfo()
  const storageMode = getStorageMode()

  return {
    environment: env.isDevelopment ? 'Development' : 'Production',
    storage: storageMode === 'supabase' ? 'Supabase DB' :
      storageMode === 'sqlite' ? 'SQLite' : 'Fallback',
    color: env.isDevelopment ? 'bg-blue-600' : 'bg-green-600'
  }
}