import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../utils/account'

type LoginPageProps = {
  apiBaseUrl: string
}

export function LoginPage({ apiBaseUrl }: LoginPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    try {
      const session = await login(apiBaseUrl, username, password)
      toast.success('Đăng nhập thành công')
      navigate(session.role === 'Admin' ? '/admin' : '/')
    } catch {
      toast.error('Đăng nhập sai')
      setMessage('Đăng nhập sai hoặc tài khoản chưa tồn tại.')
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span>Chủ quán</span>
        <h1>Đăng nhập</h1>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit">Đăng nhập</button>
        {message ? <p className="checkout-message">{message}</p> : null}
        <Link to="/register">Tạo tài khoản mới</Link>
      </form>
    </main>
  )
}
