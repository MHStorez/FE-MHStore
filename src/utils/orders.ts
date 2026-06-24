import type { CartItem, CustomerInfo, SavedOrder } from '../types'
import { getAuthToken } from './auth'

export const saveOrder = async (
  apiBaseUrl: string,
  items: CartItem[],
  customer: CustomerInfo,
) => {
  const response = await fetch(`${apiBaseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerInfo: customer,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`Order API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder
}

export const fetchOrders = async (apiBaseUrl: string) => {
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/orders?limit=100`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    throw new Error(`Orders API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder[]
}

export const updateOrderStatus = async (
  apiBaseUrl: string,
  orderId: string,
  status: 'Pending' | 'Completed',
) => {
  const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error(`Order status API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder
}
