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
  RocketLaunchIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CheckIcon,
  HomeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { Building2, Users, Phone as PhoneLucide, Home as HomeLucide, CheckCircle, GitBranch } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { fetchVendorAnalytics, fetchVendorTrends, formatTrendData } from '../utils/analytics';
import toast from 'react-hot-toast';
import Sidebar from './ui/Sidebar';
import TopBar from './ui/TopBar';
import StatsCard from './ui/StatsCard';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { FullPageSkeleton } from './ui/PageSkeleton';
import VendorReferralPromoView from './enrola/VendorReferralPromoView';
import ClientReferralTreeOverlay from './enrola/ClientReferralTreeOverlay';

function SellerDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [notificationsCount] = useState(2);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [vendorAnalytics, setVendorAnalytics] = useState(null);
  const [vendorTrends, setVendorTrends] = useState(null);
  const [vendorDetailed, setVendorDetailed] = useState(null);
  const [advancingState, setAdvancingState] = useState(null);
  const [referralTreeClientId, setReferralTreeClientId] = useState(null);
  const [referralTreeData, setReferralTreeData] = useState(null);
  const [referralTreeLoading, setReferralTreeLoading] = useState(false);

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
    fetchClients();
    fetchVendorAnalyticsData();
    fetchVendorTrendsData();
    fetchVendorDetailedData();
  }, []);

  // Map URL path segment <-> view id
  const pathToView = (pathname) => {
    const seg = pathname.split('/').filter(Boolean);
    const second = seg[1] || '';
    switch (second) {
      case 'clients':
        return 'clients';
      case 'analytics':
        return 'analytics';
      case 'settings':
        return 'settings';
      case 'notifications':
        return 'notifications';
      case 'referrals':
        return 'referrals';
      default:
        return 'dashboard';
    }
  };

  const viewToPath = (view) => {
    switch (view) {
      case 'clients':
        return '/vendor/clients';
      case 'analytics':
        return '/vendor/analytics';
      case 'settings':
        return '/vendor/settings';
      case 'notifications':
        return '/vendor/notifications';
      case 'referrals':
        return '/vendor/referrals';
      default:
        return '/vendor';
    }
  };

  // Sync activeView from URL
  useEffect(() => {
    const v = pathToView(location.pathname);
    if (v !== activeView) {
      console.log('[SellerDashboard] Syncing view from URL', { pathname: location.pathname, view: v });
      setActiveView(v);
    }
  }, [location.pathname]);

  // Helper to navigate when switching views from UI controls
  const navigateToView = (view) => {
    const path = viewToPath(view);
    console.log('[SellerDashboard] Navigating to view', { view, path });
    setActiveView(view);
    navigate(path, { replace: false });
  };

  const fetchVendorAnalyticsData = async () => {
    try {
      const analyticsResponse = await fetchVendorAnalytics();
      setVendorAnalytics(analyticsResponse);
    } catch (error) {
      console.error('Error fetching vendor analytics data:', error);
      toast.error('Failed to load vendor analytics data');
    }
  };

  const fetchVendorTrendsData = async () => {
    try {
      const trendsResponse = await fetchVendorTrends();
      setVendorTrends(trendsResponse);
    } catch (error) {
      console.error('Error fetching vendor trends data:', error);
      toast.error('Failed to load vendor trends data');
    }
  };

  const fetchVendorDetailedData = async () => {
    try {
      const response = await axios.get('/api/vendor/analytics/detailed', {
        withCredentials: true
      });
      setVendorDetailed(response.data);
    } catch (error) {
      console.error('Error fetching vendor detailed data:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/vendor/clients', {
        withCredentials: true
      });
      setClients(response.data);
    } catch (error) {
      toast.error('Error loading clients');
    } finally {
      setLoading(false);
    }
  };

   // Calculate vendor stats from real data
   const totalClients = vendorAnalytics?.totalClients || clients.length;
   const totalReferrals = vendorAnalytics?.totalReferrals || clients.reduce((sum, client) => sum + (client.referrals_count || 0), 0);
   const totalRevenue = vendorAnalytics?.totalCommission || totalReferrals * 25; // $25 per referral

  const handleNotificationClick = () => {
    navigateToView('notifications');
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'analytics':
        return 'Client Analytics';
      case 'clients':
        return 'My Clients';
      case 'settings':
        return 'Vendor Settings';
      case 'notifications':
        return 'Notifications';
      case 'referrals':
        return t.enrola?.promoCard || 'Promo & virtual card';
      default:
        return 'Vendor Dashboard';
    }
  };

  const getPageSubtitle = () => {
    switch (activeView) {
      case 'analytics':
        return 'Monitor client performance and referral metrics';
      case 'clients':
        return 'Manage your clients and their referral activities';
      case 'settings':
        return 'Configure your vendor account settings';
      case 'notifications':
        return 'Important updates and client activities';
      case 'referrals':
        return 'Photo, QR by program, share SMS / email / social';
      default:
        return `Welcome back, ${user?.username}! Here's your client overview.`;
    }
  };

  const viewClientDetails = (clientData) => {
    setSelectedClient(clientData);
    setShowClientModal(true);
  };

  const advanceClientState = async (clientId) => {
    setAdvancingState(clientId);
    try {
      const response = await axios.post(`/api/vendor/clients/${clientId}/advance-state`, {}, {
        withCredentials: true
      });
      
      toast.success(`Client advanced to ${response.data.new_state} state! ${response.data.points_awarded > 0 ? `+${response.data.points_awarded} points awarded` : ''}`);
      
      // Refresh clients list
      fetchClients();
      
      // Update selected client if modal is open
      if (selectedClient && selectedClient.id === clientId) {
        const updatedClients = await axios.get('/api/vendor/clients', { withCredentials: true });
        const updatedClient = updatedClients.data.find(c => c.id === clientId);
        if (updatedClient) {
          setSelectedClient(updatedClient);
        }
      }
    } catch (error) {
      console.error('Error advancing client state:', error);
      toast.error(error.response?.data?.error || 'Failed to advance client state');
    } finally {
      setAdvancingState(null);
    }
  };

  const getStateLabel = (state) => {
    const labels = {
      'affiliated': { label: 'Affiliated', icon: UserPlusIcon, color: 'bg-orange-100 text-orange-700' },
      'contacted': { label: 'Contacted', icon: PhoneIcon, color: 'bg-red-100 text-red-700' },
      'visited': { label: 'Visited', icon: HomeIcon, color: 'bg-orange-100 text-orange-700' },
      'completed': { label: 'Completed', icon: CheckBadgeIcon, color: 'bg-green-100 text-green-700' }
    };
    return labels[state] || labels['affiliated'];
  };

  const getNextStateLabel = (state) => {
    const order = ['affiliated', 'contacted', 'visited', 'completed'];
    const currentIndex = order.indexOf(state);
    if (currentIndex >= order.length - 1) return null;
    return getStateLabel(order[currentIndex + 1]);
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-premium p-6 sm:p-8 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/50 dark:from-secondary-900/95 dark:to-secondary-900/75 dark:border-secondary-600/45"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-glow flex-shrink-0">
              <BuildingOfficeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1 flex items-center gap-2">
                Vendor Portal <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </h2>
              <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                Manage your clients and track their referral performance.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-200/50 dark:text-amber-300 dark:border-amber-500/25">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Sales Representative
            </span>
          </div>
        </div>
      </motion.div>

       {/* Client Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
         <StatsCard
           title="Total Clients"
           value={totalClients}
           change={formatTrendData(vendorTrends, 'clients')?.change || 0}
           changeType={formatTrendData(vendorTrends, 'clients')?.changeType || "neutral"}
           icon={UsersIcon}
           gradient="from-orange-500 to-amber-500"
           description="Clients under your management"
           trend={formatTrendData(vendorTrends, 'clients')?.data || [0, 0, 0, 0, 0, 0, 0]}
           periodText={formatTrendData(vendorTrends, 'clients')?.period || "vs last period"}
           trendPeriodText={formatTrendData(vendorTrends, 'clients')?.period || "Last 7 days"}
           animated
         />
         
         <StatsCard
           title="Commission Earned"
           value={`$${totalRevenue.toLocaleString()}`}
           change={formatTrendData(vendorTrends, 'commission')?.change || 0}
           changeType={formatTrendData(vendorTrends, 'commission')?.changeType || "neutral"}
           icon={CurrencyDollarIcon}
           gradient="from-red-500 to-pink-500"
           description="Total commission from referrals"
           trend={formatTrendData(vendorTrends, 'commission')?.data || [0, 0, 0, 0, 0, 0, 0]}
           periodText={formatTrendData(vendorTrends, 'commission')?.period || "vs last period"}
           trendPeriodText={formatTrendData(vendorTrends, 'commission')?.period || "Last 7 days"}
         />
       </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Client List */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Recent Clients</h3>
            <Button
              variant="secondary"
              size="default"
              onClick={() => navigateToView('clients')}
              icon={UsersIcon}
            >
              View All Clients
            </Button>
          </div>

          <div className="card-premium overflow-hidden">
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-secondary-50/50 to-orange-50/30 dark:border-secondary-700/50 dark:from-secondary-800/90 dark:to-secondary-800/70">
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-100">Client Overview</h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Your client roster and their referral activity</p>
            </div>
            
            <div className="divide-y divide-white/20 dark:divide-secondary-700/40">
              {clients.slice(0, 5).map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 hover:bg-secondary-50/30 dark:hover:bg-secondary-800/35 transition-colors cursor-pointer"
                  onClick={() => viewClientDetails(client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-soft">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 dark:text-secondary-100">{client.username}</p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">{client.email}</p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {client.phone_numbers && client.phone_numbers.length > 0 
                            ? client.phone_numbers.join(', ') 
                            : t.admin.noPhone}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          Joined: {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                          {client.referrals_count || 0} referrals
                        </span>
                        {client.referrals_count > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700 dark:bg-success-950/45 dark:text-success-400">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        Code: {client.referral_code}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {clients.length === 0 && (
                <div className="p-8 text-center">
                  <UserGroupIcon className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Clients Yet</h4>
                  <p className="text-secondary-500 dark:text-secondary-400">Your clients will appear here once they are assigned to you.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Actions & Quick Stats */}
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
              Quick Actions
            </h4>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('clients')}
                icon={UsersIcon}
                className="w-full justify-start"
              >
                Manage Clients
              </Button>
              
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('analytics')}
                icon={ChartBarIcon}
                className="w-full justify-start"
              >
                View Analytics
              </Button>
              
              <Button
                variant="ghost"
                size="default"
                onClick={() => navigateToView('settings')}
                icon={Cog6ToothIcon}
                className="w-full justify-start"
              >
                Settings
              </Button>
            </div>
          </motion.div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="card-premium p-6"
          >
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <TrophyIcon className="w-5 h-5 text-success-500 mr-2" />
              Performance Summary
            </h4>
            
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-secondary-600 dark:text-secondary-400">This Month</span>
                 <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                   ${vendorDetailed?.monthly?.commission || 0} earned
                 </span>
               </div>
               
               <div className="flex items-center justify-between">
                 <span className="text-sm text-secondary-600 dark:text-secondary-400">New Clients (Month)</span>
                 <span className="text-sm font-semibold text-success-600">
                   {vendorDetailed?.monthly?.new_clients || 0} clients
                 </span>
               </div>
               
               <div className="flex items-center justify-between">
                 <span className="text-sm text-secondary-600 dark:text-secondary-400">Monthly Referrals</span>
                 <span className="text-sm font-semibold text-amber-600">
                   {vendorDetailed?.monthly?.referrals || 0} referrals
                 </span>
               </div>
               
               <div className="flex items-center justify-between">
                 <span className="text-sm text-secondary-600 dark:text-secondary-400">Top Client</span>
                 <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                   {vendorAnalytics?.topClient?.username || (clients.length > 0 ? clients.reduce((max, client) => 
                     client.referrals_count > (max?.referrals_count || 0) ? client : max
                   ).username : 'N/A')}
                 </span>
               </div>
             </div>

            <div className="mt-6 pt-4 border-t border-white/20 dark:border-secondary-700/50">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-secondary-600 dark:text-secondary-400">Completion Rate</span>
                <span className="text-secondary-900 dark:text-secondary-100 font-medium">
                  {vendorDetailed?.performance_metrics?.completion_rate?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <div className="w-full bg-secondary-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${vendorDetailed?.performance_metrics?.completion_rate || 0}%` }}
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

  const renderContent = () => {
    switch (activeView) {
      case 'clients':
        return renderClientsView();
      case 'analytics':
        return renderAnalyticsView();
      case 'settings':
        return renderSettingsView();
      case 'referrals':
        return <VendorReferralPromoView user={user} />;
      default:
        return renderDashboard();
    }
  };

  const openReferralTree = async (client, event) => {
    event.stopPropagation();
    if (referralTreeClientId === client.id) {
      setReferralTreeClientId(null);
      setReferralTreeData(null);
      return;
    }
    setReferralTreeClientId(client.id);
    setReferralTreeData(null);
    setReferralTreeLoading(true);
    try {
      const response = await axios.get(`/api/vendor/clients/${client.id}/referral-tree`, {
        withCredentials: true,
      });
      setReferralTreeData(response.data);
    } catch (error) {
      console.error('Error loading referral tree:', error);
      toast.error('Could not load referral tree');
      setReferralTreeClientId(null);
    } finally {
      setReferralTreeLoading(false);
    }
  };

  const closeReferralTree = () => {
    setReferralTreeClientId(null);
    setReferralTreeData(null);
  };

  const renderClientsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">My Clients</h3>
          <p className="text-secondary-600 dark:text-secondary-400">Manage and monitor your client portfolio</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4 py-2 w-full min-w-[200px] sm:min-w-[240px] rounded-lg border border-secondary-300/70 bg-white/90 text-secondary-900 placeholder:text-secondary-400 shadow-soft transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 dark:border-secondary-600 dark:bg-secondary-800/90 dark:text-secondary-100 dark:placeholder:text-secondary-500 dark:focus:border-orange-400 dark:focus:ring-orange-500/25"
            />
            <EyeIcon className="w-5 h-5 text-secondary-400 dark:text-secondary-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {clients
          .filter(client => 
            client.username.toLowerCase().includes(searchValue.toLowerCase()) ||
            client.email.toLowerCase().includes(searchValue.toLowerCase())
          )
          .map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card-premium relative overflow-hidden p-6 hover:shadow-glow"
            >
              <button
                type="button"
                onClick={(e) => openReferralTree(client, e)}
                title="View referral tree"
                aria-label={`View referral tree for ${client.username}`}
                aria-expanded={referralTreeClientId === client.id}
                className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border transition-[transform,background-color,border-color,box-shadow] duration-200 ${
                  referralTreeClientId === client.id
                    ? 'border-orange-400 bg-orange-500 text-white shadow-glow'
                    : 'border-secondary-200/80 bg-white/90 text-secondary-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-secondary-600 dark:bg-secondary-800/90 dark:text-secondary-300 dark:hover:border-orange-600 dark:hover:bg-orange-950/40 dark:hover:text-orange-400'
                }`}
              >
                <GitBranch className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {referralTreeClientId === client.id && (
                  <ClientReferralTreeOverlay
                    clientUsername={client.username}
                    tree={referralTreeData}
                    loading={referralTreeLoading}
                    onClose={closeReferralTree}
                  />
                )}
              </AnimatePresence>

              <div className="flex items-start space-x-3 sm:space-x-4 mb-4 pr-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft flex-shrink-0">
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">{client.username}</h4>
                  <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 truncate">{client.email}</p>
                  <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 truncate">
                    {client.phone_numbers && client.phone_numbers.length > 0 
                      ? client.phone_numbers.join(', ') 
                      : 'No phone'}
                  </p>
                </div>
              </div>
              
              {/* State Badge */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStateLabel(client.state || 'affiliated').color}`}>
                  {React.createElement(getStateLabel(client.state || 'affiliated').icon, { className: 'w-3.5 h-3.5 mr-1.5' })}
                  {getStateLabel(client.state || 'affiliated').label}
                </span>
                {client.referred_by_username && (
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                    Referred by: <span className="font-medium">{client.referred_by_username}</span>
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600 dark:text-secondary-400">Referrals:</span>
                  <span className="font-semibold text-orange-600">{client.referrals_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600 dark:text-secondary-400">Reward Points:</span>
                  <span className="font-semibold text-amber-600">{client.reward_points || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600 dark:text-secondary-400">Referral Code:</span>
                  <span className="font-mono text-xs bg-secondary-100 px-2 py-1 rounded">{client.referral_code}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-secondary-200 space-y-3">
                {/* State Timeline */}
                <div className="px-2">
                  <div className="flex items-center mb-2">
                    {['affiliated', 'contacted', 'visited', 'completed'].map((state, idx) => {
                      const currentStateIndex = ['affiliated', 'contacted', 'visited', 'completed'].indexOf(client.state || 'affiliated');
                      const isCompleted = idx < currentStateIndex;
                      const isCurrent = idx === currentStateIndex;
                      const isNext = idx === currentStateIndex + 1;
                      const StateIcon = getStateLabel(state).icon;
                      
                      return (
                        <React.Fragment key={state}>
                          <div className="flex flex-col items-center" style={{ width: '60px' }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-[transform,box-shadow] duration-300 ${
                              isCompleted ? 'bg-success-500 text-white ring-2 ring-success-200' :
                              isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-200 scale-110' :
                              isNext ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-300 animate-pulse' :
                              'bg-secondary-200 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-300'
                            }`}>
                              {isCompleted ? (
                                <CheckIcon className="w-4 h-4" />
                              ) : (
                                <StateIcon className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          {idx < 3 && (
                            <div className={`h-1 rounded transition-[background-color] duration-300`} style={{ width: 'calc(100% / 3 - 60px)' }}>
                              <div className={`h-full rounded ${
                                idx < currentStateIndex ? 'bg-success-500' :
                                idx === currentStateIndex ? 'bg-gradient-to-r from-orange-500 to-orange-200' :
                                'bg-secondary-200'
                              }`} />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {getNextStateLabel(client.state || 'affiliated') ? (
                  <Button 
                    variant="primary" 
                    size="small" 
                    className="w-full"
                    onClick={() => advanceClientState(client.id)}
                    disabled={advancingState === client.id}
                  >
                    {advancingState === client.id ? 'Advancing...' : `Advance to ${getNextStateLabel(client.state || 'affiliated').label}`}
                  </Button>
                ) : (
                  <div className="text-center py-2 text-success-600 font-medium text-sm flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 mr-1" />
                    Sale Completed!
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="small" 
                  className="w-full"
                  onClick={() => viewClientDetails(client)}
                >
                  View Details
                </Button>
              </div>
            </motion.div>
          ))}
      </div>
      
      {clients.length === 0 && (
        <div className="card-premium p-12 text-center">
          <UserGroupIcon className="w-20 h-20 text-secondary-300 dark:text-secondary-600 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">No Clients Assigned</h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            You don't have any clients assigned to you yet. Contact your administrator to get clients assigned to your account.
          </p>
          <Button variant="secondary" onClick={() => navigateToView('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  const renderAnalyticsView = () => {
    // Calculate client metrics
    const totalClients = clients.length;
    const clientsWithReferrals = clients.filter(c => (c.referrals_count || 0) > 0).length;
    const totalClientReferrals = clients.reduce((sum, c) => sum + (c.referrals_count || 0), 0);
    const avgReferralsPerClient = totalClients > 0 ? (totalClientReferrals / totalClients).toFixed(2) : 0;
    
    // Client states
    const stateDistribution = {
      affiliated: clients.filter(c => c.state === 'affiliated').length,
      contacted: clients.filter(c => c.state === 'contacted').length,
      visited: clients.filter(c => c.state === 'visited').length,
      completed: clients.filter(c => c.state === 'completed').length
    };
    
    const totalStates = Object.values(stateDistribution).reduce((a, b) => a + b, 0);
    const statePercentages = totalStates > 0 ? {
      affiliated: ((stateDistribution.affiliated / totalStates) * 100).toFixed(1),
      contacted: ((stateDistribution.contacted / totalStates) * 100).toFixed(1),
      visited: ((stateDistribution.visited / totalStates) * 100).toFixed(1),
      completed: ((stateDistribution.completed / totalStates) * 100).toFixed(1)
    } : { affiliated: 0, contacted: 0, visited: 0, completed: 0 };

    // Top performing clients
    const topClients = [...clients]
      .filter(c => (c.referrals_count || 0) > 0)
      .sort((a, b) => (b.referrals_count || 0) - (a.referrals_count || 0))
      .slice(0, 5);

    // Calculate commission
    const totalCommission = totalClientReferrals * 25; // $25 per referral
    const monthlyCommission = vendorDetailed?.monthly?.commission || 0;

    return (
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clients"
            value={totalClients}
            change={formatTrendData(vendorTrends, 'clients')?.change || 0}
            changeType={formatTrendData(vendorTrends, 'clients')?.changeType || "neutral"}
            icon={UsersIcon}
            gradient="from-orange-500 to-amber-500"
            description={t.vendor.assignedClients}
            trend={formatTrendData(vendorTrends, 'clients')?.data || [0, 0, 0, 0, 0, 0, 0]}
            periodText="vs last period"
            trendPeriodText="Last 7 days"
            animated
          />
          
          <StatsCard
            title="Total Commission"
            value={`$${totalCommission.toLocaleString()}`}
            change={formatTrendData(vendorTrends, 'commission')?.change || 0}
            changeType={formatTrendData(vendorTrends, 'commission')?.changeType || "neutral"}
            icon={CurrencyDollarIcon}
            gradient="from-green-500 to-emerald-500"
            description={t.vendor.totalEarnings}
            trend={formatTrendData(vendorTrends, 'commission')?.data || [0, 0, 0, 0, 0, 0, 0]}
            periodText="vs last period"
            trendPeriodText="Last 7 days"
          />
          
          <StatsCard
            title="Client Referrals"
            value={totalClientReferrals}
            change={0}
            changeType="neutral"
            icon={LinkIcon}
            gradient="from-red-500 to-pink-500"
            description={t.vendor.totalReferrals}
            trend={[0, 0, 0, 0, 0, 0, 0]}
            periodText="all time"
            trendPeriodText="Last 7 days"
            animated
          />
          
          <StatsCard
            title="Active Clients"
            value={`${clientsWithReferrals}/${totalClients}`}
            change={0}
            changeType="neutral"
            icon={ArrowTrendingUpIcon}
            gradient="from-orange-500 to-red-500"
            description={t.vendor.makingReferrals}
            trend={[0, 0, 0, 0, 0, 0, 0]}
            periodText={`${totalClients > 0 ? ((clientsWithReferrals / totalClients) * 100).toFixed(1) : 0}% active`}
            trendPeriodText="Last 7 days"
          />
        </div>

        {/* Client State Distribution & Monthly Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client State Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <ChartBarIcon className="w-5 h-5 text-orange-500 mr-2" />
              Client State Distribution
            </h3>
            
            <div className="space-y-4">
              {/* Affiliated */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Affiliated</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{stateDistribution.affiliated}</span>
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
                    <PhoneLucide className="w-6 h-6 mr-2 text-red-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Contacted</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-red-600">{stateDistribution.contacted}</span>
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
                    <HomeLucide className="w-6 h-6 mr-2 text-orange-500" />
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Visited</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-600">{stateDistribution.visited}</span>
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
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Completed</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-success-600">{stateDistribution.completed}</span>
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

            <div className="mt-6 pt-4 border-t border-secondary-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600 dark:text-secondary-400">Completion Rate</span>
                <span className="text-lg font-bold text-success-600">
                  {vendorDetailed?.performance_metrics?.completion_rate?.toFixed(1) || '0.0'}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <CalendarIcon className="w-5 h-5 text-success-500 mr-2" />
              Monthly Performance
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">New Clients</p>
                  <p className="text-3xl font-bold text-orange-600">{vendorDetailed?.monthly?.new_clients || 0}</p>
                </div>
                <UserPlusIcon className="w-12 h-12 text-orange-500 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Monthly Referrals</p>
                  <p className="text-3xl font-bold text-red-600">{vendorDetailed?.monthly?.referrals || 0}</p>
                </div>
                <LinkIcon className="w-12 h-12 text-red-500 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-emerald-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Monthly Commission</p>
                  <p className="text-3xl font-bold text-success-600">${monthlyCommission}</p>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 text-success-500 opacity-50" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-100 rounded-lg">
                <div>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">Avg per Client</p>
                  <p className="text-3xl font-bold text-amber-600">{avgReferralsPerClient}</p>
                </div>
                <ChartBarIcon className="w-12 h-12 text-amber-500 opacity-50" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Performing Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
            <TrophyIcon className="w-5 h-5 text-amber-500 mr-2" />
            Top Performing Clients
          </h3>
          
          {topClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {topClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="relative p-4 bg-gradient-to-br from-secondary-50 to-white rounded-xl border-2 border-secondary-200 hover:border-orange-300 hover:shadow-lg transition-[border-color,box-shadow] duration-300 dark:from-secondary-800/80 dark:to-secondary-900/90 dark:border-secondary-600 dark:hover:border-orange-500/50"
                >
                  {/* Ranking Badge */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-amber-500' :
                    index === 1 ? 'bg-secondary-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-secondary-300'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Client Info */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1 truncate w-full">
                      {client.username}
                    </h4>
                    
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-3 truncate w-full">
                      {client.email}
                    </p>

                    {/* Stats */}
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between px-3 py-1 bg-orange-50 rounded-lg">
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">Referrals</span>
                        <span className="text-sm font-bold text-orange-600">{client.referrals_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between px-3 py-1 bg-success-50 rounded-lg">
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">Commission</span>
                        <span className="text-sm font-bold text-success-600">${(client.referrals_count * 25)}</span>
                      </div>

                      {/* State Badge */}
                      <div className="pt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateLabel(client.state || 'affiliated').color}`}>
                          {React.createElement(getStateLabel(client.state || 'affiliated').icon, { className: 'w-3 h-3 mr-1.5' })}
                          {getStateLabel(client.state || 'affiliated').label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrophyIcon className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Active Clients Yet</h4>
              <p className="text-secondary-500 dark:text-secondary-400">Your clients will appear here once they start making referrals.</p>
            </div>
          )}
        </motion.div>

        {/* Client Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <ChartBarIcon className="w-5 h-5 text-orange-500 mr-2" />
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-sm text-secondary-700 dark:text-secondary-300">Contact Rate</span>
                <span className="text-lg font-bold text-orange-600">
                  {vendorDetailed?.performance_metrics?.contact_rate?.toFixed(1) || '0.0'}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-sm text-secondary-700 dark:text-secondary-300">Completion Rate</span>
                <span className="text-lg font-bold text-success-600">
                  {vendorDetailed?.performance_metrics?.completion_rate?.toFixed(1) || '0.0'}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-sm text-secondary-700 dark:text-secondary-300">Avg Referrals/Client</span>
                <span className="text-lg font-bold text-red-600">{avgReferralsPerClient}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <span className="text-sm text-secondary-700 dark:text-secondary-300">Revenue per Client</span>
                <span className="text-lg font-bold text-amber-600">
                  ${totalClients > 0 ? (totalCommission / totalClients).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Commission Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-premium p-6"
          >
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 text-success-500 mr-2" />
              Commission Breakdown
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-br from-success-50 to-emerald-50 rounded-lg border border-success-200">
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Total Commission</p>
                <p className="text-3xl font-bold text-success-600">${totalCommission.toLocaleString()}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">From {totalClientReferrals} referrals</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">This Month</p>
                <p className="text-3xl font-bold text-orange-600">${monthlyCommission}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                  {totalCommission > 0 ? ((monthlyCommission / totalCommission) * 100).toFixed(1) : 0}% of total
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">Commission Rate</p>
                <p className="text-3xl font-bold text-red-600">$25</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">Per referral</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const handleSystemSettingsSubmit = () => {
    const { name, currentPassword, newPassword, confirmPassword } = systemSettings;
    
    // Validations
    if (!name.trim()) {
      toast.error(t.settings.nameRequired);
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
            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center">
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

  if (loading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      {/* Sidebar - Always visible */}
      <div className={`${sidebarCollapsed ? 'hidden' : 'block'} lg:block`}>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={logout}
          notificationsCount={notificationsCount}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          userType="vendor"
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
          notificationsCount={notificationsCount}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSettingsClick={() => {
            setActiveView('settings');
            navigate('/vendor/settings');
          }}
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

      {/* Client Details Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Client Details"
        size="large"
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-glow">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">{selectedClient.username}</h3>
                <p className="text-secondary-600 dark:text-secondary-400">{selectedClient.email}</p>
                <p className="text-secondary-600 dark:text-secondary-400">
                  {selectedClient.phone_numbers && selectedClient.phone_numbers.length > 0 
                    ? selectedClient.phone_numbers.join(', ') 
                    : 'No phone'}
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStateLabel(selectedClient.state || 'affiliated').color}`}>
                  {React.createElement(getStateLabel(selectedClient.state || 'affiliated').icon, { className: 'w-4 h-4 mr-2' })}
                  {getStateLabel(selectedClient.state || 'affiliated').label}
                </span>
              </div>
            </div>
            
            {selectedClient.referred_by_username && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-secondary-700 dark:text-secondary-300">
                  <span className="font-medium">Referred by:</span> {selectedClient.referred_by_username}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Total Referrals
                </label>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedClient.referrals_count || 0}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Reward Points
                </label>
                <p className="text-2xl font-bold text-amber-600">
                  {selectedClient.reward_points || 0}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Client Since
                </label>
                <p className="text-sm text-secondary-900 dark:text-secondary-100">
                  {new Date(selectedClient.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Current State
                </label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateLabel(selectedClient.state || 'affiliated').color}`}>
                  {getStateLabel(selectedClient.state || 'affiliated').label}
                </span>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Referral Code
                </label>
                <p className="text-sm text-secondary-900 dark:text-secondary-100 font-mono bg-secondary-100 px-3 py-2 rounded">
                  {selectedClient.referral_code}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-secondary-200 space-y-4">
              {/* State Timeline */}
              <div className="bg-secondary-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-4">Client Journey Progress</h4>
                <div className="flex items-center">
                  {['affiliated', 'contacted', 'visited', 'completed'].map((state, idx) => {
                    const currentStateIndex = ['affiliated', 'contacted', 'visited', 'completed'].indexOf(selectedClient.state || 'affiliated');
                    const isCompleted = idx < currentStateIndex;
                    const isCurrent = idx === currentStateIndex;
                    const isNext = idx === currentStateIndex + 1;
                    const StateIcon = getStateLabel(state).icon;
                    
                    return (
                      <React.Fragment key={state}>
                        <div className="flex flex-col items-center" style={{ width: '80px' }}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-[transform,box-shadow] duration-300 ${
                            isCompleted ? 'bg-success-500 text-white ring-2 ring-success-200' :
                            isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-200 scale-110' :
                            isNext ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-300 animate-pulse' :
                            'bg-secondary-200 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-300'
                          }`}>
                            {isCompleted ? (
                              <CheckIcon className="w-6 h-6" />
                            ) : (
                              <StateIcon className="w-6 h-6" />
                            )}
                          </div>
                          <span className={`text-xs mt-2 font-semibold text-center ${
                            isCurrent ? 'text-orange-600' :
                            isNext ? 'text-orange-500' :
                            isCompleted ? 'text-success-600' :
                            'text-secondary-400'
                          }`}>
                            {getStateLabel(state).label}
                          </span>
                        </div>
                        {idx < 3 && (
                          <div className={`h-1.5 rounded transition-[background-color] duration-300`} style={{ width: 'calc(100% / 3 - 80px)' }}>
                            <div className={`h-full rounded ${
                              idx < currentStateIndex ? 'bg-success-500' :
                              idx === currentStateIndex ? 'bg-gradient-to-r from-orange-500 to-orange-200' :
                              'bg-secondary-200'
                            }`} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {getNextStateLabel(selectedClient.state || 'affiliated') ? (
                <Button 
                  variant="primary" 
                  size="default" 
                  className="w-full"
                  onClick={() => {
                    advanceClientState(selectedClient.id);
                  }}
                  disabled={advancingState === selectedClient.id}
                >
                  {advancingState === selectedClient.id 
                    ? 'Advancing...' 
                    : `Advance Client to ${getNextStateLabel(selectedClient.state || 'affiliated').label}`
                  }
                </Button>
              ) : (
                <div className="text-center py-3 bg-success-50 border border-success-200 rounded-lg text-success-700 font-medium flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 mr-2" />
                  Sale Completed - Client at Final State!
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SellerDashboard;
