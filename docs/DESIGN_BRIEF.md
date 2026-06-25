# GLAM'D Cebu — Designer Brief

Hand this to a UI/UX designer (or use with Figma) before final polish.

## Brand reference

The **price list images** in `public/assets/` are the source of truth:
- Cream `#f5f0e8`, beige `#e8ddd0`, brown `#6b4c3b`
- Serif headings (Playfair Display), sans body (DM Sans)
- Pill badges, diamond dividers, soft salon feel

## Primary button color (anchor)

| Token | Hex | Use |
|-------|-----|-----|
| brand-brown | `#6b4c3b` | Book Now, icons, footer gradient mid-tone |
| brand-brown-dark | `#523a2c` | Hover, footer gradient bottom |
| brand-cream | `#f5f0e8` | Cards, contact rows on footer |
| brand-ink | `#2c1f17` | Body text on light backgrounds |

## Footer rules (learned from prototype)

1. **Entire footer** must be brown gradient — never white text on cream
2. **Contact rows** = cream cards + dark brown text (high contrast)
3. **No floating dark curve** separate from the footer body
4. **Icons** = brown circles, white glyphs (same as Book Now)

## Screens to design (Figma)

1. Home
2. Services (lash/brow + nails)
3. Book flow (5 steps)
4. Schedule overview (`/calendar`)
5. Admin calendar
6. Footer component (mobile 390px width)

## Designer options (Cebu / remote)

| Option | Best for | Notes |
|--------|----------|-------|
| **Continue in Cursor** | Fast iteration on prototype | We use your price lists as brand guide |
| **Figma + Figma MCP** | Pixel-perfect mockups | You have Figma MCP connected |
| **Behance / Facebook** | Hire local PH designer | Search "salon UI Cebu" or "beauty brand PH" |
| **Canva Pro** | Quick social + menu match | Christine may already use similar style |

## Deliverables from designer

- [ ] Mobile-first Figma file (390×844)
- [ ] Color + type tokens
- [ ] Footer component spec
- [ ] Component library (buttons, cards, calendar cells)
- [ ] Export assets for PWA icons

Log feedback in [REVISIONS.md](./REVISIONS.md).
