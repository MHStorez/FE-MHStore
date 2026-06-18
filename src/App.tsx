import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AdminOrders } from './components/AdminOrders'
import { PaymentResult } from './components/PaymentResult'
import { AdminLayout } from './layouts/AdminLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminProducts } from './pages/AdminProducts'
import { CartPage } from './pages/CartPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import type { CartItem, CustomerInfo, Product } from './types'

const rawApiBaseUrl = import.meta.env.VITE_API_URL ?? ''
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '')
const zaloPhone = import.meta.env.VITE_ZALO_PHONE ?? '0900000000'

const fallbackProducts: Product[] = [
  {
    id: 'sample-cha-ram',
    name: 'Cha ram tom dat',
    description: 'Goi dong lanh, chien nhanh la gion.',
    price: 120000,
    imageUrl:
      'https://images.unsplash.com/photo-1604908177522-0403f218842b?auto=format&fit=crop&w=900&q=80',
    category: 'Mon chinh',
    isAvailable: true,
  },
  {
    id: 'sample-nem-chua',
    name: 'Nem chua ran',
    description: 'Hop tien loi cho bua an vat tai nha.',
    price: 65000,
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    category: 'An vat',
    isAvailable: true,
  },
  {
    id: 'sample-ca-vien',
    name: 'Ca vien chien',
    description: 'Dong goi san, phu hop chien hoac tha lau.',
    price: 45000,
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    category: 'An vat',
    isAvailable: true,
  },
]

function App() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts)
  const [selectedCategory, setSelectedCategory] = useState('Tat ca')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    note: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [apiNotice, setApiNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/products`)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const apiProducts = (await response.json()) as Product[]

        if (!isMounted) {
          return
        }

        if (apiProducts.length === 0) {
          setProducts(fallbackProducts)
          setApiNotice('API chua co san pham, dang hien thi du lieu mau.')
          return
        }

        setProducts(apiProducts)
        setApiNotice('')
      } catch {
        if (isMounted) {
          setProducts(fallbackProducts)
          setApiNotice('Chua ket noi duoc API, dang hien thi du lieu mau.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(
    () => [
      'Tat ca',
      ...Array.from(new Set(products.map((product) => product.category || 'Khac'))),
    ],
    [products],
  )

  const visibleProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Tat ca' ||
        (product.category || 'Khac') === selectedCategory
      const matchesSearch =
        keyword.length === 0 ||
        product.name.toLowerCase().includes(keyword) ||
        (product.description?.toLowerCase().includes(keyword) ?? false)

      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  const quantityByProductId = useMemo(() => {
    return new Map(cartItems.map((item) => [item.product.id, item.quantity]))
  }, [cartItems])

  const addToCart = (product: Product) => {
    toast.success(`Da them ${product.name} vao gio`)
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, { product, quantity: 1 }]
    })
  }

  const incrementCartItem = (productId: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    )
  }

  const decrementCartItem = (productId: string) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = (productId: string) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    )
  }

  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [field]: value,
    }))
  }

  return (
    <Routes>
      <Route element={<PublicLayout cartCount={cartItems.length} zaloPhone={zaloPhone} />}>
        <Route index element={<HomePage />} />
        <Route
          path="menu"
          element={
            <MenuPage
              isLoading={isLoading}
              apiNotice={apiNotice}
              categories={categories}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              visibleProducts={visibleProducts}
              quantityByProductId={quantityByProductId}
              onCategoryChange={setSelectedCategory}
              onSearchChange={setSearchQuery}
              onAdd={addToCart}
              onIncrement={incrementCartItem}
              onDecrement={decrementCartItem}
            />
          }
        />
        <Route
          path="cart"
          element={
            <CartPage
              items={cartItems}
              customer={customer}
              apiBaseUrl={apiBaseUrl}
              zaloPhone={zaloPhone}
              onCustomerChange={updateCustomer}
              onIncrement={incrementCartItem}
              onDecrement={decrementCartItem}
              onRemove={removeCartItem}
              onClear={() => setCartItems([])}
            />
          }
        />
        <Route
          path="order-success"
          element={<PaymentResult onBackToShop={() => window.location.assign('/')} />}
        />
        <Route
          path="payment-result"
          element={<PaymentResult onBackToShop={() => window.location.assign('/')} />}
        />
        <Route path="login" element={<LoginPage apiBaseUrl={apiBaseUrl} />} />
        <Route path="register" element={<RegisterPage apiBaseUrl={apiBaseUrl} />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboard apiBaseUrl={apiBaseUrl} />} />
          <Route path="admin/products" element={<AdminProducts apiBaseUrl={apiBaseUrl} />} />
          <Route path="admin/orders" element={<AdminOrders apiBaseUrl={apiBaseUrl} />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
