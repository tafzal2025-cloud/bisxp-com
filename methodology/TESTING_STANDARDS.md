# TESTING STANDARDS
_Cross-project standard for all BISXP marketplace projects._
_Last updated: 2026-04-11_

---

## Stack

- **Unit + Integration**: Vitest
- **E2E**: Playwright (Desktop Chrome + Mobile Chrome/Safari)
- **CI**: GitHub Actions (unit on every push, E2E on push to master)

---

## Coverage Targets

- Unit tests: 90%+ on lib/ utility functions
- Integration tests: 100% of API routes (skipped by default)
- E2E: all nav-reachable pages

---

## What to Test

### Unit tests (lib/ functions)
Test every pure function. These break silently without tests.

Functions that must have unit tests:
- Phone validation (isValidPhone)
- Slug generation (generateSlug)
- Price formatting (formatCurrency)
- Category normalisation (normaliseCategory)
- Tier checking (checkTierAccess)
- Any utility added to lib/

### Integration tests (API routes)
Test the happy path and common error paths.

Skipped by default — run with:
```
RUN_INTEGRATION=true npm run test:integration
```

### E2E tests (user journeys)
Test what a user actually does, not implementation.

Every E2E spec must include a Mobile describe block:
```typescript
test.describe('Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('bottom tab bar visible', async ({ page }) => {
    await expect(page.locator('[data-bottom-nav]')).toBeVisible()
  })
})
```

---

## What NOT to Test

- Implementation details (internal state, private methods)
- Third-party library behaviour (Supabase, Resend)
- Exact HTML structure (test behaviour, not markup)
- Hardcoded IDs from the real database

---

## Test File Conventions

```
lib/__tests__/
  phone-validation.test.ts
  slug-generation.test.ts
  price-formatting.test.ts
  tier-enforcement.test.ts

app/api/__tests__/
  listings-api.test.ts      (integration, skipped by default)
  enquiry-api.test.ts       (integration, skipped by default)

e2e/
  homepage.spec.ts
  listings.spec.ts
  listing-detail.spec.ts
  enquiry.spec.ts
  owner-portal.spec.ts
  admin.spec.ts
```

---

## Vitest Config (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',
      process.env.RUN_INTEGRATION !== 'true'
        ? '**/__tests__/**/*.integration.test.ts'
        : '',
    ].filter(Boolean),
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

---

## Example Unit Tests

### Phone validation
```typescript
// lib/__tests__/phone-validation.test.ts
import { describe, it, expect } from 'vitest'
import { isValidPhone } from '../phone-validation'

describe('isValidPhone', () => {
  it('accepts 10-digit number', () => {
    expect(isValidPhone('2065551234')).toBe(true)
  })
  it('accepts number with country code', () => {
    expect(isValidPhone('+12065551234')).toBe(true)
  })
  it('accepts formatted number', () => {
    expect(isValidPhone('(206) 555-1234')).toBe(true)
  })
  it('rejects 9-digit number', () => {
    expect(isValidPhone('206555123')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })
  it('rejects letters', () => {
    expect(isValidPhone('206555ABCD')).toBe(false)
  })
})
```

### Tier enforcement
```typescript
// lib/__tests__/tier-enforcement.test.ts
import { describe, it, expect } from 'vitest'
import { checkTierAccess } from '../tiers'

describe('checkTierAccess', () => {
  it('basic tier is locked from professional features', () => {
    expect(checkTierAccess('basic', 'professional')).toBe(false)
  })
  it('basic tier is locked from premium features', () => {
    expect(checkTierAccess('basic', 'premium')).toBe(false)
  })
  it('professional tier can access professional features', () => {
    expect(checkTierAccess('professional', 'professional')).toBe(true)
  })
  it('professional tier is locked from premium features', () => {
    expect(checkTierAccess('professional', 'premium')).toBe(false)
  })
  it('premium tier can access all features', () => {
    expect(checkTierAccess('premium', 'basic')).toBe(true)
    expect(checkTierAccess('premium', 'professional')).toBe(true)
    expect(checkTierAccess('premium', 'premium')).toBe(true)
  })
})
```

---

## Test Data Guard Pattern

E2E tests must never write real data to production.
Add a guard in API routes that identifies test data:

```typescript
// In /api/enquiry POST handler
const isTestSubmission =
  body.email?.includes('e2e-test@bisxp-test.com') ||
  body.phone === '0000000000'

if (isTestSubmission) {
  // Return fake success without writing to DB
  return NextResponse.json({ success: true, id: 'test-id' })
}
```

---

## Running Tests

```bash
# Unit tests (fast, no network)
npm test

# Watch mode
npm run test:watch

# Integration tests (requires real Supabase)
RUN_INTEGRATION=true npm run test:integration

# E2E local
npm run test:e2e

# E2E against production
npm run test:e2e:prod
```

---

## CI Pipeline (.github/workflows/test.yml)

```yaml
name: Tests
on: [push]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
      - run: npx tsc --noEmit

  e2e:
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e:prod
```
