import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-transparent">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/logo.jpg" alt="Skill Intelligence Logo" className="w-12 h-12 object-contain rounded-lg shadow-sm" />
              <span className="text-2xl font-bold text-slate-900">Skill Intelligence</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-indigo-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-multiply"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
          alt="Students collaborating"
        />
        <div className="absolute inset-0 flex flex-col justify-center px-16 z-10">
          <h2 className="text-4xl font-bold text-white mb-4 max-w-xl leading-tight">
            Bridging the gap between Academia and Industry.
          </h2>
          <p className="text-lg text-indigo-200 max-w-lg">
            Empowering students with verified skills, connecting industries with top talent, and providing institutions with actionable intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};
