import { useState } from 'react'
import toast from 'react-hot-toast'
import type { CartItem, CustomerInfo, PaymentMethod } from '../types'
import { formatCurrency } from '../utils/format'
import { saveOrder } from '../utils/orders'
import { createPayment } from '../utils/payment'
import { getProductStock } from '../utils/productImages'
import { createOrderMessage, createZaloLink } from '../utils/zalo'
import { DeliveryAddressFields } from './DeliveryAddressFields'

type CartProps = {
  items: CartItem[]
  customer: CustomerInfo
  apiBaseUrl: string
  zaloPhone: string
  onCustomerChange: (customer: CustomerInfo) => void
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
  const [isZaloModalOpen, setIsZaloModalOpen] = useState(false)
  const [zaloPaymentMethod, setZaloPaymentMethod] = useState<Extract<PaymentMethod, 'COD' | 'ManualTransfer'>>('COD')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const hasInvalidStockItem = items.some((item) => item.quantity > getProductStock(item.product))

  const validateCustomer = () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      toast.error('Vui lòng nhập tên, số điện thoại và địa chỉ giao hàng')
      setCheckoutMessage('Vui lòng nhập tên, số điện thoại và địa chỉ giao hàng.')
      return false
    }

    return true
  }

  const handleOpenZaloModal = () => {
    if (items.length === 0 || isSubmitting || hasInvalidStockItem || !validateCustomer()) {
      if (hasInvalidStockItem) {
        toast.error('Có món vượt quá tồn kho')
        setCheckoutMessage('Có món trong giỏ vượt quá tồn kho hiện tại. Vui lòng giảm số lượng.')
      }
      return
    }

    setIsZaloModalOpen(true)
  }

  const handleZaloOrder = async () => {
    if (items.length === 0 || isSubmitting || hasInvalidStockItem || !validateCustomer()) {
      if (hasInvalidStockItem) {
        toast.error('Có món vượt quá tồn kho')
        setCheckoutMessage('Có món trong giỏ vượt quá tồn kho hiện tại. Vui lòng giảm số lượng.')
      }
      return
    }

    setIsSubmitting(true)
    setCheckoutMessage('Đang tạo đơn Zalo...')

    try {
      const order = await saveOrder(apiBaseUrl, items, customer, 'Zalo', zaloPaymentMethod)
      const message = createOrderMessage(items, customer, total, order)
      const zaloUrl = createZaloLink(zaloPhone, message)
      toast.success('Đã tạo đơn Zalo')
      setCheckoutMessage(`Đã tạo đơn #${order.orderCode}. Đang mở Zalo...`)
      window.open(zaloUrl, '_blank', 'noopener,noreferrer')
      setIsZaloModalOpen(false)
    } catch {
      toast.error('Chưa tạo được đơn Zalo')
      setCheckoutMessage('Chưa lưu được đơn vào API. Vui lòng thử lại trước khi mở Zalo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOnlinePayment = async () => {
    if (items.length === 0 || isSubmitting || hasInvalidStockItem || !validateCustomer()) {
      if (hasInvalidStockItem) {
        toast.error('Có món vượt quá tồn kho')
        setCheckoutMessage('Có món trong giỏ vượt quá tồn kho hiện tại. Vui lòng giảm số lượng.')
      }
      return
    }

    setIsSubmitting(true)
    setCheckoutMessage('Đang tạo mã thanh toán SePay...')

    try {
      const order = await saveOrder(apiBaseUrl, items, customer, 'Website', 'Online')
      const payment = await createPayment(apiBaseUrl, order.id)

      sessionStorage.setItem('sepayPayment', JSON.stringify(payment))
      toast.success('Đã tạo mã thanh toán SePay')
      setCheckoutMessage(`Đã tạo đơn #${order.orderCode}. Đang mở QR thanh toán...`)
      window.location.href = '/payment-result'
    } catch {
      toast.error('Chưa tạo được thanh toán SePay')
      setCheckoutMessage('Chưa tạo được thanh toán SePay. Kiểm tra cấu hình SePay ở backend.')
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
          <p className="empty-cart">Chọn món bên trái để tạo đơn.</p>
        ) : (
          items.map((item) => (
            <div className="cart-row" key={item.product.id}>
              <div>
                <strong>{item.product.name}</strong>
                <span>{formatCurrency(item.product.price * item.quantity)}</span>
                <small>Còn {getProductStock(item.product)} món</small>
              </div>
              <div className="cart-actions">
                <button type="button" onClick={() => onDecrement(item.product.id)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button type="button" disabled={item.quantity >= getProductStock(item.product)} onClick={() => onIncrement(item.product.id)}>
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

      <DeliveryAddressFields apiBaseUrl={apiBaseUrl} customer={customer} onChange={onCustomerChange} />

      <div className="cart-total">
        <span>Tổng tạm tính</span>
        <strong>{formatCurrency(total)}</strong>
      </div>

      <button
        type="button"
        className="zalo-button"
        disabled={items.length === 0 || isSubmitting || hasInvalidStockItem}
        onClick={handleOpenZaloModal}
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng qua Zalo'}
      </button>
      <button
        type="button"
        className="online-payment-button"
        disabled={items.length === 0 || isSubmitting || hasInvalidStockItem}
        onClick={handleOnlinePayment}
      >
        {isSubmitting ? 'Đang xử lý...' : 'Thanh toán SePay'}
      </button>
      {checkoutMessage ? (
        <p className="checkout-message">{checkoutMessage}</p>
      ) : null}
      <p className="zalo-phone">Zalo nhận đơn: {zaloPhone}</p>

      {isZaloModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Xác nhận đơn Zalo">
          <section className="zalo-order-modal">
            <div className="buy-now-header">
              <div>
                <span>Đặt qua Zalo</span>
                <h2>Xác nhận thông tin đơn</h2>
              </div>
              <button type="button" className="text-button" onClick={() => setIsZaloModalOpen(false)} disabled={isSubmitting}>
                Đóng
              </button>
            </div>
            <div className="zalo-order-summary">
              {items.map((item) => (
                <div key={`zalo-${item.product.id}`}>
                  <span>{item.product.name} x{item.quantity}</span>
                  <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                </div>
              ))}
              <div>
                <span>Tổng tiền</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
            <div className="customer-form">
              <label>
                Phương thức thanh toán
                <select
                  value={zaloPaymentMethod}
                  onChange={(event) => setZaloPaymentMethod(event.target.value as Extract<PaymentMethod, 'COD' | 'ManualTransfer'>)}
                >
                  <option value="COD">COD - thu tiền khi giao</option>
                  <option value="ManualTransfer">Chuyển khoản thủ công</option>
                </select>
              </label>
              <p className="checkout-message">
                Đơn sẽ được lưu vào hệ thống trước, sau đó Zalo mở với mã đơn đã điền sẵn.
              </p>
            </div>
            <div className="modal-actions">
              <button type="button" className="text-button" onClick={() => setIsZaloModalOpen(false)} disabled={isSubmitting}>Hủy</button>
              <button type="button" className="online-payment-button modal-primary-action" onClick={handleZaloOrder} disabled={isSubmitting || hasInvalidStockItem}>
                {isSubmitting ? 'Đang tạo đơn...' : 'Tạo đơn và mở Zalo'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  )
}
