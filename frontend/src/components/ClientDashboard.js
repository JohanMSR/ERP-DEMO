import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { 
  LinkIcon,
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
import RewardCardVisual from './RewardCardVisual';
import toast from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from './ui/Sidebar';
import TopBar from './ui/TopBar';
import StatsCard from './ui/StatsCard';
import AnalyticsDashboard from './AnalyticsDashboard';
import ClientGiftsHome from './enrola/ClientGiftsHome';
import ClientWalletView from './enrola/ClientWalletView';
import ClientClubView from './enrola/ClientClubView';
import ClientEnterpriseHub from './enrola/ClientEnterpriseHub';
import ProgramReferralCard from './enrola/ProgramReferralCard';
import ReferralTierStepper from './enrola/ReferralTierStepper';
import NextTierBenefitCard from './enrola/NextTierBenefitCard';
import AnimatedStatNumber from './enrola/AnimatedStatNumber';
import InviteeStatusTimeline from './enrola/InviteeStatusTimeline';
import ReferralInviteEmptyState from './enrola/ReferralInviteEmptyState';
import NotificationsCenter from './NotificationsCenter';
import SettingsPanel from './SettingsPanel';
import { FullPageSkeleton, CenteredLoaderSkeleton, RewardsViewSkeleton } from './ui/PageSkeleton';
import EmptyState from './ui/EmptyState';

function ClientDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { unreadCount, updateCount, refreshCount } = useNotifications();
  const [referralLinks, setReferralLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile
  const [searchValue, setSearchValue] = useState('');
  
  // Network data state
  const [networkData, setNetworkData] = useState([]);
  const [networkLoading, setNetworkLoading] = useState(true);
  
  // Rewards data state
  const [rewardsSummary, setRewardsSummary] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [rewardConfetti, setRewardConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0 });

  const fireRewardConfetti = useCallback(() => {
    setRewardConfetti(true);
    setTimeout(() => setRewardConfetti(false), 4500);
  }, []);

  useEffect(() => {
    const onResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
          { id: 1, name: 'Maria Rodriguez', email: 'maria@example.com', referrals: 5, joined: '2024-01-15', status: 'active', pipeline: 'paid' },
          { id: 2, name: 'John Smith', email: 'john@example.com', referrals: 3, joined: '2024-02-20', status: 'active', pipeline: 'verified' },
          { id: 3, name: 'Ana Garcia', email: 'ana@example.com', referrals: 8, joined: '2024-01-10', status: 'active', pipeline: 'registered' },
          { id: 4, name: 'Carlos Lopez', email: 'carlos@example.com', referrals: 2, joined: '2024-03-05', status: 'pending', pipeline: 'verified' },
        ]);
      } finally {
        setNetworkLoading(false);
      }
    };

    if (activeView === 'network') {
      fetchNetworkData();
    }
  }, [activeView]);

  // Fetch rewards data
  useEffect(() => {
    const fetchRewardsData = async () => {
      setRewardsLoading(true);
      try {
        const [summaryResponse, rewardsResponse, historyResponse] = await Promise.all([
          axios.get('/api/client/rewards/summary', { withCredentials: true }),
          axios.get('/api/client/rewards/available', { withCredentials: true }),
          axios.get('/api/client/rewards/points-history', { withCredentials: true })
        ]);
        
        setRewardsSummary(summaryResponse.data);
        setAvailableRewards(rewardsResponse.data);
        setPointsHistory(historyResponse.data);
      } catch (error) {
        console.error('Error fetching rewards data:', error);
        toast.error('Failed to load rewards data');
      } finally {
        setRewardsLoading(false);
      }
    };

    if (activeView === 'rewards') {
      fetchRewardsData();
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

  const mapDualPrograms = (links) => {
    const list = Array.isArray(links) ? links : [];
    const isClients = (l) =>
      l.program_type === 'clients' ||
      l.program === 'clientes' ||
      l.program === 'clients';
    const isPartners = (l) =>
      l.program_type === 'partners' ||
      l.program === 'socios' ||
      l.program === 'partners';
    let clientsLink = list.find(isClients);
    let partnersLink = list.find(isPartners);
    if (!clientsLink && list[0]) clientsLink = list[0];
    if (!partnersLink && list[1]) partnersLink = list[1];
    if (!clientsLink) clientsLink = { link_code: 'ENROLA-CLI', id: 'demo-cli' };
    if (!partnersLink) partnersLink = { link_code: 'ENROLA-SOC', id: 'demo-soc' };
    return { clientsLink, partnersLink };
  };

  // Calculate stats
  const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalConversions = referralLinks.reduce((sum, link) => sum + (link.conversions || 0), 0);
  const activeLinks = referralLinks.filter(link => link.is_active !== false).length;

  // Weekly stats
  const thisWeekClicks = Math.floor(totalClicks * 0.3);
  const weeklyGrowth = 12.5;

  if (loading) {
    return <FullPageSkeleton />;
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
        return t.enrola?.programs || 'Referral programs';
      case 'network':
        return 'Network';
      case 'rewards':
        return 'Rewards';
      case 'wallet':
        return t.enrola?.wallet || 'Wallet';
      case 'club':
        return t.enrola?.club || 'Shopping club';
      case 'corporate':
        return t.enrola?.corporate || 'Corporate';
      case 'notifications':
        return 'Notifications';
      case 'settings':
        return 'Settings';
      default:
        return t.enrola?.giftsHome || 'Gifts';
    }
  };

  const getPageSubtitle = () => {
    switch (activeView) {
      case 'analytics':
        return 'Track your performance and growth metrics';
      case 'referrals':
        return 'Dos programas: clientes y socios — enlaces y QR distintos';
      case 'network':
        return 'Your referral network and connections';
      case 'rewards':
        return t.dashboard.viewRewardPoints;
      case 'wallet':
        return 'Puntos, dinero habilitado y listo para cobrar';
      case 'club':
        return 'Productos y servicios del club de compras';
      case 'corporate':
        return 'E-sign, post-venta y ELANTAR One (corporativo)';
      case 'notifications':
        return 'Stay updated with the latest activities';
      case 'settings':
        return 'Customize your account and preferences';
      default:
        return 'Regalos con foto, gamificación y beneficios Enrola';
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
      case 'rewards':
        return renderRewardsView();
      case 'wallet':
        return <ClientWalletView />;
      case 'club':
        return <ClientClubView />;
      case 'corporate':
        return <ClientEnterpriseHub />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-premium p-6 sm:p-8 bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-orange-200/50"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-glow">
              <RocketLaunchIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-1">
                {t.dashboard.welcomeBack.replace('{name}', user?.username || t.common.user)}!
              </h2>
              <p className="text-sm sm:text-base text-secondary-600 dark:text-secondary-400">
                {t.dashboard.crushingIt}
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
              {t.dashboard.proMember}
            </span>
          </div>
        </div>
      </motion.div>

      <ClientGiftsHome
        userPoints={userStats?.rewardPoints ?? 0}
        onOpenRewards={() => setActiveView('rewards')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
          title={t.dashboard.conversions}
          value={userStats?.totalConversions || totalConversions}
          change={formatTrendData(analyticsData, 'conversions')?.change || 8.7}
          changeType={formatTrendData(analyticsData, 'conversions')?.changeType || 'positive'}
          icon={ArrowTrendingUpIcon}
          gradient="from-red-500 to-pink-500"
          description={t.dashboard.successfulReferralConversions}
          trend={formatTrendData(analyticsData, 'conversions')?.data || [3, 5, 4, 7, 6, 9, 8]}
          periodText={formatTrendData(analyticsData, 'conversions')?.period || 'vs last period'}
          trendPeriodText={formatTrendData(analyticsData, 'conversions')?.period || 'Last 7 days'}
          animated
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-secondary-100">
            Tus programas (vista previa)
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Solo dos enlaces fijos: clientes y socios. Abre la sección completa en el menú.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const { clientsLink, partnersLink } = mapDualPrograms(referralLinks);
              return (
                <>
                  <ProgramReferralCard programKey="clients" link={clientsLink} />
                  <ProgramReferralCard programKey="partners" link={partnersLink} />
                </>
              );
            })()}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card-premium p-6"
          >
            <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
              <StarIcon className="w-5 h-5 text-amber-500 mr-2" />
              This Week&apos;s Performance
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
                Programas de referidos
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('wallet')}
                className="w-full btn-ghost text-left justify-start"
              >
                <CurrencyDollarIcon className="w-4 h-4 mr-3" />
                Wallet
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('club')}
                className="w-full btn-ghost text-left justify-start"
              >
                <UserGroupIcon className="w-4 h-4 mr-3" />
                Club de compras
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

  const renderReferralsView = () => {
    const { clientsLink, partnersLink } = mapDualPrograms(referralLinks);
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            {t.enrola?.programs || 'Referral programs'}
          </h2>
          <p className="text-secondary-600 dark:text-secondary-400 max-w-3xl">
            Gana confianza con un flujo claro: tu nivel, tus números y dos enlaces (clientes y socios) con QR y kit para compartir.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ReferralTierStepper totalReferrals={totalConversions} />
          </div>
          <div className="lg:col-span-4 flex">
            <NextTierBenefitCard totalReferrals={totalConversions} className="w-full" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 rounded-3xl border border-white/50 bg-white/70 p-5 shadow-soft backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">Clics</p>
            <p className="mt-1 text-3xl font-bold text-secondary-900 dark:text-secondary-100 tabular-nums">
              <AnimatedStatNumber value={totalClicks} />
            </p>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">En todos tus enlaces</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-4 rounded-3xl border border-white/50 bg-white/70 p-5 shadow-soft backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">Conversiones</p>
            <p className="mt-1 text-3xl font-bold text-orange-600 tabular-nums">
              <AnimatedStatNumber value={totalConversions} />
            </p>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">Registros vía tu enlace</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 rounded-3xl border border-white/50 bg-gradient-to-br from-amber-50/90 to-orange-50/50 p-5 shadow-soft"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">Enlaces activos</p>
            <p className="mt-1 text-3xl font-bold text-secondary-900 dark:text-secondary-100 tabular-nums">
              <AnimatedStatNumber value={activeLinks} />
            </p>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">Programas disponibles</p>
          </motion.div>

          <div className="lg:col-span-6">
            <ProgramReferralCard programKey="clients" link={clientsLink} />
          </div>
          <div className="lg:col-span-6">
            <ProgramReferralCard programKey="partners" link={partnersLink} />
          </div>
        </div>
      </div>
    );
  };

  const renderNetworkView = () => {
    if (networkLoading) {
      return <CenteredLoaderSkeleton messageWidth={220} />;
    }

    if (!networkData.length) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Tu red</h2>
            <p className="text-secondary-600 dark:text-secondary-400">Personas que invitaste a la plataforma</p>
          </div>
          <ReferralInviteEmptyState onOpenPrograms={() => setActiveView('referrals')} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Tu red</h2>
          <p className="text-secondary-600 dark:text-secondary-400">Cada invitado muestra su camino: registrado → verificado → recompensa pagada.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Total referidos</span>
                <span className="font-semibold tabular-nums">
                  <AnimatedStatNumber value={networkData.length} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Activos</span>
                <span className="font-semibold tabular-nums">
                  <AnimatedStatNumber value={networkData.filter(n => n.status === 'active').length} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600 dark:text-secondary-400">Referidos generados</span>
                <span className="font-semibold tabular-nums">
                  <AnimatedStatNumber value={networkData.reduce((sum, n) => sum + (n.referrals || 0), 0)} />
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card-premium overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Miembros</h3>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Línea de tiempo del estado del referido</p>
              </div>
              <div className="divide-y divide-white/20">
                {networkData.map((member, index) => (
                  <div key={`member-${member.id}-${index}`} className="p-4 hover:bg-secondary-50/30 transition-colors">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-secondary-900 dark:text-secondary-100 truncate">{member.name}</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{member.referrals} referidos</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{t.dashboard.joined} {new Date(member.joined).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 sm:pl-12">
                      <InviteeStatusTimeline member={member} />
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

  const renderRewardsView = () => {
    if (rewardsLoading) {
      return <RewardsViewSkeleton />;
    }

    return (
      <>
        {rewardConfetti && (
          <div className="pointer-events-none fixed inset-0 z-[200]">
            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={320} gravity={0.22} />
          </div>
        )}
      <div className="space-y-6">
        {/* Rewards — bento layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="md:col-span-5 card-premium p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/30 border border-orange-100/60 shadow-soft rounded-3xl dark:from-secondary-900/80 dark:to-orange-950/20 dark:border-orange-500/15"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Puntos actuales</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-glow">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mb-2">
              <p className="text-4xl font-bold text-orange-600 tabular-nums">
                <AnimatedStatNumber value={rewardsSummary?.current_points || 0} />
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                Total histórico:{' '}
                <span className="font-semibold text-secondary-800 tabular-nums">
                  <AnimatedStatNumber value={rewardsSummary?.total_points_earned || 0} />
                </span>{' '}
                pts
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="md:col-span-4 card-premium p-6 rounded-3xl shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Tus referidos</h3>
              <UserGroupIcon className="w-8 h-8 text-orange-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Total</span>
                <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 tabular-nums">
                  <AnimatedStatNumber value={rewardsSummary?.total_referrals || 0} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Activos</span>
                <span className="text-lg font-semibold text-amber-600 tabular-nums">
                  <AnimatedStatNumber value={rewardsSummary?.active_referrals || 0} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Completados</span>
                <span className="text-lg font-semibold text-success-600 tabular-nums">
                  <AnimatedStatNumber value={rewardsSummary?.completed_referrals || 0} />
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:col-span-3 card-premium p-6 bg-gradient-to-br from-success-50/50 to-emerald-50/30 border border-emerald-100/50 rounded-3xl shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Siguiente meta</h3>
              <SparklesIcon className="w-8 h-8 text-success-500" />
            </div>
            {rewardsSummary?.next_reward ? (
              <div>
                <p className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  {rewardsSummary.next_reward.name}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                  Faltan {rewardsSummary.next_reward.points_needed} pts
                </p>
                <div className="w-full bg-secondary-100 rounded-full h-3 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rewardsSummary.next_reward.progress_percentage}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-success-500 to-emerald-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                  {rewardsSummary.next_reward.progress_percentage}% completado
                </p>
              </div>
            ) : (
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                No hay más metas o ya las alcanzaste.
              </p>
            )}
          </motion.div>
        </div>

        {/* Available Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">Available Rewards</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Redeem your points for amazing rewards
              </p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-orange-500" />
          </div>

          {availableRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRewards.map((reward, index) => (
                <motion.article
                  key={reward.id}
                  aria-label={reward.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  className={`interactive-lift overflow-hidden rounded-2xl border-2 bg-white dark:bg-secondary-900 transition-[border-color,box-shadow] duration-300 flex flex-col focus-within:ring-2 focus-within:ring-orange-400/40 ${
                    reward.can_redeem
                      ? 'border-success-400 shadow-lg shadow-success-500/15 ring-1 ring-success-300/50'
                      : 'border-secondary-200 dark:border-secondary-700 opacity-95 hover:opacity-100'
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                    <RewardCardVisual reward={reward} />
                    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      <StarIcon className="w-4 h-4 text-amber-400" />
                      {reward.points_required} pts
                    </div>
                    {reward.can_redeem && (
                      <span className="absolute top-3 left-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-500 text-white shadow-sm">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 flex-1">
                      {reward.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                          {reward.points_required}
                        </span>
                        <span className="text-sm text-secondary-600 dark:text-secondary-400">points</span>
                      </div>
                      {!reward.can_redeem && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {reward.points_needed} more needed
                        </span>
                      )}
                    </div>

                    {reward.can_redeem && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          fireRewardConfetti();
                          toast.success('¡Recompensa reclamada!');
                        }}
                        className="mt-4 w-full rounded-xl bg-gradient-to-r from-success-600 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md"
                      >
                        Reclamar recompensa
                      </motion.button>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SparklesIcon}
              title="No rewards available at the moment"
              description="Check back later for exciting rewards!"
            />
          )}
        </motion.div>

        {/* Points History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">{t.dashboard.pointsHistory}</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {t.dashboard.trackEarnedPoints}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-orange-500" />
          </div>

          {pointsHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {t.dashboard.date}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {t.dashboard.event}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {t.dashboard.referredClient}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-900 dark:text-secondary-100">
                      {t.dashboard.pointsEarned}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pointsHistory.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-secondary-100 hover:bg-secondary-50/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-secondary-600 dark:text-secondary-400">
                        {record.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            record.to_state === 'completed' 
                              ? 'bg-success-100 text-success-700'
                              : record.to_state === 'visited'
                              ? 'bg-orange-100 text-orange-700'
                              : record.to_state === 'contacted'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800/60 dark:text-secondary-300'
                          }`}>
                            {record.from_state} → {record.to_state}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary-900 dark:text-secondary-100">
                        {record.referred_client}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center space-x-1 text-success-600 font-semibold">
                          <span>+{record.points_awarded}</span>
                          <StarIcon className="w-4 h-4" />
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-600 dark:text-secondary-400">{t.dashboard.noPointsHistoryYet}</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                {t.dashboard.startReferringClients}
              </p>
            </div>
          )}
        </motion.div>
      </div>
      </>
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
