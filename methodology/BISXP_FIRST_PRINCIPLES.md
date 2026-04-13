# BISXP Marketplace First Principles
_Version 1.0 — April 2026_
_The standard against which every BISXP marketplace is built and audited_

---

## What This Document Is

This is the first principles framework for every BISXP marketplace. It defines what a marketplace must do — not at the code level, but at the level of market behaviour, user experience, trust, and economics.

The BISXP Marketplace Pattern (technical document) tells you *how* to build. This document tells you *what* to build and *why*. A marketplace that passes all the technical checks but fails the first principles is not a marketplace — it is a directory with a database.

Every investigation session audits the codebase against this document, not just against the technical pattern. Every session plan must justify itself against at least one first principle.

---

## The Core Job

A marketplace has one job:

**Reliably connect supply and demand, and earn trust from both sides simultaneously.**

If customers cannot find what they need — discovery fails.
If owners do not get qualified leads — supply dries up.
If either side does not trust the platform — the marketplace dies.

Everything else is in service of this one job.

---

## The Ten First Principles

---

### Principle 1 — Discovery

**The customer must be able to find exactly what they need, quickly.**

A marketplace that requires the customer to already know what they want is not a marketplace — it is a directory. True discovery means the platform surfaces relevant options the customer would not have found on their own.

#### What discovery requires:

**Search that works**
- Full-text search across listing names, descriptions, amenities, event types
- Filter by: category, city/area, price range, capacity, event type, amenities
- Sort by: relevance, price low-high, price high-low, rating, newest
- Results that actually match the query — not just all listings

**Contextual browsing**
- Category landing pages: "Wedding Venues in Seattle", "Catering in Bellevue"
- Each category page has its own SEO-optimised headline, description, and listing subset
- Homepage featured section shows highest-quality listings, not random ones
- "Similar venues" / "vendors that work with this venue" recommendations

**AI-assisted matching** (Phase 2 threshold)
- Customer describes their event → platform suggests 3 best-fit venues
- Budget + guest count + event type → filtered shortlist with explanation

**Search quality signals**
- Listings with photos rank higher than listings without
- Listings with packages rank higher than listings without
- Listings with recent enquiries signal demand to other customers
- Rating and review count influence ranking

#### Fetespace audit questions:
1. Does search exist at all — is there a search input anywhere?
2. Do category filters on /venues and /vendors actually work with the database?
3. Can you filter by price range, capacity, event type?
4. Is there a sort control?
5. Do the 23 seeded venues have real content that makes search meaningful?
6. Are there category landing pages with SEO-optimised content?
7. Does the homepage featured section show genuinely featured listings or all listings?
8. Is there any "similar venues" logic on the detail page?

---

### Principle 2 — Trust

**Both sides must believe the platform is credible before they will transact.**

Trust is the hardest thing to build and the fastest thing to lose. A marketplace with no reviews, no real photos, no verified listings, and no social proof is asking customers to take a blind leap. Most will not.

#### What trust requires:

**Social proof from other customers**
- Real reviews with star ratings, written by real customers post-event
- Review count visible on listing cards — not just detail pages
- Reviews verified: only customers who submitted an enquiry that reached closed_won can leave a review
- Aggregate rating displayed prominently

**Visual credibility**
- Real photos on every listing — not gradient placeholders
- Photo quality matters: dark, blurry, or irrelevant photos damage trust
- Video walkthroughs for premium listings
- Hero photo that represents the venue accurately

**Listing completeness signals**
- Capacity clearly stated
- Pricing clearly stated (even a range)
- Amenities listed
- Event types listed
- Owner contact visible
- "Verified listing" badge for claimed listings

**Platform credibility**
- Professional domain (not a Vercel subdomain)
- Resend email from a verified domain
- Privacy policy and terms of service
- About page explaining what Fetespace is
- Real venue and vendor count in the hero section (not placeholder "500+ venues")
- Press or media mentions (Phase 2)

**Owner responsiveness signals**
- "Typically responds within 24 hours" badge
- Last active timestamp on owner portal
- Enquiry response rate visible to customers (Phase 2)

#### Fetespace audit questions:
1. Is there a reviews system — table, collection flow, display on listings?
2. Can a customer see how many reviews a venue has on the listing card?
3. Do listing cards show ratings?
4. How many of the 23 seeded venues have real photos uploaded?
5. How many seeded venues have real pricing, capacity, amenities filled in?
6. Is there a "Verified" or "Claimed" badge on claimed listings?
7. Is the site on fetespace.com or still on a Vercel preview URL?
8. Is there an About page, Privacy Policy, Terms of Service?
9. Are the stats on the homepage (venue count, etc.) real or placeholder?
10. What does a listing card look like with no photos — gradient only?

