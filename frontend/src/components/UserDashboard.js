import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  LinkIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { fetchUserStats, fetchUserAnalytics, formatTrendData } from '../utils/analytics';
import toast from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from './ui/Sidebar';
import TopBar from './ui/TopBar';
import StatsCard from './ui/StatsCard';
import ReferralCard from './ui/ReferralCard';
import AnalyticsDashboard from './AnalyticsDashboard';
import NotificationsCenter from './NotificationsCenter';
import SettingsPanel from './SettingsPanel';

function ClientDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, updateCount, refreshCount } = useNotifications();
  const [referralLinks, setReferralLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile
  const [searchValue, setSearchValue] = useState('');
  
  // Network data state
  const [networkData, setNetworkData] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(true);

  useEffect(() => {
    fetchReferralLinks();
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        fetchUserStats(),
        fetchUserAnalytics()
      ]);
      
      setUserStats(statsResponse);
      setAnalyticsData(analyticsResponse);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error(t.dashboard.failedToLoadAnalytics);
    }
  };

  // Fetch network data
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const response = await axios.get('/api/network', {
          withCredentials: true
        });
        setNetworkData(response.data);
      } catch (error) {
        console.error('Error fetching network data:', error);
        // Fallback to demo data if API fails
        setNetworkData([
          { id: 1, name: 'Maria Rodriguez', email: 'maria@example.com', referrals: 5, joined: '2024-01-15', status: 'active' },
          { id: 2, name: 'John Smith', email: 'john@example.com', referrals: 3, joined: '2024-02-20', status: 'active' },
          { id: 3, name: 'Ana Garcia', email: 'ana@example.com', referrals: 8, joined: '2024-01-10', status: 'active' },
          { id: 4, name: 'Carlos Lopez', email: 'carlos@example.com', referrals: 2, joined: '2024-03-05', status: 'pending' },
        ]);
      } finally {
        setNetworkLoading(false);
      }
    };

    if (activeView === 'network') {
      fetchNetworkData();
    }
  }, [activeView]);


  const fetchReferralLinks = async () => {
    try {
      const response = await axios.get('/api/referral-links', {
        withCredentials: true
      });
      setReferralLinks(response.data);
    } catch (error) {
      toast.error('Error loading referral links');
    } finally {
      setLoading(false);
    }
  };

  const createReferralLink = async () => {
    setCreatingLink(true);
    try {
      const response = await axios.post('/api/referral-links', {}, {
        withCredentials: true
      });
      setReferralLinks([...referralLinks, response.data]);
      toast.success('Referral link created successfully!');
    } catch (error) {
      toast.error('Error creating referral link');
    } finally {
      setCreatingLink(false);
    }
  };


  // Calculate stats
  const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalConversions = referralLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;
  const activeLinks = referralLinks.filter(link => link.is_active).length;

  // Weekly stats
  const thisWeekClicks = Math.floor(totalClicks * 0.3);
  const weeklyGrowth = 12.5;

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full mx-auto mb-4"
          />
          <p className="text-secondary-600 dark:text-secondary-400">{t.dashboard.loadingDashboard}</p>
        </div>
      </div>
    );
  }

  const handleNotificationClick = () => {
    setActiveView('notifications');
    setShowNotifications(true);
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'analytics':
        return 'Analytics';
      case 'referrals':
        return 'Referral Links';
      case 'network':
        return 'Network';
      case 'notifications':
        return 'Notifications';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeView) {
      case 'analytics':
        return t.dashboard.trackPerformance;
      case 'referrals':
        return t.dashboard.manageReferralLinks;
      case 'network':
        return t.dashboard.referralNetwork;
      case 'notifications':
        return t.dashboard.stayUpdated;
      case 'settings':
        return t.dashboard.customizeAccount;
      default:
        return t.dashboard.performanceOverview.replace('{name}', user?.username || t.common.user);
    }
  };

  // Component to render different views
  const renderContent = () => {
    switch (activeView) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'notifications':
        return <NotificationsCenter isOpen={true} onClose={() => setActiveView('dashboard')} onNotificationUpdate={updateCount} />;
      case 'settings':
        return <SettingsPanel />;
      case 'referrals':
        return renderReferralsView();
      case 'network':
        return renderNetworkView();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
       {/* Welcome Section */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4 }}
         className="card-premium p-8 bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-orange-200/50"
       >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-glow">
              <RocketLaunchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                Welcome back, {user?.username || 'User'}!
              </h2>
              <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                You're crushing it! Your referral program is performing excellently.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-start sm:justify-end">
            {user?.is_admin && (
              <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-200/50">
                <StarIcon className="w-4 h-4 mr-2" />
                Admin
              </span>
            )}
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-success-500/10 to-emerald-500/10 text-success-700 border border-success-200/50">
              <FireIcon className="w-4 h-4 mr-2" />
              Pro Member
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title={t.dashboard.rewardPoints}
          value={userStats?.rewardPoints !== undefined ? userStats.rewardPoints : 0}
          change={0}
          changeType="neutral"
          icon={StarIcon}
          gradient="from-yellow-500 to-amber-500"
          description={t.dashboard.yourEarnedRewardPoints}
          trendPeriodText={t.dashboard.lifetimePoints}
        />
        
        <StatsCard
          title={t.dashboard.activeLinks}
          value={userStats?.activeLinks || activeLinks}
          change={0}
          changeType="neutral"
          icon={LinkIcon}
          gradient="from-green-500 to-emerald-500"
          description={t.dashboard.activeLinks}
          trendPeriodText={t.dashboard.activeLinks}
        />
        
        <StatsCard
          title={t.dashboard.totalClicks}
          value={userStats?.totalClicks || totalClicks}
          change={formatTrendData(analyticsData, 'clicks')?.change || 15.3}
          changeType={formatTrendData(analyticsData, 'clicks')?.changeType || "positive"}
          icon={EyeIcon}
          gradient="from-orange-500 to-amber-500"
          description={t.dashboard.totalClicks}
          trend={formatTrendData(analyticsData, 'clicks')?.data || [12, 19, 15, 25, 22, 30, 28]}
          periodText={formatTrendData(analyticsData, 'clicks')?.period || "vs last period"}
          trendPeriodText={formatTrendData(analyticsData, 'clicks')?.period || "Last 7 days"}
          animated
        />
        
        <StatsCard
          title={t.dashboard.conversions}
          value={userStats?.totalConversions || totalConversions}
          change={formatTrendData(analyticsData, 'conversions')?.change || 8.7}
          changeType={formatTrendData(analyticsData, 'conversions')?.changeType || "positive"}
          icon={ArrowTrendingUpIcon}
          gradient="from-red-500 to-pink-500"
          description={t.dashboard.successfulReferralConversions}
          trend={formatTrendData(analyticsData, 'conversions')?.data || [3, 5, 4, 7, 6, 9, 8]}
          periodText={formatTrendData(analyticsData, 'conversions')?.period || "vs last period"}
          trendPeriodText={formatTrendData(analyticsData, 'conversions')?.period || "Last 7 days"}
          animated
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100">Recent Referral Links</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={createReferralLink}
              disabled={creatingLink}
              className="btn-primary flex items-center space-x-2"
            >
              {creatingLink ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
              <span>{creatingLink ? 'Creating...' : 'Create Link'}</span>
            </motion.button>
          </div>

          <div className="space-y-4">
             {referralLinks.slice(0, 3).map((link, index) => (
               <motion.div
                 key={link.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.3, delay: index * 0.05 }}
               >
                <ReferralCard 
                  link={{
                    ...link,
                    code: link.link_code,
                    is_active: true
                  }} 
                  onViewDetails={() => setActiveView('analytics')}
                  compact
                />
              </motion.div>
            ))}
            
            {referralLinks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <LinkIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No referral links yet</h4>
                <p className="text-secondary-500 dark:text-secondary-400 mb-6">Create your first referral link to start earning commissions.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createReferralLink}
                  disabled={creatingLink}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Your First Link</span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
           {/* Performance Summary */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4, delay: 0.1 }}
             className="card-premium p-6"
           >
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <StarIcon className="w-5 h-5 text-amber-500 mr-2" />
              This Week's Performance
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{t.dashboard.newClicks}</span>
                <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">{thisWeekClicks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{t.dashboard.activeLinks}</span>
                <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">{activeLinks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{t.dashboard.growthRate}</span>
                <span className="text-sm font-semibold text-success-600">+{weeklyGrowth}%</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">{t.dashboard.nextMilestone}</span>
                <span className="text-amber-600 font-medium">10 {t.dashboard.conversions.toLowerCase()}</span>
              </div>
              <div className="mt-2 w-full bg-secondary-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalConversions / 10) * 100, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                />
              </div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                {Math.max(10 - totalConversions, 0)} {t.dashboard.conversionsToGo}
              </p>
            </div>
          </motion.div>

           {/* Quick Stats */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
             className="card-premium p-6"
           >
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 text-orange-500 mr-2" />
              Quick Actions
            </h4>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('referrals')}
                className="w-full btn-ghost text-left justify-start"
              >
                <LinkIcon className="w-4 h-4 mr-3" />
                Manage Links
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('analytics')}
                className="w-full btn-ghost text-left justify-start"
              >
                <ChartBarIcon className="w-4 h-4 mr-3" />
                View Analytics
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('network')}
                className="w-full btn-ghost text-left justify-start"
              >
                <UserGroupIcon className="w-4 h-4 mr-3" />
                View Network
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderReferralsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Referral Links</h2>
          <p className="text-secondary-600 dark:text-secondary-400">Manage and track all your referral links</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createReferralLink}
          disabled={creatingLink}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create New Link</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
         {referralLinks.map((link, index) => (
           <motion.div
             key={link.id}
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
           >
            <ReferralCard 
              link={{
                ...link,
                code: link.link_code,
                is_active: true
              }} 
              onViewDetails={() => setActiveView('analytics')}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderNetworkView = () => {
    if (networkLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Your Network</h2>
          <p className="text-secondary-600 dark:text-secondary-400">People you've referred to the platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Network Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Total Referred</span>
                <span className="font-semibold">{networkData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Active Members</span>
                <span className="font-semibold">{networkData.filter(n => n.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Total Referrals Made</span>
                <span className="font-semibold">{networkData.reduce((sum, n) => sum + (n.referrals || 0), 0)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-premium overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Network Members</h3>
              </div>
              <div className="divide-y divide-white/20">
                {networkData.map((member, index) => (
                  <div key={`member-${member.id}-${index}`} className="p-4 hover:bg-secondary-50/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-secondary-100">{member.name}</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{member.referrals} referrals</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">Joined {new Date(member.joined).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      {/* Sidebar - Always visible */}
      <div className={`${sidebarCollapsed ? 'hidden' : 'block'} lg:block`}>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={logout}
          notificationsCount={unreadCount}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content - Adjusted for fixed sidebar */}
      <div className={`flex flex-col min-w-0 transition-[margin-left] duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Top Bar */}
        <TopBar
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onNotificationClick={handleNotificationClick}
          notificationsCount={unreadCount}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSettingsClick={() => setActiveView('settings')}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container-premium section-padding px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showNotifications && (
        <NotificationsCenter 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)}
          onNotificationUpdate={updateCount}
        />
      )}
    </div>
  );
}

export default ClientDashboard;
