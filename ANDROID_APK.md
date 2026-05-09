# DatSer Android APK

DatSer's Android app is a separate Capacitor wrapper around the existing website. It loads the live website at:

```text
https://datser.vercel.app
```

The normal browser website still uses the usual Vite build and is not replaced by the Android project.

## What Updates Automatically

Normal website changes appear in the Android app automatically because the APK opens the live website URL. Users do not need a new APK for normal React, Supabase, UI, or content updates after those changes are deployed to the website.

A new APK is only needed for APK-level changes, such as:

- App icon
- Splash screen
- Android package name
- Android permissions
- Native Capacitor plugins
- Native Android code
- Signing or version metadata

## Package Name

The permanent Android package name is:

```text
com.datser.app
```

Do not change this later unless you are intentionally creating a separate app. Android will not update an existing installation if the package name changes.

## Live URL

By default, `capacitor.config.ts` uses:

```text
https://datser.vercel.app
```

To build a one-off APK for another URL:

```powershell
$env:CAPACITOR_SERVER_URL="https://your-live-datser-site.com"
npm run android:sync
npm run android:apk
```

Leave `CAPACITOR_SERVER_URL` unset for the production DatSer APK.

## Local Emulator Build

The normal Android wrapper loads the live website, so local UI fixes will not appear in the emulator until the website is deployed. To test local bundled code before deploying, build a local APK:

```powershell
npm run android:apk:local
```

Local bundled mode sets `CAPACITOR_LOCAL_BUNDLE=true`, omits `server.url`, copies the current `dist` files into the APK, and shows the code from your local `npm run build` output.

Use these modes:

- `npm run android:apk:local` for emulator/local QA before pushing or deploying.
- `npm run android:apk` for the live wrapper that loads `https://datser.vercel.app`.

## Java Setup On Windows

Gradle needs Java. If Android Studio is installed, use its bundled JBR:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
```

If that path does not exist, install Android Studio or a JDK first.

## Debug APK

Build a debug APK:

```powershell
npm install
npm run android:apk
```

Debug APK output:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

Debug APKs are useful for testing, but they are not the best final file to share widely.

For local bundled emulator testing, use:

```powershell
npm run android:apk:local
```

## Release Signing Key

Use one permanent signing key for all future release APKs. Changing the signing key later will prevent Android from updating the old APK; users would need to uninstall and reinstall.

Create the release key manually so the password is chosen by you and never appears in source control:

```powershell
cd android
keytool -genkeypair -v -keystore datser-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias datser
```

Then create `android\keystore.properties` manually:

```powershell
@"
storeFile=datser-release-key.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=datser
keyPassword=YOUR_KEY_PASSWORD
"@ | Set-Content -Path keystore.properties
cd ..
```

Keep these files private:

```text
android\datser-release-key.jks
android\keystore.properties
```

They are ignored by Git in `android\.gitignore`.

You can also use environment variables instead of `keystore.properties`:

```powershell
$env:DATSER_ANDROID_KEYSTORE_FILE="datser-release-key.jks"
$env:DATSER_ANDROID_KEYSTORE_PASSWORD="YOUR_KEYSTORE_PASSWORD"
$env:DATSER_ANDROID_KEY_ALIAS="datser"
$env:DATSER_ANDROID_KEY_PASSWORD="YOUR_KEY_PASSWORD"
```

## Release APK

After the signing key is configured:

```powershell
npm run android:apk:release
```

Release APK output:

```text
android\app\build\outputs\apk\release\app-release.apk
```

## Android Studio

Open the Android project:

```powershell
npm run android:sync
npm run android:open
```

## Private APK Update Manager

DatSer now has a private APK update manager for Android installs outside Google Play.

Admin upload flow:

```text
Admin Panel > App Updates
```

Admins can upload a `.apk`, set `versionName`, `versionCode`, title, release notes, force-update status, and publish/unpublish status. Release metadata is stored in Supabase table `app_releases`; APK files are stored in the Supabase Storage bucket `app-updates`.

Manual Supabase setup:

```text
supabase/migrations/20260507_app_releases.sql
```

That migration creates the table, public storage bucket, upload/read policies, and admin checks. If the migration is not applied yet, Android update checks fall back to the legacy `/app-version.json` file below.

## Version Name And Version Code

Android uses both:

- `versionName`: human-readable version, for example `1.0.3`
- `versionCode`: integer version, for example `3`

Future APK updates must use a higher `versionCode`, the same package name, and the same release signing key.

Current package name:

```text
com.datser.app
```

If the package name or signing key changes, Android will not install the APK as an update.

## Direct APK Update Checker Fallback

The website includes:

```text
public\app-version.json
```

The Android app checks this file and compares the installed app version with `latestVersion`.

Example:

```json
{
  "latestVersion": "1.0.1",
  "apkUrl": "https://datser.vercel.app/downloads/datser-1.0.1.apk",
  "forceUpdate": false,
  "message": "A new DatSer app update is available."
}
```

Fields:

- `latestVersion`: newest APK version available
- `apkUrl`: public HTTPS URL where users can download the APK
- `forceUpdate`: if `true`, app usage is blocked until the user opens the update link
- `message`: text shown in the update prompt

The update button opens the APK download URL in the Android browser. Android will still ask the user to confirm installation manually.

For the current app version, keep `latestVersion` equal to the installed APK version so users are not prompted immediately.

## Notification System

DatSer uses polished in-app notifications for success, error, warning, info, offline, online, sync, and APK-update messages. They appear bottom-right on desktop/tablet and near the bottom above `env(safe-area-inset-bottom)` on mobile/Android.

Notifications can auto-dismiss, be manually dismissed, and expand when they include details or action buttons. Important states such as force update required or sync failed can stay persistent.

APK update notifications support:

- `Download Update`
- `Later` when the update is optional
- `View Details`

## Offline Mode

The APK includes an in-app offline foundation for attendance work. In Settings > Data Management, use `Download Offline Data` while online to cache the current members, month list, attendance data, and selected date on the device.

When the app is offline, attendance marks are saved to a local IndexedDB pending queue. When the app is back online, `Sync Now` uploads those pending changes safely and keeps conflicts pending instead of overwriting server data blindly.

Offline sync is different from the APK update checker:

- Offline sync handles member and attendance data.
- `/app-version.json` handles APK-level updates.
- Web app toasts and banners are in-app notifications only.
- Native Android notification tray alerts are not enabled yet.

More detail is in:

```text
OFFLINE_MODE.md
```

## Troubleshooting

### `JAVA_HOME is not set`

Install Android Studio, then run:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
npm run android:apk
```

If Android Studio is installed somewhere else, set `JAVA_HOME` to that `jbr` or JDK folder.

### `App not installed`

Common causes:

- The phone blocks unknown-source installs.
- A previous DatSer APK was signed with a different key.
- A previous DatSer APK used a different package name.
- The phone has an old debug APK installed.

Fix:

1. Confirm the APK is signed with the same permanent release key.
2. Confirm the package name is still `com.datser.app`.
3. If you previously installed a debug APK, uninstall it before installing the release APK.

### Signing Mismatch

Android requires future updates to use the same package name and same signing key. If either changes, Android will reject the update. Keep `android\datser-release-key.jks` backed up safely.

### Website Does Not Load In APK

Check:

```powershell
Get-Content capacitor.config.ts
```

For the live wrapper, confirm the server URL is:

```text
https://datser.vercel.app
```

For local bundled emulator testing, `npm run android:apk:local` intentionally removes `server.url` from the generated Android asset config so the APK loads its bundled Vite files.

Then resync:

```powershell
npm run android:sync
```