---

### Principle 3 — Transaction Completion

**The connection between customer and owner must actually complete into a booking.**

An enquiry is not a transaction. It is the start of a conversation. A marketplace that stops at the enquiry has not completed its job — it has made an introduction and walked away. The platform must support the full arc from discovery to booking to post-event.

#### What transaction completion requires:

**Enquiry quality**
- The enquiry form collects enough information for the owner to give a meaningful response
- Event type, date, guest count, message — all captured
- The customer knows what happens after they submit
- Confirmation email sent immediately

**Owner response enablement**
- Owner is notified immediately (email + WhatsApp)
- Owner can respond with pricing, availability, and next steps from their portal
- Response includes a way to continue the conversation (WhatsApp, phone, email)
- Owner can mark enquiry status so the pipeline is tracked

**Availability signalling**
- The customer should be able to see if a venue is available on their date before enquiring
- Blocking unavailable dates prevents wasted enquiries
- Calendar integration (Phase 2)

**Booking confirmation**
- When a booking is confirmed (closed_won), both sides should receive confirmation
- Customer gets a summary of what they booked and who to contact
- Owner gets a clear record of the committed booking

**Post-booking experience**
- Review request sent after event date passes
- Customer can leave a verified review
- Owner can respond to the review

**Commission tracking**
- When a booking completes through the platform, commission is tracked
- This is the platform's primary revenue source — it cannot be an afterthought

#### Fetespace audit questions:
1. Does the enquiry confirmation email tell the customer what happens next?
2. Is the owner notified by email when an enquiry arrives?
3. Is the owner notified by WhatsApp when an enquiry arrives?
4. Can the owner respond to an enquiry from within the portal?
5. Can the owner see the customer's phone/email to continue conversation?
6. Is there any availability calendar — even a basic one?
7. When an owner marks closed_won, does anything happen (review request, confirmation)?
8. Is there any commission tracking mechanism?
9. Can a customer see the status of their own enquiry?
10. Is there a customer account page that shows their enquiry history?

---

### Principle 4 — Supply Quality

**What is listed must be good enough to convert a customer.**

A marketplace is only as good as its worst listing. A listing with no photos, no pricing, no description, and no reviews is not just unhelpful — it actively damages the platform's credibility. Every listing that appears publicly must meet a minimum quality bar.

#### What supply quality requires:

**Minimum listing quality threshold**
- A listing should not appear publicly until it has: name, location, short description, at least one photo (not gradient), at least one event type, price range or pricing enquiry option
- Admin must be able to enforce this — listings below threshold are not visible

**Listing completeness scoring**
- Each listing has a completeness score visible to the owner
- Score drives a "Complete your listing" prompt in the owner portal
- Higher completeness = higher search ranking

**Photo quality**
- Photos must be uploaded, not just URL-pasted placeholder gradients
- At least 3 real photos for a listing to appear as "complete"
- Hero photo must be set — not auto-selected randomly

**Content quality**
- Description must be more than 50 characters
- Short description must be populated
- Amenities must be tagged (not empty)
- Event types must be tagged (not empty)

**Data freshness**
- Listings not updated in 90+ days show a "Needs attention" flag in admin
- Owner portal prompts owners to update stale information

#### Fetespace audit questions:
1. Is there any minimum quality check before a listing appears publicly?
2. How many of the 23 seeded venues have: real photos, real descriptions, real pricing, real amenities, real event types?
3. Is there a listing completeness indicator anywhere in the owner portal?
4. Can admin see which listings are incomplete?
5. Do any listings currently show as gradient-only on the public page?
6. Is there a "Complete your listing" prompt for owners?

---

### Principle 5 — Demand Experience

**The customer journey must be coherent from first visit to post-event.**

A customer arriving at Fetespace for the first time must be able to understand what it is, find what they need, contact a venue, and feel confident about doing so — without reading any instructions. The journey must be mobile-first, fast, and frictionless.

#### What demand experience requires:

**First visit clarity**
- Homepage communicates the value proposition in under 5 seconds
- Customer knows immediately: this is where I find venues and vendors in Washington
- Clear categories, clear how it works, clear social proof

