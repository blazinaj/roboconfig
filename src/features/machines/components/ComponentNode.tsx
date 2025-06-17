import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Cog, 
  Cpu, 
  Battery, 
  MessageSquare, 
  Code, 
  Hand, 
  Eye, 
  Package,
  Settings,
  Notebook
} from 'lucide-react';

interface ComponentNodeData {
  label: string;
  category: string;
  details: string;
  icon?: string;
  specifications?: [string, string | number][];
}

const ComponentNode: React.FC<NodeProps<ComponentNodeData>> = ({ data }) => {
  const getIcon = () => {
    switch (data.icon) {
      case 'Drive':
        return <Cog size={18} className="mb-1" />;
      case 'Controller':
        return <Cpu size={18} className="mb-1" />;
      case 'Power':
        return <Battery size={18} className="mb-1" />;
      case 'Communication':
        return <MessageSquare size={18} className="mb-1" />;
      case 'Software':
        return <Code size={18} className="mb-1" />;
      case 'Object Manipulation':
        return <Hand size={18} className="mb-1" />;
      case 'Sensors':
        return <Eye size={18} className="mb-1" />;
      case 'Chassis':
        return <Package size={18} className="mb-1" />;
      case 'machine':
        return <Notebook size={18} className="mb-1" />;
      default:
        return <Settings size={18} className="mb-1" />;
    }
  };

  return (
    <div className="font-sans relative">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-gray-200 !border-gray-400 !w-3 !h-3"
      />
      
      <div className="flex flex-col items-center">
        {getIcon()}
        <div className="font-medium text-sm text-center mb-1">{data.label}</div>
        
        <div className="text-xs opacity-90 text-center">
          {data.category !== 'machine' ? data.category : data.details}
        </div>
        
        {data.specifications && data.specifications.length > 0 && (
          <div className="mt-2 text-xs w-full">
            {data.specifications.map(([key, value], index) => (
              <div key={index} className="opacity-90 flex justify-between overflow-hidden px-2">
                <span className="font-medium">{key}:</span>
                <span className="truncate ml-1">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-gray-200 !border-gray-400 !w-3 !h-3"
      />
    </div>
  );
};

export default memo(ComponentNode);