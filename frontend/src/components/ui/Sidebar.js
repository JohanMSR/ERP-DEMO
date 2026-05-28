import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  LinkIcon,
  UsersIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  UserPlusIcon,
  TrophyIcon,
  WalletIcon,
  ShoppingBagIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

const sidebarVariants = {
  expanded: { width: 280 },
  collapsed: { width: 80 }
};

function Sidebar({ activeView, setActiveView, onLogout, notificationsCount, isCollapsed, setIsCollapsed, userType = 'user' }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  let menuItems = [
    { 
      id: 'dashboard', 
      label: t.enrola?.giftsHome ? t.enrola.giftsHome : t.sidebar.dashboard, 
      icon: HomeIcon,
      gradient: 'from-orange-500 to-amber-500'
    },
    { 
      id: 'analytics', 
      label: t.sidebar.analytics, 
      icon: ChartBarIcon,
      gradient: 'from-red-500 to-pink-500',
      hideForAdmin: true,
      hideForVendor: true
    },
    { 
      id: 'referrals', 
      label: t.enrola?.programs ? t.enrola.programs : t.sidebar.referrals, 
      icon: LinkIcon,
      gradient: 'from-green-500 to-emerald-500',
      hideForAdmin: true,
      hideForVendor: true
    },
    { 
      id: 'network', 
      label: t.sidebar.network, 
      icon: UsersIcon,
      gradient: 'from-orange-500 to-red-500',
      hideForAdmin: true,
      hideForVendor: true
    },
    { 
      id: 'rewards', 
      label: t.sidebar.rewards, 
      icon: TrophyIcon,
      gradient: 'from-amber-500 to-orange-500',
      hideForAdmin: true,
      hideForVendor: true
    },
    {
      id: 'wallet',
      label: t.enrola?.wallet || 'Wallet',
      icon: WalletIcon,
      gradient: 'from-emerald-500 to-teal-500',
      hideForAdmin: true,
      hideForVendor: true
    },
    {
      id: 'club',
      label: t.enrola?.club || 'Shopping club',
      icon: ShoppingBagIcon,
      gradient: 'from-rose-500 to-orange-500',
      hideForAdmin: true,
      hideForVendor: true
    },
    {
      id: 'corporate',
      label: t.enrola?.corporate || 'Corporate',
      icon: BuildingLibraryIcon,
      gradient: 'from-slate-600 to-slate-800',
      hideForAdmin: true,
      hideForVendor: true
    }
  ];

  // Admin-specific menu items
  if (user?.is_admin) {
    menuItems = [
      { 
        id: 'dashboard', 
        label: t.sidebar.dashboard, 
        icon: HomeIcon,
        gradient: 'from-orange-500 to-amber-500'
      },
      {
        id: 'users',
        label: t.sidebar.users,
        icon: UsersIcon,
        gradient: 'from-orange-500 to-red-500'
      },
      {
        id: 'analytics',
        label: t.sidebar.analytics,
        icon: ChartBarIcon,
        gradient: 'from-red-500 to-pink-500'
      },
      {
        id: 'importUsers',
        label: t.sidebar.importUsers,
        icon: UserPlusIcon,
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        id: 'rewards',
        label: t.sidebar.rewards,
        icon: TrophyIcon,
        gradient: 'from-amber-500 to-orange-500'
      },
      {
        id: 'enrola',
        label: t.enrola?.enrolaHub || 'Enrola',
        icon: SparklesIcon,
        gradient: 'from-violet-500 to-fuchsia-500'
      }
    ];
  }

  // Vendor-specific menu items
  if (userType === 'vendor' || user?.is_vendor) {
    menuItems = [
      { 
        id: 'dashboard', 
        label: t.sidebar.dashboard, 
        icon: HomeIcon,
        gradient: 'from-orange-500 to-amber-500'
      },
      {
        id: 'clients',
        label: t.sidebar.myClients,
        icon: UserGroupIcon,
        gradient: 'from-green-500 to-emerald-500'
      },
      {
        id: 'referrals',
        label: t.enrola?.promoCard || 'Promo & links',
        icon: LinkIcon,
        gradient: 'from-violet-500 to-indigo-500'
      },
      {
        id: 'analytics',
        label: t.sidebar.analytics,
        icon: ChartBarIcon,
        gradient: 'from-red-500 to-pink-500'
      }
    ];
  }

  const bottomItems = [
    { 
      id: 'settings', 
      label: t.sidebar.settings, 
      icon: Cog6ToothIcon,
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-elegant flex flex-col z-[9999] dark:bg-secondary-900/90 dark:border-secondary-700/40 dark:shadow-none"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 z-10 w-6 h-6 bg-white shadow-medium rounded-full flex items-center justify-center text-secondary-400 hover:text-orange-600 hover:shadow-glow transition-[color,box-shadow,transform] duration-300 hover:scale-110 dark:bg-secondary-800 dark:text-secondary-400 dark:hover:text-orange-400"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-3 h-3" />
        ) : (
          <ChevronLeftIcon className="w-3 h-3" />
        )}
      </button>

      {/* Header */}
      <div className="p-6 border-b border-white/10 dark:border-secondary-700/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-glow flex-shrink-0 overflow-hidden">
            <img 
              src="/icono.png" 
              alt="Elantar Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col"
              >
                <h1 className="text-lg font-bold text-gradient">Elantar Referral Program</h1>
                <p className="text-2xs text-secondary-500 dark:text-secondary-400 font-medium">ERP - Elantar Edition</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-white/10 dark:border-secondary-700/40">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-2xl flex items-center justify-center dark:from-secondary-700 dark:to-secondary-600">
              <UserIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-200" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white dark:border-secondary-900 shadow-soft"></div>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                  {user?.username || t.common.user}
                </p>
                <p className="text-2xs text-secondary-500 dark:text-secondary-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                {user?.is_admin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-2xs font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-200/50 mt-1 dark:text-amber-300 dark:border-amber-500/25">
                    {t.common.admin}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                console.log('[Sidebar] menu click', { id: item.id });
                // Route-based navigation for admin area
                if (user?.is_admin) {
                  const path =
                    item.id === 'dashboard'
                      ? '/admin'
                      : `/admin/${item.id === 'importUsers' ? 'import-users' : item.id}`;
                  navigate(path);
                } 
                // Route-based navigation for vendor area
                else if (user?.is_vendor || userType === 'vendor') {
                  const path =
                    item.id === 'dashboard' ? '/vendor' : `/vendor/${item.id}`;
                  navigate(path);
                } 
                // Regular user navigation
                else {
                  setActiveView(item.id);
                }
              }}
              className={`w-full flex items-center px-4 py-3 rounded-2xl transition-[color,background-color,border-color,box-shadow,transform] duration-300 relative group ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-700 shadow-soft dark:from-orange-500/20 dark:to-amber-500/15 dark:text-orange-300' 
                  : 'text-secondary-600 hover:bg-white/50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800/70 dark:hover:text-secondary-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl border border-orange-200/50 dark:border-orange-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon className={`relative z-10 w-5 h-5 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-secondary-500 dark:text-secondary-400'}`} />
              
              <AnimatePresence>
                {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="ml-3 text-sm font-medium relative z-10"
              >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-white/10 dark:border-secondary-700/40">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-2xl transition-[color,background-color,border-color,box-shadow,transform] duration-300 relative group ${
                isActive 
                  ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-700 dark:from-orange-500/20 dark:to-amber-500/15 dark:text-orange-300' 
                  : 'text-secondary-600 hover:bg-white/50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800/70 dark:hover:text-secondary-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-secondary-500 dark:text-secondary-400'}`} />
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-error-500 to-error-600 rounded-full flex items-center justify-center shadow-glow">
                    <span className="text-2xs font-bold text-white">{item.badge}</span>
                  </div>
                )}
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Logout Button */}
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 rounded-2xl text-secondary-600 hover:bg-error-50 hover:text-error-700 transition-[color,background-color,box-shadow,transform] duration-300 group dark:text-secondary-400 dark:hover:bg-error-950/40 dark:hover:text-error-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-error-500" />
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 text-sm font-medium"
              >
                {t.sidebar.logout}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Sidebar;
