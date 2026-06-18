import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.svg'
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
            <strong>MHStore Chu quan</strong>
            <span>Quan ly ban hang</span>
          </div>
        </div>
        <nav className="admin-nav" aria-label="Chu quan navigation">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/products">Mon an</NavLink>
          <NavLink to="/admin/orders">Don hang</NavLink>
        </nav>
        <button type="button" className="admin-logout" onClick={handleLogout}>
          Dang xuat
        </button>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  )
}
