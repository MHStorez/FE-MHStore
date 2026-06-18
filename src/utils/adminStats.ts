import { getAuthToken } from './auth'

export type AdminStats = {
  todayRevenue: number
  newOrderCount: number
  bestSellingProduct?: {
    productId: string
    productName: string
    quantitySold: number
    revenue: number
  } | null
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
