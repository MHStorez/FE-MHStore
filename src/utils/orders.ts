import type {
  CartItem,
  CustomerInfo,
  OrderChannel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  SavedOrder,
} from '../types'
import { getAuthToken } from './auth'

export type OrderFilters = {
  orderChannel?: OrderChannel | ''
  orderStatus?: OrderStatus | ''
  paymentStatus?: PaymentStatus | ''
  paymentMethod?: PaymentMethod | ''
  createdFrom?: string
  createdTo?: string
  search?: string
  limit?: number
}

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken()

  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const saveOrder = async (
  apiBaseUrl: string,
  items: CartItem[],
  customer: CustomerInfo,
  orderChannel: OrderChannel = 'Website',
  paymentMethod: PaymentMethod = 'Online',
) => {
  const response = await fetch(`${apiBaseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerInfo: customer,
      orderChannel,
      paymentMethod,
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

export const saveDirectOrder = async (
  apiBaseUrl: string,
  product: Product,
  quantity: number,
  customer: CustomerInfo,
  orderChannel: OrderChannel = 'Website',
  paymentMethod: PaymentMethod = 'Online',
) => {
  const response = await fetch(`${apiBaseUrl}/api/orders/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerInfo: customer,
      productId: product.id,
      quantity,
      orderChannel,
      paymentMethod,
    }),
  })

  if (!response.ok) {
    throw new Error(`Direct order API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder
}

export const fetchOrders = async (apiBaseUrl: string, filters: OrderFilters = {}) => {
  const params = new URLSearchParams()
  params.set('limit', String(filters.limit ?? 100))

  Object.entries(filters).forEach(([key, value]) => {
    if (key !== 'limit' && value) {
      params.set(key, String(value))
    }
  })

  const response = await fetch(`${apiBaseUrl}/api/orders?${params.toString()}`, {
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Orders API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder[]
}

const postOrderAction = async (apiBaseUrl: string, orderId: string, action: string) => {
  const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/${action}`, {
    method: 'POST',
    headers: authHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Order action API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder
}

export const updateOrderStatus = async (
  apiBaseUrl: string,
  orderId: string,
  status: OrderStatus,
) => {
  const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error(`Order status API returned ${response.status}`)
  }

  return (await response.json()) as SavedOrder
}

export const confirmOrder = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'confirm')

export const markOrderPreparing = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'prepare')

export const markOrderDelivering = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'deliver')

export const completeOrder = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'complete')

export const completeCodOrder = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'complete-cod')

export const confirmManualPayment = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'confirm-manual-payment')

export const cancelOrder = (apiBaseUrl: string, orderId: string) =>
  postOrderAction(apiBaseUrl, orderId, 'cancel')
