# Skill: Owner Portal Patterns

## When to use
When building or modifying the owner portal (`/owner/[slug]` for venues, `/owner/vendor/[slug]` for vendors).

---

## OwnerPortalShell pattern

Both venue and vendor portals share a common shell structure:

```
+--------------------------------------------------+
| TABRO.IN  |  [Listing Name]  |  Lock  |  Sign Out |   <-- Header
+--------------------------------------------------+
| Overview | Basic Info | Photos | ... | FAQs |       <-- Tab bar (scrollable on mobile)
+--------------------------------------------------+
|                                                    |
|              Active tab content                    |
|                                                    |
+--------------------------------------------------+
```

### Shell responsibilities
1. **Auth gate** — show auth screen or portal based on stored PIN/OAuth
2. **Data fetching** — load venue/vendor data + enquiries on mount
3. **Tab rendering** — show active tab content, lock others via isLocked
4. **Portal switcher** — "My Portals" dropdown for multi-portal users
5. **Notification badges** — red dot on Enquiries tab for new enquiries

---

## TabConfig and TabProps interfaces

```typescript
interface TabConfig {
  id: string           // 'overview' | 'basic-info' | 'photos' | 'features' | 'pricing' | 'enquiries' | 'reviews' | 'campaigns' | 'faqs'
  label: string        // Display label
  icon: string         // Emoji or icon character
  locked: boolean      // Computed via isLocked(tab.id, venue.tier)
  premium?: boolean    // Show "Premium" or "Pro" upgrade badge on locked tabs
  badge?: number       // Notification count (e.g., new enquiries)
}

interface TabProps {
  venue: Venue         // or Vendor for vendor portals
  token: string        // Auth token (PIN or 'google-oauth')
  onSave: () => void   // Callback to refresh data after save
  tier: string         // 'basic' | 'professional' | 'premium'
}
```

### Tab list (in order)
```typescript
const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '📊', locked: false },
  { id: 'basic-info', label: 'Basic Info', icon: '✏️', locked: false },
  { id: 'photos', label: 'Photos & Videos', icon: '📸', locked: false },
  { id: 'features', label: 'Features', icon: '✨', locked: isLocked('features', tier) },
  { id: 'pricing', label: 'Pricing', icon: '💰', locked: isLocked('pricing', tier) },
  { id: 'enquiries', label: 'Enquiries', icon: '📩', locked: false, badge: newEnquiryCount },
  { id: 'reviews', label: 'Reviews', icon: '⭐', locked: false },
  { id: 'campaigns', label: 'Campaigns', icon: '📣', locked: isLocked('campaigns', tier) },
  { id: 'faqs', label: 'FAQs', icon: '❓', locked: isLocked('faqs', tier) },
]
```

---

## isLocked (lib/tier-utils.ts target)

Currently duplicated in both portal files. Should be extracted to `lib/tier-utils.ts`.

```typescript
function isLocked(tab: string, tier: string): boolean {
  if (tier === 'premium') return false
  if (tier === 'professional') {
    return ['features', 'campaigns', 'faqs'].includes(tab)
  }
  // basic tier
  return !['overview', 'basic-info', 'photos', 'enquiries', 'reviews'].includes(tab)
}

const PHOTO_LIMITS: Record<string, number> = {
  basic: 5,
  professional: 25,
  premium: 50
}

const VIDEO_LIMITS: Record<string, number> = {
  basic: 0,
  professional: 5,
  premium: 10
}
```

---

## Mobile tab bar CSS

The portal tab bar must scroll horizontally on mobile:

```css
.portal-tabs {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 4px;
  padding: 8px 16px;
  background: var(--white);
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.portal-tabs::-webkit-scrollbar {
  display: none;
}

.portal-tab {
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  border: 1px solid #ddd;
  background: var(--white);
  color: var(--text);
  transition: all 0.2s;
  min-height: 44px;  /* iOS touch target */
  display: flex;
  align-items: center;
  gap: 6px;
}

.portal-tab.active {
  background: var(--ink);
  color: var(--white);
  border-color: var(--ink);
}

.portal-tab.locked {
  opacity: 0.5;
  position: relative;
}

.portal-tab .badge {
  background: #e74c3c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
}
```

---

## Save pattern

Standard pattern for saving data from any portal tab:

```typescript
const handleSave = async () => {
  setSaving(true)
  try {
    const res = await fetch('/api/owner/update-venue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token === 'google-oauth'
          ? { 'Authorization': `Bearer ${await getAccessToken()}` }
          : {}
        )
      },
      body: JSON.stringify({
        slug: venue.slug,
        token: token !== 'google-oauth' ? token : undefined,
        ...formData
      })
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Save failed')
    }

    setToast({ type: 'success', message: 'Changes saved!' })
    onSave()  // refresh parent data
  } catch (err) {
    setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save' })
  } finally {
    setSaving(false)
  }
}

// Helper for Google OAuth token
const getAccessToken = async (): Promise<string> => {
  const supabase = createAuthClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}
```

---

## Persona-tab mapping

| Persona | Unlocked Tabs | Photo Limit | Video Limit | Enquiry Access |
|---------|--------------|-------------|-------------|----------------|
| Basic venue/vendor owner | Overview, Basic Info, Photos, Enquiries, Reviews | 5 | 0 | Phone/email masked |
| Pro venue/vendor owner | + Pricing | 25 | 5 | Full access |
| Premium venue/vendor owner | All tabs | 50 | 10 | Full access + CSV export |

---

## LockedTabCard

When a locked tab is selected, show an upgrade card:

```typescript
const LockedTabCard = ({ tab, tier }: { tab: string; tier: string }) => {
  const nextTier = tier === 'basic' ? 'Professional' : 'Premium'
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: 'var(--cream)',
      borderRadius: 16,
      margin: 20
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22,
        color: 'var(--ink)',
        marginBottom: 8
      }}>
        Upgrade to {nextTier}
      </h3>
      <p style={{
        color: 'var(--text-soft)',
        fontSize: 14,
        marginBottom: 24,
        maxWidth: 400,
        margin: '0 auto 24px'
      }}>
        Unlock {tab} and more with a {nextTier} subscription.
      </p>
      <a
        href="https://wa.me/91XXXXXXXXXX?text=I'd like to upgrade my listing"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: 'var(--gold)',
          color: 'var(--white)',
          padding: '12px 32px',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          display: 'inline-block'
        }}
      >
        Contact Us to Upgrade
      </a>
    </div>
  )
}
```

---

## Checklist for portal changes

- [ ] Does the change work in BOTH venue and vendor portals?
- [ ] Is isLocked() applied correctly for the new tab/feature?
- [ ] Does the tab bar scroll properly on mobile (375px)?
- [ ] Are touch targets at least 44px?
- [ ] Does the save pattern follow the standard (try/catch, toast, setSaving)?
- [ ] Are file upload limits enforced per tier?
- [ ] Is the feature documented in CLAUDE_CONTEXT.md?
- [ ] Are Google OAuth users handled (Bearer token path)?
- [ ] Does the notification badge update correctly?
- [ ] Is the portal file still under 500 lines? (If not, plan extraction)
