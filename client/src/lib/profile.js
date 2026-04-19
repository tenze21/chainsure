const REQUIRED_PROFILE_FIELDS = [
  { key: 'cid', label: 'CID' },
  { key: 'occupation', label: 'occupation' },
  { key: 'dob', label: 'date of birth' },
  { key: 'gender', label: 'gender' },
  { key: 'contactNumber', label: 'contact number' },
  { key: 'maritalStatus', label: 'marital status' },
  { key: 'address', label: 'address' },
]

const PROFILE_UPDATE_FIELDS = [
  'fullName',
  'cid',
  'contactNumber',
  'dob',
  'gender',
  'maritalStatus',
  'occupation',
  'address',
]

const GENDER_VALUES = new Set(['male', 'female', 'other'])
const MARITAL_STATUS_VALUES = new Set(['single', 'married', 'divorced', 'widowed'])

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase()
}

function normalizeDigits(value) {
  return normalizeString(value).replace(/\D/g, '')
}

function normalizeEnum(value, allowedValues) {
  const normalizedValue = normalizeString(value).toLowerCase()
  return allowedValues.has(normalizedValue) ? normalizedValue : ''
}

function normalizeDateValue(value) {
  const normalizedValue = normalizeString(value)

  if (!normalizedValue) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(normalizedValue)) {
    return normalizedValue.slice(0, 10)
  }

  const slashMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalizedValue)

  if (slashMatch) {
    const [, first, second, year] = slashMatch
    const firstPart = Number(first)
    const secondPart = Number(second)

    if (firstPart > 12) {
      return `${year}-${second}-${first}`
    }

    if (secondPart > 12) {
      return `${year}-${first}-${second}`
    }
  }

  const parsedDate = new Date(normalizedValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toISOString().slice(0, 10)
}

export function normalizeProfileFieldValue(field, value) {
  switch (field) {
    case 'fullName':
    case 'occupation':
    case 'address':
    case 'cid':
      return normalizeString(value)
    case 'email':
      return normalizeEmail(value)
    case 'contactNumber':
      return normalizeDigits(value)
    case 'dob':
      return normalizeDateValue(value)
    case 'gender':
      return normalizeEnum(value, GENDER_VALUES)
    case 'maritalStatus':
      return normalizeEnum(value, MARITAL_STATUS_VALUES)
    default:
      return value
  }
}

export function buildProfileFormState(user) {
  return {
    fullName: normalizeProfileFieldValue('fullName', user?.fullName || user?.full_name),
    cid: normalizeProfileFieldValue('cid', user?.cid),
    email: normalizeProfileFieldValue('email', user?.email),
    contactNumber: normalizeProfileFieldValue('contactNumber', user?.contactNumber || user?.contact_number),
    dob: normalizeProfileFieldValue('dob', user?.dob),
    gender: normalizeProfileFieldValue('gender', user?.gender),
    maritalStatus: normalizeProfileFieldValue('maritalStatus', user?.maritalStatus || user?.marital_status),
    occupation: normalizeProfileFieldValue('occupation', user?.occupation),
    address: normalizeProfileFieldValue('address', user?.address),
  }
}

export function buildProfileUpdatePayload(form, initialForm = {}) {
  const payload = {}

  PROFILE_UPDATE_FIELDS.forEach((field) => {
    const normalizedValue = normalizeProfileFieldValue(field, form?.[field])
    const initialValue = normalizeProfileFieldValue(field, initialForm?.[field])

    if (normalizedValue && normalizedValue !== initialValue) {
      payload[field] = normalizedValue
    }
  })

  return payload
}

export function getMissingProfileFields(user) {
  return REQUIRED_PROFILE_FIELDS
    .filter((field) => !normalizeProfileFieldValue(field.key, user?.[field.key]))
    .map((field) => field.label)
}

export function isProfileReady(user) {
  return getMissingProfileFields(user).length === 0
}
