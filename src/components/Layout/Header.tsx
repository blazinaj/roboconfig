import React from 'react';
import { Settings, HelpCircle, Database } from 'lucide-react';
import { useSampleData } from '../../context/SampleDataContext';
import { UserMenu } from './UserMenu';

const Header: React.FC = () => {
  const { isSampleData, toggleSampleData } = useSampleData();

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-300 rounded-sm animate-pulse"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">RoboConfig</h1>
          <span className="hidden md:inline-block text-blue-300 text-sm font-mono ml-2">v1.0</span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-blue-200 transition-colors">Dashboard</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Components</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Risk Assessment</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Projects</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Documentation</a>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSampleData}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
              isSampleData 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-800 text-blue-200'
            }`}
          >
            <Database size={16} />
            <span className="hidden sm:inline">Sample Data</span>
          </button>
          <button className="text-blue-200 hover:text-white transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="text-blue-200 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;