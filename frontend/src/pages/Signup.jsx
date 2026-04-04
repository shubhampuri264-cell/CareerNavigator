import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthContext } from '../context/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import { TbCompass } from 'react-icons/tb'

export default function Signup() {
  const { supabase } = useAuthContext()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async ({ fullName, email, password }) => {
    setServerError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) {
        setServerError(error.message)
        return
      }
      // Supabase may require email confirmation — navigate to assessment anyway.
      // The AuthContext listener will pick up the session if auto-confirmed.
      navigate('/assessment')
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">
            Already have one?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="card">
          <ErrorBanner message={serverError} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            {/* Full Name */}
            <div>
              <label className="label">Full name</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                type="text"
                placeholder="Jane Doe"
                className="input"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                })}
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
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Must be at least 8 characters' },
                })}
                type="password"
                placeholder="At least 8 characters"
                className="input"
                autoComplete="new-password"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By signing up you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}
