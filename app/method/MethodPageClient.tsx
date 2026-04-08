'use client'

import { useState, useEffect, FormEvent } from 'react'

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917675822722'
const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20BISXP%2C%20I%27m%20interested%20in%20the%20BISXP%20Method`

export default function MethodPageClient() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [ms, setMs] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setMs).catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!name.trim()) return setFormError('Name is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('A valid email is required.')
    if (!message.trim() || message.trim().length < 20) return setFormError('Tell us a bit more (at least 20 characters).')

    setFormState('loading')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, business_type: 'BISXP Method' }),
      })
      if (!res.ok) throw new Error('Submission failed.')
      setFormState('success')
    } catch {
      setFormError('Something went wrong. Please try again.')
      setFormState('error')
    }
  }

  return (
    <>
      <style>{`
        .m-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; height: 72px; backdrop-filter: blur(16px); background: rgba(8,8,10,0.85); border-bottom: 1px solid var(--border); }
        .m-nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; letter-spacing: 4px; color: var(--cream); text-decoration: none; }
        .m-nav-logo span { color: var(--amber); }
        .m-nav-links { display: flex; gap: 24px; list-style: none; }
        .m-nav-links a { font-family: 'Inter', system-ui, sans-serif; font-size: 13px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); transition: color 0.2s; text-decoration: none; }
        .m-nav-links a:hover { color: var(--cream); }
        .m-section { padding: 100px 40px; max-width: 900px; margin: 0 auto; }
        .m-hero { padding-top: 172px; padding-bottom: 60px; border-bottom: 1px solid var(--border); margin-bottom: 60px; }
        .m-eyebrow { font-family: 'Inter', system-ui, sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 5px; text-transform: uppercase; color: var(--amber); margin-bottom: 16px; display: block; }
        .m-h1 { font-family: 'Cormorant Garamond', serif; font-size: 64px; font-weight: 300; color: var(--cream); line-height: 1.05; margin-bottom: 24px; }
        .m-h1 em { color: var(--amber-bright); font-style: italic; }
        .m-h2 { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: var(--cream); margin-bottom: 20px; line-height: 1.1; }
        .m-p { font-family: 'Inter', system-ui, sans-serif; font-size: 16px; font-weight: 300; color: var(--muted); line-height: 1.8; margin-bottom: 24px; }
        .m-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin: 40px 0; }
        .m-stat { background: var(--charcoal); padding: 28px; text-align: center; }
        .m-stat strong { font-family: 'DM Sans', system-ui, sans-serif; font-size: 36px; font-weight: 300; color: var(--amber); display: block; margin-bottom: 4px; font-variant-numeric: tabular-nums; }
        .m-stat span { font-family: 'Inter', system-ui, sans-serif; font-size: 11px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
        .m-day { background: var(--charcoal); padding: 40px; margin-bottom: 2px; }
        .m-day-num { font-family: 'Inter', system-ui, sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; color: var(--amber); margin-bottom: 12px; display: block; }
        .m-day h3 { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: var(--cream); margin-bottom: 12px; }
        .m-day p { font-family: 'Inter', system-ui, sans-serif; font-size: 14px; font-weight: 300; color: var(--muted); line-height: 1.7; }
        .m-del-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin: 32px 0; }
        .m-del { background: var(--charcoal); padding: 28px; }
        .m-del h4 { font-family: 'Inter', system-ui, sans-serif; font-size: 14px; font-weight: 500; color: var(--cream); margin-bottom: 8px; }
        .m-del p { font-family: 'Inter', system-ui, sans-serif; font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.6; }
        .m-form { background: var(--charcoal); padding: 48px; border: 1px solid var(--border); margin-top: 40px; }
        .m-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
        .m-form-label { font-family: 'Inter', system-ui, sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
        .m-form-input, .m-form-textarea { background: var(--obsidian); border: 1px solid var(--border); color: var(--cream); font-family: 'Inter', system-ui, sans-serif; font-size: 15px; font-weight: 300; padding: 14px 16px; outline: none; transition: border-color 0.2s; width: 100%; }
        .m-form-input:focus, .m-form-textarea:focus { border-color: var(--amber); }
        .m-form-textarea { resize: vertical; min-height: 120px; }
        .m-form-submit { width: 100%; padding: 16px; background: var(--amber); color: var(--obsidian); font-family: 'Inter', system-ui, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.2s; }
        .m-form-submit:hover:not(:disabled) { background: var(--amber-bright); }
        .m-form-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .m-form-error { font-family: 'Inter', system-ui, sans-serif; font-size: 13px; color: #e57373; margin-bottom: 16px; padding: 12px 16px; background: rgba(229,115,115,0.1); border: 1px solid rgba(229,115,115,0.3); }
        .m-form-success { padding: 40px; text-align: center; border: 1px solid var(--border-strong); background: var(--amber-dim); }
        .m-form-success h3 { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: var(--cream); margin-bottom: 12px; }
        .m-form-success p { font-family: 'Inter', system-ui, sans-serif; font-size: 14px; color: var(--muted); line-height: 1.7; }
        .m-footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .m-footer p { font-family: 'Inter', system-ui, sans-serif; font-size: 12px; color: var(--muted); letter-spacing: 1px; }
        .m-footer a { color: var(--amber); text-decoration: none; }
        .m-btn-amber { font-family: 'Inter', system-ui, sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; padding: 14px 32px; background: var(--amber); color: var(--obsidian); border: none; cursor: pointer; transition: background 0.2s; text-decoration: none; display: inline-block; }
        .m-btn-amber:hover { background: var(--amber-bright); }
        @media (max-width: 900px) {
          .m-nav { padding: 0 24px; }
          .m-nav-links { display: none; }
          .m-h1 { font-size: 40px; }
          .m-h2 { font-size: 30px; }
          .m-section { padding: 72px 24px; }
          .m-hero { padding-top: 140px; }
          .m-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .m-del-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav className="m-nav">
        <a href="/" className="m-nav-logo">BISX<span>P</span></a>
        <ul className="m-nav-links">
          <li><a href="/#case-studies">Case Studies</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <div className="m-section m-hero">
        <span className="m-eyebrow">The BISXP Method</span>
        <h1 className="m-h1">3 days. 1 product.<br /><em>Deployed and live.</em></h1>
        <p className="m-p">
          A hands-on intensive for technical founders and engineering leads who want to build AI-native products on the stack that powers TABRO.IN, TheUnitedSports, CareGrid, and MediGrid. You don&apos;t watch — you build. You don&apos;t get a certificate — you get a deployed product.
        </p>
        <a href="#apply" className="m-btn-amber">Apply Now</a>
      </div>

      {/* PROBLEM */}
      <div className="m-section">
        <h2 className="m-h2">The problem we solve</h2>
        <p className="m-p">
          Most technical founders spend months evaluating stacks, building prototypes that never ship, and hiring contractors who don&apos;t understand their domain. The BISXP Method compresses that into 3 days — working alongside the team that builds production AI-native products every day.
        </p>
      </div>

      {/* STATS */}
      <div className="m-stat-grid">
        <div className="m-stat"><strong>3</strong><span>Days</span></div>
        <div className="m-stat"><strong>6</strong><span>Max cohort</span></div>
        <div className="m-stat"><strong>1</strong><span>Shipped product</span></div>
        <div className="m-stat"><strong>$0</strong><span>Until you ship</span></div>
      </div>

      {/* CURRICULUM */}
      <div className="m-section">
        <span className="m-eyebrow">Curriculum</span>
        <h2 className="m-h2">What you build in 3 days</h2>

        <div className="m-day">
          <span className="m-day-num">Day 1 — Blueprint</span>
          <h3>Architecture &amp; foundations</h3>
          <p>Define your product scope. Set up the full BISXP stack — Next.js 16, Supabase, Vercel. Database schema design. Auth architecture. API route patterns. By end of day, your project is live on a Vercel preview URL with auth working.</p>
        </div>
        <div className="m-day">
          <span className="m-day-num">Day 2 — Build</span>
          <h3>Core features &amp; AI integration</h3>
          <p>Build your core product features. Integrate Claude AI where it adds genuine value — not decoration. Real data flowing through real pipelines. Mobile-responsive UI with the BISXP CSS pattern. By end of day, your product has working features a real user could test.</p>
        </div>
        <div className="m-day">
          <span className="m-day-num">Day 3 — Ship</span>
          <h3>Production hardening &amp; deploy</h3>
          <p>Test suite with Vitest. CI pipeline with GitHub Actions. Error handling. Loading states. SEO metadata. Domain connection. By end of day, your product is deployed to production with a real domain, real tests, and real users can sign up.</p>
        </div>
      </div>

      {/* DELIVERABLES */}
      <div className="m-section">
        <span className="m-eyebrow">What You Leave With</span>
        <h2 className="m-h2">Not slides. Not wireframes. Production code.</h2>
        <div className="m-del-grid">
          <div className="m-del"><h4>Deployed product</h4><p>Live on Vercel with a real domain. Not a prototype — a product real users can interact with.</p></div>
          <div className="m-del"><h4>Full source code</h4><p>GitHub repo you own. No vendor lock-in. No licensing. It&apos;s yours.</p></div>
          <div className="m-del"><h4>Test suite</h4><p>Vitest unit tests, CI pipeline, TypeScript strict. The engineering foundation to keep building confidently.</p></div>
          <div className="m-del"><h4>Architecture docs</h4><p>CLAUDE_CONTEXT.md, TECHNICAL_DEBT.md, and feature templates — the system that lets you or any engineer continue the work.</p></div>
        </div>
      </div>

      {/* WHO THIS IS FOR */}
      <div className="m-section">
        <h2 className="m-h2">Who this is for</h2>
        <p className="m-p">
          Technical founders who can code but need architectural guidance. Engineering leads evaluating the Next.js + Supabase + AI stack. CTOs who want to see it built before committing a team. Solo builders who ship fast but want production discipline. If you&apos;ve been thinking about building an AI-native product and you&apos;re tired of evaluating — this is where you start.
        </p>
      </div>

      {/* APPLY */}
      <div className="m-section" id="apply">
        <span className="m-eyebrow">Apply</span>
        <h2 className="m-h2">Join the next cohort</h2>
        <p className="m-p">
          Cohorts are limited to 6 participants. Tell us what you want to build and we&apos;ll tell you if the Method is the right fit.
        </p>

        <div className="m-form">
          {formState === 'success' ? (
            <div className="m-form-success">
              <h3>{ms.method_success_heading || 'Application received.'}</h3>
              <p>{ms.method_success_body || "We\u2019ll review your application and respond within 48 hours."}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="m-form-group">
                <label className="m-form-label">Name *</label>
                <input className="m-form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
              </div>
              <div className="m-form-group">
                <label className="m-form-label">Email *</label>
                <input className="m-form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="m-form-group">
                <label className="m-form-label">What do you want to build? *</label>
                <textarea className="m-form-textarea" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe the product you want to build, your technical background, and your timeline..." />
              </div>
              {(formState === 'error' || formError) && (
                <div className="m-form-error">{formError}</div>
              )}
              <button type="submit" className="m-form-submit" disabled={formState === 'loading'}>
                {formState === 'loading' ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="m-footer">
        <p>
          <a href="/">BISXP</a> · Blueprint. Implement. Scale. Xperience. · <a href="mailto:hello@bisxp.com">hello@bisxp.com</a>
        </p>
      </footer>
    </>
  )
}
