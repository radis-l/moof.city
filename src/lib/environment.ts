// Environment detection and validation utilities

export const getEnvironmentInfo = () => {
  const isProduction = process.env.NODE_ENV === 'production'
  const isClient = typeof window !== 'undefined'
  const isDevelopment = !isProduction
  
  // Check if required environment variables are present
  const hasAdminPassword = !!process.env.ADMIN_PASSWORD
  const hasJwtSecret = !!process.env.JWT_SECRET
  const hasSupabaseKeys = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  
  return {
    isProduction,
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
  if (!env.hasJwtSecret) {
    errors.push('JWT_SECRET environment variable is missing')
  }
  
  if (env.isDevelopment && !env.hasAdminPassword) {
    errors.push('ADMIN_PASSWORD environment variable is missing in development')
  }
  
  // Warning checks
  if (env.isDevelopment && env.hasSupabaseKeys) {
    warnings.push('Supabase keys detected in development - app will use in-memory storage')
  }
  
  if (env.isProduction && !env.hasSupabaseKeys) {
    warnings.push('Supabase keys missing in production - may cause issues')
  }
  
  return { warnings, errors, isValid: errors.length === 0 }
}

export const getStorageMode = () => {
  const env = getEnvironmentInfo()
  
  if (env.isProduction && env.hasSupabaseKeys) {
    return 'supabase'
  } else if (env.isDevelopment) {
    return 'memory'
  } else {
    return 'fallback'
  }
}

export const getEnvironmentBadge = () => {
  const env = getEnvironmentInfo()
  const storageMode = getStorageMode()
  
  return {
    environment: env.isDevelopment ? 'Development' : 'Production',
    storage: storageMode === 'supabase' ? 'Supabase DB' : 
             storageMode === 'memory' ? 'In-Memory' : 'Fallback',
    color: env.isDevelopment ? 'bg-blue-600' : 'bg-green-600'
  }
}