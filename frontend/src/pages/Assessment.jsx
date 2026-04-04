import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { startAssessment, submitAssessment } from '../api/assessments'
import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions'
import ProgressBar from '../components/ProgressBar'
import ErrorBanner from '../components/ErrorBanner'

// ─── Question screen ─────────────────────────────────────────────────────────

function QuestionScreen({ question, index, answer, onAnswer, onNext, onBack, isLast, submitting, error }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-slide-up">
      <div className="mb-8">
        <ProgressBar current={index + 1} total={TOTAL_QUESTIONS} />
      </div>

      <div className="card space-y-8">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Question {index + 1} of {TOTAL_QUESTIONS}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 mt-2 leading-snug">
            {question.text}
          </h2>
        </div>

        <ErrorBanner message={error} />

        {/* Scale buttons */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
            <span>{question.scaleLabels[1]}</span>
            <span>{question.scaleLabels[5]}</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                onClick={() => onAnswer(val)}
                className={`flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all duration-150
                  ${answer === val
                    ? 'border-brand-600 bg-brand-600 text-white shadow-md scale-105'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
              >
                {val}
              </button>
            ))}
          </div>
          {answer && (
            <p className="text-xs text-center text-gray-400">
              You selected <strong>{answer}</strong>
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onBack}
            disabled={index === 0}
            className="btn-secondary flex-1 disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            disabled={!answer || submitting}
            className="btn-primary flex-1"
          >
            {submitting
              ? 'Analyzing your results…'
              : isLast
              ? 'Submit Assessment →'
              : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Assessment Page ────────────────────────────────────────────────────

export default function Assessment() {
  const { session } = useSession()
  const navigate = useNavigate()

  const [assessmentId, setAssessmentId] = useState(null)
  const [answers, setAnswers]           = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase]               = useState('loading')  // loading | questions | submitting
  const [error, setError]               = useState('')

  // Start assessment on mount once session is confirmed
  useEffect(() => {
    if (!session?.id) {
      navigate('/')
      return
    }
    startAssessment(session.id)
      .then(data => {
        setAssessmentId(data.id)
        setPhase('questions')
      })
      .catch(() => {
        setError('Failed to start assessment. Please go back and try again.')
        setPhase('questions')
      })
  }, [session, navigate])

  const handleAnswer = (value) => {
    const qId = QUESTIONS[currentIndex].id
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  const handleNext = async () => {
    const isLast = currentIndex === TOTAL_QUESTIONS - 1

    if (!isLast) {
      setCurrentIndex(i => i + 1)
      return
    }

    // Final submit
    setError('')
    setPhase('submitting')
    try {
      await submitAssessment(assessmentId, answers)
      navigate(`/results/${assessmentId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.')
      setPhase('questions')
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1)
  }

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Preparing your assessment…</p>
        </div>
      </div>
    )
  }

  const question = QUESTIONS[currentIndex]
  const currentAnswer = answers[question.id]
  const isLast = currentIndex === TOTAL_QUESTIONS - 1
  const submitting = phase === 'submitting'

  return (
    <QuestionScreen
      question={question}
      index={currentIndex}
      answer={currentAnswer}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onBack={handleBack}
      isLast={isLast}
      submitting={submitting}
      error={error}
    />
  )
}
