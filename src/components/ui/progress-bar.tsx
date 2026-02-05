import { Progress } from './progress'

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
      <Progress value={progress} />
    </div>
  )
}