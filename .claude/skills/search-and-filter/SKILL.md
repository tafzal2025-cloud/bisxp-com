# SKILL: Search and Filter
_For: All BISXP marketplace projects (Fetespace, TABRO.IN, TheUnitedSports)_
_Read this before building any search or filter UI_
_Last updated: 2026-04-11 — proven in Fetespace VenuesContent + VendorsContent_

---

## The Pattern

Live debounced search + URL-driven filters. Results update as the user types.
No submit button. No Enter key required. URL stays shareable.

**Three rules that must all be followed together. Break any one and the UX breaks.**

1. `inputValue` state drives the input. URL `q` param drives the fetch.
   Never bind the fetch directly to `inputValue`.

2. Debounce the URL push (350ms), not the fetch call.
   The fetch fires automatically when the URL changes.

3. `scroll: false` on every `router.push` inside a filter component.
   Without it, the page jumps to the top on every filter change.

---

## Complete Implementation

### State declarations

```typescript
// inputValue — typing buffer, controls the input element
const [inputValue, setInputValue] = useState(searchParams.get('q') || '')
const [loading, setLoading] = useState(false)

// All other filters read directly from searchParams (no useState needed)
const q        = searchParams.get('q') || ''
const city     = searchParams.get('city') || ''
const category = searchParams.get('category') || ''
const sort     = searchParams.get('sort') || 'newest'
```

### Sync input when URL changes externally

```typescript
// Required for browser back/forward to update the input
useEffect(() => {
  setInputValue(searchParams.get('q') || '')
}, [searchParams])
```

### Debounce — URL updates 350ms after last keystroke

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const current = new URLSearchParams(searchParams.toString())
    if (inputValue.trim()) {
      current.set('q', inputValue.trim())
    } else {
      current.delete('q')
    }
    // Guard: only push if q actually changed (prevents infinite loop)
    const currentQ = searchParams.get('q') || ''
    if (inputValue.trim() !== currentQ) {
      router.push(`/venues?${current.toString()}`, { scroll: false })
    }
  }, 350)
  return () => clearTimeout(timer)
}, [inputValue, searchParams, router])
```

### Fetch — triggered by URL change, not by typing

```typescript
const fetchListings = useCallback(async () => {
  setLoading(true)
  const params = new URLSearchParams()
  // Read everything from searchParams — URL is the source of truth
  const q        = searchParams.get('q') || ''
  const city     = searchParams.get('city') || ''
  const category = searchParams.get('category') || ''
  const sort     = searchParams.get('sort') || 'newest'

  if (q)                    params.set('q', q)
  if (city)                 params.set('city', city)
  if (category)             params.set('category', category)
  if (sort !== 'newest')    params.set('sort', sort)

  const res = await fetch(`/api/listings?${params.toString()}`)
  if (res.ok) {
    const data = await res.json()
    setListings(data.listings || [])
  }
  setLoading(false)
}, [searchParams])

// Re-fetch whenever URL changes
useEffect(() => {
  fetchListings()
}, [fetchListings])
```

### Search input JSX

```tsx
<div style={{ position: 'relative' }}>
  <input
    type="text"
    placeholder="Search venues..."
    value={inputValue}
    onChange={e => setInputValue(e.target.value)}
    style={{
      width: '100%',
      height: 48,
      padding: inputValue ? '0 40px 0 14px' : '0 14px',
      fontFamily: "'Inter', sans-serif",
      fontSize: 14,
      color: 'var(--ink)',
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      outline: 'none',
    }}
    onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
  />
  {inputValue && (
    <button
      onClick={() => {
        setInputValue('')
        const current = new URLSearchParams(searchParams.toString())
        current.delete('q')
        router.push(`/venues?${current.toString()}`, { scroll: false })
      }}
      style={{
        position: 'absolute', right: 12, top: '50%',
        transform: 'translateY(-50%)',
        background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--muted)', fontSize: 18,
        lineHeight: 1, padding: 0,
      }}
    >×</button>
  )}
