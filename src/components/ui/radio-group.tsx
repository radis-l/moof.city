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
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <label 
          key={option.value} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-5 h-5 text-purple-600 border-gray-400 focus:ring-purple-500 focus:ring-2"
          />
          <span className="text-white group-hover:text-purple-200 transition-colors">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}