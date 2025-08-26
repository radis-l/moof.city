import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const inputStyles = `
      w-full px-6 py-4 rounded-2xl
      bg-white/90 text-gray-900 placeholder-gray-500
      border-2 border-transparent backdrop-blur-sm
      focus:outline-none focus:ring-2 focus:ring-purple-500/50 
      focus:border-purple-400/60 focus:bg-white
      hover:bg-white/95 hover:border-purple-300/40
      transition-all duration-300 ease-out
      font-family: var(--font-body)
      shadow-lg focus:shadow-xl
      ${error ? 'ring-2 ring-red-400/60 border-red-300/40' : ''}
      ${className}
    `
    
    return (
      <div className="w-full">
        {label && (
          <label 
            className="block font-medium text-gray-200 mb-3 font-body"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputStyles}
          style={{ fontSize: 'var(--text-base)' }}
          {...props}
        />
        {error && (
          <p 
            className="mt-2 font-body text-red-300"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'