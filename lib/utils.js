import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

// Trait color themes
export const traitColors = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/50'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/50'
  },
  pink: {
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    glow: 'shadow-pink-500/50'
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-300',
    glow: 'shadow-green-500/50'
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
    glow: 'shadow-orange-500/50'
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    glow: 'shadow-red-500/50'
  }
}

// Get random trait color
export const getRandomTraitColor = () => {
  const colors = Object.keys(traitColors)
  return colors[Math.floor(Math.random() * colors.length)]
}

// Format date helpers
export const formatTimeAgo = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return new Date(date).toLocaleDateString()
}

// Generate unique usernames
export const generateUsername = (displayName, email) => {
  const base = displayName?.toLowerCase().replace(/\s+/g, '') || 
                email?.split('@')[0].toLowerCase() || 
                'user'
  const random = Math.floor(Math.random() * 9999)
  return `${base}${random}`
}

// Trait validation
export const validateTrait = (traitWord) => {
  if (!traitWord || typeof traitWord !== 'string') return false
  if (traitWord.length < 2 || traitWord.length > 20) return false
  if (!/^[a-zA-Z\s]+$/.test(traitWord)) return false
  return true
}

// Calculate trait popularity score
export const calculateTraitScore = (endorsementCount, createdAt) => {
  const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24))
  const recencyBonus = Math.max(0, 7 - daysSinceCreated) * 0.1
  return endorsementCount + recencyBonus
}

// Generate shareable trait card data
export const generateTraitCardData = (trait, user) => {
  return {
    traitWord: trait.trait_word,
    userName: user.display_name || user.username,
    userAvatar: user.avatar_url,
    endorsementCount: trait.endorsement_count,
    colorTheme: trait.color_theme,
    description: trait.description
  }
}

// Streak calculations
export const calculateStreak = (lastActivity, currentActivity) => {
  const lastDate = new Date(lastActivity).toDateString()
  const currentDate = new Date(currentActivity).toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()
  
  if (lastDate === currentDate) return 'same_day'
  if (lastDate === yesterday) return 'continue'
  return 'break'
}

// Animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

// Local storage helpers
export const saveToLocalStorage = (key, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

export const getFromLocalStorage = (key) => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  return null
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate random positions for floating elements
export const generateRandomPosition = (containerWidth, containerHeight, elementSize) => {
  return {
    x: Math.random() * (containerWidth - elementSize),
    y: Math.random() * (containerHeight - elementSize)
  }
}

// Color manipulation utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}