import { useEffect, useState } from 'react';

interface Confetti {
  id: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

export interface CelebrationEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function CelebrationEffect({ trigger, onComplete }: CelebrationEffectProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    // Generate confetti pieces
    const pieces: Confetti[] = [];
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: `confetti-${i}`,
        x: 50, // Start from center
        y: 50,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: -8 - Math.random() * 4,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    setConfetti(pieces);
    setIsActive(true);

    // Cleanup after animation
    const timeout = setTimeout(() => {
      setIsActive(false);
      setConfetti([]);
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [trigger, onComplete]);

  useEffect(() => {
    if (!isActive) return;

    let animationFrame: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds

      setConfetti((prev) =>
        prev.map((piece) => ({
          ...piece,
          x: piece.x + piece.velocityX * 0.5,
          y: piece.y + piece.velocityY * 0.5 + elapsed * 9.8 * 0.3, // Gravity effect
          rotation: piece.rotation + piece.rotationSpeed,
        }))
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Confetti particles */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
              transition: 'all 0.05s linear',
            }}
          />
        ))}
      </div>

      {/* Success message overlay */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
        <div
          className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6 text-center shadow-2xl"
          style={{
            animation: 'celebration-pulse 0.5s ease-out',
          }}
        >
          <div className="mb-2 text-6xl">🎉</div>
          <h2 className="mb-1 text-2xl font-bold text-white">タスク完了！</h2>
          <p className="text-sm text-green-50">Task Completed Successfully</p>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes celebration-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

// Hook to trigger celebration
export function useCelebration() {
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);

  const celebrate = () => {
    setCelebrationTrigger(true);
    setTimeout(() => {
      setCelebrationTrigger(false);
    }, 100);
  };

  return {
    celebrationTrigger,
    celebrate,
  };
}
