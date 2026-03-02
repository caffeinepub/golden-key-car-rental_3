import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Check } from 'lucide-react';

interface BookingStepIndicatorProps {
  currentStep: number;
}

export default function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  const { t } = useLanguage();

  const steps = [
    t('booking.step1'),
    t('booking.step2'),
    t('booking.step3'),
    t('booking.step4'),
  ];

  return (
    <div className="flex items-center justify-center gap-0 w-full overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1 min-w-[80px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-gold border-gold text-charcoal'
                    : isActive
                    ? 'bg-transparent border-gold text-gold'
                    : 'bg-transparent border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs text-center leading-tight ${isActive ? 'text-gold font-medium' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[20px] mx-1 mb-5 transition-colors ${stepNum < currentStep ? 'bg-gold' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
