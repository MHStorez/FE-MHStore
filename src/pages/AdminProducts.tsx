import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../utils/products'

type AdminProductsProps = {
  apiBaseUrl: string
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: '',
  isAvailable: true,
}

export function AdminProducts({ apiBaseUrl }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState('')
  const [editingProductId, setEditingProductId] = useState('')

  const loadProducts = async () => {
    setIsLoading(true)
    setNotice('')

    try {
      setProducts(await fetchProducts(apiBaseUrl, { includeUnavailable: true }))
    } catch {
      setNotice('Chua tai duoc danh sach mon.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialProducts = async () => {
      try {
        const apiProducts = await fetchProducts(apiBaseUrl, { includeUnavailable: true })

        if (isMounted) {
          setProducts(apiProducts)
          setNotice('')
        }
      } catch {
        if (isMounted) {
          setNotice('Chua tai duoc danh sach mon.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialProducts()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setNotice('')

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        category: form.category || 'Khac',
        isAvailable: form.isAvailable,
      }
      const product = editingProductId
        ? await updateProduct(apiBaseUrl, editingProductId, payload)
        : await createProduct(apiBaseUrl, payload)

      setProducts((currentProducts) =>
        editingProductId
          ? currentProducts.map((item) => (item.id === product.id ? product : item))
          : [product, ...currentProducts],
      )
      setForm(emptyForm)
      setEditingProductId('')
      setNotice(editingProductId ? 'Da cap nhat mon.' : 'Da them mon moi.')
      toast.success(editingProductId ? 'Da cap nhat mon' : 'Da them mon moi')
    } catch {
      setNotice('Chua luu duoc mon. Kiem tra ten mon, gia va quyen chu quan.')
      toast.error('Chua luu duoc mon')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (productId: string) => {
    setDeletingProductId(productId)
    setNotice('')

    try {
      await deleteProduct(apiBaseUrl, productId)
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      )
      setNotice('Da xoa mon.')
      toast.success('Da xoa mon')
    } catch {
      setNotice('Chua xoa duoc mon.')
      toast.error('Chua xoa duoc mon')
    } finally {
      setDeletingProductId('')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      imageUrl: product.imageUrl ?? '',
      category: product.category ?? '',
      isAvailable: product.isAvailable ?? true,
    })
    setNotice('')
  }

  const handleCancelEdit = () => {
    setEditingProductId('')
    setForm(emptyForm)
    setNotice('')
  }

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div>
          <span>Chu quan</span>
          <h1>Quan ly mon</h1>
          <p>Them mon moi vao menu va xoa mon khong con ban.</p>
        </div>
        <button type="button" className="refresh-button" onClick={loadProducts}>
          Tai lai
        </button>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      <section className="owner-products-grid">
        <form className="owner-product-form" onSubmit={handleSubmit}>
          <h2>{editingProductId ? 'Sua mon' : 'Them mon'}</h2>
          <label>
            Ten mon
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Vi du: Cha ram tom dat"
            />
          </label>
          <label>
            Loai
            <input
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              placeholder="Hai san, Do vien, Nem cha..."
            />
          </label>
          <label>
            Gia
            <input
              type="number"
              min="1000"
              step="1000"
              value={form.price}
              onChange={(event) => updateForm('price', event.target.value)}
              placeholder="120000"
            />
          </label>
          <label>
            Link anh
            <input
              value={form.imageUrl}
              onChange={(event) => updateForm('imageUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>
          <label>
            Mo ta
            <textarea
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              rows={4}
              placeholder="Mo ta ngan ve mon..."
            />
          </label>
          <label className="owner-product-check">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => updateForm('isAvailable', event.target.checked)}
            />
            Dang ban
          </label>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Dang luu...' : editingProductId ? 'Cap nhat mon' : 'Them mon'}
          </button>
          {editingProductId ? (
            <button type="button" className="secondary-owner-button" onClick={handleCancelEdit}>
              Huy sua
            </button>
          ) : null}
        </form>

        <section className="owner-product-list" aria-label="Danh sach mon">
          {isLoading ? (
            <div className="loading-state">Dang tai mon...</div>
          ) : products.length === 0 ? (
            <div className="empty-admin-state">Chua co mon nao.</div>
          ) : (
            products.map((product) => (
              <article className="owner-product-row" key={product.id}>
                <img src={product.imageUrl || ''} alt="" />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category || 'Khac'}</span>
                  <p>{formatCurrency(product.price)}</p>
                  <em>{product.isAvailable === false ? 'Het hang' : 'Dang ban'}</em>
                </div>
                <div className="owner-product-actions">
                  <button type="button" onClick={() => handleEdit(product)}>
                    Sua
                  </button>
                  <button
                    type="button"
                    disabled={deletingProductId === product.id}
                    onClick={() => handleDelete(product.id)}
                  >
                    Xoa
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  )
}
