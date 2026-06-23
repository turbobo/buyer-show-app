/** @type {import('next').NextConfig} */
// dev 模式不启用静态导出（避免 dynamic route /post/[id] 在 generateStaticParams 列表外报"missing param"）；
// 仅在 next build 时输出静态文件给 EdgeOne Pages
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  ...(isProd ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
}

export default nextConfig
