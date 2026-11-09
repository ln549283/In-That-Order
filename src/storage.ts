import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { decodeProgress, freshProgress, SAVE_KEY } from './progress';
import type { Progress } from './progress';
let queue=Promise.resolve();
export async function loadProgress():Promise<Progress>{
 try {const raw=Capacitor.isNativePlatform()?(await Preferences.get({key:SAVE_KEY})).value:localStorage.getItem(SAVE_KEY);return decodeProgress(raw);}
 catch{return freshProgress();}
}
export function saveProgress(p:Progress):Promise<void>{
 const value=JSON.stringify(p);
 const task=queue.catch(()=>{}).then(async()=>{if(Capacitor.isNativePlatform())await Preferences.set({key:SAVE_KEY,value});else localStorage.setItem(SAVE_KEY,value);});queue=task;return task;
}
