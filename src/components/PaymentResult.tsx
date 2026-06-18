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
          <span>Chua co thong tin thanh toan</span>
          <h1>Vui long tao don hang moi</h1>
          <button type="button" onClick={onBackToShop}>
            Ve cua hang
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="payment-result-shell">
      <section className="payment-result success">
        <span>Thanh toan SePay</span>
        <h1>Quet QR hoac chuyen khoan dung noi dung</h1>
        <img className="payment-qr" src={payment.qrImageUrl} alt="Ma QR thanh toan SePay" />
        <div className="payment-result-details">
          <p>
            Ngan hang: <strong>{payment.bankCode}</strong>
          </p>
          <p>
            So tai khoan: <strong>{payment.accountNumber}</strong>
          </p>
          <p>
            Chu tai khoan: <strong>{payment.accountName}</strong>
          </p>
          <p>
            So tien: <strong>{formatCurrency(payment.amount)}</strong>
          </p>
          <p>
            Noi dung: <strong>{payment.transferContent}</strong>
          </p>
          <p>
            Ma don: <strong>{payment.orderId.slice(0, 8)}</strong>
          </p>
        </div>
        <button type="button" onClick={onBackToShop}>
          Ve cua hang
        </button>
      </section>
    </main>
  )
}
