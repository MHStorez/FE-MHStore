import { getAuthToken } from './auth'

export type BestSellingProduct = {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export type CustomerSummary = {
  name: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

export type AdminStats = {
  todayRevenue: number
  newOrderCount: number
  pendingOrderCount: number
  completedOrderCount: number
  totalOrderCount: number
  totalRevenue: number
  bestSellingProduct?: BestSellingProduct | null
  topProducts: BestSellingProduct[]
  topCustomers: CustomerSummary[]
}

export const fetchAdminStats = async (apiBaseUrl: string) => {
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/admin/stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    throw new Error(`Admin stats API returned ${response.status}`)
  }

  return (await response.json()) as AdminStats
}
