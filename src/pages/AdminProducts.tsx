import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import type { Category, Product } from '../types'
import { formatCurrency } from '../utils/format'
import { getProductImage, getProductImages, getProductStock } from '../utils/productImages'
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
  uploadProductImage,
} from '../utils/products'

const otherCategoryValue = '__other__'
const maxImageBytes = 5 * 1024 * 1024
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  imageUrl: '',
  imageUrls: [] as string[],
  categoryId: '',
  newCategoryName: '',
  isAvailable: true,
}

type AdminProductsProps = {
  apiBaseUrl: string
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
  const imagePreviewUrls = form.imageUrls

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
      setNotice('Chưa tải được danh sách món.')
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
          setNotice('Chưa tải được danh sách món.')
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

  const updateForm = (field: keyof typeof form, value: string | boolean | string[]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const addImageUrl = (imageUrl: string) => {
    const trimmedUrl = imageUrl.trim()

    if (!trimmedUrl) {
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      imageUrl: '',
      imageUrls: currentForm.imageUrls.some((url) => url.toLowerCase() === trimmedUrl.toLowerCase())
        ? currentForm.imageUrls
        : [...currentForm.imageUrls, trimmedUrl],
    }))
  }

  const removeImageUrl = (imageUrl: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      imageUrls: currentForm.imageUrls.filter((url) => url !== imageUrl),
    }))
  }

  const handleImageFileChange = async (file?: File) => {
    if (!file) {
      return
    }

    setNotice('')

    if (!allowedImageTypes.includes(file.type)) {
      setNotice('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.')
      toast.error('Định dạng ảnh không hợp lệ')
      return
    }

    if (file.size > maxImageBytes) {
      setNotice('Ảnh phải nhỏ hơn hoặc bằng 5MB.')
      toast.error('Ảnh vượt quá 5MB')
      return
    }

    setIsUploading(true)

    try {
      const upload = await uploadProductImage(apiBaseUrl, file)
      addImageUrl(upload.imageUrl)
      toast.success('Đã upload ảnh')
    } catch {
      setNotice('Chưa upload được ảnh. Kiểm tra quyền admin và backend.')
      toast.error('Chưa upload được ảnh')
    } finally {
      setIsUploading(false)
    }
  }

  const validateCategory = () => {
    if (!form.categoryId) {
      setNotice('Vui lòng chọn loại món.')
      toast.error('Vui lòng chọn loại món')
      return false
    }

    if (selectedCategoryIsOther) {
      const categoryName = form.newCategoryName.trim()

      if (!categoryName) {
        setNotice('Vui lòng nhập tên loại mới.')
        toast.error('Vui lòng nhập tên loại mới')
        return false
      }

      if (categoryNameSet.has(categoryName.toLowerCase())) {
        setNotice('Loại món này đã tồn tại. Hãy chọn trong dropdown.')
        toast.error('Loại món đã tồn tại')
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

    const stock = Number(form.stock)

    if (!Number.isInteger(stock) || stock < 0) {
      setNotice('Tồn kho phải là số nguyên không âm.')
      toast.error('Tồn kho không hợp lệ')
      return
    }

    setIsSaving(true)
    setNotice('')

    try {
      const imageUrls = form.imageUrl.trim()
        ? [...form.imageUrls, form.imageUrl.trim()]
        : form.imageUrls
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock,
        imageUrl: imageUrls[0],
        imageUrls,
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
      setNotice(editingProductId ? 'Đã cập nhật món.' : 'Đã thêm món mới.')
      toast.success(editingProductId ? 'Đã cập nhật món' : 'Đã thêm món mới')
      await loadCategories()
    } catch {
      setNotice('Chưa lưu được món. Kiểm tra tên món, giá, tồn kho, loại món và quyền chủ quán.')
      toast.error('Chưa lưu được món')
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
      setNotice('Đã xóa món.')
      toast.success('Đã xóa món')
    } catch {
      setNotice('Chưa xóa được món.')
      toast.error('Chưa xóa được món')
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
      stock: String(getProductStock(product)),
      imageUrl: '',
      imageUrls: getProductImages(product),
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
          <span>Chủ quán</span>
          <h1>Quản lý món</h1>
          <p>Thêm món mới, cập nhật tồn kho và quản lý nhiều ảnh sản phẩm.</p>
        </div>
        <button type="button" className="refresh-button" onClick={loadProducts}>
          Tải lại
        </button>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      <section className="owner-products-grid">
        <form className="owner-product-form" onSubmit={handleSubmit}>
          <h2>{editingProductId ? 'Sửa món' : 'Thêm món'}</h2>
          <label>
            Tên món
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="Ví dụ: Chả ram tôm đất"
            />
          </label>
          <label>
            Loại
            <select
              value={form.categoryId}
              onChange={(event) => updateForm('categoryId', event.target.value)}
            >
              <option value="">Chọn loại món</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
              <option value={otherCategoryValue}>Khác / Loại khác</option>
            </select>
          </label>
          {selectedCategoryIsOther ? (
            <label>
              Tên loại mới
              <input
                value={form.newCategoryName}
                onChange={(event) => updateForm('newCategoryName', event.target.value)}
                placeholder="Ví dụ: Hải sản"
              />
            </label>
          ) : null}
          <label>
            Giá
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
            Tồn kho
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => updateForm('stock', event.target.value)}
              placeholder="30"
            />
          </label>
          <div className="image-mode-toggle" role="tablist" aria-label="Chọn cách thêm ảnh">
            <button type="button" className={imageMode === 'upload' ? 'active' : ''} onClick={() => setImageMode('upload')}>
              Upload ảnh
            </button>
            <button type="button" className={imageMode === 'link' ? 'active' : ''} onClick={() => setImageMode('link')}>
              Dùng link ảnh
            </button>
          </div>
          {imageMode === 'upload' ? (
            <label>
              Tải ảnh từ máy
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={isUploading}
                onChange={(event) => handleImageFileChange(event.target.files?.[0])}
              />
              <small>Hỗ trợ JPG, PNG, WEBP, GIF. Tối đa 5MB. Ảnh upload sẽ được thêm vào danh sách.</small>
            </label>
          ) : (
            <label>
              Link ảnh
              <div className="image-link-row">
                <input
                  value={form.imageUrl}
                  onChange={(event) => updateForm('imageUrl', event.target.value)}
                  placeholder="https://..."
                />
                <button type="button" onClick={() => addImageUrl(form.imageUrl)}>
                  Thêm ảnh
                </button>
              </div>
            </label>
          )}
          {imagePreviewUrls.length > 0 ? (
            <div className="image-preview image-preview-grid">
              <span>Ảnh sản phẩm</span>
              <div>
                {imagePreviewUrls.map((imageUrl, index) => (
                  <figure key={imageUrl}>
                    <img src={imageUrl} alt={`Ảnh món ${index + 1}`} />
                    <figcaption>{index === 0 ? 'Ảnh chính' : `Ảnh ${index + 1}`}</figcaption>
                    <button type="button" onClick={() => removeImageUrl(imageUrl)}>Xóa</button>
                  </figure>
                ))}
              </div>
            </div>
          ) : null}
          <label>
            Mô tả
            <textarea
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              rows={4}
              placeholder="Mô tả ngắn về món..."
            />
          </label>
          <label className="owner-product-check">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => updateForm('isAvailable', event.target.checked)}
            />
            Đang bán
          </label>
          <button type="submit" disabled={isSaving || isUploading}>
            {isSaving ? 'Đang lưu...' : editingProductId ? 'Cập nhật món' : 'Thêm món'}
          </button>
          {editingProductId ? (
            <button type="button" className="secondary-owner-button" onClick={handleCancelEdit}>
              Hủy sửa
            </button>
          ) : null}
        </form>

        <section className="owner-product-list" aria-label="Danh sách món">
          {isLoading ? (
            <div className="loading-state">Đang tải món...</div>
          ) : products.length === 0 ? (
            <div className="empty-admin-state">Chưa có món nào.</div>
          ) : (
            products.map((product) => (
              <article className="owner-product-row" key={product.id}>
                <img src={getProductImage(product)} alt="" />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category || 'Khác'}</span>
                  <p>{formatCurrency(product.price)}</p>
                  <em>{product.isAvailable === false ? 'Ngừng bán' : `Còn ${getProductStock(product)} món`}</em>
                </div>
                <div className="owner-product-actions">
                  <button type="button" onClick={() => handleEdit(product)}>
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={deletingProductId === product.id}
                    onClick={() => handleDelete(product.id)}
                  >
                    Xóa
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
