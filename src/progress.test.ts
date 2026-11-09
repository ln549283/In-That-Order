import { describe,it,expect } from 'vitest';
import { freshProgress,finishLevel,decodeProgress,boardFor,applyHint,interstitialDue } from './progress';
import { matchesGoal,simulate,solutions } from './engine';
import type { Level } from './engine';
import data from './data/levels.json';
const levels=data as Level[];const l=levels[0];
describe('Economy and persistence',()=>{
 it('grants first completion exactly once, including fast repeats',()=>{const b={order:solutions(l)[0],locks:{}};const once=finishLevel(freshProgress(),l,b);expect(once.coins).toBe(40);expect(finishLevel(once,l,b).coins).toBe(40);expect(finishLevel(once,l,b).ad.since).toBe(1);});
 it('cannot reward losing orders or locked future levels',()=>{const p=freshProgress();expect(finishLevel(p,l,{order:l.initial,locks:{}})).toBe(p);expect(finishLevel(p,levels[1],{order:solutions(levels[1])[0],locks:{}})).toBe(p);});
 it('charges exactly once for an applied paid hint; free hints preserve coins',()=>{const p=freshProgress();const b=boardFor(p,l);const result=applyHint(p,l,b,false)!;expect(result.progress.coins).toBe(0);expect(Object.keys(result.board.locks)).toHaveLength(1);expect(applyHint({...p,coins:0},l,b,false)).toBeNull();expect(applyHint({...p,coins:0},l,b,true)?.progress.coins).toBe(0);});
 it('never charges for an already solved board',()=>{expect(applyHint(freshProgress(),l,{order:solutions(l)[0],locks:{}},false)).toBeNull();});
 it('recovers malformed saves and corrupt boards',()=>{expect(decodeProgress('{bad').coins).toBe(30);expect(decodeProgress('null').completed).toEqual([]);const p=freshProgress();p.boards[1]={order:['a','a','a'],locks:{}};expect(boardFor(p,l).order).toEqual(l.initial);expect(decodeProgress(JSON.stringify({...p,completed:[1,1,4,400],coins:-5})).completed).toEqual([1]);});
 it('preserves purchased hints through reload',()=>{const r=applyHint(freshProgress(),l,boardFor(freshProgress(),l),false)!;expect(boardFor(decodeProgress(JSON.stringify(r.progress)),l)).toEqual(r.board);});
 it('never inserts ads too soon, for premium, or before five completions',()=>{const p=freshProgress();p.ad={since:5,last:0};expect(interstitialDue(p,false,480000)).toBe(true);expect(interstitialDue(p,true,480000)).toBe(false);expect(interstitialDue(p,false,479999)).toBe(false);expect(interstitialDue({...p,ad:{since:4,last:0}},false,500000)).toBe(false);});
 it('can finish and restore the entire campaign, without payments or internet',()=>{let p=freshProgress();for(const l of levels){let b=boardFor(p,l);while(!matchesGoal(simulate(l.voters,b.order),l.goal)){const r=applyHint(p,l,b,true)!;p=r.progress;b=r.board;}p=finishLevel(p,l,b);p=decodeProgress(JSON.stringify(p));expect(p.completed.length).toBe(l.id);}expect(p.completed).toHaveLength(300);expect(p.coins).toBe(3030);});
});
