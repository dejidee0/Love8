import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { 
  getUserTraits, 
  createTrait, 
  createEndorsement,
  subscribeToTraits 
} from '../lib/supabase'
import { generateTraitSuggestions } from '../lib/openai'
import { getRandomTraitColor, validateTrait } from '../lib/utils'
import toast from 'react-hot-toast'

export const useTraits = () => {
  const { user, profile } = useAuth()
  const [traits, setTraits] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Load user traits
  useEffect(() => {
    if (user) {
      loadTraits()
      
      // Subscribe to real-time updates
      const subscription = subscribeToTraits(user.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTraits(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setTraits(prev => prev.map(trait => 
            trait.id === payload.new.id ? payload.new : trait
          ))
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadTraits = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error } = await getUserTraits(user.id)
      
      if (error) throw error
      setTraits(data || [])
    } catch (error) {
      console.error('Error loading traits:', error)
      toast.error('Failed to load traits')
    } finally {
      setLoading(false)
    }
  }

  const addTrait = async (traitWord, description = '') => {
    if (!user || !validateTrait(traitWord)) {
      toast.error('Invalid trait word')
      return false
    }

    try {
      const newTrait = {
        user_id: user.id,
        trait_word: traitWord.trim(),
        description: description.trim(),
        color_theme: getRandomTraitColor(),
        is_approved: true, // Auto-approve for now
        endorsement_count: 0
      }

      const { data, error } = await createTrait(newTrait)
      
      if (error) throw error
      
      toast.success(`Added trait: ${traitWord}`)
      return true
    } catch (error) {
      console.error('Error adding trait:', error)
      toast.error('Failed to add trait')
      return false
    }
  }

  const endorseTrait = async (traitId, recipientId, message = '') => {
    if (!user) return false

    try {
      const endorsementData = {
        trait_id: traitId,
        endorser_id: user.id,
        recipient_id: recipientId,
        message: message.trim(),
        is_approved: false // Requires approval
      }

      const { data, error } = await createEndorsement(endorsementData)
      
      if (error) throw error
      
      toast.success('Endorsement sent!')
      return true
    } catch (error) {
      console.error('Error endorsing trait:', error)
      toast.error('Failed to send endorsement')
      return false
    }
  }

  const getAISuggestions = async () => {
    if (!profile || loadingSuggestions) return

    try {
      setLoadingSuggestions(true)
      const existingTraitWords = traits.map(t => t.trait_word)
      
      const { success, traits: suggestions } = await generateTraitSuggestions(
        profile, 
        existingTraitWords
      )
      
      if (success) {
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error)
      toast.error('Failed to get AI suggestions')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const addAISuggestion = async (suggestionWord) => {
    const success = await addTrait(suggestionWord, `AI suggested trait`)
    if (success) {
      setAiSuggestions(prev => prev.filter(s => s !== suggestionWord))
    }
  }

  return {
    traits,
    loading,
    aiSuggestions,
    loadingSuggestions,
    addTrait,
    endorseTrait,
    getAISuggestions,
    addAISuggestion,
    refreshTraits: loadTraits
  }
}