'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  velocityX: number
  velocityY: number
  type: 'small' | 'medium' | 'large'
}

export const OptimizedParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()

    // Create particles
    const createParticles = () => {
      const particles: Particle[] = []
      const particleCount = window.innerWidth < 768 ? 30 : 50 // Fewer on mobile
      
      for (let i = 0; i < particleCount; i++) {
        const type = Math.random() < 0.6 ? 'small' : Math.random() < 0.85 ? 'medium' : 'large'
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: type === 'small' ? Math.random() * 2 + 1 : type === 'medium' ? Math.random() * 3 + 2 : Math.random() * 4 + 3,
          opacity: Math.random() * 0.3 + 0.1,
          velocityX: (Math.random() - 0.5) * 0.5,
          velocityY: Math.random() * -0.5 - 0.2,
          type
        })
      }
      return particles
    }

    particlesRef.current = createParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.velocityX
        particle.y += particle.velocityY
        
        // Reset if particle goes off screen
        if (particle.y < -10 || particle.x < -10 || particle.x > canvas.width + 10) {
          particle.x = Math.random() * canvas.width
          particle.y = canvas.height + 10
          particle.velocityX = (Math.random() - 0.5) * 0.5
          particle.velocityY = Math.random() * -0.5 - 0.2
        }
        
        // Draw particle based on type
        ctx.save()
        ctx.globalAlpha = particle.opacity
        
        if (particle.type === 'small') {
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
          gradient.addColorStop(0, '#ffffff')
          gradient.addColorStop(0.3, '#8b5cf6')
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
        } else if (particle.type === 'medium') {
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
          gradient.addColorStop(0, '#a78bfa')
          gradient.addColorStop(0.4, '#8b5cf6')
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
        } else {
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
          gradient.addColorStop(0, '#8b5cf6')
          gradient.addColorStop(0.5, '#7c3aed')
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
        }
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Handle mouse movement (throttled)
    let mouseTimeout: NodeJS.Timeout
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout)
      mouseTimeout = setTimeout(() => {
        mouseRef.current = { x: e.clientX, y: e.clientY }
        
        // Subtle gradient sphere movement
        const spheres = document.querySelectorAll('.gradient-sphere')
        const moveX = (e.clientX / window.innerWidth - 0.5) * 3 // Reduced movement
        const moveY = (e.clientY / window.innerHeight - 0.5) * 3
        
        spheres.forEach(sphere => {
          const element = sphere as HTMLElement
          element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`
        })
      }, 16) // ~60fps throttle
    }

    // Handle resize
    const handleResize = () => {
      updateCanvasSize()
      particlesRef.current = createParticles()
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current)
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      clearTimeout(mouseTimeout)
    }
  }, [])

  return (
    <>
      {/* Canvas-based particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-1"
        style={{ 
          background: 'transparent',
          willChange: 'auto' // Prevent unnecessary compositing
        }}
      />
      
      {/* Optimized gradient spheres */}
      <div 
        className="gradient-sphere gradient-sphere-1" 
        style={{ willChange: 'transform' }}
      ></div>
      <div 
        className="gradient-sphere gradient-sphere-2" 
        style={{ willChange: 'transform' }}
      ></div>
      <div 
        className="gradient-sphere gradient-sphere-3" 
        style={{ willChange: 'transform' }}
      ></div>
      <div 
        className="gradient-sphere gradient-sphere-4" 
        style={{ willChange: 'transform' }}
      ></div>
    </>
  )
}