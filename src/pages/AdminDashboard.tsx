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

  const topCustomers = stats?.topCustomers ?? []
  const topProducts = stats?.topProducts ?? []

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div>
          <span>Dashboard</span>
          <h1>Tổng quan bán hàng</h1>
          <p>
            Đơn Pending là đơn mới cần gọi/chốt. Đơn Completed là đơn đã xác nhận,
            dùng để tính doanh thu và khách mua nhiều.
          </p>
        </div>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      {isLoading ? (
        <div className="loading-state">Đang tải thống kê...</div>
      ) : (
        <>
          <section className="admin-stats" aria-label="Tổng quan doanh thu">
            <div>
              <span>Doanh thu hôm nay</span>
              <strong>{formatCurrency(stats?.todayRevenue ?? 0)}</strong>
            </div>
            <div>
              <span>Đơn mới hôm nay</span>
              <strong>{stats?.newOrderCount ?? 0}</strong>
              <p>{stats?.pendingOrderCount ?? 0} đơn đang xử lý</p>
            </div>
            <div>
              <span>Tổng doanh thu</span>
              <strong>{formatCurrency(stats?.totalRevenue ?? 0)}</strong>
              <p>{stats?.completedOrderCount ?? 0} đơn hoàn tất</p>
            </div>
          </section>

          <section className="admin-insight-grid" aria-label="Thống kê chi tiết">
            <article className="admin-insight-card">
              <div className="insight-heading">
                <span>Khách mua nhiều</span>
                <strong>Theo số điện thoại</strong>
              </div>
              {topCustomers.length === 0 ? (
                <p className="empty-insight">Chưa có đơn hoàn tất để tổng kết khách.</p>
              ) : (
                <div className="customer-summary-list">
                  {topCustomers.map((customer) => (
                    <div className="customer-summary-row" key={customer.phone}>
                      <div>
                        <strong>{customer.name}</strong>
                        <span>{customer.phone}</span>
                        <small>Mua gần nhất: {formatDateTime(customer.lastOrderAt)}</small>
                      </div>
                      <div>
                        <strong>{formatCurrency(customer.totalSpent)}</strong>
                        <span>{customer.orderCount} đơn</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-insight-card">
              <div className="insight-heading">
                <span>Món bán chạy</span>
                <strong>{stats?.bestSellingProduct?.productName ?? 'Chưa có'}</strong>
              </div>
              {topProducts.length === 0 ? (
                <p className="empty-insight">Chưa có món nào trong đơn hoàn tất.</p>
              ) : (
                <div className="product-summary-list">
                  {topProducts.map((product) => (
                    <div className="product-summary-row" key={product.productId}>
                      <span>{product.productName}</span>
                      <strong>
                        {product.quantitySold} phần · {formatCurrency(product.revenue)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="admin-flow-card">
            <span>Luồng Zalo</span>
            <p>
              Web lưu đơn vào dashboard trước, sau đó mở Zalo với tin nhắn đã soạn sẵn.
              Khách vẫn cần bấm gửi trong Zalo để Mẹ Mỹ nhận tin nhắn. Admin dùng mã đơn
              trong tin nhắn để đối chiếu và chuyển trạng thái sang Hoàn tất khi đã chốt.
            </p>
          </section>
        </>
      )}
    </main>
  )
}
