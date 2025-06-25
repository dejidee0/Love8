'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiFire, FiCalendar } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'

export default function StreakCounter() {
  const { user } = useAuth()
  const [streak, setStreak] = useState({ current: 0, best: 0 })

  useEffect(() => {
    // Load user streak data
    // This would typically come from the database
    setStreak({ current: 7, best: 15 }) // Mock data
  }, [user])

  return (
    <motion.div
      initial={{opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-3">
          <FiFire className="text-orange-400 text-xl mr-2" />
          <h3 className="text-lg font-semibold text-white">Daily Streak</h3>
        </div>
        
        <div className="space-y-4">
          {/* Current Streak */}
          <div>
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {streak.current}
            </div>
            <div className="text-sm text-gray-400">
              Days in a row
            </div>
          </div>
          
          {/* Best Streak */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-center text-sm text-gray-300">
              <FiCalendar className="mr-1" />
              Best: {streak.best} days
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((streak.current / 30) * 100, 100)}%` }}
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          <p className="text-xs text-gray-500">
            Keep logging in daily to maintain your streak!
          </p>
        </div>
      </div>
    </motion.div>
  )
}