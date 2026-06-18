import { ProductCard } from '../components/ProductCard'
import type { Product } from '../types'

type MenuPageProps = {
  isLoading: boolean
  apiNotice: string
  categories: string[]
  selectedCategory: string
  searchQuery: string
  visibleProducts: Product[]
  quantityByProductId: Map<string, number>
  onCategoryChange: (category: string) => void
  onSearchChange: (value: string) => void
  onAdd: (product: Product) => void
  onIncrement: (productId: string) => void
  onDecrement: (productId: string) => void
}

export function MenuPage({
  isLoading,
  apiNotice,
  categories,
  selectedCategory,
  searchQuery,
  visibleProducts,
  quantityByProductId,
  onCategoryChange,
  onSearchChange,
  onAdd,
  onIncrement,
  onDecrement,
}: MenuPageProps) {
  return (
    <main className="shop-shell single-column">
      <section className="menu-section" aria-labelledby="menu-title">
        <div className="section-heading">
          <span>Thuc don hom nay</span>
          <h1 id="menu-title">Chon mon cho gio hang cua ban</h1>
          <p>Gia tam tinh duoc cap nhat theo san pham trong he thong.</p>
        </div>

        {apiNotice ? <p className="api-notice">{apiNotice}</p> : null}

        <div className="menu-toolbar">
          <label>
            Tim mon
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Nhap ten mon..."
            />
          </label>
        </div>

        <div className="category-tabs" role="tablist" aria-label="Loc danh muc">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              role="tab"
              aria-selected={selectedCategory === category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-state">Dang tai san pham...</div>
        ) : (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantityByProductId.get(product.id) ?? 0}
                onAdd={onAdd}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
              />
            ))}
            {visibleProducts.length === 0 ? (
              <div className="empty-admin-state">Khong tim thay mon phu hop.</div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}
