function normalizeTemplateId(value) {
  if (typeof value !== 'string') {
    return null
  }

  const templateId = value.trim()

  if (!templateId || templateId.startsWith('<')) {
    return null
  }

  return templateId
}

export function getDashboardProducts() {
  return [
    {
      key: 'life',
      route: 'proposal-life',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_LIFE),
      templateMatchers: ['life', 'health', 'critical illness'],
      fallbackName: 'Life Insurance',
      fallbackFeatures: [
        'Health and life coverage options',
        'Recurring payment support',
        'Best fit for personal protection plans',
      ],
    },
    {
      key: 'travel',
      route: 'proposal-travel',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_TRAVEL),
      templateMatchers: ['travel', 'trip'],
      fallbackName: 'Travel Insurance',
      fallbackFeatures: [
        'Travel coverage for registered customers',
        'Trip and destination details required',
        'Application setup is not available yet',
      ],
    },
    {
      key: 'motor',
      route: 'proposal-motor',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_MOTOR),
      templateMatchers: ['motor', 'vehicle', 'auto', 'car'],
      fallbackName: 'Motor Insurance',
      fallbackFeatures: [
        'Vehicle insurance application',
        'Recurring payment support',
        'Best fit for vehicle coverage plans',
      ],
    },
  ]
}
