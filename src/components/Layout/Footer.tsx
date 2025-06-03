import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 RoboConfig. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-8">
            <div>
              <h4 className="text-white text-sm font-semibold mb-2">Resources</h4>
              <ul className="text-xs space-y-1">
                <li><a href="#" className="hover:text-blue-300 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Safety Standards</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white text-sm font-semibold mb-2">Company</h4>
              <ul className="text-xs space-y-1">
                <li><a href="#" className="hover:text-blue-300 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-300 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;