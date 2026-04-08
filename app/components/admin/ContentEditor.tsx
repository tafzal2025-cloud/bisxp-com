'use client'

import { useState, useEffect } from 'react'

interface SettingRow {
  key: string; value: string; label: string; section: string; sort_order: number
}
interface CmsItem {
  id: string; is_visible: boolean; sort_order: number; [k: string]: unknown
}

const VISIBILITY_TOGGLES = [
  { key: 'section_acronym_visible', label: 'What BISXP Stands For' },
  { key: 'section_case_studies_visible', label: 'Case Studies' },
  { key: 'section_research_visible', label: 'Research & Security' },
  { key: 'section_services_visible', label: 'Services' },
  { key: 'section_process_visible', label: 'Our Process' },
  { key: 'section_team_visible', label: 'The Team' },
]

const SETTINGS_SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'stats', label: 'Stats Bar' },
  { id: 'process', label: 'Our Process' },
  { id: 'contact', label: 'Contact' },
]

const CMS_SECTIONS = [
  { id: 'services', label: 'Services', nameField: 'title',
    addFields: ['icon', 'title', 'description'] },
  { id: 'case-studies', label: 'Case Studies', nameField: 'title',
    addFields: ['title', 'eyebrow', 'problem_quote', 'what_we_built', 'ai_layer', 'scale_architecture', 'status_badge'] },
  { id: 'research-cards', label: 'Research Cards', nameField: 'title',
    addFields: ['tag', 'tag_style', 'title', 'subtitle', 'body', 'note'] },
  { id: 'team-members', label: 'Team Members', nameField: 'name',
    addFields: ['name', 'title', 'bio', 'credential_label', 'initials'] },
]

