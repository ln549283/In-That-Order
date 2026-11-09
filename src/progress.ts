import type { Level } from './engine';
import { getHint, matchesGoal, respectsLocks, simulate, solutions } from './engine';
export const SAVE_KEY='ito-save-v1';
export interface Board {order:string[];locks:Record<string,number>}
export interface Progress {version:1;coins:number;completed:number[];current:number;boards:Record<string,Board>;settings:{sound:boolean;motion:boolean};ad:{since:number;last:number};welcome:boolean}
export function freshProgress():Progress{return {version:1,coins:30,completed:[],current:1,boards:{},settings:{sound:true,motion:true},ad:{since:0,last:Date.now()},welcome:true};}
export function boardFor(p:Progress,l:Level):Board {
 const b=p.boards[l.id];if(!b)return {order:[...l.initial],locks:{}};
 const ids=l.voters.map(v=>v.id);
 if(!Array.isArray(b.order)||b.order.length!==ids.length||new Set(b.order).size!==ids.length||b.order.some(v=>!ids.includes(v)))return {order:[...l.initial],locks:{}};
 const locks=b.locks;
 if(!locks||Object.entries(locks).some(([id,pos])=>!ids.includes(id)||!Number.isInteger(pos)||pos<0||pos>=ids.length)||!respectsLocks(b.order,{...l.fixed,...locks})||!respectsLocks(b.order,l.fixed)||!solutions(l,locks).length)return {order:[...l.initial],locks:{}};
 return {order:[...b.order],locks:{...locks}};
}
export function decodeProgress(raw:string|null):Progress {
 const fallback=freshProgress();if(!raw)return fallback;
 try {const p=JSON.parse(raw);if(p.version!==1||!Array.isArray(p.completed)||!p.boards||typeof p.boards!=='object')return fallback;
 const completed=[...new Set<number>(p.completed.filter((n:unknown)=>typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=300))].sort((a,b)=>a-b);
 // Sequential campaign; reject broken/tampered unlock gaps without corrupting the save.
 let prefix=0;while(completed.includes(prefix+1))prefix++;
 return {...fallback,coins:Number.isSafeInteger(p.coins)&&p.coins>=0?p.coins:30,completed:completed.filter(n=>n<=prefix),current:Math.min(Math.max(Number.isInteger(p.current)?p.current:1,1),Math.min(300,prefix+1)),boards:p.boards,settings:{sound:p.settings?.sound!==false,motion:p.settings?.motion!==false},ad:{since:Number.isSafeInteger(p.ad?.since)&&p.ad.since>=0?p.ad.since:0,last:Number.isFinite(p.ad?.last)?p.ad.last:Date.now()},welcome:p.welcome!==false};
 }catch{return fallback;}
}
export function finishLevel(p:Progress,l:Level,board:Board):Progress {
 if(l.id>p.completed.length+1||!respectsLocks(board.order,{...l.fixed,...board.locks})||!matchesGoal(simulate(l.voters,board.order),l.goal))return p;
 const first=!p.completed.includes(l.id);
 return {...p,coins:p.coins+(first?10:0),completed:first?[...p.completed,l.id].sort((a,b)=>a-b):p.completed,boards:{...p.boards,[l.id]:board},ad:{...p.ad,since:p.ad.since+(first?1:0)}};
}
export function applyHint(p:Progress,l:Level,board:Board,free:boolean):{progress:Progress;board:Board;id:string;position:number}|null {
 if(!free&&p.coins<30)return null;const hint=getHint(l,board.order,board.locks);if(!hint)return null;
 const next={order:hint.order,locks:hint.locks};return {progress:{...p,coins:p.coins-(free?0:30),boards:{...p.boards,[l.id]:next}},board:next,id:hint.id,position:hint.position};
}
export function interstitialDue(p:Progress,premium:boolean,now=Date.now()):boolean{return !premium&&p.ad.since>=5&&now-p.ad.last>=480000;}
