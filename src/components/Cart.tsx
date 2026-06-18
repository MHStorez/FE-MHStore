import { useState } from 'react'
import toast from 'react-hot-toast'
import type { CartItem, CustomerInfo } from '../types'
import { formatCurrency } from '../utils/format'
import { saveOrder } from '../utils/orders'
import { createPayment } from '../utils/payment'
import { createOrderMessage, createZaloLink } from '../utils/zalo'

type CartProps = {
  items: CartItem[]
  customer: CustomerInfo
  apiBaseUrl: string
  zaloPhone: string
  onCustomerChange: (field: keyof CustomerInfo, value: string) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
  onRemove: (productId: string) => void
  onClear: () => void
}

export function Cart({
  items,
  customer,
  apiBaseUrl,
  zaloPhone,
  onCustomerChange,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}: CartProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const hasRequiredCustomerInfo = () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      setCheckoutMessage('Nhập tên và số điện thoại để shop tổng kết khách mua hàng.')
      toast.error('Nhập tên và số điện thoại')
      return false
    }

    return true
  }

  const handleOrder = async () => {
    if (items.length === 0 || isSubmitting || !hasRequiredCustomerInfo()) {
      return
    }

    let message = createOrderMessage(items, customer, total)
    const zaloWindow = window.open('', '_blank')

    setIsSubmitting(true)
    setCheckoutMessage('Đang lưu đơn hàng...')

    try {
      const order = await saveOrder(apiBaseUrl, items, customer)
      message = createOrderMessage(items, customer, total, order.id)
      toast.success('Đã lưu đơn hàng')
      setCheckoutMessage(`Đã lưu đơn #${order.id.slice(0, 8).toUpperCase()}. Đang mở Zalo...`)
    } catch {
      toast.error('Chưa lưu được đơn hàng')
      setCheckoutMessage('Chưa lưu được đơn vào API. Vẫn mở Zalo để gửi đơn.')
    } finally {
      const zaloUrl = createZaloLink(zaloPhone, message)

      if (zaloWindow) {
        zaloWindow.opener = null
        zaloWindow.location.href = zaloUrl
      } else {
        window.open(zaloUrl, '_blank', 'noopener,noreferrer')
      }

      setIsSubmitting(false)
    }
  }

  const handleOnlinePayment = async () => {
    if (items.length === 0 || isSubmitting || !hasRequiredCustomerInfo()) {
      return
    }

    setIsSubmitting(true)
    setCheckoutMessage('Dang tao ma thanh toan SePay...')

    try {
      const order = await saveOrder(apiBaseUrl, items, customer)
      const payment = await createPayment(apiBaseUrl, order.id)

      sessionStorage.setItem('sepayPayment', JSON.stringify(payment))
      toast.success('Da tao ma thanh toan SePay')
      setCheckoutMessage(`Da tao don #${order.id.slice(0, 8)}. Dang mo QR thanh toan...`)
      window.location.href = '/payment-result'
    } catch {
      toast.error('Chua tao duoc thanh toan SePay')
      setCheckoutMessage('Chua tao duoc thanh toan SePay. Kiem tra cau hinh SePay o backend.')
      setIsSubmitting(false)
    }
  }

  return (
    <aside className="cart-panel" aria-label="Giỏ hàng">
      <div className="cart-header">
        <div>
          <span>Giỏ hàng</span>
          <h2>{itemCount} món đã chọn</h2>
        </div>
        {items.length > 0 ? (
          <button type="button" className="text-button" onClick={onClear}>
            Xóa hết
          </button>
        ) : null}
      </div>

      <div className="cart-list">
        {items.length === 0 ? (
          <p className="empty-cart">Chọn món bên trái để tạo đơn Zalo.</p>
        ) : (
          items.map((item) => (
            <div className="cart-row" key={item.product.id}>
              <div>
                <strong>{item.product.name}</strong>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
              <div className="cart-actions">
                <button type="button" onClick={() => onDecrement(item.product.id)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => onIncrement(item.product.id)}>
                  +
                </button>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => onRemove(item.product.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="customer-form">
        <label>
          Tên khách
          <input
            value={customer.name}
            onChange={(event) => onCustomerChange('name', event.target.value)}
            placeholder="Ví dụ: Cô Lan"
            required
          />
        </label>
        <label>
          Số điện thoại
          <input
            value={customer.phone}
            onChange={(event) => onCustomerChange('phone', event.target.value)}
            placeholder="090..."
            required
          />
        </label>
        <label>
          Địa chỉ giao
          <input
            value={customer.address}
            onChange={(event) => onCustomerChange('address', event.target.value)}
            placeholder="Quận / phường / số nhà"
          />
        </label>
        <label>
          Ghi chú
          <textarea
            value={customer.note}
            onChange={(event) => onCustomerChange('note', event.target.value)}
            placeholder="Thời gian giao, số lượng thêm..."
            rows={3}
          />
        </label>
      </div>

      <div className="cart-total">
        <span>Tổng tạm tính</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
      <p className="zalo-flow-note">
        Web sẽ lưu đơn vào admin rồi mở Zalo với nội dung đã soạn sẵn. Khách cần bấm gửi trong Zalo để shop nhận tin.
      </p>

      <button
        type="button"
        className="zalo-button"
        disabled={items.length === 0 || isSubmitting}
        onClick={handleOrder}
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng qua Zalo'}
      </button>
      <button
        type="button"
        className="online-payment-button"
        disabled={items.length === 0 || isSubmitting}
        onClick={handleOnlinePayment}
      >
        {isSubmitting ? 'Dang xu ly...' : 'Thanh toan SePay'}
      </button>
      {checkoutMessage ? (
        <p className="checkout-message">{checkoutMessage}</p>
      ) : null}
      <p className="zalo-phone">Zalo nhận đơn: {zaloPhone}</p>
    </aside>
  )
}
