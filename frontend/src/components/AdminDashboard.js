import NotificationsCenter from "./NotificationsCenter";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  UserGroupIcon, 
  TrophyIcon,
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  LinkIcon,
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  Cog6ToothIcon, 
  BellIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Shield, Users, Phone, Home, CheckCircle, AlertTriangle } from 'lucide-react';
// UI components and utilities
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { fetchAdminAnalytics, formatTrendData } from '../utils/analytics';
import toast from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from './ui/Sidebar';
import TopBar from './ui/TopBar';
import StatsCard from './ui/StatsCard';
import Button from './ui/Button';
import Modal from './ui/Modal';
import RewardsConfig from './RewardsConfig'; 
import { FullPageSkeleton } from './ui/PageSkeleton';
import EmptyState from './ui/EmptyState';
import AdminEnrolaHub from './enrola/AdminEnrolaHub';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, updateCount, refreshCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('vendors');
  const [importPreview, setImportPreview] = useState(null);
  const [importUploading, setImportUploading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  
  // Users view filters
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSortBy, setUserSortBy] = useState('created_at');
  const [userSortOrder, setUserSortOrder] = useState('desc');

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    name: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAdminAnalyticsData();
    fetchAdminOverviewData();
    fetchVendors();
  }, []);

  // Map URL path segment <-> view id (navigation)
  const pathToView = (pathname) => {
    const seg = pathname.split('/').filter(Boolean);
    const second = seg[1] || '';
    switch (second) {
      case 'users':
        return 'users';
      case 'analytics':
        return 'analytics';
      case 'settings':
        return 'settings';
      case 'notifications':
        return 'notifications';
      case 'import-users':
        return 'importUsers';
      case 'rewards':
        return 'rewards';
      case 'enrola':
        return 'enrola';
      default:
        return 'dashboard';
    }
  };

  const viewToPath = (view) => {
    switch (view) {
      case 'users':
        return '/admin/users';
      case 'analytics':
        return '/admin/analytics';
      case 'settings':
        return '/admin/settings';
      case 'notifications':
        return '/admin/notifications';
      case 'importUsers':
        return '/admin/import-users';
      case 'rewards':
        return '/admin/rewards';
      case 'enrola':
        return '/admin/enrola';
      default:
        return '/admin';
    }
  };

  // Sync activeView from URL
  useEffect(() => {
    const v = pathToView(location.pathname);
    if (v !== activeView) {
      setActiveView(v);
    }
  }, [location.pathname]);

  // Helper to navigate when switching views from UI controls
  const navigateToView = (view) => {
    const path = viewToPath(view);
    setActiveView(view);
    navigate(path, { replace: false });
  };
  
  // Data loading and actions
  const fetchAdminAnalyticsData = async () => {
    try {
      const analyticsResponse = await fetchAdminAnalytics();
      setAdminAnalytics(analyticsResponse);
    } catch (error) {
      console.error('Error fetching admin analytics data:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const fetchAdminOverviewData = async () => {
    try {
      const response = await axios.get('/api/admin/analytics/overview', {
        withCredentials: true
      });
      setAdminOverview(response.data);
    } catch (error) {
      console.error('Error fetching admin overview data:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/admin/vendors/dropdown', {
        withCredentials: true
      });
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error(t.admin.failedToLoadVendors);
    }
  };

  const downloadTemplate = async (type = 'vendors') => {
    try {
      const endpoint = type === 'vendors' 
        ? '/api/admin/vendors/import/template'
        : '/api/admin/clients/import/template';
      const filename = type === 'vendors' 
        ? 'vendors_import_template.xlsx'
        : 'clients_import_template.xlsx';
      
      const response = await axios.get(endpoint, {
        responseType: 'blob',
        withCredentials: true
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleUploadExcel = async (file) => {
    setImportUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (importType === 'clients') {
        if (!selectedVendor) {
          toast.error(t.admin.pleaseSelectVendor);
          setImportUploading(false);
          return;
        }
        formData.append('vendor_id', selectedVendor);
      }
      
      const endpoint = importType === 'vendors' 
        ? '/api/admin/vendors/import/preview'
        : '/api/admin/clients/import/preview';
        
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      if (!response.data || !response.data.preview) {
        toast.error('Invalid response from server');
        return;
      }
      
      setImportPreview(response.data.preview);
      
      const { valid, invalid, total } = response.data;
      
      if (invalid > 0) {
        toast.error(`Preview: ${valid} valid, ${invalid} with errors`, {
          duration: 4000,
        });
      } else {
        toast.success(`Preview generated: ${valid} records ready to import`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to parse Excel file');
    } finally {
      setImportUploading(false);
    }
  };

  const confirmImport = async () => {
    try {
      const endpoint = importType === 'vendors' 
        ? '/api/admin/vendors/import/confirm'
        : '/api/admin/clients/import/confirm';
        
      const response = await axios.post(endpoint, {}, { withCredentials: true });
      const userType = importType === 'vendors' ? 'vendors' : 'clients';
      const count = response.data.created || 0;
      toast.success(`Imported ${count} ${userType}`);
      
      // Show errors if any
      if (response.data.errors && response.data.errors.length > 0) {
        toast.error(`${response.data.errors.length} records had errors`, {
          duration: 4000,
        });
      }
      
      // Close modal and clear data only after successful import
      setShowImportModal(false);
      setImportPreview(null);
      setSelectedVendor('');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || t.admin.importFailed);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        withCredentials: true
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  // Stats derived from loaded data
  const totalUsers = adminOverview?.users?.total || users.length;
  const totalVendors = adminOverview?.users?.vendors || users.filter(u => u.is_vendor).length;
  const totalClients = adminOverview?.users?.clients || users.filter(u => u.is_client).length;
  const totalReferrals = adminOverview?.referrals?.total || users.reduce((sum, user) => sum + (user.referrals_count || 0), 0);
  const totalRevenue = adminOverview?.revenue?.total || (totalReferrals * 25);
  const activeReferrers = adminOverview?.referrals?.active_referrers || 0;
  const conversionRate = adminOverview?.links?.conversion_rate || 0;

  const handleNotificationClick = () => {
    setShowNotificationsModal(true); 
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'analytics':
        return t.admin.systemAnalytics;
      case 'users':
        return t.admin.userManagement;
      case 'settings':
        return t.admin.systemSettings;
      case 'notifications':
        return t.admin.notifications;
      case 'rewards':
        return t.admin.rewardsManagement;
      case 'enrola':
        return t.enrola?.enrolaHub || 'Enrola';
      default:
        return t.admin.adminDashboard;
    }
  };

  const getPageSubtitle = () => {
    switch (activeView) {
      case 'analytics':
        return t.admin.monitorSystemPerformance;
      case 'users':
        return t.admin.manageUsers;
      case 'settings':
        return t.admin.configureSystemSettings;
      case 'notifications':
        return t.admin.systemAlerts;
      case 'rewards':
        return t.admin.configureRewardPoints;
      case 'enrola':
        return 'Enlaces, soporte, marketplace, wallet y campañas';
      default:
        return t.admin.welcomeBack.replace('{name}', user?.username || t.common.user);
    }
  };

  const viewUserDetails = (userData) => {
    setSelectedUser(userData);
    setShowUserModal(true);
  };
  
  // Views
  
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section - Usando card-premium de old.py */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-premium p-6 sm:p-8 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-200/50"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-glow flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1 flex items-center gap-2">
                {t.admin.adminControlCenter} <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </h2>
              <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                {t.admin.completeSystemOverview}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-200/50">
              <SparklesIcon className="w-4 h-4 mr-2" />
              {t.admin.systemAdministrator}
            </span>
          </div>
        </div>
      </motion.div>

      {/* System Stats - Usando StatsCard de old.py (visual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t.admin.totalRevenue}
          value={`$${totalRevenue.toLocaleString()}`}
          change={formatTrendData(adminAnalytics, 'revenue')?.change || 0}
          changeType={formatTrendData(adminAnalytics, 'revenue')?.changeType || "positive"}
          icon={CurrencyDollarIcon}
          gradient="from-green-500 to-emerald-500"
          description={t.admin.totalPlatformRevenue}
          trend={formatTrendData(adminAnalytics, 'revenue')?.data || [42, 51, 47, 58, 55, 68, 62]}
          periodText={formatTrendData(adminAnalytics, 'revenue')?.period || t.admin.vsLastPeriod}
          trendPeriodText={formatTrendData(adminAnalytics, 'revenue')?.period || t.admin.last7Days}
        />
        
        <StatsCard
          title={t.admin.totalUsers}
          value={totalUsers}
          change={formatTrendData(adminAnalytics, 'users')?.change || 8.2}
          changeType={formatTrendData(adminAnalytics, 'users')?.changeType || "positive"}
          icon={UsersIcon}
          gradient="from-orange-500 to-amber-500"
          description={t.admin.registeredPlatformUsers}
          trend={formatTrendData(adminAnalytics, 'users')?.data || [25, 28, 24, 32, 29, 35, 33]}
          periodText={formatTrendData(adminAnalytics, 'users')?.period || "vs last period"}
          trendPeriodText={formatTrendData(adminAnalytics, 'users')?.period || "Last 7 days"}
          animated
        />
        
        <StatsCard
          title={t.admin.activeReferrals}
          value={totalReferrals}
          change={formatTrendData(adminAnalytics, 'referrals')?.change || 15.7}
          changeType={formatTrendData(adminAnalytics, 'referrals')?.changeType || "positive"}
          icon={LinkIcon}
          gradient="from-red-500 to-pink-500"
          description={t.admin.totalSuccessfulReferrals}
          trend={formatTrendData(adminAnalytics, 'referrals')?.data || [8, 12, 10, 15, 13, 18, 16]}
          periodText={formatTrendData(adminAnalytics, 'referrals')?.period || "vs last period"}
          trendPeriodText={formatTrendData(adminAnalytics, 'referrals')?.period || "Last 7 days"}
          animated
        />
        
        <StatsCard
          title={t.admin.activeReferrers}
          value={activeReferrers}
          change={formatTrendData(adminAnalytics, 'engagement')?.change || 0}
          changeType={formatTrendData(adminAnalytics, 'engagement')?.changeType || "neutral"}
          icon={ArrowTrendingUpIcon}
          gradient="from-orange-500 to-red-500"
          description={t.admin.clientsMakingReferrals}
          trend={formatTrendData(adminAnalytics, 'engagement')?.data || [0, 0, 0, 0, 0, 0, 0]}
          periodText={formatTrendData(adminAnalytics, 'engagement')?.period || "vs last period"}
          trendPeriodText={formatTrendData(adminAnalytics, 'engagement')?.period || "Last 7 days"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* User List */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">{t.admin.recentUsers}</h3>
              <Button
                variant="secondary"
                size="default"
                onClick={() => navigateToView('users')}
                icon={UsersIcon}
              >
              {t.admin.viewAllUsers}
            </Button>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-secondary-50/50 to-orange-50/30">
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">{t.admin.userOverview}</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.latestUserRegistrations}</p>
            </div>
            
            <div className="divide-y divide-white/20">
              {users.slice(0, 5).map((userData, index) => (
                <motion.div
                  key={userData.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 hover:bg-secondary-50/30 transition-colors cursor-pointer"
                  onClick={() => viewUserDetails(userData)}
                >
                  <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                        <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">{userData.username}</p>
                        <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 truncate">{userData.email}</p>
                        <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 truncate">{userData.phone}</p>
                      {userData.referred_by_username && (
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{t.referral.referredBy}: <span className="font-medium">{userData.referred_by_username}</span></p>
                      )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          {userData.referrals_count || 0} {t.dashboard.referrals}
                        </span>
                        {userData.is_admin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {t.common.admin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        {new Date(userData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Admin Actions & Quick Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card-premium p-6"
          >
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <RocketLaunchIcon className="w-5 h-5 text-orange-500 mr-2" />
              {t.admin.quickActions}
            </h4>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('users')}
                icon={UsersIcon}
                className="w-full justify-start"
              >
                {t.admin.manageUsers}
              </Button>
              
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('analytics')}
                icon={ChartBarIcon}
                className="w-full justify-start"
              >
                {t.admin.viewAnalytics}
              </Button>
              
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('settings')}
                icon={Cog6ToothIcon}
                className="w-full justify-start"
              >
                {t.admin.systemSettings}
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('importUsers')}
                icon={UserPlusIcon}
                className="w-full justify-start"
              >
                {t.admin.importUsers}
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('rewards')}
                icon={TrophyIcon}
                className="w-full justify-start"
              >
                {t.admin.rewardsSystem}
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={handleNotificationClick}
                icon={BellIcon}
                className="w-full justify-start"
              >
                {t.admin.notifications} ({unreadCount})
              </Button>
            </div>
          </motion.div>

          {/* Platform Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-premium p-6"
          >
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 text-success-500 mr-2" />
              {t.admin.platformStatistics}
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.totalVendors}</span>
                <span className="text-sm font-semibold text-orange-600">
                  {totalVendors}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.totalClients}</span>
                <span className="text-sm font-semibold text-amber-600">
                  {totalClients}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.avgReferralsPerClient}</span>
                <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                  {adminOverview?.averages?.referrals_per_client?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-secondary-600 dark:text-secondary-400">{t.admin.activeReferralRate}</span>
                <span className="text-secondary-900 dark:text-secondary-100 font-medium">
                  {totalClients > 0 ? ((activeReferrers / totalClients) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-secondary-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalClients > 0 ? ((activeReferrers / totalClients) * 100) : 0}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-success-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
  
  // Users Management View
  const renderUsersView = () => {
    // Filter and sort users
    const filteredUsers = users
      .filter(u => {
        if (userTypeFilter === 'all') return true;
        if (userTypeFilter === 'admin') return u.is_admin;
        if (userTypeFilter === 'vendor') return u.is_vendor;
        if (userTypeFilter === 'client') return u.is_client;
        return true;
      })
      .filter(u => {
        if (!userSearchTerm) return true;
        const search = userSearchTerm.toLowerCase();
        return (
          u.username?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.phone_numbers?.some(p => p.includes(search))
        );
      })
      .sort((a, b) => {
        let aVal = a[userSortBy];
        let bVal = b[userSortBy];
        
        if (userSortBy === 'created_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (userSortBy === 'referrals_count') {
          aVal = a.referrals_count || 0;
          bVal = b.referrals_count || 0;
        }
        
        if (userSortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

    const userTypeStats = {
      all: users.length,
      admin: users.filter(u => u.is_admin).length,
      vendor: users.filter(u => u.is_vendor).length,
      client: users.filter(u => u.is_client).length
    };

    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.totalUsers}</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{userTypeStats.all}</p>
              </div>
              <UsersIcon className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.administrators}</p>
                <p className="text-2xl font-bold text-amber-600">{userTypeStats.admin}</p>
              </div>
              <ShieldCheckIcon className="w-10 h-10 text-amber-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.totalVendors}</p>
                <p className="text-2xl font-bold text-red-600">{userTypeStats.vendor}</p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-red-500 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-premium p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.totalClients}</p>
                <p className="text-2xl font-bold text-success-600">{userTypeStats.client}</p>
              </div>
              <UserIcon className="w-10 h-10 text-success-500 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="card-premium p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.admin.searchByUsername}
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <EyeIcon className="w-5 h-5 text-secondary-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Filter by Type */}
            <div className="flex gap-2">
              {['all', 'admin', 'vendor', 'client'].map((type) => (
                <button
                  key={type}
                  onClick={() => setUserTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    userTypeFilter === type
                      ? 'bg-orange-500 text-white'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800/70 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                  }`}
                >
                  {type === 'all' ? t.admin.all : type === 'admin' ? t.common.admin : type === 'vendor' ? t.admin.totalVendors : t.admin.totalClients}
                  {type !== 'all' && ` (${userTypeStats[type]})`}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={userSortBy}
                onChange={(e) => setUserSortBy(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="created_at">{t.admin.dateJoined}</option>
                <option value="username">{t.admin.username}</option>
                <option value="referrals_count">{t.dashboard.referrals}</option>
              </select>
              <button
                onClick={() => setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
              >
                {userSortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {t.admin.user}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {t.admin.type}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {t.admin.contact}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {t.dashboard.referrals}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {t.admin.joined}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                    {t.admin.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredUsers.map((userData, index) => (
                  <motion.tr
                    key={userData.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{userData.username}</div>
                          <div className="text-sm text-secondary-500 dark:text-secondary-400">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.is_admin && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          {t.common.admin}
                        </span>
                      )}
                      {userData.is_vendor && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {t.admin.totalVendors.replace('Total ', '')}
                        </span>
                      )}
                      {userData.is_client && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                          {t.admin.totalClients.replace('Total ', '')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900 dark:text-secondary-100">
                        {userData.phone_numbers && userData.phone_numbers.length > 0 
                          ? userData.phone_numbers[0]
                          : t.admin.noPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900 dark:text-secondary-100">
                        {userData.referrals_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                      {new Date(userData.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewUserDetails(userData)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        {t.admin.viewDetails}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <EmptyState
              compact
              icon={UsersIcon}
              title={t.admin.noUsersFound}
              description={t.admin.tryAdjustingFilters}
              className="mx-4 mb-4"
            />
          )}
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    // Calculate client state percentages
    const clientStateData = adminOverview?.client_states || {};
    const totalStates = Object.values(clientStateData).reduce((sum, val) => sum + val, 0);
    const statePercentages = totalStates > 0 ? {
      affiliated: ((clientStateData.affiliated || 0) / totalStates * 100).toFixed(1),
      contacted: ((clientStateData.contacted || 0) / totalStates * 100).toFixed(1),
      visited: ((clientStateData.visited || 0) / totalStates * 100).toFixed(1),
      completed: ((clientStateData.completed || 0) / totalStates * 100).toFixed(1)
    } : { affiliated: 0, contacted: 0, visited: 0, completed: 0 };

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title={t.admin.totalRevenue}
            value={`$${(adminOverview?.revenue?.total || 0).toLocaleString()}`}
            change={formatTrendData(adminAnalytics, 'revenue')?.change || 0}
            changeType={formatTrendData(adminAnalytics, 'revenue')?.changeType || "neutral"}
            icon={CurrencyDollarIcon}
            gradient="from-green-500 to-emerald-500"
            description={t.admin.platformRevenue}
            trend={formatTrendData(adminAnalytics, 'revenue')?.data || [0, 0, 0, 0, 0, 0, 0]}
            periodText="vs last period"
            trendPeriodText="Last 7 days"
          />
          
          <StatsCard
            title={t.admin.totalUsers}
            value={adminOverview?.users?.total || 0}
            change={formatTrendData(adminAnalytics, 'users')?.change || 0}
            changeType={formatTrendData(adminAnalytics, 'users')?.changeType || "neutral"}
            icon={UsersIcon}
            gradient="from-orange-500 to-amber-500"
            description={t.admin.allUsers}
            trend={formatTrendData(adminAnalytics, 'users')?.data || [0, 0, 0, 0, 0, 0, 0]}
            periodText="vs last period"
            trendPeriodText="Last 7 days"
            animated
          />
          
          <StatsCard
            title={t.admin.totalReferrals}
            value={adminOverview?.referrals?.total || 0}
            change={formatTrendData(adminAnalytics, 'referrals')?.change || 0}
            changeType={formatTrendData(adminAnalytics, 'referrals')?.changeType || "neutral"}
            icon={LinkIcon}
            gradient="from-red-500 to-pink-500"
            description={t.admin.platformReferrals}
            trend={formatTrendData(adminAnalytics, 'referrals')?.data || [0, 0, 0, 0, 0, 0, 0]}
            periodText="vs last period"
            trendPeriodText="Last 7 days"
            animated
          />
          
        </div>

        {/* Client State Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <ChartBarIcon className="w-5 h-5 text-orange-500 mr-2" />
              {t.admin.clientStateDistribution}
            </h3>
            
            <div className="space-y-4">
              {/* Affiliated */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{t.admin.affiliated}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{clientStateData.affiliated || 0}</span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">({statePercentages.affiliated}%)</span>
                  </div>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full transition-[width] duration-500"
                    style={{ width: `${statePercentages.affiliated}%` }}
                  />
                </div>
              </div>

              {/* Contacted */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 mr-2 text-red-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{t.admin.contacted}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-red-600">{clientStateData.contacted || 0}</span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">({statePercentages.contacted}%)</span>
                  </div>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-red-400 to-red-600 h-2.5 rounded-full transition-[width] duration-500"
                    style={{ width: `${statePercentages.contacted}%` }}
                  />
                </div>
              </div>

              {/* Visited */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Home className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{t.admin.visited}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{clientStateData.visited || 0}</span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">({statePercentages.visited}%)</span>
                  </div>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full transition-[width] duration-500"
                    style={{ width: `${statePercentages.visited}%` }}
                  />
                </div>
              </div>

              {/* Completed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">{t.admin.completed}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-success-600">{clientStateData.completed || 0}</span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-2">({statePercentages.completed}%)</span>
                  </div>
                </div>
                <div className="w-full bg-secondary-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-success-400 to-success-600 h-2.5 rounded-full transition-[width] duration-500"
                    style={{ width: `${statePercentages.completed}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <TrophyIcon className="w-5 h-5 text-success-500 mr-2" />
              {t.admin.keyPerformanceIndicators}
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{t.admin.activeReferralLinks}</p>
                  <p className="text-2xl font-bold text-orange-600">{adminOverview?.links?.active || 0}</p>
                </div>
                <LinkIcon className="w-10 h-10 text-orange-500 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{t.admin.totalClicks}</p>
                  <p className="text-2xl font-bold text-red-600">{adminOverview?.links?.total_clicks || 0}</p>
                </div>
                <EyeIcon className="w-10 h-10 text-red-500 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-success-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Active Referrers</p>
                  <p className="text-2xl font-bold text-success-600">{adminOverview?.referrals?.active_referrers || 0}</p>
                </div>
                <UserGroupIcon className="w-10 h-10 text-success-500 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">{t.admin.avgReferralsPerClient}</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {adminOverview?.averages?.referrals_per_client?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <ChartBarIcon className="w-10 h-10 text-amber-500 opacity-50" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Vendors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 text-amber-500 mr-2" />
              {t.admin.topVendors}
            </h3>
            
            <div className="space-y-3">
              {adminOverview?.top_performers?.vendors?.length > 0 ? (
                adminOverview.top_performers.vendors.map((vendor, index) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-amber-500' :
                        index === 1 ? 'bg-secondary-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-secondary-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">{vendor.username}</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{vendor.clients_count} {t.admin.clients}</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-success-600">{vendor.referrals_count} {t.dashboard.referrals}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">${vendor.commission}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-500 dark:text-secondary-400 py-4">{t.admin.noVendorsYet}</p>
              )}
            </div>
          </motion.div>

          {/* Top Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 text-success-500 mr-2" />
              {t.admin.topClients}
            </h3>
            
            <div className="space-y-3">
              {adminOverview?.top_performers?.clients?.length > 0 ? (
                adminOverview.top_performers.clients.map((client, index) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-amber-500' :
                        index === 1 ? 'bg-secondary-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-secondary-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">{client.username}</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{client.reward_points} points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">{client.referrals_count} referrals</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-secondary-500 dark:text-secondary-400 py-4">{t.admin.noActiveClientsYet}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-success-500 mr-2" />
            {t.admin.revenueAnalytics}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-success-50 to-emerald-50 rounded-lg border border-success-200">
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{t.admin.totalPlatformRevenue}</p>
              <p className="text-3xl font-bold text-success-600">
                ${(adminOverview?.revenue?.total || 0).toLocaleString()}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                {t.admin.fromReferrals.replace('{count}', adminOverview?.referrals?.total || 0)}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{t.admin.revenuePerReferral}</p>
              <p className="text-3xl font-bold text-orange-600">
                ${adminOverview?.revenue?.per_referral || 25}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">{t.admin.standardCommission}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{t.admin.revenuePerVendor}</p>
              <p className="text-3xl font-bold text-red-600">
                ${(adminOverview?.revenue?.per_vendor || 0).toFixed(2)}
              </p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                {t.admin.averageAcrossVendors.replace('{count}', adminOverview?.users?.vendors || 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const handleSystemSettingsSubmit = () => {
    const { name, currentPassword, newPassword, confirmPassword } = systemSettings;
    
    // Validations
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        toast.error(t.settings.currentPasswordRequired);
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(t.settings.passwordsNoMatch);
        return;
      }
      if (newPassword.length < 6) {
        toast.error(t.settings.passwordTooShort);
        return;
      }
    }

    // Prepare changes object
    const changes = {
      name: name.trim(),
    };

    if (newPassword) {
      changes.currentPassword = currentPassword;
      changes.newPassword = newPassword;
    }

    setPendingChanges(changes);
    setShowConfirmModal(true);
  };

  const handleConfirmChanges = async () => {
    if (!pendingChanges) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(pendingChanges)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Settings updated successfully!');
        
        // Clear password fields
        setSystemSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        setShowConfirmModal(false);
        setPendingChanges(null);
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderSettingsView = () => {
    return (
      <div className="space-y-6">
        <div className="card-premium p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Cog6ToothIcon className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-secondary-100">{t.settings.systemSettings}</h3>
              <p className="text-sm text-gray-600">{t.settings.updateAccount}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.settings.name}</label>
              <input
                type="text"
                value={systemSettings.name}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder={t.settings.yourName}
              />
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-secondary-100 mb-2">{t.settings.changePassword}</h4>
              <p className="text-sm text-gray-500 mb-4">{t.settings.leaveEmpty}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.settings.currentPassword}</label>
                  <input
                    type="password"
                    value={systemSettings.currentPassword}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="input-field"
                    placeholder={t.settings.enterCurrentPassword}
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.settings.newPassword}</label>
                  <input
                    type="password"
                    value={systemSettings.newPassword}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input-field"
                    placeholder={t.settings.enterNewPassword}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.settings.confirmNewPassword}</label>
                  <input
                    type="password"
                    value={systemSettings.confirmPassword}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input-field"
                    placeholder={t.settings.confirmNewPasswordPlaceholder}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSystemSettingsSubmit}
              className="btn-primary"
            >
              {t.settings.saveChanges}
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setPendingChanges(null);
          }}
          title="Confirm Changes"
          size="default"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to update your settings with the following changes?
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {pendingChanges?.name && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <span className="text-sm text-gray-900 dark:text-secondary-100">{pendingChanges.name}</span>
                </div>
              )}
              {pendingChanges?.newPassword && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Password:</span>
                  <span className="text-sm text-gray-900 dark:text-secondary-100">Will be changed</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingChanges(null);
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChanges}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  const renderImportUsersView = () => (
    <div className="space-y-8">
      {/* Import Type Selection */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">{t.admin.importUsersFromExcel}</h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">{t.admin.chooseImportType}</p>
          </div>
        </div>
        
        {/* Import Type Tabs */}
        <div className="flex space-x-1 bg-secondary-100 dark:bg-secondary-800/70 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              if (importType !== 'vendors') {
                setImportType('vendors');
                setImportPreview(null);
                setSelectedVendor('');
              }
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              importType === 'vendors'
                ? 'bg-white text-secondary-900 dark:bg-secondary-700 dark:text-secondary-100 shadow-sm'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
            }`}
          >
            {t.admin.importVendors}
          </button>
          <button
            onClick={() => {
              if (importType !== 'clients') {
                setImportType('clients');
                setImportPreview(null);
                fetchVendors();
              }
            }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              importType === 'clients'
                ? 'bg-white text-secondary-900 dark:bg-secondary-700 dark:text-secondary-100 shadow-sm'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100'
            }`}
          >
            {t.admin.importClients}
          </button>
        </div>
        {/* Simplified Upload for better UX */}
        <div className="space-y-4">
          {importType === 'clients' && (
            <div className="bg-orange-50 p-4 rounded-xl">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                {t.admin.selectVendor}
              </label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                onFocus={fetchVendors}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={importPreview !== null}
              >
                <option value="">{t.admin.selectAVendor}</option>
                {[...vendors].sort((a, b) => a.username.localeCompare(b.username)).map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.username} ({vendor.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                {t.admin.allImportedClientsAssigned}
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
              <Button variant="secondary" onClick={() => downloadTemplate(importType)} icon={UserPlusIcon}>
                {t.admin.downloadTemplate}
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setShowImportModal(true)} 
                icon={UserPlusIcon}
              >
                {t.admin.uploadFileToPreview}
              </Button>
          </div>
        </div>
      </div>
      
      {/* Import Preview */}
      {importPreview && importPreview.length > 0 && (
        <div className="card-premium p-6">
          <h4 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Import Preview ({importPreview.filter(r => r.status === 'ready').length} ready, {importPreview.filter(r => r.status !== 'ready').length} errors)
          </h4>
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-4">
            Only records with "ready" status will be imported. Fix errors in your Excel file and re-upload if needed.
          </p>
          <div className="max-h-96 overflow-x-auto overflow-y-auto border border-secondary-200 rounded-lg">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Row</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Phone</th>
                  {importType === 'clients' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Referred By</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {importPreview.map((row, index) => (
                  <tr key={index} className={row.status !== 'ready' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900 dark:text-secondary-100">{row.row}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900 dark:text-secondary-100">{row.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900 dark:text-secondary-100">{row.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-900 dark:text-secondary-100">{row.phone}</td>
                    {importType === 'clients' && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">{row.referred_by || '-'}</td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {row.status === 'ready' ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">Ready</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-700">{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setImportPreview(null)}>
              Cancel Preview
            </Button>
            <Button 
              variant="primary" 
              onClick={confirmImport}
              disabled={importPreview.filter(r => r.status === 'ready').length === 0}
            >
              Import {importPreview.filter(r => r.status === 'ready').length} Records
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return renderUsersView();
      case 'analytics':
        return renderAnalyticsView();
      case 'settings':
        return renderSettingsView();
      case 'notifications':
        return null;
      case 'importUsers':
        return renderImportUsersView();
      case 'rewards':
        return <RewardsConfig />;
      case 'enrola':
        return <AdminEnrolaHub />;
      default:
        return renderDashboard();
    }
  };

  // Pantalla de carga de old.py
  if (loading) {
    return <FullPageSkeleton />;
  }

  return (
    // Estructura de layout de ancho completo de old.py
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'hidden' : 'block'} lg:block`}>
        <Sidebar
          activeView={activeView}
          setActiveView={navigateToView}
          onLogout={logout}
          notificationsCount={unreadCount}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main content (fixed sidebar layout) */}
      <div className={`flex flex-col min-w-0 transition-[margin-left] duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        
        {/* Top Bar - Usando las props de old.py */}
        <TopBar
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onNotificationClick={handleNotificationClick}
          notificationsCount={unreadCount}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSettingsClick={() => navigate('/admin/settings')}
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
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      {/* User Details Modal - Se mantiene */}
      <Modal 
        isOpen={showUserModal} 
        onClose={() => setShowUserModal(false)} 
        title="User Details" 
        size="large"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-glow">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">{selectedUser.username}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{selectedUser.email}</p>
                <p className="text-secondary-600 dark:text-secondary-400">{selectedUser.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Total Referrals
                </label>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedUser.referrals_count || 0}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Member Since
                </label>
                <p className="text-sm text-secondary-900 dark:text-secondary-100">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
              {selectedUser.referred_by_username && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Referred By
                  </label>
                  <p className="text-sm text-secondary-900 dark:text-secondary-100">
                    {selectedUser.referred_by_username}
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-secondary-200">
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Additional user management features will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => {
          setShowImportModal(false);
        }} 
        title={`Import ${importType === 'vendors' ? 'Vendors' : 'Clients'} from Excel`} 
        size="large"
      >
        <div className="space-y-4">
          <div className="text-sm text-secondary-600 dark:text-secondary-400">
            Upload an .xlsx file with columns: <span className="font-medium">username, email, phone, password</span>.
            {importType === 'clients' && !selectedVendor && (
              <div className="mt-2 p-2 bg-error-50 text-error-700 rounded-lg">
                Please select a vendor before uploading the file.
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUploadExcel(e.target.files[0]);
                }
              }}
              className="block w-full text-sm text-secondary-700 dark:text-secondary-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-950/50 dark:file:text-orange-300 dark:hover:file:bg-orange-900/40"
              disabled={importUploading || (importType === 'clients' && !selectedVendor)}
            />
          </div>
          {importUploading && (
            <div className="text-sm text-secondary-600 dark:text-secondary-400">Uploading and parsing...</div>
          )}
        </div>
      </Modal>

      {/* Notifications modal */}
      <NotificationsCenter
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNotificationUpdate={updateCount}
      />
    </div>
  );
}

export default AdminDashboard;