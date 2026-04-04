import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import { TbCompass } from 'react-icons/tb'

export default function Login() {
  const { supabase } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect back to where the user was trying to go
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async ({ email, password }) => {
    setServerError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setServerError('Invalid email or password. Please try again.')
        return
      }
      navigate(from, { replace: true })
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 mb-4">
            <TbCompass className="text-brand-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">
            No account?{' '}
            <Link to="/signup" className="text-brand-600 font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>

        <div className="card">
          <ErrorBanner message={serverError} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                placeholder="jane@university.edu"
                className="input"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="Your password"
                className="input"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
