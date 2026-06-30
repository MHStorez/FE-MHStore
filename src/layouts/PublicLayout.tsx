import { Link, Outlet } from 'react-router-dom'
import logo from '../assets/MHStoreLogo.png'

type PublicLayoutProps = {
  cartCount: number
  zaloPhone: string
}

export function PublicLayout({ cartCount, zaloPhone }: PublicLayoutProps) {
  return (
    <div className="app-shell public-layout">
      <header className="site-header public-header">
        <Link className="brand" to="/">
          <img className="brand-logo" src={logo} alt="MHStore" />
          <div>
            <strong>MHStore</strong>
            <span>Đồ đông lạnh và đồ ăn nhà làm</span>
          </div>
        </Link>

        <nav className="public-nav" aria-label="Điều hướng cửa hàng">
          <Link to="/">Trang chủ</Link>
          <Link to="/menu">Sản phẩm</Link>
          <Link to="/cart">Giỏ hàng ({cartCount})</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>

        <a className="zalo-link" href={`https://zalo.me/${zaloPhone}`}>
          Zalo {zaloPhone}
        </a>
      </header>
      <Outlet />
    </div>
  )
}
