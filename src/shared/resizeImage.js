import { readAndCompressImage } from 'browser-image-resizer'

const resizeImage = async (file, maxWidth, maxHeight) => {
  const blob = await readAndCompressImage(file, {
    quality: 0.7,
    maxWidth,
    maxHeight
  })

  return new window.File([blob], 'image.jpg', { type: 'image/jpeg' })
}

export default resizeImage
