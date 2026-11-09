export type Rule = 'fixed' | 'copy' | 'inverse' | 'majority' | 'minority';
export type Choice = 0 | 1;
export interface Voter { id: string; rule: Rule; preference: Choice }
export interface Goal { kind: 'exact' | 'win'; target: Choice; count?: number; individual?: {id:string; choice:Choice} }
export interface Level { id:number; chapter:number; theme:number; voters:Voter[]; goal:Goal; initial:string[]; fixed:Record<string,number>; difficulty:number; solutionCount:number; reasoning:string }
export interface Vote { id:string; choice:Choice; reason:string; counts:[number,number] }
export const RULES: Rule[] = ['fixed','copy','inverse','majority','minority'];
export const RULE_LABELS: Record<Rule,string> = {fixed:'Vote fixe',copy:'Copie le précédent',inverse:'Inverse le précédent',majority:'Suit la majorité',minority:'Suit la minorité'};
export const RULE_HELP: Record<Rule,string> = {fixed:'Choisit toujours sa préférence.',copy:'Choisit comme la personne juste avant.',inverse:'Choisit l’autre option que la personne juste avant.',majority:'Choisit l’option qui a reçu le plus de votes.',minority:'Choisit l’option qui a reçu le moins de votes, même zéro.'};
export function simulate(voters:Voter[], order:string[]):Vote[] {
  if (order.length!==voters.length || new Set(order).size!==order.length || order.some(id=>!voters.some(v=>v.id===id))) throw new Error('Ordre invalide');
  const counts:[number,number]=[0,0]; const result:Vote[]=[];
  for (const id of order) {
    const v=voters.find(v=>v.id===id)!; const last=result.at(-1); let choice=v.preference; let reason='Choisit sa préférence';
    if (v.rule!=='fixed') {
      if (!last) reason='Parle en premier : utilise sa préférence';
      else if (v.rule==='copy') {choice=last.choice;reason='Copie le vote précédent';}
      else if (v.rule==='inverse') {choice=(1-last.choice) as Choice;reason='Inverse le vote précédent';}
      else if (counts[0]===counts[1]) reason='Égalité : utilise sa préférence';
      else { choice=(v.rule==='majority' ? (counts[0]>counts[1]?0:1) : (counts[0]<counts[1]?0:1)); reason=v.rule==='majority'?'Suit la majorité actuelle':'Suit la minorité actuelle'; }
    }
    counts[choice]++; result.push({id,choice,reason,counts:[...counts]});
  }
  return result;
}
export function matchesGoal(trace:Vote[], goal:Goal):boolean {
  if (!trace.length) return false;
  const counts=trace.at(-1)!.counts;
  const total=goal.kind==='exact'?counts[goal.target]===goal.count:counts[goal.target]>counts[1-goal.target];
  return total && (!goal.individual || trace.some(v=>v.id===goal.individual!.id && v.choice===goal.individual!.choice));
}
export function respectsLocks(order:string[],locks:Record<string,number>):boolean {return Object.entries(locks).every(([id,pos])=>order[pos]===id);}
export function permutations<T>(values:T[]):T[][] { if(values.length===0)return [[]];return values.flatMap((v,i)=>permutations(values.filter((_,j)=>i!==j)).map(rest=>[v,...rest])); }
export function solutions(level:Level, locks:Record<string,number>={}):string[][] {
  const allLocks={...level.fixed,...locks};
  return permutations(level.voters.map(v=>v.id)).filter(order=>respectsLocks(order,level.fixed)&&respectsLocks(order,allLocks)&&matchesGoal(simulate(level.voters,order),level.goal));
}
export function moveVoter(order:string[],id:string,target:number,locks:Record<string,number>):string[] {
  if (id in locks || target<0 || target>=order.length || order[target] in locks) return order;
  const free=order.filter(v=>!(v in locks)); const from=free.indexOf(id); const to=free.indexOf(order[target]);
  if(from<0||to<0)return order;
  free.splice(to,0,free.splice(from,1)[0]); let i=0;
  return order.map(v=>v in locks?v:free[i++]);
}
export function getHint(level:Level,order:string[],locks:Record<string,number>):{order:string[];locks:Record<string,number>;id:string;position:number}|null {
  if(matchesGoal(simulate(level.voters,order),level.goal)&&respectsLocks(order,{...level.fixed,...locks}))return null;
  const options=solutions(level,locks).sort((a,b)=>a.filter((v,i)=>v!==order[i]).length-b.filter((v,i)=>v!==order[i]).length || a.join().localeCompare(b.join()));
  const solution=options[0]; if(!solution)return null;
  const position=solution.findIndex((v,i)=>order[i]!==v && !(v in locks) && !(v in level.fixed)); if(position<0)return null;
  const id=solution[position]; const next=[...order]; const old=next.indexOf(id); [next[position],next[old]]=[next[old],next[position]];
  return {order:next,locks:{...locks,[id]:position},id,position};
}
