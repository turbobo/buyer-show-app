import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-warm-50 px-6">
      <div className="flex flex-col items-center text-center">
        <span className="text-6xl block mb-4">📭</span>
        <h1 className="text-h1 text-gray-800">页面不存在</h1>
        <p className="text-caption text-gray-400 mt-2 max-w-[280px]">
          你访问的页面可能已被移除或链接无效
        </p>
        <Link href="/" className="btn-primary mt-6 text-sm">
          返回首页
        </Link>
      </div>
    </div>
  )
}
