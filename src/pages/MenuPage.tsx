import { ProductCard } from '../components/ProductCard'
import type { Category, Product } from '../types'

type MenuPageProps = {
  isLoading: boolean
  apiNotice: string
  categories: Category[]
  selectedCategoryId: string
  searchQuery: string
  visibleProducts: Product[]
  quantityByProductId: Map<string, number>
  onCategoryChange: (categoryId: string) => void
  onSearchChange: (value: string) => void
  onAdd: (product: Product) => void
  onBuyNow: (product: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}

export function MenuPage({
  isLoading,
  apiNotice,
  categories,
  selectedCategoryId,
  searchQuery,
  visibleProducts,
  quantityByProductId,
  onCategoryChange,
  onSearchChange,
  onAdd,
  onBuyNow,
  onIncrement,
  onDecrement,
}: MenuPageProps) {
  return (
    <main className="shop-shell single-column">
      <section className="menu-section" aria-labelledby="menu-title">
        <div className="section-heading">
          <span>Thực đơn hôm nay</span>
          <h1 id="menu-title">Chọn món cho giỏ hàng của bạn</h1>
          <p>Giá tạm tính được cập nhật theo sản phẩm trong hệ thống.</p>
        </div>

        {apiNotice ? <p className="api-notice">{apiNotice}</p> : null}

        <div className="menu-toolbar">
          <label>
            Tìm món
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nhập tên món..."
            />
          </label>
        </div>

        <div className="category-tabs" role="tablist" aria-label="Lọc danh mục">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === ''}
            className={selectedCategoryId === '' ? 'active' : ''}
            onClick={() => onCategoryChange('')}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              role="tab"
              aria-selected={selectedCategoryId === category.id}
              className={selectedCategoryId === category.id ? 'active' : ''}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-state">Đang tải sản phẩm...</div>
        ) : (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantityByProductId.get(product.id) ?? 0}
                onAdd={onAdd}
                onBuyNow={onBuyNow}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
              />
            ))}
            {visibleProducts.length === 0 ? (
              <div className="empty-admin-state">Không tìm thấy món phù hợp.</div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}
