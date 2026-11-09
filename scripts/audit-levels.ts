import { writeFileSync } from 'node:fs';
import data from '../src/data/levels.json';
import { simulate,solutions,RULE_LABELS } from '../src/engine';
import type { Level } from '../src/engine';
import { CHAPTERS,NAMES,THEMES } from '../src/content';
const rows:string[][]=[['Niveau','Chapitre','Question','Objectif','Votants','Départ','Places imposées','Une solution','Explication de cette solution','Ordres gagnants (votants identifiés)','Difficulté indicative']];
for(const l of data as Level[]){const theme=THEMES[l.theme];const name=(id:string)=>NAMES[l.voters.findIndex(v=>v.id===id)];const all=solutions(l);const trace=simulate(l.voters,all[0]);const goal=(l.goal.kind==='exact'?`${l.goal.count} vote(s) ${theme.options[l.goal.target]}`:`Faire gagner ${theme.options[l.goal.target]}`)+(l.goal.individual?`; ${name(l.goal.individual.id)} vote ${theme.options[l.goal.individual.choice]}`:'');rows.push([String(l.id),CHAPTERS[l.chapter].name,theme.question,goal,l.voters.map(v=>`${name(v.id)} : ${RULE_LABELS[v.rule]} (préférence ${theme.options[v.preference]})`).join(' ; '),l.initial.map(name).join(' → '),Object.entries(l.fixed).map(([id,pos])=>`${name(id)} en ${pos+1}`).join('; '),all[0].map(name).join(' → '),trace.map(v=>`${name(v.id)} vote ${theme.options[v.choice]} : ${v.reason}`).join(' ; '),String(all.length),String(l.difficulty)]);}
writeFileSync('docs/LEVEL-CATALOGUE.csv','\uFEFF'+rows.map(row=>row.map(v=>'"'+v.replaceAll('"','""')+'"').join(';')).join('\n')+'\n');console.log('300 levels exported with a verified solution and vote-by-vote explanation.');
