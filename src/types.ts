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
  categoryId: string
  category?: string | null
  isAvailable?: boolean
}

export type CartItem = {
  product: Product
  quantity: number
}

export type CustomerInfo = {
  name: string
  phone: string
  address: string
  note: string
}

export type SavedOrder = {
  id: string
  customerInfo: CustomerInfo
  items: SavedOrderItem[]
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
}

export type SavedOrderItem = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}
