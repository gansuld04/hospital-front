// ─── Utility functions ────────────────────────────────────────────────────────

export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(
      dateString.includes('/') ? dateString.replace(/\//g, '-') : dateString
    )
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export const calculateAge = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const today     = new Date()
    const birthDate = new Date(
      dateString.includes('/') ? dateString.replace(/\//g, '-') : dateString
    )
    if (isNaN(birthDate.getTime())) return 'N/A'

    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  } catch {
    return 'N/A'
  }
}

export const mapPatientType = (type) => {
  const typeMap = {
    Patient: 'Үйлчлүүлэгч',
    Student: 'Оюутан',
    Teacher: 'Багш',
    Staff:   'Ажилтан',
  }
  return typeMap[type] || type
}

export const reverseMappedType = (mongolianType) => {
  const reverseMap = {
    'Оюутан': 'Student',
    'Багш':   'Teacher',
    'Ажилтан':'Staff',
  }
  return reverseMap[mongolianType] || 'Patient'
}

export const getNameParts = (fullName) => {
  const parts = fullName.trim().split(' ')
  if (parts.length >= 2) {
    return { lastName: parts[0], firstName: parts.slice(1).join(' ') }
  }
  return { lastName: '', firstName: fullName }
}

export const transformPatient = (patient) => ({
  id:        patient._id || patient.id,
  name:      `${patient.lastname} ${patient.firstname}`,
  birthDate: formatDate(patient.birthOfDate),
  age:       calculateAge(patient.birthOfDate),
  type:      mapPatientType(patient.type),
  address:   patient.address     || 'N/A',
  phone:     patient.phoneNumber || 'N/A',
})