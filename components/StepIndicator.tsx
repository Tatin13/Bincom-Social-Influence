
import React from 'react';
import { Step } from '../types';

interface StepIndicatorProps {
  currentStep: Step;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    'Base',
    'Source',
    'Medium',
    'Campaign',
    'Content',
    'ID',
    'Confirm'
  ];

  return (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide">
      {steps.map((label, idx) => {
        const isActive = idx <= currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div key={label} className="flex flex-col items-center flex-1 min-w-[60px]">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all duration-300 ${
                isCurrent
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {idx + 1}
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
