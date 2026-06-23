/** 用户资料（对应 profiles 表） */
export interface User {
  id: string
  nickname: string
  avatar_url: string
  bio: string
  post_count: number
  follower_count: number
  following_count: number
  /** 用户角色（0=普通用户 / 1=管理员；常量见 `src/lib/constants.ts` USER_ROLE） */
  role?: number
  /** 账号状态（0=正常 / 1=封禁 / 2=注销；常量见 `src/lib/constants.ts` USER_STATUS） */
  status?: number
  created_at: string
  updated_at: string
}

/** 帖子（对应 posts 表） */
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
  favorite_count: number
  /** 帖子状态（0=正常 / 1=已隐藏 / 2=已删除；常量见 `src/lib/constants.ts` POST_STATUS） */
  status: number
  created_at: string
  updated_at: string
  /** JOIN 字段：作者信息 */
  user?: Pick<User, 'nickname' | 'avatar_url'>
  /** JOIN 字段：当前用户是否已点赞 */
  is_liked?: boolean
  /** JOIN 字段：当前用户是否已收藏 */
  is_favorited?: boolean
}

/** 评论（对应 comments 表） */
export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  favorite_count?: number
  /** JOIN 字段：评论者信息 */
  user?: Pick<User, 'nickname' | 'avatar_url'>
  /** JOIN 字段：当前用户是否已收藏 */
  is_favorited?: boolean
}

/** 收藏标签项（favorite_tags 表） */
export interface FavoriteTag {
  id: string
  user_id: string
  tag: string
  created_at: string
}

/** 点赞（对应 likes 表） */
export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

/** 收藏（对应 favorites 表） */
export interface Favorite {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

/** 关注（对应 follows 表） */
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

/** 搜索历史（对应 search_history 表） */
export interface SearchHistory {
  id: string
  user_id: string
  keyword: string
  created_at: string
}

/** 创建帖子参数 */
export interface CreatePostParams {
  title: string
  content: string
  images: string[]
  tags?: string[]
  product_name?: string
  price?: string
  rating?: number
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  hasMore: boolean
  page: number
}

/** API 统一响应 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
