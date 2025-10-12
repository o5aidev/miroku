import { useMemo } from 'react';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';

export interface ActivityLogEntry {
  id: string;
  type:
    | 'agent:started'
    | 'agent:progress'
    | 'agent:completed'
    | 'agent:error'
    | 'state:transition'
    | 'graph:update'
    | 'task:discovered'
    | 'coordinator:analyzing'
    | 'coordinator:decomposing'
    | 'coordinator:assigning';
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface ActivityLogProps {
  activities: ActivityLogEntry[];
  maxItems?: number;
}

export function ActivityLog({ activities, maxItems = 50 }: ActivityLogProps) {
  const { prefersReducedMotion, prefersHighContrast } = useAccessibilityPreferences();
  const recentActivities = useMemo(() => {
    return activities.slice(0, maxItems);
  }, [activities, maxItems]);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) return `${seconds}s ago`;
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className={`glass-effect-dark border-t ${prefersHighContrast ? 'border-white/20' : 'border-white/10'}`}>
      <div className={`border-b ${prefersHighContrast ? 'border-white/20' : 'border-white/10'} px-6 py-3 backdrop-blur-xl`}>
        <div className="flex items-center justify-between">
          <h3
            className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${
              prefersHighContrast
                ? 'text-slate-100'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400'
            }`}
            style={
              prefersHighContrast
                ? undefined
                : { backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)' }
            }
          >
            <span className="text-xl">📊</span>
            <span>Activity Log</span>
          </h3>
          <span
            className={`glass-effect px-3 py-1 text-xs font-black rounded-full ${
              prefersHighContrast ? 'text-slate-100' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'
            }`}
            style={
              prefersHighContrast
                ? undefined
                : { backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)' }
            }
          >
            {recentActivities.length} Events
          </span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {recentActivities.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-5xl mb-3">💤</div>
            <p className="text-sm font-semibold text-gray-400">No activity yet</p>
            <p className="text-xs text-gray-500 mt-1">Waiting for events...</p>
          </div>
        ) : (
          <div className={`divide-y ${prefersHighContrast ? 'divide-white/20' : 'divide-white/5'}`}>
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="group flex items-start gap-4 px-6 py-4 transition-all duration-300 hover:bg-white/5 relative"
                style={
                  prefersReducedMotion
                    ? undefined
                    : {
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }
                }
              >
                {/* Icon */}
                <div
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${activity.color}, ${activity.color}dd)`,
                    boxShadow: `0 0 20px ${activity.color}40`,
                  }}
                >
                  {activity.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-relaxed break-words">
                    {activity.message}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-400">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 10% 50%, ${activity.color}10, transparent 70%)`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
