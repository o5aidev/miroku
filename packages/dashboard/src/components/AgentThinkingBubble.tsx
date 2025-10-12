import { useEffect, useState } from 'react';

export interface ThinkingBubbleProps {
  agentId: string;
  agentName: string;
  thinking: string | null;
  position: { x: number; y: number };
  status: 'idle' | 'running' | 'completed' | 'error';
}

export function AgentThinkingBubble({
  agentId: _agentId,
  agentName,
  thinking,
  position,
  status,
}: ThinkingBubbleProps) {
  const [visible, setVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [dots, setDots] = useState('');

  // Show bubble when agent is running
  useEffect(() => {
    if (status === 'running' && thinking) {
      setVisible(true);
      setCurrentText(thinking);
    } else {
      setVisible(false);
    }
  }, [status, thinking]);

  // Animate dots
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || !thinking) {
    return null;
  }

  // Position bubble above the node
  const bubbleX = position.x + 75; // Center of node (150px wide)
  const bubbleY = position.y - 80; // Above the node

  // Status color
  const statusColor = status === 'running' ? '#8B5CF6' : '#10B981';

  return (
    <div
      className="pointer-events-none absolute z-30 transition-all duration-300"
      style={{
        left: `${bubbleX}px`,
        top: `${bubbleY}px`,
        transform: 'translate(-50%, 0)',
      }}
    >
      {/* Thought bubble */}
      <div
        className="relative rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(124, 58, 237, 0.95))',
          animation: 'bubble-float 2s ease-in-out infinite',
        }}
      >
        {/* Agent icon and name */}
        <div className="mb-1 flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
            style={{ backgroundColor: statusColor }}
          >
            🤖
          </div>
          <span className="text-xs font-bold text-white">{agentName}</span>
        </div>

        {/* Thinking text */}
        <p className="text-sm font-medium text-white">
          {currentText}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>

        {/* Bubble tail pointing to agent */}
        <div
          className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-8 border-transparent"
          style={{
            borderTopColor: 'rgba(124, 58, 237, 0.95)',
          }}
        />

        {/* Small decorative circles (thought bubble style) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '8px',
            height: '8px',
            background: 'rgba(139, 92, 246, 0.95)',
            top: 'calc(100% + 8px)',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '5px',
            height: '5px',
            background: 'rgba(139, 92, 246, 0.95)',
            top: 'calc(100% + 18px)',
          }}
        />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes bubble-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}

// Container component to manage multiple thinking bubbles
export interface AgentThinkingBubblesProps {
  bubbles: Array<{
    agentId: string;
    agentName: string;
    thinking: string | null;
    position: { x: number; y: number };
    status: 'idle' | 'running' | 'completed' | 'error';
  }>;
}

export function AgentThinkingBubbles({ bubbles }: AgentThinkingBubblesProps) {
  return (
    <>
      {bubbles.map((bubble) => (
        <AgentThinkingBubble
          key={bubble.agentId}
          agentId={bubble.agentId}
          agentName={bubble.agentName}
          thinking={bubble.thinking}
          position={bubble.position}
          status={bubble.status}
        />
      ))}
    </>
  );
}
