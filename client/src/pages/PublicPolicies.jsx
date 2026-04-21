import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getTemplates } from '../lib/api'
import { loadStoredUser } from '../lib/session'

export default function PublicPolicies() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')
  const [activeProductId, setActiveProductId] = useState(1)

  const products = useMemo(() => ([
    {
      id: 1,
      title: 'Health Insurance',
      categoryName: 'Health Insurance',
      features: ['Family protection', 'Tax benefits', 'Cash value growth', 'Flexible terms'],
      popular: false,
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
    {
      id: 2,
      title: 'Property Insurance',
      categoryName: 'Property Insurance',
      features: ['Fire & damage coverage', 'Theft protection', 'Natural disaster coverage', '24/7 assistance'],
      popular: true,
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12v2.945a2 2 0 01-.055 4.055M12 12V9.5A2.5 2.5 0 109.5 12',
    },
    {
      id: 3,
      title: 'Motor Insurance',
      categoryName: 'Vehicle Insurance',
      features: ['Third-party liability', 'Comprehensive coverage', 'Instant claims', 'No-claims bonus'],
      popular: false,
      icon: 'M8 17h8m-8 0a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2zm0 0h2m-2 0v-4m0 4v4m0-4h6m-6 0v-4m0 4v4',
    },
  ]), [])

  useEffect(() => {
    let active = true

    async function loadTemplates() {
      try {
        const response = await getTemplates()
        if (!active) {
          return
        }
        setTemplates(response?.data?.templates || [])
        setTemplatesError('')
      } catch (error) {
        if (!active) {
          return
        }
        setTemplates([])
        setTemplatesError(error?.message || 'Failed to load policy templates.')
      } finally {
        if (active) {
          setTemplatesLoading(false)
        }
      }
    }

    loadTemplates()

    return () => {
      active = false
    }
  }, [])

  const activeProduct = products.find((product) => product.id === activeProductId) || products[0]
  const activeProductTemplates = templates.filter(
    (template) => template?.category?.name?.toLowerCase() === activeProduct?.categoryName?.toLowerCase(),
  )
  const storedUser = loadStoredUser()
  const isAuthenticated = Boolean(storedUser?.email || storedUser?.id)

  function handlePurchasePolicy(templateId) {
    if (!isAuthenticated) {
      navigate('/signin')
      return
    }
    navigate(`/dashboard/marketplace?templateId=${encodeURIComponent(templateId)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <section className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Policy Templates</h1>
            <p className="mt-2 text-amber-900">
              Disclaimer: You can view all products and policy templates here, but you must sign in or sign up before purchasing any policy.
            </p>
          </section>

          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Insurance Products</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Click View Policies on any product to see its backend policy templates.
              </p>
            </div>
            <div className="mb-6 overflow-x-auto">
              <div className="inline-flex min-w-full sm:min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
                {products.map((product) => {
                  const isActive = activeProduct?.id === product.id
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setActiveProductId(product.id)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'bg-white text-[#0f1729] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {product.title}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {activeProduct?.title} Policy Templates
              </h4>

              {templatesLoading && <p className="text-gray-600">Loading policy templates...</p>}
              {!templatesLoading && templatesError && <p className="text-red-600">{templatesError}</p>}
              {!templatesLoading && !templatesError && activeProductTemplates.length === 0 && (
                <p className="text-gray-600">No templates found for this product yet.</p>
              )}

              {!templatesLoading && !templatesError && activeProductTemplates.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {activeProductTemplates.map((template) => (
                    <div key={template.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <h5 className="text-gray-900 font-semibold">{template.name}</h5>
                      <p className="mt-2 text-sm text-gray-600">{template.description}</p>
                      <button
                        type="button"
                        onClick={() => handlePurchasePolicy(template.id)}
                        className="mt-4 inline-flex items-center justify-center w-full py-2.5 bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium"
                      >
                        Purchase Policy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
