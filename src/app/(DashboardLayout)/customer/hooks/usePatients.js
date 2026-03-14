'use client'
import { useState, useEffect, useCallback } from 'react'
import patientService from '@/app/service/patientService'
import { transformPatient, getNameParts, reverseMappedType } from '../utils/patientUtils'

// ─── usePatients hook ─────────────────────────────────────────────────────────
export function usePatients() {
  const [patients,  setPatients]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [snackbar,  setSnackbar]  = useState({ open: false, message: '', severity: 'success' })

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }, [])

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }, [])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await patientService.getAllPatients()
      setPatients(response.patients.map(transformPatient))
    } catch (err) {
      console.error('Fetch error:', err)
      const msg = 'Үйлчлүүлэгчдийн мэдээлэл татахад алдаа гарлаа'
      setError(msg)
      showSnackbar(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [showSnackbar])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  // ── Update ─────────────────────────────────────────────────────────────────
  const updatePatient = useCallback(async (id, formData, selectedPatient) => {
    if (!id) throw new Error('Patient ID is required for update')

    const nameParts = getNameParts(formData.name)

    const payload = {
      firstname:   nameParts.firstName,
      lastname:    nameParts.lastName,
      phoneNumber: formData.phone,
      address:     formData.address,
      type:        reverseMappedType(formData.type),
      birthOfDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
      ...(selectedPatient?.gender   && { gender:   selectedPatient.gender }),
      ...(selectedPatient?.school   && { school:   selectedPatient.school }),
      ...(selectedPatient?.register && { register: selectedPatient.register }),
    }

    await patientService.updatePatient(id, payload)

    setPatients(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, name: formData.name, birthDate: formData.birthDate,
                     age:  formData.age,  type:      formData.type,
                     address: formData.address, phone: formData.phone }
          : p
      )
    )
    showSnackbar('Үйлчлүүлэгчийн мэдээлэл амжилттай шинэчлэгдлээ')
  }, [showSnackbar])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deletePatient = useCallback(async (id) => {
    if (!id) throw new Error('Patient ID is missing - cannot delete')
    await patientService.deletePatient(id)
    setPatients(prev => prev.filter(p => p.id !== id))
    showSnackbar('Үйлчлүүлэгч амжилттай устгагдлаа')
  }, [showSnackbar])

  return {
    patients,
    loading,
    error,
    snackbar,
    closeSnackbar,
    showSnackbar,
    updatePatient,
    deletePatient,
    refetch: fetchPatients,
  }
}