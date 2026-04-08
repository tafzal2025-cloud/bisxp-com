'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect, FormEvent } from 'react'
import type { Settings } from '@/lib/settings'
import type { CaseStudy, ResearchCard, TeamMember, Service } from '@/lib/cms'

const HeroCanvas = dynamic(() => import('./components/HeroCanvas'), { ssr: false })

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917675822722'
const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20BISXP%2C%20I%27d%20like%20to%20discuss%20a%20project`

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  business_type: string
  message: string
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    business_type: '',
    message: '',
  })
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [s, setS] = useState<Settings>({})
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [researchCards, setResearchCards] = useState<ResearchCard[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [vis, setVis] = useState({ acronym: true, case_studies: true, research: true, services: true, process: true, team: true })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then((data: Settings) => {
      setS(data)
      setVis({
        acronym: data.section_acronym_visible !== 'false',
        case_studies: data.section_case_studies_visible !== 'false',
        research: data.section_research_visible !== 'false',
        services: data.section_services_visible !== 'false',
        process: data.section_process_visible !== 'false',
        team: data.section_team_visible !== 'false',
      })
    }).catch(() => {})
    fetch('/api/cms/case-studies').then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setCaseStudies(d) }).catch(() => {})
    fetch('/api/cms/research-cards').then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setResearchCards(d) }).catch(() => {})
    fetch('/api/cms/team-members').then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setTeamMembers(d) }).catch(() => {})
    fetch('/api/cms/services').then(r => r.json()).then(d => { if (Array.isArray(d) && d.length > 0) setServices(d) }).catch(() => {})
  }, [])

  const updateField = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')

    // Client-side validation
    if (!formData.name.trim()) return setFormError('Name is required.')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return setFormError('A valid email is required.')
    if (!formData.message.trim() || formData.message.trim().length < 20)
      return setFormError('Message must be at least 20 characters.')

    setFormState('loading')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setFormState('success')
    } catch (err: any) {
      setFormError(err.message || 'Submission failed. Please try again.')
      setFormState('error')
    }
  }

  return (
    <>
      <style>{`
        /* ── NAVBAR ── */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 72px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(8,8,10,0.85);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 4px;
          color: var(--cream);
          text-decoration: none;
        }
        .nav-logo span { color: var(--amber); }
        .nav-links {
          display: flex;
          gap: 36px;
          list-style: none;
        }
        .nav-links a {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--cream); }
        .nav-cta {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 10px 24px;
          background: var(--amber);
          color: var(--obsidian);
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .nav-cta:hover { background: var(--amber-bright); }
        .nav-mobile-toggle {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 4px;
        }
        .nav-mobile-toggle span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: var(--cream);
          transition: all 0.2s;
        }
        .mobile-nav-drawer {
          display: none;
          position: fixed;
          top: 72px;
          left: 0; right: 0;
          background: var(--charcoal);
          border-bottom: 1px solid var(--border);
          padding: 24px 40px;
          z-index: 99;
          flex-direction: column;
          gap: 20px;
        }
        .mobile-nav-drawer.open { display: flex; }
        .mobile-nav-drawer a {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 600px;
          background: radial-gradient(ellipse at 50% 40%, #1A1A22 0%, var(--obsidian) 65%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 24px;
          max-width: 780px;
        }
        .hero-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 28px;
          display: block;
        }
        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 88px;
          font-weight: 300;
          line-height: 0.95;
          color: var(--cream);
          margin-bottom: 28px;
        }
        .hero-headline em {
          color: var(--amber-bright);
          font-style: italic;
        }
        .hero-sub {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 300;
          color: var(--muted);
          max-width: 520px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }
        .hero-ctas {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-amber {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 14px 32px;
          background: var(--amber);
          color: var(--obsidian);
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-amber:hover { background: var(--amber-bright); }
        .btn-ghost {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 13px 32px;
          background: transparent;
          color: var(--amber);
          border: 1px solid var(--amber);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-ghost:hover { background: var(--amber-dim); }
        .scroll-indicator {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 10;
        }
        .scroll-indicator span {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
        }
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, var(--amber), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }

        /* ── SECTION COMMON ── */
        .section {
          padding: 100px 40px;
        }
        .section-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 16px;
          display: block;
        }
        .section-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 60px;
          line-height: 1.1;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── STATS BAR ── */
        .stats-bar {
          background: var(--charcoal);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 48px 40px;
        }
        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .stat-item {
          text-align: center;
          padding: 20px 24px;
          position: relative;
        }
        .stat-item:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          height: 60%;
          width: 1px;
          background: var(--border-strong);
        }
        .stat-number {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 52px;
          font-weight: 300;
          color: var(--amber);
          line-height: 1;
          display: block;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--cream);
          display: block;
          margin-bottom: 4px;
        }
        .stat-sub {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          color: var(--muted);
          display: block;
        }

        /* ── ACRONYM ── */
        .acronym-section {
          background: var(--obsidian);
          padding: 100px 40px;
        }
        .acronym-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .acronym-card {
          background: var(--charcoal);
          padding: 52px 48px;
          position: relative;
          overflow: hidden;
          border-left: 3px solid transparent;
          border-top: 1px solid rgba(212,168,67,0.15);
          transition: border-color 0.3s;
        }
        .acronym-card:hover { border-left-color: var(--amber); }
        .acronym-ghost {
          position: absolute;
          top: -10px;
          right: 20px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 120px;
          font-weight: 600;
          color: var(--amber);
          opacity: 0.06;
          line-height: 1;
          pointer-events: none;
          user-select: none;
        }
        .acronym-letter {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--amber);
          display: block;
          margin-bottom: 12px;
        }
        .acronym-word {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 300;
          color: var(--cream);
          display: block;
          margin-bottom: 16px;
        }
        .acronym-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        /* ── PORTFOLIO ── */
        .portfolio-section {
          background: var(--charcoal);
          padding: 100px 40px;
        }
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          max-width: 1200px;
          margin: 0 auto 2px;
        }
        .portfolio-card {
          background: var(--steel);
          padding: 52px 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: background 0.2s;
        }
        .portfolio-card:hover { background: #22222C; }
        .portfolio-eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--amber);
        }
        .portfolio-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px;
          font-weight: 300;
          color: var(--cream);
          line-height: 1;
        }
        .portfolio-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }
        .portfolio-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .portfolio-tag {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 1px;
          color: var(--amber);
          border: 1px solid var(--border-strong);
          padding: 4px 12px;
        }
        .portfolio-market {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 2px;
          color: var(--muted);
          text-transform: uppercase;
        }
        .portfolio-link {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: var(--amber);
          letter-spacing: 1px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }
        .portfolio-link:hover { color: var(--amber-bright); }
        .portfolio-stat-strip {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          padding-top: 20px;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
        .portfolio-callout {
          max-width: 1200px;
          margin: 0 auto;
          background: var(--amber-dim);
          border: 1px solid var(--border-strong);
          padding: 52px 48px;
          text-align: center;
        }
        .portfolio-callout p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          font-style: italic;
          color: var(--cream);
          margin-bottom: 28px;
          line-height: 1.5;
        }

        /* ── SERVICES ── */
        .services-section {
          background: var(--obsidian);
          padding: 100px 40px;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .service-card {
          background: var(--charcoal);
          padding: 48px;
          border-top: 3px solid transparent;
          transition: border-color 0.3s;
        }
        .service-card:hover { border-top-color: var(--amber); }
        .service-icon {
          font-size: 28px;
          color: var(--amber);
          display: block;
          margin-bottom: 20px;
        }
        .service-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 8px;
        }
        .service-price {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 20px;
          display: block;
        }
        .service-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }

        /* ── PROCESS ── */
        .process-section {
          background: var(--charcoal);
          padding: 100px 40px;
        }
        .process-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }
        .process-steps::before {
          content: '';
          position: absolute;
          top: 36px;
          left: 48px;
          right: 48px;
          height: 1px;
          background: var(--border-strong);
          z-index: 0;
        }
        .process-step {
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }
        .process-step:first-child { padding-left: 0; }
        .process-step:last-child { padding-right: 0; }
        .process-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-weight: 300;
          color: var(--amber);
          line-height: 1;
          display: block;
          margin-bottom: 20px;
          background: var(--charcoal);
          width: fit-content;
          padding-right: 16px;
        }
        .process-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--cream);
          margin-bottom: 12px;
          display: block;
        }
        .process-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }

        /* ── MARQUEE ── */
        .marquee-section {
          background: var(--obsidian);
          padding: 60px 0;
          overflow: hidden;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .marquee-label {
          text-align: center;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 32px;
        }
        .marquee-track {
          display: flex;
          gap: 16px;
          animation: marqueeScroll 28s linear infinite;
          width: max-content;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-tag {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: var(--cream);
          border: 1px solid var(--border-strong);
          background: var(--charcoal);
          padding: 12px 28px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── CONTACT ── */
        .contact-section {
          background: var(--charcoal);
          padding: 100px 40px;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          max-width: 1200px;
          margin: 0 auto;
          align-items: start;
        }
        .contact-left h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 24px;
          line-height: 1.1;
        }
        .contact-left p {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 16px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 32px;
        }
        .whatsapp-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--amber);
          text-decoration: none;
          padding: 14px 24px;
          border: 1px solid var(--border-strong);
          transition: all 0.2s;
        }
        .whatsapp-link:hover {
          background: var(--amber-dim);
          border-color: var(--amber);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 20px;
        }
        .form-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
        }
        .form-input, .form-select, .form-textarea {
          background: var(--obsidian);
          border: 1px solid var(--border);
          color: var(--cream);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          padding: 14px 16px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--amber);
        }
        .form-select {
          appearance: none;
          cursor: pointer;
        }
        .form-select option { background: var(--obsidian); }
        .form-textarea {
          resize: vertical;
          min-height: 140px;
        }
        .form-error {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          color: #e57373;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: rgba(229, 115, 115, 0.1);
          border: 1px solid rgba(229, 115, 115, 0.3);
        }
        .form-submit {
          width: 100%;
          padding: 16px;
          background: var(--amber);
          color: var(--obsidian);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .form-submit:hover:not(:disabled) { background: var(--amber-bright); }
        .form-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .form-success {
          padding: 52px;
          text-align: center;
          border: 1px solid var(--border-strong);
          background: var(--amber-dim);
        }
        .form-success h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 16px;
        }
        .form-success p {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }
        .form-success p a { color: var(--amber); }

        /* ── FOOTER ── */
        .footer {
          background: var(--obsidian);
          border-top: 1px solid var(--border);
          padding: 60px 40px 0;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto 48px;
        }
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 4px;
          color: var(--cream);
          display: block;
          margin-bottom: 12px;
        }
        .footer-logo span { color: var(--amber); }
        .footer-tagline {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 2px;
          color: var(--muted);
        }
        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 24px;
          align-items: flex-start;
        }
        .footer-links a {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 1px;
          color: var(--muted);
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--amber); }
        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }
        .footer-contact a {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-contact a:hover { color: var(--amber); }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding: 24px 0;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-bottom p {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: var(--muted);
          letter-spacing: 1px;
        }

        /* ── WHATSAPP FAB ── */
        .wa-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--amber);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          animation: waPulse 2.5s ease-in-out infinite;
          transition: background 0.2s, transform 0.2s;
          box-shadow: 0 4px 20px rgba(212,168,67,0.35);
        }
        .wa-fab:hover {
          background: var(--amber-bright);
          transform: scale(1.08);
          animation: none;
        }
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(212,168,67,0.35); }
          50% { box-shadow: 0 4px 32px rgba(212,168,67,0.65), 0 0 0 8px rgba(212,168,67,0.1); }
        }

        /* ── BISXP METHOD ── */
        .method-section {
          background: var(--charcoal);
          padding: 100px 40px;
          border-top: 1px solid var(--border);
        }
        .method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
        }
        .method-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        .method-stat {
          background: var(--steel);
          padding: 32px;
          text-align: center;
        }
        .method-stat-number {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 42px;
          font-weight: 300;
          color: var(--amber);
          display: block;
          line-height: 1;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
        }
        .method-stat-label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ── TEAM ── */
        .team-section {
          background: var(--charcoal);
          padding: 100px 40px;
          border-top: 1px solid var(--border);
        }
        .team-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .team-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .team-photo {
          width: 100%;
          aspect-ratio: 3/2;
          background: var(--steel);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .team-photo-placeholder {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
          opacity: 0.4;
        }
        .team-photo-initials {
          position: absolute;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 72px;
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
          font-weight: 300;
          color: var(--amber);
          opacity: 0.12;
          user-select: none;
        }
        .team-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 300;
          color: var(--cream);
          line-height: 1.15;
          margin: 0;
        }
        .team-title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--amber);
          margin-top: 8px;
        }
        .team-bio {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.8;
        }
        .team-bio p {
          margin-bottom: 16px;
        }
        .team-bio p:last-child {
          margin-bottom: 0;
        }
        .team-patent {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.6;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        /* ── RESEARCH & SECURITY ── */
        .rs-section {
          background: var(--obsidian);
          padding: 100px 40px;
          border-top: 1px solid var(--border);
        }
        .rs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
          max-width: 1200px;
          margin: 0 auto 2px;
        }
        .rs-card {
          background: var(--charcoal);
          padding: 48px;
          border-top: 3px solid transparent;
          transition: border-color 0.3s;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rs-card:hover {
          border-top-color: var(--amber);
        }
        .rs-tag {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--amber);
          border: 1px solid var(--border-strong);
          padding: 4px 12px;
          display: inline-block;
          width: fit-content;
        }
        .rs-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 300;
          color: var(--cream);
          line-height: 1;
          margin: 0;
        }
        .rs-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--amber);
        }
        .rs-body {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.75;
        }
        .rs-note {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--amber);
          opacity: 0.6;
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .rs-cta {
          max-width: 1200px;
          margin: 0 auto;
          background: var(--amber-dim);
          border: 1px solid var(--border-strong);
          padding: 52px 48px;
          text-align: center;
        }
        .rs-cta h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px;
          font-weight: 300;
          font-style: italic;
          color: var(--cream);
          margin-bottom: 16px;
          line-height: 1.3;
        }
        .rs-cta p {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: var(--muted);
          max-width: 560px;
          margin: 0 auto 32px;
          line-height: 1.7;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .nav { padding: 0 24px; }
          .nav-links { display: none; }
          .nav-mobile-toggle { display: flex; }
          .hero-headline { font-size: 52px; }
          .hero-sub { font-size: 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2)::after { display: none; }
          .acronym-grid { grid-template-columns: 1fr; }
          .portfolio-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr; }
          .process-steps {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .process-steps::before { display: none; }
          .process-step { padding: 0; border-left: 2px solid var(--border-strong); padding-left: 24px; padding-right: 0; }
          .process-step:first-child { padding-left: 24px; }
          .process-step:last-child { padding-right: 0; }
          .process-number { background: transparent; font-size: 40px; margin-bottom: 14px; }
          .process-title { font-size: 13px; letter-spacing: 0.5px; margin-bottom: 10px; }
          .process-desc { font-size: 13px; line-height: 1.65; }
          .contact-grid { grid-template-columns: 1fr; gap: 48px; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer-contact { align-items: flex-start; }
          .section { padding: 72px 24px; }
          .acronym-section { padding: 72px 24px; }
          .portfolio-section { padding: 72px 24px; }
          .services-section { padding: 72px 24px; }
          .process-section { padding: 72px 24px; }
          .contact-section { padding: 72px 24px; }
          .footer { padding: 48px 24px 0; }
          .stats-bar { padding: 40px 24px; }
          .portfolio-card { padding: 36px 28px; }
          .acronym-card { padding: 40px 32px; }
          .service-card { padding: 36px; }
          .portfolio-callout { padding: 40px 28px; }
          .portfolio-callout p { font-size: 22px; }
          .rs-grid { grid-template-columns: 1fr; }
          .rs-section { padding: 72px 24px; }
          .rs-card { padding: 36px 28px; }
          .rs-cta { padding: 40px 28px; }
          .rs-cta h3 { font-size: 26px; }
          .method-grid { grid-template-columns: 1fr; gap: 40px; }
          .method-section { padding: 72px 24px; }
          .team-grid { grid-template-columns: 1fr; gap: 64px; }
          .team-section { padding: 72px 24px; }
          .team-name { font-size: 28px; }
          .team-title { margin-top: 8px; letter-spacing: 1.5px; font-size: 10px; line-height: 1.6; }
          .team-card { gap: 16px; }
        }
        @media (max-width: 600px) {
          .hero-headline { font-size: 40px; }
          .section-heading { font-size: 38px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-item::after { display: none; }
          .wa-fab { bottom: 20px; right: 20px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="nav">
        <a href="/" className="nav-logo">
          BISX<span>P</span>
        </a>
        <ul className="nav-links">
          <li><a href="#case-studies">Case Studies</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#process">Process</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" className="nav-cta">Start a Project</a>
        <div
          className="nav-mobile-toggle"
          onClick={() => setMobileNavOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </div>
      </nav>
      <div className={`mobile-nav-drawer${mobileNavOpen ? ' open' : ''}`}>
        <a href="#case-studies" onClick={() => setMobileNavOpen(false)}>Case Studies</a>
        <a href="#services" onClick={() => setMobileNavOpen(false)}>Services</a>
        <a href="#process" onClick={() => setMobileNavOpen(false)}>Process</a>
        <a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <HeroCanvas />
        <div className="hero-content">
          <span className="hero-eyebrow">AI-Native Technology Consultancy</span>
          <h1 className="hero-headline">
            {s.hero_headline || "We don\u2019t just advise."}<br />
            <em>{s.hero_headline_em || 'We build.'}</em>
          </h1>
          <p className="hero-sub">
            {s.hero_subheadline || 'From marketplace blueprint to production-ready platform \u2014 in weeks, not months.'}
          </p>
          <div className="hero-ctas">
            <a href="#contact" className="btn-amber">Start a Project</a>
            <a href="#case-studies" className="btn-ghost">See Our Work</a>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{s.stat_1_number || '4'}</span>
            <span className="stat-label">{s.stat_1_label || 'Marketplaces in development'}</span>
            <span className="stat-sub">{s.stat_1_sub || 'Launching in 2026'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{s.stat_2_number || '25 yrs'}</span>
            <span className="stat-label">{s.stat_2_label || 'Combined experience'}</span>
            <span className="stat-sub">{s.stat_2_sub || 'Microsoft \u00b7 AWS \u00b7 Enterprise AI'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{s.stat_3_number || '3'}</span>
            <span className="stat-label">{s.stat_3_label || 'Countries served'}</span>
            <span className="stat-sub">{s.stat_3_sub || 'India \u00b7 USA \u00b7 Canada'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{s.stat_4_number || '100%'}</span>
            <span className="stat-label">{s.stat_4_label || 'Hands-on delivery'}</span>
            <span className="stat-sub">{s.stat_4_sub || 'We stay until it works'}</span>
          </div>
        </div>
      </div>

      {/* ── ACRONYM ── */}
      <section className="acronym-section" style={{ display: vis.acronym ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">What BISXP Stands For</span>
          <div className="acronym-grid">
            <div className="acronym-card">
              <span className="acronym-ghost">B</span>
              <span className="acronym-letter">B —</span>
              <span className="acronym-word">Blueprint</span>
              <p className="acronym-desc">
                Every engagement starts with a clear, actionable plan tailored to your business — not a generic framework.
              </p>
            </div>
            <div className="acronym-card">
              <span className="acronym-ghost">I</span>
              <span className="acronym-letter">I —</span>
              <span className="acronym-word">Implement</span>
              <p className="acronym-desc">
                We turn blueprints into working software — shipped, deployed, and live. Not wireframes. Not prototypes. Production.
              </p>
            </div>
            <div className="acronym-card">
              <span className="acronym-ghost">S</span>
              <span className="acronym-letter">S —</span>
              <span className="acronym-word">Scale</span>
              <p className="acronym-desc">
                We design for scale from day one — architecture, systems, and processes that grow with you.
              </p>
            </div>
            <div className="acronym-card">
              <span className="acronym-ghost">XP</span>
              <span className="acronym-letter">XP —</span>
              <span className="acronym-word">Xperience</span>
              <p className="acronym-desc">
                Battle-tested expertise. We've built the marketplaces, trained the teams, and launched the brands ourselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ── */}
      <section className="portfolio-section" id="case-studies" style={{ display: vis.case_studies ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">Case Studies</span>
          <h2 className="section-heading">Built by BISXP</h2>
          <div className="portfolio-grid">
            {caseStudies.map(cs => (
              <div className="portfolio-card" key={cs.id}>
                <div>
                  <p className="portfolio-eyebrow">{cs.eyebrow}</p>
                  <h3 className="portfolio-title">{cs.title}</h3>
                </div>
                {cs.problem_quote && (
                  <p className="portfolio-desc">{cs.problem_quote}</p>
                )}
                {cs.what_we_built && (
                  <p className="portfolio-desc" style={{ fontSize: '13px' }}>{cs.what_we_built}</p>
                )}
                {cs.status_badge && (
                  <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, color: 'var(--amber)', opacity: 0.8 }}>· {cs.status_badge}</span>
                )}
              </div>
            ))}
          </div>

          {/* Callout strip */}
          <div className="portfolio-callout">
            <p>
              Four world-class marketplaces. One proven platform pattern.<br />
              Your vertical could be next.
            </p>
            <a href="#contact" className="btn-amber">Let's Talk</a>
          </div>
        </div>
      </section>

      {/* ── RESEARCH & SECURITY ── */}
      <section className="rs-section" style={{ display: vis.research ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">What We&apos;re Building Next</span>
          <h2 className="section-heading">Research &amp; Security</h2>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '16px',
            fontWeight: 300,
            color: 'var(--muted)',
            maxWidth: '640px',
            lineHeight: '1.7',
            marginBottom: '48px',
            marginTop: '-32px'
          }}>
            While we build marketplaces, we are simultaneously working on the next frontier — securing the infrastructure that autonomous AI agents will run on. This is serious research, not a roadmap slide.
          </p>
          <div className="rs-grid">
            {researchCards.map(rc => (
              <div className="rs-card" key={rc.id}>
                <span className="rs-tag">{rc.tag}</span>
                <h3 className="rs-title">{rc.title}</h3>
                <span className="rs-subtitle">{rc.subtitle}</span>
                <p className="rs-body">{rc.body}</p>
                <span className="rs-note">{rc.note}</span>
              </div>
            ))}
          </div>
          {/* CTA strip */}
          <div className="rs-cta">
            <h3>Interested in early access or research collaboration?</h3>
            <p>
              We are working with a small number of early partners in enterprise AI security. If you are building autonomous agent systems and need a trust and security layer, we want to hear from you.
            </p>
            <a href="#contact" className="btn-amber">Request Early Access</a>
          </div>
        </div>
      </section>

      {/* ── BISXP METHOD ── */}
      <section className="method-section" style={{ display: 'none' }}>
        <div className="method-grid">
          <div>
            <span className="section-eyebrow">The BISXP Method</span>
            <h2 className="section-heading" style={{ marginBottom: '20px' }}>
              Learn to build like we build
            </h2>
            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '15px',
              fontWeight: 300,
              color: 'var(--muted)',
              lineHeight: '1.8',
              marginBottom: '32px'
            }}>
              A 3-day intensive for technical founders and engineering leads who want to ship AI-native products on the BISXP stack. Not a course — a working capstone. You leave with a deployed product, not a certificate.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
              <a href="/method" className="btn-amber">Learn More</a>
              <a href="#contact" className="btn-ghost">Apply Now</a>
            </div>
          </div>
          <div className="method-stats">
            <div className="method-stat">
              <span className="method-stat-number">3</span>
              <span className="method-stat-label">Days intensive</span>
            </div>
            <div className="method-stat">
              <span className="method-stat-number">1</span>
              <span className="method-stat-label">Shipped product</span>
            </div>
            <div className="method-stat">
              <span className="method-stat-number">6</span>
              <span className="method-stat-label">Max participants</span>
            </div>
            <div className="method-stat">
              <span className="method-stat-number">$0</span>
              <span className="method-stat-label">Until you ship</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="services-section" id="services" style={{ display: vis.services ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">Services</span>
          <h2 className="section-heading">What We Build</h2>
          <p style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '14px',
            fontWeight: 300,
            color: 'var(--muted)',
            maxWidth: '600px',
            lineHeight: '1.7',
            marginBottom: '48px',
            marginTop: '-40px',
            letterSpacing: '0.3px'
          }}>
            Every product we build runs on the same proven platform pattern — architected for Vercel and Supabase at launch, and AWS at scale. The stack evolves with your growth. The pattern doesn&apos;t change.
          </p>
          <div className="services-grid">
            {(services.length > 0 ? services : [
              { id: '1', icon: '◈', title: s.service_1_title || 'Marketplace Build', description: s.service_1_desc || 'We build your two-sided marketplace from the ground up.', sort_order: 1, is_visible: true },
              { id: '2', icon: '⬡', title: s.service_2_title || 'AI Integration', description: s.service_2_desc || 'We embed Claude AI into your product.', sort_order: 2, is_visible: true },
              { id: '3', icon: '◎', title: s.service_3_title || 'SaaS Product', description: s.service_3_desc || 'Custom SaaS products built on the full BISXP stack.', sort_order: 3, is_visible: true },
              { id: '4', icon: '△', title: s.service_4_title || 'Ongoing Partnership', description: s.service_4_desc || 'An embedded technical partner for continuous delivery.', sort_order: 4, is_visible: true },
            ]).map(svc => (
              <div className="service-card" key={svc.id}>
                <span className="service-icon">{svc.icon}</span>
                <h3 className="service-title">{svc.title}</h3>
                <p className="service-desc">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process-section" id="process" style={{ display: vis.process ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">How We Work</span>
          <h2 className="section-heading">Our Process</h2>
          <div className="process-steps">
            <div className="process-step">
              <span className="process-number">01</span>
              <span className="process-title">{s.process_1_title || 'Discovery'}</span>
              <p className="process-desc">
                {s.process_1_desc || 'We learn your business, community, and goals. No templates. No assumptions.'}
              </p>
            </div>
            <div className="process-step">
              <span className="process-number">02</span>
              <span className="process-title">{s.process_2_title || 'Blueprint'}</span>
              <p className="process-desc">
                {s.process_2_desc || 'A scoped, costed plan. What we build, in what order, and why.'}
              </p>
            </div>
            <div className="process-step">
              <span className="process-number">03</span>
              <span className="process-title">{s.process_3_title || 'Execution'}</span>
              <p className="process-desc">
                {s.process_3_desc || 'We build alongside you. Weekly demos. Real code. Deployed features.'}
              </p>
            </div>
            <div className="process-step">
              <span className="process-number">04</span>
              <span className="process-title">{s.process_4_title || 'Handover'}</span>
              <p className="process-desc">
                {s.process_4_desc || 'You own everything. Trained team, documented systems, zero dependency on us.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO WE WORK WITH (MARQUEE) ── */}
      <div className="marquee-section">
        <p className="marquee-label">Who We Work With</p>
        <div style={{ overflow: 'hidden' }}>
          <div className="marquee-track">
            {[
              'Early-stage startups',
              'Marketplace founders',
              'Family businesses going digital',
              'Hospitality & events',
              'Sports communities',
              'Diaspora-origin businesses',
              'SMEs scaling operations',
              'Brands entering new markets',
              'VC-backed teams',
              'Service businesses',
              // Duplicate for seamless loop
              'Early-stage startups',
              'Marketplace founders',
              'Family businesses going digital',
              'Hospitality & events',
              'Sports communities',
              'Diaspora-origin businesses',
              'SMEs scaling operations',
              'Brands entering new markets',
              'VC-backed teams',
              'Service businesses',
            ].map((tag, i) => (
              <span key={i} className="marquee-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTACT FORM ── */}
      <section className="contact-section" id="contact">
        <div className="contact-grid">
          <div className="contact-left">
            <h2>{s.contact_heading || 'Start a Project'}</h2>
            <p>
              {s.contact_subheading || "Tell us what you\u2019re building. We\u2019ll respond within 24 hours with honest thoughts on how we\u2019d approach it \u2014 no pitch, no pressure."}
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Or message us directly on WhatsApp
            </a>
          </div>

          <div className="contact-right">
            {formState === 'success' ? (
              <div className="form-success">
                <h3>Thank you.</h3>
                <p>
                  We'll be in touch within 24 hours. In the meantime, explore our work at{' '}
                  <a href="https://tabro.in" target="_blank" rel="noopener noreferrer">TABRO.IN</a>
                  {' '}and{' '}
                  <a href="https://theunitedsports.com" target="_blank" rel="noopener noreferrer">TheUnitedSports.com</a>.
                </p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.name}
                    onChange={updateField('name')}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    value={formData.email}
                    onChange={updateField('email')}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={formData.phone}
                    onChange={updateField('phone')}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Business Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.company}
                    onChange={updateField('company')}
                    placeholder="Your company"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Type</label>
                  <select
                    className="form-select"
                    value={formData.business_type}
                    onChange={updateField('business_type')}
                  >
                    <option value="">Select one…</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="SaaS Platform">SaaS Platform</option>
                    <option value="Digital Transformation">Digital Transformation</option>
                    <option value="Event/Venue">Event / Venue</option>
                    <option value="Sports/Community">Sports / Community</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message * (min 20 characters)</label>
                  <textarea
                    className="form-textarea"
                    value={formData.message}
                    onChange={updateField('message')}
                    placeholder="Tell us what you're building, your timeline, and any key requirements…"
                    required
                  />
                </div>
                {(formState === 'error' || formError) && (
                  <div className="form-error">{formError}</div>
                )}
                <button
                  type="submit"
                  className="form-submit"
                  disabled={formState === 'loading'}
                >
                  {formState === 'loading' ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="team-section" style={{ display: vis.team ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">The Team</span>
          <h2 className="section-heading" style={{ marginBottom: '64px' }}>
            The people behind the work
          </h2>
          <div className="team-grid">
            {teamMembers.map(tm => (
              <div className="team-card" key={tm.id}>
                <div className="team-photo">
                  <span className="team-photo-initials">{tm.initials || tm.name.split(' ').map(n => n[0]).join('')}</span>
                  {tm.photo_url
                    ? <img src={tm.photo_url} alt={tm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span className="team-photo-placeholder">Photo coming soon</span>
                  }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 className="team-name">{tm.name}</h3>
                  <p className="team-title">{tm.title}</p>
                </div>
                <div className="team-bio">
                  {tm.bio.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {tm.credential_label && (
                  <span className="team-patent">{tm.credential_label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <span className="footer-logo">BISX<span>P</span></span>
            <p className="footer-tagline">Blueprint. Implement. Scale. Xperience.</p>
          </div>
          <div>
            <div className="footer-links">
              <a href="#case-studies">Case Studies</a>
              <a href="#services">Services</a>
              <a href="#process">Process</a>
              <a href="#contact">Contact</a>
              <a href="https://tabro.in" target="_blank" rel="noopener noreferrer">TABRO.IN</a>
              <a href="https://theunitedsports.com" target="_blank" rel="noopener noreferrer">TheUnitedSports.com</a>
            </div>
          </div>
          <div className="footer-contact">
            <a href="mailto:hello@bisxp.com">hello@bisxp.com</a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 BISXP. All rights reserved.</p>
        </div>
      </footer>

      {/* ── WHATSAPP FAB ── */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="wa-fab" aria-label="Chat on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--obsidian)">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}
