import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-500">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="font-semibold text-xl text-gray-900">ChainSure</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/#products" className="text-gray-600 hover:text-gray-900 transition-colors">Products</Link>
          <Link to="/#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</Link>
          <Link to="/#verify" className="text-gray-600 hover:text-gray-900 transition-colors">Verify Policy</Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
          <Link to="/signup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f1729] text-white rounded-lg hover:bg-[#1e293b] transition-colors font-medium">
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}
