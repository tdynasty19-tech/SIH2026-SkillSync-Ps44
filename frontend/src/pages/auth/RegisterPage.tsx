import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Role } from '../../types/auth.types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { role = 'student' } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Role-specific display name
  const getRoleTitle = () => {
    switch (role.toLowerCase()) {
      case 'student':
        return 'Student Registration';
      case 'industry':
        return 'Industry / Company Registration';
      case 'academician':
        return 'Faculty Registration';
      case 'institution':
        return 'Institution Registration';
      default:
        return 'Create Account';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide both first and last name.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Please provide a valid email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const validRole = (['student', 'industry', 'academician', 'institution'].includes(role.toLowerCase())
        ? role.toLowerCase()
        : 'student') as Role;

      // 1. Call real backend registration
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: validRole,
        phone: phone.trim() || undefined,
      });

      setSuccessMessage('Registration successful! Logging you in...');

      // 2. Perform automatic login to obtain session tokens
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      // 3. Navigate to appropriate dashboard
      setTimeout(() => {
        navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{getRoleTitle()}</h2>
        <p className="text-slate-500 mt-1 text-sm">Fill in your details to create your account.</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-700 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
          <span className="leading-snug">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            required
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Rahul"
            disabled={isLoading}
          />
          <Input
            label="Last Name"
            required
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Sharma"
            disabled={isLoading}
          />
        </div>

        <Input
          label="Email Address"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Password (min. 6 characters)"
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Complete Registration
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <Link to="/role-selection" className="hover:text-indigo-600 transition-colors">
          &larr; Change Role
        </Link>
        <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Already have an account?
        </Link>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
