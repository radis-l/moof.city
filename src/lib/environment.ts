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

  return {
    isProduction,
    isVercel,
    isDevelopment,
    isClient,
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
    errors.push('Supabase keys missing in production - data will not persist')
  }

  return { warnings, errors, isValid: errors.length === 0 }
}

export const getStorageMode = () => {
  const env = getEnvironmentInfo()
  const forceSupabase = process.env.USE_SUPABASE_PRIMARY === 'true'

  // On Vercel, we MUST use Supabase or everything will fail/not persist
  if (env.isVercel || env.isProduction || forceSupabase) {
    if (env.hasSupabaseKeys) {
      return 'supabase'
    }
    // If on Vercel but keys are missing, we're in a broken state
    return env.isClient ? 'checking...' : 'error-missing-keys'
  }
  
  // Local development
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