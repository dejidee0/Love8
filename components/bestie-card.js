'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiHeart, FiUser, FiPlus, FiCalendar } from 'react-icons/fi'
import { getBestieRelationship } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatTimeAgo } from '../lib/utils'

export default function BestieCard() {
  const { user } = useAuth()
  const [bestie, setBestie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBestie()
    }
  }, [user])

  const loadBestie = async () => {
    try {
      setLoading(true)
      const { data, error } = await getBestieRelationship(user.id)
      
      if (!error && data) {
        setBestie(data)
      }
    } catch (error) {
      console.error('Error loading bestie:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FiHeart className="mr-2 text-pink-400" />
          Bestie
        </h3>
        {!bestie && (
          <button className="btn-ghost p-2">
            <FiPlus className="text-sm" />
          </button>
        )}
      </div>

      {bestie ? (
        <div className="space-y-4">
          {/* Bestie Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              {bestie.profiles?.avatar_url ? (
                <img 
                  src={bestie.profiles.avatar_url} 
                  alt="Bestie" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser className="text-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-white">
                {bestie.profiles?.display_name || bestie.profiles?.username}
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <FiCalendar className="mr-1 text-xs" />
                Friends since {formatTimeAgo(bestie.created_at)}
              </div>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {bestie.streak_count || 0}
              </div>
              <div className="text-sm text-gray-300">
                Day streak
              </div>
            </div>
          </div>

          {/* Mutual Traits */}
          {bestie.mutual_traits && bestie.mutual_traits.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-300 mb-2">
                Shared Traits
              </div>
              <div className="flex flex-wrap gap-1">
                {bestie.mutual_traits.slice(0, 3).map((trait, index) => (
                  <span
                    key={index}
                    className="trait-bubble bg-pink-500/20 border-pink-500/30 text-pink-300 text-xs"
                  >
                    {trait}
                  </span>
                ))}
                {bestie.mutual_traits.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{bestie.mutual_traits.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiHeart className="text-gray-600 text-xl" />
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Find your perfect trait match
          </p>
          <button className="btn-primary text-sm px-4 py-2">
            Find Bestie
          </button>
        </div>
      )}
    </motion.div>
  )
}