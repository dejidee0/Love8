'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { traitColors } from '../lib/utils'
import { FiHeart, FiStar, FiZap } from 'react-icons/fi'

export default function TraitCloud({ traits = [], loading = false, interactive = false }) {
  const containerRef = useRef(null)
  const [hoveredTrait, setHoveredTrait] = useState(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setContainerSize({ width: offsetWidth, height: offsetHeight })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const getTraitPosition = (index, total) => {
    if (containerSize.width === 0) return { x: 0, y: 0 }
    
    const centerX = containerSize.width / 2
    const centerY = containerSize.height / 2
    const radius = Math.min(containerSize.width, containerSize.height) * 0.3
    
    // Create spiral pattern for better distribution
    const angle = (index / total) * Math.PI * 4
    const spiralRadius = radius * (0.3 + (index / total) * 0.7)
    
    return {
      x: centerX + Math.cos(angle) * spiralRadius,
      y: centerY + Math.sin(angle) * spiralRadius
    }
  }

  const getTraitSize = (endorsementCount) => {
    const baseSize = 1
    const scaleFactor = Math.min(endorsementCount * 0.1, 0.5)
    return baseSize + scaleFactor
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your trait cloud...</p>
        </div>
      </div>
    )
  }

  if (!traits.length) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="text-gray-600 text-3xl" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No traits yet</h3>
          <p className="text-gray-400 mb-4">Start building your personality constellation</p>
          {interactive && (
            <button className="btn-primary">
              Add Your First Trait
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-96 overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/30 to-gray-900/30"
    >
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            animate={{
              x: [0, containerSize.width],
              y: [Math.random() * containerSize.height, Math.random() * containerSize.height],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              left: Math.random() * containerSize.width,
              top: Math.random() * containerSize.height
            }}
          />
        ))}
      </div>

      {/* Trait bubbles */}
      <AnimatePresence>
        {traits.map((trait, index) => {
          const position = getTraitPosition(index, traits.length)
          const scale = getTraitSize(trait.endorsement_count)
          const colorTheme = traitColors[trait.color_theme] || traitColors.blue
          
          return (
            <motion.div
              key={trait.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale,
                x: position.x - 50, // Center the bubble
                y: position.y - 20
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
              className={`absolute cursor-pointer select-none ${colorTheme.bg} ${colorTheme.border} ${colorTheme.text} border rounded-full px-4 py-2 text-sm font-medium transition-all duration-300`}
              style={{
                boxShadow: hoveredTrait === trait.id ? `0 0 20px ${colorTheme.glow}` : 'none'
              }}
              onMouseEnter={() => setHoveredTrait(trait.id)}
              onMouseLeave={() => setHoveredTrait(null)}
              whileHover={{ 
                scale: scale * 1.2,
                zIndex: 10
              }}
              animate={{
                y: position.y - 20 + Math.sin(Date.now() * 0.001 + index) * 5
              }}
            >
              <div className="flex items-center space-x-1">
                <span>{trait.trait_word}</span>
                {trait.endorsement_count > 0 && (
                  <div className="flex items-center space-x-1">
                    <FiHeart className="text-xs" />
                    <span className="text-xs">{trait.endorsement_count}</span>
                  </div>
                )}
                {trait.is_ai_suggested && (
                  <FiZap className="text-xs text-yellow-400" />
                )}
              </div>
              
              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredTrait === trait.id && trait.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 whitespace-nowrap"
                  >
                    {trait.description}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Center glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
      
      {/* Stats overlay */}
      {interactive && (
        <div className="absolute bottom-4 right-4 glass-dark rounded-lg px-3 py-2">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-purple-400">
              <FiStar className="text-xs" />
              <span>{traits.length} traits</span>
            </div>
            <div className="flex items-center space-x-1 text-pink-400">
              <FiHeart className="text-xs" />
              <span>{traits.reduce((sum, trait) => sum + trait.endorsement_count, 0)} endorsements</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}