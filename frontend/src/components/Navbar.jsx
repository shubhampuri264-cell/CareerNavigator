import { Link } from 'react-router-dom'
import { TbCompass } from 'react-icons/tb'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-brand-600 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <TbCompass size={24} />
            <span>Career Navigator</span>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900
                         rounded-lg hover:bg-gray-100 transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
