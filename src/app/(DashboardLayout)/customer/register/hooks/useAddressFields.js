'use client'
import { useState, useEffect, useCallback } from 'react'
import { getDistricts } from '../utils/registerUtils'

// ─── useAddressFields ─────────────────────────────────────────────────────────
export function useAddressFields() {
  const [province,           setProvince]           = useState('')
  const [district,           setDistrict]           = useState('')
  const [availableDistricts, setAvailableDistricts] = useState([])

  useEffect(() => {
    setAvailableDistricts(getDistricts(province))
    setDistrict('')
  }, [province])

  const handleProvinceChange = useCallback((e) => setProvince(e.target.value), [])
  const handleDistrictChange = useCallback((e) => setDistrict(e.target.value), [])

  return {
    province,
    district,
    availableDistricts,
    handleProvinceChange,
    handleDistrictChange,
  }
}