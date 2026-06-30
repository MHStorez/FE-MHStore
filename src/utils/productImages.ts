import type { Product } from '../types'

export const fallbackProductImage =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'

export const getProductImages = (product: Product) => {
  const imageUrls = product.imageUrls?.filter((imageUrl) => imageUrl.trim()) ?? []

  if (imageUrls.length > 0) {
    return imageUrls
  }

  return product.imageUrl ? [product.imageUrl] : []
}

export const getProductImage = (product: Product) =>
  getProductImages(product)[0] || fallbackProductImage

export const getProductStock = (product: Product) => product.stock ?? 0

export const isProductInStock = (product: Product) =>
  (product.isAvailable ?? true) && getProductStock(product) > 0