**Mobile-first search and browse**
- 80%+ of venue discovery happens on mobile
- Listing cards must be readable and tappable on a 390px screen
- Filters must work with thumbs
- Enquiry form must be easy to complete on mobile
- Photo gallery must be swipeable on mobile

**Frictionless enquiry**
- Enquiry form requires the minimum information needed
- No account required to enquire (guest enquiry must work)
- Confirmation immediately after submitting
- Clear expectation setting: "The venue will respond within 24 hours"

**Customer account value**
- If a customer creates an account, what do they get?
- Enquiry history — can they see past enquiries?
- Saved/wishlisted venues
- Planner/budget tool (Phase 2 for Fetespace)
- The account must be worth creating — not just an empty profile page

**Error states and edge cases**
- What happens when a listing is not found? (404 handling)
- What happens when the enquiry fails to submit?
- What happens when photos fail to load?
- What happens on a slow connection?
- Loading states on all async operations

#### Fetespace audit questions:
1. Does the homepage communicate the value proposition clearly above the fold?
2. Is the listing card readable and tappable on mobile?
3. Are the filter pills on /venues and /vendors usable on mobile (no overflow)?
4. Can a customer enquire without creating an account?
5. What does /my/account show a logged-in customer? Is it useful?
6. Is there a wishlist or save feature for listings?
7. What is the 404 page for a non-existent venue slug?
8. Do all fetch operations have loading states?
9. Do all fetch operations have error states?
10. Is the enquiry form completable on a 390px mobile screen without horizontal scroll?

---

### Principle 6 — Supply Operations

**An owner must be able to run their business through the platform without calling anyone.**

The owner portal is not a nice-to-have. It is the retention mechanism for supply. If owners cannot manage their listing, respond to enquiries, and see their pipeline without calling the platform operator, they will leave for a competitor or stop caring about their listing. A stale listing with no owner engagement is supply in name only.

#### What supply operations require:

**Complete self-service**
- Owner can update every field on their listing without contacting admin
- Owner can upload and manage photos without contacting admin
- Owner can create, edit, and delete packages without contacting admin
- Owner can respond to and track enquiries without contacting admin

**Enquiry pipeline management**
- Owner sees all enquiries in one place
- Owner can move enquiries through the pipeline (new → contacted → site_visit → won/lost)
- Owner can add notes to each enquiry
- Owner can contact the customer directly (WhatsApp link, phone, email)
- Owner can see their conversion rate (enquiries → bookings)

**Listing performance visibility**
- Owner can see: how many people viewed their listing (page views)
- Owner can see: how many enquiries they received this month
- Owner can see: their enquiry-to-booking conversion rate
- Owner can see: their listing completeness score
- Owner can see: their listing's search ranking position

**Notification and responsiveness**
- Owner is notified immediately when an enquiry arrives
- Owner knows when they last logged in and when they last responded
- The platform prompts owners who haven't responded within 24 hours

**Tier value clarity**
- Owner understands exactly what they get on each tier
- The upgrade prompt shows a concrete benefit ("Upgrade to see 47 enquiries waiting")
- The upgrade path is frictionless (not "email us")

#### Fetespace audit questions:
1. Can an owner update all listing fields from the portal without contacting admin?
2. Can an owner upload photos from the portal?
3. Can an owner create packages from the portal?
4. Can an owner see and manage all their enquiries from the portal?
5. Can an owner contact a customer directly from the portal (WhatsApp/phone link)?
6. Is there any analytics or performance data in the owner portal?
7. Is the tier upgrade path clear — does the upgrade CTA show concrete value?
8. Is the upgrade path frictionless (not just a mailto link)?
9. Does the owner get notified by WhatsApp when an enquiry arrives?
10. Is there a "Typical response time" metric visible to the owner?

---

### Principle 7 — Platform Operations

**The operator must be able to run the marketplace day-to-day without touching the database.**

If adding a venue requires SQL, the marketplace cannot scale. If approving a vendor requires manual steps in three different systems, the operator will make errors. Every operation that happens more than once a week must have a UI.

#### What platform operations require:

**Listing management**
- Admin can add, edit, activate, deactivate, and delete any listing
- Admin can set featured status and sort order
- Admin can set tier for any listing
- Admin can see all listings including demo listings
- Admin can bulk-import listings (Phase 2)

**Claim and onboarding management**
- Admin can see all pending claims
- Admin can approve a claim and automatically link it to an owner account
- Admin can contact a claimant directly from the dashboard
- Admin can reject a claim with a reason
- The entire claim-to-live-listing flow must be completable without SQL

