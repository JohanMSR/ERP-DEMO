import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('If that email exists, we have sent a recovery link');
        toast.success('Recovery link sent');
      } else {
        setMessage(data.error || 'Could not process your request');
        toast.error(data.error || 'Could not process your request');
      }
    } catch (error) {
      setMessage('Connection error');
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: RocketLaunchIcon,
      title: 'Secure recovery',
      description: 'Industry-standard password recovery flow'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Account protection',
      description: 'Your information stays protected at every step'
    },
    {
      icon: StarIcon,
      title: 'Fast support',
      description: 'Get back into your account quickly'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-amber-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-500/15 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10"
      >
        {/* Left Side - Branding & Features */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center lg:text-left order-2 lg:order-1"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="inline-flex items-center space-x-3 mb-6"
            >
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-glow overflow-hidden">
                <img 
                  src="/icono.png" 
                  alt="Elantar Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gradient">Elantar Referral Program</h1>
                <p className="text-sm text-secondary-500 font-medium">ERP - Elantar Edition</p>
              </div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-secondary-900 mb-4"
            >
              Recover your
              <span className="text-gradient block">Password</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-lg text-secondary-600 leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              Enter your email address and we will send you a secure link to reset your password.
            </motion.p>
          </div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center space-x-4 p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-[background-color,border-color] duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-secondary-900">{feature.title}</h3>
                  <p className="text-sm text-secondary-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Forgot Password Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md mx-auto order-1 lg:order-2"
        >
          <div className="card-premium p-6 sm:p-8 lg:p-10">
            {/* Form Header */}
            <div className="text-center mb-8">
              <motion.h3 
                className="text-2xl font-bold text-secondary-900 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Reset password
              </motion.h3>
              <motion.p 
                className="text-secondary-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                We will email you a secure reset link
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium pl-12"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Message Display */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-2xl text-sm ${
                    message.toLowerCase().includes('error') 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}
                >
                  {message}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-4 flex items-center justify-center space-x-2 relative overflow-hidden"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span className="text-base font-semibold">
                      Send recovery link
                    </span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-secondary-200/50">
                <Link
                  to="/login"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors inline-flex items-center space-x-1"
                >
                  <span>← Back to sign in</span>
                </Link>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <div className="absolute top-20 right-20 w-4 h-4 bg-orange-500/40 rounded-full hidden lg:block"></div>
      <div className="absolute bottom-32 left-20 w-6 h-6 bg-amber-500/30 rounded-full hidden lg:block"></div>
    </div>
  );
}

export default ForgotPassword;