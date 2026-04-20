const REQUIRED_PROFILE_FIELDS = [
  { key: 'cid', label: 'CID' },
  { key: 'occupation', label: 'occupation' },
  { key: 'dob', label: 'date of birth' },
  { key: 'gender', label: 'gender' },
  { key: 'contactNumber', label: 'contact number' },
  { key: 'maritalStatus', label: 'marital status' },
  { key: 'address', label: 'address' },
]

function hasValue(value) {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return Boolean(value.trim())
  }

  return true
}

export function getMissingProfileFields(user) {
  return REQUIRED_PROFILE_FIELDS
    .filter((field) => !hasValue(user?.[field.key]))
    .map((field) => field.label)
}

export function isProfileReady(user) {
  return getMissingProfileFields(user).length === 0
}
