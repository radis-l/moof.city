interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export const ProgressBar = ({ currentStep, totalSteps, className = '' }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <span 
          className="font-body text-gray-300 font-medium"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          ขั้นตอนที่ {currentStep} จาก {totalSteps}
        </span>
        <span 
          className="font-body text-purple-300 font-medium"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm">
        <div 
          className="h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ 
            background: 'var(--gradient-progress)',
            width: `${progress}%`,
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
          }}
        />
      </div>
    </div>
  )
}