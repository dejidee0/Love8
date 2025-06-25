'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { FiArrowRight, FiStar, FiHeart, FiUsers, FiZap, FiTrendingUp } from 'react-icons/fi'
import Lottie from 'lottie-react'

// Floating trait bubbles data
const floatingTraits = [
  { word: 'Creative', color: 'purple', delay: 0 },
  { word: 'Kind', color: 'pink', delay: 0.5 },
  { word: 'Smart', color: 'blue', delay: 1 },
  { word: 'Funny', color: 'green', delay: 1.5 },
  { word: 'Loyal', color: 'orange', delay: 2 },
  { word: 'Brave', color: 'red', delay: 2.5 },
  { word: 'Wise', color: 'purple', delay: 3 },
  { word: 'Caring', color: 'pink', delay: 3.5 }
]

const features = [
  {
    icon: FiHeart,
    title: 'Trait Cloud',
    description: 'Build your personality constellation with floating trait bubbles that grow with endorsements'
  },
  {
    icon: FiUsers,
    title: 'Find Your Bestie',
    description: 'Connect with your perfect match based on complementary traits and shared values'
  },
  {
    icon: FiZap,
    title: 'Word Battles',
    description: 'Challenge friends to trait battles and discover who has the most creative personality'
  },
  {
    icon: FiTrendingUp,
    title: 'AI Insights',
    description: 'Get personalized trait suggestions and discover hidden aspects of your personality'
  }
]

const stats = [
  { number: '50K+', label: 'Active Users' },
  { number: '2M+', label: 'Traits Shared' },
  { number: '500K+', label: 'Connections Made' },
  { number: '98%', label: 'Love Rate' }
]

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 animated-gradient opacity-20"></div>
      
      {/* Floating particles */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Mouse follower */}
      <motion.div
        className="fixed w-6 h-6 bg-purple-500/30 rounded-full pointer-events-none z-50 mix-blend-screen"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FiHeart className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Love8
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <button
              onClick={() => router.push('/auth')}
              className="btn-ghost"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="btn-primary"
            >
              Get Started
            </button>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Discover
              </span>
              <br />
              <span className="text-white">Your True Self</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The trait-based social platform where personality meets community. 
              Build your trait cloud, find your bestie, and celebrate what makes you unique.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => router.push('/auth')}
                className="btn-primary text-lg px-8 py-4 group"
              >
                Start Your Journey
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/discover')}
                className="btn-ghost text-lg px-8 py-4"
              >
                Explore Traits
              </button>
            </div>
          </motion.div>

          {/* Floating trait bubbles */}
          <div className="relative h-96 mb-20">
            <AnimatePresence>
              {floatingTraits.map((trait, index) => (
                <motion.div
                  key={trait.word}
                  initial={{ opacity: 0, scale: 0, y: 100 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    x: Math.sin(index * 0.5) * 100,
                  }}
                  transition={{ 
                    delay: trait.delay,
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 3
                  }}
                  className={`absolute trait-bubble bg-${trait.color}-500/20 border-${trait.color}-500/30 text-${trait.color}-300`}
                  style={{
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${20 + Math.floor(index / 4) * 40}%`
                  }}
                >
                  {trait.word}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Features That
              </span>
              <br />
              <span className="text-white">Make You Shine</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the tools that help you express your authentic self and connect with like-minded souls
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card group hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Fall in Love with Yourself?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of people discovering their true selves through the power of traits
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="btn-primary text-lg px-8 py-4 group"
            >
              Start Your Journey
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-black/40">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FiHeart className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Love8
            </span>
          </div>
          <p className="text-gray-400">
            Made with ❤️ for people who love discovering themselves
          </p>
        </div>
      </footer>
    </div>
  )
}