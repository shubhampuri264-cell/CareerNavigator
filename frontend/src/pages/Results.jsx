import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { getAssessment } from '../api/assessments'
import { submitFeedback } from '../api/feedback'
import api from '../api/axiosInstance'
import ScoreCard from '../components/ScoreCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import {
  TbArrowRight, TbSparkles, TbMedal, TbTrophy, TbStar,
  TbChartBar, TbBooks, TbAlertTriangle, TbMoodSmile,
  TbCheck, TbMail, TbExternalLink,
} from 'react-icons/tb'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  PM:   'Product Manager',
  SWE:  'Software Engineer',
  ML:   'Machine Learning Engineer',
  Data: 'Data Scientist / Analyst',
}

const ROLE_STYLES = {
  PM:   { bg: 'bg-amber-50',   border: 'border-amber-200',  bar: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700',    text: 'text-amber-700'   },
  SWE:  { bg: 'bg-blue-50',    border: 'border-blue-200',   bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700',     text: 'text-blue-700'    },
  ML:   { bg: 'bg-violet-50',  border: 'border-violet-200', bar: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700', text: 'text-violet-700'  },
  Data: { bg: 'bg-emerald-50', border: 'border-emerald-200',bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700',text: 'text-emerald-700'},
}

const RANK_META = [
  { label: '#1 Best Match',   Icon: TbTrophy, ring: 'ring-amber-400',  iconColor: 'text-amber-500',  pillBg: 'bg-amber-50 text-amber-700'  },
  { label: '#2 Strong Match', Icon: TbMedal,  ring: 'ring-slate-300',  iconColor: 'text-slate-400',  pillBg: 'bg-slate-50 text-slate-600'  },
  { label: '#3 Good Match',   Icon: TbStar,   ring: 'ring-orange-300', iconColor: 'text-orange-400', pillBg: 'bg-orange-50 text-orange-600' },
]

// Key questions per role — answers ≤ 2 are flagged as skill gaps
const SKILL_GAPS = {
  PM:   [
    { qId: 'q1',  label: 'Stakeholder & requirements thinking' },
    { qId: 'q2',  label: 'Strategy & roadmap leadership' },
    { qId: 'q6',  label: 'Cross-functional team leadership' },
    { qId: 'q9',  label: 'Communicating technical concepts to non-technical audiences' },
    { qId: 'q11', label: 'Writing user stories & managing product backlogs' },
  ],
  SWE:  [
    { qId: 'q3',  label: 'Writing code from scratch' },
    { qId: 'q8',  label: 'Building & shipping software features' },
    { qId: 'q12', label: 'Algorithms & data structures (Big-O)' },
    { qId: 'q15', label: 'System design, APIs & scalable infrastructure' },
  ],
  ML:   [
    { qId: 'q5',  label: 'ML concepts — neural nets, embeddings, gradient descent' },
    { qId: 'q10', label: 'Statistics & probability' },
    { qId: 'q12', label: 'Algorithms & data structures' },
    { qId: 'q13', label: 'Building predictive models from historical data' },
  ],
  Data: [
    { qId: 'q4',  label: 'Working with large datasets & spreadsheets' },
    { qId: 'q7',  label: 'SQL queries & relational databases' },
    { qId: 'q10', label: 'Statistics & quantitative reasoning' },
    { qId: 'q14', label: 'Using data & metrics to drive decisions' },
  ],
}

const TYPE_COLORS = {
  course:  'bg-blue-100 text-blue-700',
  article: 'bg-gray-100 text-gray-600',
  video:   'bg-red-100 text-red-700',
  book:    'bg-amber-100 text-amber-700',
}

// ─── AI Recommendation Card ───────────────────────────────────────────────────

function AIRecommendationCard({ rec, isTop }) {
  const ri = RANK_META[rec.rank - 1] ?? RANK_META[2]
  const rs = ROLE_STYLES[rec.role] ?? ROLE_STYLES.SWE
  const { Icon } = ri

  return (
    <div className={`
      rounded-2xl border-2 p-5 flex flex-col gap-3
      ${rs.bg} ${rs.border}
      ${isTop ? `ring-2 ring-offset-2 ${ri.ring} shadow-lg` : 'shadow-sm'}
    `}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ri.pillBg}`}>
          <Icon size={13} className={ri.iconColor} />
          {ri.label}
        </span>
        <span className={`text-2xl font-extrabold ${rs.text}`}>{rec.fit_score}%</span>
      </div>

      <div>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1 ${rs.badge}`}>
          {rec.role}
        </span>
        <h3 className="text-base font-bold text-gray-900 leading-snug">{rec.title}</h3>
      </div>

      <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden">
        <div className={`${rs.bar} h-2 rounded-full transition-all duration-700`} style={{ width: `${rec.fit_score}%` }} />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{rec.reason}</p>
    </div>
  )
}

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({ resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-sm transition-all group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[resource.resource_type] || 'bg-gray-100 text-gray-600'}`}>
            {resource.resource_type}
          </span>
          <span className="text-xs text-gray-400 capitalize">{resource.difficulty}</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition-colors leading-snug">
          {resource.title}
        </p>
        {resource.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{resource.description}</p>
        )}
      </div>
      <TbExternalLink size={15} className="text-gray-300 group-hover:text-brand-400 shrink-0 mt-0.5 transition-colors" />
    </a>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <TbStar
            size={28}
            className={n <= (hovered || value) ? 'text-amber-400' : 'text-gray-300'}
            style={{ fill: n <= (hovered || value) ? 'currentColor' : 'none' }}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Feedback Form ────────────────────────────────────────────────────────────

function FeedbackForm({ assessmentId, sessionId, sessionEmail }) {
  const [rating, setRating]           = useState(0)
  const [accuracy, setAccuracy]       = useState('')
  const [response, setResponse]       = useState('')
  const [emailRequested, setEmailReq] = useState(!!sessionEmail)
  const [emailOverride, setEmailOver] = useState(sessionEmail || '')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating)    { setError('Please select a star rating.'); return }
    if (!accuracy)  { setError('Please select an accuracy option.'); return }
    setError('')
    setSubmitting(true)
    try {
      await submitFeedback({
        assessment_id: assessmentId,
        session_id: sessionId,
        rating,
        accuracy,
        response: response.trim() || null,
        email_requested: emailRequested,
        email_override: emailRequested && emailOverride.trim() ? emailOverride.trim() : null,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-2">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <TbCheck size={24} className="text-emerald-600" />
        </div>
        <p className="font-semibold text-gray-800">Thanks for your feedback!</p>
        {emailRequested && emailOverride && (
          <p className="text-sm text-gray-500">
            Results sent to <strong>{emailOverride}</strong>. A follow-up arrives in 14 days.
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Star rating */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Overall rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Accuracy */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Did this feel accurate?</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { val: 'yes',      label: 'Yes, definitely' },
            { val: 'somewhat', label: 'Somewhat' },
            { val: 'no',       label: 'Not really' },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setAccuracy(opt.val)}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                ${accuracy === opt.val
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Free text */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          Anything else? <span className="text-gray-400 font-normal">(optional)</span>
        </p>
        <textarea
          value={response}
          onChange={e => setResponse(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share your thoughts — what resonated or felt off?"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
        />
      </div>

      {/* Email me my results */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailRequested}
            onChange={e => setEmailReq(e.target.checked)}
            className="w-4 h-4 accent-brand-600"
          />
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <TbMail size={16} className="text-brand-500" />
            Email me my results
          </span>
        </label>
        {emailRequested && (
          <input
            type="email"
            value={emailOverride}
            onChange={e => setEmailOver(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        )}
        {emailRequested && sessionEmail && emailOverride === sessionEmail && (
          <p className="text-xs text-gray-400">Pre-filled from your entry. Change if needed.</p>
        )}
      </div>

      <ErrorBanner message={error} />

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  )
}

// ─── Main Results Page ────────────────────────────────────────────────────────

export default function Results() {
  const { assessmentId } = useParams()
  const { session } = useSession()

  const [assessment, setAssessment] = useState(null)
  const [resources, setResources]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!assessmentId) return
    getAssessment(assessmentId)
      .then(async (ass) => {
        setAssessment(ass)
        if (ass.recommended_role) {
          try {
            const res = await api.get(`/api/resources/${ass.recommended_role}`)
            setResources(res.data || [])
          } catch { /* resources are optional */ }
        }
      })
      .catch(() => setError('Failed to load results. Please refresh.'))
      .finally(() => setLoading(false))
  }, [assessmentId])

  if (loading) return <LoadingSpinner message="Loading your results…" />
  if (!assessment) return (
    <div className="max-w-xl mx-auto p-8">
      <ErrorBanner message={error || 'Assessment not found.'} />
    </div>
  )

  const { scores, recommended_role: topRole, ai_recommendations: aiRecs, answers } = assessment
  const hasAI = Array.isArray(aiRecs) && aiRecs.length > 0
  const roleScores = scores
    ? ['PM', 'SWE', 'ML', 'Data'].map(r => ({ role: r, score: scores[r] ?? 0 }))
    : []

  // Skill gaps: key questions for topRole where user scored ≤ 2
  const gaps = topRole && answers
    ? (SKILL_GAPS[topRole] || []).filter(({ qId }) => (answers[qId] ?? 5) <= 2)
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-10">

      {/* ── AI Top-3 Recommendations ──────────────────────────────────────── */}
      {hasAI ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <TbSparkles className="text-violet-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Your Top Career Matches</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                AI-ranked · Powered by Gemini · Based on your 15 answers
              </p>
            </div>
          </div>
          <AIRecommendationCard rec={aiRecs[0]} isTop />
          {aiRecs.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiRecs.slice(1).map(rec => (
                <AIRecommendationCard key={rec.role} rec={rec} isTop={false} />
              ))}
            </div>
          )}
        </section>
      ) : (
        topRole && (
          <section className={`rounded-2xl border-2 p-8 text-center space-y-3 ${ROLE_STYLES[topRole]?.bg} ${ROLE_STYLES[topRole]?.border}`}>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${ROLE_STYLES[topRole]?.badge}`}>{topRole}</span>
            <h1 className={`text-3xl font-extrabold ${ROLE_STYLES[topRole]?.text}`}>{ROLE_LABELS[topRole]}</h1>
            <p className="text-gray-500 text-sm">Top recommended role based on your assessment scores.</p>
          </section>
        )
      )}

      {/* ── Score Breakdown ──────────────────────────────────────────────── */}
      {roleScores.length > 0 && (
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <TbChartBar className="text-gray-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Score Breakdown</h2>
            <span className="ml-auto text-xs text-gray-400">Algorithm · 0–100</span>
          </div>
          <div className="space-y-3">
            {[...roleScores]
              .sort((a, b) => b.score - a.score)
              .map(({ role, score }) => (
                <ScoreCard key={role} role={role} score={score} isRecommended={role === topRole} />
              ))}
          </div>
          <p className="text-xs text-gray-400 pt-1">
            Each question has unique weights per role. Scores are normalized to 0–100.
          </p>
        </section>
      )}

      {/* ── Skill Gaps ───────────────────────────────────────────────────── */}
      {topRole && (
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <TbAlertTriangle className="text-amber-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">
              Skill Gaps for {ROLE_LABELS[topRole]}
            </h2>
          </div>
          {gaps.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-xl p-3">
              <TbCheck size={18} className="shrink-0" />
              <p className="text-sm font-medium">
                No major gaps detected — your answers align well with {ROLE_LABELS[topRole]} core skills.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                These areas scored low and may need development for a {topRole} role:
              </p>
              <ul className="space-y-2">
                {gaps.map(({ qId, label }) => (
                  <li key={qId} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">!</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── Role Resources ───────────────────────────────────────────────── */}
      {topRole && (
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TbBooks className="text-brand-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">
                {ROLE_LABELS[topRole]} Resources
              </h2>
            </div>
            <Link
              to={`/resources/${topRole}`}
              className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1"
            >
              View all <TbArrowRight size={12} />
            </Link>
          </div>
          {resources.length === 0 ? (
            <p className="text-sm text-gray-400">No resources found for this role.</p>
          ) : (
            <div className="space-y-2">
              {resources.slice(0, 5).map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Feedback ─────────────────────────────────────────────────────── */}
      <section className="card space-y-5">
        <div className="flex items-center gap-2">
          <TbMoodSmile className="text-brand-500" size={22} />
          <h2 className="text-lg font-semibold text-gray-900">Share Your Feedback</h2>
        </div>
        <FeedbackForm
          assessmentId={assessmentId}
          sessionId={session?.id || assessment.session_id}
          sessionEmail={session?.email || null}
        />
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-wrap">
        <Link to="/" className="btn-secondary flex-1 justify-center">Take Another</Link>
        {topRole && (
          <Link to={`/resources/${topRole}`} className="btn-primary flex-1 justify-center">
            Explore {topRole} Resources <TbArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
