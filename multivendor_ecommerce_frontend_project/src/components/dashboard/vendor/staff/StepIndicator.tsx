'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: { number: number; title: string }[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                  ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <p
                className={`
                  mt-2 text-sm font-medium transition-colors
                  ${
                    currentStep >= step.number
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }
                `}
              >
                {step.title}
              </p>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-4 transition-all duration-300
                  ${
                    currentStep > step.number
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }
                `}
                style={{ maxWidth: '100px' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};