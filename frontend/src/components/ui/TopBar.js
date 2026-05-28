import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

function TopBar({ title, subtitle, onNotificationClick, notificationsCount, searchValue, onSearchChange, onMenuClick, onSettingsClick }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    if (onSettingsClick) {
      onSettingsClick();
    }
  };

  const userMenuItems = [
    { icon: Cog6ToothIcon, label: t.topBar.settings, action: handleSettingsClick },
    { type: 'divider' },
    { icon: ArrowRightOnRectangleIcon, label: t.topBar.signOut, action: logout, danger: true }
  ];

  return (
    <div className="sticky top-0 h-16 sm:h-20 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-soft z-[9998] dark:bg-secondary-900/75 dark:border-secondary-700/40 dark:shadow-none">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-soft hover:bg-white/60 transition-[background-color,border-color,box-shadow,transform] duration-300 mr-3 dark:bg-secondary-800/60 dark:border-secondary-600/50 dark:hover:bg-secondary-800/90"
        >
          <Bars3Icon className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
        </motion.button>

        {/* Left Section - Title */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h1 className="text-lg sm:text-2xl font-bold text-gradient truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>


        {/* Right Section - Actions */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-4">
          {/* Theme toggle */}
          <motion.button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={isDark ? t.topBar.useLightTheme : t.topBar.useDarkTheme}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleTheme}
            className={`relative flex h-8 w-[3.25rem] sm:h-9 sm:w-[3.5rem] shrink-0 items-center rounded-full border px-0.5 transition-[background-color,border-color,box-shadow] duration-300 ${
              isDark
                ? 'border-secondary-600 bg-secondary-800/90 shadow-inner'
                : 'border-white/40 bg-white/45 backdrop-blur-sm shadow-soft'
            }`}
          >
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full shadow-soft ${
                isDark
                  ? 'ml-auto bg-orange-500 text-white'
                  : 'bg-white text-amber-600 dark:bg-secondary-700 dark:text-amber-400'
              }`}
            >
              {isDark ? (
                <MoonIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <SunIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </motion.span>
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
            className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-soft hover:bg-white/60 hover:shadow-medium transition-[background-color,border-color,box-shadow,transform] duration-300 group dark:bg-secondary-800/60 dark:border-secondary-600/50 dark:hover:bg-secondary-800/90"
          >
            <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 group-hover:text-orange-600 transition-colors dark:text-secondary-300 dark:group-hover:text-orange-400" />
            {notificationsCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center shadow-glow"
              >
                <span className="text-2xs font-bold text-white">
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </span>
              </motion.div>
            )}
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-soft hover:bg-white/60 hover:shadow-medium transition-[background-color,border-color,box-shadow,transform] duration-300 group dark:bg-secondary-800/60 dark:border-secondary-600/50 dark:hover:bg-secondary-800/90"
            >
              <div className="relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-soft">
                  <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-success-500 rounded-full border border-white dark:border-secondary-800 shadow-soft"></div>
              </div>
              
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate max-w-24">
                  {user?.username || t.common.user}
                </span>
                <span className="text-2xs text-secondary-500 dark:text-secondary-400">
                  {user?.is_admin ? t.common.admin : t.common.member}
                </span>
              </div>
              
              <ChevronDownIcon className={`w-3 h-3 sm:w-4 sm:h-4 text-secondary-400 dark:text-secondary-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[9997]" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-elegant z-[9997] overflow-hidden dark:bg-secondary-900/95 dark:border-secondary-600/50"
                  >
                    {/* User Info Header */}
                    <div className="p-4 border-b border-white/20 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:border-secondary-700/50 dark:from-secondary-800/80 dark:to-secondary-800/60">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-glow">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                            {user?.username || t.common.user}
                          </p>
                          <p className="text-2xs text-secondary-500 dark:text-secondary-400 truncate">
                            {user?.email || 'user@example.com'}
                          </p>
                          {user?.is_admin && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-200/50 mt-1 dark:text-amber-300 dark:border-amber-500/30">
                              {t.common.administrator}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {userMenuItems.map((item, index) => {
                        if (item.type === 'divider') {
                          return (
                            <div key={index} className="h-px bg-secondary-200/50 dark:bg-secondary-600/50 my-2" />
                          );
                        }

                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={index}
                            onClick={item.action}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-[color,background-color,transform] duration-200 ${
                              item.danger 
                                ? 'text-error-600 hover:bg-error-50 hover:text-error-700 dark:hover:bg-error-950/40 dark:text-error-400' 
                                : 'text-secondary-600 hover:bg-white/60 hover:text-secondary-900 dark:text-secondary-300 dark:hover:bg-secondary-800/80 dark:hover:text-secondary-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
