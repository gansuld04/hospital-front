'use client'
import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/(DashboardLayout)/context/authContext'
import { validateRegisterForm, buildPayload } from '../utils/registerUtils'

const INITIAL_FORM = {
  lastName: '', firstName: '', registrationNumber: '',
  profession: '', school: '', apartment: '', street: '',
  phone: '', notes: '', email: '', password: '',
}

// ─── useRegisterForm ──────────────────────────────────────────────────────────
export function useRegisterForm() {
  const router        = useRouter()
  const { register }  = useAuth()

  const [formData,           setFormData]           = useState(INITIAL_FORM)
  const [isLoading,          setIsLoading]          = useState(false)
  const [openConfirmDialog,  setOpenConfirmDialog]  = useState(false)
  const [openSuccessDialog,  setOpenSuccessDialog]  = useState(false)

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  // Opens confirm dialog after basic check
  const handleSave = useCallback(({ province, district, birthDate, gender }) => {
    const missing = validateRegisterForm({ formData, province, district, birthDate, gender })
    if (missing) {
      alert(`Дараах талбаруудыг бөглөнө үү: ${missing.join(', ')}`)
      return
    }
    setOpenConfirmDialog(true)
  }, [formData])

  // Actual API call
  const confirmSave = useCallback(async ({ province, district, birthDate, gender, userType }) => {
    const payload = buildPayload({ formData, province, district, birthDate, gender, userType })

    try {
      setIsLoading(true)
      const result = await register(payload)

      if (result?.success) {
        toast.success('Амжилттай хадгалагдлаа!', {
          position: 'top-center', autoClose: 2000,
        })
        setOpenConfirmDialog(false)
        setTimeout(() => setOpenSuccessDialog(true), 2500)
      } else {
        toast.error(result?.error || 'Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.', {
          position: 'top-center', autoClose: 3000,
        })
      }
    } catch (err) {
      console.error('Registration error:', err)
      toast.error('Серверийн алдаа гарлаа. Та дахин оролдоно уу.', {
        position: 'top-center', autoClose: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, register])

  const goToCustomer    = useCallback(() => router.push('/customer'),    [router])
  const goToExamination = useCallback(() => router.push('/examination'), [router])
  const goBack          = useCallback(() => router.push('/customer'),    [router])

  return {
    formData,
    isLoading,
    openConfirmDialog,
    openSuccessDialog,
    handleFormChange,
    handleSave,
    confirmSave,
    setOpenConfirmDialog,
    goToCustomer,
    goToExamination,
    goBack,
  }
}