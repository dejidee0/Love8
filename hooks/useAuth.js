"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase, getCurrentUser, signOut } from "../lib/supabase";
import { getProfile, createProfile } from "../lib/supabase";
import { generateUsername } from "../lib/utils";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { user: currentUser } = await getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data: existingProfile } = await getProfile(userId);

      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // Create new profile for first-time users
        const { user: currentUser } = await getCurrentUser();
        const newProfile = {
          user_id: userId,
          username: generateUsername(
            currentUser?.user_metadata?.full_name,
            currentUser?.email
          ),
          display_name: currentUser?.user_metadata?.full_name || "",
          avatar_url: currentUser?.user_metadata?.avatar_url || "",
          bio: "",
          social_links: {},
        };

        const { data: createdProfile } = await createProfile(newProfile);
        if (createdProfile) {
          setProfile(createdProfile[0]);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    logout,
    refreshProfile: () => user && loadUserProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
