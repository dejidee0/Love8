/*
  # Love8 Social Platform Database Schema

  1. New Tables
    - `profiles` - User profiles with bio, avatar, social links
    - `traits` - Individual trait records with metadata
    - `trait_endorsements` - User endorsements of traits
    - `bestie_relationships` - Bestie connections between users
    - `trait_battles` - 1v1 trait comparison battles
    - `notifications` - In-app notification system
    - `user_streaks` - Daily login and activity streaks
    - `trait_stories` - Story posts about traits
    - `achievement_badges` - User achievement system
    - `premium_subscriptions` - Premium feature access

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure user data access patterns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  social_links jsonb DEFAULT '{}',
  trait_count integer DEFAULT 0,
  endorsement_count integer DEFAULT 0,
  bestie_id uuid REFERENCES profiles(id),
  bestie_since timestamptz,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Traits table
CREATE TABLE IF NOT EXISTS traits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trait_word text NOT NULL,
  description text,
  category text DEFAULT 'personality',
  color_theme text DEFAULT 'blue',
  endorsement_count integer DEFAULT 0,
  is_approved boolean DEFAULT false,
  is_ai_suggested boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trait endorsements table
CREATE TABLE IF NOT EXISTS trait_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trait_id uuid REFERENCES traits(id) ON DELETE CASCADE,
  endorser_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_approved boolean DEFAULT false,
  message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trait_id, endorser_id, recipient_id)
);

-- Bestie relationships table
CREATE TABLE IF NOT EXISTS bestie_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  mutual_traits jsonb DEFAULT '[]',
  streak_count integer DEFAULT 0,
  last_interaction timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- Trait battles table
CREATE TABLE IF NOT EXISTS trait_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trait_category text NOT NULL,
  challenger_traits jsonb DEFAULT '[]',
  opponent_traits jsonb DEFAULT '[]',
  winner_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  votes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type text NOT NULL,
  current_count integer DEFAULT 0,
  best_count integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Trait stories table
CREATE TABLE IF NOT EXISTS trait_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  trait_id uuid REFERENCES traits(id) ON DELETE CASCADE,
  content text,
  media_url text,
  media_type text DEFAULT 'image',
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

-- Achievement badges table
CREATE TABLE IF NOT EXISTS achievement_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  description text,
  icon_url text,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Premium subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'premium',
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestie_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for traits
CREATE POLICY "Users can view approved traits"
  ON traits FOR SELECT
  TO authenticated
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own traits"
  ON traits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own traits"
  ON traits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for trait endorsements
CREATE POLICY "Users can view endorsements for their traits"
  ON trait_endorsements FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = endorser_id);

CREATE POLICY "Users can create endorsements"
  ON trait_endorsements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can update endorsements they received"
  ON trait_endorsements FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- RLS Policies for bestie relationships
CREATE POLICY "Users can view their bestie relationships"
  ON bestie_relationships FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create bestie requests"
  ON bestie_relationships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update bestie relationships"
  ON bestie_relationships FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for other tables
CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view trait stories"
  ON trait_stories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view achievement badges"
  ON achievement_badges FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_traits_user_id ON traits(user_id);
CREATE INDEX IF NOT EXISTS idx_traits_approved ON traits(is_approved);
CREATE INDEX IF NOT EXISTS idx_trait_endorsements_trait_id ON trait_endorsements(trait_id);
CREATE INDEX IF NOT EXISTS idx_trait_endorsements_recipient ON trait_endorsements(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);