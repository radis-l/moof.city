'use client'

import { useEffect } from 'react'

export const ParticleBackground = () => {
  useEffect(() => {
    // Create particle effect
    const particlesContainer = document.getElementById('particles-container');
    if (!particlesContainer) return;
    
    const particleCount = 80;
    
    // Create different types of particles
    for (let i = 0; i < particleCount; i++) {
      createParticle();
    }
    
    function createParticle() {
      const particle = document.createElement('div');
      
      // Create different particle types based on randomness
      const particleType = Math.random();
      let size, className;
      
      if (particleType < 0.6) {
        // Small bright particles (60%)
        size = Math.random() * 2 + 1;
        className = 'particle particle-small';
      } else if (particleType < 0.85) {
        // Medium glowing particles (25%)
        size = Math.random() * 4 + 3;
        className = 'particle particle-medium';
      } else {
        // Large soft particles (15%)
        size = Math.random() * 8 + 6;
        className = 'particle particle-large';
      }
      
      particle.className = className;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Initial position
      resetParticle(particle);
      
      particlesContainer?.appendChild(particle);
      
      // Animate
      animateParticle(particle);
    }
    
    function resetParticle(particle: HTMLElement) {
      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.opacity = '0';
      
      return {
        x: posX,
        y: posY
      };
    }
    
    function animateParticle(particle: HTMLElement) {
      // Initial position
      const pos = resetParticle(particle);
      
      // Random animation properties
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      
      // Animate with CSS transitions
      setTimeout(() => {
        particle.style.transition = `all ${duration}s linear`;
        particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
        
        // Move in a slight direction
        const moveX = pos.x + (Math.random() * 20 - 10);
        const moveY = pos.y - Math.random() * 30; // Move upwards
        
        particle.style.left = `${moveX}%`;
        particle.style.top = `${moveY}%`;
        
        // Reset after animation completes
        setTimeout(() => {
          animateParticle(particle);
        }, duration * 1000);
      }, delay * 1000);
    }
    
    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      // Create particles at mouse position
      const mouseX = (e.clientX / window.innerWidth) * 100;
      const mouseY = (e.clientY / window.innerHeight) * 100;
      
      // Create temporary particle
      const particle = document.createElement('div');
      particle.className = 'particle particle-small';
      
      // Small size
      const size = Math.random() * 3 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Position at mouse
      particle.style.left = `${mouseX}%`;
      particle.style.top = `${mouseY}%`;
      particle.style.opacity = '0.6';
      
      particlesContainer?.appendChild(particle);
      
      // Animate outward
      setTimeout(() => {
        particle.style.transition = 'all 2s ease-out';
        particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`;
        particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`;
        particle.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => {
          particle.remove();
        }, 2000);
      }, 10);
      
      // Subtle movement of gradient spheres
      const spheres = document.querySelectorAll('.gradient-sphere');
      const moveX = (e.clientX / window.innerWidth - 0.5) * 5;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 5;
      
      spheres.forEach(sphere => {
        const element = sphere as HTMLElement;
        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (particlesContainer) {
        particlesContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <>
      {/* Particles Container */}
      <div id="particles-container"></div>
      
      {/* Gradient Spheres for mystical atmosphere */}
      <div className="gradient-sphere gradient-sphere-1"></div>
      <div className="gradient-sphere gradient-sphere-2"></div>
      <div className="gradient-sphere gradient-sphere-3"></div>
      <div className="gradient-sphere gradient-sphere-4"></div>
    </>
  );
};