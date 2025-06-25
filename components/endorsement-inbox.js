'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiUser, FiHeart, FiClock } from 'react-icons/fi'
import { getPendingEndorsements, approveEndorsement } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatTimeAgo } from '../lib/utils'
import toast from 'react-hot-toast'

export default function EndorsementInbox({ onClose }) {
  const { user } = useAuth()
  const [endorsements, setEndorsements] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState(new Set())

  useEffect(() => {
    if (user) {
      loadEndorsements()
    }
  }, [user])

  const loadEndorsements = async () => {
    try {
      setLoading(true)
      const { data, error } = await getPendingEndorsements(user.id)
      
      if (error) throw error
      setEndorsements(data || [])
    } catch (error) {
      console.error('Error loading endorsements:', error)
      toast.error('Failed to load endorsements')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (endorsementId) => {
    if (processingIds.has(endorsementId)) return

    try {
      setProcessingIds(prev => new Set([...prev, endorsementId]))
      
      const { error } = await approveEndorsement(endorsementId)
      
      if (error) throw error
      
      setEndorsements(prev => prev.filter(e => e.id !== endorsementId))
      toast.success('Endorsement approved! ✨')
    } catch (error) {
      console.error('Error approving endorsement:', error)
      toast.error('Failed to approve endorsement')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(endorsementId)
        return newSet
      })
    }
  }

  const handleReject = async (endorsementId) => {
    // For now, just remove from list (could implement proper rejection later)
    setEndorsements(prev => prev.filter(e => e.id !== endorsementId))
    toast.success('Endorsement declined')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-dark rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Endorsement Inbox</h2>
            <p className="text-gray-400">
              {endorsements.length} pending endorsement{endorsements.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : endorsements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="text-gray-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400">No pending endorsements to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {endorsements.map((endorsement, index) => (
                  <motion.div
                    key={endorsement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="card hover:bg-gray-800/70"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {endorsement.profiles?.avatar_url ? (
                          <img 
                            src={endorsement.profiles.avatar_url} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-white">
                            {endorsement.profiles?.display_name || endorsement.profiles?.username}
                          </span>
                          <span className="text-gray-400">called you</span>
                          <span className={`trait-bubble bg-${endorsement.traits?.color_theme || 'blue'}-500/20 border-${endorsement.traits?.color_theme || 'blue'}-500/30 text-${endorsement.traits?.color_theme || 'blue'}-300`}>
                            {endorsement.traits?.trait_word}
                          </span>
                        </div>
                        
                        {endorsement.message && (
                          <p className="text-gray-300 text-sm mb-2">
                            "{endorsement.message}"
                          </p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <FiClock className="mr-1" />
                          {formatTimeAgo(endorsement.created_at)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(endorsement.id)}
                          disabled={processingIds.has(endorsement.id)}
                          className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
                        >
                          {processingIds.has(endorsement.id) ? (
                            <div className="spinner w-4 h-4"></div>
                          ) : (
                            <FiCheck />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleReject(endorsement.id)}
                          disabled={processingIds.has(endorsement.id)}
                          className="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}