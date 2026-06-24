import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { openLoginSheet, quickLogout } from '@/lib/auth-helpers'
import { deleteAccount, fetchUserPosts } from '@/services/user'
import type { Post } from '@/types'

export function useProfilePage() {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const authReady = useUserStore((s) => s.authReady)

  const [toast, setToast] = useState<string | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleMenuClick = (href: string | null, label: string) => {
    if (href) {
      router.push(href)
    } else {
      showToast(`${label} - 功能开发中`)
    }
  }

  const handleLogin = () => {
    openLoginSheet('查看个人信息')
  }

  const handleLogout = async () => {
    await quickLogout()
    showToast('已退出登录')
  }

  const handleDeleteAccount = () => {
    useUIStore.getState().openModal({
      title: '注销账号',
      description: '注销后帖子将被隐藏、昵称匿名化，且无法恢复。确定继续吗？',
      confirmText: '确认注销',
      confirmDanger: true,
      onConfirm: async () => {
        try {
          await deleteAccount()
          useUserStore.getState().logout()
          useUIStore.getState().addToast('success', '账号已注销')
          router.replace('/profile')
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '注销失败'
          useUIStore.getState().addToast('error', msg)
        }
      },
    })
  }

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUserPosts([])
      return
    }
    fetchUserPosts(user.id)
      .then(setUserPosts)
      .catch(() => {
        // silently fail — posts section shows empty state
      })
  }, [isLoggedIn, user])

  return {
    user,
    isLoggedIn,
    authReady,
    toast,
    userPosts,
    handleMenuClick,
    handleLogin,
    handleLogout,
    handleDeleteAccount,
  }
}
