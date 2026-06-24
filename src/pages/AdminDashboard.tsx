import { useEffect, useState } from 'react'
import { fetchAdminStats } from '../utils/adminStats'
import type { AdminStats } from '../utils/adminStats'
import { formatCurrency } from '../utils/format'

type AdminDashboardProps = {
  apiBaseUrl: string
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))

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
          <h1>Tong quan cua hang</h1>
          <p>Theo doi doanh thu, don hang, mon ban chay va khach hang noi bat.</p>
        </div>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      {isLoading ? (
        <div className="loading-state">Dang tai thong ke...</div>
      ) : (
        <>
          <section className="admin-stats dashboard-stats">
            <div>
              <span>Doanh thu hom nay</span>
              <strong>{formatCurrency(stats?.todayRevenue ?? 0)}</strong>
            </div>
            <div>
              <span>Tong doanh thu</span>
              <strong>{formatCurrency(stats?.totalRevenue ?? 0)}</strong>
            </div>
            <div>
              <span>Don moi</span>
              <strong>{stats?.newOrderCount ?? 0}</strong>
            </div>
            <div>
              <span>Dang xu ly</span>
              <strong>{stats?.pendingOrderCount ?? 0}</strong>
            </div>
            <div>
              <span>Da hoan tat</span>
              <strong>{stats?.completedOrderCount ?? 0}</strong>
            </div>
            <div>
              <span>Tong don</span>
              <strong>{stats?.totalOrderCount ?? 0}</strong>
            </div>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <div className="panel-heading">
                <span>Mon ban chay</span>
                <strong>{stats?.bestSellingProduct?.productName ?? 'Chua co du lieu'}</strong>
              </div>
              {stats?.topProducts.length ? (
                <ul className="dashboard-list">
                  {stats.topProducts.map((product) => (
                    <li key={product.productId}>
                      <div>
                        <strong>{product.productName}</strong>
                        <span>{product.quantitySold} phan da ban</span>
                      </div>
                      <em>{formatCurrency(product.revenue)}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-panel-text">Chua co san pham hoan tat don.</p>
              )}
            </article>

            <article className="dashboard-panel">
              <div className="panel-heading">
                <span>Khach hang noi bat</span>
                <strong>Top chi tieu</strong>
              </div>
              {stats?.topCustomers.length ? (
                <ul className="dashboard-list">
                  {stats.topCustomers.map((customer) => (
                    <li key={`${customer.phone}-${customer.lastOrderAt}`}>
                      <div>
                        <strong>{customer.name}</strong>
                        <span>{customer.phone} · {customer.orderCount} don</span>
                        <small>Lan cuoi: {formatDateTime(customer.lastOrderAt)}</small>
                      </div>
                      <em>{formatCurrency(customer.totalSpent)}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-panel-text">Chua co khach hang hoan tat don.</p>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  )
}
