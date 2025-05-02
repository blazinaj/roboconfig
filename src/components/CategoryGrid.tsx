import React from 'react';
import { ComponentCategory } from '../types';
import { 
  Cog, 
  Cpu, 
  Battery, 
  MessageSquare, 
  Code, 
  Hand, 
  Eye, 
  Package 
} from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory: (category: ComponentCategory) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const categories: { 
    id: ComponentCategory; 
    name: string; 
    icon: React.ReactNode; 
    color: string;
    subComponents: string[];
  }[] = [
    { 
      id: 'Drive', 
      name: 'Drive', 
      icon: <Cog />, 
      color: 'from-green-500 to-green-600',
      subComponents: ['servos', 'actuators', 'belts', 'wheels', 'tracks', 'motors']
    },
    { 
      id: 'Controller', 
      name: 'Controller', 
      icon: <Cpu />, 
      color: 'from-blue-500 to-blue-600',
      subComponents: ['ECU', 'Serial BUS']
    },
    { 
      id: 'Power', 
      name: 'Power', 
      icon: <Battery />, 
      color: 'from-yellow-500 to-yellow-600',
      subComponents: ['batteries', 'charge systems', 'voltage', 'wattage', 'amperage']
    },
    { 
      id: 'Communication', 
      name: 'Communication', 
      icon: <MessageSquare />, 
      color: 'from-purple-500 to-purple-600',
      subComponents: ['Microphones', 'Speakers', 'Displays']
    },
    { 
      id: 'Software', 
      name: 'Software', 
      icon: <Code />, 
      color: 'from-cyan-500 to-cyan-600',
      subComponents: ['hardware control', 'sensor input', 'error correction', 'user input', 'command evaluation', 'safety mechanisms', 'Networking']
    },
    { 
      id: 'Object Manipulation', 
      name: 'Object Manipulation', 
      icon: <Hand />, 
      color: 'from-red-500 to-red-600',
      subComponents: ['hands', 'arms', 'grabbers', 'suction', 'blades']
    },
    { 
      id: 'Sensors', 
      name: 'Sensors', 
      icon: <Eye />, 
      color: 'from-indigo-500 to-indigo-600',
      subComponents: ['Limit Switches', 'Vision', 'Pressure']
    },
    { 
      id: 'Chassis', 
      name: 'Chassis', 
      icon: <Package />, 
      color: 'from-orange-500 to-orange-600',
      subComponents: ['Frames', 'Joints', 'Mounts', 'Springs']
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div 
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`text-gray-700 p-2 rounded-full bg-gray-100 group-hover:text-${category.color.split(' ')[0].replace('from-', '')}`}>
                {category.icon}
              </div>
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
            </div>
            
            <ul className="text-sm text-gray-600 space-y-1 ml-2">
              {category.subComponents.map((subComponent, index) => (
                <li key={index} className="list-disc list-inside">{subComponent}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;