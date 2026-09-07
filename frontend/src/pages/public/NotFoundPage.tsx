import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FileQuestion className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Error 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-4 mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The page or skill module you are looking for does not exist, was moved, or requires a different permission level.
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
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Home className="w-4 h-4" /> Home Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
