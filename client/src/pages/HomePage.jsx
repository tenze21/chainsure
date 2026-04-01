import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <a href="#products" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-lg">Browse Policies</a>
            </div>
          </div>
        </section>

        {/* How ChainSure Works */}
        <section id="how-it-works" className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How ChainSure Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get blockchain-backed insurance in three simple steps. No crypto expertise required.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: '01', title: 'Pay with Fiat', desc: 'Use your credit card to purchase coverage. The blockchain works seamlessly in the background through Stripe integration.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                { n: '02', title: 'Secure Wallet Created', desc: 'A managed Ethereum wallet is automatically created for you. No seed phrases or complex setup required.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { n: '03', title: 'NFT Policy Minted', desc: 'Your policy is hashed and minted as an ERC-721 NFT. Own your coverage with immutable proof on the blockchain.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
              ].map((s) => (
                <div key={s.n} className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-teal-500 font-bold text-2xl mb-4 block">{s.n}</span>
                  <svg className="w-12 h-12 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Products */}
        <section id="products" className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Insurance Products</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose from our range of blockchain-verified insurance policies. All policies are minted as NFTs for permanent verification.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { id: 1, title: 'Life Insurance', features: ['Family protection', 'Tax benefits', 'Cash value growth', 'Flexible terms'], popular: false, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                { id: 2, title: 'Travel Insurance', features: ['Trip cancellation', 'Medical coverage', 'Lost luggage', '24/7 assistance'], popular: true, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12v2.945a2 2 0 01-.055 4.055M12 12V9.5A2.5 2.5 0 109.5 12' },
                { id: 3, title: 'Motor Insurance', features: ['Third-party liability', 'Comprehensive coverage', 'Instant claims', 'No-claims bonus'], popular: false, icon: 'M8 17h8m-8 0a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2zm0 0h2m-2 0v-4m0 4v4m0-4h6m-6 0v-4m0 4v4' }
              ].map((p) => (
                <div key={p.id} className={`rounded-xl p-8 border-2 transition-all relative ${p.popular ? 'border-teal-500 shadow-lg bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {p.popular && <span className="absolute top-4 right-4 px-3 py-1 bg-teal-500 text-white text-sm font-medium rounded-full">Popular</span>}
                  <svg className="w-12 h-12 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.icon} /></svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{p.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className={`inline-flex items-center justify-center w-full py-3 rounded-lg font-medium transition-colors ${p.popular ? 'bg-[#0f1729] text-white hover:bg-[#1e293b]' : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300'}`}>View Details</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built on Trust */}
        <section id="verify" className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built on Trust</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our hybrid Web 2.5 architecture combines the best of traditional web and blockchain technology.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Ethereum Blockchain', desc: 'ERC-721 NFTs for immutable policy ownership.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { title: 'Node.js Server', desc: 'Express backend handling webhooks and minting.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'IPFS (Pinata)', desc: 'Decentralized storage for policy documents.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { title: 'Postgres Database', desc: 'Secure storage for user data and keystores.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
              ].map((t) => (
                <div key={t.title} className="bg-white rounded-xl p-6 border border-gray-200">
                  <svg className="w-10 h-10 text-teal-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title}</h3>
                  <p className="text-gray-600 text-sm">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="about" className="py-20 px-6 bg-[#0f1729]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Secure Your Future?</h2>
            <p className="text-gray-400 text-lg mb-8">Join thousands of users who have secured their coverage on the blockchain. Get started in minutes with no crypto knowledge required.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[#0f1729] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg">Get Started Free</Link>
            <div className="mt-6"><a href="/admin" className="text-gray-400 hover:text-white transition-colors text-sm">Admin Portal</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
