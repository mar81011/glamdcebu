# Design Review — GLAM'D Cebu Prototype

**Reviewer:** UI/UX pass · **Date:** June 2026 · **Status:** Fixes applied

## Issues found

| Severity | Issue | Screens affected |
|----------|-------|------------------|
| Critical | Hero text placed directly on semi-transparent photo overlay — brown text blends into busy price-list background | Home, Services |
| High | Cards use `bg-white/85`–`90` — background bleeds through, weak contrast | All |
| High | Muted text uses opacity (`/40`–`/70`) on similar cream/brown tones — fails WCAG | Home, Book, Admin, links |
| Medium | Back links are plain low-opacity text on variable backgrounds | Services, Book, Admin |
| Medium | Admin tabs/calendar cells use `bg-white/60`–`70` — washed out | Admin |
| Low | Section labels too faint (`text-brand-brown/70`) | Services, Book |

## Fixes applied

1. **Background** — Photo reduced to subtle decorative layer (~12% opacity); solid cream base underneath
2. **Cards** — Solid white panels with defined borders and shadows (`ContentCard`)
3. **Typography** — New ink/muted/subtle tokens with full opacity (no camouflage)
4. **Navigation** — `BackLink` component with solid white chip
5. **Forms** — White input backgrounds, stronger borders
6. **Admin** — Solid surfaces for tabs, calendar cells, appointment cards

## Re-check after deploy

- [ ] Home headline readable on bright and dim screens
- [ ] Service prices readable on both category pages
- [ ] Booking form labels and time slots clearly visible
- [ ] Admin calendar day numbers readable on non-today cells
- [ ] Footer contact rows remain high contrast

Log further feedback in [REVISIONS.md](./REVISIONS.md).
