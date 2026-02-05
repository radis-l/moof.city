// Environment detection and validation utilities

export const getEnvironmentInfo = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
  const isVercel = process.env.VERCEL === '1'
  const isClient = typeof window !== 'undefined'
  const isDevelopment = !isProduction && !isVercel

  // Check if required environment variables are present
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD
  const hasJwtSecret = !!process.env.JWT_SECRET
  const hasSupabaseKeys = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)

  // Detect Edge Runtime vs Node.js Runtime
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

  if (!env.hasSupabaseKeys && !env.isClient) {
    errors.push('Supabase keys missing - SUPABASE_URL and SUPABASE_ANON_KEY required')
  }

  if (env.isDevelopment && !env.hasAdminPassword && !env.isClient) {
    warnings.push('ADMIN_PASSWORD not set - using default "admin" for local dev')
  }

  return { warnings, errors, isValid: errors.length === 0 }
}

// Always use Supabase (no more SQLite)
export const getStorageMode = () => {
  const env = getEnvironmentInfo()

  if (!env.hasSupabaseKeys && !env.isClient) {
    console.error('CRITICAL: Supabase keys missing')
    return 'error-missing-keys'
  }

  return 'supabase'
}

export const getEnvironmentBadge = () => {
  const env = getEnvironmentInfo()

  return {
    environment: env.isDevelopment ? 'Development' : 'Production',
    storage: 'Supabase',
    color: env.isDevelopment ? 'bg-blue-600' : 'bg-green-600'
  }
}
