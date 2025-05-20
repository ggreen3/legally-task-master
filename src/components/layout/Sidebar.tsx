
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  Calendar, 
  Users, 
  Check 
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-legally-700 text-white" 
          : "text-legally-300 hover:text-white hover:bg-legally-800"
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </Link>
  );
};

interface SidebarProps {
  onNavItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <div className={`${isMobile ? 'w-64' : 'w-64'} bg-legally-900 h-full p-4 flex flex-col`}>
      <div className="space-y-1">
        <SidebarItem 
          to="/dashboard" 
          icon={<Briefcase className="h-5 w-5" />} 
          label="Dashboard" 
          active={isActive('/dashboard')} 
          onClick={onNavItemClick}
        />
        <SidebarItem 
          to="/assignments" 
          icon={<Calendar className="h-5 w-5" />} 
          label="Assignments" 
          active={isActive('/assignments')} 
          onClick={onNavItemClick}
        />
        <SidebarItem 
          to="/employees" 
          icon={<Users className="h-5 w-5" />} 
          label="Team Members" 
          active={isActive('/employees')} 
          onClick={onNavItemClick}
        />
        <SidebarItem 
          to="/tasks" 
          icon={<Check className="h-5 w-5" />} 
          label="Task Tracker" 
          active={isActive('/tasks')} 
          onClick={onNavItemClick}
        />
      </div>
    </div>
  );
};

export default Sidebar;
