import { loadEnv } from 'vite';
import { readFileSync,existsSync } from 'node:fs';
const env={...loadEnv('production',process.cwd(),''),...process.env};
const errors:string[]=[];
for(const platform of ['ANDROID','IOS']){
 const rc=env[`VITE_REVENUECAT_${platform}_KEY`];if(!rc||!/^(goog|appl)_/.test(rc))errors.push(`VITE_REVENUECAT_${platform}_KEY: SDK public key required`);
 const app=env[`ADMOB_${platform}_APP_ID`];if(!app||!/^ca-app-pub-\d{16}~\d{10}$/.test(app)||app.includes('3940256099942544'))errors.push(`ADMOB_${platform}_APP_ID: publisher app ID required`);
 for(const format of ['INTERSTITIAL','REWARDED']){const v=env[`VITE_ADMOB_${platform}_${format}`];if(!v||!/^ca-app-pub-\d{16}\/\d{10}$/.test(v)||v.includes('3940256099942544'))errors.push(`VITE_ADMOB_${platform}_${format}: production ad unit required`);}
}
if(env.VITE_ADS_ENABLED!=='true')errors.push('VITE_ADS_ENABLED must be true for the agreed commercial model');
if(env.VITE_ADS_TESTING!=='false')errors.push('VITE_ADS_TESTING must be false for a store release');
if(!env.VITE_PRIVACY_URL||!/^https:\/\//.test(env.VITE_PRIVACY_URL)||/example\./.test(env.VITE_PRIVACY_URL))errors.push('A published HTTPS privacy policy URL is required');
if(!env.SUPPORT_EMAIL||!env.SUPPORT_EMAIL.includes('@'))errors.push('SUPPORT_EMAIL is required for the store and privacy policy');
if(!existsSync('dist/index.html'))errors.push('Build the web assets first');
const levels=JSON.parse(readFileSync('src/data/levels.json','utf8'));if(levels.length!==300)errors.push('Campaign must have 300 levels');
if(errors.length){console.error('Store release is blocked by the following configuration requirements (no values printed):\n'+errors.map(x=>' - '+x).join('\n'));process.exitCode=1;}
else console.log('Static configuration checks passed. Still required: signed Android/iOS builds, sandbox purchases/restore/refunds, consent and ads on devices, store forms and human playtests.');
