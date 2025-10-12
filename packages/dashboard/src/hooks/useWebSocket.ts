import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  AgentStartedEvent,
  AgentProgressEvent,
  AgentCompletedEvent,
  AgentErrorEvent,
  StateTransitionEvent,
  GraphUpdateEvent,
  TaskDiscoveredEvent,
  CoordinatorAnalyzingEvent,
  CoordinatorDecomposingEvent,
  CoordinatorAssigningEvent,
} from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  subscribe: (issueNumber: number) => void;
  unsubscribe: (issueNumber: number) => void;
}

export function useWebSocket(
  onGraphUpdate?: (event: GraphUpdateEvent) => void,
  onAgentStarted?: (event: AgentStartedEvent) => void,
  onAgentProgress?: (event: AgentProgressEvent) => void,
  onAgentCompleted?: (event: AgentCompletedEvent) => void,
  onAgentError?: (event: AgentErrorEvent) => void,
  onStateTransition?: (event: StateTransitionEvent) => void,
  onTaskDiscovered?: (event: TaskDiscoveredEvent) => void,
  onCoordinatorAnalyzing?: (event: CoordinatorAnalyzingEvent) => void,
  onCoordinatorDecomposing?: (event: CoordinatorDecomposingEvent) => void,
  onCoordinatorAssigning?: (event: CoordinatorAssigningEvent) => void
): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Use refs to store the latest callbacks without triggering re-render
  const callbacksRef = useRef({
    onGraphUpdate,
    onAgentStarted,
    onAgentProgress,
    onAgentCompleted,
    onAgentError,
    onStateTransition,
    onTaskDiscovered,
    onCoordinatorAnalyzing,
    onCoordinatorDecomposing,
    onCoordinatorAssigning,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onGraphUpdate,
      onAgentStarted,
      onAgentProgress,
      onAgentCompleted,
      onAgentError,
      onStateTransition,
      onTaskDiscovered,
      onCoordinatorAnalyzing,
      onCoordinatorDecomposing,
      onCoordinatorAssigning,
    };
  }, [
    onGraphUpdate,
    onAgentStarted,
    onAgentProgress,
    onAgentCompleted,
    onAgentError,
    onStateTransition,
    onTaskDiscovered,
    onCoordinatorAnalyzing,
    onCoordinatorDecomposing,
    onCoordinatorAssigning,
  ]);

  useEffect(() => {
    // Initialize socket connection (only once on mount)
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error);
      setConnected(false);
    });

    // Graph update event
    socket.on('graph:update', (event) => {
      callbacksRef.current.onGraphUpdate?.(event);
    });

    // Agent events
    socket.on('agent:started', (event) => {
      callbacksRef.current.onAgentStarted?.(event);
    });

    socket.on('agent:progress', (event) => {
      callbacksRef.current.onAgentProgress?.(event);
    });

    socket.on('agent:completed', (event) => {
      callbacksRef.current.onAgentCompleted?.(event);
    });

    socket.on('agent:error', (event) => {
      callbacksRef.current.onAgentError?.(event);
    });

    // State transition event
    socket.on('state:transition', (event) => {
      callbacksRef.current.onStateTransition?.(event);
    });

    // Coordinator workflow events
    socket.on('task:discovered', (event) => {
      callbacksRef.current.onTaskDiscovered?.(event);
    });

    socket.on('coordinator:analyzing', (event) => {
      callbacksRef.current.onCoordinatorAnalyzing?.(event);
    });

    socket.on('coordinator:decomposing', (event) => {
      callbacksRef.current.onCoordinatorDecomposing?.(event);
    });

    socket.on('coordinator:assigning', (event) => {
      callbacksRef.current.onCoordinatorAssigning?.(event);
    });

    // Cleanup on unmount only
    return () => {
      socket.close();
    };
  }, []); // Empty dependency array - only run once on mount

  const subscribe = (issueNumber: number) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe', { issueNumber });
    }
  };

  const unsubscribe = (issueNumber: number) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe', { issueNumber });
    }
  };

  return {
    socket: socketRef.current,
    connected,
    subscribe,
    unsubscribe,
  };
}
