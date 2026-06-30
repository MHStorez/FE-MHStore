import type { CustomerInfo } from '../types'

type DeliveryAddressFieldsProps = {
  apiBaseUrl: string
  customer: CustomerInfo
  onChange: (customer: CustomerInfo) => void
}

export function DeliveryAddressFields({ customer, onChange }: DeliveryAddressFieldsProps) {
  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    onChange({ ...customer, [field]: value })
  }

  const updateManualAddress = (value: string) => {
    onChange({
      ...customer,
      address: value,
      latitude: null,
      longitude: null,
      addressReferenceId: '',
    })
  }

  return (
    <div className="customer-form delivery-form">
      <label>
        Tên người nhận
        <input
          value={customer.name}
          onChange={(event) => updateCustomer('name', event.target.value)}
          placeholder="Ví dụ: Cô Lan"
        />
      </label>
      <label>
        Số điện thoại
        <input
          value={customer.phone}
          onChange={(event) => updateCustomer('phone', event.target.value)}
          placeholder="0334140131"
        />
      </label>
      <label>
        Địa chỉ giao hàng
        <input
          value={customer.address}
          onChange={(event) => updateManualAddress(event.target.value)}
          placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
          autoComplete="street-address"
        />
        <small>Nhập địa chỉ thủ công để shipper dễ giao đúng nơi.</small>
      </label>
      <label>
        Ghi chú địa chỉ
        <textarea
          value={customer.note}
          onChange={(event) => updateCustomer('note', event.target.value)}
          placeholder="Số nhà, tên đường, thời gian giao..."
          rows={3}
        />
      </label>
    </div>
  )
}
