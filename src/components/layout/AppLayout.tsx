
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const AppLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          <>
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleSidebar}
              />
            )}
            <div 
              className={`fixed top-16 left-0 bottom-0 z-50 transition-transform duration-300 ease-in-out transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <Sidebar onNavItemClick={() => setSidebarOpen(false)} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="fixed bottom-4 left-4 z-50 bg-legally-800 text-white rounded-full shadow-lg"
              onClick={toggleSidebar}
            >
              <Menu />
            </Button>
          </>
        ) : (
          <Sidebar />
        )}
        <main className={`flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 ${isMobile ? 'w-full' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
