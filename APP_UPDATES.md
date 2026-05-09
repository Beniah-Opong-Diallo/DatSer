# DatSer Private APK Updates

DatSer APK updates are managed privately through Supabase. This is for Android APKs distributed outside Google Play.

## Supabase Setup

Run the migration:

```text
supabase/migrations/20260507_app_releases.sql
```

It creates:

- `app_releases` metadata table.
- `app-updates` public Supabase Storage bucket.
- RLS policies so active releases can be read and only workspace owners, admin collaborators, or developer-level users can manage releases.

If you do not apply the migration, the app falls back to `public/app-version.json` for update checks.

## Uploading A New APK

1. Build the APK.
2. Open `Admin Panel > App Updates`.
3. Enter `versionName`, `versionCode`, title, and release notes.
4. Choose the `.apk` file.
5. Select `Force update` only when users must update before continuing.
6. Select `Publish now` if it should be active immediately.
7. Click `Upload APK Release`.

The APK file must end in `.apk` and be under 150 MB.

## Android User Flow

On Android startup, DatSer checks the latest active release:

1. Reads the installed app version from Capacitor.
2. Checks Supabase `app_releases`.
3. Falls back to `/app-version.json` if Supabase app releases are not installed.
4. Compares version code first, then version name.
5. Shows an update notification and details prompt when a newer APK exists.

The `Download Update` button opens the APK URL with the browser/download flow. Android still asks the user to confirm Install or Update manually. The app never silently installs APKs.

## Force Updates

If `force_update` is true, the update prompt blocks normal app usage until the user opens the download flow. Offline data and pending sync changes are not erased.

APK updates are app-level updates. Offline Sync is separate and still controls member/attendance data changes.

## Versioning Rules

Android update installs require:

- Same package name: `com.datser.app`
- Same release signing key
- Higher `versionCode`

`versionName` is the human-readable label, like `1.0.3`.
`versionCode` is the integer Android uses to decide whether an APK is newer.

If the package name or signing key changes, Android rejects the APK as an update.

## Build Commands

Local bundled APK:

```powershell
npm run android:apk:local
```

Live website wrapper APK:

```powershell
npm run android:apk
```

Release APK:

```powershell
npm run android:apk:release
```

## Notification Testing

Use app flows that trigger:

- success toast
- error toast
- offline mode active
- back online with pending changes
- sync failed
- update available

Notifications appear bottom-right on desktop/tablet and above the Android safe-area bottom on mobile/APK. Tap a notification to expand details and action buttons when present.
