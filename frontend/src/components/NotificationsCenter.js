import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserPlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

function NotificationsCenter({ isOpen, onClose, onNotificationUpdate }) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const getIconAndColors = (type) => {
    const iconMap = {
      success: {
        icon: CheckCircleIcon,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-950/50'
      },
      info: {
        icon: UserPlusIcon,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-950/45'
      },
      warning: {
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-950/45'
      },
      error: {
        icon: ExclamationTriangleIcon,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-950/45'
      }
    };
    return iconMap[type] || iconMap.info;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      const formattedNotifications = data.notifications.map(notification => ({
        ...notification,
        time: notification.time_ago,
        ...getIconAndColors(notification.type)
      }));
      
      setNotifications(formattedNotifications);
      
      // Notify parent about unread count
      if (onNotificationUpdate) {
        const unreadCount = formattedNotifications.filter(n => !n.read).length;
        onNotificationUpdate(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(t.notifications.failedToLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update parent
      if (onNotificationUpdate) {
        const newUnreadCount = notifications.filter(n => !n.read && n.id !== id).length;
        onNotificationUpdate(newUnreadCount);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast.success('All notifications marked as read');
      
      // Update parent
      if (onNotificationUpdate) {
        onNotificationUpdate(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
      
      toast.success('Notification deleted');
      
      // Update parent
      if (onNotificationUpdate && wasUnread) {
        const newUnreadCount = notifications.filter(n => !n.read && n.id !== id).length;
        onNotificationUpdate(newUnreadCount);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  const content = (
    <AnimatePresence mode="wait">
      <motion.div
        key="notifications-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] overflow-hidden"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-secondary-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-secondary-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-950/45 rounded-xl flex items-center justify-center">
                <BellIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-secondary-100">{t.notifications.title}</h2>
                <p className="text-sm text-gray-500 dark:text-secondary-400">{unreadCount} {t.notifications.unread}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-secondary-500 dark:hover:text-secondary-300 dark:hover:bg-secondary-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-secondary-700">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: t.notifications.all },
                { key: 'unread', label: t.notifications.unread },
                { key: 'success', label: t.notifications.success },
                { key: 'info', label: t.notifications.info }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`filter-chip ${
                    filter === filterOption.key ? 'filter-chip-active' : 'filter-chip-inactive'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={`notif-skel-${idx}`}
                    className="flex gap-3 rounded-2xl border border-secondary-100 dark:border-secondary-700/50 p-4 animate-pulse"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary-200 dark:bg-secondary-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-secondary-200 dark:bg-secondary-700" />
                      <div className="h-2 w-full rounded bg-secondary-100 dark:bg-secondary-800" />
                      <div className="h-2 w-1/3 rounded bg-secondary-100 dark:bg-secondary-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BellIcon className="h-12 w-12 text-gray-300 dark:text-secondary-600 mb-4" />
                <p className="text-gray-500 dark:text-secondary-400">{t.notifications.noNotifications}</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 border-b border-gray-100 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800/40 transition-colors ${
                      !notification.read ? 'bg-orange-50/50 dark:bg-orange-950/25' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`h-10 w-10 ${notification.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <notification.icon className={`h-5 w-5 ${notification.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900 dark:text-secondary-100' : 'text-gray-700 dark:text-secondary-300'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-secondary-500">{notification.time}</span>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-secondary-400 mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              {t.notifications.markAsRead}
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            {t.notifications.delete}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

export default NotificationsCenter;



