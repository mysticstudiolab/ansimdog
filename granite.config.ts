import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'ansimdog',
  brand: {
    displayName: '안심하개',
    primaryColor: '#4E9D88',
    icon: 'https://ihgspxupwksmornwapra.supabase.co/storage/v1/object/public/dog-photos/1b37aaa0-c189-4e97-82ae-6b9f1105a0a4/app-icon-light.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});
