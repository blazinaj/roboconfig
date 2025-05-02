import React, { ReactNode } from 'react';
import Footer from './Footer';
import SideNav from './SideNav';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex">
        <SideNav />
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;