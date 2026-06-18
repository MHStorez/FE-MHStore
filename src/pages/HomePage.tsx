import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

export function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-hero">
        <div>
          <img className="hero-logo" src={logo} alt="MHStore" />
          <span>MHStore</span>
          <h1>Mon ngon dong lanh cho bua an nhanh gon tai nha</h1>
          <p>Chon mon, tao gio hang va thanh toan nhanh bang SePay hoac gui don qua Zalo.</p>
          <Link className="hero-action" to="/menu">Xem san pham</Link>
        </div>
      </section>
    </main>
  )
}
