export default function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-500">
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
          </svg>
          <span className="font-semibold text-gray-900">ChainSure</span>
        </a>
        <p className="text-sm text-gray-500 text-center">
          PU-303, Spring 2025 - Outstanding College of Information Technology, RUB.
        </p>
        <div className="flex gap-6">
          <a href="#verify" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Privacy</a>
          <a href="#about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Terms</a>
          <a href="mailto:support@chainsure.local" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
