'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

const PAINS = [
  { number: '01', pain: 'AI agents that work in demos and fail in production.', insight: 'The gap between a promising prototype and a reliable production system is not a model problem \u2014 it is a structure problem. Without defined boundaries, clear handoffs, and behavioral contracts, every agent deployment is one edge case away from failure in front of a customer.' },
  { number: '02', pain: 'Development velocity that collapses after the first sprint.', insight: 'Teams building with AI agents often move fast in week one and grind to a halt by week four. Without a shared context system, every new session starts from scratch \u2014 re-explaining decisions, re-discovering constraints, re-solving problems already solved.' },
  { number: '03', pain: 'No way to hold AI-assisted development accountable.', insight: 'When an agent writes the code, who is responsible for the architecture? BISXP answers this by making every decision traceable \u2014 what was built, why it was built that way, and what the acceptance criteria were.' },
  { number: '04', pain: 'Features that ship before they are designed.', insight: 'The speed of AI code generation creates a dangerous illusion: that building fast is the same as building right. BISXP inverts this \u2014 every feature is fully specified before development begins.' },
  { number: '05', pain: 'Technical debt that accumulates invisibly.', insight: 'In AI-assisted development, debt can accumulate across sessions without any human ever noticing \u2014 until a new feature breaks three old ones. BISXP tracks debt explicitly, every session.' },
  { number: '06', pain: 'Cost and time overruns with no clear cause.', insight: 'Unscoped agent sessions are the agentic equivalent of scope creep \u2014 except faster and harder to detect. BISXP defines explicit session contracts: what will be built, what will not be touched, and what done looks like.' },
]