</div>
```

### Loading indicator

```tsx
{loading
  ? <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--muted)' }}>
      Searching...
    </span>
  : <span>{listings.length} venue{listings.length !== 1 ? 's' : ''} found</span>
}
```

### Filter dropdowns — no debounce needed

```typescript
// City, category, event type dropdowns update URL immediately (no debounce)
const updateFilter = (key: string, value: string) => {
  const current = new URLSearchParams(searchParams.toString())
  if (value && value !== 'all') {
    current.set(key, value)
  } else {
    current.delete(key)
  }
  router.push(`/venues?${current.toString()}`, { scroll: false })
}

// Usage in JSX:
<select onChange={e => updateFilter('city', e.target.value)} value={city || 'all'}>
  <option value="all">All Cities</option>
  <option value="Seattle">Seattle</option>
  {/* ... */}
</select>
```

---

## How the data flows

```
User types "ball"
  → inputValue = "ball"               (instant, no fetch)
  → 350ms timer starts

User types "room" before timer fires
  → inputValue = "ballroom"           (instant, no fetch)
  → timer resets to 350ms

350ms passes
  → URL pushed: /venues?q=ballroom    (scroll: false)
  → searchParams changes
  → fetchListings() runs              (reads q from searchParams)
  → setListings(results)
  → loading = false
  → "3 venues found"
```

---

## Anti-patterns — never do these

### ❌ Debouncing the fetch directly

```typescript
// WRONG — URL doesn't update, search isn't shareable
useEffect(() => {
  const timer = setTimeout(() => {
    fetchListings(inputValue) // fetch reads from local state
  }, 350)
  return () => clearTimeout(timer)
}, [inputValue])
```

### ❌ Pushing URL on every keystroke

```typescript
// WRONG — kills browser history
onChange={e => {
  setInputValue(e.target.value)
  router.push(`/venues?q=${e.target.value}`) // fires on every letter
}}
```

### ❌ Missing scroll: false

```typescript
// WRONG — page jumps to top on every filter change
router.push(`/venues?${current.toString()}`)

// CORRECT
router.push(`/venues?${current.toString()}`, { scroll: false })
```

### ❌ Fetching from inputValue instead of searchParams

```typescript
// WRONG — fetch and URL get out of sync
const fetchListings = useCallback(async () => {
  const res = await fetch(`/api/listings?q=${inputValue}`) // local state
}, [inputValue])

// CORRECT — URL is the single source of truth
const fetchListings = useCallback(async () => {
  const q = searchParams.get('q') || '' // from URL
  const res = await fetch(`/api/listings?q=${q}`)
}, [searchParams])
```

---

## Adapting for other BISXP projects

Change only these values per project:

| Value | Fetespace | TABRO.IN | TheUnitedSports |
|---|---|---|---|
| Route prefix | `/venues` or `/vendors` | `/venues` or `/vendors` | `/facilities` or `/leagues` |
| API endpoint | `/api/listings` or `/api/vendors` | `/api/listings` or `/api/vendors` | `/api/facilities` |
| Debounce | 350ms | 350ms | 350ms (same) |
| Placeholder | "Search venues..." | "Search venues..." | "Search facilities..." |
| Result label | "venues found" | "venues found" | "facilities found" |

Everything else — the state shape, the debounce logic, the URL pattern,
the `scroll: false` rule, the sync effect — is identical across all three.

---

## Checklist before shipping search

- [ ] `inputValue` initialized from `searchParams.get('q')`
- [ ] `useEffect` syncs `inputValue` when `searchParams` changes
- [ ] Debounce timer is 350ms, cleans up on unmount (`return () => clearTimeout`)
- [ ] Guard prevents pushing URL when `q` hasn't changed
- [ ] `router.push` has `{ scroll: false }` on every call
- [ ] Fetch reads `q` from `searchParams`, not from `inputValue`
- [ ] Clear button removes `q` from URL immediately (no debounce)
- [ ] Filter dropdowns (city, category) push URL immediately (no debounce)
- [ ] Loading state shown while fetching
- [ ] Result count shown when not loading
- [ ] Browser back/forward syncs the input correctly
