
# NAVSHAKTHI — Enterprise Modules Expansion

Adds 15 new modules alongside the existing project. No existing page, route, style token, or brand asset changes — only additive files. Reuses the current design system (Playfair/Poppins, forest/clay/gold palette, `glass-card`, `PublicLayout`, `PortalShell`, `GenericSection`, `Reveal`, `Counter`, motion, sonner toasts, recharts).

## 0. Bugfix (existing AI Suggestions page)

`src/routes/portal.artisan.ai.tsx` currently seeds suggestion state via a randomized pool, causing an SSR/CSR hydration mismatch (Wallet vs BadgeCheck icon). Fix by seeding `useState` with a **deterministic** initial slice, and only randomize inside the "Generate new" click handler (client-only). No visual change.

## 1. New public routes (added to `SiteNav` "Platform" dropdown, not replacing anything)

```
src/routes/
  ai-authentication.tsx        # Feature 1 — full AI scan workflow with animated pipeline
  craft-passport.tsx           # Feature 2 — premium digital certificate preview + Download
  smart-kiosk-portal.tsx       # Feature 3 — hero, India map (SVG mock), service grid
  kiosk-appointment.tsx        # Feature 4 — booking wizard + QR/token slip
  training-portal.tsx          # Feature 6 — course catalog
  workshop-booking.tsx         # Feature 7 — calendar + slot grid
  certification-centre.tsx     # Feature 8 — timeline + slot booking CTA
  certificates.tsx             # Feature 10 — printable certificate gallery (6 types)
  ai-analytics.tsx             # Feature 12 — public analytics dashboard
```

Each uses `PublicLayout` + `PageHero` + `Reveal` so they blend with existing public pages. `SiteNav` gains a "Ecosystem" mega-menu linking to them; existing nav links stay.

## 2. New portal routes

**Artisan portal (additive nav items in `portal.artisan.tsx`):**
- `portal.artisan.authentication.tsx` — trigger AI verify + status
- `portal.artisan.passport.tsx` — Craft Passports list + detail modal
- `portal.artisan.nfc.tsx` — Feature 5, NFC card preview/download/share

**Government portal (additive):**
- `portal.government.certification.tsx` — verification queue + timeline (Feature 8)
- `portal.government.officers.tsx` — Feature 9, officer roster + live status + token generator

**New roles (Feature 13):**
- `portal.kiosk.tsx` + `portal.kiosk.index.tsx`, `portal.kiosk.appointments.tsx`, `portal.kiosk.services.tsx` — Kiosk Operator portal
- `portal.trainer.tsx` + `portal.trainer.index.tsx`, `portal.trainer.courses.tsx`, `portal.trainer.slots.tsx` — Trainer portal

Both reuse `PortalShell` (accent variants added: gold already exists; add `emerald` if needed). Role type in `auth-context.tsx` extended to include `kiosk` and `trainer` (additive union — existing code unaffected).

## 3. Cross-cutting components

- `src/components/ai/ScanPipeline.tsx` — animated multi-step scanner with progress bars & rotating status ("Scanning texture…", "Detecting carving patterns…", etc.), used on AI Authentication page.
- `src/components/passport/CraftPassport.tsx` — premium certificate card (ornament divider, seal, QR).
- `src/components/nfc/NfcCard.tsx` — glassy card with NFC/QR marks, flip animation.
- `src/components/kiosk/KioskMap.tsx` — SVG India map with clickable state dots (mock coordinates).
- `src/components/booking/SlotGrid.tsx` — reusable morning/afternoon/evening slot grid with availability colors.
- `src/components/certificates/CertificateSheet.tsx` — printable A4 certificate template (6 variants via prop).
- `src/components/notifications/NotificationCenter.tsx` — Feature 14, bell dropdown shell wired into `PortalShell` header (opt-in, existing bell button gains onClick).
- `src/components/ai/ChatAssistant.tsx` — Feature 15, floating bottom-right assistant with quick prompts + mock reply stream + voice-input button (Web Speech API guarded for SSR). Mounted once in `__root.tsx` **without** altering existing markup (appended sibling to Outlet).

## 4. Mock data additions (append to `src/lib/mock-data.ts`)

`kiosks`, `courses`, `workshopSlots`, `officers`, `notifications`, `passportSample`, `verificationSteps`, `certificateTypes`, `analyticsSeries`. All additive exports.

## 5. Design fidelity checklist

- Playfair Display headings, Poppins body — inherited.
- Buttons: rounded-full, primary/clay/gold accents from tokens.
- Cards: `rounded-3xl border border-border/60 bg-card` + `shadow-elegant`.
- Animations: `Reveal`, `motion` fade/slide, `Counter`.
- Sonner for all toasts.
- Fully responsive (grid → single column on mobile).
- All new pages set proper `head()` metadata.

## 6. Explicit non-goals

- No changes to `index.tsx`, `marketplace.tsx`, `products.$id.tsx`, existing portals' visuals, `styles.css` tokens, logo, or brand copy.
- No backend / no Cloud enablement — all mock data, deterministic where SSR-rendered.

Estimated new files: ~28. Estimated LoC: ~3.5k. No dependencies added.