**Enquiry oversight**
- Admin can see all enquiries across all listings
- Admin can filter by status, listing, date range
- Admin can add notes to any enquiry
- Admin can see the full conversation thread

**Account management**
- Admin can link a Google account to a venue or vendor listing
- Admin can unlink an account
- Admin can change a user's role
- Admin can see all users and their linked listings

**Platform configuration**
- Admin can change tier prices without code deployment
- Admin can toggle feature flags without code deployment
- Admin can change platform emails without code deployment
- Admin can see platform-wide stats: total listings, total enquiries, total bookings

**Content management**
- Admin can add/edit/delete FAQs (Phase 2 for Fetespace)
- Admin can manage homepage featured listings
- Admin can set sort order of listings

#### Fetespace audit questions:
1. Can admin add a new venue entirely from the dashboard UI (no SQL)?
2. Can admin edit any field on an existing venue from the dashboard?
3. Can admin approve a claim and automatically link it to an owner account (no SQL)?
4. Can admin see all enquiries with filters?
5. Can admin add notes to enquiries from the dashboard?
6. Can admin link/unlink a Google account to a vendor from the dashboard?
7. Can admin change tier prices from the Settings tab?
8. Can admin toggle feature flags from the Settings tab?
9. Is there any platform-wide analytics visible to admin?
10. Can admin manage which listings appear on the homepage?

---

### Principle 8 — Growth Mechanics

**The platform must get better as it grows — not just bigger.**

A directory gets bigger as you add listings. A marketplace gets better. Better means: more relevant search results, stronger social proof, better matching, more trust signals, lower friction. Growth mechanics are the features that create compounding value rather than linear value.

#### What growth mechanics require:

**Network effects on supply**
- More venues listed → more categories covered → more customers served → more demand → more venues want to list
- The platform should surface "category gaps" to admin: "No DJ vendors in Tacoma"

**Network effects on demand**
- More customers → more enquiries → more reviews → more trust → more customers
- Reviews are the most important growth mechanic — they compound over time

**SEO as a growth channel**
- Every listing is a SEO landing page
- Category pages drive organic traffic
- Blog content drives long-tail discovery
- Schema markup (JSON-LD) for rich results in Google Search
- Dynamic sitemap covering all listings and categories
- OG images for social sharing

**Referral mechanics**
- Customer refers another customer → discount or credit
- Owner refers another owner → commission or fee waiver
- Influencer refers bookings → commission (Phase 2)

**Content as a growth asset**
- Celebration wall / feed: user-generated content that drives return visits
- Blog: SEO content that drives first visits
- Lookbook / inspiration: aspiration content that drives sign-ups

**Data flywheel**
- Every enquiry teaches the platform what customers want
- Every booking teaches the platform what converts
- Every review teaches the platform what owners deliver
- This data improves matching, ranking, and recommendations over time

#### Fetespace audit questions:
1. Is there a dynamic sitemap covering all venue and vendor slugs?
2. Are there JSON-LD structured data blocks on listing detail pages?
3. Do listing detail pages have unique, populated meta titles and descriptions?
4. Are OG images generated per listing (or at minimum per category)?
5. Is there a blog or content section?
6. Is there any referral mechanism?
7. Is there a social feed or celebration wall?
8. Are listing pages indexed by Google (robots.txt allows, no noindex)?
9. Do category filter pages have unique URLs that can be indexed?
10. Is there any analytics tracking (Google Analytics, Plausible, or similar)?

---

### Principle 9 — Resilience

**The marketplace must work when things go wrong.**

A marketplace that breaks silently, shows blank pages on errors, or loses data when a request fails is not production-ready. Resilience is not a polish feature — it is a trust feature. Every failure state is a moment where the customer or owner decides whether to trust the platform.

#### What resilience requires:

**Error boundaries**
- Every page that makes async calls has an error boundary
- Errors are caught and displayed as human-readable messages, not stack traces
- The customer is told what to do next when something fails

**Loading states**
- Every async operation shows a loading indicator
- Lists show skeleton cards while loading, not a blank white page
- Forms disable submit button and show "Sending..." while in flight

**Empty states**
- Every list has a designed empty state — not a blank space
- Empty states guide the user toward action ("No venues found. Try a different filter.")
- Owner portal empty states encourage completion ("Add your first photo to attract more enquiries")

**Network failure handling**
- Fetch failures are caught and retried once
- If retry fails, user is shown an error with a "Try again" button
- Form submissions are not lost on network failure (localStorage draft)

