import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  EyeIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  CurrencyDollarIcon,
  LinkIcon,
  FireIcon,
  UsersIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import CountUp from 'react-countup';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getChartTheme } from '../utils/chartTheme';
import { FullPageSkeleton } from './ui/PageSkeleton';

function AnalyticsDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const chart = getChartTheme(isDark);
  const [analytics, setAnalytics] = useState(null);
  const [detailedAnalytics, setDetailedAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (user?.is_admin) {
        await fetchAdminAnalytics();
      } else if (user?.is_vendor) {
        await fetchVendorAnalytics();
      } else if (user?.is_client) {
        await fetchClientAnalytics();
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      const [overviewResponse, trendsResponse] = await Promise.all([
        axios.get('/api/admin/analytics/overview', { withCredentials: true }),
        axios.get('/api/analytics/admin-trends', { withCredentials: true })
      ]);
      
      setAnalytics(overviewResponse.data);
      setTrends(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      throw error;
    }
  };

  const fetchVendorAnalytics = async () => {
    try {
      const [basicResponse, detailedResponse, trendsResponse] = await Promise.all([
        axios.get('/api/vendor/analytics', { withCredentials: true }),
        axios.get('/api/vendor/analytics/detailed', { withCredentials: true }),
        axios.get('/api/vendor/trends', { withCredentials: true })
      ]);
      
      setAnalytics(basicResponse.data);
      setDetailedAnalytics(detailedResponse.data);
      setTrends(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      throw error;
    }
  };

  const fetchClientAnalytics = async () => {
    try {
      const [statsResponse, trendsResponse] = await Promise.all([
        axios.get('/api/stats', { withCredentials: true }),
        axios.get('/api/analytics/trends', { withCredentials: true })
      ]);
      
      setAnalytics(statsResponse.data);
      setTrends(trendsResponse.data);
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      throw error;
    }
  };

  // Render functions for each user type
  const renderAdminAnalytics = () => {
    if (!analytics || !trends) return null;

  const stats = [
    {
        name: 'Total Users',
        value: analytics.users?.total || 0,
        change: trends.users?.change || 0,
        changeType: trends.users?.changeType || 'neutral',
        icon: UsersIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
        name: 'Total Referrals',
        value: analytics.referrals?.total || 0,
        change: trends.referrals?.change || 0,
        changeType: trends.referrals?.changeType || 'neutral',
        icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
        name: 'Platform Revenue',
        value: `$${(analytics.revenue?.total || 0).toLocaleString()}`,
        change: trends.revenue?.change || 0,
        changeType: trends.revenue?.changeType || 'neutral',
        icon: CurrencyDollarIcon,
        color: 'text-success-600',
        bgColor: 'bg-success-100'
      }
    ];

    // Prepare daily data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = days.map((day, index) => ({
      day,
      users: trends.users?.data?.[index] || 0,
      referrals: trends.referrals?.data?.[index] || 0,
      revenue: trends.revenue?.data?.[index] || 0
    }));

    // Client states for pie chart
    const clientStates = analytics.client_states || {};
    const stateData = [
      { name: 'Affiliated', value: clientStates.affiliated || 0, color: '#fb923c' },
      { name: 'Contacted', value: clientStates.contacted || 0, color: '#f59e0b' },
      { name: 'Visited', value: clientStates.visited || 0, color: '#f97316' },
      { name: 'Completed', value: clientStates.completed || 0, color: '#22c55e' }
    ];

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={stat.name} className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
        </div>
                {stat.changeType !== 'neutral' && (
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
      </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-semibold text-secondary-900 dark:text-secondary-100">
                  {typeof stat.value === 'number' ? (
                    <CountUp end={stat.value} duration={2} />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Activity */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600 mr-2" />
              Platform Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="day" stroke={chart.axis} />
                <YAxis stroke={chart.axis} />
                <Tooltip 
                  contentStyle={chart.tooltip}
                />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#f97316" fill="#fb923c" fillOpacity={0.6} name="New Users" />
                <Area type="monotone" dataKey="referrals" stackId="2" stroke="#22c55e" fill="#86efac" fillOpacity={0.6} name="Referrals" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Client States Distribution */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <TrophyIcon className="h-5 w-5 text-orange-600 mr-2" />
              Client States Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {stateData.map((state, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }}></div>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">{state.name}</span>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 ml-auto">{state.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Vendors */}
          <div className="card-premium overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 flex items-center">
                <StarIcon className="h-5 w-5 text-orange-600 mr-2" />
                Top Vendors
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {(analytics.top_performers?.vendors || []).slice(0, 5).map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-secondary-400' : index === 2 ? 'bg-orange-600' : 'bg-secondary-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">{vendor.username}</p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">{vendor.clients_count} clients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success-600">{vendor.referrals_count}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">referrals</p>
                    </div>
                  </div>
                ))}
                {(!analytics.top_performers?.vendors || analytics.top_performers.vendors.length === 0) && (
                  <p className="text-center text-secondary-500 dark:text-secondary-400 py-8">No vendors yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="card-premium overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 flex items-center">
                <StarIcon className="h-5 w-5 text-success-600 mr-2" />
                Top Clients
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {(analytics.top_performers?.clients || []).slice(0, 5).map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
            <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-secondary-400' : index === 2 ? 'bg-orange-600' : 'bg-secondary-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-secondary-100">{client.username}</p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">{client.reward_points} points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-orange-600">{client.referrals_count}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">referrals</p>
                    </div>
                  </div>
                ))}
                {(!analytics.top_performers?.clients || analytics.top_performers.clients.length === 0) && (
                  <p className="text-center text-secondary-500 dark:text-secondary-400 py-8">No active clients yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderVendorAnalytics = () => {
    if (!analytics || !trends) return null;

    const stats = [
      {
        name: 'Total Clients',
        value: analytics.totalClients || 0,
        change: trends.clients?.change || 0,
        changeType: trends.clients?.changeType || 'neutral',
        icon: UsersIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      {
        name: 'Total Referrals',
        value: analytics.totalReferrals || 0,
        change: trends.referrals?.change || 0,
        changeType: trends.referrals?.changeType || 'neutral',
        icon: UserGroupIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        name: 'Total Commission',
        value: `$${(analytics.totalCommission || 0).toLocaleString()}`,
        change: trends.commission?.change || 0,
        changeType: trends.commission?.changeType || 'neutral',
        icon: CurrencyDollarIcon,
        color: 'text-success-600',
        bgColor: 'bg-success-100'
      },
      {
        name: 'Active Clients',
        value: `${(analytics.activeClientPercentage || 0).toFixed(1)}%`,
        change: 0,
        changeType: 'neutral',
        icon: FireIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    ];

    // Prepare daily data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = days.map((day, index) => ({
      day,
      clients: trends.clients?.data?.[index] || 0,
      referrals: trends.referrals?.data?.[index] || 0,
      commission: trends.commission?.data?.[index] || 0
    }));

    // Client states from detailed analytics
    const clientStates = detailedAnalytics?.client_states || {};
    const stateData = [
      { name: 'Affiliated', value: clientStates.affiliated || 0, color: '#fb923c' },
      { name: 'Contacted', value: clientStates.contacted || 0, color: '#f59e0b' },
      { name: 'Visited', value: clientStates.visited || 0, color: '#f97316' },
      { name: 'Completed', value: clientStates.completed || 0, color: '#22c55e' }
    ];

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={stat.name} className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.changeType !== 'neutral' && (
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                    <span>{Math.abs(stat.change)}%</span>
                </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-semibold text-secondary-900 dark:text-secondary-100">
                  {typeof stat.value === 'number' ? (
                  <CountUp end={stat.value} duration={2} />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Trends */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600 mr-2" />
              Performance Trends (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis dataKey="day" stroke={chart.axis} />
                <YAxis stroke={chart.axis} />
                <Tooltip 
                  contentStyle={chart.tooltip}
                />
                <Bar dataKey="referrals" fill="#fb923c" radius={[8, 8, 0, 0]} name="Referrals" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Client States Distribution */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <TrophyIcon className="h-5 w-5 text-orange-600 mr-2" />
              Client Progress States
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {stateData.map((state, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: state.color }}></div>
                  <span className="text-sm text-secondary-600 dark:text-secondary-400">{state.name}</span>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 ml-auto">{state.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Performance & Top Client */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Performance */}
          {detailedAnalytics && (
            <div className="card-premium p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-success-600 mr-2" />
                This Month Performance
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">New Clients</span>
                  <span className="text-2xl font-semibold text-orange-600">
                    {detailedAnalytics.monthly?.new_clients || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">New Referrals</span>
                  <span className="text-2xl font-semibold text-success-600">
                    {detailedAnalytics.monthly?.referrals || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Commission Earned</span>
                  <span className="text-2xl font-semibold text-amber-600">
                    ${(detailedAnalytics.monthly?.commission || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Top Client */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
              <StarIcon className="h-5 w-5 text-amber-600 mr-2" />
              Top Performing Client
            </h3>
            {analytics.topClient ? (
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl">
                <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                  <TrophyIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{analytics.topClient.username}</p>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {analytics.topClient.referrals_count} successful referrals
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-secondary-500 dark:text-secondary-400">No client data available yet</p>
              </div>
            )}
          </div>
                    </div>
      </>
    );
  };

  const renderClientAnalytics = () => {
    if (!analytics || !trends) return null;

    const stats = [
      {
        name: 'Total Clicks',
        value: analytics.totalClicks || 0,
        change: trends.clicks?.change || 0,
        changeType: trends.clicks?.changeType || 'neutral',
        icon: EyeIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      },
      {
        name: 'Conversions',
        value: analytics.totalConversions || 0,
        change: trends.conversions?.change || 0,
        changeType: trends.conversions?.changeType || 'neutral',
        icon: UserGroupIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        name: 'Active Links',
        value: analytics.activeLinks || 0,
        change: 0,
        changeType: 'neutral',
        icon: LinkIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ];

    // Prepare daily data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyData = days.map((day, index) => ({
      day,
      clicks: trends.clicks?.data?.[index] || 0,
      conversions: trends.conversions?.data?.[index] || 0
    }));

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={stat.name} className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                {stat.changeType !== 'neutral' && (
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-semibold text-secondary-900 dark:text-secondary-100">
                  {typeof stat.value === 'number' ? (
                    <CountUp end={stat.value} duration={2} />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
                  </div>
          ))}
        </div>

        <div className="card-premium p-6 mb-8">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-6 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600 mr-2" />
            Clicks & Conversions (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
              <XAxis dataKey="day" stroke={chart.axis} />
              <YAxis stroke={chart.axis} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                }}
              />
              <Area type="monotone" dataKey="clicks" stackId="1" stroke="#fb923c" fill="#fb923c" fillOpacity={0.3} name="Clicks" />
              <Area type="monotone" dataKey="conversions" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6">
            <div className="flex items-center space-x-3 mb-4">
              <LinkIcon className="h-8 w-8 text-orange-500" />
              <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Active Links</h4>
            </div>
            <p className="text-4xl font-semibold text-orange-600">{analytics.activeLinks || 0}</p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">Out of {analytics.totalLinks || 0} total links</p>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center space-x-3 mb-4">
              <UserGroupIcon className="h-8 w-8 text-success-500" />
              <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Referrals</h4>
            </div>
            <p className="text-4xl font-semibold text-success-600">{analytics.referralsCount || 0}</p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">Total successful referrals</p>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center space-x-3 mb-4">
              <StarIcon className="h-8 w-8 text-amber-500" />
              <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Reward Points</h4>
            </div>
            <p className="text-4xl font-semibold text-amber-600">{analytics.rewardPoints || 0}</p>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-2">Earn points with each referral milestone</p>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return <FullPageSkeleton statCards={3} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-glow">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">{t.admin.growthAnalytics}</h1>
            <p className="text-secondary-600 dark:text-secondary-400">
              {t.admin.advancedAnalytics}
            </p>
          </div>
        </div>
      </div>

      {/* Render appropriate analytics based on user type */}
      {user?.is_admin && renderAdminAnalytics()}
      {user?.is_vendor && renderVendorAnalytics()}
      {user?.is_client && renderClientAnalytics()}
    </div>
  );
}

export default AnalyticsDashboard;
