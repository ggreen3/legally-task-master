
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="bg-legally-950 text-white py-4 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="font-bold text-xl sm:text-2xl text-white">
            Leg<span className="text-legally-300">Ally</span> 
            <span className={`text-legally-400 font-normal ml-1 ${isMobile ? 'text-base' : 'text-xl sm:ml-2'}`}>Workload</span>
          </div>
        </Link>
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/dashboard" className="text-white hover:text-legally-300 transition-colors">Dashboard</Link>
        <Link to="/assignments" className="text-white hover:text-legally-300 transition-colors">Assignments</Link>
        <Link to="/employees" className="text-white hover:text-legally-300 transition-colors">Team</Link>
      </nav>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