**Data validation**
- Phone numbers validated client-side before submission
- Required fields validated before submission
- Dates validated (event date must be in the future)
- File uploads validated (size, type) before upload attempt

**Monitoring**
- Uptime monitoring on the production domain
- Error tracking (Sentry or similar) to catch runtime errors
- Deploy notifications so broken deploys are caught immediately
- Database query performance monitoring

#### Fetespace audit questions:
1. Do listing pages have error states when the API returns an error?
2. Do listing pages have loading states (skeleton or spinner)?
3. Do all lists have designed empty states?
4. What happens on the enquiry form when the network fails mid-submit?
5. Is phone validation client-side before form submission?
6. Is file size validated before upload attempt?
7. Is there uptime monitoring on preview.fetespace.com?
8. Is there any error tracking (Sentry or similar)?
9. What does the 404 page look like for a non-existent slug?
10. Are event dates validated to be in the future?

---

### Principle 10 — Economics

**The monetisation model must be built toward from day one — not retrofitted.**

A marketplace that generates no revenue is not a marketplace — it is a public service. The economics must be designed in from the start: tier enforcement, commission tracking, upgrade paths, and pricing clarity. Every feature either supports monetisation or is a cost centre.

#### What economics requires:

**Tier enforcement that actually enforces**
- Basic tier listings have genuinely limited features — not just locked UI
- Professional tier listings have demonstrably better visibility
- Premium tier listings have measurably more features
- An owner on basic tier who tries to upload photos gets a locked card, not an error
- The upgrade path from the locked card is immediate and frictionless

**Commission infrastructure**
- Every booking that completes through the platform is tracked
- Commission rate is stored in `bisxp_settings`, configurable without code
- Commission invoicing (Phase 2) flows from tracked bookings

**Pricing clarity**
- Tier pricing is visible on the claim/listing page
- Tier pricing is visible in the owner portal
- The value of each tier is clearly articulated in the upgrade prompt
- Pricing is stored in `bisxp_settings` — not hardcoded

**Upgrade friction reduction**
- The upgrade path should be: see locked feature → click Upgrade → payment → unlocked
- Currently: see locked feature → click mailto link → wait for response → manual process
- Stripe integration is Phase 2 but the flow must be designed for it

**Revenue tracking**
- Admin can see: how many listings are on each tier
- Admin can see: Monthly Recurring Revenue (tier count × tier price)
- Admin can see: enquiry volume (leading indicator of commission revenue)
- Admin can see: bookings confirmed (closed_won count — commission trigger)

#### Fetespace audit questions:
1. Is tier pricing visible on the claim/listing page?
2. Is tier pricing visible in the owner portal (not just the locked card)?
3. Is tier pricing stored in bisxp_settings or hardcoded?
4. Does the locked tab UI show the concrete benefit of upgrading?
5. Is the upgrade path frictionless (Stripe) or high-friction (mailto)?
6. Can admin see tier distribution across all listings?
7. Can admin see closed_won count (commission trigger)?
8. Can admin see total enquiry volume?
9. Is there any MRR visibility for admin?
10. Is commission rate stored in bisxp_settings and configurable?

---

## The Audit Scoring System

For each principle, every audit question is scored:

- ✅ **Yes, fully** — exists and works as described
- 🟡 **Partial** — exists but incomplete, broken, or not pattern-compliant
- ❌ **No** — does not exist
- 🔴 **Broken** — exists but actively harmful (wrong behaviour, blocks other things)
- ⬜ **Phase 2** — intentionally deferred, not a current gap

**Scoring thresholds:**
- 8–10 ✅ per principle: principle is satisfied
- 5–7 ✅ per principle: principle is partially satisfied — schedule a session
- 0–4 ✅ per principle: principle is critically unsatisfied — block other sessions until fixed

No new features are added to a marketplace until all ten principles reach "partially satisfied" or better. New features that serve a fully-satisfied principle are deprioritised vs gaps in unsatisfied principles.

---

## How This Document Drives Sessions

Every session proposal must answer:
1. Which principle(s) does this session serve?
2. Which specific audit questions does this session move from ❌ to ✅?
3. Does this session move any principle from critically unsatisfied to partially satisfied?

A session that cannot answer these questions clearly is not ready to plan.

---

_This document is the source of truth for what a BISXP marketplace must be._
_It is read at the start of every investigation session._
_It is updated when new first principles are identified._
_The technical pattern (BISXP_MARKETPLACE_PATTERN.md) tells you how to build._
_This document tells you what to build and why._
