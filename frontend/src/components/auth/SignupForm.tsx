import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Key, Info, GraduationCap, Users, Shield, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Role } from '../../types';
import toast from 'react-hot-toast';

export const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    requestedRole: Role.MENTEE,
    inviteCode: '',
    bio: '',
    skills: '',
    experience: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [registrationStep, setRegistrationStep] = useState<'form' | 'pending' | 'success'>('form');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string[]> = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = ['Password is required'];
    } else if (formData.password.length < 8) {
      newErrors.password = ['Password must be at least 8 characters long'];
    }

    // Password confirmation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ['Passwords do not match'];
    } else if (!formData.confirmPassword) {
      newErrors.confirmPassword = ['Confirm password is required'];
    }

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = ['First name is required'];
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = ['Last name is required'];
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = ['Email is required'];
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address'];
    }

    // Invite code validation for mentor/admin roles
    if ((formData.requestedRole === Role.MENTOR || formData.requestedRole === Role.ADMIN) && !formData.inviteCode) {
      newErrors.inviteCode = [`Invite code is required for ${formData.requestedRole.toLowerCase()} registration`];
    }

    // Role validation
    if (!formData.requestedRole) {
      newErrors.requestedRole = ['Please select a role'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    // Client-side validation
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        requestedRole: formData.requestedRole,
        inviteCode: formData.inviteCode || undefined,
        bio: formData.bio || undefined,
        skills: formData.skills || undefined,
        experience: formData.experience || undefined
      };

      const result = await register(registrationData);
      
      if (result.requiresApproval) {
        setRegistrationStep('pending');
        toast.success('Registration submitted! Your account is pending approval.');
      } else {
        setRegistrationStep('success');
        toast.success('Account created successfully! Welcome to MentorConnect!');
        // Redirect to dashboard after successful registration
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Handle error with simplified error handling for frontend-only mode
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message;
        setGeneralError(errorMessage);
        toast.error(errorMessage);
      } else {
        // Handle unexpected errors
        const errorMessage = 'Failed to create account. Please try again.';
        setGeneralError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string => {
    return errors[fieldName]?.[0] || '';
  };

  const roleOptions = [
    { 
      value: Role.MENTEE, 
      label: 'Mentee', 
      description: 'Looking for guidance and mentorship',
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      selectedGradient: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-900 dark:text-emerald-100'
    },
    { 
      value: Role.MENTOR, 
      label: 'Mentor', 
      description: 'Ready to guide and support others',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      selectedGradient: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-900 dark:text-blue-100',
      requiresCode: true
    },
    { 
      value: Role.ADMIN, 
      label: 'Administrator', 
      description: 'Platform management and oversight',
      icon: Shield,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      selectedGradient: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-900 dark:text-purple-100',
      requiresCode: true
    },
  ];

  // Show pending approval screen
  if (registrationStep === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-lg w-full">
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-2 sm:mb-3 shadow-lg">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Registration Submitted
                </h2>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Your account is pending approval by an administrator
                </p>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  We'll review your application and notify you via email once your account has been approved.
                  This process typically takes 1-2 business days.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full py-2 sm:py-2.5 px-6 border border-transparent rounded-lg shadow-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Keyboard Shortcut Hint - Bottom Left - Hidden on Mobile */}
        <div className="fixed bottom-4 left-4 hidden sm:block">
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            <kbd className="font-mono">Ctrl+Shift+D</kbd> to toggle theme
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-lg w-full">
        {/* Header Section */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
            Join MentorConnect
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Create your account and start your mentorship journey
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5">
            {/* General error message */}
            {generalError && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-xs text-red-700 dark:text-red-400 font-medium">
                    {generalError}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="text"
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="First name"
                  required
                  error={getFieldError('firstName')}
                  inputSize="md"
                  className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400 text-sm sm:text-base"
                  fullWidth
                />
                <Input
                  type="text"
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  leftIcon={<User className="w-4 h-4" />}
                  placeholder="Last name"
                  required
                  error={getFieldError('lastName')}
                  inputSize="md"
                  className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400 text-sm sm:text-base"
                  fullWidth
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="Enter your email address"
                required
                error={getFieldError('email')}
                inputSize="md"
                className="transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400"
                fullWidth
              />

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose your role
                </label>
                <div className="space-y-2">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.requestedRole === role.value;
                    return (
                      <div
                        key={role.value}
                        onClick={() => setFormData(prev => ({ ...prev, requestedRole: role.value }))}
                        className={`group relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 ${
                          isSelected 
                            ? `${role.borderColor} bg-gradient-to-r ${role.selectedGradient} shadow-md` 
                            : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600`
                        }`}
                      >
                        {/* Gradient overlay when selected */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/95 dark:from-gray-800/90 dark:to-gray-800/95 rounded-lg"></div>
                        )}
                        
                        <div className="relative flex items-center gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? `bg-gradient-to-br ${role.gradient} shadow-md` 
                              : `${role.iconBg}`
                          }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : role.iconColor}`} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className={`text-xs font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : role.textColor}`}>
                                {role.label}
                              </h3>
                              {role.requiresCode && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  isSelected 
                                    ? 'bg-amber-500 text-white' 
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                  <Key className="w-2.5 h-2.5 mr-0.5" />
                                  Invite Required
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] ${
                              isSelected 
                                ? 'text-gray-600 dark:text-gray-300' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {role.description}
                            </p>
                          </div>
                          
                          {/* Selection indicator */}
                          <div className="flex-shrink-0">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              isSelected 
                                ? `bg-gradient-to-br ${role.gradient} border-transparent` 
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                            }`}>
                              {isSelected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {getFieldError('requestedRole') && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {getFieldError('requestedRole')}
                  </p>
                )}
              </div>

              {(formData.requestedRole === Role.MENTOR || formData.requestedRole === Role.ADMIN) && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start mb-2">
                    <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-0.5">
                        Invite Code Required
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                        {formData.requestedRole === Role.MENTOR 
                          ? 'Mentor invite codes are provided by administrators to qualified candidates.'
                          : 'Admin invite codes are provided by existing administrators only.'
                        }
                      </p>
                    </div>
                  </div>
                  <Input
                    type="text"
                    name="inviteCode"
                    label="Invite Code"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    leftIcon={<Key className="w-4 h-4" />}
                    placeholder={`Enter your ${formData.requestedRole.toLowerCase()} invite code`}
                    required
                    error={getFieldError('inviteCode')}
                    className="bg-white dark:bg-gray-800"
                    inputSize="md"
                    fullWidth
                  />
                </div>
              )}

              {formData.requestedRole === Role.MENTEE && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-0.5">
                        Mentee Application Process
                      </h4>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                        As a mentee, your application will be reviewed by our administrators to ensure we can provide you with the best possible mentoring experience. This typically takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder="Min. 8 characters"
                    required
                    error={getFieldError('password')}
                    data-testid="signup-password-input"
                    className="pr-10 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400"
                    inputSize="md"
                    fullWidth
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    data-testid="signup-password-toggle"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    leftIcon={<Lock className="w-4 h-4" />}
                    placeholder="Re-enter password"
                    required
                    error={getFieldError('confirmPassword')}
                    data-testid="signup-confirm-password-input"
                    className="pr-10 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 dark:hover:border-blue-500 dark:focus:border-blue-400"
                    inputSize="md"
                    fullWidth
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 top-5 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                    data-testid="signup-confirm-password-toggle"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded mt-0.5 bg-white dark:bg-gray-700"
                  />
                  <label htmlFor="terms" className="ml-2 block text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link
                      to="/privacy"
                      className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
                loading={loading}
                size="md"
                leftIcon={!loading ? <UserPlus className="w-4 h-4" /> : undefined}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyboard Shortcut Hint - Bottom Left - Hidden on Mobile */}
      <div className="fixed bottom-4 left-4 hidden sm:block">
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
          <kbd className="font-mono">Ctrl+Shift+D</kbd> to toggle theme
        </div>
      </div>
    </div>
  );
};