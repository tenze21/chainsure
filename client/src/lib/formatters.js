export function formatCurrency(value, currency = 'Nu.') {
  if (value === null || value === undefined || value === '') {
    return 'Unavailable'
  }

  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return String(value)
  }

  const digits = Number.isInteger(amount) ? 0 : 2

  return `${currency} ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(amount)}`
}

export function formatDate(value, options = {}) {
  if (!value) {
    return 'Unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function titleCase(value) {
  if (!value) {
    return ''
  }

  return String(value)
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function formatPaymentType(template) {
  if (!template) {
    return 'Template not connected'
  }

  if (template.paymentType === 'recurring') {
    if (template.billingCycle) {
      return `${titleCase(template.billingCycle)} recurring payment`
    }

    return 'Recurring payment'
  }

  return 'One-time payment'
}
