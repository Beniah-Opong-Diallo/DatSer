# DatSer — Attendance & Member Management Dashboard

DatSer is a React + Vite dashboard for tracking member attendance and managing profiles, backed by Supabase. It includes secure admin authentication, day/month views, analytics, CSV exports, and a responsive Tailwind UI with dark/light themes.

## Features
- Admin authentication and access control
- Attendance tracking by day and month
- Analytics and statistics views
- Member management (add/edit) via modals
- Monthly export to CSV
- Dark/light theming with global context
- Error boundaries for safer UI rendering

## Tech Stack
- React 18 + Vite
- Tailwind CSS + PostCSS
- Supabase JS (database + auth)
- JavaScript (JSX)

## Getting Started
Install dependencies:
```bash
npm install
```

Run in development:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Environment Variables
Create a `.env` (or `.env.local`) in the project root:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure
- `src/components/` — Dashboard, analytics, modals, admin UI
- `src/context/` — `AppContext`, `ThemeContext`
- `src/lib/supabase.js` — Supabase client
- `public/` — icons, webmanifest
- Root configs: `tailwind.config.js`, `postcss.config.js`, `vite.config.js`

## Deployment
- Deploy to Vercel or Netlify. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host’s environment settings.
- Ensure your Supabase policies permit the required read/write operations.

## Notes
- If `VITE_SUPABASE_URL` uses a placeholder, some features (search/analytics) will show demo behavior.
- Tailwind customization lives in `tailwind.config.js`.

## License
Proprietary or add your preferred license here.