const MAX_DIMENSION = 400
const MAX_BYTES = 360 * 1024
const QUALITY_STEPS = [0.85, 0.7, 0.5, 0.3]

export async function compressAvatar(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)

  const { width, height } = bitmap
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
  const targetW = Math.round(width * scale)
  const targetH = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  const prefix = 'data:image/jpeg;base64,'
  for (const quality of QUALITY_STEPS) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    const byteLength = Math.ceil((dataUrl.length - prefix.length) * 3 / 4)
    if (byteLength <= MAX_BYTES) return dataUrl
  }

  return canvas.toDataURL('image/jpeg', 0.3)
}
