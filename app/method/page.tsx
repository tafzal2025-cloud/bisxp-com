'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

const PAINS = [
  { number: '01', pain: 'Agents that demo brilliantly and hallucinate in production.', insight: 'The gap between a working demo and a reliable production agent is not a model problem. It is a structure problem. Without defined boundaries, fallbacks, and behavioral contracts, every agent is one edge case away from failure.' },
  { number: '02', pain: 'Prompts that break when anything changes.', insight: 'Brittle prompts are the symptom of building without a prompt architecture. The BISXP methodology treats prompts as first-class engineering artifacts \u2014 versioned, tested, and separated by concern.' },
  { number: '03', pain: 'No way to test non-deterministic output.', insight: 'You cannot unit test a language model. You can test the behavior your system should exhibit regardless of what the model returns. Behavioral assertions, not output matching, are how BISXP systems are tested.' },
  { number: '04', pain: 'Agents that lose context across sessions.', insight: "Context is not the model's job. It is the architecture's job. BISXP systems maintain explicit context files that agents read at session start \u2014 making every session continuation, not repetition." },
  { number: '05', pain: 'Features built before they are designed.', insight: 'Most agentic AI development starts with code. BISXP starts with a FEATURE.md \u2014 a structured specification that defines the problem, acceptance criteria, file impact, and SOLID audit before an agent writes a single line.' },
  { number: '06', pain: 'Cost spirals from uncontrolled agent loops.', insight: 'Agents without circuit breakers will run until they succeed or you run out of budget. BISXP systems define explicit session contracts \u2014 scope, deliverables, and stop conditions \u2014 before every agent session begins.' },
]

const ARTIFACTS = [
  { name: 'FEATURE.md', role: 'The Blueprint', description: "Every feature starts here. Problem statement, acceptance criteria, file impact table, SOLID audit, API contracts, and database schema \u2014 all defined before the agent writes a single line of code.", example: 'Sessions 3\u20135 of BISXP.com were each driven by a FEATURE.md that specified exactly what would be built, in what order, and what \u201cdone\u201d meant.' },
  { name: 'CLAUDE.md', role: 'Standing Instructions', description: "The agent's permanent operating manual for a project. What stack is in use. What patterns are forbidden. What the agent must always do before starting and before committing.", example: 'BISXP projects have rules like \u201cnever use getSession() \u2014 always getUser()\u201d and \u201cnever hardcode colors.\u201d These live in CLAUDE.md, not in every prompt.' },
  { name: 'CLAUDE_CONTEXT.md', role: 'Shared Memory', description: 'The complete state of a project at any point in time. Database schema, API routes, file structure, auth patterns, pending backlog. The agent reads this at session start and updates it at session end.', example: 'When a new Claude Code session opens after weeks away, reading CLAUDE_CONTEXT.md takes 30 seconds and produces a SESSION START REPORT proving full system awareness.' },
  { name: 'SESSION_CONTRACT.md', role: 'Session Scope', description: "Defines exactly what one session will build \u2014 no more, no less. Roles, rules, branch strategy, and explicit stop conditions. Prevents scope creep and context drift.", example: 'Every BISXP session ends with a SESSION OBSERVATION BLOCK \u2014 test count before and after, files changed, debt added, debt resolved.' },
  { name: 'SESSION_OBSERVATIONS.md', role: 'Institutional Memory', description: 'What was built in every session. What broke. What the root cause was. What was learned. This is how a development system gets smarter over time.', example: 'The lesson \u201ccookie setAll() is a no-op in layouts\u201d is in SESSION_OBSERVATIONS.md. It will never happen again on a BISXP project.' },
  { name: 'Skills/', role: 'Reusable Capabilities', description: 'Modular instruction sets the agent loads on demand. A SKILL.md for PDF generation, one for Supabase patterns, one for API routes. The agent reads the relevant skill before starting work.', example: 'The PDF generation skill encodes hard-won lessons: TTF fonts only, footers must be position:absolute. Skills are how institutional knowledge becomes repeatable capability.' },
  { name: 'TECHNICAL_DEBT.md', role: 'Honest Accounting', description: 'Every shortcut taken, every file over the line limit, every pattern that needs refactoring \u2014 tracked explicitly with priority levels.', example: 'When app/page.tsx reached 1,812 lines, it was Priority 1. Session 5 resolved it \u2014 1,596 lines removed, debt closed.' },
]

