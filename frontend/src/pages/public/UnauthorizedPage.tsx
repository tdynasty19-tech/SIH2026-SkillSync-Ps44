import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDashboardRedirect = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const roleRoutes: Record<string, string> = {
      student: '/student/dashboard',
      industry: '/industry/dashboard',
      academician: '/academician/dashboard',
      institution: '/institution/dashboard',
    };
    const target = roleRoutes[user.role?.toLowerCase()] || '/';
    navigate(target);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-rose-100 shadow-sm">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          Access Restricted (403)
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Your account role does not have permission to view this resource. Switch to an authorized account or return to your designated portal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button
            onClick={handleDashboardRedirect}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {user ? 'My Dashboard' : 'Login'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
