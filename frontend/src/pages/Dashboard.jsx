import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { getUserAssessments } from '../api/assessments'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import { TbChartBar, TbArrowRight, TbClipboardList } from 'react-icons/tb'

const ROLE_COLORS = {
  PM:   'bg-amber-100 text-amber-700',
  SWE:  'bg-blue-100 text-blue-700',
  ML:   'bg-violet-100 text-violet-700',
  Data: 'bg-emerald-100 text-emerald-700',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const { user } = useAuthContext()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    getUserAssessments(user.id)
      .then(setAssessments)
      .catch(() => setError('Failed to load your assessments. Please refresh.'))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />

  const completed = assessments.filter(a => a.status === 'completed')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {user?.user_metadata?.full_name && `Welcome back, ${user.user_metadata.full_name.split(' ')[0]}. `}
            Track your assessments and confidence over time.
          </p>
        </div>
        <Link to="/assessment" className="btn-primary flex items-center gap-2">
          New Assessment <TbArrowRight size={16} />
        </Link>
      </div>

      <ErrorBanner message={error} />

      {/* Stats */}
      {completed.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-brand-600">{completed.length}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-brand-600">
              {completed[0]?.recommended_role ?? '—'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Latest Role</p>
          </div>
          <div className="card text-center col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold text-brand-600">
              {completed[0]?.pre_confidence ?? '—'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Latest Pre-Confidence</p>
          </div>
        </div>
      )}

      {/* Assessment List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TbClipboardList size={20} className="text-gray-400" />
          Assessment History
        </h2>

        {assessments.length === 0 ? (
          <div className="card text-center py-16 space-y-4">
            <TbChartBar size={40} className="text-gray-300 mx-auto" />
            <p className="text-gray-500 font-medium">No assessments yet.</p>
            <p className="text-gray-400 text-sm">Take your first assessment to see your results here.</p>
            <Link to="/assessment" className="btn-primary inline-flex">
              Take Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map(assessment => (
              <div
                key={assessment.id}
                className="card flex items-center justify-between gap-4 flex-wrap hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {assessment.recommended_role ? (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${ROLE_COLORS[assessment.recommended_role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {assessment.recommended_role}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                      In Progress
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {assessment.recommended_role
                        ? `Recommended: ${assessment.recommended_role}`
                        : 'Assessment not completed'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(assessment.created_at)}
                      {assessment.scores && ` · Pre-confidence: ${assessment.pre_confidence}/10`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {assessment.scores && (
                    <div className="hidden sm:flex gap-2">
                      {['PM', 'SWE', 'ML', 'Data'].map(r => (
                        <span key={r} className="text-xs text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                          {r}: {assessment.scores[r]}%
                        </span>
                      ))}
                    </div>
                  )}
                  {assessment.status === 'completed' ? (
                    <Link
                      to={`/results/${assessment.id}`}
                      className="btn-secondary text-sm px-4 py-2"
                    >
                      View Results
                    </Link>
                  ) : (
                    <Link
                      to="/assessment"
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Continue
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
