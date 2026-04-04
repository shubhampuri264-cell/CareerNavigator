import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResources } from '../api/resources'
import ResourceCard from '../components/ResourceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import { TbArrowLeft } from 'react-icons/tb'

const ROLE_LABELS = {
  PM:   'Product Management',
  SWE:  'Software Engineering',
  ML:   'Machine Learning',
  Data: 'Data Science',
}

const ROLE_COLORS = {
  PM:   'from-amber-50 to-orange-50 border-amber-200',
  SWE:  'from-blue-50 to-sky-50 border-blue-200',
  ML:   'from-violet-50 to-purple-50 border-violet-200',
  Data: 'from-emerald-50 to-green-50 border-emerald-200',
}

const ROLE_BADGE = {
  PM:   'bg-amber-100 text-amber-700',
  SWE:  'bg-blue-100 text-blue-700',
  ML:   'bg-violet-100 text-violet-700',
  Data: 'bg-emerald-100 text-emerald-700',
}

const VALID_ROLES = ['PM', 'SWE', 'ML', 'Data']

export default function Resources() {
  const { role } = useParams()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isValidRole = VALID_ROLES.includes(role)

  useEffect(() => {
    if (!isValidRole) {
      setLoading(false)
      return
    }
    getResources(role)
      .then(setResources)
      .catch(() => setError('Failed to load resources. Please refresh.'))
      .finally(() => setLoading(false))
  }, [role, isValidRole])

  if (!isValidRole) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-500 text-lg">Invalid role: <strong>{role}</strong></p>
        <p className="text-gray-400 text-sm">Choose from: PM, SWE, ML, Data</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {VALID_ROLES.map(r => (
            <Link key={r} to={`/resources/${r}`} className="btn-secondary text-sm px-4 py-2">{r}</Link>
          ))}
        </div>
      </div>
    )
  }

  if (loading) return <LoadingSpinner message="Loading resources..." />

  const beginner = resources.filter(r => r.difficulty === 'beginner')
  const intermediate = resources.filter(r => r.difficulty === 'intermediate')
  const advanced = resources.filter(r => r.difficulty === 'advanced')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8">

      {/* Header */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors">
          <TbArrowLeft size={16} /> Back to Home
        </Link>
        <div className={`rounded-2xl border bg-gradient-to-br ${ROLE_COLORS[role]} p-6`}>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${ROLE_BADGE[role]}`}>
            {role}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{ROLE_LABELS[role]} Resources</h1>
          <p className="text-gray-500 text-sm mt-1">
            Curated courses, books, and articles to get you hired faster.
          </p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {resources.length === 0 && !error && (
        <p className="text-center text-gray-400 py-12">No resources found for this role.</p>
      )}

      {/* Grouped by difficulty */}
      {[
        { label: 'Beginner', items: beginner },
        { label: 'Intermediate', items: intermediate },
        { label: 'Advanced', items: advanced },
      ].map(({ label, items }) =>
        items.length > 0 ? (
          <section key={label} className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide">{label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        ) : null
      )}

      {/* Other Roles */}
      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4">Also explore:</p>
        <div className="flex gap-3 flex-wrap">
          {VALID_ROLES.filter(r => r !== role).map(r => (
            <Link key={r} to={`/resources/${r}`} className="btn-secondary text-sm px-4 py-2">
              {ROLE_LABELS[r]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
