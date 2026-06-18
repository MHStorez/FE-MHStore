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
      toast.success('Dang nhap thanh cong')
      navigate(session.role === 'Admin' ? '/admin' : '/')
    } catch {
      toast.error('Dang nhap sai')
      setMessage('Dang nhap sai hoac tai khoan chua ton tai.')
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span>Chu quan</span>
        <h1>Dang nhap</h1>
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
        <button type="submit">Dang nhap</button>
        {message ? <p className="checkout-message">{message}</p> : null}
        <Link to="/register">Tao tai khoan moi</Link>
      </form>
    </main>
  )
}
