import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Role } from '../../types/auth.types';
import { AlertCircle } from 'lucide-react';

const DEMO_CREDENTIALS: Record<Role, { email: string; pass: string; label: string }> = {
  student: {
    email: 'demo.student@sih.gov.in',
    pass: 'DemoPassword123!',
    label: 'Student',
  },
  industry: {
    email: 'demo.industry@sih.gov.in',
    pass: 'DemoPassword123!',
    label: 'Industry',
  },
  academician: {
    email: 'demo.academician@sih.gov.in',
    pass: 'DemoPassword123!',
    label: 'Faculty',
  },
  institution: {
    email: 'demo.institution@sih.gov.in',
    pass: 'DemoPassword123!',
    label: 'Institution',
  },
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<Role | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      // Navigate to previous intended destination if valid for this role, else role dashboard
      const from = (location.state as any)?.from?.pathname;
      const isAllowedForRole = from && from.startsWith(`/${loggedInUser.role}/`);
      if (isAllowedForRole && !from.includes('/login') && !from.includes('/register')) {
        navigate(from, { replace: true });
      } else {
        navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: Role) => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.pass);
    setError(null);
    setIsLoading(true);
    setActiveDemoRole(role);

    try {
      const loggedInUser = await login({
        email: creds.email,
        password: creds.pass,
      });

      // Always navigate directly to the respective demo role dashboard
      navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
    } catch (err: any) {
      setError(err.message || `Failed to login as demo ${role}. Verify backend server is running.`);
    } finally {
      setIsLoading(false);
      setActiveDemoRole(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
      <p className="text-slate-600 mb-6">Sign in to your Skill Intelligence account</p>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isLoading}
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading && !activeDemoRole}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Demo Login
          </p>
          <span className="text-xs text-slate-400">One-click evaluation</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            size="sm"
            isLoading={isLoading && activeDemoRole === 'student'}
            disabled={isLoading}
            onClick={() => handleDemoLogin('student')}
            variant="outline"
            className="text-xs justify-center hover:border-indigo-500 hover:text-indigo-600"
          >
            Demo Student
          </Button>
          <Button
            type="button"
            size="sm"
            isLoading={isLoading && activeDemoRole === 'industry'}
            disabled={isLoading}
            onClick={() => handleDemoLogin('industry')}
            variant="outline"
            className="text-xs justify-center hover:border-indigo-500 hover:text-indigo-600"
          >
            Demo Industry
          </Button>
          <Button
            type="button"
            size="sm"
            isLoading={isLoading && activeDemoRole === 'academician'}
            disabled={isLoading}
            onClick={() => handleDemoLogin('academician')}
            variant="outline"
            className="text-xs justify-center hover:border-indigo-500 hover:text-indigo-600"
          >
            Demo Faculty
          </Button>
          <Button
            type="button"
            size="sm"
            isLoading={isLoading && activeDemoRole === 'institution'}
            disabled={isLoading}
            onClick={() => handleDemoLogin('institution')}
            variant="outline"
            className="text-xs justify-center hover:border-indigo-500 hover:text-indigo-600"
          >
            Demo Institution
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/role-selection" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
