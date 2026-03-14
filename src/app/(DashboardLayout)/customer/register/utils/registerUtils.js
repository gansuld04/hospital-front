// ─── Pure utility functions — no React dependency ────────────────────────────

export const PROVINCES = [
  'Улаанбаатар', 'Архангай', 'Баян-Өлгий', 'Баянхонгор', 'Булган',
  'Говь-Алтай', 'Говьсүмбэр', 'Дархан-Уул', 'Дорноговь', 'Дорнод',
  'Дундговь', 'Завхан', 'Орхон', 'Өвөрхангай', 'Өмнөговь',
  'Сүхбаатар', 'Сэлэнгэ', 'Төв', 'Увс', 'Ховд', 'Хөвсгөл', 'Хэнтий',
]

export const UB_DISTRICTS = [
  'Баянгол', 'Баянзүрх', 'Сүхбаатар', 'Чингэлтэй',
  'Хан-Уул', 'Сонгинохайрхан', 'Налайх', 'Багануур', 'Багахангай',
]

export const PROVINCE_SOUMS = {
  'Архангай':   ['Эрдэнэбулган', 'Өгийнуур', 'Цэнхэр', 'Өлзийт', 'Хайрхан'],
  'Баян-Өлгий': ['Өлгий', 'Алтай', 'Буянт', 'Ногооннуур', 'Сагсай'],
  'Баянхонгор': ['Баянхонгор', 'Баацагаан', 'Баян-Өндөр', 'Богд', 'Жаргалант'],
  'Булган':     ['Булган', 'Баяннуур', 'Бүрэгхангай', 'Дашинчилэн', 'Хутаг-Өндөр'],
  'Дархан-Уул': ['Дархан', 'Хонгор', 'Орхон', 'Шарын гол'],
  'Сэлэнгэ':   ['Сүхбаатар', 'Алтанбулаг', 'Баруунхараа', 'Ерөө', 'Мандал'],
  'Төв':        ['Зуунмод', 'Алтанбулаг', 'Аргалант', 'Архуст', 'Батсүмбэр'],
  'Орхон':      ['Баян-Өндөр', 'Жаргалант'],
}

export const SCHOOL_OPTIONS = ['ШУТ UB парк', 'УТОУХНУС', 'ИТС', 'МТЭС', 'ШУС', 'ХЗС', 'БС', 'АТС']

// ── Register number decoder ───────────────────────────────────────────────────
export const decodeRegisterNumber = (register) => {
  if (!register || register.length !== 10) return null
  try {
    const yy          = parseInt(register.substring(2, 4), 10)
    const mm          = parseInt(register.substring(4, 6), 10)
    const dd          = parseInt(register.substring(6, 8), 10)
    const genderDigit = parseInt(register.substring(8, 9), 10)

    let year, month
    if (mm > 20) {
      year  = 2000 + yy
      month = mm - 20
    } else {
      year  = 1900 + yy
      month = mm
    }

    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
    const gender     = genderDigit % 2 === 0 ? 'female' : 'male'

    return { birthDate: new Date(dateString), gender }
  } catch {
    return null
  }
}

// ── Address builder ───────────────────────────────────────────────────────────
export const buildAddress = ({ province, district, apartment, street }) =>
  [province, district, apartment, street].filter(Boolean).join(', ')

// ── Form validation ───────────────────────────────────────────────────────────
export const validateRegisterForm = ({ formData, province, district, birthDate, gender }) => {
  const missing = []
  if (!formData.firstName)          missing.push('Нэр')
  if (!formData.lastName)           missing.push('Овог')
  if (!formData.registrationNumber) missing.push('Регистрийн дугаар')
  if (!formData.phone)              missing.push('Утас')
  if (!formData.email)              missing.push('Цахим шуудан')
  if (!formData.password)           missing.push('Нууц үг')
  if (!province)                    missing.push('Хот / Аймаг')
  if (!district)                    missing.push('Сум / Дүүрэг')
  if (!birthDate)                   missing.push('Төрсөн он/сар/өдөр')
  if (!gender)                      missing.push('Хүйс')
  return missing.length ? missing : null
}

// ── Payload builder ───────────────────────────────────────────────────────────
export const buildPayload = ({ formData, province, district, birthDate, gender, userType }) => ({
  lastname:    formData.lastName,
  firstname:   formData.firstName,
  register:    formData.registrationNumber,
  occupation:  formData.profession,
  school:      formData.school,
  phoneNumber: formData.phone,
  notes:       formData.notes,
  email:       formData.email,
  password:    formData.password,
  birthOfDate: birthDate ? birthDate.toISOString().split('T')[0] : null,
  gender,
  type:        userType,
  address:     buildAddress({ province, district, apartment: formData.apartment, street: formData.street }),
})

// ── Districts by province ─────────────────────────────────────────────────────
export const getDistricts = (province) => {
  if (!province)                  return []
  if (province === 'Улаанбаатар') return UB_DISTRICTS
  return PROVINCE_SOUMS[province] || []
}