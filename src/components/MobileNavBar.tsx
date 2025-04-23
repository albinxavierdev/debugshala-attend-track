
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, CalendarDays, Users, BookOpen, ClipboardCheck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const MobileNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'Batches', path: '/batches', icon: <CalendarDays className="mr-2 h-4 w-4" /> },
    { name: 'Students', path: '/students', icon: <Users className="mr-2 h-4 w-4" /> },
    { name: 'Topics', path: '/topics', icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck className="mr-2 h-4 w-4" /> },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-debugshala-600 flex items-center justify-center text-white font-bold">
            D
          </div>
          <h1 className="text-xl font-bold text-gray-900">Debugshala</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-white z-50">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-md",
                  location.pathname === item.path
                    ? "bg-debugshala-50 text-debugshala-600"
                    : "text-gray-700 hover:text-debugshala-600 hover:bg-gray-50"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
