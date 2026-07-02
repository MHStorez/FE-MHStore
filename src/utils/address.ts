export type AddressSuggestion = {
  address: string
  latitude?: number | null
  longitude?: number | null
  referenceId?: string
}

const normalizeBaseUrl = (apiBaseUrl: string) => apiBaseUrl.replace(/\/+$/, '')

export const fetchAddressSuggestions = async (
  apiBaseUrl: string,
  query: string,
  signal?: AbortSignal,
) => {
  const safeQuery = query.trim()

  if (safeQuery.length < 2) {
    return []
  }

  const params = new URLSearchParams({ query: safeQuery })
  const response = await fetch(
    `${normalizeBaseUrl(apiBaseUrl)}/api/address/autocomplete?${params.toString()}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(`Address autocomplete API returned ${response.status}`)
  }

  return (await response.json()) as AddressSuggestion[]
}

export const reverseAddress = async (
  apiBaseUrl: string,
  latitude: number,
  longitude: number,
) => {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  })
  const response = await fetch(
    `${normalizeBaseUrl(apiBaseUrl)}/api/address/reverse?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error(`Address reverse API returned ${response.status}`)
  }

  return (await response.json()) as AddressSuggestion
}
