import { chromium } from '@playwright/test';
import { readFileSync,writeFileSync,copyFileSync,mkdirSync } from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const page=await browser.newPage();const svg=readFileSync('public/icon.svg','utf8');
async function render(size,path,logoSize=size){await page.setViewportSize({width:size,height:size});await page.setContent(`<html><body style="margin:0;background:#f8f5ef;display:grid;place-items:center;height:100vh">${svg.replace('width="512" height="512"',`width="${logoSize}" height="${logoSize}"`)}</body></html>`);await page.screenshot({path});}
for(const size of [192,512,1024])await render(size,`public/icon-${size}.png`);
copyFileSync('public/icon-1024.png','ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
 const dir=`android/app/src/main/res/mipmap-${density}`;mkdirSync(dir,{recursive:true});
 await render(size,`${dir}/ic_launcher.png`);copyFileSync(`${dir}/ic_launcher.png`,`${dir}/ic_launcher_round.png`);
 await render(size*2,`${dir}/ic_launcher_foreground.png`,Math.round(size*1.2));
}
await render(2732,'ios/App/App/Assets.xcassets/Splash.imageset/ito-splash.png',440);
writeFileSync('ios/App/App/Assets.xcassets/Splash.imageset/Contents.json',JSON.stringify({images:[{filename:'ito-splash.png',idiom:'universal'}],info:{author:'xcode',version:1}},null,2));
await browser.close();console.log('Original logo rasterized for web, Android and iOS.');
