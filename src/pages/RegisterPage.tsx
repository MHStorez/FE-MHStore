import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register } from '../utils/account'

type RegisterPageProps = {
  apiBaseUrl: string
}

export function RegisterPage({ apiBaseUrl }: RegisterPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    try {
      await register(apiBaseUrl, username, password, fullName)
      toast.success('Đã tạo tài khoản')
      navigate('/')
    } catch {
      toast.error('Chưa tạo được tài khoản')
      setMessage('Chưa tạo được tài khoản. Kiểm tra username/password.')
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span>MHStore</span>
        <h1>Đăng ký</h1>
        <label>
          Họ tên
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </label>
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
        <button type="submit">Tạo tài khoản</button>
        {message ? <p className="checkout-message">{message}</p> : null}
        <Link to="/login">Đã có tài khoản</Link>
      </form>
    </main>
  )
}
