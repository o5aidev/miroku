import { useEffect, useRef, useState } from 'react';

interface PerformanceStatsProps {
  isVisible: boolean;
  nodeCount: number;
  edgeCount: number;
  visualMode: 'rich' | 'light';
}

export function PerformanceStats({ isVisible, nodeCount, edgeCount, visualMode }: PerformanceStatsProps) {
  const [fps, setFps] = useState<number>(0);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) {
      setFps(0);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }

    const update = (timestamp: number) => {
      framesRef.current += 1;
      const delta = timestamp - lastTimeRef.current;

      if (delta >= 500) {
        const calculatedFps = Math.round((framesRef.current * 1000) / delta);
        setFps(calculatedFps);
        framesRef.current = 0;
        lastTimeRef.current = timestamp;
      }

      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 rounded-lg border border-white/10 bg-gray-900/85 px-4 py-3 text-xs text-white shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-300">FPS</p>
          <p className="text-lg font-bold">{fps}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-300">Nodes</p>
          <p className="text-lg font-bold">{nodeCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-300">Edges</p>
          <p className="text-lg font-bold">{edgeCount}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 text-[11px] text-gray-300">
        <span>Mode: {visualMode === 'rich' ? 'Rich Effects' : 'Light Effects'}</span>
        <span className="text-gray-400">Press Shift+P to toggle</span>
      </div>
    </div>
  );
}
