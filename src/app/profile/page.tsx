'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useProfilePage } from '@/hooks/useProfilePage'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileMenu from '@/components/profile/ProfileMenu'
import ProfilePosts from '@/components/profile/ProfilePosts'
import ProfileToast from '@/components/profile/ProfileToast'

export default function ProfilePage() {
  const {
    user,
    isLoggedIn,
    authReady,
    toast,
    userPosts,
    handleMenuClick,
    handleLogin,
  } = useProfilePage()

  return (
    <div className="min-h-screen bg-warm-50 pb-28 md:pt-20">
      <ProfileHeader
        authReady={authReady}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
      />

      {/* Logged-in Content */}
      <AnimatePresence>
        {isLoggedIn && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 -mt-3 max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
          >
            <ProfileMenu user={user} onMenuClick={handleMenuClick} />

            <ProfilePosts userPosts={userPosts} />
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileToast message={toast} />
    </div>
  )
}
