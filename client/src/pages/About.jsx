import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="pt-32 pb-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block px-4 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 mb-6">About ChainSure</span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              A Modern Insurance Platform Built for Trust
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              ChainSure combines traditional insurance workflows with blockchain verification.
              Policies are easy to buy, simple to verify, and secure by design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-semibold">
                Create Your Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link to="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold">
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                We make insurance transparent and verifiable without adding complexity for users.
                Every policy is recorded as a tamper proof NFT while the experience remains familiar.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Policies Verified', value: '12,400+' },
                  { label: 'Claims Reviewed', value: '4,200+' },
                  { label: 'Avg. Verification', value: 'Instant' },
                  { label: 'Customer Rating', value: '4.8/5' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What Makes Us Different</h3>
              <div className="space-y-4">
                {[
                  { title: 'Instant Verification', desc: 'Any policy can be verified in seconds with immutable proof.' },
                  { title: 'Secure Wallets', desc: 'Managed wallets with encrypted private keys. No seed phrases needed.' },
                  { title: 'Hybrid Architecture', desc: 'Fiat payments and familiar UX backed by blockchain integrity.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built on Reliable Infrastructure</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We use a proven stack so policies are secure, traceable, and easy to manage.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Ethereum Proof', desc: 'Policies are hashed and minted for immutable verification.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { title: 'Stripe Payments', desc: 'Card payments with secure compliance and instant receipts.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                { title: 'Postgres Core', desc: 'Reliable relational storage for users, roles, and policies.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { title: 'Secure Keys', desc: 'Encrypted private keys with AES-GCM and layered hashing.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              ].map((t) => (
                <div key={t.title} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <svg className="w-10 h-10 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title}</h3>
                  <p className="text-gray-600 text-sm">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A simple roadmap focused on trust, transparency, and adoption.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Launch', desc: 'Core insurance workflows and admin tooling go live.' },
                { step: '02', title: 'Scale', desc: 'More policy categories and automated claim reviews.' },
                { step: '03', title: 'Ecosystem', desc: 'Partner integrations with regulators and insurers.' },
              ].map((item) => (
                <div key={item.step} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-teal-500 font-bold text-xl mb-3">{item.step}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-[#0f1729]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Build Trust With Every Policy</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join ChainSure and experience insurance built for transparency and confidence.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0f1729] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
