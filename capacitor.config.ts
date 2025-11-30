import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lsoapps.falshcardapps',
  appName: 'FlashCards',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

