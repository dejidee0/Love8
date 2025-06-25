import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../hooks/useAuth'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Love8 - Discover Your True Self',
  description: 'The trait-based social platform where personality meets community. Discover, share, and celebrate what makes you unique.',
  keywords: 'personality, traits, social, community, self-discovery, identity',
  authors: [{ name: 'Love8 Team' }],
  openGraph: {
    title: 'Love8 - Discover Your True Self',
    description: 'The trait-based social platform where personality meets community.',
    url: 'https://love8.app',
    siteName: 'Love8',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Love8 - Trait-based social platform'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Love8 - Discover Your True Self',
    description: 'The trait-based social platform where personality meets community.',
    images: ['/og-image.jpg']
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8B5CF6'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151'
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F9FAFB'
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F9FAFB'
                }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}