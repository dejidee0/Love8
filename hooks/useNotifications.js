import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { 
  getUserNotifications, 
  markNotificationAsRead,
  subscribeToNotifications 
} from '../lib/supabase'
import { requestNotificationPermission, onMessageListener } from '../lib/firebase'
import toast from 'react-hot-toast'

export const useNotifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadNotifications()
      setupPushNotifications()
      
      // Subscribe to real-time notifications
      const subscription = subscribeToNotifications(user.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show toast notification
          toast.success(newNotification.title, {
            duration: 4000,
            icon: '🔔'
          })
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error } = await getUserNotifications(user.id)
      
      if (error) throw error
      
      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupPushNotifications = async () => {
    try {
      const token = await requestNotificationPermission()
      if (token) {
        // Save FCM token to user profile for push notifications
        console.log('FCM Token:', token)
      }

      // Listen for foreground messages
      onMessageListener().then((payload) => {
        toast.success(payload.notification.title, {
          duration: 4000,
          icon: '🔔'
        })
      })
    } catch (error) {
      console.error('Error setting up push notifications:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await markNotificationAsRead(notificationId)
      
      if (error) throw error
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      
      await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead(n.id))
      )
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  }
}