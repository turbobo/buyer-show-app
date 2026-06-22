export interface User {
  id: string
  nickname: string
  avatar_url: string
  bio: string
  post_count: number
  follower_count: number
  following_count: number
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  images: string[]
  tags: string[]
  product_name: string
  price: string
  rating: number
  like_count: number
  comment_count: number
  status: 'active' | 'hidden'
  created_at: string
  user?: Pick<User, 'nickname' | 'avatar_url'>
  is_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: Pick<User, 'nickname' | 'avatar_url'>
}
