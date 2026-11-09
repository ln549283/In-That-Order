import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4175'],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4175')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4175');await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await page.reload();await page.getByRole('button',{name:'C’est parti'}).waitFor();await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'C’est parti'}).click();await page.getByRole('button',{name:'À moi de jouer'}).click();await page.getByRole('button',{name:'Descendre Bob'}).click();await page.getByRole('button',{name:'Lancer le vote'}).click();await page.getByRole('dialog',{name:'Tout s’accorde !'}).waitFor();await page.getByRole('button',{name:'Encore une petite énigme'}).click();await page.reload();await page.getByRole('button',{name:'Reprendre ma pause'}).click();await page.getByRole('heading',{name:'Niveau 2 / 300'}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: production build cached, reload offline, solve, earn, advance, reload and resume offline; no page errors.');
}finally{await browser?.close();server.kill();}
