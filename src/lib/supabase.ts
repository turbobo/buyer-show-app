import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

/**
 * Supabase 客户端
 * - persistSession: 浏览器 localStorage 持久化登录态，刷新页面不丢失
 * - autoRefreshToken: 后台自动续签 access_token（默认 1 小时过期）
 * - detectSessionInUrl: OAuth/邮件回调时从 URL 参数解析 session
 * - storageKey: 自定义键名便于多项目共享域名时隔离
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'buyer-show-auth',
    flowType: 'pkce',
  },
})
