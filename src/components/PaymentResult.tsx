import { formatCurrency } from '../utils/format'
import type { CreatePaymentResponse } from '../utils/payment'

type PaymentResultProps = {
  onBackToShop: () => void
}

export function PaymentResult({ onBackToShop }: PaymentResultProps) {
  const storedPayment = sessionStorage.getItem('sepayPayment')
  const payment = storedPayment
    ? (JSON.parse(storedPayment) as CreatePaymentResponse)
    : null

  if (!payment) {
    return (
      <main className="payment-result-shell">
        <section className="payment-result failed">
          <span>Chưa có thông tin thanh toán</span>
          <h1>Vui lòng tạo đơn hàng mới</h1>
          <button type="button" onClick={onBackToShop}>
            Về cửa hàng
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="payment-result-shell">
      <section className="payment-result success">
        <span>Thanh toán SePay</span>
        <h1>Quét QR hoặc chuyển khoản đúng nội dung</h1>
        <img className="payment-qr" src={payment.qrImageUrl} alt="Mã QR thanh toán SePay" />
        <div className="payment-result-details">
          <p>
            Ngân hàng: <strong>{payment.bankCode}</strong>
          </p>
          <p>
            Số tài khoản: <strong>{payment.accountNumber}</strong>
          </p>
          <p>
            Chủ tài khoản: <strong>{payment.accountName}</strong>
          </p>
          <p>
            Số tiền: <strong>{formatCurrency(payment.amount)}</strong>
          </p>
          <p>
            Nội dung: <strong>{payment.transferContent}</strong>
          </p>
          <p>
            Mã đơn: <strong>{payment.orderId.slice(0, 8)}</strong>
          </p>
        </div>
        <button type="button" onClick={onBackToShop}>
          Về cửa hàng
        </button>
      </section>
    </main>
  )
}
