import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Bell, LayoutDashboard, PlusCircle, Users, ClipboardList, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const IndustryLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/industry/dashboard', icon: LayoutDashboard },
    { name: 'Post Opportunity', href: '/industry/post-opportunity', icon: PlusCircle },
    { name: 'Talent Discovery', href: '/industry/candidates', icon: Users },
    { name: 'Applications', href: '/industry/applications', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <header className="h-16 bg-indigo-900 text-white border-b border-indigo-800 flex items-center justify-between px-4 sm:px-6 z-20">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg" />
            Skill Intelligence
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="flex items-center gap-3 pl-4 border-l border-indigo-800">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-indigo-300 mt-1">Recruiter</p>
            </div>
            <Avatar fallback={user?.name} className="bg-indigo-700 text-white" />
            <Button variant="ghost" size="icon" className="text-indigo-200 hover:text-white hover:bg-indigo-800" onClick={logout}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-transparent">
        <Outlet />
      </main>
    </div>
  );
};
