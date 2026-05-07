# DatSer Offline Mode

DatSer now has a safe offline-first foundation for the Android APK and mobile webview. The normal browser website still works online the same way.

## What Is Cached

The Settings > Data Management > Offline Mode card stores a local IndexedDB snapshot of:

- Members currently loaded in the app
- Month table list
- Current month
- Current attendance data already loaded for that month
- Selected attendance date
- Basic workspace label

Follow-up data is still calculated online from the normal app data path. The offline layer is intentionally conservative so it does not rewrite the existing Supabase flow.

## Preparing Offline Data

Open Settings > Data Management and tap `Download Offline Data` while online. The app saves a local cache and shows the last cache time, member count, and attendance date count.

If the app opens while offline, it tries to load this cached snapshot. If no cache exists, the app cannot invent missing Supabase data.

## Offline Attendance Changes

When the app is offline and attendance is marked, DatSer:

- Updates the UI locally
- Stores a pending IndexedDB queue item
- Keeps the change until it syncs successfully
- Shows the pending sync count

Each queue item stores:

- `member_id`
- `session_id`
- `service_date`
- `attendance_status`
- `timestamp`
- `action_type`
- `local_change_id`
- `sync_status`

## Sync Now

When the app comes back online, the banner and Settings card show a `Sync Now` button if pending changes exist.

The sync process checks the server attendance for the same date first. If the server has a different value, DatSer keeps the local change pending and marks it as a conflict instead of overwriting blindly.

Changes from another month stay pending until that month is selected, which avoids syncing into the wrong monthly table.

## Clear Offline Cache

Settings > Data Management > Offline Mode has `Clear Cache`. It removes the cached snapshot and pending queue from this device only. It does not delete Supabase data.

## Notifications

This pass uses in-app banners and toast messages only. It does not add Android notification tray alerts or notification permissions.

Native Android notifications can be added later with a Capacitor local-notifications plugin if the app needs reminders outside the open app.

## Current Limitations

- Offline mode is a foundation, not a full multi-device conflict resolver.
- Follow-up records are not deeply cached yet.
- Pending changes for non-current months wait until that month is selected.
- Android still needs the user to confirm APK installs and updates manually.

## Testing

Desktop/browser:

```powershell
npm test
npm run lint
npm run build
npm run test:smoke
npm run test:smoke:prod
```

Android:

```powershell
npm run android:sync
npm run android:apk
```

Debug APK output:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

In Android Studio, run the app in the Pixel emulator, prepare offline data, turn off network, mark attendance, turn network back on, then tap `Sync Now`.
