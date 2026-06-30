import { useEffect, useMemo, useState } from 'react'
import type { OrderChannel, OrderStatus, PaymentMethod, PaymentStatus, SavedOrder } from '../types'
import { formatCurrency } from '../utils/format'
import {
  cancelOrder,
  completeCodOrder,
  completeOrder,
  confirmManualPayment,
  confirmOrder,
  fetchOrders,
  markOrderDelivering,
  markOrderPreparing,
  type OrderFilters,
} from '../utils/orders'

type AdminOrdersProps = {
  apiBaseUrl: string
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))

const orderStatusLabel = (status: OrderStatus | string) => {
  if (status === 'PendingConfirmation') return 'Chờ xác nhận'
  if (status === 'Confirmed') return 'Đã xác nhận'
  if (status === 'Preparing') return 'Đang chuẩn bị'
  if (status === 'Delivering') return 'Đang giao'
  if (status === 'Completed') return 'Hoàn tất'
  if (status === 'Cancelled') return 'Đã huỷ'
  return status
}

const paymentStatusLabel = (status: PaymentStatus | string) => {
  if (status === 'Unpaid') return 'Chưa thanh toán'
  if (status === 'Pending') return 'Chờ thanh toán'
  if (status === 'Paid') return 'Đã thanh toán'
  if (status === 'Failed') return 'Thanh toán thất bại'
  if (status === 'Refunded') return 'Đã hoàn tiền'
  return status
}

const paymentMethodLabel = (method: PaymentMethod | string) => {
  if (method === 'Online') return 'Online'
  if (method === 'COD') return 'COD'
  if (method === 'ManualTransfer') return 'Chuyển khoản'
  return method
}

const channelLabel = (channel: OrderChannel | string) => channel === 'Zalo' ? 'Zalo' : 'Website'

const emptyFilters: OrderFilters = {
  orderChannel: '',
  orderStatus: '',
  paymentStatus: '',
  paymentMethod: '',
  createdFrom: '',
  createdTo: '',
  search: '',
  limit: 100,
}