const ARTIFACTS = [
  { name: 'FEATURE.md', role: 'The Blueprint', description: 'Every feature begins as a structured specification \u2014 problem statement, success criteria, system impact, and architecture decisions. The agent cannot write a single line until the blueprint is complete and approved.', proof: 'Four platforms across three countries built session by session, each one shipping exactly what was scoped \u2014 no architectural regressions, no surprise dependencies.' },
  { name: 'CLAUDE.md', role: 'Standing Instructions', description: 'The permanent operating manual for every AI agent working on a project. Technology choices, forbidden patterns, quality gates, and non-negotiable rules \u2014 all defined once, enforced in every session.', proof: 'Consistent architecture patterns enforced across 17+ development sessions on a single platform \u2014 without a single regression from context loss.' },
  { name: 'CLAUDE_CONTEXT.md', role: 'Shared Memory', description: 'The complete, current state of a project \u2014 database schema, API contracts, authentication patterns, pending decisions. Every agent session begins by reading this file and verifying its understanding before touching anything.', proof: 'A new development session on a six-month-old codebase reaches full context in under a minute \u2014 with verified awareness of every architectural decision ever made.' },
  { name: 'SESSION_CONTRACT.md', role: 'Session Scope', description: 'A binding definition of what one development session will deliver \u2014 and what it will not touch. Roles, boundaries, branching rules, and explicit stop conditions are agreed before any agent is invoked.', proof: 'Every session ends with a verifiable delivery report: what was built, what tests confirm it, what debt was introduced, what debt was resolved.' },
  { name: 'SESSION_OBSERVATIONS.md', role: 'Institutional Memory', description: "A permanent record of every session \u2014 what was built, what failed, what the root cause was, and what was learned. Knowledge does not live in any one person's head \u2014 it lives in the system.", proof: 'Critical lessons discovered in production \u2014 edge cases, integration failures, architecture traps \u2014 are captured immediately and surface automatically in every subsequent session.' },
  { name: 'Skills/', role: 'Reusable Capabilities', description: 'Modular, verified instruction sets that agents load on demand. Each skill encodes the hard-won expertise required for a specific capability. Skills are how institutional knowledge becomes a repeatable, scalable asset.', proof: 'Complex capabilities \u2014 PDF generation, video processing, AI-scored media \u2014 delivered consistently across multiple platforms without re-solving the same problems.' },
  { name: 'TECHNICAL_DEBT.md', role: 'Honest Accounting', description: 'Explicit, prioritised tracking of every architectural shortcut, every deferred decision, every pattern that needs revisiting. Debt is visible to every stakeholder, addressed in planned sessions, and closed with a verified resolution.', proof: 'Debt identified, tracked, and resolved on schedule \u2014 keeping codebases maintainable across months of rapid, AI-assisted feature development.' },
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, business_type: 'BISXP Methodology \u2014 ' + formData.track, message: formData.message || 'Methodology application' }),
      })
      if (!res.ok) throw new Error()
      setFormState('success')
    } catch { setFormState('error') }
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box}body{margin:0;background:#1B1F2E;color:#F0EDF8}
        :root{--obsidian:#1B1F2E;--charcoal:#232840;--steel:#2A3050;--amber:#D4A843;--amber-bright:#F0C060;--cream:#F0EDF8;--muted:#8892AA;--border:rgba(255,255,255,0.07)}
        .mn{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:72px;background:rgba(27,31,46,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
        .mn-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;letter-spacing:4px;color:var(--cream);text-decoration:none}.mn-logo span{color:var(--amber)}
        .mn-back{font-family:'Inter',system-ui,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .2s}.mn-back:hover{color:var(--amber)}
        .sec{padding:96px 48px}.con{max-width:1080px;margin:0 auto}
        .ey{font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:var(--amber);display:block;margin-bottom:16px}
        .hd{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,5vw,52px);font-weight:300;color:var(--cream);line-height:1.05;margin-bottom:20px}.hd em{color:var(--amber);font-style:italic}
        .intro{font-family:'Inter',system-ui,sans-serif;font-size:15px;font-weight:300;color:var(--muted);line-height:1.8;max-width:640px;margin-bottom:56px}
        .gg{display:grid;gap:1px;background:rgba(255,255,255,0.07)}
        .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:120px 48px 80px;background:radial-gradient(ellipse at 40% 45%,#252944 0%,var(--obsidian) 65%);text-align:center}
        .hero-inner{max-width:760px}
        .hero h1{font-family:'Cormorant Garamond',serif;font-size:clamp(44px,7vw,76px);font-weight:300;line-height:.95;color:var(--cream);margin-bottom:28px}.hero h1 em{color:var(--amber);font-style:italic}
        .hero-sub{font-family:'Inter',system-ui,sans-serif;font-size:17px;font-weight:300;color:var(--muted);line-height:1.75;max-width:580px;margin:0 auto 44px}
        .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
        .btn-a{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;background:var(--amber);color:var(--obsidian);text-decoration:none;display:inline-block;transition:background .2s}.btn-a:hover{background:var(--amber-bright)}
        .btn-b{font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;padding:13px 32px;border:1px solid rgba(212,168,67,0.35);color:var(--amber);text-decoration:none;display:inline-block;transition:all .2s}.btn-b:hover{background:rgba(212,168,67,0.07)}
        .pg{grid-template-columns:1fr 1fr}.pc{background:var(--obsidian);padding:40px 36px}
        .pn{font-family:'DM Sans',system-ui,sans-serif;font-size:11px;color:var(--amber);letter-spacing:3px;margin-bottom:14px;display:block}
        .pq{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:400;color:var(--cream);line-height:1.3;margin-bottom:14px;font-style:italic}
        .pi{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);line-height:1.75}
        .al{display:flex;flex-direction:column;gap:1px;background:rgba(255,255,255,0.07)}
        .ar{background:var(--charcoal);padding:48px;display:grid;grid-template-columns:240px 1fr;gap:56px;align-items:start}
        .an{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:var(--amber);display:block;margin-bottom:8px;word-break:keep-all}
        .arl{font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--muted)}
        .ad{font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:300;color:var(--muted);line-height:1.8;margin-bottom:18px}
        .ap{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:rgba(212,168,67,0.65);line-height:1.65;padding:12px 16px;border-left:2px solid rgba(212,168,67,0.2);background:rgba(212,168,67,0.03)}
        .hg{grid-template-columns:repeat(4,1fr)}.hs{background:var(--obsidian);padding:40px 28px}
        .hn{font-family:'DM Sans',system-ui,sans-serif;font-size:52px;font-weight:300;color:rgba(212,168,67,0.12);line-height:1;margin-bottom:16px;display:block}
        .ht{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:300;color:var(--cream);margin-bottom:12px}
        .hb{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);line-height:1.75}
        .tg{grid-template-columns:1fr 1fr}.tc{background:var(--charcoal);padding:52px 40px}
        .tn{font-family:'DM Sans',system-ui,sans-serif;font-size:10px;font-weight:600;color:var(--amber);letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;display:block}
        .tt{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:300;color:var(--cream);margin-bottom:16px;line-height:1.1}
        .tb{font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:300;color:var(--muted);line-height:1.8;margin-bottom:32px}
        .tm{display:flex;flex-direction:column;gap:6px;margin-bottom:32px}
        .tmod{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);padding:9px 12px;border:1px solid var(--border);display:flex;align-items:center;gap:10px}
        .tmod::before{content:'';width:3px;height:3px;background:var(--amber);border-radius:50%;flex-shrink:0}
        .tcap{border-top:1px solid var(--border);padding-top:20px;margin-top:8px}
        .tcl{font-family:'Inter',system-ui,sans-serif;font-size:9px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--amber);margin-bottom:8px;display:block}
        .tcv{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:300;color:var(--cream)}
        .wg{grid-template-columns:repeat(3,1fr)}.wc{background:var(--obsidian);padding:40px 32px}
        .wt{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--cream);margin-bottom:12px}
        .wb{font-family:'Inter',system-ui,sans-serif;font-size:13px;color:var(--muted);line-height:1.75}
        .aw{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
        .ah{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:300;color:var(--cream);margin-bottom:24px;line-height:1.1}
        .apt{font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:300;color:var(--muted);line-height:1.8;margin-bottom:18px}
        .anote{font-family:'Inter',system-ui,sans-serif;font-size:12px;color:rgba(212,168,67,0.5);line-height:1.65;padding-left:14px;border-left:2px solid rgba(212,168,67,0.18)}
        .fg{margin-bottom:18px}.fl{font-family:'Inter',system-ui,sans-serif;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:6px}
        .fi,.fsel,.fta{width:100%;background:var(--steel);border:1px solid var(--border);color:var(--cream);font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:300;padding:13px 16px;outline:none;transition:border-color .2s;-webkit-appearance:none}
        .fi:focus,.fsel:focus,.fta:focus{border-color:var(--amber)}.fta{resize:vertical;min-height:110px}
        .fsub{width:100%;padding:15px;background:var(--amber);color:var(--obsidian);font-family:'Inter',system-ui,sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;transition:background .2s}.fsub:hover:not(:disabled){background:var(--amber-bright)}.fsub:disabled{opacity:.6;cursor:not-allowed}
        .fok{padding:48px;text-align:center;border:1px solid var(--border);background:rgba(212,168,67,0.05)}.fok h3{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:300;color:var(--cream);margin-bottom:12px}.fok p{font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--muted)}
        .ft{background:var(--charcoal);border-top:1px solid var(--border);padding:36px 48px;text-align:center}.ft p{font-family:'Inter',system-ui,sans-serif;font-size:12px;color:var(--muted)}
        @media(max-width:960px){.mn{padding:0 24px}.sec{padding:72px 24px}.pg,.tg{grid-template-columns:1fr}.ar{grid-template-columns:1fr;gap:20px;padding:36px 24px}.hg{grid-template-columns:1fr 1fr}.wg{grid-template-columns:1fr}.aw{grid-template-columns:1fr;gap:48px}.hero{padding:110px 24px 72px}}
        @media(max-width:600px){.hg{grid-template-columns:1fr}.hero h1{font-size:40px}.ft{padding:28px 24px}}
      `}</style>

      <nav className="mn">
        <Link href="/" className="mn-logo">BISX<span>P</span></Link>
        <Link href="/" className="mn-back">&larr; bisxp.com</Link>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <span className="ey">BISXP Methodology</span>
          <h1>The structure that makes<br /><em>agentic AI development</em><br />actually work.</h1>
          <p className="hero-sub">Most organisations treat AI agents as a shortcut to shipping faster. BISXP treats them as a discipline that requires the same rigour as any other engineering system &mdash; with a methodology proven across four live platforms in three countries.</p>
          <div className="hero-btns">
            <a href="#apply" className="btn-a">Apply to the Programme</a>
            <a href="#methodology" className="btn-b">Explore the Methodology</a>
          </div>
        </div>
      </section>

      <section className="sec" id="methodology" style={{ background: 'var(--charcoal)', borderTop: '1px solid var(--border)' }}>
        <div className="con">
          <span className="ey">The Real Problem</span>
          <h2 className="hd">You have tried building with AI agents.<br />Here is what actually went wrong.</h2>
          <p className="intro">These are not hypothetical risks. They are the exact failure modes that every organisation hits when deploying AI agents without a structured methodology.</p>
          <div className="gg pg">
            {PAINS.map(p => (<div className="pc" key={p.number}><span className="pn">{p.number}</span><p className="pq">&ldquo;{p.pain}&rdquo;</p><p className="pi">{p.insight}</p></div>))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="con">
          <span className="ey">The Methodology Backbone</span>
          <h2 className="hd">Seven artifacts.<br />One operating system.</h2>
          <p className="intro">Before a single line of code is written, BISXP projects establish the structural foundation that governs every subsequent decision. These seven artifacts are the operating system that makes AI-native development reliable, accountable, and scalable.</p>
          <div className="al">
            {ARTIFACTS.map(a => (<div className="ar" key={a.name}><div><span className="an">{a.name}</span><span className="arl">{a.role}</span></div><div><p className="ad">{a.description}</p><p className="ap">{a.proof}</p></div></div>))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--charcoal)', borderTop: '1px solid var(--border)' }}>
        <div className="con">
          <span className="ey">How It Works</span>
          <h2 className="hd">The session rhythm<br />that ships production code.</h2>
          <p className="intro">Every BISXP development session follows the same four-step rhythm &mdash; whether the team is a solo founder or an enterprise engineering organisation.</p>
          <div className="gg hg">
            <div className="hs"><span className="hn">01</span><h3 className="ht">Design in Claude.ai</h3><p className="hb">Every feature begins as a complete specification. The problem is defined. The success criteria are agreed. The system impact is mapped. The agent cannot begin until the blueprint is approved.</p></div>
            <div className="hs"><span className="hn">02</span><h3 className="ht">Execute in Claude Code</h3><p className="hb">The agent reads the full project context, verifies its understanding, and confirms what it will and will not touch &mdash; before writing a single line of code.</p></div>
            <div className="hs"><span className="hn">03</span><h3 className="ht">Verify before shipping</h3><p className="hb">Quality gates run automatically. The agent documents what was built, what was deferred, and what was learned &mdash; creating an auditable record of every development decision.</p></div>
            <div className="hs"><span className="hn">04</span><h3 className="ht">Advance the system</h3><p className="hb">Every session ends with an updated project context. The next session starts with complete awareness. The system compounds &mdash; getting faster and more reliable with every cycle.</p></div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="con">
          <span className="ey">The Programme</span>
          <h2 className="hd">Two tracks.<br />Two production deployments.</h2>
          <p className="intro">Each track is entirely hands-on. Participants build real systems using the BISXP methodology. Every track ends with a production deployment.</p>
          <div className="gg tg">
            <div className="tc">
              <span className="tn">Track 01</span><h3 className="tt">Marketplace Building</h3>
              <p className="tb">Architect, build, and launch a two-sided marketplace using the full BISXP methodology &mdash; from the first FEATURE.md to production deployment.</p>
              <div className="tm">
                {['BISXP methodology \u2014 the operating system for AI development', 'Feature specification and architectural governance', 'Multi-sided listings, owner portals, and tenant management', 'Enquiry pipelines, CRM, and subscription tier enforcement', 'AI integration \u2014 matching, content generation, and scoring', 'Testing and quality assurance for AI-assisted systems', 'Production deployment, observability, and scaling'].map(m => <div className="tmod" key={m}>{m}</div>)}
              </div>
              <div className="tcap"><span className="tcl">Capstone</span><span className="tcv">A live two-sided marketplace deployed to production</span></div>
            </div>
            <div className="tc">
              <span className="tn">Track 02</span><h3 className="tt">AI Data Engineering</h3>
              <p className="tb">The AI-driven data ecosystem has expanded far beyond pipelines. This track covers the full spectrum of infrastructure that makes intelligent products work at scale.</p>
              <div className="tm">
                {['Vector databases and semantic search architecture', 'RAG design patterns \u2014 what works and what fails at scale', 'Embedding model selection, evaluation, and fine-tuning', 'Real-time streaming pipelines for AI feature delivery', 'Data quality and governance for model training and RAG', 'Feature stores and low-latency inference infrastructure', 'AI-powered analytics and recommendation system design'].map(m => <div className="tmod" key={m}>{m}</div>)}
              </div>
              <div className="tcap"><span className="tcl">Capstone</span><span className="tcv">A production AI data pipeline with semantic search</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--charcoal)', borderTop: '1px solid var(--border)' }}>
        <div className="con">
          <span className="ey">Who Should Apply</span>
          <h2 className="hd">This programme is not for everyone.<br />It is for the right people.</h2>
          <div className="gg wg">
            <div className="wc"><h3 className="wt">Technical Founders</h3><p className="wb">You are building a product with AI agents and hitting the real walls &mdash; unpredictable output, context loss, cost overruns, and accountability gaps. You need a methodology that makes your entire development process reliable.</p></div>
            <div className="wc"><h3 className="wt">Senior Engineers &amp; CTOs</h3><p className="wb">You lead engineering teams adopting AI-assisted development and you need a system &mdash; not a collection of prompts. You want patterns, governance, and accountability that scale to production complexity.</p></div>
            <div className="wc"><h3 className="wt">Training Partners</h3><p className="wb">You want to deliver this methodology to your clients or organisation. BISXP certifies partners who deliver these tracks &mdash; with BISXP providing content, labs, leads, and revenue.</p></div>
          </div>
        </div>
      </section>

      <section className="sec" id="apply" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="con">
          <div className="aw">
            <div>
              <h2 className="ah">Apply to the<br />BISXP Methodology<br />Programme.</h2>
              <p className="apt">Tell us which track interests you and what you are building or leading. We will respond within 48 hours &mdash; no pitch, no pressure.</p>
              <p className="apt">Whether you want to attend a track, send your team, become a training partner, or bring the methodology to your organisation &mdash; this is where it starts.</p>
              <p className="anote">BISXP drives all training leads and revenue. Certified training partners deliver engagements and are paid per cohort. Content, labs, and infrastructure are provided by BISXP.</p>
            </div>
            <div>
              {formState === 'success' ? (
                <div className="fok"><h3>Application received.</h3><p>We will be in touch within 48 hours.</p></div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="fg"><label className="fl">Name *</label><input className="fi" type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" required /></div>
                  <div className="fg"><label className="fl">Email *</label><input className="fi" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" required /></div>
                  <div className="fg"><label className="fl">Organisation</label><input className="fi" type="text" value={formData.organisation} onChange={e => setFormData(p => ({ ...p, organisation: e.target.value }))} placeholder="Your company or institution" /></div>
                  <div className="fg"><label className="fl">I am interested in *</label><select className="fsel" value={formData.track} onChange={e => setFormData(p => ({ ...p, track: e.target.value }))} required><option value="">Select a path</option><option value="Attending — Marketplace Building track">Attending &mdash; Marketplace Building track</option><option value="Attending — AI Data Engineering track">Attending &mdash; AI Data Engineering track</option><option value="Attending — both tracks">Attending &mdash; both tracks</option><option value="Sending my team">Sending my team</option><option value="Becoming a Training Partner">Becoming a Training Partner</option><option value="Bringing the methodology to my organisation">Bringing the methodology to my organisation</option></select></div>
                  <div className="fg"><label className="fl">What are you building or leading?</label><textarea className="fta" value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your context — what you are building, what problem you are trying to solve, or what your team needs." /></div>
                  {formState === 'error' && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 14 }}>Something went wrong. Please try again or email hello@bisxp.com</p>}
                  <button type="submit" className="fsub" disabled={formState === 'loading' || !formData.name || !formData.email || !formData.track}>{formState === 'loading' ? 'Submitting\u2026' : 'Submit Application'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="ft"><p>&copy; 2026 BISXP LLC &middot; <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>bisxp.com</Link></p></footer>
    </>
  )
}
