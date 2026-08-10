import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorAlert } from '../components/ErrorAlert'
import { PasswordInput } from '../components/PasswordInput'
import { SuccessAlert } from '../components/SuccessAlert'
import { getErrorMessage } from '../utils/errors'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      return
    }

    setBusy(true)
    try {
      await register({
        login: loginValue.trim(),
        password,
        repeat_password: repeatPassword,
      })
      setSuccess('Account created. Redirecting to sign in…')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 700)
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-ink">Create account</h2>
      <p className="mt-1 text-sm text-muted">
        Your login is stored as your email on the backend.
      </p>

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-ink">
          Email / login
          <input
            type="text"
            required
            value={loginValue}
            onChange={(event) => setLoginValue(event.target.value)}
            autoComplete="username"
            className="input-field mt-1"
          />
        </label>

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Repeat password"
          value={repeatPassword}
          onChange={setRepeatPassword}
          autoComplete="new-password"
          required
        />

        <ErrorAlert message={error} />
        <SuccessAlert message={success} />

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
