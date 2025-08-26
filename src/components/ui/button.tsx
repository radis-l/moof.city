import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = `
      font-medium rounded-2xl transition-all duration-300 ease-out
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-[1.02] active:scale-[0.98]
      font-family: var(--font-body)
    `
    
    const variants = {
      primary: `
        bg-gradient-to-r from-purple-600 to-purple-700 
        hover:from-purple-500 hover:to-purple-600
        text-white shadow-lg hover:shadow-xl
        border border-purple-500/30 hover:border-purple-400/50
      `,
      secondary: `
        bg-gray-700/50 hover:bg-gray-600/60 
        backdrop-blur-sm text-white 
        border border-gray-600/30 hover:border-gray-500/50
        shadow-md hover:shadow-lg
      `,
      outline: `
        border-2 border-purple-500/60 hover:border-purple-400/80
        text-purple-300 hover:text-white bg-transparent 
        hover:bg-purple-600/20 backdrop-blur-sm
        shadow-lg hover:shadow-xl
        hover:shadow-purple-500/25
      `
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]'
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