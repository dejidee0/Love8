import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile operations
export const createProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select()
  return { data, error }
}

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
  return { data, error }
}

// Trait operations
export const createTrait = async (traitData) => {
  const { data, error } = await supabase
    .from('traits')
    .insert([traitData])
    .select()
  return { data, error }
}

export const getUserTraits = async (userId) => {
  const { data, error } = await supabase
    .from('traits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_approved', true)
    .order('endorsement_count', { ascending: false })
  return { data, error }
}

export const getAllTraits = async () => {
  const { data, error } = await supabase
    .from('traits')
    .select(`
      *,
      profiles!traits_user_id_fkey(username, display_name, avatar_url)
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Endorsement operations
export const createEndorsement = async (endorsementData) => {
  const { data, error } = await supabase
    .from('trait_endorsements')
    .insert([endorsementData])
    .select()
  return { data, error }
}

export const getPendingEndorsements = async (userId) => {
  const { data, error } = await supabase
    .from('trait_endorsements')
    .select(`
      *,
      traits(*),
      profiles!trait_endorsements_endorser_id_fkey(username, display_name, avatar_url)
    `)
    .eq('recipient_id', userId)
    .eq('is_approved', false)
    .order('created_at', { ascending: false })
  return { data, error }
}

export const approveEndorsement = async (endorsementId) => {
  const { data, error } = await supabase
    .from('trait_endorsements')
    .update({ is_approved: true })
    .eq('id', endorsementId)
    .select()
  return { data, error }
}

// Notification operations
export const createNotification = async (notificationData) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
  return { data, error }
}

export const getUserNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return { data, error }
}

export const markNotificationAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
  return { data, error }
}

// Bestie operations
export const createBestieRequest = async (requestData) => {
  const { data, error } = await supabase
    .from('bestie_relationships')
    .insert([requestData])
    .select()
  return { data, error }
}

export const getBestieRelationship = async (userId) => {
  const { data, error } = await supabase
    .from('bestie_relationships')
    .select(`
      *,
      profiles!bestie_relationships_recipient_id_fkey(username, display_name, avatar_url)
    `)
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq('status', 'accepted')
    .single()
  return { data, error }
}

// Real-time subscriptions
export const subscribeToTraits = (userId, callback) => {
  return supabase
    .channel('traits')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'traits',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}