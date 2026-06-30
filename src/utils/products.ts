import type { Category, Product } from '../types'
import { getAuthToken } from './auth'

export type ProductPayload = {
  name: string
  description?: string
  price: number
  imageUrl?: string
  imageUrls?: string[]
  stock: number
  categoryId?: string
  category?: string
  newCategoryName?: string
  isAvailable: boolean
}

const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const fetchProducts = async (
  apiBaseUrl: string,
  filters?: { search?: string; categoryId?: string; category?: string; includeUnavailable?: boolean },
) => {
  const params = new URLSearchParams()

  if (filters?.search) {
    params.set('search', filters.search)
  }

  if (filters?.categoryId) {
    params.set('categoryId', filters.categoryId)
  } else if (filters?.category && filters.category !== 'Tat ca') {
    params.set('category', filters.category)
  }

  if (filters?.includeUnavailable) {
    params.set('includeUnavailable', 'true')
  }

  const query = params.toString()
  const response = await fetch(`${apiBaseUrl}/api/products${query ? `?${query}` : ''}`)

  if (!response.ok) {
    throw new Error(`Products API returned ${response.status}`)
  }

  return (await response.json()) as Product[]
}

export const fetchProduct = async (apiBaseUrl: string, productId: string) => {
  const response = await fetch(`${apiBaseUrl}/api/products/${productId}`)

  if (!response.ok) {
    throw new Error(`Product API returned ${response.status}`)
  }

  return (await response.json()) as Product
}

export const fetchCategories = async (apiBaseUrl: string, includeInactive = false) => {
  const params = new URLSearchParams()

  if (includeInactive) {
    params.set('includeInactive', 'true')
  }

  const query = params.toString()
  const response = await fetch(`${apiBaseUrl}/api/categories${query ? `?${query}` : ''}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Categories API returned ${response.status}`)
  }

  return (await response.json()) as Category[]
}

export const createCategory = async (apiBaseUrl: string, name: string, status = 'Active') => {
  const response = await fetch(`${apiBaseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name, status }),
  })

  if (!response.ok) {
    throw new Error(`Create category API returned ${response.status}`)
  }

  return (await response.json()) as Category
}

export const updateCategory = async (
  apiBaseUrl: string,
  categoryId: string,
  name: string,
  status: string,
) => {
  const response = await fetch(`${apiBaseUrl}/api/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name, status }),
  })

  if (!response.ok) {
    throw new Error(`Update category API returned ${response.status}`)
  }

  return (await response.json()) as Category
}

export const deleteCategory = async (apiBaseUrl: string, categoryId: string) => {
  const response = await fetch(`${apiBaseUrl}/api/categories/${categoryId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Delete category API returned ${response.status}`)
  }
}

export const uploadProductImage = async (apiBaseUrl: string, file: File) => {
  const formData = new FormData()
  formData.set('file', file)

  const response = await fetch(`${apiBaseUrl}/api/products/image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload image API returned ${response.status}`)
  }

  return (await response.json()) as { imageUrl: string }
}

export const createProduct = async (
  apiBaseUrl: string,
  payload: ProductPayload,
) => {
  const response = await fetch(`${apiBaseUrl}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Create product API returned ${response.status}`)
  }

  return (await response.json()) as Product
}

export const updateProduct = async (
  apiBaseUrl: string,
  productId: string,
  payload: ProductPayload,
) => {
  const response = await fetch(`${apiBaseUrl}/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Update product API returned ${response.status}`)
  }

  return (await response.json()) as Product
}

export const deleteProduct = async (apiBaseUrl: string, productId: string) => {
  const response = await fetch(`${apiBaseUrl}/api/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Delete product API returned ${response.status}`)
  }
}
