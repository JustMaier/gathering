const resizeImage = (file, maxWidth, maxHeight) => new Promise((resolve, reject) => {
  const reader = new window.FileReader()
  // Set the image once loaded into file reader
  reader.onload = function (e) {
    const img = document.createElement('img')
    img.src = e.target.result

    const canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    let width = img.width
    let height = img.height

    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height
        height = maxHeight
      }
    }
    canvas.width = width
    canvas.height = height
    ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)

    canvas.toBlob(blob => {
      resolve(new window.File([blob], 'image.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg')
  }
  reader.readAsDataURL(file)
})

export default resizeImage
