
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Calendar, 
  Users, 
  Check 
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-legally-700 text-white" 
          : "text-legally-300 hover:text-white hover:bg-legally-800"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <div className="w-64 bg-legally-900 h-[calc(100vh-64px)] p-4 flex flex-col">
      <div className="space-y-1">
        <SidebarItem 
          to="/dashboard" 
          icon={<Briefcase className="h-5 w-5" />} 
          label="Dashboard" 
          active={isActive('/dashboard')} 
        />
        <SidebarItem 
          to="/assignments" 
          icon={<Calendar className="h-5 w-5" />} 
          label="Assignments" 
          active={isActive('/assignments')} 
        />
        <SidebarItem 
          to="/employees" 
          icon={<Users className="h-5 w-5" />} 
          label="Team Members" 
          active={isActive('/employees')} 
        />
        <SidebarItem 
          to="/tasks" 
          icon={<Check className="h-5 w-5" />} 
          label="Task Tracker" 
          active={isActive('/tasks')} 
        />
      </div>
    </div>
  );
};

export default Sidebar;
