'use client'

import { lazy, Suspense } from 'react'

// Lazy load the heavy particle component
const OptimizedParticleBackground = lazy(() => 
  import('./optimized-particle-background').then(module => ({
    default: module.OptimizedParticleBackground
  }))
)

// Lightweight fallback for loading
const ParticleFallback = () => (
  <div className="fixed inset-0 pointer-events-none z-1">
    {/* Static gradient spheres during loading */}
    <div className="gradient-sphere gradient-sphere-1"></div>
    <div className="gradient-sphere gradient-sphere-2"></div>
    <div className="gradient-sphere gradient-sphere-3"></div>
    <div className="gradient-sphere gradient-sphere-4"></div>
  </div>
)

export const LazyParticleBackground = () => (
  <Suspense fallback={<ParticleFallback />}>
    <OptimizedParticleBackground />
  </Suspense>
)