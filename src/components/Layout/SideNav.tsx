import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Cog, Cpu, Battery, MessageSquare, Code, Hand, Eye, Package, 
  FileText, Home, Settings, Notebook as Robot,
  HelpCircle, Bell, Menu, X, Building
} from 'lucide-react';
import { OrganizationSelector } from './OrganizationSelector';
import { UserMenu } from './UserMenu';

const SideNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getLinkClass = (isActive: boolean) => {
    return `flex items-center w-full py-2 px-2 rounded-md transition-colors ${
      isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-white'
    }`;
  };

  const componentTypes = [
    { 
      icon: <Cog size={20} />, 
      label: 'Drive', 
      color: 'text-green-400', 
      path: '/components/drive' 
    },
    { 
      icon: <Cpu size={20} />, 
      label: 'Controller', 
      color: 'text-blue-400', 
      path: '/components/controller' 
    },
    { 
      icon: <Battery size={20} />, 
      label: 'Power', 
      color: 'text-yellow-400', 
      path: '/components/power' 
    },
    { 
      icon: <MessageSquare size={20} />, 
      label: 'Communication', 
      color: 'text-purple-400', 
      path: '/components/communication' 
    },
    { 
      icon: <Code size={20} />, 
      label: 'Software', 
      color: 'text-cyan-400', 
      path: '/components/software' 
    },
    { 
      icon: <Hand size={20} />, 
      label: 'Manipulation', 
      color: 'text-red-400', 
      path: '/components/manipulation' 
    },
    { 
      icon: <Eye size={20} />, 
      label: 'Sensors', 
      color: 'text-indigo-400', 
      path: '/components/sensors' 
    },
    { 
      icon: <Package size={20} />, 
      label: 'Chassis', 
      color: 'text-orange-400', 
      path: '/components/chassis' 
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-900 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`fixed md:fixed w-64 bg-gray-900 text-white h-screen z-40 transform transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Logo and App Title */}
          <div className="px-4 py-6">
            <Link to="/dashboard" className="flex items-center">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-300 rounded-sm animate-pulse"></div>
              </div>
              <h1 className="text-xl font-bold tracking-tight ml-2">RoboConfig</h1>
              <span className="text-blue-300 text-sm font-mono ml-2">v1.0</span>
            </Link>
          </div>
          
          {/* User Profile */}
          <div className="px-4 mb-6">
            <UserMenu />
          </div>
          
          {/* Organization Selector */}
          <div className="px-4 mb-4">
            <OrganizationSelector />
          </div>
          
          <div className="px-4 mb-6">
            <NavLink 
              to="/dashboard"
              className={({ isActive }) => getLinkClass(isActive)}
              onClick={() => setIsOpen(false)}
            >
              <Home size={20} className="flex-shrink-0" />
              <span className="ml-2">Dashboard</span>
            </NavLink>
          </div>
          
          <div className="px-4 py-2">
            <h3 className="text-xs uppercase text-gray-500 font-semibold">Machines</h3>
          </div>
          
          <div className="space-y-1 px-3">
            <NavLink 
              to="/machines"
              className={({ isActive }) => getLinkClass(isActive)}
              onClick={() => setIsOpen(false)}
            >
              <span className="flex-shrink-0 text-purple-400"><Robot size={20} /></span>
              <span className="ml-2 text-sm">Manage Machines</span>
            </NavLink>
          </div>
          
          <div className="px-4 py-2">
            <h3 className="text-xs uppercase text-gray-500 font-semibold">Components</h3>
          </div>
          
          <div className="space-y-1 px-3">
            {componentTypes.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => getLinkClass(isActive)}
                onClick={() => setIsOpen(false)}
              >
                <span className={`flex-shrink-0 ${item.color}`}>{item.icon}</span>
                <span className="ml-2 text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="px-4 py-2 mt-6">
            <h3 className="text-xs uppercase text-gray-500 font-semibold">Tools</h3>
          </div>
          
          <div className="space-y-1 px-3">
            <NavLink
              to="/reports"
              className={({ isActive }) => getLinkClass(isActive)}
              onClick={() => setIsOpen(false)}
            >
              <FileText size={20} className="flex-shrink-0 text-blue-400" />
              <span className="ml-2 text-sm">Reports</span>
            </NavLink>
            <NavLink
              to="/organizations"
              className={({ isActive }) => getLinkClass(isActive)}
              onClick={() => setIsOpen(false)}
            >
              <Building size={20} className="flex-shrink-0 text-purple-400" />
              <span className="ml-2 text-sm">Organizations</span>
            </NavLink>
            <NavLink
              to="/configuration"
              className={({ isActive }) => getLinkClass(isActive)}
              onClick={() => setIsOpen(false)}
            >
              <Settings size={20} className="flex-shrink-0 text-gray-400" />
              <span className="ml-2 text-sm">Configuration</span>
            </NavLink>
          </div>
          
          <div className="mt-auto px-4 py-6 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>© 2025 RoboConfig</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SideNav;