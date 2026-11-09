import { writeFileSync, mkdirSync } from 'node:fs';
import { RULES, simulate, matchesGoal, permutations, respectsLocks } from '../src/engine';
import type { Level, Voter, Choice, Goal } from '../src/engine';
let seed=549283;
function random(n:number){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
function signature(level:Level):string {
  const describe=(flip:boolean)=>{
    const entries=level.voters.map(v=>({id:v.id,type:2*RULES.indexOf(v.rule)+(flip?1-v.preference:v.preference)})).sort((a,b)=>a.type-b.type||a.id.localeCompare(b.id));
    const type=(id:string)=>entries.find(v=>v.id===id)!.type;
    const winning=permutations(level.voters.map(v=>v.id)).filter(o=>respectsLocks(o,level.fixed)&&matchesGoal(simulate(level.voters,o),level.goal)).map(o=>o.map(type).join('.'));
    return JSON.stringify([entries.map(v=>v.type),Object.entries(level.fixed).map(([id,p])=>[type(id),p]).sort(),[...new Set(winning)].sort()]);
  };
  return [describe(false),describe(true)].sort()[0];
}
const levels:Level[]=[];const seen=new Set<string>();const rosterUse=new Map<string,number>();
const first:Level={id:1,chapter:0,theme:0,voters:[{id:'a',rule:'fixed',preference:0},{id:'b',rule:'copy',preference:0},{id:'c',rule:'fixed',preference:1}],goal:{kind:'exact',target:1,count:2},initial:['a','b','c'],fixed:{},difficulty:1,solutionCount:2,reasoning:'Faites parler le vote fixe sushi juste avant Copie : vous obtiendrez deux votes sushi.'};
levels.push(first);seen.add(signature(first));
for(let chapter=0;chapter<10;chapter++){
  let attempts=0;
  while(levels.length<(chapter+1)*30){
    if(++attempts>50000)throw new Error(`Pas assez de candidats au chapitre ${chapter+1}`);
    const n=chapter===0?3+random(2):chapter<4?4+random(2):5;
    const maxRule=Math.min(chapter+1,4);
    const types=Array.from({length:n},()=>random((maxRule+1)*2)).sort((a,b)=>a-b);
    if(chapter>0&&!types.some(t=>Math.floor(t/2)===Math.min(chapter+1,4)))continue;
    if(chapter>=6&&new Set(types).size!==n)continue;
    const canonicalRoster=[types.join(','),types.map(t=>t^1).sort((a,b)=>a-b).join(',')].sort()[0];
    if((rosterUse.get(canonicalRoster)||0)>=4)continue;
    const voters:Voter[]=types.map((t,i)=>({id:String.fromCharCode(97+i),rule:RULES[Math.floor(t/2)],preference:(t%2) as Choice}));
    const orders=permutations(voters.map(v=>v.id));const traces=orders.map(o=>simulate(voters,o));
    const goal:Goal=chapter<4&&random(3)===0?{kind:'win',target:random(2) as Choice}:{kind:'exact',target:random(2) as Choice,count:1+random(n)};
    const fixed:Record<string,number>={};
    if(chapter===5||chapter===8||(chapter===9&&random(2)===0)){const pos=random(n);fixed[voters[random(n)].id]=pos;}
    if(chapter===6||chapter===8||(chapter===9&&random(2)===0))goal.individual={id:voters[random(n)].id,choice:random(2) as Choice};
    const allowed=orders.map((o,i)=>({o,t:traces[i]})).filter(x=>respectsLocks(x.o,fixed));
    if(goal.individual&&!allowed.some(x=>matchesGoal(x.t,{...goal,individual:undefined})&&!matchesGoal(x.t,goal)))continue;
    const winning=allowed.filter(x=>matchesGoal(x.t,goal));const losing=allowed.filter(x=>!matchesGoal(x.t,goal));
    const ratio=winning.length/allowed.length;
    if(!winning.length||!losing.length||ratio>(chapter<2?.67:chapter<4?.5:.34)|| (chapter>=9&&ratio>.17))continue;
    // Only one representative per order of interchangeable card types.
    const winningTypes=new Set(winning.map(x=>x.o.map(id=>types[voters.findIndex(v=>v.id===id)]).join(',')));
    const initial=losing[random(losing.length)].o;
    const reasoning=goal.individual?'Repérez la personne marquée. Son vote doit satisfaire la petite cible, tout en préparant le résultat du groupe.':Object.keys(fixed).length?'La place réservée est votre point de départ. Essayez de préparer les votes qui arrivent juste avant elle.':chapter===0?'Placez Copie après un vote de l’option recherchée. Sa préférence ne sert que si elle parle en premier.':chapter===1?'Inverse crée l’autre vote. Cherchez quel vote placer juste avant pour obtenir l’option voulue.':chapter===2?'Avant Majorité, comptez les votes déjà exprimés. Une égalité lui fait utiliser sa préférence.':chapter===3?'Minorité choisit le camp le moins nombreux. Un camp à zéro vote compte aussi.':'Partez du résultat demandé, puis cherchez quelle chaîne de votes peut le produire. Les préférences départagent les égalités.';
    const level:Level={id:levels.length+1,chapter,theme:levels.length%10,voters,goal,initial,fixed,difficulty:Math.min(5,Math.max(1,Math.round(-Math.log2(ratio)))),solutionCount:winningTypes.size,reasoning};
    const key=signature(level);if(seen.has(key))continue;seen.add(key);levels.push(level);rosterUse.set(canonicalRoster,(rosterUse.get(canonicalRoster)||0)+1);
  }
}
// Preserve introductory level, then introduce each chapter with its easier puzzles.
for(let c=0;c<10;c++){const start=c*30+(c===0?1:0);const chunk=levels.slice(start,(c+1)*30).sort((a,b)=>a.difficulty-b.difficulty||a.voters.length-b.voters.length);levels.splice(start,chunk.length,...chunk);}
levels.forEach((l,i)=>l.id=i+1);
mkdirSync('src/data',{recursive:true});writeFileSync('src/data/levels.json',JSON.stringify(levels));
console.log(`Generated ${levels.length} solvable, non-trivial levels; seed 549283. ${seen.size} distinct normalized winning-order signatures.`);
