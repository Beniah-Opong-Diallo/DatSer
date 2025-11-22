## Quick Wins
- Add “Scan QR” in `admin` view to mark attendance instantly
- Generate member QR cards from their profile and print/distribute
- Speed up registration with phone OTP, smart duplicate detection, and CSV pre‑import
- Improve performance (caching, virtualization), mobile UX, and accessibility

## QR Fast Sign‑In (Two Options)
### Option A: Member Check‑In via QR (fastest to ship)
- Purpose: Already‑registered members scan their card; app marks attendance immediately without full account login
- Data model: Add `qr_hash` to each member row; store a random, opaque string per member
- QR content: Encode only `qr_hash` (not PII)
- Flow:
  - Admin opens scanner, camera reads QR
  - App looks up member by `qr_hash` and calls existing attendance update
  - Show success toast and haptic feedback
- Security:
  - Use non‑guessable `qr_hash` (UUID v4 + SHA‑256)
  - Optional: rotate/regenerate on loss; optionally add per‑service date limiter
- Where it fits:
  - Lookup: new helper in `src/context/AppContext.jsx` next to `markAttendance` (c:\Users\wonde\Downloads\DatSer\src\context\AppContext.jsx:606)
  - UI: new `QRScanner.jsx` used from Admin panel (App routes switch at c:\Users\wonde\Downloads\DatSer\src\App.jsx:98–109)

### Option B: Full Account Login via QR (more secure; needs auth)
- Purpose: Let members sign themselves in (auth session) by scanning a short‑lived QR
- Requires:
  - Add Supabase Auth (email/phone OTP, magic links)
  - Edge Function to mint one‑time, short‑lived tokens embedded in QR
- Flow:
  - User requests QR from their device; server mints token; QR encodes `one_time_token`
  - On kiosk, scan → exchange token for a Supabase session
- Trade‑off: Best security, but adds backend/edge functions and auth management; ship after Option A

## Implementation Steps (Option A first)
### 1) Data model
- Add column `qr_hash TEXT UNIQUE` in member tables (or a central `members` table) via migration
- Populate `qr_hash` for existing members with `crypto.randomUUID()` → SHA‑256 client‑side

### 2) QR generation (Admin)
- New `QRCodeGenerate.jsx` to render printable cards
- Library: `qrcode` (for generation)
- Placement: Admin panel (c:\Users\wonde\Downloads\DatSer\src\App.jsx:102–109)

### 3) QR scanning (Admin)
- New `QRScanner.jsx` component with camera access
- Library choices:
  - `html5-qrcode` (fast, reliable, minimal React glue)
  - or `react-qr-reader` (pure React wrapper)
- Flow inside scanner:
  - Decode → `qr_hash` → `supabase.from(currentTable).select('*').eq('qr_hash', hash).single()`
  - If found → `markAttendance(member.id, selectedAttendanceDate, true)` (c:\Users\wonde\Downloads\DatSer\src\context\AppContext.jsx:606–656)

### 4) UI/UX polish
- Large scan target, edge flash, success/failure state
- Offline queue: if network fails, queue the scan and retry
- Role guard: Only visible when admin flag is set (`tmht_admin_session`) (c:\Users\wonde\Downloads\DatSer\src\components\AdminAuth.jsx:21–45, c:\Users\wonde\Downloads\DatSer\src\App.jsx:98–109)

### 5) Security hardening (without full auth)
- Never encode name/phone in QR — only `qr_hash`
- Rate limit scans client‑side by time window; debounce duplicate scans
- Optional: store `last_scanned_at` to detect replay spikes

## Registration Speed Improvements
### Phone OTP + Magic Links (Supabase Auth)
- Add `supabase.auth.signInWithOtp` for phone
- Use OTP for returning members; new members complete profile after OTP
- Benefits: No passwords, faster repeat sign‑in

### Smart duplicate detection
- During registration, live search by name/phone to avoid duplicates
- Hook into existing search (`performServerSearch`) to surface possible matches (c:\Users\wonde\Downloads\DatSer\src\context\AppContext.jsx:1108–1166)

### Pre‑import and assisted forms
- CSV upload of members (already used `csv-stringify` for export; add import)
- Input masks and auto‑format for phone; progressive steps (name → phone → level)

## Other Website Improvements
### UX
- Mobile first scan flow; big tap areas; haptic feedback
- Keyboard shortcuts for desktop admin (P to mark present, A absent)
- Better empty‑state and loading skeletons

### Performance
- Cache server search results longer; prefetch next page of members
- Virtualize member list for large datasets
- Avoid re‑render by memoizing heavy components

### Reliability
- Offline‑first attendance queue; retry with exponential backoff
- Defensive error handling with clear user messaging

### Accessibility
- High‑contrast theme, focus outlines, ARIA labels in `AdminAuth` and modals
- Ensure scanner controls are keyboard‑navigable

### Security and Config
- Migrate from local admin password to Supabase Auth for real admin users
- Rotate `anon` key; ensure RLS policies lock down writes to necessary tables only
- Hide envs; keep `VITE_SUPABASE_URL/ANON_KEY` safe (c:\Users\wonde\Downloads\DatSer\src\lib\supabase.js:1–16)

## Phase Plan
- Phase 1: Option A QR Check‑In (data column, generator, scanner, UX)
- Phase 2: Registration speed (phone OTP, duplicate detection, CSV import)
- Phase 3: Full Auth + QR login (Edge Function, token exchange)
- Phase 4: Performance, accessibility, and security hardening

## Libraries to Add
- QR scanning: `html5-qrcode` or `react-qr-reader`
- QR generation: `qrcode`

## What You’ll See In The UI
- New Admin buttons: `Scan QR`, `Generate QR Cards`
- Scanner page with live camera preview and instant success toasts
- Faster registration with OTP and smart suggestions