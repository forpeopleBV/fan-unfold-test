const imageCache = new Map<string, Promise<void>>()

export function preloadImage(src: string, priority: 'high' | 'low' = 'low') {
  const cachedImage = imageCache.get(src)

  if (cachedImage) {
    return cachedImage
  }

  const imagePromise = new Promise<void>((resolve, reject) => {
    const image = new Image()

    image.decoding = 'async'
    image.fetchPriority = priority
    image.onload = () => {
      // decode() makes sure the pixels are ready before React displays the image.
      void image.decode().catch(() => undefined).finally(resolve)
    }
    image.onerror = () => reject(new Error(`Unable to preload image: ${src}`))
    image.src = src
  })

  imageCache.set(src, imagePromise)
  return imagePromise
}
