'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { getAllTraits } from '../../lib/supabase'
import { FiArrowLeft, FiTrendingUp, FiHeart, FiUser, FiSearch, FiFilter } from 'react-icons/fi'
import { formatTimeAgo, traitColors } from '../../lib/utils'
import toast from 'react-hot-toast'

const filterOptions = [
  { value: 'recent', label: 'Most Recent', icon: FiTrendingUp },
  { value: 'popular', label: 'Most Popular', icon: FiHeart },
  { value: 'trending', label: 'Trending', icon: FiTrendingUp }
]

export default function DiscoverPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [traits, setTraits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('recent')
  const [endorsingIds, setEndorsingIds] = useState(new Set())

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadTraits()
    }
  }, [user, selectedFilter])

  const loadTraits = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAllTraits()
      
      if (error) throw error
      
      let sortedTraits = data || []
      
      // Apply sorting based on filter
      switch (selectedFilter) {
        case 'popular':
          sortedTraits.sort((a, b) => b.endorsement_count - a.endorsement_count)
          break
        case 'trending':
          // Simple trending algorithm based on recent endorsements
          sortedTraits.sort((a, b) => {
            const aScore = a.endorsement_count + (new Date(a.updated_at) > new Date(Date.now() - 86400000) ? 10 : 0)
            const bScore = b.endorsement_count + (new Date(b.updated_at) > new Date(Date.now() - 86400000) ? 10 : 0)
            return bScore - aScore
          })
          break
        default: // recent
          sortedTraits.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      
      setTraits(sortedTraits)
    } catch (error) {
      console.error('Error loading traits:', error)
      toast.error('Failed to load traits')
    } finally {
      setLoading(false)
    }
  }

  const handleEndorse = async (traitId, recipientId) => {
    if (endorsingIds.has(traitId) || recipientId === user.id) return

    try {
      setEndorsingIds(prev => new Set([...prev, traitId]))
      
      // This would call the endorsement API
      // await endorseTrait(traitId, recipientId)
      
      toast.success('Endorsement sent! 💫')
    } catch (error) {
      console.error('Error endorsing trait:', error)
      toast.error('Failed to send endorsement')
    } finally {
      setEndorsingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(traitId)
        return newSet
      })
    }
  }

  const filteredTraits = traits.filter(trait =>
    trait.trait_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trait.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trait.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="btn-ghost p-3"
              >
                <FiArrowLeft className="text-lg" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Discover Traits</h1>
                <p className="text-gray-400">Explore the community's personality constellation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search traits or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="input-field pr-10 appearance-none cursor-pointer"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {filteredTraits.length}
            </div>
            <div className="text-sm text-gray-400">Total Traits</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-pink-400 mb-1">
              {filteredTraits.reduce((sum, trait) => sum + trait.endorsement_count, 0)}
            </div>
            <div className="text-sm text-gray-400">Endorsements</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {new Set(filteredTraits.map(t => t.user_id)).size}
            </div>
            <div className="text-sm text-gray-400">Contributors</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {new Set(filteredTraits.map(t => t.trait_word.toLowerCase())).size}
            </div>
            <div className="text-sm text-gray-400">Unique Traits</div>
          </div>
        </div>

        {/* Traits Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="spinner w-8 h-8 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading traits...</p>
            </div>
          </div>
        ) : filteredTraits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-gray-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No traits found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTraits.map((trait, index) => {
                const colorTheme = traitColors[trait.color_theme] || traitColors.blue
                const isOwnTrait = trait.user_id === user.id
                
                return (
                  <motion.div
                    key={trait.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="card hover:scale-105"
                  >
                    {/* Trait Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`trait-bubble ${colorTheme.bg} ${colorTheme.border} ${colorTheme.text} text-lg font-semibold`}>
                        {trait.trait_word}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <FiHeart className="text-xs" />
                        <span>{trait.endorsement_count}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {trait.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {trait.description}
                      </p>
                    )}

                    {/* User Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          {trait.profiles?.avatar_url ? (
                            <img 
                              src={trait.profiles.avatar_url} 
                              alt="Profile" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="text-white text-xs" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {trait.profiles?.display_name || trait.profiles?.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTimeAgo(trait.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Endorse Button */}
                      {!isOwnTrait && (
                        <button
                          onClick={() => handleEndorse(trait.id, trait.user_id)}
                          disabled={endorsingIds.has(trait.id)}
                          className="btn-primary px-3 py-1 text-sm disabled:opacity-50"
                        >
                          {endorsingIds.has(trait.id) ? (
                            <div className="spinner w-3 h-3"></div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <FiHeart className="text-xs" />
                              <span>Endorse</span>
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}