import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, HelpCircle, Menu, X } from 'lucide-react';
import { UserMenu } from './UserMenu';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-300 rounded-sm animate-pulse"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight ml-2">RoboConfig</h1>
          </Link>
          <span className="hidden md:inline-block text-blue-300 text-sm font-mono ml-2">v1.0</span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
          <Link to="/components" className="hover:text-blue-200 transition-colors">Components</Link>
          <Link to="/machines" className="hover:text-blue-200 transition-colors">Machines</Link>
          <Link to="/reports" className="hover:text-blue-200 transition-colors">Reports</Link>
          <Link to="/organizations" className="hover:text-blue-200 transition-colors">Organizations</Link>
        </nav>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-blue-800 shadow-lg md:hidden">
            <div className="flex flex-col px-4 py-2">
              <Link 
                to="/dashboard" 
                className="py-2 hover:text-blue-200 border-b border-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/components" 
                className="py-2 hover:text-blue-200 border-b border-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Components
              </Link>
              <Link 
                to="/machines" 
                className="py-2 hover:text-blue-200 border-b border-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Machines
              </Link>
              <Link 
                to="/reports" 
                className="py-2 hover:text-blue-200 border-b border-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/organizations" 
                className="py-2 hover:text-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Organizations
              </Link>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden text-blue-200 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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