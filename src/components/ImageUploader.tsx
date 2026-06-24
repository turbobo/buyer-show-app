'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
}

export default function ImageUploader({ images, onChange, max = 9 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewIdx, setPreviewIdx] = useState<number | null>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const remaining = max - images.length
    const selected = Array.from(files).slice(0, remaining)

    selected.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange([...images, e.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {images.map((url, i) => (
            <motion.div
              key={url + i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" onClick={() => setPreviewIdx(i)} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < max && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-coral-300 hover:text-coral-400 transition-colors"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-[11px]">{images.length}/{max}</span>
          </motion.button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 全屏预览 */}
      <AnimatePresence>
        {previewIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setPreviewIdx(null)}
          >
            <img
              src={images[previewIdx]}
              alt=""
              loading="lazy"
              className="max-w-[90%] max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === previewIdx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
            <button
              className="absolute top-4 right-4 text-white/80 text-2xl w-8 h-8 flex items-center justify-center"
              onClick={() => setPreviewIdx(null)}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
