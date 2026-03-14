'use client'
import { useState, useEffect } from 'react'
import { decodeRegisterNumber } from '../utils/registerUtils'

// ─── useRegisterDecoder ───────────────────────────────────────────────────────
// Регистрийн дугаараас төрсөн огноо болон хүйсийг автоматаар тодорхойлно
export function useRegisterDecoder(registrationNumber) {
  const [birthDate, setBirthDate] = useState(null)
  const [gender,    setGender]    = useState('')

  useEffect(() => {
    if (registrationNumber?.length === 10) {
      const decoded = decodeRegisterNumber(registrationNumber)
      if (decoded) {
        setBirthDate(decoded.birthDate)
        setGender(decoded.gender)
      }
    }
  }, [registrationNumber])

  return {
    birthDate,
    gender,
    setBirthDate,  // DatePicker-ээс гараар өөрчлөх боломжтой
    setGender,     // Select-ээс гараар өөрчлөх боломжтой
  }
}