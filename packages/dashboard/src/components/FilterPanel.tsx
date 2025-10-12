import { useState } from 'react';
import { STATE_LABELS, AGENT_CONFIGS } from '../types';

export interface FilterOptions {
  states: string[];
  agents: string[];
  priorities: string[];
  showOnlyActive: boolean;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

const PRIORITY_OPTIONS = ['P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low'];

export function FilterPanel({ filters, onFilterChange, onClose }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const toggleState = (state: string) => {
    const newStates = localFilters.states.includes(state)
      ? localFilters.states.filter((s) => s !== state)
      : [...localFilters.states, state];
    setLocalFilters({ ...localFilters, states: newStates });
  };

  const toggleAgent = (agent: string) => {
    const newAgents = localFilters.agents.includes(agent)
      ? localFilters.agents.filter((a) => a !== agent)
      : [...localFilters.agents, agent];
    setLocalFilters({ ...localFilters, agents: newAgents });
  };

  const togglePriority = (priority: string) => {
    const newPriorities = localFilters.priorities.includes(priority)
      ? localFilters.priorities.filter((p) => p !== priority)
      : [...localFilters.priorities, priority];
    setLocalFilters({ ...localFilters, priorities: newPriorities });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      states: [],
      agents: [],
      priorities: [],
      showOnlyActive: false,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="absolute left-4 top-24 z-30 w-80 rounded-lg border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="text-sm font-semibold uppercase text-gray-700">Filters</h3>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close filters"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto p-4">
        {/* States */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">States</h4>
          <div className="space-y-1">
            {Object.entries(STATE_LABELS).map(([key, config]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded p-2 transition-colors hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={localFilters.states.includes(config.name)}
                  onChange={() => toggleState(config.name)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg">{config.emoji}</span>
                <span className="flex-1 text-sm text-gray-700">
                  {config.name.split(':')[1] || config.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Agents</h4>
          <div className="space-y-1">
            {Object.entries(AGENT_CONFIGS).map(([key, config]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 rounded p-2 transition-colors hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={localFilters.agents.includes(config.id)}
                  onChange={() => toggleAgent(config.id)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-lg">{config.emoji}</span>
                <span className="flex-1 text-sm text-gray-700">{config.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priorities */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Priority</h4>
          <div className="space-y-1">
            {PRIORITY_OPTIONS.map((priority) => (
              <label
                key={priority}
                className="flex cursor-pointer items-center gap-2 rounded p-2 transition-colors hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={localFilters.priorities.includes(priority)}
                  onChange={() => togglePriority(priority)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="flex-1 text-sm text-gray-700">{priority}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Show only active */}
        <div className="mb-4">
          <label className="flex cursor-pointer items-center gap-2 rounded bg-blue-50 p-3">
            <input
              type="checkbox"
              checked={localFilters.showOnlyActive}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, showOnlyActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="flex-1 text-sm font-medium text-blue-900">
              Show only active items
            </span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 border-t border-gray-200 p-4">
        <button
          onClick={handleReset}
          className="flex-1 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
