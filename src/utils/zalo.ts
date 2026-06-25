import type { CartItem, CustomerInfo } from '../types'
import { formatCurrency } from './format'

export const createZaloLink = (phone: string, message: string) => {
  const normalizedPhone = phone.replace(/[^\d]/g, '')

  return `https://zalo.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

export const createOrderMessage = (
  items: CartItem[],
  customer: CustomerInfo,
  total: number,
  orderId?: string,
) => {
  const orderLines = items.map(
    (item) =>
      `- ${item.product.name} x${item.quantity}: ${formatCurrency(
        item.product.price * item.quantity,
      )}`,
  )

  const customerLines = [
    customer.name.trim() ? `Tên: ${customer.name.trim()}` : null,
    customer.phone.trim() ? `SĐT: ${customer.phone.trim()}` : null,
    customer.address.trim() ? `Địa chỉ: ${customer.address.trim()}` : null,
    customer.note.trim() ? `Ghi chú: ${customer.note.trim()}` : null,
  ].filter(Boolean)

  const message = [
    '🛒 ĐƠN HÀNG MỚI TỪ MHSTORE',
    orderId ? `Mã đơn: #${orderId.slice(0, 8).toUpperCase()}` : null,
    '-------------------------',
    ...orderLines,
    '-------------------------',
    `💰 Tổng tạm tính: ${formatCurrency(total)}`,
    '',
    customerLines.length > 0 ? '📍 Thông tin khách hàng:' : null,
    ...customerLines,
    '',
    '💳 Hình thức thanh toán mong muốn:',
    '( ) Chuyển khoản (Gửi kèm bill)',
    '( ) Tiền mặt khi nhận hàng (COD)',
    '',
    'Cảm ơn shop!',
  ]
    .filter((line) => line !== null)
    .join('\n')

  return message
}
