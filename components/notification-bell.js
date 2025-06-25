'use client'

import { motion } from 'framer-motion'
import { FiBell } from 'react-icons/fi'

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative btn-ghost p-3"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <FiBell className="text-lg" />
      
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="notification-dot flex items-center justify-center text-xs font-bold text-white"
          style={{ minWidth: '18px', height: '18px' }}
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}
      
      {count > 0 && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-75"
        />
      )}
    </motion.button>
  )
}