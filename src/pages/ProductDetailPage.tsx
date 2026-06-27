import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'
import { fetchProduct } from '../utils/products'

type ProductDetailPageProps = {
  apiBaseUrl: string
  quantityByProductId: Map<string, number>
  onAdd: (product: Product) => void
  onBuyNow: (product: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}

const fallbackImage =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'

export function ProductDetailPage({
  apiBaseUrl,
  quantityByProductId,
  onAdd,
  onBuyNow,
  onIncrement,
  onDecrement,
}: ProductDetailPageProps) {
  const { productId } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProduct = async () => {
      if (!productId) {
        setNotice('Khong tim thay ma san pham.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setNotice('')

      try {
        const nextProduct = await fetchProduct(apiBaseUrl, productId)

        if (isMounted) {
          setProduct(nextProduct)
        }
      } catch {
        if (isMounted) {
          setNotice('Khong tai duoc chi tiet mon. Mon co the da ngung ban.')
          setProduct(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl, productId])

  if (isLoading) {
    return (
      <main className="shop-shell single-column">
        <div className="loading-state">Dang tai chi tiet mon...</div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="shop-shell single-column">
        {notice ? <p className="api-notice">{notice}</p> : null}
        <Link className="hero-action" to="/menu">Quay lai menu</Link>
      </main>
    )
  }

  const isAvailable = product.isAvailable ?? true
  const quantity = quantityByProductId.get(product.id) ?? 0

  return (
    <main className="shop-shell single-column">
      <article className="product-detail-card">
        <img src={product.imageUrl || fallbackImage} alt={product.name} />
        <div className="product-detail-body">
          <Link className="detail-link" to="/menu">← Quay lai menu</Link>
          <span>{product.category || 'Khac'}</span>
          <h1>{product.name}</h1>
          {product.description ? <p>{product.description}</p> : null}
          <strong>{formatCurrency(product.price)}</strong>
          <div className="product-detail-actions">
            {quantity > 0 ? (
              <div className="quantity-stepper" aria-label={`So luong ${product.name}`}>
                <button type="button" onClick={() => onDecrement(product.id)}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => onIncrement(product.id)}>+</button>
              </div>
            ) : (
              <button
                type="button"
                className="add-button"
                disabled={!isAvailable}
                onClick={() => onAdd(product)}
              >
                Them vao gio
              </button>
            )}
            <button
              type="button"
              className="buy-now-button"
              disabled={!isAvailable}
              onClick={() => onBuyNow(product)}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </article>
    </main>
  )
}
