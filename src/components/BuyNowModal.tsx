import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { CustomerInfo, Product } from '../types'
import { formatCurrency } from '../utils/format'
import { saveDirectOrder } from '../utils/orders'
import { createPayment } from '../utils/payment'
import { createOrderMessage, createZaloLink } from '../utils/zalo'

type BuyNowModalProps = {
  product: Product
  apiBaseUrl: string
  zaloPhone: string
  onClose: () => void
}

const fallbackImage =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'

export function BuyNowModal({ product, apiBaseUrl, zaloPhone, onClose }: BuyNowModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    note: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'zalo' | 'sepay'>('zalo')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const total = product.price * quantity
  const directItems = useMemo(() => [{ product, quantity }], [product, quantity])

  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [field]: value,
    }))
  }

  const validateCustomer = () => {
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      toast.error('Vui long nhap ten, so dien thoai va dia chi giao hang')
      setMessage('Vui long nhap ten, so dien thoai va dia chi giao hang.')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (isSubmitting || !validateCustomer()) {
      return
    }

    setIsSubmitting(true)
    setMessage('Dang tao don mua ngay...')

    try {
      const order = await saveDirectOrder(apiBaseUrl, product, quantity, customer)

      if (paymentMethod === 'sepay') {
        const payment = await createPayment(apiBaseUrl, order.id)
        sessionStorage.setItem('sepayPayment', JSON.stringify(payment))
        toast.success('Da tao ma thanh toan SePay')
        window.location.href = '/payment-result'
        return
      }

      const zaloUrl = createZaloLink(zaloPhone, createOrderMessage(directItems, customer, total))
      toast.success('Da tao don mua ngay')
      setMessage(`Da tao don #${order.id.slice(0, 8)}. Dang mo Zalo...`)
      window.open(zaloUrl, '_blank', 'noopener,noreferrer')
      onClose()
    } catch {
      toast.error('Chua tao duoc don mua ngay')
      setMessage('Chua tao duoc don mua ngay. Gio hang hien tai khong bi thay doi.')
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
          <img src={product.imageUrl || fallbackImage} alt={product.name} />
          <div>
            <strong>{product.name}</strong>
            <span>{formatCurrency(product.price)}</span>
            <div className="quantity-stepper" aria-label={`So luong ${product.name}`}>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
            </div>
          </div>
        </div>

        <div className="customer-form buy-now-form">
          <label>
            Tên người nhận
            <input value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} />
          </label>
          <label>
            Số điện thoại
            <input value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} />
          </label>
          <label>
            Địa chỉ nhận hàng
            <input value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} />
          </label>
          <label>
            Ghi chú
            <textarea value={customer.note} onChange={(event) => updateCustomer('note', event.target.value)} rows={3} />
          </label>
          <label>
            Phương thức thanh toán
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as 'zalo' | 'sepay')}>
              <option value="zalo">Đặt qua Zalo</option>
              <option value="sepay">Thanh toán SePay</option>
            </select>
          </label>
        </div>

        <div className="cart-total">
          <span>Tổng tiền</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <button type="button" className="online-payment-button" disabled={isSubmitting} onClick={handleSubmit}>
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </button>
        {message ? <p className="checkout-message">{message}</p> : null}
      </section>
    </div>
  )
}
