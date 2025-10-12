import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { StateNodeData } from '../../types';

interface Props {
  data: StateNodeData;
}

export const StateNode = memo(({ data }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const getGradientFromColor = (color: string): string => {
    // Convert hex to RGB for gradient
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };

    const rgb = hexToRgb(color);
    return `linear-gradient(135deg, rgba(${rgb}, 1) 0%, rgba(${rgb}, 0.7) 50%, rgba(${rgb}, 0.9) 100%)`;
  };

  const getGlowColor = (color: string): string => {
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };

    const rgb = hexToRgb(color);
    return `0 0 30px rgba(${rgb}, 0.6), 0 0 60px rgba(${rgb}, 0.3)`;
  };

  return (
    <div
      className="relative min-w-[240px] transition-all duration-500 scale-pulse"
      style={{ filter: `drop-shadow(${getGlowColor(data.color)})` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !border-4 !border-white !shadow-xl transition-all duration-300 hover:!scale-125"
        style={{ background: `linear-gradient(135deg, ${data.color}, ${data.color}dd)` }}
      />

      <div
        className="relative rounded-3xl p-[3px] transition-all duration-500 shimmer"
        style={{
          background: getGradientFromColor(data.color),
          transform: isHovered ? 'scale(1.1) translateY(-8px)' : 'scale(1)',
        }}
      >
        <div className="relative rounded-3xl bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 backdrop-blur-xl p-6 shadow-2xl">
          <div className="text-center relative z-10">
            {/* Emoji with animation */}
            <div
              className="text-5xl mb-3 inline-block"
              style={{
                animation: data.count > 0 ? 'scalePulse 2s ease-in-out infinite' : 'none',
                filter: data.count > 0 ? `drop-shadow(0 0 10px ${data.color}80)` : 'none',
              }}
            >
              {data.emoji}
            </div>

            {/* Label */}
            <h3 className="text-base font-black text-transparent bg-clip-text mb-3" style={{
              backgroundImage: `linear-gradient(135deg, ${data.color}, ${data.color}cc)`,
            }}>
              {data.label.includes(':') ? data.label.split(':')[1] : data.label}
            </h3>

            {/* Count Badge */}
            {data.count > 0 && (
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-black text-white shadow-lg mb-3 relative overflow-hidden"
                style={{
                  background: getGradientFromColor(data.color),
                  boxShadow: `0 0 30px ${data.color}60, 0 0 60px ${data.color}30`,
                }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer" />
                <span className="relative z-10">{data.count}</span>
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {data.description}
            </p>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !border-4 !border-white !shadow-xl transition-all duration-300 hover:!scale-125"
        style={{ background: `linear-gradient(135deg, ${data.color}, ${data.color}dd)` }}
      />
    </div>
  );
});

StateNode.displayName = 'StateNode';
