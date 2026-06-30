import type { CartItem, CustomerInfo, SavedOrder } from '../types'
import { formatCurrency } from './format'

export const createZaloLink = (phone: string, message: string) => {
  const normalizedPhone = phone.replace(/[^\d]/g, '')

  return `https://zalo.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

export const createOrderMessage = (
  items: CartItem[],
  customer: CustomerInfo,
  total: number,
  order?: SavedOrder,
) => {
  const firstItem = items[0]
  const productLine = items.length === 1 && firstItem
    ? firstItem.product.name
    : items.map((item) => `${item.product.name} x${item.quantity}`).join(', ')
  const quantityLine = items.length === 1 && firstItem
    ? String(firstItem.quantity)
    : String(items.reduce((sum, item) => sum + item.quantity, 0))

  return [
    `Xin chào MHStore, tôi muốn xác nhận đơn #${order?.orderCode ?? order?.id.slice(0, 8) ?? 'mới'}.`,
    '',
    `Sản phẩm: ${productLine}`,
    `Số lượng: ${quantityLine}`,
    `Tổng tiền: ${formatCurrency(total)}`,
    `Người nhận: ${customer.name.trim()}`,
    `Số điện thoại: ${customer.phone.trim()}`,
    `Địa chỉ: ${customer.address.trim()}`,
    `Ghi chú: ${customer.note.trim() || 'Không có'}`,
  ].join('\n')
}
