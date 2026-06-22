/**
 * 集中式 Framer Motion 动画 variants
 * 所有页面和组件统一引用此文件
 */
import type { Variants } from 'framer-motion'

/** 列表项错落淡入（瀑布流卡片、评论列表） */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/** 页面区块淡入上移（详情页各 section） */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

/** 页面转场 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

/** 按压反馈 props */
export const pressable = {
  whileTap: { scale: 0.96 } as const,
  whileHover: { scale: 1.02 } as const,
}

/** 弹入（Sheet/Modal 入场） */
export const sheetUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

/** 缩放弹入（Modal 卡片） */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

/** 渐变淡入 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/** 心跳动画关键帧（点赞） */
export const heartbeatKeyframes = {
  scale: [1, 1.4, 0.9, 1.2, 1],
  rotate: [0, -10, 10, -5, 0],
}

export const heartbeatTransition = {
  duration: 0.5,
  ease: 'easeInOut' as const,
}

/** Spring 配置常量 */
export const springs = {
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 25 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 20 },
}
