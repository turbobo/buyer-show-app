import { supabase } from '@/lib/supabase'

/**
 * 种子数据：首次运行且数据库为空时插入示例帖子
 * 仅在开发环境调用
 */
export async function seedIfEmpty(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return

  // 检查是否已有数据
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  if ((count ?? 0) > 0) return

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const samplePosts = [
    {
      user_id: user.id,
      title: '这款降噪耳机真的太绝了！',
      content: '入手 Sony WH-1000XM5 一个月了，降噪效果惊艳！飞机上、地铁里完全隔绝噪音，音质也很通透。续航 30 小时无压力，折叠收纳很方便。唯一缺点是价格偏高，但绝对值！',
      images: [],
      tags: ['数码', '耳机'],
      product_name: 'Sony WH-1000XM5',
      price: '¥2499',
      rating: 5,
    },
    {
      user_id: user.id,
      title: 'MacBook Air M3 深度使用两周感受',
      content: '从 Intel 换到 M3，性能飞跃太明显了。日常办公、写代码、剪视频都很流畅，续航一整天不用担心。屏幕素质顶级，键盘手感也改善了很多。强烈推荐需要便携办公的朋友入手。',
      images: [],
      tags: ['数码', '电脑'],
      product_name: 'MacBook Air M3',
      price: '¥8999',
      rating: 5,
    },
    {
      user_id: user.id,
      title: '宜家这款收纳柜绝了，小户型必备',
      content: 'KALLAX 系列收纳柜，简约百搭，组装简单。放书、放杂物、当隔断都行。白色款和我的房间风格完美搭配，价格也很友好。买了两个叠在一起用，稳得很。',
      images: [],
      tags: ['家居', '收纳'],
      product_name: 'IKEA KALLAX 收纳柜',
      price: '¥399',
      rating: 4,
    },
    {
      user_id: user.id,
      title: '平价替代！这支口红完全不输大牌',
      content: 'colorkey 唇釉 #R702，颜色是超温柔的豆沙玫瑰色，质地丝滑不拔干，持久度也不错。日常通勤涂超好看，价格才几十块！已经回购第三支了。',
      images: [],
      tags: ['美妆', '口红'],
      product_name: 'Colorkey 唇釉 R702',
      price: '¥59',
      rating: 4,
    },
    {
      user_id: user.id,
      title: '跑步三个月，终于找到合适的跑鞋',
      content: 'Nike Pegasus 41 真的是全能跑鞋，缓震舒适、回弹有力、透气性好。日常 5-10km 训练完全够用，新手入门首选！比我之前穿的某品牌好太多了。',
      images: [],
      tags: ['运动', '跑鞋'],
      product_name: 'Nike Pegasus 41',
      price: '¥899',
      rating: 5,
    },
    {
      user_id: user.id,
      title: '戴森吹风机值不值得买？',
      content: '用了半年来说，真的值！吹干速度快一倍，头发顺滑不毛躁，而且很轻不累手。虽然贵但每天用，算下来性价比很高。头发毛躁的姐妹冲就对了。',
      images: [],
      tags: ['家居', '个护'],
      product_name: 'Dyson Supersonic',
      price: '¥2990',
      rating: 4,
    },
  ]

  const { error } = await supabase.from('posts').insert(samplePosts)
  if (error) {
    console.error('[seed] insert failed:', error.message)
  } else {
    console.log('[seed] inserted 6 sample posts')
  }
}
