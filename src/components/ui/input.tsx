import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const inputStyles = `
      w-full px-4 py-3 rounded-lg
      bg-gray-200 text-gray-900 placeholder-gray-500
      border border-transparent
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
      transition-all duration-200
      ${error ? 'ring-2 ring-red-500' : ''}
      ${className}
    `
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputStyles}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'