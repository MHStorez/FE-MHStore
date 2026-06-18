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
  const [role, setRole] = useState<'Customer' | 'Admin'>('Admin')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    try {
      const session = await register(apiBaseUrl, username, password, fullName, role)
      toast.success('Da tao tai khoan')
      navigate(session.role === 'Admin' ? '/admin' : '/')
    } catch {
      toast.error('Chua tao duoc tai khoan')
      setMessage('Chua tao duoc tai khoan. Kiem tra username/password.')
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span>MHStore</span>
        <h1>Dang ky</h1>
        <label>
          Ho ten
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
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as 'Customer' | 'Admin')}>
            <option value="Admin">Admin</option>
            <option value="Customer">Customer</option>
          </select>
        </label>
        <button type="submit">Tao tai khoan</button>
        {message ? <p className="checkout-message">{message}</p> : null}
        <Link to="/login">Da co tai khoan</Link>
      </form>
    </main>
  )
}
