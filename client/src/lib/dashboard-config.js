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
      templateMatchers: ['life', 'health', 'critical illness', 'medical', 'care'],
      fallbackName: 'Life Insurance',
      fallbackFeatures: [
        'Uses the life proposal form in this dashboard',
        'Connect with VITE_TEMPLATE_ID_LIFE',
        'Best fit for health or life-style underwriting flows',
      ],
    },
    {
      key: 'travel',
      route: 'proposal-travel',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_TRAVEL),
      templateMatchers: ['travel', 'trip', 'holiday', 'vacation', 'journey'],
      fallbackName: 'Travel Insurance',
      fallbackFeatures: [
        'Uses the travel proposal form in this dashboard',
        'Connect with VITE_TEMPLATE_ID_TRAVEL',
        'Requires a matching backend template ID',
      ],
    },
    {
      key: 'motor',
      route: 'proposal-motor',
      templateId: normalizeTemplateId(import.meta.env.VITE_TEMPLATE_ID_MOTOR),
      templateMatchers: ['motor', 'vehicle', 'auto', 'car', 'bike', 'transport'],
      fallbackName: 'Motor Insurance',
      fallbackFeatures: [
        'Uses the motor proposal form in this dashboard',
        'Connect with VITE_TEMPLATE_ID_MOTOR',
        'Best fit for vehicle underwriting flows',
      ],
    },
  ]
}
