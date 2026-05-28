import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  GiftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Users, Phone, Home, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import Button from './ui/Button';
import Modal from './ui/Modal';
import EmptyState from './ui/EmptyState';

function RewardsConfig() {
  const { t } = useLanguage();
  const [pointConfigs, setPointConfigs] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingConfigs, setEditingConfigs] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [newReward, setNewReward] = useState({ name: '', description: '', points_required: 0 });

  // Local state for point configs editing
  const [localConfigs, setLocalConfigs] = useState({
    affiliated: { points: 10, description: '' },
    contacted: { points: 25, description: '' },
    visited: { points: 50, description: '' },
    completed: { points: 100, description: '' }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configsRes, rewardsRes] = await Promise.all([
        axios.get('/api/admin/reward-configs', { withCredentials: true }),
        axios.get('/api/admin/rewards', { withCredentials: true })
      ]);

      setPointConfigs(configsRes.data);
      setRewards(rewardsRes.data);

      // Initialize local configs from fetched data
      const configsMap = {};
      configsRes.data.forEach(config => {
        configsMap[config.state_name] = {
          points: config.points,
          description: config.description || ''
        };
      });
      setLocalConfigs(prev => ({ ...prev, ...configsMap }));
    } catch (error) {
      console.error('Error fetching rewards data:', error);
      toast.error(t.rewards.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  const savePointConfigs = async () => {
    try {
      const configs = Object.entries(localConfigs).map(([state_name, data]) => ({
        state_name,
        points: data.points,
        description: data.description
      }));

      await axios.post('/api/admin/reward-configs', { configs }, { withCredentials: true });
      toast.success(t.rewards.savedSuccessfully);
      setEditingConfigs(false);
      fetchData();
    } catch (error) {
      console.error('Error saving configs:', error);
      toast.error(t.rewards.failedToSave);
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.name || !newReward.points_required) {
      toast.error(t.rewards.fillRequiredFields);
      return;
    }

    try {
      await axios.post('/api/admin/rewards', newReward, { withCredentials: true });
      toast.success(t.rewards.createdSuccessfully);
      setShowRewardModal(false);
      setNewReward({ name: '', description: '', points_required: 0 });
      fetchData();
    } catch (error) {
      console.error('Error creating reward:', error);
      toast.error(t.rewards.failedToCreate);
    }
  };

  const handleUpdateReward = async () => {
    if (!editingReward.name || !editingReward.points_required) {
      toast.error(t.rewards.fillRequiredFields);
      return;
    }

    try {
      await axios.put(`/api/admin/rewards/${editingReward.id}`, editingReward, { withCredentials: true });
      toast.success(t.rewards.updatedSuccessfully);
      setEditingReward(null);
      fetchData();
    } catch (error) {
      console.error('Error updating reward:', error);
      toast.error(t.rewards.failedToUpdate);
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm(t.rewards.confirmDeleteReward)) return;

    try {
      await axios.delete(`/api/admin/rewards/${rewardId}`, { withCredentials: true });
      toast.success(t.rewards.deletedSuccessfully);
      fetchData();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error(t.rewards.failedToDelete);
    }
  };

  const stateLabels = {
    affiliated: { label: t.admin.affiliated, IconComponent: Users, description: t.rewards.whenClientRefers },
    contacted: { label: t.admin.contacted, IconComponent: Phone, description: t.rewards.whenSellerContacts },
    visited: { label: t.admin.visited, IconComponent: Home, description: t.rewards.whenSellerVisits },
    completed: { label: t.admin.completed, IconComponent: CheckCircle, description: t.rewards.whenSaleCompleted }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">{t.rewards.rewardsConfiguration}</h2>
        <p className="text-secondary-600">{t.rewards.configureRewardPoints}</p>
      </div>

      {/* Point Configurations */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <StarIcon className="w-5 h-5 text-amber-500 mr-2" />
              {t.rewards.stateRewardPoints}
            </h3>
            <p className="text-sm text-secondary-600 mt-1">
              {t.rewards.configurePointsAwarded}
            </p>
          </div>
          {!editingConfigs ? (
            <Button variant="secondary" size="default" onClick={() => setEditingConfigs(true)} icon={PencilIcon}>
              {t.rewards.editPoints}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="default" onClick={() => {
                setEditingConfigs(false);
                fetchData();
              }} icon={XMarkIcon}>
                {t.rewards.cancel}
              </Button>
              <Button variant="primary" size="default" onClick={savePointConfigs} icon={CheckIcon}>
                {t.rewards.save}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stateLabels).map(([state, info]) => (
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-secondary-50/50 to-orange-50/30 rounded-xl p-4 border border-secondary-200/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <info.IconComponent className="w-6 h-6 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-secondary-900">{info.label}</h4>
                    <p className="text-xs text-secondary-600">{info.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  {t.rewards.rewardPoints}
                </label>
                {editingConfigs ? (
                  <input
                    type="number"
                    value={localConfigs[state]?.points || 0}
                    onChange={(e) => setLocalConfigs(prev => ({
                      ...prev,
                      [state]: { ...prev[state], points: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <div className="text-2xl font-bold text-orange-600">
                    {localConfigs[state]?.points || 0} {t.rewards.points}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
              <GiftIcon className="w-5 h-5 text-orange-500 mr-2" />
              {t.rewards.rewardsCatalog}
            </h3>
            <p className="text-sm text-secondary-600 mt-1">
              {t.rewards.manageRewardsRedeem}
            </p>
          </div>
          <Button variant="primary" size="default" onClick={() => setShowRewardModal(true)} icon={PlusIcon}>
            {t.rewards.addReward}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 rounded-xl p-4 border border-orange-200/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary-900">{reward.name}</h4>
                  <p className="text-sm text-secondary-600 mt-1">{reward.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingReward(reward)}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 text-secondary-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 text-error-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-xs text-secondary-600">{t.rewards.pointsRequired}</span>
                <span className="font-bold text-orange-600 flex items-center">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  {reward.points_required}
                </span>
              </div>
              
              {!reward.is_active && (
                <div className="mt-2">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                    {t.rewards.inactive}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
          
          {rewards.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={GiftIcon}
                title={t.rewards.noRewardsYet}
                description={t.rewards.createFirstReward}
                action={
                  <Button variant="primary" onClick={() => setShowRewardModal(true)} icon={PlusIcon}>
                    {t.rewards.createReward}
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Reward Modal */}
      <Modal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setNewReward({ name: '', description: '', points_required: 0 });
        }}
        title={t.rewards.createNewReward}
        size="small"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              {t.rewards.rewardName} *
            </label>
            <input
              type="text"
              value={newReward.name}
              onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder={t.rewards.rewardNamePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              {t.rewards.description}
            </label>
            <textarea
              value={newReward.description}
              onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows="3"
              placeholder={t.rewards.describeReward}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              {t.rewards.pointsRequired} *
            </label>
            <input
              type="number"
              value={newReward.points_required}
              onChange={(e) => setNewReward(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRewardModal(false);
                setNewReward({ name: '', description: '', points_required: 0 });
              }}
            >
              {t.rewards.cancel}
            </Button>
            <Button variant="primary" onClick={handleCreateReward}>
              {t.rewards.createReward}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Reward Modal */}
      <Modal
        isOpen={editingReward !== null}
        onClose={() => setEditingReward(null)}
        title={t.rewards.editReward}
        size="small"
      >
        {editingReward && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Reward Name *
              </label>
              <input
                type="text"
                value={editingReward.name}
                onChange={(e) => setEditingReward(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Description
              </label>
              <textarea
                value={editingReward.description}
                onChange={(e) => setEditingReward(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                {t.rewards.pointsRequired} *
              </label>
              <input
                type="number"
                value={editingReward.points_required}
                onChange={(e) => setEditingReward(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingReward.is_active}
                  onChange={(e) => setEditingReward(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-secondary-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-secondary-700 dark:text-secondary-300">{t.rewards.active}</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setEditingReward(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateReward}>
                Update Reward
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RewardsConfig;

