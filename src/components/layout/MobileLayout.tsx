'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { MoofLogo } from '@/assets/logo'
import { LazyParticleBackground } from '@/components/ui/lazy-particle-background'

interface MobileLayoutProps {
  children: ReactNode
  showHeader?: boolean
}

export function MobileLayout({ children, showHeader = true }: MobileLayoutProps) {
  const router = useRouter()

  return (
    <>
      {/* Mobile Only - Main Content */}
      <div className="block md:hidden mystical-background text-white relative overflow-hidden">
        <LazyParticleBackground />
        
        {/* Header */}
        {showHeader && (
          <header className="content-section" style={{ paddingTop: 'var(--space-3)' }}>
            <div className="container-grid">
              <div className="grid-full flex justify-between items-center">
                <button 
                  className="font-body cursor-pointer hover:opacity-80 transition-opacity" 
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}
                  onClick={() => router.push('/')}
                >
                  ดูดวงฟรีกับ <span className="font-logo font-bold text-white">MOOF</span>
                </button>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)' }}>
                  &lt;/&gt;
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        {children}
      </div>

      {/* Desktop/Tablet - Mobile Only Message */}
      <div className="hidden md:flex mystical-background text-white min-h-screen items-center justify-center relative overflow-hidden">
        <LazyParticleBackground />
        <div className="text-center relative z-10 px-6">
          <div className="mb-8">
            <MoofLogo />
          </div>
          <h1 
            className="font-heading text-white font-bold mb-6"
            style={{ 
              fontSize: 'var(--text-3xl)', 
              textShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            เว็บไซต์นี้รองรับเฉพาะมือถือ
          </h1>
          <p 
            className="font-body text-gray-300 mb-8 max-w-md mx-auto leading-relaxed"
            style={{ fontSize: 'var(--text-lg)' }}
          >
            กรุณาเปิดเว็บไซต์ผ่านมือถือของคุณ<br />
            เพื่อประสบการณ์การใช้งานที่ดีที่สุด
          </p>
        </div>
      </div>
    </>
  )
}