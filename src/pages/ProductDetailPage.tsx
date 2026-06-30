import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'
import { getProductImage, getProductImages, getProductStock, isProductInStock } from '../utils/productImages'
import { fetchProduct } from '../utils/products'

type ProductDetailPageProps = {
  apiBaseUrl: string
  quantityByProductId: Map<string, number>
  onAdd: (product: Product) => void
  onBuyNow: (product: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}

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
        setNotice('Không tìm thấy mã sản phẩm.')
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
          setNotice('Không tải được chi tiết món. Món có thể đã ngừng bán.')
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
        <div className="loading-state">Đang tải chi tiết món...</div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="shop-shell single-column">
        {notice ? <p className="api-notice">{notice}</p> : null}
        <Link className="hero-action" to="/menu">Quay lại menu</Link>
      </main>
    )
  }

  const stock = getProductStock(product)
  const isAvailable = isProductInStock(product)
  const images = getProductImages(product)
  const quantity = quantityByProductId.get(product.id) ?? 0
  const canIncrement = isAvailable && quantity < stock

  return (
    <main className="shop-shell single-column">
      <article className="product-detail-card">
        <div className="product-detail-media">
          <img src={getProductImage(product)} alt={product.name} />
          {images.length > 1 ? (
            <div className="product-detail-thumbs" aria-label="Ảnh sản phẩm">
              {images.map((imageUrl) => (
                <img key={imageUrl} src={imageUrl} alt="" />
              ))}
            </div>
          ) : null}
        </div>
        <div className="product-detail-body">
          <Link className="detail-link" to="/menu">← Quay lại menu</Link>
          <span>{product.category || 'Khác'}</span>
          <h1>{product.name}</h1>
          {product.description ? <p>{product.description}</p> : null}
          <em className={isAvailable ? 'stock-badge' : 'stock-badge out'}>
            {isAvailable ? `Còn ${stock}` : 'Hết hàng'}
          </em>
          <strong>{formatCurrency(product.price)}</strong>
          <div className="product-detail-actions">
            {quantity > 0 ? (
              <div className="quantity-stepper" aria-label={`Số lượng ${product.name}`}>
                <button type="button" onClick={() => onDecrement(product.id)}>-</button>
                <span>{quantity}</span>
                <button type="button" disabled={!canIncrement} onClick={() => onIncrement(product.id)}>+</button>
              </div>
            ) : (
              <button
                type="button"
                className="add-button"
                disabled={!isAvailable}
                onClick={() => onAdd(product)}
              >
                Thêm vào giỏ
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
