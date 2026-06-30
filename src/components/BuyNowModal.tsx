import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { CustomerInfo, PaymentMethod, Product } from '../types'
import { formatCurrency } from '../utils/format'
import { saveDirectOrder } from '../utils/orders'
import { getProductImage, getProductStock, isProductInStock } from '../utils/productImages'
import { createPayment } from '../utils/payment'
import { createOrderMessage, createZaloLink } from '../utils/zalo'
import { DeliveryAddressFields } from './DeliveryAddressFields'

type BuyNowModalProps = {
  product: Product
  apiBaseUrl: string
  zaloPhone: string
  onClose: () => void
}

type BuyNowPaymentChoice = 'Online' | 'ZaloCOD' | 'ZaloManualTransfer'

export function BuyNowModal({ product, apiBaseUrl, zaloPhone, onClose }: BuyNowModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    note: '',
    addressReferenceId: '',
  })
  const [paymentChoice, setPaymentChoice] = useState<BuyNowPaymentChoice>('ZaloCOD')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const stock = getProductStock(product)
  const isAvailable = isProductInStock(product)
  const total = product.price * quantity
  const directItems = useMemo(() => [{ product, quantity }], [product, quantity])

  const validateCustomer = () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      toast.error('Vui lòng nhập tên, số điện thoại và địa chỉ giao hàng')
      setMessage('Vui lòng nhập tên, số điện thoại và địa chỉ giao hàng.')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (isSubmitting || !isAvailable || quantity > stock) {
      toast.error('Số lượng vượt quá tồn kho')
      setMessage('Số lượng mua ngay vượt quá tồn kho hiện tại.')
      return
    }

    if (!validateCustomer()) {
      return
    }

    setIsSubmitting(true)
    setMessage('Đang tạo đơn mua ngay...')

    try {
      if (paymentChoice === 'Online') {
        const order = await saveDirectOrder(apiBaseUrl, product, quantity, customer, 'Website', 'Online')
        const payment = await createPayment(apiBaseUrl, order.id)
        sessionStorage.setItem('sepayPayment', JSON.stringify(payment))
        toast.success('Đã tạo mã thanh toán SePay')
        window.location.href = '/payment-result'
        return
      }

      const paymentMethod: Extract<PaymentMethod, 'COD' | 'ManualTransfer'> =
        paymentChoice === 'ZaloCOD' ? 'COD' : 'ManualTransfer'
      const order = await saveDirectOrder(apiBaseUrl, product, quantity, customer, 'Zalo', paymentMethod)
      const zaloUrl = createZaloLink(zaloPhone, createOrderMessage(directItems, customer, total, order))
      toast.success('Đã tạo đơn Zalo')
      setMessage(`Đã tạo đơn #${order.orderCode}. Đang mở Zalo...`)
      window.open(zaloUrl, '_blank', 'noopener,noreferrer')
      onClose()
    } catch {
      toast.error('Chưa tạo được đơn mua ngay')
      setMessage('Chưa tạo được đơn mua ngay. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Mua ngay">
      <section className="buy-now-modal">
        <div className="buy-now-header">
          <div>
            <span>Mua ngay</span>
            <h2>{product.name}</h2>
          </div>
          <button type="button" className="text-button" onClick={onClose} disabled={isSubmitting}>
            Đóng
          </button>
        </div>

        <div className="buy-now-product">
          <img src={getProductImage(product)} alt={product.name} />
          <div>
            <strong>{product.name}</strong>
            <span>{formatCurrency(product.price)}</span>
            <em className={isAvailable ? 'stock-badge' : 'stock-badge out'}>
              {isAvailable ? `Còn ${stock}` : 'Hết hàng'}
            </em>
            <div className="quantity-stepper" aria-label={`Số lượng ${product.name}`}>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
              <span>{quantity}</span>
              <button type="button" disabled={!isAvailable || quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))}>+</button>
            </div>
          </div>
        </div>

        <DeliveryAddressFields apiBaseUrl={apiBaseUrl} customer={customer} onChange={setCustomer} />

        <div className="customer-form buy-now-form">
          <label>
            Phương thức thanh toán
            <select value={paymentChoice} onChange={(event) => setPaymentChoice(event.target.value as BuyNowPaymentChoice)}>
              <option value="ZaloCOD">Đặt qua Zalo - COD</option>
              <option value="ZaloManualTransfer">Đặt qua Zalo - chuyển khoản thủ công</option>
              <option value="Online">Thanh toán SePay online</option>
            </select>
          </label>
        </div>

        <div className="cart-total">
          <span>Tổng tiền</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <button type="button" className="online-payment-button" disabled={isSubmitting || !isAvailable || quantity > stock} onClick={handleSubmit}>
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </button>
        {message ? <p className="checkout-message">{message}</p> : null}
      </section>
    </div>
  )
}
