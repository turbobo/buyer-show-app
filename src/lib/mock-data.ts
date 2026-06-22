import type { Post, Comment, User } from '@/types'

/** 内联 SVG 头像：彩色圆 + 首字母，零外部依赖 */
function avatar(name: string, bg: string): string {
  const initial = name.charAt(0)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="${bg}"/><text x="40" y="42" text-anchor="middle" dominant-baseline="central" fill="white" font-size="36" font-family="PingFang SC,sans-serif" font-weight="600">${initial}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const AVATARS = [
  avatar('美', '#FF6B35'),
  avatar('杰', '#8B5CF6'),
  avatar('能', '#3B82F6'),
  avatar('妆', '#EC4899'),
  avatar('动', '#10B981'),
]

export const MOCK_USERS: User[] = [
  { id: 'u1', nickname: '购物达人小美', avatar_url: AVATARS[0], bio: '分享真实购物体验', post_count: 42, follower_count: 1280, following_count: 88, created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id: 'u2', nickname: '数码控阿杰', avatar_url: AVATARS[1], bio: '数码产品深度评测', post_count: 35, follower_count: 960, following_count: 120, created_at: '2024-02-20', updated_at: '2024-02-20' },
  { id: 'u3', nickname: '居家小能手', avatar_url: AVATARS[2], bio: '家居好物推荐', post_count: 28, follower_count: 750, following_count: 65, created_at: '2024-03-10', updated_at: '2024-03-10' },
  { id: 'u4', nickname: '美妆探索家', avatar_url: AVATARS[3], bio: '平价美妆测评', post_count: 56, follower_count: 2100, following_count: 150, created_at: '2024-01-05', updated_at: '2024-01-05' },
  { id: 'u5', nickname: '运动少年', avatar_url: AVATARS[4], bio: '运动装备分享', post_count: 18, follower_count: 430, following_count: 95, created_at: '2024-04-01', updated_at: '2024-04-01' },
]

/** 内联渐变占位图：零外部依赖，按品类配色 */
const GRADIENTS: Record<string, [string, string]> = {
  headphone: ['#6366F1', '#8B5CF6'],
  macbook: ['#1E293B', '#475569'],
  cabinet: ['#D97706', '#F59E0B'],
  lipstick: ['#EC4899', '#F472B6'],
  shoes: ['#059669', '#34D399'],
  dryer: ['#7C3AED', '#A78BFA'],
  skincare: ['#F43F5E', '#FB7185'],
  switch: ['#DC2626', '#F87171'],
}

function placeholderImg(category: string, idx: number, w = 400, h = 300): string {
  const [c1, c2] = GRADIENTS[category] || ['#FF6B35', '#FFAB87']
  const angle = (idx * 45) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" gradientTransform="rotate(${angle})"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/><text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.3)" font-size="48" font-family="PingFang SC,sans-serif">${category}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1', user_id: 'u1', title: '这款降噪耳机真的太绝了！', content: '入手 Sony WH-1000XM5 一个月了，降噪效果惊艳！飞机上、地铁里完全隔绝噪音，音质也很通透。续航 30 小时无压力，折叠收纳很方便。唯一缺点是价格偏高，但绝对值！', images: [placeholderImg('headphone', 0, 400, 500), placeholderImg('headphone', 1, 400, 300), placeholderImg('headphone', 2, 400, 350)], tags: ['数码', '耳机'], product_name: 'Sony WH-1000XM5', price: '¥2499', rating: 5, like_count: 328, comment_count: 42, status: 'active', created_at: '2025-06-15T10:30:00Z', updated_at: '2025-06-15T10:30:00Z', user: { nickname: MOCK_USERS[0].nickname, avatar_url: MOCK_USERS[0].avatar_url },
  },
  {
    id: 'p2', user_id: 'u2', title: 'MacBook Air M3 深度使用两周感受', content: '从 Intel 换到 M3，性能飞跃太明显了。日常办公、写代码、剪视频都很流畅，续航一整天不用担心。屏幕素质顶级，键盘手感也改善了很多。', images: [placeholderImg('macbook', 0, 400, 300), placeholderImg('macbook', 1, 400, 450)], tags: ['数码', '电脑'], product_name: 'MacBook Air M3', price: '¥8999', rating: 5, like_count: 512, comment_count: 89, status: 'active', created_at: '2025-06-14T08:00:00Z', updated_at: '2025-06-14T08:00:00Z', user: { nickname: MOCK_USERS[1].nickname, avatar_url: MOCK_USERS[1].avatar_url },
  },
  {
    id: 'p3', user_id: 'u3', title: '宜家这款收纳柜绝了，小户型必备', content: 'KALLAX 系列收纳柜，简约百搭，组装简单。放书、放杂物、当隔断都行。白色款和我的房间风格完美搭配，价格也很友好。', images: [placeholderImg('cabinet', 0, 400, 500), placeholderImg('cabinet', 1, 400, 300), placeholderImg('cabinet', 2, 400, 400), placeholderImg('cabinet', 3, 400, 350)], tags: ['家居', '收纳'], product_name: 'IKEA KALLAX 收纳柜', price: '¥399', rating: 4, like_count: 186, comment_count: 23, status: 'active', created_at: '2025-06-13T14:20:00Z', updated_at: '2025-06-13T14:20:00Z', user: { nickname: MOCK_USERS[2].nickname, avatar_url: MOCK_USERS[2].avatar_url },
  },
  {
    id: 'p4', user_id: 'u4', title: '平价替代！这支口红完全不输大牌', content: 'colorkey 唇釉 #R702，颜色是超温柔的豆沙玫瑰色，质地丝滑不拔干，持久度也不错。日常通勤涂超好看，价格才几十块！', images: [placeholderImg('lipstick', 0, 400, 500), placeholderImg('lipstick', 1, 400, 300)], tags: ['美妆', '口红'], product_name: 'Colorkey 唇釉 R702', price: '¥59', rating: 4, like_count: 892, comment_count: 156, status: 'active', created_at: '2025-06-12T16:45:00Z', updated_at: '2025-06-12T16:45:00Z', user: { nickname: MOCK_USERS[3].nickname, avatar_url: MOCK_USERS[3].avatar_url },
  },
  {
    id: 'p5', user_id: 'u5', title: '跑步三个月，终于找到合适的跑鞋', content: 'Nike Pegasus 41 真的是全能跑鞋，缓震舒适、回弹有力、透气性好。日常 5-10km 训练完全够用，新手入门首选！', images: [placeholderImg('shoes', 0, 400, 400), placeholderImg('shoes', 1, 400, 300), placeholderImg('shoes', 2, 400, 500)], tags: ['运动', '跑鞋'], product_name: 'Nike Pegasus 41', price: '¥899', rating: 5, like_count: 245, comment_count: 38, status: 'active', created_at: '2025-06-11T09:15:00Z', updated_at: '2025-06-11T09:15:00Z', user: { nickname: MOCK_USERS[4].nickname, avatar_url: MOCK_USERS[4].avatar_url },
  },
  {
    id: 'p6', user_id: 'u1', title: '戴森吹风机值不值得买？', content: '用了半年来说，真的值！吹干速度快一倍，头发顺滑不毛躁，而且很轻不累手。虽然贵但每天用，算下来性价比很高。', images: [placeholderImg('dryer', 0, 400, 450), placeholderImg('dryer', 1, 400, 300)], tags: ['家居', '个护'], product_name: 'Dyson Supersonic', price: '¥2990', rating: 4, like_count: 421, comment_count: 67, status: 'active', created_at: '2025-06-10T11:00:00Z', updated_at: '2025-06-10T11:00:00Z', user: { nickname: MOCK_USERS[0].nickname, avatar_url: MOCK_USERS[0].avatar_url },
  },
  {
    id: 'p7', user_id: 'u4', title: '学生党护肤全套推荐', content: '分享我用了两年的平价护肤流程：珂润洁面→悦木之源菌菇水→CeraVe乳液→安耐晒小金瓶。简单四步，皮肤状态稳定不翻车。', images: [placeholderImg('skincare', 0, 400, 500), placeholderImg('skincare', 1, 400, 400), placeholderImg('skincare', 2, 400, 300), placeholderImg('skincare', 3, 400, 350), placeholderImg('skincare', 4, 400, 400)], tags: ['美妆', '护肤'], product_name: '平价护肤套装', price: '¥380', rating: 5, like_count: 1203, comment_count: 234, status: 'active', created_at: '2025-06-09T15:30:00Z', updated_at: '2025-06-09T15:30:00Z', user: { nickname: MOCK_USERS[3].nickname, avatar_url: MOCK_USERS[3].avatar_url },
  },
  {
    id: 'p8', user_id: 'u2', title: 'Switch OLED 值不值得升级？', content: '从初代 Switch 换到 OLED 版，屏幕提升太明显了，色彩鲜艳、边框更窄。底座新增网线接口，TV 模式更稳定。如果经常掌机模式，强烈推荐升级！', images: [placeholderImg('switch', 0, 400, 300), placeholderImg('switch', 1, 400, 400)], tags: ['数码', '游戏'], product_name: 'Nintendo Switch OLED', price: '¥2299', rating: 4, like_count: 367, comment_count: 52, status: 'active', created_at: '2025-06-08T13:00:00Z', updated_at: '2025-06-08T13:00:00Z', user: { nickname: MOCK_USERS[1].nickname, avatar_url: MOCK_USERS[1].avatar_url },
  },
]

