
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CalendarDays, Users, BookOpen, ClipboardCheck, Home } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="mr-2 h-4 w-4" /> },
    { name: 'Batches', path: '/batches', icon: <CalendarDays className="mr-2 h-4 w-4" /> },
    { name: 'Students', path: '/students', icon: <Users className="mr-2 h-4 w-4" /> },
    { name: 'Topics', path: '/topics', icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="hidden md:flex flex-col bg-white border-r border-gray-200 w-64 p-4">
      <div className="flex items-center mb-8 px-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-debugshala-600 flex items-center justify-center text-white font-bold">
            D
          </div>
          <h1 className="text-xl font-bold text-gray-900">Debugshala</h1>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
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
  );
};
