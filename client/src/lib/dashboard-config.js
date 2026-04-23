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
      route: 'proposal-health',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_LIFE),
      templateMatchers: ['life', 'health', 'critical illness'],
      fallbackName: 'Health Insurance',
      fallbackFeatures: [
        'Health protection coverage options',
        'Recurring payment support',
        'Best fit for personal health plans',
      ],
    },
    {
      key: 'travel',
      route: 'proposal-property',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_TRAVEL),
      templateMatchers: ['property', 'home', 'landlord', 'premises', 'rental'],
      fallbackName: 'Property Insurance',
      fallbackFeatures: [
        'Property and asset coverage options',
        'Protection for home and rental scenarios',
        'Comprehensive premises risk support',
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
