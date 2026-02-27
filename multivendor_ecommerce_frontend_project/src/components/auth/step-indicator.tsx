"use client"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const stepNum = i + 1
        return (
          <div key={i} className="flex items-center">
            <div className={`step-number ${stepNum > currentStep ? "inactive" : ""}`}>{stepNum}</div>
            {i < totalSteps - 1 && <div className={`step-line ${stepNum < currentStep ? "active" : ""}`} />}
          </div>
        )
      })}
    </div>
  )
}
