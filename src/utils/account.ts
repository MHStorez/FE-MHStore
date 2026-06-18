import { saveAuthSession } from './auth'

type AuthResponse = {
  token: string
  role: string
}

export const login = async (
  apiBaseUrl: string,
  username: string,
  password: string,
) => {
  const response = await fetch(`${apiBaseUrl}/api/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    throw new Error(`Login API returned ${response.status}`)
  }

  const data = (await response.json()) as AuthResponse
  saveAuthSession(data.token, data.role)

  return data
}

export const register = async (
  apiBaseUrl: string,
  username: string,
  password: string,
  fullName: string,
  role = 'Customer',
) => {
  const response = await fetch(`${apiBaseUrl}/api/account/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, fullName, role }),
  })

  if (!response.ok) {
    throw new Error(`Register API returned ${response.status}`)
  }

  const data = (await response.json()) as AuthResponse
  saveAuthSession(data.token, data.role)

  return data
}
