import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { EntityNodeData } from '../../types';

interface Props {
  data: EntityNodeData;
}

export const EntityNode = memo(({ data }: Props) => {
  return (
    <div className="min-w-[240px] rounded-lg border-2 border-indigo-600 bg-white shadow-lg overflow-hidden">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-600"
      />

      {/* Entity Header */}
      <div className="bg-indigo-600 px-4 py-2 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">{data.icon}</span>
          <h3 className="font-bold text-sm uppercase tracking-wide">
            {data.name}
          </h3>
        </div>
        {data.description && (
          <p className="text-xs text-indigo-100 mt-1">{data.description}</p>
        )}
      </div>

      {/* Attributes Section */}
      <div className="bg-white">
        {/* Primary Key */}
        {data.primaryKey && (
          <div className="border-b border-gray-200 px-4 py-2 bg-yellow-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-yellow-700">🔑</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.primaryKey.name}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {data.primaryKey.type}
              </span>
            </div>
          </div>
        )}

        {/* Attributes */}
        {data.attributes && data.attributes.length > 0 && (
          <div className="divide-y divide-gray-100">
            {data.attributes.map((attr, idx) => (
              <div key={idx} className="px-4 py-2 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {attr.required && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                    <span className="text-sm text-gray-700">{attr.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{attr.type}</span>
                    {attr.unique && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        unique
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {data.count !== undefined && (
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Records</span>
              <span className="font-semibold text-indigo-600">
                {data.count.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-600"
      />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
