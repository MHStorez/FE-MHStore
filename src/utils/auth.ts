const authTokenKey = 'mhstoreAuthToken'
const authRoleKey = 'mhstoreAuthRole'

export const getAuthToken = () => localStorage.getItem(authTokenKey)

export const getAuthRole = () => localStorage.getItem(authRoleKey)

export const saveAuthSession = (token: string, role: string) => {
  localStorage.setItem(authTokenKey, token)
  localStorage.setItem(authRoleKey, role)
}

export const clearAuthSession = () => {
  localStorage.removeItem(authTokenKey)
  localStorage.removeItem(authRoleKey)
}

export const isAdminAuthenticated = () =>
  Boolean(getAuthToken()) && getAuthRole() === 'Admin'
