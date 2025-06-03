import React, { ReactNode } from 'react';
import SideNav from './SideNav';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <SideNav />
        <main className="flex-1 p-4 md:p-6 md:ml-64 bg-gray-50">
          <div className="max-w-6xl mx-auto pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;