export type CreatePaymentResponse = {
  orderId: string
  amount: number
  bankCode: string
  accountNumber: string
  accountName: string
  transferContent: string
  qrImageUrl: string
}

export const createPayment = async (apiBaseUrl: string, orderId: string) => {
  const response = await fetch(`${apiBaseUrl}/api/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  })

  if (!response.ok) {
    throw new Error(`Payment API returned ${response.status}`)
  }

  return (await response.json()) as CreatePaymentResponse
}
