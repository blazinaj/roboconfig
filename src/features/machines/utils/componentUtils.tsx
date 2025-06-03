import React from 'react';
import { Cog, Cpu, Battery, MessageSquare, Code, Hand, Eye, Package, Settings } from 'lucide-react';

export const getComponentIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'drive':
      return <Cog className="text-blue-600" size={20} />;
    case 'controller':
      return <Cpu className="text-purple-600" size={20} />;
    case 'power':
      return <Battery className="text-green-600" size={20} />;
    case 'communication':
      return <MessageSquare className="text-orange-600" size={20} />;
    case 'software':
      return <Code className="text-indigo-600" size={20} />;
    case 'object manipulation':
      return <Hand className="text-red-600" size={20} />;
    case 'sensors':
      return <Eye className="text-teal-600" size={20} />;
    case 'chassis':
      return <Package className="text-gray-600" size={20} />;
    default:
      return <Settings className="text-gray-600" size={20} />;
  }
};