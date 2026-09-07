import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Bell, Menu, LayoutDashboard, BookOpen, GraduationCap, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export const AcademicianLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/academician/dashboard', icon: LayoutDashboard },
    { name: 'Faculty Internships', href: '/academician/internships', icon: GraduationCap },
    { name: 'Research Collab', href: '/academician/research', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 transition-all duration-300">
        <div className="h-16 flex items-center px-6 bg-slate-950">
          <Link to="/" className="text-xl font-bold text-white flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg" />
            Skill Intelligence
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar fallback={user?.name} className="bg-slate-700 text-white" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">Faculty</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800" onClick={logout}>
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Portal'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
