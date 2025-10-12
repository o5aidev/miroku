import { useState, useEffect } from 'react';

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface WelcomeTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

/**
 * Interactive Welcome Tour Component
 *
 * Shows a step-by-step guide for first-time users
 */
export function WelcomeTour({ steps, onComplete, onSkip }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('miyabi-dashboard-tour-completed');

    if (!hasSeenTour) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        updatePosition();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [currentStep, isVisible]);

  const updatePosition = () => {
    const step = steps[currentStep];
    if (!step) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      console.warn(`Tour target not found: ${step.target}`);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    const placement = step.placement || 'bottom';

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = rect.top - 20;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 20;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 20;
        break;
    }

    setPosition({ top, left });

    // Highlight target element
    targetElement.classList.add('tour-highlight');

    return () => {
      targetElement.classList.remove('tour-highlight');
    };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('miyabi-dashboard-tour-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('miyabi-dashboard-tour-completed', 'true');
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible || !steps[currentStep]) {
    return null;
  }

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tour Card */}
      <div
        className="fixed z-50 w-80 rounded-lg bg-white shadow-2xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, 0)',
        }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="text-xs text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Skip tour"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-700 leading-relaxed">{step.content}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 transition shadow-md"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition ${
                index === currentStep
                  ? 'bg-purple-600 w-6'
                  : index < currentStep
                  ? 'bg-purple-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tour Highlight Styles */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.5),
                      0 0 0 8px rgba(147, 51, 234, 0.3),
                      0 0 0 12px rgba(147, 51, 234, 0.1);
          border-radius: 8px;
          animation: tour-pulse 2s ease-in-out infinite;
        }

        @keyframes tour-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.5),
                        0 0 0 8px rgba(147, 51, 234, 0.3),
                        0 0 0 12px rgba(147, 51, 234, 0.1);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.6),
                        0 0 0 10px rgba(147, 51, 234, 0.4),
                        0 0 0 16px rgba(147, 51, 234, 0.2);
          }
        }
      `}</style>
    </>
  );
}
