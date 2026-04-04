import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { createSession } from '../api/sessions'
import { TbArrowRight, TbChartBar, TbBulb, TbRocket, TbSparkles, TbUser, TbMail } from 'react-icons/tb'

const ROLES = [
  { id: 'PM',   label: 'Product Manager',         color: 'bg-amber-100 text-amber-700',     desc: 'Drive vision, strategy, and roadmaps.' },
  { id: 'SWE',  label: 'Software Engineer',        color: 'bg-blue-100 text-blue-700',       desc: 'Build scalable systems and products.' },
  { id: 'ML',   label: 'ML Engineer',              color: 'bg-violet-100 text-violet-700',   desc: 'Design and train intelligent models.' },
  { id: 'Data', label: 'Data Scientist / Analyst', color: 'bg-emerald-100 text-emerald-700', desc: 'Extract insight from complex datasets.' },
]

const FEATURES = [
  {
    icon: TbBulb,
    title: '15-Question Assessment',
    desc: 'Designed for CS students — every question maps to real skills and behaviors used on the job.',
  },
  {
    icon: TbChartBar,
    title: 'Per-Role Score Breakdown',
    desc: 'See your weighted score across PM, SWE, ML, and Data Science. Understand exactly where your strengths lie.',
  },
  {
    icon: TbSparkles,
    title: 'AI Career Recommendations',
    desc: 'Gemini analyzes your answers holistically and ranks the top 3 roles with personalized fit explanations.',
  },
  {
    icon: TbRocket,
    title: 'Curated Learning Resources',
    desc: 'Role-specific courses, books, and projects to close your skill gaps fast.',
  },
]

// ─── Entry Form ──────────────────────────────────────────────────────────────

function EntryForm() {
  const { saveSession } = useSession()
  const navigate = useNavigate()

  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleStart = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name to continue.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const sessionData = await createSession(name.trim(), email.trim() || null)
      saveSession(sessionData)
      navigate('/assessment')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleStart} className="w-full max-w-sm space-y-3">
      {/* Name */}
      <div className="relative">
        <TbUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
        <input
          type="text"
          placeholder="Your name (required)"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/15 border border-white/30
                     text-white placeholder-white/50 focus:outline-none focus:ring-2
                     focus:ring-white/50 text-sm font-medium"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <TbMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
        <input
          type="email"
          placeholder="Email (optional — receive your results)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/15 border border-white/30
                     text-white placeholder-white/50 focus:outline-none focus:ring-2
                     focus:ring-white/50 text-sm font-medium"
        />
      </div>

      {error && (
        <p className="text-red-300 text-xs text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-white text-brand-700 font-bold text-sm
                   hover:bg-brand-50 transition-colors flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Starting...' : <><span>Start Assessment</span> <TbArrowRight size={16} /></>}
      </button>

      <p className="text-white/40 text-xs text-center">
        No account · No password · Takes ~5 minutes
      </p>
    </form>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="animate-fade-in">
      {/* Hero + Entry Form */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-blue-500 text-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center gap-10">
          <div className="space-y-4">
            <p className="text-brand-100 text-xs font-semibold uppercase tracking-widest">
              For CS students approaching graduation
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Find your ideal<br />CS career path.
            </h1>
            <p className="text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
              Answer 15 questions and get a personalized recommendation — PM, SWE, ML, or Data Science
              — backed by AI and a scoring algorithm tuned to your actual skills.
            </p>
          </div>

          <EntryForm />
        </div>
      </section>

      {/* Role Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
          Four tracks. One assessment.
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Career Navigator scores you across all four paths simultaneously so you see the full picture.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map(role => (
            <div key={role.id} className="card text-center hover:shadow-md transition-shadow">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${role.color}`}>
                {role.id}
              </span>
              <h3 className="font-semibold text-gray-900 mb-2">{role.label}</h3>
              <p className="text-sm text-gray-500">{role.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Built for CS students, not HR professionals.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                    <Icon className="text-brand-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
