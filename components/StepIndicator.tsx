
import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  // We use a simpler bullet style that handles the dynamic skipping better
  const totalVisibleSteps = 8; // Base -> Source -> Medium -> Campaign -> Content -> ID -> Params -> Confirm
  const currentProgress = Math.min(currentStep, Step.CONFIRMATION);

  return (
    <div className="flex gap-1.5 h-1.5 w-full">
      {Array.from({ length: totalVisibleSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum <= currentProgress;
        
        return (
          <div 
            key={idx} 
            className={`h-full rounded-full transition-all duration-500 flex-1 ${
              isActive ? 'bg-blue-600' : 'bg-slate-100'
            }`}
          />
        );
      })}
    </div>
  );
};

export default StepIndicator;
