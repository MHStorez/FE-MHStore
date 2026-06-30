import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const features = [
  {
    label: '01',
    title: 'Món ngon cấp đông',
    description: 'Sản phẩm đóng gói gọn, bảo quản tiện lợi và chế biến nhanh tại nhà.',
  },
  {
    label: '02',
    title: 'Đặt hàng dễ dàng',
    description: 'Chọn món, thêm vào giỏ và gửi đơn qua Zalo chỉ trong vài thao tác.',
  },
  {
    label: '03',
    title: 'Thanh toán linh hoạt',
    description: 'Hỗ trợ chuyển khoản SePay hoặc xác nhận đơn trực tiếp với shop.',
  },
]

const steps = ['Chọn món yêu thích', 'Nhập thông tin giao hàng', 'Gửi đơn và chờ shop xác nhận']

export function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-hero">
        <div>
          <img className="hero-logo" src={logo} alt="MHStore" />
          <span>MHStore</span>
          <h1>Món ngon đông lạnh cho bữa ăn nhanh gọn tại nhà</h1>
          <p>Chọn món, tạo giỏ hàng và thanh toán nhanh bằng SePay hoặc gửi đơn qua Zalo.</p>
          <div className="hero-actions">
            <Link className="hero-action" to="/menu">Xem sản phẩm</Link>
            <Link className="hero-secondary-action" to="/cart">Đến giỏ hàng</Link>
          </div>
        </div>
      </section>

      <section className="home-section home-feature-grid" aria-label="Điểm nổi bật">
        {features.map((feature) => (
          <article key={feature.title}>
            <span>{feature.label}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="home-section home-steps" aria-labelledby="home-steps-title">
        <div>
          <span>Quy trình</span>
          <h2 id="home-steps-title">Đặt món nhanh trong 3 bước</h2>
          <p>Khách có thể mua trực tiếp một món hoặc thêm nhiều món vào giỏ hàng rồi đặt một lần.</p>
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
