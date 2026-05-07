import type { CapacitorConfig } from '@capacitor/cli'

const useLocalBundle = process.env.CAPACITOR_LOCAL_BUNDLE === 'true'
const liveUrl = process.env.CAPACITOR_SERVER_URL || 'https://datser.vercel.app'
const serverConfig = useLocalBundle
  ? undefined
  : {
      url: liveUrl,
      cleartext: liveUrl.startsWith('http://')
    }

const config: CapacitorConfig = {
  appId: 'com.datser.app',
  appName: 'DatSer',
  webDir: 'dist',
  ...(serverConfig ? { server: serverConfig } : {}),
  android: {
    path: 'android'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
}

export default config
