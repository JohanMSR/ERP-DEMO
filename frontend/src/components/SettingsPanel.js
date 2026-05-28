import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cog6ToothIcon, 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  PaintBrushIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';

function SettingsPanel() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('system');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      username: user?.username || '',
      email: user?.email || '',
      firstName: '',
      lastName: '',
      bio: '',
      avatar: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      newReferrals: true,
      conversions: true
    },
    privacy: {
      publicProfile: false,
      showStats: true,
      allowMessages: true,
      dataSharing: false
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY'
    },
    system: {
      name: user?.username || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const tabs = [
    { id: 'system', name: t.settings.systemSettings, icon: KeyIcon },
    { id: 'profile', name: t.settings.profile, icon: UserIcon },
    { id: 'notifications', name: t.settings.notifications, icon: BellIcon },
    { id: 'privacy', name: t.settings.privacy, icon: ShieldCheckIcon },
    { id: 'appearance', name: t.settings.appearance, icon: PaintBrushIcon }
  ];

  const handleSave = (section) => {
    toast.success(`${section} ${t.settings.savedSuccessfully}`);
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSystemSettingsSubmit = () => {
    const { name, currentPassword, newPassword, confirmPassword } = settings.system;
    
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

    setIsLoading(true);
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
        toast.success(t.settings.settingsUpdated);
        
        // Clear password fields
        setSettings(prev => ({
          ...prev,
          system: {
            ...prev.system,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
        
        setShowConfirmModal(false);
        setPendingChanges(null);
      } else {
        toast.error(data.error || t.settings.failedUpdate);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t.settings.errorUpdating);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelChanges = () => {
    setShowConfirmModal(false);
    setPendingChanges(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-premium p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-orange-200/50"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-glow">
            <Cog6ToothIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{t.settings.title}</h2>
            <p className="text-secondary-600 dark:text-secondary-400">{t.settings.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="card-premium p-4"
          >
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary-900 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-700 shadow-soft border border-orange-200/50 dark:from-orange-500/20 dark:to-amber-500/15 dark:text-orange-300 dark:border-orange-500/25'
                      : 'text-secondary-600 hover:bg-white/50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800/60 dark:hover:text-secondary-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{tab.name}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="card-premium p-6"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'system' && (
                    <motion.div
                      key="system"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-secondary-100 mb-4">{t.settings.systemSettings}</h3>
                        <p className="text-sm text-gray-600 dark:text-secondary-400 mb-6">{t.settings.updateAccount}</p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.name}</label>
                            <input
                              type="text"
                              value={settings.system.name}
                              onChange={(e) => handleChange('system', 'name', e.target.value)}
                              className="input-field"
                              placeholder={t.settings.yourName}
                            />
                          </div>

                          <div className="border-t border-gray-200 dark:border-secondary-700 pt-4 mt-6">
                            <h4 className="text-md font-semibold text-gray-900 dark:text-secondary-100 mb-4">{t.settings.changePassword}</h4>
                            <p className="text-sm text-gray-500 dark:text-secondary-400 mb-4">{t.settings.leaveEmpty}</p>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.currentPassword}</label>
                                <input
                                  type="password"
                                  value={settings.system.currentPassword}
                                  onChange={(e) => handleChange('system', 'currentPassword', e.target.value)}
                                  className="input-field"
                                  placeholder={t.settings.enterCurrentPassword}
                                  autoComplete="current-password"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.newPassword}</label>
                                <input
                                  type="password"
                                  value={settings.system.newPassword}
                                  onChange={(e) => handleChange('system', 'newPassword', e.target.value)}
                                  className="input-field"
                                  placeholder={t.settings.enterNewPassword}
                                  autoComplete="new-password"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.confirmNewPassword}</label>
                                <input
                                  type="password"
                                  value={settings.system.confirmPassword}
                                  onChange={(e) => handleChange('system', 'confirmPassword', e.target.value)}
                                  className="input-field"
                                  placeholder={t.settings.confirmNewPasswordPlaceholder}
                                  autoComplete="new-password"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleSystemSettingsSubmit}
                        className="btn-primary"
                      >
                        {t.settings.saveChanges}
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-secondary-100 mb-4">{t.settings.personalInfo}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.firstName}</label>
                            <input
                              type="text"
                              value={settings.profile.firstName}
                              onChange={(e) => handleChange('profile', 'firstName', e.target.value)}
                              className="input-field"
                              placeholder={t.settings.firstName}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.lastName}</label>
                            <input
                              type="text"
                              value={settings.profile.lastName}
                              onChange={(e) => handleChange('profile', 'lastName', e.target.value)}
                              className="input-field"
                              placeholder={t.settings.lastName}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.bio}</label>
                            <textarea
                              value={settings.profile.bio}
                              onChange={(e) => handleChange('profile', 'bio', e.target.value)}
                              className="input-field"
                              rows={3}
                              placeholder={t.settings.tellUs}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(t.settings.profile)}
                        className="btn-primary"
                      >
                        {t.settings.saveProfile}
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'notifications' && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-secondary-100 mb-4">{t.settings.notificationPreferences}</h3>
                        <div className="space-y-4">
                          {Object.entries(settings.notifications).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-800/50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-secondary-100">
                                  {key === 'emailNotifications' && t.settings.emailNotifications}
                                  {key === 'pushNotifications' && t.settings.pushNotifications}
                                  {key === 'weeklyReports' && t.settings.weeklyReports}
                                  {key === 'newReferrals' && t.settings.newReferrals}
                                  {key === 'conversions' && t.settings.conversions}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-secondary-400">
                                  {key === 'emailNotifications' && t.settings.emailNotificationsDesc}
                                  {key === 'pushNotifications' && t.settings.pushNotificationsDesc}
                                  {key === 'weeklyReports' && t.settings.weeklyReportsDesc}
                                  {key === 'newReferrals' && t.settings.newReferralsDesc}
                                  {key === 'conversions' && t.settings.conversionsDesc}
                                </p>
                              </div>
                              <button
                                onClick={() => handleChange('notifications', key, !value)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  value ? 'bg-orange-600' : 'bg-gray-200 dark:bg-secondary-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(t.settings.notifications)}
                        className="btn-primary"
                      >
                        {t.settings.savePreferences}
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'privacy' && (
                    <motion.div
                      key="privacy"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-secondary-100 mb-4">{t.settings.privacySettings}</h3>
                        <div className="space-y-4">
                          {Object.entries(settings.privacy).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-800/50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-secondary-100">
                                  {key === 'publicProfile' && t.settings.publicProfile}
                                  {key === 'showStats' && t.settings.showStats}
                                  {key === 'allowMessages' && t.settings.allowMessages}
                                  {key === 'dataSharing' && t.settings.dataSharing}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-secondary-400">
                                  {key === 'publicProfile' && t.settings.publicProfileDesc}
                                  {key === 'showStats' && t.settings.showStatsDesc}
                                  {key === 'allowMessages' && t.settings.allowMessagesDesc}
                                  {key === 'dataSharing' && t.settings.dataSharingDesc}
                                </p>
                              </div>
                              <button
                                onClick={() => handleChange('privacy', key, !value)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  value ? 'bg-orange-600' : 'bg-gray-200 dark:bg-secondary-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(t.settings.privacy)}
                        className="btn-primary"
                      >
                        {t.settings.savePrivacy}
                      </button>
                    </motion.div>
                  )}

                  {activeTab === 'appearance' && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-secondary-100 mb-4">{t.settings.appearanceLocalization}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.theme}</label>
                            <select
                              value={settings.appearance.theme === 'auto' ? 'auto' : theme}
                              onChange={(e) => {
                                const next = e.target.value;
                                handleChange('appearance', 'theme', next);
                                if (next === 'auto') {
                                  const prefersDark = window.matchMedia(
                                    '(prefers-color-scheme: dark)'
                                  ).matches;
                                  setTheme(prefersDark ? 'dark' : 'light');
                                } else {
                                  setTheme(next);
                                }
                              }}
                              className="input-field"
                            >
                              <option value="light">{t.settings.light}</option>
                              <option value="dark">{t.settings.dark}</option>
                              <option value="auto">{t.settings.auto}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.language}</label>
                            <p className="text-sm text-secondary-600 dark:text-secondary-400 py-2 px-1 rounded-lg bg-secondary-50 dark:bg-secondary-800/60 border border-secondary-100 dark:border-secondary-700">
                              English (only language available)
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.timezone}</label>
                            <select
                              value={settings.appearance.timezone}
                              onChange={(e) => handleChange('appearance', 'timezone', e.target.value)}
                              className="input-field"
                            >
                              <option value="America/New_York">New York (Eastern)</option>
                              <option value="America/Chicago">Chicago (Central)</option>
                              <option value="America/Denver">Denver (Mountain)</option>
                              <option value="America/Los_Angeles">Los Angeles (Pacific)</option>
                              <option value="Europe/London">London</option>
                              <option value="UTC">UTC</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-secondary-300 mb-2">{t.settings.dateFormat}</label>
                            <select
                              value={settings.appearance.dateFormat}
                              onChange={(e) => handleChange('appearance', 'dateFormat', e.target.value)}
                              className="input-field"
                            >
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(t.settings.appearance)}
                        className="btn-primary"
                      >
                        {t.settings.saveAppearance}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancelChanges}
        title={t.settings.confirmChanges}
        size="default"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-secondary-300">
            {t.settings.confirmChangesDesc}
          </p>
          
          <div className="bg-gray-50 dark:bg-secondary-800/50 rounded-lg p-4 space-y-2">
            {pendingChanges?.name && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-secondary-400">{t.settings.name}:</span>
                <span className="text-sm text-gray-900 dark:text-secondary-100">{pendingChanges.name}</span>
              </div>
            )}
            {pendingChanges?.newPassword && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-secondary-400">{t.settings.password}:</span>
                <span className="text-sm text-gray-900 dark:text-secondary-100">{t.settings.password} {t.common.willBeChanged || 'Will be changed'}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleCancelChanges}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg text-gray-700 dark:text-secondary-300 hover:bg-gray-50 dark:hover:bg-secondary-800/60 transition-colors disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleConfirmChanges}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.settings.updating : t.common.confirm}
            </button>
          </div>
        </div>
      </Modal>
      </div>
    );
  }

export default SettingsPanel;



