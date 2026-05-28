import { useState, useEffect, useCallback } from 'react';

export const useNotifications = (pollingInterval = 30000) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling
    const interval = setInterval(fetchUnreadCount, pollingInterval);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [fetchUnreadCount, pollingInterval]);

  const updateCount = useCallback((newCount) => {
    setUnreadCount(newCount);
  }, []);

  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    updateCount,
    refreshCount
  };
};

