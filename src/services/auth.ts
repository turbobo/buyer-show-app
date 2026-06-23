import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import type { User } from '@/types'
import { fetchCurrentUser } from '@/services/user'

/** 匿名登录（开发阶段使用） */
export async function signInAnonymously(): Promise<User> {
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw new Error(`登录失败: ${error.message}`)

  const user = await fetchCurrentUser()
  if (!user) throw new Error('获取用户信息失败')

  useUserStore.getState().setUser(user)
  return user
}

/** 手机号 + 验证码登录 */
export async function signInWithPhone(phone: string, token: string): Promise<User> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  if (error) throw new Error(`登录失败: ${error.message}`)

  const user = await fetchCurrentUser()
  if (!user) throw new Error('获取用户信息失败')

  useUserStore.getState().setUser(user)
  return user
}

/** 发送手机验证码 */
export async function sendPhoneOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw new Error(`发送验证码失败: ${error.message}`)
}

/** 邮箱 + 密码登录 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`登录失败: ${error.message}`)

  const user = await fetchCurrentUser()
  if (!user) throw new Error('获取用户信息失败')

  useUserStore.getState().setUser(user)
  return user
}

/** 邮箱注册 */
export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string,
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  })
  if (error) throw new Error(`注册失败: ${error.message}`)
}

/** 退出登录 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  useUserStore.getState().logout()
}

/** 恢复登录态（应用启动时调用） */
export async function restoreSession(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const user = await fetchCurrentUser()
  if (user) {
    useUserStore.getState().setUser(user)
  }
  return user
}

/** 监听认证状态变化 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      const user = await fetchCurrentUser()
      callback(user)
    } else {
      useUserStore.getState().logout()
      callback(null)
    }
  })
}
