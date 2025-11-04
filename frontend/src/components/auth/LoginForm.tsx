import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Shield, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import toast from 'react-hot-toast';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from state (set by ProtectedRoute)
  const from = location.state?.from || '/dashboard';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    if (!email.trim()) {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    if (!password.trim()) {
      newErrors.password = ['Password is required'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getFieldError = (fieldName: string): string => {
    return errors[fieldName]?.[0] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submission triggered', { email, password }); // Debug
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    // Client-side validation
    console.log('Validating form with email:', email, 'password:', password); // Debug
    const isValid = validateForm();
    console.log('Validation result:', isValid, 'errors set:', errors); // Debug
    if (!isValid) {
      console.log('Validation failed, errors should be set'); // Debug
      setLoading(false);
      return;
    }

    try {
      await login({ email, password });
      toast.success('Welcome back!');
      
      // Redirect to intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      // Handle error with simplified error handling for frontend-only mode
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        setGeneralError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Handle unexpected errors
        const errorMessage = 'An unexpected error occurred. Please try again.';
        setGeneralError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl transform hover:scale-105 transition-transform duration-200">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to your MentorConnect account
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300">
          <CardContent className="p-6">
            {/* Error Message */}
            {generalError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                    {generalError}
                  </span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-4">
                <div>
                  <Input
                    type="email"
                    label="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    placeholder="Enter your email address"
                    required
                    error={getFieldError('email')}
                    inputSize="md"
                    className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400"
                    fullWidth
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder="Enter your password"
                    required
                    error={getFieldError('password')}
                    data-testid="login-password-input"
                    inputSize="md"
                    className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400"
                    showPasswordToggle={true}
                    fullWidth
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded transition-colors bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
                  loading={loading}
                  size="md"
                  leftIcon={!loading ? <LogIn className="w-4 h-4" /> : undefined}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyboard Shortcut Hint - Bottom Left */}
      <div className="fixed bottom-4 left-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          <kbd className="font-mono">Ctrl+Shift+D</kbd> to toggle theme
        </div>
      </div>
    </div>
  );
};