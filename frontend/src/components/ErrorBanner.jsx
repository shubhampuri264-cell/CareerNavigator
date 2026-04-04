import { TbAlertCircle } from 'react-icons/tb'

/**
 * Display an error message with a consistent style.
 * @param {string} message  The error message to display.
 */
export default function ErrorBanner({ message }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <TbAlertCircle className="shrink-0 mt-0.5" size={18} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
