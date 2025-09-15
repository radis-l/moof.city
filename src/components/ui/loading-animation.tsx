'use client'

import { useState, useEffect } from 'react'

interface LoadingAnimationProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export const LoadingAnimation = ({ 
  className = '', 
  size = 'medium'
}: LoadingAnimationProps) => {
  const [LottieComponent, setLottieComponent] = useState<React.ComponentType<{
    animationData: object
    autoplay: boolean
    loop: boolean
    style: React.CSSProperties
  }> | null>(null)
  const [animationData, setAnimationData] = useState<object | null>(null)

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16', 
    large: 'w-24 h-24'
  }

  useEffect(() => {
    // Dynamic import to reduce bundle size
    const loadAnimation = async () => {
      try {
        const [{ default: Lottie }, animationModule] = await Promise.all([
          import('lottie-react'),
          import('@/assets/loading-star-animation.json')
        ])
        
        setLottieComponent(() => Lottie)
        setAnimationData(animationModule.default)
      } catch (error) {
        console.error('Failed to load animation:', error)
      }
    }

    loadAnimation()
  }, [])

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      {/* Show fallback spinner only while loading */}
      {(!LottieComponent || !animationData) && (
        <div className="animate-spin rounded-full h-full w-full border-2 border-purple-400 border-t-transparent opacity-75"></div>
      )}
      
      {/* Show Lottie animation once loaded */}
      {LottieComponent && animationData && (
        <LottieComponent
          animationData={animationData}
          autoplay={true}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 24px rgba(139, 92, 246, 0.2))',
          }}
        />
      )}
      
      {/* Mystical glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(8px)',
          zIndex: -1
        }}
      />
    </div>
  )
}