import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'mobile' | 'tablet' | 'desktop'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = `
      font-medium rounded-2xl transition-all duration-200 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.95] touch-manipulation
      font-family: var(--font-body)
      focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent
    `
    
    const variants = {
      primary: `
        btn-mystical-primary
        border border-purple-500/30 hover:border-purple-400/50
      `,
      secondary: `
        btn-mystical-secondary
        border border-purple-600/30 hover:border-purple-500/50
      `,
      outline: `
        border-2 border-gray-300 hover:border-gray-400
        text-gray-700 hover:text-gray-900 bg-white 
        hover:bg-gray-50 active:bg-gray-100
        shadow-sm hover:shadow-md
        transition-all duration-200
      `
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
      mobile: 'px-6 py-3 text-base min-h-[48px] w-full',
      tablet: 'px-5 py-2.5 text-sm min-h-[44px]',
      desktop: 'px-6 py-2.5 text-sm min-h-[42px]'
    }
    
    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
    
    return (
      <button
        ref={ref}
        className={classes}
        style={{
          fontSize: size === 'lg' ? 'var(--text-lg)' : size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)'
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'