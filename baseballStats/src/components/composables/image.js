// Picture file -> small square JPEG (data URL), small enough to save in the database
export function shrinkImage(file, size = 160) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const side = Math.min(img.width, img.height)
            const canvas = document.createElement('canvas')
            canvas.width = canvas.height = size
            canvas.getContext('2d').drawImage(
                img,
                (img.width - side) / 2, (img.height - side) / 2, side, side,
                0, 0, size, size,
            )
            URL.revokeObjectURL(img.src)
            resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = () => reject(new Error('That file is not an image.'))
        img.src = URL.createObjectURL(file)
    })
}