export default function MethodPage() {
  const [formData, setFormData] = useState({ name: '', email: '', organisation: '', track: '', message: '' })
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.track) return
    setFormState('loading')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, business_type: 'BISXP Methodology \u2014 ' + formData.track, message: formData.message || 'Methodology application' }),
      })
      if (!res.ok) throw new Error()
      setFormState('success')
    } catch { setFormState('error') }
  }

  return (
    <>
      <style>{`
        .m-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:72px;backdrop-filter:blur(16px);background:rgba(27,31,46,0.92);border-bottom:1px solid var(--border)}
        .m-nav-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;letter-spacing:4px;color:var(--cream);text-decoration:none}.m-nav-logo span{color:var(--amber)}
        .m-nav-back{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .2s}.m-nav-back:hover{color:var(--amber)}
        .m-hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 40px 80px;background:radial-gradient(ellipse at 40% 50%,#242844 0%,var(--obsidian) 70%);text-align:center}
        .m-hero-inner{max-width:800px}
        .m-eyebrow{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:5px;text-transform:uppercase;color:var(--amber);margin-bottom:24px;display:block}
        .m-hero h1{font-family:'Cormorant Garamond',serif;font-size:clamp(48px,7vw,80px);font-weight:300;line-height:.95;color:var(--cream);margin-bottom:32px}.m-hero h1 em{color:var(--amber);font-style:italic}
        .m-hero-sub{font-family:'Inter',system-ui,sans-serif;font-size:18px;font-weight:300;color:var(--muted);line-height:1.7;max-width:600px;margin:0 auto 48px}
        .m-hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
        .m-btn-p{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;background:var(--amber);color:var(--obsidian);text-decoration:none;display:inline-block}.m-btn-p:hover{background:var(--amber-bright)}
        .m-btn-o{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:13px 32px;border:1px solid rgba(212,168,67,0.4);color:var(--amber);text-decoration:none;display:inline-block}.m-btn-o:hover{background:rgba(212,168,67,0.08)}
        .m-section{padding:100px 40px}.m-container{max-width:1100px;margin:0 auto}
        .m-sh{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:300;color:var(--cream);margin-bottom:24px;line-height:1.05}
        .m-si{font-family:'Inter',system-ui,sans-serif;font-size:16px;font-weight:300;color:var(--muted);line-height:1.75;max-width:680px;margin-bottom:64px}
        .m-pain-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,0.06)}
        .m-pain-card{background:var(--obsidian);padding:40px 36px}
        .m-pain-num{font-family:'DM Sans',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:3px;margin-bottom:16px;display:block}
        .m-pain-stmt{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;color:var(--cream);line-height:1.25;margin-bottom:16px;font-style:italic}
        .m-pain-ins{font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--muted);line-height:1.7}
        .m-art-list{display:flex;flex-direction:column;gap:1px;background:rgba(255,255,255,0.06)}
        .m-art{background:var(--charcoal);padding:40px 48px;display:grid;grid-template-columns:220px 1fr;gap:48px;align-items:start}
        .m-art-name{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:var(--amber);display:block;margin-bottom:6px}
        .m-art-role{font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--muted)}
        .m-art-desc{font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);line-height:1.75;margin-bottom:16px}
        .m-art-ex{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:rgba(212,168,67,0.6);line-height:1.6;border-left:2px solid rgba(212,168,67,0.25);padding-left:16px}
        .m-how-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,0.06)}
        .m-how-step{background:var(--obsidian);padding:40px 28px}
        .m-how-num{font-family:'DM Sans',system-ui,sans-serif;font-size:48px;font-weight:300;color:rgba(212,168,67,0.15);line-height:1;margin-bottom:16px;display:block}
        .m-how-t{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--cream);margin-bottom:12px}
        .m-how-b{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);line-height:1.7}
        .m-trk-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,0.06)}
        .m-trk{background:var(--charcoal);padding:56px 40px}
        .m-trk-num{font-family:'DM Sans',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:3px;margin-bottom:20px;display:block}
        .m-trk-title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;color:var(--cream);margin-bottom:16px}
        .m-trk-body{font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);line-height:1.75;margin-bottom:32px}
        .m-trk-mods{display:flex;flex-direction:column;gap:8px;margin-bottom:32px}
        .m-trk-mod{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);padding:8px 12px;border:1px solid var(--border);display:flex;align-items:center;gap:10px}
        .m-trk-mod::before{content:'';width:4px;height:4px;background:var(--amber);border-radius:50%;flex-shrink:0}
        .m-trk-cap{border-top:1px solid var(--border);padding-top:24px}
        .m-trk-cap-l{font-family:'Inter',system-ui,sans-serif;font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--amber);margin-bottom:8px;display:block}
        .m-trk-cap-v{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:300;color:var(--cream)}
        .m-who-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.06)}
        .m-who-card{background:var(--obsidian);padding:40px 32px}
        .m-who-t{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--cream);margin-bottom:12px}
        .m-who-b{font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--muted);line-height:1.7}
        .m-apply-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;max-width:1100px;margin:0 auto;align-items:start}
        .m-apply-left h2{font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:var(--cream);margin-bottom:24px;line-height:1.1}
        .m-apply-left p{font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);line-height:1.75;margin-bottom:20px}
        .m-apply-note{font-family:'Inter',system-ui,sans-serif;font-size:12px;color:rgba(212,168,67,0.5);letter-spacing:1px;line-height:1.6;border-left:2px solid rgba(212,168,67,0.2);padding-left:14px}
        .m-fg{margin-bottom:20px}.m-fl{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:6px}
        .m-fi,.m-fs,.m-ft{width:100%;background:var(--steel);border:1px solid var(--border);color:var(--cream);font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;padding:14px 16px;outline:none;transition:border-color .2s}
        .m-fi:focus,.m-fs:focus,.m-ft:focus{border-color:var(--amber)}.m-fs{appearance:none;cursor:pointer}.m-ft{resize:vertical;min-height:120px}
        .m-submit{width:100%;padding:16px;background:var(--amber);color:var(--obsidian);font-family:'Inter',system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;transition:background .2s}.m-submit:hover:not(:disabled){background:var(--amber-bright)}.m-submit:disabled{opacity:.7;cursor:not-allowed}
        .m-success{padding:52px;text-align:center;border:1px solid var(--border);background:rgba(212,168,67,0.06)}.m-success h3{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;color:var(--cream);margin-bottom:12px}.m-success p{font-family:'Inter',system-ui,sans-serif;font-size:15px;color:var(--muted)}
        .m-footer{background:var(--charcoal);border-top:1px solid var(--border);padding:40px;text-align:center}.m-footer p{font-family:'Inter',system-ui,sans-serif;font-size:12px;color:var(--muted)}
        @media(max-width:900px){.m-nav{padding:0 24px}.m-hero{padding:100px 24px 60px}.m-section{padding:72px 24px}.m-pain-grid,.m-trk-grid{grid-template-columns:1fr}.m-art{grid-template-columns:1fr;gap:16px}.m-how-grid{grid-template-columns:1fr 1fr}.m-who-grid{grid-template-columns:1fr}.m-apply-grid{grid-template-columns:1fr;gap:48px}.m-sh{font-size:36px}}
        @media(max-width:600px){.m-how-grid{grid-template-columns:1fr}.m-hero h1{font-size:40px}}
      `}</style>

      <nav className="m-nav">
        <Link href="/" className="m-nav-logo">BISX<span>P</span></Link>
        <Link href="/" className="m-nav-back">&larr; Back to BISXP.com</Link>
      </nav>

      <section className="m-hero">
        <div className="m-hero-inner">
          <span className="m-eyebrow">BISXP Methodology</span>
          <h1>The structure that makes<br /><em>agentic AI development</em><br />actually work.</h1>
          <p className="m-hero-sub">Most teams treat AI agents as a shortcut. BISXP treats them as a discipline. The methodology is a complete operating system for building AI-native products &mdash; proven across four live platforms, hundreds of sessions, and thousands of lines of production code.</p>
          <div className="m-hero-actions">
            <a href="#apply" className="m-btn-p">Apply to the Programme</a>
            <a href="#methodology" className="m-btn-o">Explore the Methodology</a>
          </div>
        </div>
      </section>

      <section className="m-section" id="methodology" style={{ background: 'var(--charcoal)', borderTop: '1px solid var(--border)' }}>
        <div className="m-container">
          <span className="m-eyebrow">The Real Problem</span>
          <h2 className="m-sh">You have tried building with AI agents.<br />Here is what actually went wrong.</h2>
          <p className="m-si">These are not hypothetical problems. They are the exact failures that every team hits when they build with AI agents without a structured methodology.</p>
          <div className="m-pain-grid">
            {PAINS.map(p => (
              <div className="m-pain-card" key={p.number}>
                <span className="m-pain-num">{p.number}</span>
                <p className="m-pain-stmt">&ldquo;{p.pain}&rdquo;</p>
                <p className="m-pain-ins">{p.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="m-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="m-container">
          <span className="m-eyebrow">The Methodology Backbone</span>
          <h2 className="m-sh">Seven artifacts.<br />One operating system.</h2>
          <p className="m-si">Before a single line of code is written, BISXP projects build the structural foundation that makes every subsequent decision faster, every agent session more reliable, and every feature more maintainable.</p>
          <div className="m-art-list">
            {ARTIFACTS.map(a => (
              <div className="m-art" key={a.name}>
                <div><span className="m-art-name">{a.name}</span><span className="m-art-role">{a.role}</span></div>
                <div><p className="m-art-desc">{a.description}</p><p className="m-art-ex">{a.example}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="m-section" style={{ background: 'var(--charcoal)', borderTop: '1px solid var(--border)' }}>
        <div className="m-container">
          <span className="m-eyebrow">How It Works</span>
          <h2 className="m-sh">The session rhythm<br />that ships production code.</h2>
          <p className="m-si">Every BISXP development session follows the same rhythm &mdash; whether it is a solo founder or an enterprise team.</p>
          <div className="m-how-grid">
            <div className="m-how-step"><span className="m-how-num">01</span><h3 className="m-how-t">Design in Claude.ai</h3><p className="m-how-b">Every feature starts in the planning environment. Write the FEATURE.md. Define acceptance criteria. Identify file impact. The agent cannot start until the blueprint is complete.</p></div>
            <div className="m-how-step"><span className="m-how-num">02</span><h3 className="m-how-t">Execute in Claude Code</h3><p className="m-how-b">The agent reads CLAUDE_CONTEXT.md, reads the FEATURE.md, and produces a SESSION START REPORT before writing a single line. Context is never assumed.</p></div>
            <div className="m-how-step"><span className="m-how-num">03</span><h3 className="m-how-t">Test before commit</h3><p className="m-how-b">TypeScript check must pass clean. Unit tests must pass. No exceptions. The agent documents new debt and updates SESSION_OBSERVATIONS.md with what was built.</p></div>
            <div className="m-how-step"><span className="m-how-num">04</span><h3 className="m-how-t">Ship and advance</h3><p className="m-how-b">Every commit goes to develop, not main. CLAUDE_CONTEXT.md is updated. The next session starts with full knowledge of what was built &mdash; and the system gets smarter.</p></div>
          </div>
        </div>
      </section>

      <section className="m-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="m-container">
          <span className="m-eyebrow">The Programme</span>
          <h2 className="m-sh">Two tracks.<br />Two capstone deployments.</h2>
          <p className="m-si">Each track is hands-on from day one. You will build real systems using the BISXP methodology &mdash; not toy examples.</p>
          <div className="m-trk-grid">
            <div className="m-trk">
              <span className="m-trk-num">TRACK 01</span>
              <h3 className="m-trk-title">Marketplace Building</h3>
              <p className="m-trk-body">Learn to architect, build, and launch a two-sided marketplace using the BISXP stack and methodology. Every session follows the BISXP rhythm.</p>
              <div className="m-trk-mods">
                {['The BISXP architecture and why it works', 'FEATURE.md design and SOLID auditing', 'Multi-sided listings and owner portals', 'Enquiry pipelines and subscription tiers', 'AI integration \u2014 matching, scoring, generation', 'Testing non-deterministic AI output', 'Production deployment and observability'].map(m => <div className="m-trk-mod" key={m}>{m}</div>)}
              </div>
              <div className="m-trk-cap"><span className="m-trk-cap-l">Capstone</span><span className="m-trk-cap-v">A live two-sided marketplace deployed to production</span></div>
            </div>
            <div className="m-trk">
              <span className="m-trk-num">TRACK 02</span>
              <h3 className="m-trk-title">AI Data Engineering</h3>
              <p className="m-trk-body">The AI-driven data ecosystem has expanded far beyond pipelines. This track covers semantic search, vector databases, RAG architectures, embedding models, and the infrastructure that makes AI products work at scale.</p>
              <div className="m-trk-mods">
                {['Vector databases and semantic search', 'RAG architecture patterns and pitfalls', 'Embedding models \u2014 selection and fine-tuning', 'Real-time streaming for AI feature pipelines', 'Data quality for model training and RAG', 'Feature stores and inference infrastructure', 'AI-powered analytics and recommendation systems'].map(m => <div className="m-trk-mod" key={m}>{m}</div>)}
              </div>
              <div className="m-trk-cap"><span className="m-trk-cap-l">Capstone</span><span className="m-trk-cap-v">A production AI data pipeline with semantic search</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="m-section" style={{ background: 'var(--charcoal)', borderTop: '1px solid var(--border)' }}>
        <div className="m-container">
          <span className="m-eyebrow">Who Should Apply</span>
          <h2 className="m-sh">This programme is not for everyone.<br />It is for the right people.</h2>
          <div className="m-who-grid">
            <div className="m-who-card"><h3 className="m-who-t">Technical Founders</h3><p className="m-who-b">You are building a product with AI agents and hitting the walls &mdash; brittleness, cost spirals, context loss. You want a structured methodology that makes your development process reliable.</p></div>
            <div className="m-who-card"><h3 className="m-who-t">Senior Engineers &amp; Architects</h3><p className="m-who-b">You understand software engineering principles and you want to apply them to AI-native development. You want patterns, not prompts &mdash; a methodology that scales to production complexity.</p></div>
            <div className="m-who-card"><h3 className="m-who-t">Training Partners</h3><p className="m-who-b">You want to deliver this methodology to your clients or organisation. BISXP certifies training partners who can run these tracks independently &mdash; with BISXP driving leads and revenue.</p></div>
          </div>
        </div>
      </section>

      <section className="m-section" id="apply" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="m-apply-grid">
          <div className="m-apply-left">
            <h2>Apply to the<br />BISXP Methodology<br />Programme.</h2>
            <p>Tell us which track interests you and what you are building. We will respond within 48 hours.</p>
            <p>Whether you want to attend a track, become a training partner, or bring the methodology to your organisation &mdash; this is where it starts.</p>
            <p className="m-apply-note">BISXP drives all training leads and revenue. Certified partners deliver engagements and are paid per cohort.</p>
          </div>
          <div>
            {formState === 'success' ? (
              <div className="m-success"><h3>Application received.</h3><p>We will be in touch within 48 hours.</p></div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="m-fg"><label className="m-fl">Name *</label><input className="m-fi" type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" required /></div>
                <div className="m-fg"><label className="m-fl">Email *</label><input className="m-fi" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" required /></div>
                <div className="m-fg"><label className="m-fl">Organisation</label><input className="m-fi" type="text" value={formData.organisation} onChange={e => setFormData(p => ({ ...p, organisation: e.target.value }))} placeholder="Your company or institution" /></div>
                <div className="m-fg"><label className="m-fl">I am interested in *</label><select className="m-fs" value={formData.track} onChange={e => setFormData(p => ({ ...p, track: e.target.value }))} required><option value="">Select a path</option><option value="Attending — Marketplace Building track">Attending &mdash; Marketplace Building track</option><option value="Attending — AI Data Engineering track">Attending &mdash; AI Data Engineering track</option><option value="Attending — both tracks">Attending &mdash; both tracks</option><option value="Becoming a Training Partner">Becoming a Training Partner</option><option value="Bringing the methodology to my organisation">Bringing the methodology to my organisation</option></select></div>
                <div className="m-fg"><label className="m-fl">What are you building?</label><textarea className="m-ft" value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="Tell us what you are working on and what problem you are trying to solve." /></div>
                {formState === 'error' && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 16 }}>Something went wrong. Please try again or email hello@bisxp.com</p>}
                <button type="submit" className="m-submit" disabled={formState === 'loading' || !formData.name || !formData.email || !formData.track}>{formState === 'loading' ? 'Submitting\u2026' : 'Submit Application'}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="m-footer"><p>&copy; 2026 BISXP. All rights reserved. &middot; <Link href="/" style={{ color: 'inherit' }}>bisxp.com</Link></p></footer>
    </>
  )
}
