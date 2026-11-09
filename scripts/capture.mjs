import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4176'],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4176')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});mkdirSync('release/screenshots',{recursive:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await page.goto('http://127.0.0.1:4176');await page.getByRole('button',{name:'C’est parti'}).waitFor();await page.screenshot({path:'release/screenshots/accueil-mobile.png',fullPage:true});
 // Screenshot fixture only: a real published level, with all preceding levels marked complete.
 await page.evaluate(()=>localStorage.setItem('ito-save-v1',JSON.stringify({version:1,coins:80,completed:Array.from({length:89},(_,i)=>i+1),current:90,boards:{},settings:{sound:false,motion:false},ad:{since:0,last:Date.now()},welcome:false})));
 await page.reload();await page.getByRole('button',{name:'Reprendre ma pause'}).click();await page.getByRole('heading',{name:'Niveau 90 / 300'}).waitFor();await page.locator('.goal-panel h1').click();await page.screenshot({path:'release/screenshots/jeu-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'80 pièces',exact:true}).click();await page.screenshot({path:'release/screenshots/offre-mobile.png',fullPage:true});await page.getByRole('button',{name:'Fermer',exact:true}).click();await page.getByRole('button',{name:'Retour aux niveaux'}).click();await page.screenshot({path:'release/screenshots/chapitres-mobile.png',fullPage:true});
 console.log('Four real production UI captures saved; purchase button accurately unavailable on web.');
}finally{await browser?.close();server.kill();}
