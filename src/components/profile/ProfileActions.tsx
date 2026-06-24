'use client'

import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface Props {
  onLogout: () => void
  onDeleteAccount: () => void
}

export default function ProfileActions({ onLogout, onDeleteAccount }: Props) {
  return (
    <>
      {/* ── Logout Button ── */}
      <motion.div
        custom={3}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mt-6 mb-4"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogout}
          className="w-full py-3.5 rounded-2xl text-sm font-medium text-gray-400 bg-white border border-gray-100 shadow-sm hover:text-red-400 hover:border-red-100 transition-all duration-200"
        >
          退出登录
        </motion.button>
      </motion.div>

      {/* ── Delete Account ── */}
      <motion.div
        custom={4}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-4"
      >
        <button
          onClick={onDeleteAccount}
          className="w-full text-center text-xs text-gray-300 hover:text-coral-500 transition-colors py-2"
        >
          注销账号
        </button>
      </motion.div>
    </>
  )
}
