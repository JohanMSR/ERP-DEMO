import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  LockClosedIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        toast.success(t.login.welcomeBackToast);
        // Redirect based on user type after successful login
        setTimeout(() => {
          // Check user from result since state might not be updated yet
          const loggedInUser = result.user;
          if (loggedInUser?.is_admin) {
            navigate('/admin');
          } else if (loggedInUser?.is_vendor) {
            navigate('/vendor');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t.login.errorToast);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: {
      opacity: 0,
      y: 30,
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const features = [
    {
      icon: RocketLaunchIcon,
      title: t.login.features.launch.title,
      description: t.login.features.launch.desc
    },
    {
      icon: ShieldCheckIcon,
      title: t.login.features.secure.title,
      description: t.login.features.secure.desc
    },
    {
      icon: StarIcon,
      title: t.login.features.premium.title,
      description: t.login.features.premium.desc
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Simplified background gradients - adjusted for mobile */}
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-orange-500/20 to-amber-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-amber-500/15 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center relative z-10 px-3 sm:px-4"
      >
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center lg:text-left order-1 lg:order-1"
        >
          <div className="mb-2 sm:mb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="inline-flex items-center justify-center"
            >
              <img 
                src="/logo.png" 
                alt="Elantar Logo" 
                className="w-40 h-20 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-contain"
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-secondary-900 mb-2 sm:mb-4 hidden sm:block"
            >
              {t.login.welcome}
              <span className="text-gradient block mt-1">{t.login.future}</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-xs sm:text-base md:text-lg text-secondary-600 leading-relaxed max-w-md mx-auto lg:mx-0 px-2 sm:px-0 hidden sm:block"
            >
              {t.login.subtitle}
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-3 sm:space-y-4 lg:space-y-6 hidden sm:block"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-[background-color,border-color] duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm sm:text-base text-secondary-900">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-secondary-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md mx-auto order-2 lg:order-2"
        >
          <div className="card-premium p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Form Header */}
            <div className="text-center mb-4 sm:mb-8">
              <motion.h3
                className="text-lg sm:text-2xl font-bold text-secondary-900 mb-1 sm:mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {t.login.welcomeBack}
              </motion.h3>
              <motion.p
                className="text-xs sm:text-base text-secondary-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {t.login.signInAccount}
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-3 sm:space-y-6"
            >
              {/* Username Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1 sm:mb-2">
                  {t.login.username}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-premium pl-10 sm:pl-12 py-2.5 sm:py-3 text-sm sm:text-base"
                    placeholder={t.login.enterUsername}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1 sm:mb-2">
                  {t.login.password}
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-premium pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base"
                    placeholder={t.login.enterPassword}
                    required
                    autoComplete="current-password"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-2.5 sm:py-4 flex items-center justify-center space-x-2 relative overflow-hidden mt-4 sm:mt-8"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span className="text-sm sm:text-base font-semibold">{t.login.signIn}</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </motion.button>

              {/* Additional Options */}
              <div className="text-center pt-1 sm:pt-0">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  {t.login.forgotPassword}
                </Link>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
