'use client'

import Lottie from 'lottie-react'
import loadingStarAnimation from '@/assets/loading-star-animation.json'

interface LoadingAnimationProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export const LoadingAnimation = ({ 
  className = '', 
  size = 'medium'
}: LoadingAnimationProps) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16', 
    large: 'w-24 h-24'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <Lottie
        animationData={loadingStarAnimation}
        autoplay={true}
        loop={true}
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 24px rgba(139, 92, 246, 0.2))',
        }}
      />
      
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