export default function ContentEditor() {
  const [settings, setSettings] = useState<SettingRow[]>([])
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['visibility']))
  const [cmsData, setCmsData] = useState<Record<string, CmsItem[]>>({})
  const [addForms, setAddForms] = useState<Record<string, Record<string, string>>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then((data: SettingRow[]) => {
      setSettings(data)
      setEditValues(Object.fromEntries(data.map(r => [r.key, r.value])))
      setLoaded(true)
    }).catch(() => setLoaded(true))
    CMS_SECTIONS.forEach(s => fetchCms(s.id))
  }, [])

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function handleSave(key: string, value?: string) {
    setSaving(key)
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: value ?? editValues[key] }),
    })
    setSaving(null)
  }

  async function fetchCms(section: string) {
    const res = await fetch(`/api/admin/cms/${section}`)
    if (res.ok) {
      const data = await res.json()
      setCmsData(prev => ({ ...prev, [section]: data }))
    }
  }

  async function handleCmsToggle(section: string, id: string, visible: boolean) {
    await fetch(`/api/admin/cms/${section}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_visible: visible }),
    })
    fetchCms(section)
  }

  async function handleCmsDelete(section: string, id: string) {
    if (!confirm('Delete this item permanently?')) return
    await fetch(`/api/admin/cms/${section}/${id}`, { method: 'DELETE' })
    fetchCms(section)
  }

  async function handleCmsAdd(section: string) {
    const form = addForms[section]
    if (!form) return
    await fetch(`/api/admin/cms/${section}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: (cmsData[section]?.length || 0) + 1 }),
    })
    setAddForms(prev => { const n = { ...prev }; delete n[section]; return n })
    toggleSection(`add-${section}`)
    fetchCms(section)
  }

  if (!loaded) return <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' as const }}>Loading…</div>

  return (
    <>
      <style>{`
        .ce-section{border:1px solid #e8e4dc;margin-bottom:6px;overflow:hidden}
        .ce-section-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;background:var(--ink,#111);cursor:pointer;user-select:none;border-left:3px solid var(--gold,#D4A843)}
        .ce-section-title{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:400;color:#fff;letter-spacing:.3px}
        .ce-section-arrow{font-size:11px;color:var(--gold,#D4A843);transition:transform .2s;font-family:'Inter',sans-serif}
        .ce-section-arrow.open{transform:rotate(180deg)}
        .ce-section-body{padding:20px;background:#fff;border-top:1px solid #f0ece4;display:none}
        .ce-section-body.open{display:block}
        .ce-field{margin-bottom:18px;position:relative}.ce-field:last-child{margin-bottom:0}
        .ce-label{font-family:'Inter',sans-serif;font-size:12px;font-weight:500;color:#666;margin-bottom:5px;display:block}
        .ce-input{width:100%;padding:9px 12px;border:1px solid #ddd;font-family:'Inter',sans-serif;font-size:13px;color:var(--ink,#111);background:#fafaf8;outline:none;transition:border-color .2s;border-radius:2px}
        .ce-input:focus{border-color:var(--gold,#D4A843);background:#fff}
        .ce-textarea{width:100%;padding:9px 12px;border:1px solid #ddd;font-family:'Inter',sans-serif;font-size:13px;color:var(--ink,#111);background:#fafaf8;outline:none;resize:vertical;min-height:80px;line-height:1.5;border-radius:2px;transition:border-color .2s}
        .ce-textarea:focus{border-color:var(--gold,#D4A843);background:#fff}
        .ce-save-inline{margin-top:6px;padding:6px 16px;background:var(--ink,#111);color:#fff;border:none;font-family:'Inter',sans-serif;font-size:10px;font-weight:500;letter-spacing:2px;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:background .2s}
        .ce-save-inline:hover{background:var(--gold,#D4A843);color:var(--ink,#111)}
        .ce-save-inline:disabled{opacity:.5;cursor:not-allowed}
        .ce-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0ece4}
        .ce-toggle-row:last-child{border-bottom:none}
        .ce-toggle-label{font-family:'Inter',sans-serif;font-size:13px;color:var(--ink,#111)}
        .ce-toggle{position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0}
        .ce-toggle input{opacity:0;width:0;height:0;position:absolute}
        .ce-toggle-track{position:absolute;inset:0;background:#ccc;border-radius:24px;transition:background .2s}
        .ce-toggle input:checked+.ce-toggle-track{background:var(--gold,#D4A843)}
        .ce-toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
        .ce-toggle input:checked~.ce-toggle-thumb{transform:translateX(20px)}
        .ce-card-item{background:#fafaf8;border:1px solid #e8e4dc;padding:14px 16px;margin-bottom:8px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;border-radius:2px}
        .ce-card-item.hidden-item{opacity:.45}
        .ce-card-item-title{font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:var(--ink,#111);margin-bottom:2px}
        .ce-card-item-sub{font-size:11px;color:#888;font-family:'Inter',sans-serif}
        .ce-card-actions{display:flex;gap:8px;flex-shrink:0;align-items:center}
        .ce-btn-toggle{padding:4px 10px;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;border:1px solid var(--gold,#D4A843);color:var(--gold,#D4A843);background:transparent;cursor:pointer;border-radius:2px;font-family:'Inter',sans-serif}
        .ce-btn-toggle.is-hidden{border-color:#ccc;color:#999}
        .ce-btn-delete{padding:4px 10px;font-size:10px;font-weight:500;letter-spacing:1px;text-transform:uppercase;border:1px solid #e74c3c;color:#e74c3c;background:transparent;cursor:pointer;border-radius:2px;font-family:'Inter',sans-serif}
        .ce-add-btn{width:100%;padding:10px;background:transparent;border:1px dashed var(--gold,#D4A843);color:var(--gold,#D4A843);font-family:'Inter',sans-serif;font-size:12px;font-weight:500;letter-spacing:1px;cursor:pointer;margin-top:8px;transition:background .2s;border-radius:2px}
        .ce-add-btn:hover{background:rgba(200,150,60,.06)}
        .ce-add-form{background:#f5f2ec;border:1px solid #e8e4dc;padding:16px;margin-top:8px;border-radius:2px}
        .ce-add-form-title{font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:12px}
        .ce-add-form-actions{display:flex;gap:8px;margin-top:12px}
        .ce-btn-save{padding:8px 20px;background:var(--ink,#111);color:#fff;border:none;font-family:'Inter',sans-serif;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;border-radius:2px}
        .ce-btn-cancel{padding:8px 16px;background:transparent;color:#888;border:1px solid #ddd;font-family:'Inter',sans-serif;font-size:11px;cursor:pointer;border-radius:2px}
      `}</style>

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: 'var(--cream)', marginBottom: 24 }}>Content Editor</h2>

      {/* VISIBILITY TOGGLES */}
      <div className="ce-section">
        <div className="ce-section-header" onClick={() => toggleSection('visibility')}>
          <span className="ce-section-title">Section Visibility</span>
          <span className={`ce-section-arrow ${openSections.has('visibility') ? 'open' : ''}`}>▼</span>
        </div>
        <div className={`ce-section-body ${openSections.has('visibility') ? 'open' : ''}`}>
          {VISIBILITY_TOGGLES.map(({ key, label }) => (
            <div key={key} className="ce-toggle-row">
              <span className="ce-toggle-label">{label}</span>
              <label className="ce-toggle">
                <input type="checkbox" checked={editValues[key] !== 'false'}
                  onChange={e => {
                    const val = e.target.checked ? 'true' : 'false'
                    setEditValues(prev => ({ ...prev, [key]: val }))
                    handleSave(key, val)
                  }} />
                <span className="ce-toggle-track" />
                <span className="ce-toggle-thumb" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* SETTINGS SECTIONS: Hero, Stats, Process, Contact */}
      {SETTINGS_SECTIONS.map(sec => (
        <div className="ce-section" key={sec.id}>
          <div className="ce-section-header" onClick={() => toggleSection(sec.id)}>
            <span className="ce-section-title">{sec.label}</span>
            <span className={`ce-section-arrow ${openSections.has(sec.id) ? 'open' : ''}`}>▼</span>
          </div>
          <div className={`ce-section-body ${openSections.has(sec.id) ? 'open' : ''}`}>
            {settings.filter(s => s.section === sec.id).map(s => (
              <div key={s.key} className="ce-field">
                <label className="ce-label">{s.label}</label>
                {(editValues[s.key] || '').length >= 60
                  ? <textarea className="ce-textarea" value={editValues[s.key] || ''} onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))} />
                  : <input className="ce-input" value={editValues[s.key] || ''} onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))} />
                }
                <button className="ce-save-inline" disabled={saving === s.key} onClick={() => handleSave(s.key)}>
                  {saving === s.key ? 'Saving…' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* CMS SECTIONS: Services, Case Studies, Research Cards, Team Members */}
      {CMS_SECTIONS.map(sec => {
        const items = cmsData[sec.id] || []
        const addKey = `add-${sec.id}`
        const form = addForms[sec.id] || {}
        return (
          <div className="ce-section" key={sec.id}>
            <div className="ce-section-header" onClick={() => toggleSection(sec.id)}>
              <span className="ce-section-title">{sec.label}</span>
              <span className={`ce-section-arrow ${openSections.has(sec.id) ? 'open' : ''}`}>▼</span>
            </div>
            <div className={`ce-section-body ${openSections.has(sec.id) ? 'open' : ''}`}>
              {/* Settings fields for this section (headings, platform line, etc.) */}
              {settings.filter(s => s.section === sec.id.replace('-', '_').replace('case-studies', 'case_studies')).length > 0 && (
                <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0ece4' }}>
                  {settings.filter(s => s.section === sec.id.replace(/-/g, '_')).map(s => (
                    <div key={s.key} className="ce-field">
                      <label className="ce-label">{s.label}</label>
                      {(editValues[s.key] || '').length >= 60
                        ? <textarea className="ce-textarea" value={editValues[s.key] || ''} onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))} />
                        : <input className="ce-input" value={editValues[s.key] || ''} onChange={e => setEditValues(prev => ({ ...prev, [s.key]: e.target.value }))} />
                      }
                      <button className="ce-save-inline" disabled={saving === s.key} onClick={() => handleSave(s.key)}>
                        {saving === s.key ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* CMS items */}
              {items.map(item => (
                <div key={item.id} className={`ce-card-item ${!item.is_visible ? 'hidden-item' : ''}`}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ce-card-item-title">{(item[sec.nameField] || item.tag || '—') as string}</div>
                    <div className="ce-card-item-sub">
                      {item.eyebrow ? `${item.eyebrow} · ` : ''}
                      {item.icon ? `${item.icon} · ` : ''}
                      {item.subtitle ? `${item.subtitle} · ` : ''}
                      Order: {item.sort_order}
                    </div>
                  </div>
                  <div className="ce-card-actions">
                    <button className={`ce-btn-toggle ${!item.is_visible ? 'is-hidden' : ''}`}
                      onClick={() => handleCmsToggle(sec.id, item.id, !item.is_visible)}>
                      {item.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    <button className="ce-btn-delete" onClick={() => handleCmsDelete(sec.id, item.id)}>Delete</button>
                  </div>
                </div>
              ))}

              {/* Add button */}
              <button className="ce-add-btn" onClick={() => toggleSection(addKey)}>+ Add {sec.label.replace(/s$/, '')}</button>

              {/* Add form */}
              {openSections.has(addKey) && (
                <div className="ce-add-form">
                  <div className="ce-add-form-title">New {sec.label.replace(/s$/, '')}</div>
                  {sec.addFields.map(field => (
                    <div key={field} className="ce-field">
                      <label className="ce-label">{field.replace(/_/g, ' ')}</label>
                      {['bio', 'body', 'what_we_built', 'problem_quote', 'description', 'ai_layer', 'scale_architecture'].includes(field)
                        ? <textarea className="ce-textarea" value={form[field] || ''}
                            onChange={e => setAddForms(prev => ({ ...prev, [sec.id]: { ...prev[sec.id], [field]: e.target.value } }))} />
                        : <input className="ce-input" value={form[field] || ''}
                            onChange={e => setAddForms(prev => ({ ...prev, [sec.id]: { ...prev[sec.id], [field]: e.target.value } }))} />
                      }
                    </div>
                  ))}
                  <div className="ce-add-form-actions">
                    <button className="ce-btn-save" onClick={() => handleCmsAdd(sec.id)}>Save</button>
                    <button className="ce-btn-cancel" onClick={() => toggleSection(addKey)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}
