import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getTemplates } from '../lib/api'
import { loadStoredUser } from '../lib/session'

export default function HomePage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templatesError, setTemplatesError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)

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

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSelectedProduct(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const selectedProductConfig = products.find((product) => product.title === selectedProduct?.title) || null
  const selectedTemplates = templates.filter(
    (template) => template?.category?.name?.toLowerCase() === selectedProductConfig?.categoryName?.toLowerCase(),
  )
  const isModalOpen = Boolean(selectedProduct)
  const isAuthenticated = Boolean(loadStoredUser()?.email || loadStoredUser()?.id)

  function openPoliciesModal(product) {
    setSelectedProduct(product)
  }

  function closePoliciesModal() {
    setSelectedProduct(null)
  }

  function handlePurchasePolicy(templateId) {
    if (!isAuthenticated) {
      navigate('/signin')
      return
    }

    navigate(`/dashboard/marketplace?templateId=${encodeURIComponent(templateId)}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="pt-32 pb-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">Powered by Ethereum Blockchain</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Insurance You Can <span className="text-teal-500">Truly Verify</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Your policies, tokenized as NFTs on the blockchain. Immutable proof of coverage, instant verification, and a familiar experience. No crypto knowledge needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-semibold text-lg">
                Create Your Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link to="/browse-policies" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-lg">
                Browse Policies
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How ChainSure Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get blockchain-backed insurance in three simple steps. No crypto expertise required.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: '01', title: 'Pay with Fiat', desc: 'Use your credit card to purchase coverage. The blockchain works seamlessly in the background through Stripe integration.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                { n: '02', title: 'Secure Wallet Created', desc: 'A managed Ethereum wallet is automatically created for you. No seed phrases or complex setup required.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { n: '03', title: 'NFT Policy Minted', desc: 'Your policy is hashed and minted as an ERC-721 NFT. Own your coverage with immutable proof on the blockchain.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              ].map((step) => (
                <div key={step.n} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-teal-500 font-bold text-2xl mb-4 block">{step.n}</span>
                  <svg className="w-12 h-12 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Insurance Products</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our range of blockchain-verified insurance policies. All policies are minted as NFTs for permanent verification.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className={`rounded-xl p-8 border-2 transition-all relative ${product.popular ? 'border-teal-500 shadow-lg bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {product.popular && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-teal-500 text-white text-sm font-medium rounded-full">
                      Popular
                    </span>
                  )}
                  <svg className="w-12 h-12 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={product.icon} />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{product.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => openPoliciesModal(product)}
                    className={`inline-flex items-center justify-center w-full py-3 rounded-lg font-medium transition-colors ${product.popular ? 'bg-[#0f1729] text-white hover:bg-[#1e293b]' : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300'}`}
                  >
                    View Policies
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="verify" className="py-20 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Verify a Policy</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Instantly validate NFT-backed coverage. Enter a policy ID or wallet address to view verification status.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm text-gray-600">Policy ID or Wallet Address</label>
                  <input
                    type="text"
                    placeholder="e.g., POL-1042 or 0x1234...abcd"
                    className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                  />
                </div>
                <button disabled className="w-full md:w-auto px-6 py-3 bg-slate-300 text-slate-600 rounded-lg font-medium cursor-not-allowed">
                  Verify Policy
                </button>
              </div>
              <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                Public policy verification is not available yet.
              </p>
              <div className="mt-6 grid gap-4 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Status', value: 'Pending verification' },
                  { label: 'Network', value: 'Ethereum Mainnet' },
                  { label: 'Last Updated', value: 'Just now' },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-500">{item.label}</div>
                    <div className="font-medium text-gray-900 mt-1">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built on Trust</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our hybrid Web 2.5 architecture combines the best of traditional web and blockchain technology.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Ethereum Blockchain', desc: 'ERC-721 NFTs for immutable policy ownership.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { title: 'Secure Services', desc: 'Protected services for payments and policy issuance.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'IPFS (Pinata)', desc: 'Decentralized storage for policy documents.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { title: 'Postgres Database', desc: 'Secure storage for user data and keystores.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-200">
                  <svg className="w-10 h-10 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-[#0f1729]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Secure Your Future?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of users who have secured their coverage on the blockchain. Get started in minutes with no crypto knowledge required.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0f1729] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
              Get Started Free
            </Link>
            <div className="mt-6">
              <a href="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">Admin Portal</a>
            </div>
          </div>
        </section>
      </main>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60"
          onClick={closePoliciesModal}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl border border-gray-200 shadow-xl max-h-[85vh] overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {selectedProduct?.title} Policies
                </h3>
                <p className="mt-1 text-gray-600">
                  Select a policy template to continue with purchase.
                </p>
              </div>
              <button
                type="button"
                onClick={closePoliciesModal}
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-170px)]">
              {templatesLoading && (
                <p className="text-gray-600">Loading policy templates...</p>
              )}

              {!templatesLoading && templatesError && (
                <p className="text-red-600">{templatesError}</p>
              )}

              {!templatesLoading && !templatesError && selectedTemplates.length === 0 && (
                <p className="text-gray-600">No templates found for this product yet.</p>
              )}

              {!templatesLoading && !templatesError && selectedTemplates.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedTemplates.map((template) => (
                    <div key={template.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h4 className="text-gray-900 font-semibold">{template.name}</h4>
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

            {!isAuthenticated && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-gray-600">
                  You need an account to purchase a policy.
                </p>
                <div className="flex items-center gap-3">
                  <Link to="/signin" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white">
                    Sign In
                  </Link>
                  <Link to="/signup" className="px-4 py-2 bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b]">
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
