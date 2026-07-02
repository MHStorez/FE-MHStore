import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl'
import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css'
import type { CustomerInfo } from '../types'
import {
  fetchAddressSuggestions,
  reverseAddress,
  type AddressSuggestion,
} from '../utils/address'

const defaultMapCenter: [number, number] = [106.700981, 10.776889]
const rawVietMapStyleUrl = import.meta.env.VITE_VIETMAP_STYLE_URL ?? ''
const vietMapApiKey = import.meta.env.VITE_VIETMAP_API_KEY
  ?? import.meta.env.VITE_VIETMAP_TILE_KEY
  ?? new URLSearchParams(rawVietMapStyleUrl.split('?')[1] ?? '').get('apikey')
  ?? ''
const vietMapStyleUrl = vietMapApiKey
  ? `https://maps.vietmap.vn/maps/styles/lm/style.json?apikey=${vietMapApiKey}`
  : rawVietMapStyleUrl

type DeliveryAddressFieldsProps = {
  apiBaseUrl: string
  customer: CustomerInfo
  onChange: (customer: CustomerInfo) => void
}

export function DeliveryAddressFields({ apiBaseUrl, customer, onChange }: DeliveryAddressFieldsProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<vietmapgl.Map | null>(null)
  const markerRef = useRef<vietmapgl.Marker | null>(null)
  const customerRef = useRef(customer)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [addressMessage, setAddressMessage] = useState('')
  const [selectedAddressLabel, setSelectedAddressLabel] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapLoadError, setMapLoadError] = useState('')
  const addressLooksLikeCoordinates = useMemo(
    () => /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(customer.address.trim()),
    [customer.address],
  )

  const placeMarker = useCallback((latitude: number, longitude: number) => {
    if (!mapRef.current) {
      return
    }

    if (!markerRef.current) {
      markerRef.current = new vietmapgl.Marker({ color: '#c2410c' })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current)
      return
    }

    markerRef.current.setLngLat([longitude, latitude])
  }, [])

  useEffect(() => {
    customerRef.current = customer
  }, [customer])

  const updateCustomer = (field: keyof CustomerInfo, value: string) => {
    onChange({ ...customerRef.current, [field]: value })
  }

  const updateSelectedLocation = useCallback((
    address: string,
    latitude?: number | null,
    longitude?: number | null,
    addressReferenceId = '',
  ) => {
    onChange({
      ...customerRef.current,
      address,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      addressReferenceId,
    })
    setSelectedAddressLabel(address)
  }, [onChange])

  const updateHiddenCoordinates = useCallback((latitude: number, longitude: number) => {
    const currentCustomer = customerRef.current
    const currentAddressLooksLikeCoordinates = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(currentCustomer.address.trim())

    onChange({
      ...currentCustomer,
      address: currentAddressLooksLikeCoordinates ? '' : currentCustomer.address,
      latitude,
      longitude,
    })
  }, [onChange])

  const updateManualAddress = (value: string) => {
    onChange({
      ...customerRef.current,
      address: value,
      latitude: null,
      longitude: null,
      addressReferenceId: '',
    })
    setSelectedAddressLabel('')
    setShowSuggestions(true)

    if (value.trim().length < 2) {
      setSuggestions([])
      setIsSuggesting(false)
    }
  }

  const applyReverseAddress = useCallback(async (
    latitude: number,
    longitude: number,
    source: 'map' | 'current-location',
  ) => {
    const loadingText = source === 'map'
      ? 'Đang lấy địa chỉ từ bản đồ...'
      : 'Đang lấy địa chỉ từ vị trí hiện tại...'

    setAddressMessage(loadingText)
    placeMarker(latitude, longitude)

    try {
      const suggestion = await reverseAddress(apiBaseUrl, latitude, longitude)
      const nextAddress = suggestion.address.trim()

      if (!nextAddress) {
        throw new Error('Reverse geocoding returned an empty address.')
      }

      updateSelectedLocation(
        nextAddress,
        suggestion.latitude ?? latitude,
        suggestion.longitude ?? longitude,
        suggestion.referenceId ?? '',
      )
      setAddressMessage(source === 'map' ? 'Đã chọn địa chỉ từ bản đồ.' : 'Đã dùng vị trí hiện tại.')
      setSuggestions([])
      setShowSuggestions(false)
    } catch {
      updateHiddenCoordinates(latitude, longitude)
      setAddressMessage('Không lấy được địa chỉ chữ từ vị trí này. Vui lòng nhập địa chỉ giao hàng thủ công, ví dụ: Quận 9, HCM.')
    }
  }, [apiBaseUrl, placeMarker, updateHiddenCoordinates, updateSelectedLocation])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !vietMapStyleUrl) {
      return
    }

    const initialCustomer = customerRef.current
    const map = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: vietMapStyleUrl,
      center: initialCustomer.latitude && initialCustomer.longitude
        ? [initialCustomer.longitude, initialCustomer.latitude]
        : defaultMapCenter,
      zoom: initialCustomer.latitude && initialCustomer.longitude ? 15 : 12,
    })

    map.addControl(new vietmapgl.NavigationControl(), 'top-right')
    map.on('load', () => {
      setIsMapReady(true)
      setMapLoadError('')
      window.setTimeout(() => map.resize(), 0)
    })
    map.on('error', (event) => {
      console.error('VietMap load failed:', event.error ?? event)
      setIsMapReady(false)
      setMapLoadError('Không tải được VietMap. Kiểm tra tile key hoặc cấu hình consumer trên VietMap.')
    })
    map.on('click', (event) => {
      void applyReverseAddress(event.lngLat.lat, event.lngLat.lng, 'map')
    })

    mapRef.current = map

    return () => {
      markerRef.current?.remove()
      map.remove()
      markerRef.current = null
      mapRef.current = null
    }
  }, [applyReverseAddress])

  useEffect(() => {
    if (!customer.latitude || !customer.longitude) {
      return
    }

    placeMarker(customer.latitude, customer.longitude)
    mapRef.current?.flyTo({
      center: [customer.longitude, customer.latitude],
      zoom: 15,
      essential: true,
    })
  }, [customer.latitude, customer.longitude, placeMarker])

  useEffect(() => {
    const query = customer.address.trim()

    if (!showSuggestions || query.length < 2 || addressLooksLikeCoordinates) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setIsSuggesting(true)
      setAddressMessage('')

      try {
        const nextSuggestions = await fetchAddressSuggestions(apiBaseUrl, query, controller.signal)
        setSuggestions(nextSuggestions)
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
          setAddressMessage('Chưa lấy được gợi ý địa chỉ. Lão đại vẫn có thể nhập địa chỉ thủ công.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false)
        }
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [addressLooksLikeCoordinates, apiBaseUrl, customer.address, showSuggestions])

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setAddressMessage('Trình duyệt không hỗ trợ lấy vị trí hiện tại.')
      return
    }

    setIsLocating(true)
    setAddressMessage('Đang lấy vị trí hiện tại...')
    setSuggestions([])
    setShowSuggestions(false)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void applyReverseAddress(
          position.coords.latitude,
          position.coords.longitude,
          'current-location',
        ).finally(() => setIsLocating(false))
      },
      () => {
        setAddressMessage('Không lấy được vị trí hiện tại. Vui lòng cấp quyền vị trí hoặc nhập thủ công.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    const nextAddress = suggestion.address.trim()

    if (!nextAddress) {
      return
    }

    updateSelectedLocation(
      nextAddress,
      suggestion.latitude,
      suggestion.longitude,
      suggestion.referenceId ?? '',
    )
    setSuggestions([])
    setShowSuggestions(false)
    setAddressMessage('Đã chọn địa chỉ gợi ý.')
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
      <div className="address-actions">
        <button type="button" onClick={handleCurrentLocation} disabled={isLocating}>
          {isLocating ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
        </button>
        <small>Nếu không lấy được địa chỉ chữ, hãy nhập thủ công như “Quận 9, HCM”.</small>
      </div>
      <label className="address-field">
        Địa chỉ giao hàng
        <input
          value={addressLooksLikeCoordinates ? '' : customer.address}
          onChange={(event) => updateManualAddress(event.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Ví dụ: Quận 9, HCM"
          autoComplete="street-address"
        />
        <small>Nhập địa chỉ thật dạng chữ để shipper giao đúng nơi.</small>
        {showSuggestions && (suggestions.length > 0 || isSuggesting) ? (
          <div className="address-suggestions" role="listbox">
            {isSuggesting ? <span>Đang tìm gợi ý...</span> : null}
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.referenceId || suggestion.address}-${suggestion.latitude || ''}-${suggestion.longitude || ''}`}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion.address}
              </button>
            ))}
          </div>
        ) : null}
      </label>
      <div className="delivery-map-card">
        <div className="delivery-map-header">
          <strong>Bản đồ giao hàng</strong>
          <span>{selectedAddressLabel ? `Đã chọn: ${selectedAddressLabel}` : 'Click bản đồ để chọn địa chỉ'}</span>
        </div>
        {vietMapStyleUrl ? (
          <div className="delivery-map-shell">
            <div ref={mapContainerRef} className="delivery-map" />
            {!isMapReady || mapLoadError ? (
              <div className="delivery-map-overlay">
                {mapLoadError || 'Đang tải VietMap...'}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="delivery-map delivery-map-empty">
            Thiếu VietMap API key để hiển thị bản đồ. Lão đại vẫn có thể nhập địa chỉ thủ công.
          </div>
        )}
      </div>
      {addressMessage ? <p className="address-status">{addressMessage}</p> : null}
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
