export default function Skeleton() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {/* 标签栏骨架 */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-16 rounded-full shrink-0" />
        ))}
      </div>
      {/* 卡片骨架 */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="skeleton h-48 w-full" style={{ height: 180 + Math.random() * 60 }} />
          <div className="p-3 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="flex items-center gap-2 pt-1">
              <div className="skeleton h-6 w-6 rounded-full" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
