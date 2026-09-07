import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-indigo-100 selection:text-indigo-900 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>
      
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center w-full px-4">
        <div className="bg-white/80 backdrop-blur-lg shadow-xl shadow-indigo-900/5 border border-white/60 rounded-full px-4 sm:px-8 h-16 flex items-center justify-between w-full max-w-5xl transition-all">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Skill Intelligence Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-lg shadow-sm" />
            <Link to="/" className="text-lg sm:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-slate-800">Skill Intelligence</Link>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/opportunities" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-4 py-2 rounded-full transition-all">Opportunities</Link>
            <Link to="/about" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-4 py-2 rounded-full transition-all">About</Link>
            <Link to="/contact" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-4 py-2 rounded-full transition-all">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full px-4 font-semibold hover:bg-slate-100/50">Log in</Button>
            </Link>
            <Link to="/role-selection">
              <Button size="sm" className="rounded-full shadow-indigo-500/30 font-semibold px-6 hover:scale-105 transition-transform">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative z-10 pt-24">
        <Outlet />
      </main>
      
      <footer className="bg-slate-950 text-slate-400 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <img src="/logo.jpg" alt="Skill Intelligence Logo" className="w-6 h-6 object-contain rounded grayscale opacity-50" />
             <span className="font-semibold text-slate-300">Skill Intelligence</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Skill Intelligence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
