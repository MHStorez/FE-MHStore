import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const features = [
  {
    title: 'Mon ngon cap dong',
    description: 'San pham dong goi gon, bao quan tien loi va che bien nhanh tai nha.',
  },
  {
    title: 'Dat hang de dang',
    description: 'Chon mon, them vao gio va gui don qua Zalo chi trong vai thao tac.',
  },
  {
    title: 'Thanh toan linh hoat',
    description: 'Ho tro chuyen khoan SePay hoac xac nhan don truc tiep voi shop.',
  },
]

const steps = ['Chon mon yeu thich', 'Nhap thong tin giao hang', 'Gui don va cho shop xac nhan']

export function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-hero">
        <div>
          <img className="hero-logo" src={logo} alt="MHStore" />
          <span>MHStore</span>
          <h1>Mon ngon dong lanh cho bua an nhanh gon tai nha</h1>
          <p>Chon mon, tao gio hang va thanh toan nhanh bang SePay hoac gui don qua Zalo.</p>
          <div className="hero-actions">
            <Link className="hero-action" to="/menu">Xem san pham</Link>
            <Link className="hero-secondary-action" to="/cart">Den gio hang</Link>
          </div>
        </div>
      </section>

      <section className="home-section home-feature-grid" aria-label="Diem noi bat">
        {features.map((feature) => (
          <article key={feature.title}>
            <span>MH</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="home-section home-steps" aria-labelledby="home-steps-title">
        <div>
          <span>Quy trinh</span>
          <h2 id="home-steps-title">Dat mon nhanh trong 3 buoc</h2>
          <p>Khach co the mua truc tiep mot mon hoac them nhieu mon vao gio hang roi dat mot lan.</p>
        </div>
        <ol>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  )
}
