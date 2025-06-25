'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiPlus, FiZap } from 'react-icons/fi'
import { validateTrait, getRandomTraitColor } from '../lib/utils'

const traitCategories = [
  { name: 'Personality', color: 'purple', traits: ['Creative', 'Kind', 'Funny', 'Wise'] },
  { name: 'Skills', color: 'blue', traits: ['Smart', 'Athletic', 'Musical', 'Artistic'] },
  { name: 'Social', color: 'green', traits: ['Friendly', 'Loyal', 'Caring', 'Supportive'] },
  { name: 'Character', color: 'orange', traits: ['Honest', 'Brave', 'Patient', 'Determined'] }
]

export default function AddTraitModal({ onClose, onAdd }) {
  const [traitWord, setTraitWord] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('personality')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateTrait(traitWord)) {
      return
    }

    setIsSubmitting(true)
    await onAdd(traitWord.trim(), description.trim())
    setIsSubmitting(false)
  }

  const handleQuickAdd = async (quickTrait) => {
    setIsSubmitting(true)
    await onAdd(quickTrait, `${selectedCategory} trait`)
    setIsSubmitting(false)
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
        className="glass-dark rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Trait</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Trait Word
            </label>
            <input
              type="text"
              value={traitWord}
              onChange={(e) => setTraitWord(e.target.value)}
              placeholder="e.g., Creative, Kind, Smart..."
              className="input-field w-full"
              maxLength={20}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {traitWord.length}/20 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this trait special to you?"
              className="input-field w-full h-20 resize-none"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/100 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={!traitWord.trim() || isSubmitting}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="spinner w-4 h-4"></div>
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <FiPlus className="text-lg" />
                <span>Add Trait</span>
              </div>
            )}
          </button>
        </form>

        {/* Quick Add Suggestions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <FiZap className="mr-2 text-yellow-400" />
            Quick Add
          </h3>
          
          <div className="space-y-3">
            {traitCategories.map((category) => (
              <div key={category.name}>
                <h4 className="text-xs font-medium text-gray-400 mb-2">
                  {category.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.traits.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => handleQuickAdd(trait)}
                      disabled={isSubmitting}
                      className={`trait-bubble bg-${category.color}-500/20 border-${category.color}-500/30 text-${category.color}-300 hover:bg-${category.color}-500/30 disabled:opacity-50`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}