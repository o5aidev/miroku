import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { RelationNodeData } from '../../types';

interface Props {
  data: RelationNodeData;
}

export const RelationNode = memo(({ data }: Props) => {
  const getCardinalityColor = (cardinality: string) => {
    switch (cardinality) {
      case '1:1': return 'text-green-600';
      case '1:N': return 'text-blue-600';
      case 'N:M': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative" style={{ width: '180px', height: '100px' }}>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-pink-500 z-10"
      />

      {/* Diamond Shape for Relationship */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: 'rotate(45deg)',
          transformOrigin: 'center',
        }}
      >
        <div
          className="bg-pink-500 shadow-lg"
          style={{
            width: '120px',
            height: '120px',
            border: '3px solid #EC4899',
          }}
        />
      </div>

      {/* Content (not rotated) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <span className="text-2xl mb-1">{data.icon || '🔗'}</span>
        <div className="text-center px-4">
          <p className="text-sm font-bold text-white drop-shadow-md">
            {data.name}
          </p>
          {data.cardinality && (
            <p className={`text-xs font-semibold mt-1 drop-shadow ${getCardinalityColor(data.cardinality)}`}>
              {data.cardinality}
            </p>
          )}
        </div>
        {data.description && (
          <p className="text-xs text-white/90 drop-shadow text-center mt-1 px-2">
            {data.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-pink-500 z-10"
      />
    </div>
  );
});

RelationNode.displayName = 'RelationNode';
