interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange: (value: string) => void
  className?: string
}

export const RadioGroup = ({ 
  name, 
  options, 
  value, 
  onChange, 
  className = '' 
}: RadioGroupProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <label 
          key={option.value} 
          className={`
            block w-full cursor-pointer group transition-all duration-300 ease-out
            rounded-2xl border-2 relative overflow-hidden backdrop-blur-sm
            ${value === option.value 
              ? 'border-purple-400/80 bg-purple-500/20 shadow-lg shadow-purple-500/20' 
              : 'border-gray-600/50 bg-white/5 hover:border-purple-300/60 hover:bg-white/10'
            }
          `}
          style={{ padding: 'var(--space-3) var(--space-4)' }}
        >
          {/* Purple accent bar for selected state */}
          {value === option.value && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-500"></div>
          )}
          
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          
          <div className="flex items-center justify-between">
            <span 
              className={`font-body transition-all duration-300 ${
                value === option.value 
                  ? 'text-white font-semibold' 
                  : 'text-gray-200 group-hover:text-white'
              }`}
              style={{ fontSize: 'var(--text-base)' }}
            >
              {option.label}
            </span>
            
            {/* Enhanced selection indicator */}
            <div className={`
              w-5 h-5 rounded-full transition-all duration-300
              ${value === option.value 
                ? 'bg-purple-400 shadow-lg shadow-purple-400/50' 
                : 'border-2 border-gray-400 group-hover:border-purple-300'
              }
            `}>
              {value === option.value && (
                <div className="w-2 h-2 rounded-full bg-white mx-auto mt-1.5"></div>
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  )
}