'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect, FormEvent } from 'react'
import type { Settings } from '@/lib/settings'
import type { CaseStudy, ResearchCard, TeamMember, Service } from '@/lib/cms'

const HeroCanvas = dynamic(() => import('./components/HeroCanvas'), { ssr: false })

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917675822722'
const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20BISXP%2C%20I%27d%20like%20to%20discuss%20a%20project`

interface FormData {
  name: string; email: string; phone: string; company: string; business_type: string; message: string
}

export default function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', company: '', business_type: '', message: '' })
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [s, setS] = useState<Settings>({})
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [researchCards, setResearchCards] = useState<ResearchCard[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [vis, setVis] = useState({
    acronym: true, case_studies: true, research: true, services: true,
    process: true, team: true, personas: true, methodology: true, platform: true
  })

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
        personas: data.section_personas_visible !== 'false',
        methodology: data.section_methodology_visible !== 'false',
        platform: data.section_platform_visible !== 'false',
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

  function validateField(fname: string, value: string): string {
    switch (fname) {
      case 'name': return value.trim().length < 2 ? 'Full name is required' : ''
      case 'email': return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? 'Please enter a valid email address' : ''
      case 'phone':
        if (!value.trim()) return ''
        return !/^\d{10,15}$/.test(value.replace(/[\s\-+()]/g, '')) ? 'Please enter a valid phone number (10\u201315 digits)' : ''
      case 'message': return value.trim().length < 20 ? 'Message must be at least 20 characters' : ''
      default: return ''
    }
  }

  function validateAll(): Record<string, string> {
    const e: Record<string, string> = {}
    ;(['name', 'email', 'phone', 'message'] as const).forEach(f => {
      const err = validateField(f, formData[f] || '')
      if (err) e[f] = err
    })
    return e
  }

  function handleBlur(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field as keyof FormData] || '') }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    setSubmitAttempted(true)
    const errs = validateAll()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTouched({ name: true, email: true, phone: true, message: true })
      return
    }
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

  const tharif = teamMembers.find(t => t.initials === 'TA' || t.name === 'Tharif Afzal')

  const PLATFORM_TILES = [
    { icon: '◈', title: 'Multi-sided Listings', body: 'Any entity type with owner portals, media upload, and tiered feature access.' },
    { icon: '◎', title: 'Enquiry & CRM Pipeline', body: 'From first contact to closed booking. Status tracking, notes, and owner notifications.' },
    { icon: '⬡', title: 'Subscription Tiers', body: 'Basic, Professional, Premium. Feature gating and upgrade prompts built in from day one.' },
    { icon: '△', title: 'AI Matching & Content', body: 'Claude AI for listing matching, content generation, photo scoring, and workflow automation.' },
    { icon: '○', title: 'Social Feed & Community', body: 'Posts, likes, comments, event announcements, and influencer integration.' },
    { icon: '□', title: 'Owner Portals', body: 'Every listing owner gets a full management dashboard \u2014 without building one per client.' },
    { icon: '◇', title: 'Analytics & Scoring', body: 'Listing quality scores, enquiry conversion tracking, session analytics, and admin dashboards.' },
    { icon: '\u221E', title: 'Multi-market Architecture', body: 'India \u20B9 or Global $. INR or USD. GST or Sales Tax. The platform handles both.' },
  ]

  return (
    <>
      <style>{`
        /* ── NAV ── */
        .nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:72px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(27,31,46,0.92);border-bottom:1px solid var(--border) }
        .nav-logo { font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:400;letter-spacing:4px;color:var(--cream);text-decoration:none }
        .nav-logo span { color:var(--amber) }
        .nav-links { display:flex;gap:36px;list-style:none }
        .nav-links a { font-family:'Inter',system-ui,sans-serif;font-size:12px;font-weight:400;letter-spacing:2px;text-transform:uppercase;color:var(--muted);transition:color .2s }
        .nav-links a:hover { color:var(--cream) }
        .nav-cta { font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;padding:10px 24px;background:var(--amber);color:var(--obsidian);text-decoration:none }
        .nav-cta:hover { background:var(--amber-bright) }
        .nav-toggle { display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px }
        .nav-toggle span { display:block;width:22px;height:1.5px;background:var(--cream) }
        .mobile-drawer { display:none;position:fixed;top:72px;left:0;right:0;background:var(--charcoal);border-bottom:1px solid var(--border);padding:24px 40px;z-index:99;flex-direction:column;gap:20px }
        .mobile-drawer.open { display:flex }
        .mobile-drawer a { font-family:'Inter',system-ui,sans-serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);padding:8px 0;border-bottom:1px solid var(--border) }

        /* ── HERO ── */
        .hero { position:relative;width:100%;min-height:100vh;background:radial-gradient(ellipse at 50% 40%,#242844 0%,var(--obsidian) 65%);display:flex;align-items:center;justify-content:center;overflow:hidden }
        .hero-inner { position:relative;z-index:10;text-align:center;padding:0 24px;max-width:780px }
        .hero-eyebrow { font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:var(--amber);margin-bottom:20px;display:block }
        .hero-headline { font-family:'Cormorant Garamond',serif;font-size:clamp(48px,8vw,88px);font-weight:300;line-height:.95;color:var(--cream);margin-bottom:28px }
        .hero-headline em { color:var(--amber-bright);font-style:italic }
        .hero-sub { font-family:'Inter',system-ui,sans-serif;font-size:17px;font-weight:300;color:var(--muted);max-width:560px;margin:0 auto 36px;line-height:1.7 }
        .hero-actions { display:flex;gap:16px;justify-content:center;flex-wrap:wrap }
        .btn-primary { font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;background:var(--amber);color:var(--obsidian);text-decoration:none;display:inline-block }
        .btn-primary:hover { background:var(--amber-bright) }
        .btn-secondary { font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:13px 32px;border:1px solid rgba(212,168,67,0.4);color:var(--amber);text-decoration:none;display:inline-block }
        .btn-secondary:hover { background:rgba(212,168,67,0.08) }

        /* ── SECTION COMMON ── */
        .section { padding:100px 40px }
        .section-eyebrow { font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:var(--amber);margin-bottom:16px;display:block }
        .section-heading { font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:var(--cream);margin-bottom:48px;line-height:1.1 }
        .section-intro { font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);max-width:600px;line-height:1.75;margin-bottom:48px;margin-top:-24px }
        .container { max-width:1200px;margin:0 auto }

        /* ── STATS BAR ── */
        .stats-bar { background:var(--charcoal);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:48px 40px }
        .stats-grid { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:0 }
        .stat-item { text-align:center;padding:20px 24px;position:relative }
        .stat-item:not(:last-child)::after { content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:var(--border) }
        .stat-number { font-family:'DM Sans',system-ui,sans-serif;font-size:48px;font-weight:300;color:var(--amber);line-height:1;display:block;margin-bottom:8px;font-variant-numeric:tabular-nums }
        .stat-label { font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:500;color:var(--cream);display:block;margin-bottom:4px }
        .stat-sub { font-family:'Inter',system-ui,sans-serif;font-size:12px;color:var(--muted);display:block }

        /* ── PARTNER STORIES ── */
        .stories-section { background:var(--charcoal);padding:100px 40px }
        .stories-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.06) }
        .story-card { background:var(--obsidian);padding:48px 36px;display:flex;flex-direction:column;gap:16px }
        .story-eyebrow { font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:var(--amber) }
        .story-title { font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:var(--cream);line-height:1 }
        .story-quote { font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:300;color:var(--muted);line-height:1.7;font-style:italic;border-left:2px solid var(--amber);padding-left:16px }
        .story-built { font-family:'Inter',system-ui,sans-serif;font-size:13px;font-weight:300;color:var(--muted);line-height:1.7 }
        .story-partner { font-family:'Inter',system-ui,sans-serif;font-size:11px;color:rgba(136,146,170,0.6);letter-spacing:1px;margin-top:auto;padding-top:16px;border-top:1px solid var(--border) }
        .story-badge { font-family:'Inter',system-ui,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--amber);opacity:.7 }

        /* ── PLATFORM TILES ── */
        .platform-section { background:var(--obsidian);padding:100px 40px }
        .platform-grid { display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,0.06);margin-top:48px }
        .platform-tile { background:var(--charcoal);padding:40px 32px }
        .platform-tile-icon { font-size:20px;color:var(--amber);margin-bottom:16px;display:block }
        .platform-tile-title { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--cream);margin-bottom:10px }
        .platform-tile-body { font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--muted);line-height:1.7 }

        /* ── PERSONAS ── */
        .personas-section { background:var(--charcoal);padding:100px 40px }
        .persona-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.06);margin-top:48px }
        .persona-card { background:var(--obsidian);padding:48px 32px }
        .persona-number { font-family:'DM Sans',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:3px;margin-bottom:20px;display:block }
        .persona-headline { font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:var(--cream);margin-bottom:16px;line-height:1.2 }
        .persona-body { font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:28px }
        .persona-cta { font-family:'Inter',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:2px;text-decoration:none;text-transform:uppercase }

        /* ── METHODOLOGY ── */
        .methodology-section { background:var(--obsidian);padding:100px 40px;border-top:1px solid var(--border) }
        .methodology-grid { display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,0.06);margin-top:48px }
        .methodology-card { background:var(--charcoal);padding:48px 36px }
        .methodology-number { font-family:'DM Sans',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:3px;margin-bottom:16px;display:block }
        .methodology-title { font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:var(--cream);margin-bottom:12px }
        .methodology-body { font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:24px }
        .methodology-capstone-label { font-family:'Inter',system-ui,sans-serif;font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--amber);margin-bottom:4px;display:block }
        .methodology-capstone { font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--cream) }
        .methodology-note { font-family:'Inter',system-ui,sans-serif;font-size:12px;color:var(--muted);margin-top:32px;line-height:1.6;max-width:700px }
        .methodology-actions { display:flex;gap:16px;flex-wrap:wrap;margin-top:32px }

        /* ── FOUNDER ── */
        .founder-section { background:var(--charcoal);padding:100px 40px }
        .founder-grid { display:grid;grid-template-columns:200px 1fr;gap:48px;max-width:900px;margin:0 auto;align-items:start }
        .founder-photo { width:200px;height:200px;background:var(--steel);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden }
        .founder-initials { font-family:'Cormorant Garamond',serif;font-size:56px;font-weight:300;color:var(--amber);opacity:.15;position:absolute }
        .founder-placeholder { font-family:'Inter',system-ui,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);opacity:.4 }
        .founder-name { font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:var(--cream);margin-bottom:4px }
        .founder-title-text { font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--amber);margin-bottom:20px;display:block }
        .founder-bio { font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:300;color:var(--muted);line-height:1.8 }
        .founder-bio p { margin-bottom:16px }
        .founder-bio p:last-child { margin-bottom:0 }
        .founder-credential { font-family:'Inter',system-ui,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--amber);opacity:.6;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);display:block }

        /* ── THREE-PATH CTA ── */
        .cta-section { background:var(--obsidian);padding:100px 40px;border-top:1px solid var(--border) }
        .cta-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.06);margin-bottom:64px }
        .cta-card { background:var(--charcoal);padding:40px 32px }
        .cta-card-number { font-family:'DM Sans',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:3px;margin-bottom:16px;display:block }
        .cta-card-title { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--cream);margin-bottom:12px }
        .cta-card-body { font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px }
        .cta-card-note { font-family:'Inter',system-ui,sans-serif;font-size:11px;color:var(--amber);opacity:.6 }

        /* ── CONTACT FORM ── */
        .contact-grid { display:grid;grid-template-columns:1fr 1fr;gap:80px;max-width:1200px;margin:0 auto;align-items:start }
        .contact-left h2 { font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:var(--cream);margin-bottom:24px;line-height:1.1 }
        .contact-left p { font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);line-height:1.7;margin-bottom:32px }
        .whatsapp-link { display:inline-flex;align-items:center;gap:10px;font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:500;color:var(--amber);text-decoration:none;padding:14px 24px;border:1px solid var(--border);transition:all .2s }
        .whatsapp-link:hover { background:rgba(212,168,67,0.08);border-color:var(--amber) }
        .form-group { display:flex;flex-direction:column;gap:6px;margin-bottom:20px }
        .form-label { font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted) }
        .form-input,.form-textarea { background:var(--steel);border:1px solid var(--border);color:var(--cream);font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;padding:14px 16px;outline:none;transition:border-color .2s;width:100% }
        .form-input:focus,.form-textarea:focus { border-color:var(--amber) }
        .form-textarea { resize:vertical;min-height:140px }
        .form-error { font-family:'Inter',system-ui,sans-serif;font-size:13px;color:#e57373;margin-bottom:16px;padding:12px 16px;background:rgba(229,115,115,0.1);border:1px solid rgba(229,115,115,0.3) }
        .form-submit { width:100%;padding:16px;background:var(--amber);color:var(--obsidian);font-family:'Inter',system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;transition:background .2s }
        .form-submit:hover:not(:disabled) { background:var(--amber-bright) }
        .form-submit:disabled { opacity:.7;cursor:not-allowed }
        .form-input.has-error,.form-textarea.has-error { border-color:#e74c3c }
        .form-success { padding:52px;text-align:center;border:1px solid var(--border);background:rgba(212,168,67,0.08) }
        .form-success h3 { font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:var(--cream);margin-bottom:16px }
        .form-success p { font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);line-height:1.7 }

        /* ── FOOTER ── */
        .footer { background:var(--obsidian);border-top:1px solid var(--border);padding:60px 40px 0 }
        .footer-grid { display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;max-width:1200px;margin:0 auto 48px }
        .footer-logo { font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;letter-spacing:4px;color:var(--cream);display:block;margin-bottom:12px }
        .footer-logo span { color:var(--amber) }
        .footer-tagline { font-family:'Inter',system-ui,sans-serif;font-size:12px;font-weight:300;letter-spacing:2px;color:var(--muted) }
        .footer-links { display:flex;flex-wrap:wrap;gap:8px 24px }
        .footer-links a { font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);transition:color .2s }
        .footer-links a:hover { color:var(--amber) }
        .footer-contact { display:flex;flex-direction:column;gap:12px;align-items:flex-end }
        .footer-contact a { font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);text-decoration:none;transition:color .2s }
        .footer-contact a:hover { color:var(--amber) }
        .footer-bottom { border-top:1px solid var(--border);padding:24px 0;text-align:center;max-width:1200px;margin:0 auto }
        .footer-bottom p { font-family:'Inter',system-ui,sans-serif;font-size:12px;font-weight:300;color:var(--muted) }

        /* ── WHATSAPP FAB ── */
        .wa-fab { position:fixed;bottom:32px;right:32px;z-index:9999;width:56px;height:56px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:background .2s,transform .2s;box-shadow:0 4px 20px rgba(212,168,67,0.35) }
        .wa-fab:hover { background:var(--amber-bright);transform:scale(1.08) }

        /* ── RESPONSIVE ── */
        @media(max-width:900px) {
          .nav { padding:0 24px }
          .nav-links { display:none }
          .nav-toggle { display:flex }
          .hero-headline { font-size:48px }
          .stats-grid { grid-template-columns:repeat(2,1fr) }
          .stat-item:nth-child(2)::after { display:none }
          .stories-grid { grid-template-columns:1fr }
          .platform-grid { grid-template-columns:1fr }
          .persona-grid { grid-template-columns:1fr }
          .methodology-grid { grid-template-columns:1fr }
          .founder-grid { grid-template-columns:1fr;gap:32px }
          .founder-photo { width:120px;height:120px }
          .cta-grid { grid-template-columns:1fr }
          .contact-grid { grid-template-columns:1fr;gap:48px }
          .footer-grid { grid-template-columns:1fr;gap:32px }
          .footer-contact { align-items:flex-start }
          .section { padding:72px 24px }
          .stories-section,.platform-section,.personas-section,.methodology-section,.founder-section,.cta-section { padding:72px 24px }
          .footer { padding:48px 24px 0 }
          .stats-bar { padding:40px 24px }
          .section-heading { font-size:36px }
        }
        @media(max-width:600px) {
          .hero-headline { font-size:40px }
          .stat-item::after { display:none }
          .wa-fab { bottom:20px;right:20px }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <a href="/" className="nav-logo">BISX<span>P</span></a>
        <ul className="nav-links">
          <li><a href="#platforms">Platforms</a></li>
          <li><a href="#platform">The Stack</a></li>
          <li><a href="#who">Who It{"'"}s For</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#contact" className="nav-cta">Start a Project</a>
        <div className="nav-toggle" onClick={() => setMobileNavOpen(o => !o)} aria-label="Toggle navigation">
          <span /><span /><span />
        </div>
      </nav>
      <div className={`mobile-drawer${mobileNavOpen ? ' open' : ''}`}>
        <a href="#platforms" onClick={() => setMobileNavOpen(false)}>Platforms</a>
        <a href="#platform" onClick={() => setMobileNavOpen(false)}>The Stack</a>
        <a href="#who" onClick={() => setMobileNavOpen(false)}>Who It{"'"}s For</a>
        <a href="#contact" onClick={() => setMobileNavOpen(false)}>Contact</a>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <HeroCanvas />
        <div className="hero-inner">
          <span className="hero-eyebrow">AI-Native Marketplace Platform</span>
          <h1 className="hero-headline">
            {s.hero_headline || 'The Platform for'}<br />
            <em>{s.hero_headline_em || 'AI-Native Marketplaces.'}</em>
          </h1>
          <p className="hero-sub">
            {s.hero_subheadline || 'Build marketplace businesses on production-tested architecture. From solo founders to enterprise teams \u2014 launch faster on the stack that powers three live platforms across three countries.'}
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn-primary">Start a Project</a>
            <a href="#partner" className="btn-secondary">Become a Build Partner</a>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{s.stat_1_number || '3'}</span>
            <span className="stat-label">{s.stat_1_label || 'Live Platforms'}</span>
            <span className="stat-sub">{s.stat_1_sub || 'India \u00b7 USA \u00b7 Healthcare'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{s.stat_2_number || '25 yrs'}</span>
            <span className="stat-label">{s.stat_2_label || 'Platform Experience'}</span>
            <span className="stat-sub">{s.stat_2_sub || 'Microsoft \u00b7 AWS \u00b7 Enterprise AI'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{s.stat_3_number || '3'}</span>
            <span className="stat-label">{s.stat_3_label || 'Countries'}</span>
            <span className="stat-sub">{s.stat_3_sub || 'India \u00b7 USA \u00b7 Canada'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{s.stat_4_number || '100%'}</span>
            <span className="stat-label">{s.stat_4_label || 'Hands-on'}</span>
            <span className="stat-sub">{s.stat_4_sub || 'We stay until it ships'}</span>
          </div>
        </div>
      </div>

      {/* ── PARTNER STORIES ── */}
      <section className="stories-section" id="platforms" style={{ display: vis.case_studies ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">Built on BISXP</span>
          <h2 className="section-heading">Three industries. Three countries.</h2>
          <p className="section-intro">Every platform below runs on the BISXP stack. Different vertical, different geography, same foundation.</p>
          <div className="stories-grid">
            {caseStudies.map(cs => (
              <div className="story-card" key={cs.id}>
                <span className="story-eyebrow">{cs.eyebrow}</span>
                <h3 className="story-title">{cs.title}</h3>
                {cs.problem_quote && <p className="story-quote">{cs.problem_quote}</p>}
                {cs.what_we_built && <p className="story-built">{cs.what_we_built}</p>}
                {cs.status_badge && <span className="story-badge">{cs.status_badge}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM COMPONENTS ── */}
      <section className="platform-section" id="platform" style={{ display: vis.platform ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">The Platform</span>
          <h2 className="section-heading">{s.platform_section_heading || 'Everything a marketplace needs. Built once.'}</h2>
          <p className="section-intro">{s.platform_intro || 'The BISXP platform is a full-stack foundation for marketplace businesses. Every component is production-tested across live deployments.'}</p>
          <div className="platform-grid">
            {PLATFORM_TILES.map((t, i) => (
              <div className="platform-tile" key={i}>
                <span className="platform-tile-icon">{t.icon}</span>
                <h3 className="platform-tile-title">{t.title}</h3>
                <p className="platform-tile-body">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO BUILDS ON BISXP ── */}
      <section className="personas-section" id="who" style={{ display: vis.personas ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">Who It{"'"}s For</span>
          <h2 className="section-heading">{s.personas_section_heading || 'Three paths. One platform.'}</h2>
          <div className="persona-grid">
            <div className="persona-card">
              <span className="persona-number">01</span>
              <h3 className="persona-headline">You have the vertical. We have the stack.</h3>
              <p className="persona-body">You understand your market better than any agency ever will. What you don{"'"}t have is 12 months to build marketplace infrastructure. BISXP gives you a production-grade foundation so you can launch in weeks and focus on customers, not code.</p>
              <a href="#contact" className="persona-cta">Start a Project &rarr;</a>
            </div>
            <div className="persona-card">
              <span className="persona-number">02</span>
              <h3 className="persona-headline">Build faster. Deliver better.</h3>
              <p className="persona-body">Your clients need marketplace products. Scope, estimate, and deliver with confidence on a stack you know works. BISXP Build Partners get access to the full platform architecture and a partner listing that signals quality to enterprise buyers.</p>
              <a href="#partner" className="persona-cta">Become a Build Partner &rarr;</a>
            </div>
            <div className="persona-card">
              <span className="persona-number">03</span>
              <h3 className="persona-headline">Your vertical needs a marketplace.</h3>
              <p className="persona-body">You{"'"}ve identified the opportunity. You need a partner who has already solved the infrastructure problem &mdash; owner portals, multi-tenant architecture, subscription billing, AI integration &mdash; so your team can focus on your vertical.</p>
              <a href="#contact" className="persona-cta">Start a Project &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="methodology-section" id="methodology" style={{ display: vis.methodology ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">BISXP Methodology</span>
          <h2 className="section-heading">{s.methodology_section_heading || 'The system behind the platform.'}</h2>
          <p className="section-intro">{s.methodology_intro || 'A structured approach to building AI-native products \u2014 from architecture decisions on day one through to GTM and scaling. Delivered by certified training partners.'}</p>
          <div className="methodology-grid">
            <div className="methodology-card">
              <span className="methodology-number">TRACK 01</span>
              <h3 className="methodology-title">{s.methodology_track1_title || 'Marketplace Building'}</h3>
              <p className="methodology-body">{s.methodology_track1_body || 'Learn to architect, build, and launch a two-sided marketplace. Capstone: a live marketplace deployed to production.'}</p>
              <span className="methodology-capstone-label">Capstone</span>
              <span className="methodology-capstone">Live marketplace deployed to production</span>
            </div>
            <div className="methodology-card">
              <span className="methodology-number">TRACK 02</span>
              <h3 className="methodology-title">{s.methodology_track2_title || 'AI Data Engineering'}</h3>
              <p className="methodology-body">{s.methodology_track2_body || 'Learn to build the data pipelines and AI workflows that power modern marketplace intelligence.'}</p>
              <span className="methodology-capstone-label">Capstone</span>
              <span className="methodology-capstone">Production AI data pipeline</span>
            </div>
          </div>
          <p className="methodology-note">BISXP drives all training leads and revenue. Certified partners deliver engagements and are paid per cohort.</p>
          <div className="methodology-actions">
            <a href="#partner" className="btn-secondary">Become a Training Partner &rarr;</a>
            <a href="#partner" className="btn-secondary">Become a Build Partner &rarr;</a>
          </div>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section className="founder-section" style={{ display: vis.team ? '' : 'none' }}>
        <div className="container">
          <span className="section-eyebrow">The Team</span>
          <h2 className="section-heading">{s.team_section_heading || 'Built by someone who has done it at scale.'}</h2>
          <div className="founder-grid">
            <div className="founder-photo">
              <span className="founder-initials">{tharif?.initials || 'TA'}</span>
              {tharif?.photo_url
                ? <img src={tharif.photo_url} alt={tharif.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="founder-placeholder">Photo coming soon</span>
              }
            </div>
            <div>
              <h3 className="founder-name">{tharif?.name || 'Tharif Afzal'}</h3>
              <span className="founder-title-text">{tharif?.title || 'Founder & CEO'}</span>
              <div className="founder-bio">
                {tharif?.bio
                  ? tharif.bio.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
                  : <>
                      <p>Tharif Afzal spent 25 years building data infrastructure at hyperscale &mdash; 16 years at Microsoft leading cloud modernisation programs, then AWS engineering Amazon AppFlow and AWS Glue Streaming, including Zero ETL integrations for Salesforce, SAP, and ServiceNow. He holds US Patent 11435871 for workflow execution architecture.</p>
                      <p>BISXP is built on the conviction that the same architectural discipline that makes hyperscale systems reliable can be applied to build AI-native marketplace products faster, and with more precision, than traditional development allows.</p>
                      <p>The three live platforms across three countries are the proof.</p>
                    </>
                }
              </div>
              {tharif?.credential_label && <span className="founder-credential">{tharif.credential_label}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE-PATH CTA ── */}
      <section className="cta-section" id="partner">
        <div className="container" id="contact">
          <span className="section-eyebrow">Get Started</span>
          <h2 className="section-heading">{s.contact_heading || 'Three ways to work with BISXP.'}</h2>
          <div className="cta-grid">
            <div className="cta-card">
              <span className="cta-card-number">01</span>
              <h3 className="cta-card-title">Start a Project</h3>
              <p className="cta-card-body">You have a marketplace idea or an existing business that needs a platform. Tell us what you{"'"}re building.</p>
              <span className="cta-card-note">&darr; Use the form below</span>
            </div>
            <div className="cta-card">
              <span className="cta-card-number">02</span>
              <h3 className="cta-card-title">Become a Build Partner</h3>
              <p className="cta-card-body">You{"'"}re an agency, freelancer, or technical founder who wants to build marketplace products on the BISXP platform.</p>
              <span className="cta-card-note">&darr; Use the form below</span>
            </div>
            <div className="cta-card">
              <span className="cta-card-number">03</span>
              <h3 className="cta-card-title">Become a Training Partner</h3>
              <p className="cta-card-body">You want to deliver the BISXP Methodology to founders and teams. Apply to become a certified training partner.</p>
              <a href="/method" className="persona-cta">Learn about the Methodology &rarr;</a>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="contact-grid">
            <div className="contact-left">
              <h2>{s.contact_heading || 'Start a conversation.'}</h2>
              <p>{s.contact_subheading || 'Tell us which path fits you. We\u2019ll respond within 24 hours.'}</p>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Or message us directly on WhatsApp
              </a>
            </div>
            <div>
              {formState === 'success' ? (
                <div className="form-success">
                  <h3>{s.contact_success_heading || 'Thank you.'}</h3>
                  <p>{s.contact_success_body || "We\u2019ll be in touch within 24 hours."}</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label">Name<span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
                    <input className={`form-input${(touched.name || submitAttempted) && errors.name ? ' has-error' : ''}`} type="text" value={formData.name} onChange={updateField('name')} onBlur={() => handleBlur('name')} placeholder="Your full name" />
                    {(touched.name || submitAttempted) && errors.name && <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#e74c3c', fontFamily: "'Inter',sans-serif" }}>{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email<span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
                    <input className={`form-input${(touched.email || submitAttempted) && errors.email ? ' has-error' : ''}`} type="email" value={formData.email} onChange={updateField('email')} onBlur={() => handleBlur('email')} placeholder="you@company.com" />
                    {(touched.email || submitAttempted) && errors.email && <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#e74c3c', fontFamily: "'Inter',sans-serif" }}>{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className={`form-input${(touched.phone || submitAttempted) && errors.phone ? ' has-error' : ''}`} type="tel" value={formData.phone} onChange={updateField('phone')} onBlur={() => handleBlur('phone')} placeholder="+1 234 567 8900" />
                    {(touched.phone || submitAttempted) && errors.phone && <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#e74c3c', fontFamily: "'Inter',sans-serif" }}>{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" type="text" value={formData.company} onChange={updateField('company')} placeholder="Your company" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">I{"'"}m interested in</label>
                    <input className="form-input" list="btype" name="business_type" value={formData.business_type || ''} onChange={e => setFormData(prev => ({ ...prev, business_type: e.target.value }))} placeholder="Select or type" autoComplete="off" />
                    <datalist id="btype">
                      <option value="Start a Project" />
                      <option value="Become a Build Partner" />
                      <option value="Become a Training Partner" />
                      <option value="Marketplace" />
                      <option value="AI Integration" />
                      <option value="Other" />
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message<span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span></label>
                    <textarea className={`form-textarea${(touched.message || submitAttempted) && errors.message ? ' has-error' : ''}`} value={formData.message} onChange={updateField('message')} onBlur={() => handleBlur('message')} placeholder="Tell us what you're building, or which partnership path interests you..." />
                    {(touched.message || submitAttempted) && errors.message && <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#e74c3c', fontFamily: "'Inter',sans-serif" }}>{errors.message}</span>}
                  </div>
                  {(formState === 'error' || formError) && <div className="form-error">{formError}</div>}
                  <button type="submit" className="form-submit" disabled={formState === 'loading' || (submitAttempted && Object.keys(validateAll()).length > 0)}>
                    {formState === 'loading' ? 'Sending\u2026' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <span className="footer-logo">BISX<span>P</span></span>
            <p className="footer-tagline">The Platform for AI-Native Marketplaces</p>
          </div>
          <div>
            <div className="footer-links">
              <a href="#platforms">Platforms</a>
              <a href="#platform">The Stack</a>
              <a href="#who">Who It{"'"}s For</a>
              <a href="#methodology">Methodology</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div className="footer-contact">
            <a href="mailto:hello@bisxp.com">hello@bisxp.com</a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 BISXP. All rights reserved.</p>
        </div>
      </footer>

      {/* ── WHATSAPP FAB ── */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="wa-fab" aria-label="Chat on WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--obsidian)"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  )
}
