import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

interface DeviceState {
  device: {
    identifier: string;
    hostname: string;
    platform: string;
    arch: string;
    nodeVersion: string;
  };
  status: 'online' | 'offline' | 'idle';
  lastActivity: string;
  recentActivities: Array<{
    event: string;
    timestamp: string;
    branch: string;
    commit: string;
  }>;
  currentBranch?: string;
  totalEvents: number;
}

const PLATFORM_ICONS: Record<string, string> = {
  darwin: '🍎',
  linux: '🐧',
  win32: '🪟',
  unknown: '💻',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; indicator: string }> = {
  online: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    indicator: 'bg-green-500',
  },
  idle: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    indicator: 'bg-yellow-500',
  },
  offline: {
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    indicator: 'bg-gray-500',
  },
};

const EVENT_ICONS: Record<string, string> = {
  'pre-push': '⬆️',
  'post-push': '✅',
  'pre-commit': '📝',
  'post-commit': '✅',
};

export function DevicePanel() {
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnection: true,
    });

    // Initial device states
    socket.on('devices:initial', (data: { devices: DeviceState[] }) => {
      console.log('📱 Received initial devices:', data.devices);
      setDevices(data.devices);
    });

    // Device update
    socket.on(
      'device:update',
      (data: { identifier: string; state: DeviceState }) => {
        console.log('📱 Device update:', data.identifier);
        setDevices((prev) => {
          const index = prev.findIndex((d) => d.device.identifier === data.identifier);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = data.state;
            return updated;
          }
          return [...prev, data.state];
        });
      }
    );

    // Device status change
    socket.on(
      'device:status-change',
      (data: { identifier: string; status: 'online' | 'offline' | 'idle' }) => {
        console.log('📱 Device status change:', data.identifier, '→', data.status);
        setDevices((prev) =>
          prev.map((d) =>
            d.device.identifier === data.identifier
              ? { ...d, status: data.status }
              : d
          )
        );
      }
    );

    // Cleanup
    return () => {
      socket.close();
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📱</span>
          <h2 className="text-sm font-semibold text-white">Devices</h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
            {devices.length}
          </span>
        </div>
      </div>

      {/* Device List */}
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {devices.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-white/50">
            <span className="text-2xl">💻</span>
            <p className="text-xs">No devices connected</p>
            <p className="text-xs">Push or commit to register device</p>
          </div>
        ) : (
          devices.map((device) => {
            const statusStyle = STATUS_COLORS[device.status];
            const platformIcon = PLATFORM_ICONS[device.device.platform] || PLATFORM_ICONS.unknown;
            const isSelected = selectedDevice === device.device.identifier;

            return (
              <button
                key={device.device.identifier}
                onClick={() =>
                  setSelectedDevice(
                    isSelected ? null : device.device.identifier
                  )
                }
                className={`flex flex-col gap-1.5 rounded-lg border p-2 text-left transition-all ${
                  isSelected
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {/* Device Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{platformIcon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">
                        {device.device.identifier}
                      </span>
                      <span className="text-[10px] text-white/50">
                        {device.device.hostname}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 ${statusStyle.bg}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${statusStyle.indicator} animate-pulse`} />
                    <span className={`text-[10px] font-medium ${statusStyle.text}`}>
                      {device.status}
                    </span>
                  </div>
                </div>

                {/* Current Branch & Stats */}
                <div className="flex items-center justify-between text-[10px] text-white/70">
                  <div className="flex items-center gap-1">
                    <span>🌿</span>
                    <span className="truncate">{device.currentBranch || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{device.totalEvents} events</span>
                    <span>•</span>
                    <span>{formatTimestamp(device.lastActivity)}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && device.recentActivities.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-2">
                    <span className="text-[10px] font-medium text-white/70">
                      Recent Activity
                    </span>
                    <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
                      {device.recentActivities.slice(0, 5).map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded bg-white/5 p-1.5 text-[10px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{EVENT_ICONS[activity.event] || '📌'}</span>
                            <span className="text-white/90">{activity.event}</span>
                            <span className="text-white/50">on</span>
                            <span className="truncate text-white/70">{activity.branch}</span>
                          </div>
                          <span className="text-white/50">{formatTimestamp(activity.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
