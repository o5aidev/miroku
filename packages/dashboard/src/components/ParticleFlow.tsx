import { useEffect, useState, useRef } from 'react';
import type { GraphEdge } from '../types';

interface Particle {
  id: string;
  edgeId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
  size: number;
}

export interface ParticleFlowProps {
  edges: GraphEdge[];
  nodes: Array<{ id: string; position: { x: number; y: number } }>;
  activeEdgeIds: string[];
}

export function ParticleFlow({ edges, nodes, activeEdgeIds }: ParticleFlowProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  // Generate particles for active edges
  useEffect(() => {
    if (activeEdgeIds.length === 0) {
      setParticles([]);
      return;
    }

    // Create initial particles
    const newParticles: Particle[] = [];
    activeEdgeIds.forEach((edgeId) => {
      // Create 3 particles per active edge
      for (let i = 0; i < 3; i++) {
        newParticles.push({
          id: `${edgeId}-particle-${i}`,
          edgeId,
          progress: i * 0.33, // Stagger particles
          speed: 0.008 + Math.random() * 0.004, // Vary speed slightly
          color: '#8B5CF6',
          size: 6 + Math.random() * 4,
        });
      }
    });

    setParticles(newParticles);
  }, [activeEdgeIds]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => {
          // Move particle forward
          let newProgress = particle.progress + particle.speed;

          // Loop back to start when reaching end
          if (newProgress >= 1) {
            newProgress = 0;
          }

          return {
            ...particle,
            progress: newProgress,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length]);

  // Calculate particle positions
  const particlePositions = particles.map((particle) => {
    const edge = edges.find((e) => e.id === particle.edgeId);
    if (!edge) return null;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    // Interpolate position along edge
    const x = sourceNode.position.x + (targetNode.position.x - sourceNode.position.x) * particle.progress + 75; // +75 for node center offset
    const y = sourceNode.position.y + (targetNode.position.y - sourceNode.position.y) * particle.progress + 50; // +50 for node center offset

    return {
      id: particle.id,
      x,
      y,
      color: particle.color,
      size: particle.size,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {particlePositions.map((pos) => {
        if (!pos) return null;

        return (
          <div
            key={pos.id}
            className="absolute transition-transform duration-100"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${pos.size}px`,
              height: `${pos.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Particle glow */}
            <div
              className="absolute inset-0 rounded-full opacity-40 blur-sm"
              style={{
                backgroundColor: pos.color,
              }}
            />
            {/* Particle core */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: pos.color,
                boxShadow: `0 0 ${pos.size * 2}px ${pos.color}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// Hook to manage active edges for particle flow
export function useParticleFlow() {
  const [activeEdgeIds, setActiveEdgeIds] = useState<string[]>([]);

  const activateEdge = (edgeId: string, duration: number = 3000) => {
    setActiveEdgeIds((prev) => [...prev, edgeId]);

    // Deactivate after duration
    setTimeout(() => {
      setActiveEdgeIds((prev) => prev.filter((id) => id !== edgeId));
    }, duration);
  };

  const activateEdgesForNode = (nodeId: string, edges: GraphEdge[], duration: number = 3000) => {
    // Find all edges connected to this node
    const connectedEdgeIds = edges
      .filter((edge) => edge.source === nodeId || edge.target === nodeId)
      .map((edge) => edge.id);

    connectedEdgeIds.forEach((edgeId) => {
      activateEdge(edgeId, duration);
    });
  };

  return {
    activeEdgeIds,
    activateEdge,
    activateEdgesForNode,
  };
}
