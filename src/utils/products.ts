import type { Product } from '../types'
import { getAuthToken } from './auth'

export type ProductPayload = {
  name: string
  description?: string
  price: number
  imageUrl?: string
  category: string
  isAvailable: boolean
}

const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const fetchProducts = async (
  apiBaseUrl: string,
  filters?: { search?: string; category?: string; includeUnavailable?: boolean },
) => {
  const params = new URLSearchParams()

  if (filters?.search) {
    params.set('search', filters.search)
  }

  if (filters?.category && filters.category !== 'Tat ca') {
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
