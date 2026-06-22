'use client'

import { motion } from 'framer-motion'

interface Props {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export default function StarRating({ value, onChange, size = 'md', readonly = false }: Props) {
  const sizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          disabled={readonly}
          whileTap={!readonly ? { scale: 1.3 } : undefined}
          onClick={() => onChange?.(n)}
          className={`${sizes[size]} transition-colors duration-200 ${
            n <= value ? 'text-amber-400' : 'text-gray-200'
          } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          ★
        </motion.button>
      ))}
      <span className="text-sm text-gray-500 ml-2">
        {value === 1 ? '很差' : value === 2 ? '较差' : value === 3 ? '一般' : value === 4 ? '推荐' : '强推'}
      </span>
    </div>
  )
}
