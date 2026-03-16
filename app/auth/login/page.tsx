'use client'

import { useState, FormEvent, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => createAuthClient(), [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message || 'Login failed. Check your credentials.')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          background: var(--obsidian);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--charcoal);
          border: 1px solid var(--border);
          padding: 52px 48px;
        }
        .login-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          letter-spacing: 4px;
          color: var(--cream);
          text-align: center;
          display: block;
          margin-bottom: 8px;
        }
        .login-logo span { color: var(--amber); }
        .login-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
          text-align: center;
          display: block;
          margin-bottom: 40px;
        }
        .login-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 28px;
          text-align: center;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .form-label {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
        }
        .form-input {
          background: var(--obsidian);
          border: 1px solid var(--border);
          color: var(--cream);
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 300;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .form-input:focus { border-color: var(--amber); }
        .login-error {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: #e57373;
          padding: 10px 14px;
          background: rgba(229,115,115,0.1);
          border: 1px solid rgba(229,115,115,0.3);
          margin-bottom: 16px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: var(--amber);
          color: var(--obsidian);
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 8px;
        }
        .login-btn:hover:not(:disabled) { background: var(--amber-bright); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-note {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          margin-top: 20px;
        }
        .login-note a {
          color: var(--amber);
          text-decoration: none;
        }
        .login-restricted {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--muted);
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <span className="login-logo">BISX<span>P</span></span>
          <span className="login-subtitle">Admin Access</span>
          <h1 className="login-title">Sign In</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bisxp.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="login-note">
            <a href="/">← Back to bisxp.com</a>
          </p>
          <p className="login-restricted">
            Admin access by invitation only.
          </p>
        </div>
      </div>
    </>
  )
}
