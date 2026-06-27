import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import type { Category, Product } from '../types'
import { formatCurrency } from '../utils/format'
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
  uploadProductImage,
} from '../utils/products'

type AdminProductsProps = {
  apiBaseUrl: string
}

const otherCategoryValue = '__other__'
const maxImageBytes = 5 * 1024 * 1024
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const emptyForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  newCategoryName: '',
  isAvailable: true,
}

export function AdminProducts({ apiBaseUrl }: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptyForm)
  const [imageMode, setImageMode] = useState<'upload' | 'link'>('link')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingProductId, setDeletingProductId] = useState('')
  const [editingProductId, setEditingProductId] = useState('')

  const selectedCategoryIsOther = form.categoryId === otherCategoryValue
  const imagePreviewUrl = form.imageUrl.trim()

  const loadCategories = async () => {
    setCategories(await fetchCategories(apiBaseUrl, true))
  }

  const loadProducts = async () => {
    setIsLoading(true)
    setNotice('')

    try {
      const [apiProducts, apiCategories] = await Promise.all([
        fetchProducts(apiBaseUrl, { includeUnavailable: true }),
        fetchCategories(apiBaseUrl, true),
      ])
      setProducts(apiProducts)
      setCategories(apiCategories)
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
        const [apiProducts, apiCategories] = await Promise.all([
          fetchProducts(apiBaseUrl, { includeUnavailable: true }),
          fetchCategories(apiBaseUrl, true),
        ])

        if (isMounted) {
          setProducts(apiProducts)
          setCategories(apiCategories)
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

  const categoryNameSet = useMemo(
    () => new Set(categories.map((category) => category.name.trim().toLowerCase())),
    [categories],
  )

  const updateForm = (field: keyof typeof form, value: string | boolean) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleImageFileChange = async (file?: File) => {
    if (!file) {
      return
    }

    setNotice('')

    if (!allowedImageTypes.includes(file.type)) {
      setNotice('Chi ho tro anh JPG, PNG, WEBP hoac GIF.')
      toast.error('Dinh dang anh khong hop le')
      return
    }

    if (file.size > maxImageBytes) {
      setNotice('Anh phai nho hon hoac bang 5MB.')
      toast.error('Anh vuot qua 5MB')
      return
    }

    setIsUploading(true)

    try {
      const upload = await uploadProductImage(apiBaseUrl, file)
      updateForm('imageUrl', upload.imageUrl)
      toast.success('Da upload anh')
    } catch {
      setNotice('Chua upload duoc anh. Kiem tra quyen admin va backend.')
      toast.error('Chua upload duoc anh')
    } finally {
      setIsUploading(false)
    }
  }

  const validateCategory = () => {
    if (!form.categoryId) {
      setNotice('Vui long chon loai mon.')
      toast.error('Vui long chon loai mon')
      return false
    }

    if (selectedCategoryIsOther) {
      const categoryName = form.newCategoryName.trim()

      if (!categoryName) {
        setNotice('Vui long nhap ten loai moi.')
        toast.error('Vui long nhap ten loai moi')
        return false
      }

      if (categoryNameSet.has(categoryName.toLowerCase())) {
        setNotice('Loai mon nay da ton tai. Hay chon trong dropdown.')
        toast.error('Loai mon da ton tai')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateCategory()) {
      return
    }

    setIsSaving(true)
    setNotice('')

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        categoryId: selectedCategoryIsOther ? undefined : form.categoryId,
        newCategoryName: selectedCategoryIsOther ? form.newCategoryName.trim() : undefined,
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
      setImageMode('link')
      setEditingProductId('')
      setNotice(editingProductId ? 'Da cap nhat mon.' : 'Da them mon moi.')
      toast.success(editingProductId ? 'Da cap nhat mon' : 'Da them mon moi')
      await loadCategories()
    } catch {
      setNotice('Chua luu duoc mon. Kiem tra ten mon, gia, loai mon va quyen chu quan.')
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
      categoryId: product.categoryId ?? '',
      newCategoryName: '',
      isAvailable: product.isAvailable ?? true,
    })
    setImageMode('link')
    setNotice('')
  }

  const handleCancelEdit = () => {
    setEditingProductId('')
    setForm(emptyForm)
    setImageMode('link')
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
            <select
              value={form.categoryId}
              onChange={(event) => updateForm('categoryId', event.target.value)}
            >
              <option value="">Chon loai mon</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              <option value={otherCategoryValue}>Other / Loai khac</option>
            </select>
          </label>
          {selectedCategoryIsOther ? (
            <label>
              Ten loai moi
              <input
                value={form.newCategoryName}
                onChange={(event) => updateForm('newCategoryName', event.target.value)}
                placeholder="Vi du: Hai san"
              />
            </label>
          ) : null}
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
          <div className="image-mode-toggle" role="tablist" aria-label="Chon cach them anh">
            <button type="button" className={imageMode === 'upload' ? 'active' : ''} onClick={() => setImageMode('upload')}>
              Upload anh
            </button>
            <button type="button" className={imageMode === 'link' ? 'active' : ''} onClick={() => setImageMode('link')}>
              Dung link anh
            </button>
          </div>
          {imageMode === 'upload' ? (
            <label>
              Tai anh tu may
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUploading}
                onChange={(event) => handleImageFileChange(event.target.files?.[0])}
              />
              <small>Ho tro JPG, PNG, WEBP, GIF. Toi da 5MB.</small>
            </label>
          ) : (
            <label>
              Link anh
              <input
                value={form.imageUrl}
                onChange={(event) => updateForm('imageUrl', event.target.value)}
                placeholder="https://..."
              />
            </label>
          )}
          {imagePreviewUrl ? (
            <div className="image-preview">
              <span>Preview anh</span>
              <img src={imagePreviewUrl} alt="Preview mon" />
            </div>
          ) : null}
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
          <button type="submit" disabled={isSaving || isUploading}>
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
