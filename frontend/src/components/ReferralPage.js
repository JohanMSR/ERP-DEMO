import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  SparklesIcon, 
  UserIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  GiftIcon,
  StarIcon,
  HeartIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useAuth } from '../contexts/AuthContext';
import { CenteredLoaderSkeleton } from './ui/PageSkeleton';

function ReferralPage() {
  const { linkCode } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referrer, setReferrer] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const trackReferralClick = useCallback(async () => {
    try {
      const response = await axios.get(`/api/referral/${linkCode}`);
      setReferrer(response.data.referrer);
      
      // Store the referral link code in localStorage for later use during registration
      localStorage.setItem('referralLinkCode', linkCode);
    } catch (error) {
      toast.error('Invalid referral link');
    } finally {
      setLoading(false);
    }
  }, [linkCode]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setRegistering(true);

    try {
      // Store referral link code before registration
      localStorage.setItem('referralLinkCode', linkCode);
      
      const result = await register(
        formData.username,
        formData.email,
        formData.phone,
        formData.password
      );

      if (result.success) {
        setShowConfetti(true);
        toast.success('Registration successful! Welcome to our platform!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    trackReferralClick();
  }, [linkCode, trackReferralClick]);

  const handleShowRegistrationForm = () => {
    setShowRegistrationForm(true);
  };

  const handleNavigateToLogin = () => {
    // The referral code is already stored in localStorage from trackReferralClick
    // Navigate to login page
    navigate('/login');
  };

  const features = [
    {
      icon: GiftIcon,
      title: 'Exclusive Rewards',
      description: 'Earn unique benefits for each referral'
    },
    {
      icon: StarIcon,
      title: 'Premium Program',
      description: 'Access advanced system features'
    },
    {
      icon: HeartIcon,
      title: 'Active Community',
      description: 'Join a network of committed users'
    }
  ];

  if (loading) {
    return <CenteredLoaderSkeleton />;
  }

  // If registration form is shown, display it
  if (showRegistrationForm) {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        {showConfetti && <Confetti />}
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="sm:mx-auto sm:w-full sm:max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6"
              >
                <UserIcon className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-4"
              >
                Create Your Account
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-gray-600 mb-2"
              >
                Referred by <span className="font-semibold text-orange-600">{referrer}</span>
              </motion.p>
            </div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="card-premium p-8"
            >
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input-premium pl-12"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-premium pl-12"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-premium pl-12"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-premium pl-12 pr-12"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input-premium pl-12"
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={registering}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center space-x-2"
                >
                  {registering ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </motion.button>

                {/* Back to info button */}
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="w-full text-center text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                >
                  ← Back
                </button>

                {/* Login link */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={handleNavigateToLogin}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {showConfetti && <Confetti />}
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl mb-6 overflow-hidden"
            >
              <img 
                src="/icono.png" 
                alt="Elantar Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl font-bold text-gray-900 dark:text-secondary-100 mb-4"
            >
              Welcome!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl text-gray-600 mb-2"
            >
              You've been invited by <span className="font-semibold text-orange-600">{referrer}</span>
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-500"
            >
              Join our referral program and start earning today
            </motion.p>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="card-premium p-8 mb-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-secondary-100 mb-2">
                What awaits you?
              </h2>
              <p className="text-gray-600">
                Discover the benefits of our program
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-secondary-100">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <motion.button
                onClick={handleShowRegistrationForm}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="btn-primary w-full py-4 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <UserIcon className="h-5 w-5" />
                <span>Create Account</span>
                <ArrowRightIcon className="h-5 w-5" />
              </motion.button>

              <motion.button
                onClick={handleNavigateToLogin}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="btn-secondary w-full py-4 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Sign In</span>
              </motion.button>

              <motion.a
                href="/"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="block text-center text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                Go to Home
              </motion.a>
            </div>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="card-premium p-6 text-center"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-secondary-100 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-gray-600">
                  Thank you for joining our program. Your referrer has been notified.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="text-center mt-8"
          >
            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
              <RocketLaunchIcon className="h-4 w-4" />
              <span className="text-sm">Referral Program</span>
            </div>
            <p className="text-xs text-gray-400">
              This link was generated by our referral system
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default ReferralPage;