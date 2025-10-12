import { ReactNode } from 'react';

export interface SkeletonLoaderProps {
  loading: boolean;
  children: ReactNode;
  variant?: 'card' | 'list' | 'graph' | 'panel';
  count?: number;
}

/**
 * Skeleton Loading Component
 *
 * Shows placeholder content while data is loading
 */
export function SkeletonLoader({
  loading,
  children,
  variant = 'card',
  count = 1,
}: SkeletonLoaderProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className="animate-pulse">
      {variant === 'card' && <SkeletonCard />}
      {variant === 'list' && <SkeletonList />}
      {variant === 'graph' && <SkeletonGraph />}
      {variant === 'panel' && <SkeletonPanel />}
    </div>
  ));

  return <>{skeletons}</>;
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-2 h-3 w-full rounded bg-gray-200" />
      <div className="h-3 w-5/6 rounded bg-gray-200" />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="mb-1 h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-2 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonGraph() {
  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex h-full items-center justify-center">
        <div className="space-y-4 text-center">
          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full bg-purple-600"
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-gray-600">Loading graph...</p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-32 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-gray-200" />
            <div className="flex-1">
              <div className="mb-2 h-3 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Progressive Loading Component
 *
 * Shows loading stages with progress indication
 */
export interface ProgressiveLoaderProps {
  stages: string[];
  currentStage?: number;
}

export function ProgressiveLoader({ stages, currentStage = 0 }: ProgressiveLoaderProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-96 rounded-lg bg-white p-8 shadow-2xl">
        {/* Logo/Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-3xl shadow-lg">
            🤖
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          Miyabi Dashboard
        </h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Initializing real-time agent visualization
        </p>

        {/* Stages */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStage;
            const isCurrent = index === currentStage;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-lg p-3 transition ${
                  isCurrent
                    ? 'bg-purple-50 border border-purple-200'
                    : isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'text-green-700'
                        : isCurrent
                        ? 'text-purple-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {stage}
                  </p>
                </div>

                {/* Spinner for current stage */}
                {isCurrent && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
              style={{
                width: `${((currentStage + 1) / stages.length) * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            {currentStage + 1} of {stages.length} complete
          </p>
        </div>
      </div>
    </div>
  );
}
