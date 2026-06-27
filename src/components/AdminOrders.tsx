import { useEffect, useMemo, useState } from 'react'
import type { SavedOrder } from '../types'
import { formatCurrency } from '../utils/format'
import { fetchOrders, updateOrderStatus } from '../utils/orders'

type AdminOrdersProps = {
  apiBaseUrl: string
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))

const orderStatusLabel = (status: string) => {
  if (status === 'Completed') return 'Hoàn tất'
  if (status === 'Processing') return 'Đang chuẩn bị'
  if (status === 'PaymentFailed') return 'Thanh toán lỗi'
  return 'Chờ thanh toán'
}

const paymentStatusLabel = (status: string) => {
  if (status === 'Paid') return 'Đã thanh toán'
  if (status === 'Failed') return 'Thanh toán thất bại'
  return 'Chờ thanh toán'
}

export function AdminOrders({ apiBaseUrl }: AdminOrdersProps) {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState('')

  const loadOrders = async () => {
    setIsLoading(true)
    setNotice('')

    try {
      const nextOrders = await fetchOrders(apiBaseUrl)
      setOrders(nextOrders)
    } catch {
      setNotice('Chưa tải được danh sách đơn. Kiểm tra backend và database.')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialOrders = async () => {
      try {
        const nextOrders = await fetchOrders(apiBaseUrl)

        if (isMounted) {
          setOrders(nextOrders)
          setNotice('')
        }
      } catch {
        if (isMounted) {
          setNotice('Chưa tải được danh sách đơn. Kiểm tra backend và database.')
          setOrders([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialOrders()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  const pendingCount = orders.filter((order) => order.status === 'Pending').length
  const processingCount = orders.filter((order) => order.status === 'Processing').length
  const completedTotal = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'Completed')
        .reduce((sum, order) => sum + order.totalPrice, 0),
    [orders],
  )

  const handleComplete = async (orderId: string) => {
    setUpdatingOrderId(orderId)
    setNotice('')

    try {
      const updatedOrder = await updateOrderStatus(apiBaseUrl, orderId, 'Completed')
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      )
    } catch {
      setNotice('Chưa hoàn tất được đơn. Chỉ đơn đã thanh toán và đang chuẩn bị mới được hoàn tất.')
    } finally {
      setUpdatingOrderId('')
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div>
          <span>Quản trị</span>
          <h1>Đơn hàng Zalo</h1>
          <p>Theo dõi trạng thái thanh toán riêng với trạng thái đơn hàng.</p>
        </div>
        <button type="button" className="refresh-button" onClick={loadOrders}>
          Tải lại
        </button>
      </section>

      <section className="admin-stats" aria-label="Tổng quan đơn hàng">
        <div>
          <span>Chờ thanh toán</span>
          <strong>{pendingCount}</strong>
        </div>
        <div>
          <span>Đang chuẩn bị</span>
          <strong>{processingCount}</strong>
        </div>
        <div>
          <span>Đã hoàn tất</span>
          <strong>{formatCurrency(completedTotal)}</strong>
        </div>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      <section className="orders-panel" aria-label="Danh sách đơn hàng">
        {isLoading ? (
          <div className="loading-state">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="empty-admin-state">Chưa có đơn hàng nào.</div>
        ) : (
          orders.map((order) => {
            const canComplete = order.paymentStatus === 'Paid' && order.status === 'Processing'

            return (
              <article className="order-card" key={order.id}>
                <div className="order-main">
                  <div>
                    <div className="order-title">
                      <strong>#{order.id.slice(0, 8)}</strong>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        Đơn: {orderStatusLabel(order.status)}
                      </span>
                      <span className={`status-pill payment-${order.paymentStatus.toLowerCase()}`}>
                        TT: {paymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                    <p>{formatDateTime(order.createdAt)}</p>
                  </div>
                  <strong>{formatCurrency(order.totalPrice)}</strong>
                </div>

                <div className="order-detail-grid">
                  <div>
                    <span>Khách</span>
                    <p>{order.customerInfo.name || 'Chưa nhập tên'}</p>
                    <p>{order.customerInfo.phone || 'Chưa nhập SĐT'}</p>
                    <p>{order.customerInfo.address || 'Chưa nhập địa chỉ'}</p>
                    {order.customerInfo.note ? <p>{order.customerInfo.note}</p> : null}
                  </div>
                  <div>
                    <span>Món</span>
                    <ul>
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.productId}-${item.productName}`}>
                          <span>
                            {item.productName} x{item.quantity}
                          </span>
                          <strong>
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    type="button"
                    disabled={updatingOrderId === order.id || !canComplete}
                    onClick={() => handleComplete(order.id)}
                  >
                    Hoàn tất
                  </button>
                </div>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
