import { useEffect, useState } from 'react'
import { fetchAdminStats } from '../utils/adminStats'
import type { AdminStats } from '../utils/adminStats'
import { formatCurrency } from '../utils/format'

type AdminDashboardProps = {
  apiBaseUrl: string
}

export function AdminDashboard({ apiBaseUrl }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      setIsLoading(true)
      setNotice('')

      try {
        const nextStats = await fetchAdminStats(apiBaseUrl)

        if (isMounted) {
          setStats(nextStats)
        }
      } catch {
        if (isMounted) {
          setNotice('Chua tai duoc thong ke. Kiem tra dang nhap chu quan va backend.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div>
          <span>Dashboard</span>
          <h1>Tong quan hom nay</h1>
          <p>Theo doi doanh thu, don moi va mon ban chay trong ngay.</p>
        </div>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      {isLoading ? (
        <div className="loading-state">Dang tai thong ke...</div>
      ) : (
        <section className="admin-stats">
          <div>
            <span>Doanh thu hom nay</span>
            <strong>{formatCurrency(stats?.todayRevenue ?? 0)}</strong>
          </div>
          <div>
            <span>Don moi</span>
            <strong>{stats?.newOrderCount ?? 0}</strong>
          </div>
          <div>
            <span>Mon ban chay</span>
            <strong>{stats?.bestSellingProduct?.productName ?? 'Chua co'}</strong>
            {stats?.bestSellingProduct ? (
              <p>{stats.bestSellingProduct.quantitySold} phan</p>
            ) : null}
          </div>
        </section>
      )}
    </main>
  )
}
