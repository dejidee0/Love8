'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTraits } from '../../hooks/useTraits'
import { useNotifications } from '../../hooks/useNotifications'
import { useRouter } from 'next/navigation'
import TraitCloud from '../../components/trait-cloud'
import NotificationBell from '../../components/notification-bell'
import AddTraitModal from '../../components/add-trait-modal'
import EndorsementInbox from '../../components/endorsement-inbox'
import BestieCard from '../../components/bestie-card'
import StreakCounter from '../../components/streak-counter'
import AchievementBadges from '../../components/achievement-badges'
import { FiPlus, FiUser, FiSettings, FiLogOut, FiTrendingUp, FiHeart, FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, logout } = useAuth()
  const { traits, loading: traitsLoading, addTrait, getAISuggestions, aiSuggestions } = useTraits()
  const { notifications, unreadCount } = useNotifications()
  const [showAddTrait, setShowAddTrait] = useState(false)
  const [showInbox, setShowInbox] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  const handleAddTrait = async (traitWord, description) => {
    const success = await addTrait(traitWord, description)
    if (success) {
      setShowAddTrait(false)
      toast.success('Trait added to your cloud! ✨')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 animated-gradient opacity-10"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FiHeart className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Love8</h1>
                <p className="text-sm text-gray-400">Welcome back, {profile?.display_name || profile?.username}!</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/discover')}
                className="btn-ghost p-3"
                title="Discover"
              >
                <FiTrendingUp className="text-lg" />
              </button>
              
              <button
                onClick={() => router.push('/battles')}
                className="btn-ghost p-3"
                title="Word Battles"
              >
                <FiZap className="text-lg" />
              </button>

              <NotificationBell 
                count={unreadCount}
                onClick={() => setShowInbox(true)}
              />

              <button
                onClick={() => router.push('/profile')}
                className="btn-ghost p-3"
                title="Profile"
              >
                <FiUser className="text-lg" />
              </button>

              <button
                onClick={handleLogout}
                className="btn-ghost p-3 text-red-400 hover:text-red-300"
                title="Logout"
              >
                <FiLogOut className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FiUser className="text-white text-2xl" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {profile?.display_name || profile?.username}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  @{profile?.username}
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-purple-400 font-semibold">{traits?.length || 0}</div>
                    <div className="text-gray-500">Traits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-pink-400 font-semibold">{profile?.endorsement_count || 0}</div>
                    <div className="text-gray-500">Endorsements</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Streak Counter */}
            <StreakCounter />

            {/* Achievement Badges */}
            <AchievementBadges />

            {/* Bestie Card */}
            <BestieCard />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <button
                onClick={() => setShowAddTrait(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <FiPlus className="text-lg" />
                <span>Add Trait</span>
              </button>
              
              <button
                onClick={getAISuggestions}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiZap className="text-lg" />
                <span>AI Suggestions</span>
              </button>

              <button
                onClick={() => router.push('/discover')}
                className="btn-ghost flex items-center space-x-2"
              >
                <FiTrendingUp className="text-lg" />
                <span>Discover</span>
              </button>
            </motion.div>

            {/* AI Suggestions */}
            <AnimatePresence>
              {aiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card mb-8"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FiZap className="mr-2 text-yellow-400" />
                    AI Trait Suggestions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAddTrait(suggestion, 'AI suggested trait')}
                        className="trait-bubble bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trait Cloud */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Trait Cloud</h2>
                <div className="text-sm text-gray-400">
                  {traits?.length || 0} traits
                </div>
              </div>
              
              <TraitCloud 
                traits={traits || []} 
                loading={traitsLoading}
                interactive={true}
              />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddTrait && (
          <AddTraitModal
            onClose={() => setShowAddTrait(false)}
            onAdd={handleAddTrait}
          />
        )}
        
        {showInbox && (
          <EndorsementInbox
            onClose={() => setShowInbox(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}