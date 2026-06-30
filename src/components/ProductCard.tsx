import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'
import { getProductImage, getProductStock, isProductInStock } from '../utils/productImages'

type ProductCardProps = {
  product: Product
  quantity: number
  onAdd: (product: Product) => void
  onBuyNow: (product: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onBuyNow,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const stock = getProductStock(product)
  const isAvailable = isProductInStock(product)
  const canIncrement = isAvailable && quantity < stock

  return (
    <article className="product-card">
      <div className="product-media">
        <img
          src={getProductImage(product)}
          alt={product.name}
          loading="lazy"
        />
        <span className="product-category">{product.category || 'Khác'}</span>
      </div>

      <div className="product-body">
        <div>
          <h3>{product.name}</h3>
          {product.description ? <p>{product.description}</p> : null}
          <span className={isAvailable ? 'stock-badge' : 'stock-badge out'}>
            {isAvailable ? `Còn ${stock}` : 'Hết hàng'}
          </span>
        </div>

        <div className="product-footer">
          <strong>{formatCurrency(product.price)}</strong>
          {quantity > 0 ? (
            <div className="quantity-stepper" aria-label={`Số lượng ${product.name}`}>
              <button type="button" onClick={() => onDecrement(product.id)}>
                -
              </button>
              <span>{quantity}</span>
              <button type="button" disabled={!canIncrement} onClick={() => onIncrement(product.id)}>
                +
              </button>
            </div>
          ) : null}
        </div>
        <div className="product-card-actions">
          <Link className="detail-link" to={`/menu/${product.id}`}>
            Chi tiết
          </Link>
          <button
            type="button"
            className="add-button"
            disabled={!isAvailable}
            onClick={() => onAdd(product)}
          >
            Thêm vào giỏ
          </button>
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
  )
}
