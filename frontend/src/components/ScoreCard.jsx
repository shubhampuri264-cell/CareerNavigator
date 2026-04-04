/**
 * Displays a role's score as a labeled bar.
 * Role colors are safelisted in tailwind.config.js.
 */
const ROLE_STYLES = {
  PM:   { bar: 'bg-amber-500',   border: 'border-amber-200', bg: 'bg-amber-50',   text: 'text-amber-700'  },
  SWE:  { bar: 'bg-blue-500',    border: 'border-blue-200',  bg: 'bg-blue-50',    text: 'text-blue-700'   },
  ML:   { bar: 'bg-violet-500',  border: 'border-violet-200',bg: 'bg-violet-50',  text: 'text-violet-700' },
  Data: { bar: 'bg-emerald-500', border: 'border-emerald-200',bg:'bg-emerald-50', text: 'text-emerald-700'},
}

const ROLE_LABELS = {
  PM:   'Product Management',
  SWE:  'Software Engineering',
  ML:   'Machine Learning',
  Data: 'Data Science',
}

export default function ScoreCard({ role, score, isRecommended = false }) {
  const styles = ROLE_STYLES[role] ?? ROLE_STYLES.SWE

  return (
    <div className={`rounded-xl border p-4 ${styles.bg} ${styles.border} ${
      isRecommended ? 'ring-2 ring-offset-1 ring-current shadow-md' : ''
    }`}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wide ${styles.text}`}>
            {role}
          </span>
          {isRecommended && (
            <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>
              Recommended
            </span>
          )}
          <p className="text-sm text-gray-600 mt-0.5">{ROLE_LABELS[role]}</p>
        </div>
        <span className={`text-2xl font-bold ${styles.text}`}>{score}%</span>
      </div>
      <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${styles.bar} h-2.5 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
