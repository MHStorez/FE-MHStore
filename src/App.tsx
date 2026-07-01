import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AdminOrders } from './components/AdminOrders'
import { BuyNowModal } from './components/BuyNowModal'
import { PaymentResult } from './components/PaymentResult'
import { AdminLayout } from './layouts/AdminLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminCategories } from './pages/AdminCategories'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminProducts } from './pages/AdminProducts'
import { CartPage } from './pages/CartPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import type { CartItem, Category, CustomerInfo, Product } from './types'
import { getProductStock, isProductInStock } from './utils/productImages'
import { fetchCategories, fetchProducts } from './utils/products'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? ''
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '')
const zaloPhone = import.meta.env.VITE_ZALO_PHONE ?? '0334140131'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    note: '',
    addressReferenceId: '',
  })
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiNotice, setApiNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadCategories = async () => {
      try {
        const apiCategories = await fetchCategories(apiBaseUrl)

        if (isMounted) {
          setCategories(apiCategories)
        }
      } catch {
        if (isMounted) {
          setCategories([])
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      setIsLoading(true)
      setApiNotice('')

      try {
        const apiProducts = await fetchProducts(apiBaseUrl, {
          search: searchQuery.trim() || undefined,
          categoryId: selectedCategoryId || undefined,
        })

        if (!isMounted) {
          return
        }

        setProducts(apiProducts)
        setApiNotice(apiProducts.length === 0 ? 'Menu hiện chưa có món phù hợp.' : '')
      } catch {
        if (isMounted) {
          setProducts([])
          setApiNotice('Chưa kết nối được API. Vui lòng kiểm tra backend.')
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
  }, [selectedCategoryId, searchQuery])

  const quantityByProductId = useMemo(() => {
    return new Map(cartItems.map((item) => [item.product.id, item.quantity]))
  }, [cartItems])

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  )

  const addToCart = (product: Product) => {
    if (!isProductInStock(product)) {
      toast.error(`${product.name} đang hết hàng`)
      return
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      )
      const stock = getProductStock(product)

      if (existingItem) {
        if (existingItem.quantity >= stock) {
          toast.error(`${product.name} chỉ còn ${stock} món`)
          return currentItems
        }

        toast.success(`Đã thêm ${product.name} vào giỏ`)
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      toast.success(`Đã thêm ${product.name} vào giỏ`)
      return [...currentItems, { product, quantity: 1 }]
    })
  }

  const buyNow = (product: Product) => {
    if (!isProductInStock(product)) {
      toast.error(`${product.name} đang hết hàng`)
      return
    }

    setBuyNowProduct(product)
  }

  const incrementCartItem = (productId: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.product.id !== productId) {
          return item
        }

        const stock = getProductStock(item.product)
        if (item.quantity >= stock) {
          toast.error(`${item.product.name} chỉ còn ${stock} món`)
          return item
        }

        return { ...item, quantity: item.quantity + 1 }
      }),
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


  return (
    <>
      <Routes>
        <Route element={<PublicLayout cartCount={cartCount} zaloPhone={zaloPhone} />}>
          <Route index element={<HomePage />} />
          <Route
            path="menu"
            element={
              <MenuPage
                isLoading={isLoading}
                apiNotice={apiNotice}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                searchQuery={searchQuery}
                visibleProducts={products}
                quantityByProductId={quantityByProductId}
                onCategoryChange={setSelectedCategoryId}
                onSearchChange={setSearchQuery}
                onAdd={addToCart}
                onBuyNow={buyNow}
                onIncrement={incrementCartItem}
                onDecrement={decrementCartItem}
              />
            }
          />
          <Route
            path="menu/:productId"
            element={
              <ProductDetailPage
                apiBaseUrl={apiBaseUrl}
                quantityByProductId={quantityByProductId}
                onAdd={addToCart}
                onBuyNow={buyNow}
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
                onCustomerChange={setCustomer}
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
            <Route path="admin/categories" element={<AdminCategories apiBaseUrl={apiBaseUrl} />} />
            <Route path="admin/orders" element={<AdminOrders apiBaseUrl={apiBaseUrl} />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {buyNowProduct ? (
        <BuyNowModal
          product={buyNowProduct}
          apiBaseUrl={apiBaseUrl}
          zaloPhone={zaloPhone}
          onClose={() => setBuyNowProduct(null)}
        />
      ) : null}
    </>
  )
}

export default App
