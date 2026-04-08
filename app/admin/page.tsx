'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase'
import ContentEditor from '@/app/components/admin/ContentEditor'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type AdminTab = 'enquiries' | 'content'
type EnquiryStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  business_type: string | null
  message: string
  status: EnquiryStatus
  notes: string | null
  source: string
  created_at: string
  updated_at: string
}

const STATUS_ORDER: EnquiryStatus[] = ['new', 'contacted', 'qualified', 'converted', 'closed']

const STATUS_COLORS: Record<EnquiryStatus, string> = {
  new: '#D4A843',
  contacted: '#4A9EE0',
  qualified: '#4CAF7D',
  converted: '#26C6DA',
  closed: '#70707A',
}

function nextStatus(current: EnquiryStatus): EnquiryStatus {
  const idx = STATUS_ORDER.indexOf(current)
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createAuthClient(), [])

  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>('enquiries')

  // Auth check + fetch
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserEmail(user.email || '')
      await fetchEnquiries()
    }
    init()
  }, [supabase, router])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('enquiries-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'enquiries' },
        () => fetchEnquiries()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  async function fetchEnquiries() {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setEnquiries(data as Enquiry[])
    setLoading(false)
  }

  async function cycleStatus(enquiry: Enquiry) {
    setUpdatingId(enquiry.id)
    const newStatus = nextStatus(enquiry.status)
    try {
      const res = await fetch(`/api/enquiry/${enquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiry.id ? { ...e, status: newStatus } : e))
        )
      }
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Stats
  const stats = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = enquiries.filter((e) => e.status === s).length
    return acc
  }, {} as Record<EnquiryStatus, number>)

  return (
    <>
      <style>{`
        .admin-page {
          min-height: 100vh;
          background: var(--charcoal);
          padding: 0;
        }
        .admin-header {
          background: var(--obsidian);
          border-bottom: 1px solid var(--border);
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .admin-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 3px;
          color: var(--cream);
        }
        .admin-logo span { color: var(--amber); }
        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .admin-user-email {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: var(--muted);
        }
        .signout-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          background: transparent;
          border: 1px solid var(--border);
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .signout-btn:hover { color: var(--cream); border-color: var(--border-strong); }
        .admin-body {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px;
        }
        .admin-title-row {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 32px;
        }
        .admin-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 300;
          color: var(--cream);
        }
        .count-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: var(--obsidian);
          background: var(--amber);
          padding: 3px 10px;
          border-radius: 12px;
        }
        .stats-row {
          display: flex;
          gap: 12px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .stat-card {
          background: var(--steel);
          border: 1px solid var(--border);
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 120px;
        }
        .stat-card-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
        }
        .stat-card-label {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
        }
        .table-wrap {
          overflow-x: auto;
          background: var(--steel);
          border: 1px solid var(--border);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        thead {
          background: var(--obsidian);
        }
        th {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          padding: 14px 20px;
          text-align: left;
          white-space: nowrap;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(212,168,67,0.03); }
        .td-date {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          color: var(--muted);
          white-space: nowrap;
        }
        .td-name {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--cream);
          white-space: nowrap;
        }
        .td-email {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: var(--amber);
        }
        .td-email a { color: var(--amber); text-decoration: none; }
        .td-email a:hover { color: var(--amber-bright); }
        .td-company {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: var(--muted);
          white-space: nowrap;
        }
        .td-type {
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          color: var(--cream);
          white-space: nowrap;
        }
        .status-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: opacity 0.2s;
          white-space: nowrap;
          border: none;
          display: inline-block;
        }
        .status-badge:hover { opacity: 0.8; }
        .status-badge:disabled { cursor: not-allowed; opacity: 0.5; }
        .expand-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 1px;
          color: var(--muted);
          background: transparent;
          border: 1px solid var(--border);
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .expand-btn:hover { color: var(--cream); border-color: var(--border-strong); }
        .message-row td {
          background: var(--obsidian);
          padding: 20px 28px;
        }
        .message-content {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: var(--cream);
          line-height: 1.7;
          max-width: 700px;
          margin-bottom: 12px;
        }
        .message-meta {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 1px;
        }
        .loading-state {
          text-align: center;
          padding: 80px 40px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: var(--muted);
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .empty-state {
          text-align: center;
          padding: 80px 40px;
        }
        .empty-state h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 12px;
        }
        .empty-state p {
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: var(--muted);
        }
        .admin-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }
        .admin-tab {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--muted);
          background: transparent;
          border: none;
          padding: 12px 24px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .admin-tab:hover { color: var(--cream); }
        .admin-tab.active { color: var(--amber); border-bottom-color: var(--amber); }
        @media (max-width: 768px) {
          .admin-header { padding: 16px 20px; }
          .admin-body { padding: 24px 20px; }
          .admin-user-email { display: none; }
        }
      `}</style>

      <div className="admin-page">
        {/* Header */}
        <header className="admin-header">
          <span className="admin-logo">BISX<span>P</span></span>
          <div className="admin-header-right">
            <span className="admin-user-email">{userEmail}</span>
            <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
          </div>
        </header>

        <div className="admin-body">
          {/* Tabs */}
          <div className="admin-tabs">
            <button className={`admin-tab${activeTab === 'enquiries' ? ' active' : ''}`} onClick={() => setActiveTab('enquiries')}>📋 Enquiries</button>
            <button className={`admin-tab${activeTab === 'content' ? ' active' : ''}`} onClick={() => setActiveTab('content')}>✏️ Content</button>
          </div>

          {activeTab === 'enquiries' && (<>
          {/* Title */}
          <div className="admin-title-row">
            <h1 className="admin-title">Enquiries</h1>
            {!loading && <span className="count-badge">{enquiries.length}</span>}
          </div>

          {/* Status stats */}
          {!loading && (
            <div className="stats-row">
              {STATUS_ORDER.map((s) => (
                <div className="stat-card" key={s}>
                  <span className="stat-card-num" style={{ color: STATUS_COLORS[s] }}>
                    {stats[s]}
                  </span>
                  <span className="stat-card-label">{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="loading-state">Loading enquiries…</div>
          ) : enquiries.length === 0 ? (
            <div className="empty-state">
              <h3>No enquiries yet.</h3>
              <p>When someone submits the contact form, they'll appear here.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enq) => (
                    <>
                      <tr key={enq.id}>
                        <td className="td-date">{formatDate(enq.created_at)}</td>
                        <td className="td-name">{enq.name}</td>
                        <td className="td-email">
                          <a href={`mailto:${enq.email}`}>{enq.email}</a>
                          {enq.phone && (
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                              {enq.phone}
                            </div>
                          )}
                        </td>
                        <td className="td-company">{enq.company || '—'}</td>
                        <td className="td-type">{enq.business_type || '—'}</td>
                        <td>
                          <button
                            className="status-badge"
                            style={{
                              background: STATUS_COLORS[enq.status] + '22',
                              color: STATUS_COLORS[enq.status],
                              border: `1px solid ${STATUS_COLORS[enq.status]}44`,
                            }}
                            onClick={() => cycleStatus(enq)}
                            disabled={updatingId === enq.id}
                            title="Click to advance status"
                          >
                            {updatingId === enq.id ? '…' : enq.status}
                          </button>
                        </td>
                        <td>
                          <button
                            className="expand-btn"
                            onClick={() => setExpandedId(expandedId === enq.id ? null : enq.id)}
                          >
                            {expandedId === enq.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {expandedId === enq.id && (
                        <tr key={`${enq.id}-msg`} className="message-row">
                          <td colSpan={7}>
                            <p className="message-content">{enq.message}</p>
                            <p className="message-meta">
                              Source: {enq.source} · Submitted: {formatDate(enq.created_at)}
                            </p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </>)}

          {activeTab === 'content' && <ContentEditor />}

        </div>
      </div>
    </>
  )
}
