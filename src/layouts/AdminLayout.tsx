import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/MHStoreLogo.png'
import { clearAuthSession } from '../utils/auth'

export function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img className="brand-logo" src={logo} alt="MHStore" />
          <div>
            <strong>MHStore Chủ quán</strong>
            <span>Quản lý bán hàng</span>
          </div>
        </div>
        <nav className="admin-nav" aria-label="Điều hướng quản trị">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/products">Món ăn</NavLink>
          <NavLink to="/admin/categories">Loại món</NavLink>
          <NavLink to="/admin/orders">Đơn hàng</NavLink>
        </nav>
        <button type="button" className="admin-logout" onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