export const MOCK_COMMENTS: Record<string, Comment[]> = {
  p1: [
    { id: 'c1', post_id: 'p1', user_id: 'u2', content: '同款入手，降噪确实强！飞机上简直是神器', created_at: '2025-06-15T12:00:00Z', user: { nickname: MOCK_USERS[1].nickname, avatar_url: MOCK_USERS[1].avatar_url } },
    { id: 'c2', post_id: 'p1', user_id: 'u4', content: '请问和 AirPods Max 比怎么样？', created_at: '2025-06-15T14:30:00Z', user: { nickname: MOCK_USERS[3].nickname, avatar_url: MOCK_USERS[3].avatar_url } },
    { id: 'c3', post_id: 'p1', user_id: 'u3', content: '价格劝退了，等双十一再看看', created_at: '2025-06-16T09:00:00Z', user: { nickname: MOCK_USERS[2].nickname, avatar_url: MOCK_USERS[2].avatar_url } },
  ],
  p4: [
    { id: 'c4', post_id: 'p4', user_id: 'u1', content: '这个颜色好好看！已下单', created_at: '2025-06-12T18:00:00Z', user: { nickname: MOCK_USERS[0].nickname, avatar_url: MOCK_USERS[0].avatar_url } },
    { id: 'c5', post_id: 'p4', user_id: 'u3', content: '持久度怎么样？吃饭会掉吗？', created_at: '2025-06-13T10:00:00Z', user: { nickname: MOCK_USERS[2].nickname, avatar_url: MOCK_USERS[2].avatar_url } },
  ],
}

export const HOT_TAGS = ['数码', '美妆', '家居', '服饰', '食品', '运动', '母婴', '图书']
