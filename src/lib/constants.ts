/**
 * 业务常量集中维护
 * - DB 字段枚举（与 Supabase schema 对齐）
 * - 通用魔法值
 *
 * 设计原则：DB 中含义简单的状态/标志字段统一用 int 存储（详见技术开发规范.md §11.5）。
 * 对应 SQL 迁移：
 *   - posts.status     → SMALLINT，见 migration-v6-post-status-int.sql
 *   - profiles.role    → SMALLINT，见 migration-v7-profile-tag-status-int.sql
 *   - profiles.status  → SMALLINT，见 migration-v7-profile-tag-status-int.sql
 *   - tags.status      → SMALLINT，见 migration-v7-profile-tag-status-int.sql
 */

/** 帖子状态（posts.status SMALLINT） */
export const POST_STATUS = {
  /** 正常展示 */
  ACTIVE: 0,
  /** 作者/系统主动隐藏（前台不可见，作者本人可见） */
  HIDDEN: 1,
  /** 软删除（注销账号 / 作者删除） */
  DELETED: 2,
} as const

export type PostStatusValue = (typeof POST_STATUS)[keyof typeof POST_STATUS]

/** 状态码 → 中文标签（仅用于后台/调试场景展示） */
export const POST_STATUS_LABEL: Record<PostStatusValue, string> = {
  [POST_STATUS.ACTIVE]: '正常',
  [POST_STATUS.HIDDEN]: '已隐藏',
  [POST_STATUS.DELETED]: '已删除',
}

/** 用户角色（profiles.role SMALLINT） */
export const USER_ROLE = {
  /** 普通用户 */
  USER: 0,
  /** 管理员 */
  ADMIN: 1,
} as const

export type UserRoleValue = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_ROLE_LABEL: Record<UserRoleValue, string> = {
  [USER_ROLE.USER]: '普通用户',
  [USER_ROLE.ADMIN]: '管理员',
}

/** 用户账号状态（profiles.status SMALLINT） */
export const USER_STATUS = {
  /** 正常 */
  ACTIVE: 0,
  /** 被管理员封禁（前台仍可查询资料，但操作受限；可解封） */
  BANNED: 1,
  /** 已注销（昵称匿名占位、内容已隐藏） */
  DELETED: 2,
} as const

export type UserStatusValue = (typeof USER_STATUS)[keyof typeof USER_STATUS]

export const USER_STATUS_LABEL: Record<UserStatusValue, string> = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.BANNED]: '已封禁',
  [USER_STATUS.DELETED]: '已注销',
}

/** 标签字典状态（tags.status SMALLINT） */
export const TAG_STATUS = {
  /** 启用 */
  ACTIVE: 0,
  /** 已归档（合并源标签使用，保留历史记录） */
  ARCHIVED: 1,
  /** 已删除（软删，仍保留行） */
  DELETED: 2,
} as const

export type TagStatusValue = (typeof TAG_STATUS)[keyof typeof TAG_STATUS]

export const TAG_STATUS_LABEL: Record<TagStatusValue, string> = {
  [TAG_STATUS.ACTIVE]: '启用',
  [TAG_STATUS.ARCHIVED]: '已归档',
  [TAG_STATUS.DELETED]: '已删除',
}
