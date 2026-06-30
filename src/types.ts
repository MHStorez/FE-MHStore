export type Category = {
  id: string
  name: string
  slug: string
  status: string
}

export type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  imageUrls?: string[]
  stock?: number
  categoryId: string
  category?: string | null
  isAvailable?: boolean
}

export type CartItem = {
  product: Product
  quantity: number
}

export type OrderStatus =
  | 'PendingConfirmation'
  | 'Confirmed'
  | 'Preparing'
  | 'Delivering'
  | 'Completed'
  | 'Cancelled'

export type PaymentStatus = 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Refunded'
export type OrderChannel = 'Website' | 'Zalo'
export type PaymentMethod = 'Online' | 'COD' | 'ManualTransfer'

export type CustomerInfo = {
  name: string
  phone: string
  address: string
  latitude?: number | null
  longitude?: number | null
  note: string
  addressReferenceId?: string
}

export type SavedOrder = {
  id: string
  orderCode: string
  customerInfo: CustomerInfo
  items: SavedOrderItem[]
  totalPrice: number
  status: OrderStatus
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  orderChannel: OrderChannel
  paymentMethod: PaymentMethod
  receiverName: string
  receiverPhone: string
  deliveryAddress: string
  latitude?: number | null
  longitude?: number | null
  addressNote: string
  addressReferenceId?: string
  createdAt: string
}

export type SavedOrderItem = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}
