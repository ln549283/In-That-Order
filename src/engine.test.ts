import { describe,it,expect } from 'vitest';
import { RULES,getHint,matchesGoal,moveVoter,permutations,respectsLocks,simulate,solutions } from './engine';
import type { Level,Voter } from './engine';
import data from './data/levels.json';
const levels=data as Level[];
const v=(rule:Voter['rule'],preference:0|1,id:string):Voter=>({id,rule,preference});
describe('Vote semantics',()=>{
 it('uses preference for every first speaker',()=>{for(const rule of RULES)for(const preference of [0,1] as const)expect(simulate([v(rule,preference,'a')],['a'])[0].choice).toBe(preference);});
 it('copies, inverts, and never changes past votes',()=>{const voters=[v('fixed',0,'a'),v('inverse',0,'b'),v('copy',0,'c')];expect(simulate(voters,['a','b','c']).map(x=>x.choice)).toEqual([0,1,1]);expect(simulate(voters,['a','c','b']).map(x=>x.choice)).toEqual([0,0,1]);});
 it('breaks ties with each voter preference for both group rules',()=>{for(const rule of ['majority','minority'] as const)for(const p of [0,1] as const){expect(simulate([v('fixed',0,'a'),v('fixed',1,'b'),v(rule,p,'c')],['a','b','c'])[2].choice).toBe(p);}});
 it('counts zero-vote options for minority',()=>{expect(simulate([v('fixed',0,'a'),v('minority',0,'b')],['a','b'])[1].choice).toBe(1);});
 it('rejects ties for win goals and checks individual conditions',()=>{const trace=simulate([v('fixed',0,'a'),v('fixed',1,'b')],['a','b']);expect(matchesGoal(trace,{kind:'win',target:0})).toBe(false);expect(matchesGoal(trace,{kind:'exact',target:0,count:1,individual:{id:'b',choice:0}})).toBe(false);expect(matchesGoal(trace,{kind:'exact',target:0,count:1})).toBe(true);});
 it('rejects invalid or duplicate order identities',()=>{expect(()=>simulate(levels[0].voters,['a','a','b'])).toThrow();expect(()=>simulate(levels[0].voters,['a','b','z'])).toThrow();});
 it('reorders only free slots, preserving locked positions',()=>{expect(moveVoter(['a','b','c','d','e'],'e',0,{b:1,d:3})).toEqual(['e','b','a','d','c']);expect(moveVoter(['a','b','c'],'a',1,{b:1})).toEqual(['a','b','c']);});
});
describe('Complete campaign',()=>{
 it('has 300 permanent IDs, ten chapters and losing initial states',()=>{expect(levels).toHaveLength(300);for(const [i,l] of levels.entries()){expect(l.id).toBe(i+1);expect(l.chapter).toBe(Math.floor(i/30));expect(respectsLocks(l.initial,l.fixed)).toBe(true);expect(matchesGoal(simulate(l.voters,l.initial),l.goal)).toBe(false);expect(solutions(l).length).toBeGreaterThan(0);}});
 it('validates every permutation against an independent rule interpreter',()=>{
  for(const l of levels)for(const order of permutations(l.voters.map(v=>v.id))){let a=0,b=0;const outputs:number[]=[];for(const id of order){const v=l.voters.find(v=>v.id===id)!;let pick:number=v.preference;if(outputs.length){switch(v.rule){case 'copy':pick=outputs.at(-1)!;break;case 'inverse':pick=1-outputs.at(-1)!;break;case 'majority':if(a!==b)pick=a>b?0:1;break;case 'minority':if(a!==b)pick=a<b?0:1;break;}}outputs.push(pick);if(pick===0)a++;else b++;}expect(simulate(l.voters,order).map(v=>v.choice)).toEqual(outputs);}
 });
 it('hints can finish all levels without contradicting fixed or previous hints',()=>{
  for(const l of levels){let order=l.initial;let locks={};let count=0;while(!matchesGoal(simulate(l.voters,order),l.goal)){const h=getHint(l,order,locks);expect(h,`level ${l.id}`).not.toBeNull();if(!h)throw Error('Missing hint');expect(respectsLocks(h.order,{...l.fixed,...locks})).toBe(true);expect(solutions(l,h.locks).length).toBeGreaterThan(0);order=h.order;locks=h.locks;expect(++count).toBeLessThanOrEqual(l.voters.length);}expect(getHint(l,order,locks)).toBeNull();}
 });
 it('contains all five rules, exact goals, wins, fixed places and personal goals',()=>{expect(new Set(levels.flatMap(l=>l.voters.map(v=>v.rule))).size).toBe(5);expect(levels.some(l=>l.goal.kind==='win')).toBe(true);expect(levels.some(l=>Object.keys(l.fixed).length)).toBe(true);expect(levels.some(l=>l.goal.individual)).toBe(true);});
 it('each personal goal excludes at least one otherwise winning order',()=>{for(const l of levels.filter(l=>l.goal.individual))expect(solutions({...l,goal:{...l.goal,individual:undefined}}).length,`level ${l.id}`).toBeGreaterThan(solutions(l).length);});
});
