import { Cart } from '../components/Cart'
import type { CartItem, CustomerInfo } from '../types'

type CartPageProps = {
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

export function CartPage(props: CartPageProps) {
  return (
    <main className="cart-page-shell">
      <Cart {...props} />
    </main>
  )
}