export function AdminOrders({ apiBaseUrl }: AdminOrdersProps) {
  const [orders, setOrders] = useState<SavedOrder[]>([])
  const [filters, setFilters] = useState<OrderFilters>(emptyFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState('')

  const loadOrders = async (nextFilters = filters) => {
    setIsLoading(true)
    setNotice('')

    try {
      const nextOrders = await fetchOrders(apiBaseUrl, nextFilters)
      setOrders(nextOrders)
    } catch {
      setNotice('Chưa tải được danh sách đơn. Kiểm tra backend và database.')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders(emptyFilters)
  }, [apiBaseUrl])

  const pendingCount = orders.filter((order) => order.orderStatus === 'PendingConfirmation' || order.status === 'PendingConfirmation').length
  const deliveringCount = orders.filter((order) => order.orderStatus === 'Delivering' || order.status === 'Delivering').length
  const completedTotal = useMemo(
    () =>
      orders
        .filter((order) => order.orderStatus === 'Completed' || order.status === 'Completed')
        .reduce((sum, order) => sum + order.totalPrice, 0),
    [orders],
  )

  const updateFilter = (field: keyof OrderFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const runAction = async (orderId: string, action: () => Promise<SavedOrder>, errorMessage: string) => {
    setUpdatingOrderId(orderId)
    setNotice('')

    try {
      const updatedOrder = await action()
      setOrders((currentOrders) =>
        currentOrders.map((order) => order.id === updatedOrder.id ? updatedOrder : order),
      )
    } catch {
      setNotice(errorMessage)
    } finally {
      setUpdatingOrderId('')
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div>
          <span>Quản trị</span>
          <h1>Đơn hàng</h1>
          <p>Theo dõi kênh đặt hàng, thanh toán và trạng thái xử lý riêng biệt.</p>
        </div>
        <button type="button" className="refresh-button" onClick={() => loadOrders()}>
          Tải lại
        </button>
      </section>

      <section className="admin-stats" aria-label="Tổng quan đơn hàng">
        <div>
          <span>Chờ xác nhận</span>
          <strong>{pendingCount}</strong>
        </div>
        <div>
          <span>Đang giao</span>
          <strong>{deliveringCount}</strong>
        </div>
        <div>
          <span>Doanh thu hoàn tất</span>
          <strong>{formatCurrency(completedTotal)}</strong>
        </div>
      </section>

      <section className="order-filters" aria-label="Bộ lọc đơn hàng">
        <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Mã đơn, tên khách, SĐT" />
        <select value={filters.orderChannel} onChange={(event) => updateFilter('orderChannel', event.target.value)}>
          <option value="">Tất cả kênh</option>
          <option value="Website">Website</option>
          <option value="Zalo">Zalo</option>
        </select>
        <select value={filters.paymentMethod} onChange={(event) => updateFilter('paymentMethod', event.target.value)}>
          <option value="">Tất cả phương thức</option>
          <option value="Online">Online</option>
          <option value="COD">COD</option>
          <option value="ManualTransfer">Chuyển khoản</option>
        </select>
        <select value={filters.paymentStatus} onChange={(event) => updateFilter('paymentStatus', event.target.value)}>
          <option value="">Tất cả thanh toán</option>
          <option value="Unpaid">Chưa thanh toán</option>
          <option value="Pending">Chờ thanh toán</option>
          <option value="Paid">Đã thanh toán</option>
          <option value="Failed">Thất bại</option>
          <option value="Refunded">Đã hoàn tiền</option>
        </select>
        <select value={filters.orderStatus} onChange={(event) => updateFilter('orderStatus', event.target.value)}>
          <option value="">Tất cả trạng thái đơn</option>
          <option value="PendingConfirmation">Chờ xác nhận</option>
          <option value="Confirmed">Đã xác nhận</option>
          <option value="Preparing">Đang chuẩn bị</option>
          <option value="Delivering">Đang giao</option>
          <option value="Completed">Hoàn tất</option>
          <option value="Cancelled">Đã huỷ</option>
        </select>
        <input type="date" value={filters.createdFrom} onChange={(event) => updateFilter('createdFrom', event.target.value)} />
        <input type="date" value={filters.createdTo} onChange={(event) => updateFilter('createdTo', event.target.value)} />
        <button type="button" className="refresh-button" onClick={() => loadOrders()}>Lọc</button>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      <section className="orders-panel" aria-label="Danh sách đơn hàng">
        {isLoading ? (
          <div className="loading-state">Đang tải đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="empty-admin-state">Chưa có đơn hàng nào.</div>
        ) : (
          orders.map((order) => {
            const orderStatus = order.orderStatus ?? order.status
            const isBusy = updatingOrderId === order.id
            const canConfirm = orderStatus === 'PendingConfirmation'
            const canPrepare = orderStatus === 'Confirmed'
            const canDeliver = orderStatus === 'Preparing'
            const canCompleteCod = orderStatus === 'Delivering' && order.paymentMethod === 'COD'
            const canComplete = orderStatus === 'Delivering' && order.paymentMethod !== 'COD' && order.paymentStatus === 'Paid'
            const canConfirmManualPayment = order.paymentMethod === 'ManualTransfer' && order.paymentStatus !== 'Paid' && orderStatus !== 'Cancelled' && orderStatus !== 'Completed'
            const canCancel = orderStatus !== 'Completed' && order.paymentStatus !== 'Paid'

            return (
              <article className="order-card" key={order.id}>
                <div className="order-main">
                  <div>
                    <div className="order-title">
                      <strong>#{order.orderCode || order.id.slice(0, 8)}</strong>
                      <span className={`status-pill ${orderStatus.toLowerCase()}`}>
                        Đơn: {orderStatusLabel(orderStatus)}
                      </span>
                      <span className={`status-pill payment-${order.paymentStatus.toLowerCase()}`}>
                        TT: {paymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                    <p>{formatDateTime(order.createdAt)}</p>
                    <p className="order-channel-line">
                      {channelLabel(order.orderChannel)} — {paymentMethodLabel(order.paymentMethod)} — {paymentStatusLabel(order.paymentStatus)}
                    </p>
                  </div>
                  <strong>{formatCurrency(order.totalPrice)}</strong>
                </div>

                <div className="order-detail-grid">
                  <div>
                    <span>Giao hàng</span>
                    <p>{order.receiverName || order.customerInfo.name || 'Chưa nhập tên'}</p>
                    <p>{order.receiverPhone || order.customerInfo.phone || 'Chưa nhập SĐT'}</p>
                    <p>{order.deliveryAddress || order.customerInfo.address || 'Chưa nhập địa chỉ'}</p>
                    {order.addressNote || order.customerInfo.note ? <p>{order.addressNote || order.customerInfo.note}</p> : null}
                    {order.latitude && order.longitude ? <p>{order.latitude}, {order.longitude}</p> : null}
                  </div>
                  <div>
                    <span>Món</span>
                    <ul>
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.productId}-${item.productName}`}>
                          <span>{item.productName} x{item.quantity}</span>
                          <strong>{formatCurrency(item.unitPrice * item.quantity)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="order-actions">
                  {canConfirm ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => confirmOrder(apiBaseUrl, order.id), 'Chưa xác nhận được đơn.')}>Xác nhận đơn</button> : null}
                  {canPrepare ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => markOrderPreparing(apiBaseUrl, order.id), 'Chưa chuyển sang chuẩn bị được.')}>Chuẩn bị</button> : null}
                  {canDeliver ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => markOrderDelivering(apiBaseUrl, order.id), 'Chưa chuyển sang giao hàng được.')}>Giao hàng</button> : null}
                  {canConfirmManualPayment ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => confirmManualPayment(apiBaseUrl, order.id), 'Chưa xác nhận nhận tiền được.')}>Xác nhận đã nhận tiền</button> : null}
                  {canCompleteCod ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => completeCodOrder(apiBaseUrl, order.id), 'Chưa hoàn tất COD được.')}>Giao thành công và đã thu tiền</button> : null}
                  {canComplete ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => completeOrder(apiBaseUrl, order.id), 'Chưa hoàn tất được đơn.')}>Hoàn tất</button> : null}
                  {canCancel ? <button type="button" disabled={isBusy} onClick={() => runAction(order.id, () => cancelOrder(apiBaseUrl, order.id), 'Chưa huỷ được đơn.')}>Huỷ đơn</button> : null}
                </div>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
