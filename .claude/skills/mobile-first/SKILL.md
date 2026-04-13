# Mobile-First Development Skill
_Applies to: CareGrid, MediGrid, and all BISXP Next.js projects_
_Last updated: 2026-03-27_

## When to apply this skill
Apply automatically to every page, component, and layout file. Mobile-first is not optional — it is a first-principle of every BISXP product.

## The core principle
Build for 390px first. Then add complexity for larger screens. Never retrofit mobile onto a desktop design.

## Checklist — run before every commit

### Navigation
- [ ] No double navbar on mobile (page nav hidden at ≤768px)
- [ ] BottomTabBar or mobile nav is sole navigation on mobile
- [ ] Bottom nav has safe-area-inset-bottom padding
- [ ] Bottom nav z-index ≥ 1000

### Touch targets
- [ ] All buttons ≥ 44px height
- [ ] All icon buttons ≥ 44×44px (use flex centering)
- [ ] Primary CTA buttons ≥ 48px height, full width on mobile
- [ ] No interactive element within 8px of screen edge

### iOS reliability
- [ ] All inputs font-size: 16px (prevents zoom)
- [ ] Bottom sheets use transform animation not height
- [ ] onTouchEnd added alongside onClick in sheets/modals
- [ ] Safe area insets on all bottom-edge elements
- [ ] Body scroll locked when modal/sheet is open (with cleanup)

### Layout
- [ ] Card grids: 1 col ≤480px, 2 col 481–768px, auto-fill desktop
- [ ] Sidebars: static + stacked on mobile
- [ ] Hero height: max 55vh on mobile
- [ ] Page bottom padding clears bottom nav (80px + safe area)
- [ ] No horizontal overflow (except intentional tab bars)

### Performance
- [ ] Auth checked before any profile DB calls
- [ ] Independent DB queries run in parallel (Promise.all)
- [ ] Anonymous user paths skip unnecessary DB fetches

### Required media queries
Every page must include at minimum:
```css
@media (max-width: 768px) {
  .page-nav { display: none !important; }
  .reveal { opacity: 1 !important; transform: none !important; }
  .sidebar { position: static; width: 100%; margin-top: 2rem; }
  body { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
  input, select, textarea { font-size: 16px !important; }
}
@media (max-width: 480px) {
  .card-grid, .tier-grid, .form-row { grid-template-columns: 1fr !important; }
}
```

## Bottom sheet pattern (iOS-safe)
```tsx
// CORRECT — transform animation
const sheetStyles = {
  position: 'fixed' as const,
  bottom: 0, left: 0, right: 0,
  transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  maxHeight: '80vh',
  overflowY: 'auto' as const,
  zIndex: 1001,
}

// Body scroll lock
useEffect(() => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  return () => { document.body.style.overflow = '' }
}, [isOpen])

// Drag handle
<div style={{ width:36, height:4, background:'rgba(0,0,0,0.2)', borderRadius:2, margin:'12px auto 4px' }} />

// Backdrop (touch + click)
<div onClick={close} onTouchEnd={close}
  style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999 }} />
```

## Tab bar horizontal scroll pattern
```tsx
// Container
<div style={{
  display: 'flex',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  borderBottom: '1px solid var(--border)',
}}>
// Each tab
<button style={{
  flexShrink: 0,        // CRITICAL
  whiteSpace: 'nowrap', // CRITICAL
  minHeight: '44px',
  padding: '0 1.2rem',
}}>
```

## Card grid responsive pattern
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
}
@media (max-width: 768px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .card-grid { grid-template-columns: 1fr; }
}
```

## Performance pattern — parallel DB fetches
```typescript
// WRONG — sequential
const profile = await supabase.from('profiles')...
const venues = await supabase.from('venues')...
const vendors = await supabase.from('vendors')...

// CORRECT — parallel
const [profileRes, venueRes, vendorRes] = await Promise.all([
  supabase.from('profiles').select('*').eq('id', userId).single(),
  supabase.from('venues').select('name,slug').in('slug', slugs),
  supabase.from('vendors').select('name,slug').in('slug', slugs),
])
```

## Common mistakes from TABRO.IN (learned the hard way)
1. Height animation on bottom sheets — iOS stutters badly, use transform
2. Font-size < 16px on inputs — iOS zooms in, breaks layout
3. Two navbars on mobile — desktop nav + bottom tab bar both visible
4. No safe-area-inset — content hidden behind iPhone notch
5. Hover-only tooltips — touch devices never see them
6. Sequential DB queries — adds 300–500ms latency on mobile networks
7. Fixed sidebars on mobile — breaks scroll, overlaps content
8. Small touch targets — users tap wrong elements, frustrating UX
9. Missing padding-bottom — last content hidden behind bottom tab bar
10. Horizontal overflow — often caused by a single element with fixed width
