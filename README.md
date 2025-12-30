# DatSer — Attendance & Member Management Dashboard

DatSer is a React + Vite dashboard for tracking member attendance and managing profiles, backed by Supabase. It includes secure admin authentication, day/month views, analytics, CSV exports, and a responsive Tailwind UI with dark/light themes.

## Features
- **Role-Based Access Control**: Secure Admin authentication with invite-based Collaborator system.
- **Collaborator Workspace Sync**: Invited collaborators automatically inherit the Organization/Workspace name of the owner.
- **Robust Settings Persistence**:
  - Cross-device sync for Theme (Light/Dark/System), Font Size, and Font Family.
  - **OpenDyslexic Support**: Built-in accessibility option for dyslexia-friendly reading.
  - **Zero-Leakage Isolation**: Strict cleanup ensures no settings "leak" between different accounts on shared devices.
- **Attendance & Analytics**:
  - Tracking by day and month with "Sunday Only" smart filters.
  - Real-time statistics and visualizations.
- **Member Management**: Add, edit, and bulk-manage members with custom badges.
- **Export**: Monthly data export to CSV.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + PostCSS (Custom Design System)
- **Backend / DB**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context (`AppContext`, `ThemeContext`, `AuthContext`)
- **Icons**: Lucide React

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

Previews the production build:
```bash
npm run preview
```

## Environment Variables
Create a `.env` (or `.env.local`) in the project root:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Requirements
To enable full functionality (specifically Collaborator Sync and Preferences), your Supabase project requires specific tables and RPC functions.

1.  **Tables**:
    - `user_preferences`: Stores theme, font, workspace name, etc.
    - `collaborators`: Manages invites and relationships.
2.  **RPC Functions**:
    - `get_owner_workspace_name(owner_uuid)`: **Critical**. Allows collaborators to securely read their owner's workspace name without full access.
    - `get_table_columns(table_name)`: Used for dynamic attendance sheet generation.

## Deployment
- Deploy to Vercel or Netlify. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host’s environment settings.
- Ensure your Supabase RLS policies permit the required read/write operations.

## Security Note
- **Row Level Security (RLS)** is enabled on all tables to ensure users can only access data they own or have been explicitly granted access to.
- API Keys in `.env` are "Authorized" (Anon) keys, safe for frontend use, but restricted by RLS.

## License
Proprietary. All rights reserved.