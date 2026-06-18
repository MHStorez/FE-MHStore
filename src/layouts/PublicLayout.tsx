import { Link, Outlet } from 'react-router-dom'
import logo from '../assets/logo.png'

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
            <span>Do dong lanh va do an nha lam</span>
          </div>
        </Link>

        <nav className="public-nav" aria-label="Public navigation">
          <Link to="/">Home</Link>
          <Link to="/menu">San pham</Link>
          <Link to="/cart">Gio hang ({cartCount})</Link>
          <Link to="/login">Dang nhap</Link>
        </nav>

        <a className="zalo-link" href={`https://zalo.me/${zaloPhone}`}>
          Zalo {zaloPhone}
        </a>
      </header>
      <Outlet />
    </div>
  )
}
