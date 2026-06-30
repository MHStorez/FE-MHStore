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
          setNotice('Chưa tải được thống kê. Kiểm tra đăng nhập chủ quán và backend.')
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
          <h1>Tổng quan cửa hàng</h1>
          <p>Theo dõi doanh thu, đơn hàng, món bán chạy và khách hàng nổi bật.</p>
        </div>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      {isLoading ? (
        <div className="loading-state">Đang tải thống kê...</div>
      ) : (
        <>
          <section className="admin-stats dashboard-stats">
            <div>
              <span>Doanh thu hôm nay</span>
              <strong>{formatCurrency(stats?.todayRevenue ?? 0)}</strong>
            </div>
            <div>
              <span>Tổng doanh thu</span>
              <strong>{formatCurrency(stats?.totalRevenue ?? 0)}</strong>
            </div>
            <div>
              <span>Đơn mới</span>
              <strong>{stats?.newOrderCount ?? 0}</strong>
            </div>
            <div>
              <span>Đang xử lý</span>
              <strong>{stats?.pendingOrderCount ?? 0}</strong>
            </div>
            <div>
              <span>Đã hoàn tất</span>
              <strong>{stats?.completedOrderCount ?? 0}</strong>
            </div>
            <div>
              <span>Tổng đơn</span>
              <strong>{stats?.totalOrderCount ?? 0}</strong>
            </div>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <div className="panel-heading">
                <span>Món bán chạy</span>
                <strong>{stats?.bestSellingProduct?.productName ?? 'Chưa có dữ liệu'}</strong>
              </div>
              {stats?.topProducts.length ? (
                <ul className="dashboard-list">
                  {stats.topProducts.map((product) => (
                    <li key={product.productId}>
                      <div>
                        <strong>{product.productName}</strong>
                        <span>{product.quantitySold} phần đã bán</span>
                      </div>
                      <em>{formatCurrency(product.revenue)}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-panel-text">Chưa có sản phẩm hoàn tất đơn.</p>
              )}
            </article>

            <article className="dashboard-panel">
              <div className="panel-heading">
                <span>Khách hàng nổi bật</span>
                <strong>Top chi tiêu</strong>
              </div>
              {stats?.topCustomers.length ? (
                <ul className="dashboard-list">
                  {stats.topCustomers.map((customer) => (
                    <li key={`${customer.phone}-${customer.lastOrderAt}`}>
                      <div>
                        <strong>{customer.name}</strong>
                        <span>{customer.phone} · {customer.orderCount} đơn</span>
                        <small>Lần cuối: {formatDateTime(customer.lastOrderAt)}</small>
                      </div>
                      <em>{formatCurrency(customer.totalSpent)}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-panel-text">Chưa có khách hàng hoàn tất đơn.</p>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  )
}
