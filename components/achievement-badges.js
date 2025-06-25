'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAward, FiStar, FiTrendingUp, FiHeart } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'

const mockBadges = [
  {
    id: 1,
    type: 'first_trait',
    name: 'First Steps',
    description: 'Added your first trait',
    icon: FiStar,
    color: 'yellow',
    earned: true
  },
  {
    id: 2,
    type: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Received 10 endorsements',
    icon: FiHeart,
    color: 'pink',
    earned: true
  },
  {
    id: 3,
    type: 'trait_master',
    name: 'Trait Master',
    description: 'Added 25 traits',
    icon: FiTrendingUp,
    color: 'purple',
    earned: false
  }
]

export default function AchievementBadges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    // Load user badges from database
    setBadges(mockBadges)
  }, [user])

  const earnedBadges = badges.filter(badge => badge.earned)
  const displayBadges = showAll ? earnedBadges : earnedBadges.slice(0, 3)

  if (earnedBadges.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FiAward className="mr-2 text-yellow-400" />
          Achievements
        </h3>
        {earnedBadges.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {showAll ? 'Show Less' : `+${earnedBadges.length - 3} more`}
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
            >
              <div className={`w-8 h-8 bg-gradient-to-r from-${badge.color}-400 to-${badge.color}-600 rounded-full flex items-center justify-center`}>
                <badge.icon className="text-white text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">
                  {badge.name}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {badge.description}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {earnedBadges.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400">
            {earnedBadges.length} of {badges.length} achievements unlocked
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full"
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}