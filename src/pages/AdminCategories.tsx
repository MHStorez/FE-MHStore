import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import type { Category } from '../types'
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../utils/products'

const emptyForm = {
  name: '',
  status: 'Active',
}

type AdminCategoriesProps = {
  apiBaseUrl: string
}

export function AdminCategories({ apiBaseUrl }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingCategoryId, setEditingCategoryId] = useState('')
  const [deletingCategoryId, setDeletingCategoryId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const loadCategories = async () => {
    setIsLoading(true)
    setNotice('')

    try {
      setCategories(await fetchCategories(apiBaseUrl, true))
    } catch {
      setNotice('Chưa tải được danh sách loại món.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialCategories = async () => {
      try {
        const apiCategories = await fetchCategories(apiBaseUrl, true)

        if (isMounted) {
          setCategories(apiCategories)
          setNotice('')
        }
      } catch {
        if (isMounted) {
          setNotice('Chưa tải được danh sách loại món.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialCategories()

    return () => {
      isMounted = false
    }
  }, [apiBaseUrl])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setNotice('Vui lòng nhập tên loại món.')
      toast.error('Vui lòng nhập tên loại món')
      return
    }

    setIsSaving(true)
    setNotice('')

    try {
      const category = editingCategoryId
        ? await updateCategory(apiBaseUrl, editingCategoryId, form.name, form.status)
        : await createCategory(apiBaseUrl, form.name, form.status)

      setCategories((currentCategories) =>
        editingCategoryId
          ? currentCategories.map((item) => (item.id === category.id ? category : item))
          : [...currentCategories, category].sort((left, right) => left.name.localeCompare(right.name)),
      )
      setForm(emptyForm)
      setEditingCategoryId('')
      setNotice(editingCategoryId ? 'Đã cập nhật loại món.' : 'Đã thêm loại món.')
      toast.success(editingCategoryId ? 'Đã cập nhật loại món' : 'Đã thêm loại món')
    } catch {
      setNotice('Chưa lưu được loại món. Kiểm tra tên bị trùng hoặc quyền admin.')
      toast.error('Chưa lưu được loại món')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    setForm({ name: category.name, status: category.status || 'Active' })
    setNotice('')
  }

  const handleCancelEdit = () => {
    setEditingCategoryId('')
    setForm(emptyForm)
    setNotice('')
  }

  const handleDelete = async (categoryId: string) => {
    setDeletingCategoryId(categoryId)
    setNotice('')

    try {
      await deleteCategory(apiBaseUrl, categoryId)
      setCategories((currentCategories) => currentCategories.filter((category) => category.id !== categoryId))
      setNotice('Đã xóa loại món.')
      toast.success('Đã xóa loại món')
    } catch {
      setNotice('Chưa xóa được loại món. Loại đang có sản phẩm sẽ không được xóa.')
      toast.error('Chưa xóa được loại món')
    } finally {
      setDeletingCategoryId('')
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-heading">
        <div>
          <span>Chủ quán</span>
          <h1>Quản lý loại món</h1>
          <p>Thêm, sửa, ẩn/hiện và xóa loại món chưa có sản phẩm.</p>
        </div>
        <button type="button" className="refresh-button" onClick={loadCategories}>
          Tải lại
        </button>
      </section>

      {notice ? <p className="api-notice">{notice}</p> : null}

      <section className="owner-products-grid">
        <form className="owner-product-form" onSubmit={handleSubmit}>
          <h2>{editingCategoryId ? 'Sửa loại món' : 'Thêm loại món'}</h2>
          <label>
            Tên loại
            <input
              value={form.name}
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, name: event.target.value }))}
              placeholder="Ví dụ: Hải sản"
            />
          </label>
          <label>
            Trạng thái
            <select
              value={form.status}
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, status: event.target.value }))}
            >
              <option value="Active">Đang hiển thị</option>
              <option value="Inactive">Ẩn khỏi menu</option>
            </select>
          </label>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : editingCategoryId ? 'Cập nhật loại' : 'Thêm loại'}
          </button>
          {editingCategoryId ? (
            <button type="button" className="secondary-owner-button" onClick={handleCancelEdit}>
              Hủy sửa
            </button>
          ) : null}
        </form>

        <section className="owner-product-list" aria-label="Danh sách loại món">
          {isLoading ? (
            <div className="loading-state">Đang tải loại món...</div>
          ) : categories.length === 0 ? (
            <div className="empty-admin-state">Chưa có loại món nào.</div>
          ) : (
            categories.map((category) => (
              <article className="owner-product-row category-row" key={category.id}>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.slug}</span>
                  <em>{category.status === 'Active' ? 'Đang hiển thị' : 'Đang ẩn'}</em>
                </div>
                <div className="owner-product-actions">
                  <button type="button" onClick={() => handleEdit(category)}>
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={deletingCategoryId === category.id}
                    onClick={() => handleDelete(category.id)}
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
