/**
 * Linear progress bar for the assessment form.
 * @param {number} current  0-based current step (0 = nothing done)
 * @param {number} total    Total number of steps
 */
export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-500">
          Question {current} of {total}
        </span>
        <span className="text-xs font-semibold text-brand-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
