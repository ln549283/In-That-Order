import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, Copy, GripVertical, LockKeyhole, Repeat2, Target, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Rule, Voter, Vote } from './engine';
import { RULE_LABELS } from './engine';
import { NAMES } from './content';
export function RuleIcon({rule,size=18}:{rule:Rule;size?:number}){const I={fixed:Target,copy:Copy,inverse:Repeat2,majority:TrendingUp,minority:TrendingDown}[rule];return <I size={size}/>;}
export function Avatar({index=0,size=48}:{index?:number;size?:number}){
 const colors=['#ffc19e','#9fdcff','#d3b4ff','#95e6ce','#ffe093'];const skin=['#f8d1ad','#dfaa7f','#f2c9a5','#b77e58','#f4cba6'];
 return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="avatar"><rect width="64" height="64" rx="23" fill={colors[index%5]}/><path d="M9 66c1-15 10-20 23-20s22 5 23 20" fill={['#ed7358','#438cdb','#9755d8','#218d76','#d99631'][index%5]}/><path d="M17 29c0-14 30-16 30 0v8c0 21-30 21-30 0z" fill={skin[index%5]}/><path d={index%2===0?'M14 36V25C14 3 51 7 50 30L41 23 34 27 25 19 17 36z':'M15 31C6 18 19 9 25 14 32 3 42 9 42 14 55 12 56 26 47 32L42 23 31 26 22 23z'} fill={['#844b39','#353b43','#504156','#303d37','#93702f'][index%5]}/><circle cx="25" cy="33" r="1.6" fill="#283236"/><circle cx="39" cy="33" r="1.6" fill="#283236"/><path d="M28 41q4 4 8 0" fill="none" stroke="#9f5b4c" strokeWidth="1.8" strokeLinecap="round"/>{index===2&&<g fill="none" stroke="#584c67" strokeWidth="1.8"><circle cx="24" cy="33" r="6"/><circle cx="40" cy="33" r="6"/><path d="M30 33h4"/></g>}</svg>;
}
export function Wordmark(){return <span className="wordmark"><span className="brand-symbol"><i/><i/><i/></span>in that order<span className="brand-dot">.</span></span>;}
export function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;const prior=document.activeElement as HTMLElement;d?.showModal();return()=>{d?.close();prior?.focus();};},[]);
 return <dialog ref={ref} className={`modal ${wide?'wide':''}`} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Fermer" onClick={onClose}><X size={21}/></button></div>{children}</dialog>;
}
interface CardProps {voter:Voter;index:number;position:number;locked:boolean;hinted:boolean;selected:boolean;disabled:boolean;vote?:Vote;highlight:boolean;options:string[];emoji:string[];individual?:number;onSelect:()=>void;onStep:(delta:number)=>void;canUp:boolean;canDown:boolean}
export function VoterCard(p:CardProps){
 const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:p.voter.id,disabled:p.locked||p.disabled});
 return <div ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition}} className={`voter-row ${isDragging?'dragging':''} ${p.highlight?'speaking':''}`} data-card={p.voter.id} data-person={p.index}>
  <span className={`position ${p.locked?'locked':''}`}>{p.locked?<LockKeyhole size={13}/>:p.position+1}</span>
  <div className={`voter-card ${p.selected?'selected':''} ${p.vote?'voted':''}`}>
   <button className="voter-main" onClick={p.onSelect} disabled={p.disabled||p.locked} aria-pressed={p.selected} aria-label={`${NAMES[p.index]}, position ${p.position+1}, ${RULE_LABELS[p.voter.rule]}${p.locked?', verrouillé':''}`}>
    <Avatar index={p.index}/><span className="voter-text"><span className="voter-name">{NAMES[p.index]} {p.individual!==undefined&&<span className="individual-badge" title="Vote individuel demandé">→ {p.emoji[p.individual]}</span>}</span><span className={`behavior rule-${p.voter.rule}`}><RuleIcon rule={p.voter.rule} size={14}/>{RULE_LABELS[p.voter.rule]}</span><span className="preference">{p.voter.rule==='fixed'?'Toujours':'Préférence'} {p.emoji[p.voter.preference]} <span>{p.options[p.voter.preference]}</span></span></span>
   </button>
   {p.vote?<span className="cast-vote" title={p.vote.reason}>{p.emoji[p.vote.choice]}<Check size={12}/></span>:p.locked?<span className="lock-badge" title={p.hinted?'Placement révélé par un indice':'Position imposée'}><LockKeyhole size={17}/><small>{p.hinted?'indice':'fixe'}</small></span>:<div className="card-tools"><button {...attributes} {...listeners} onKeyDown={event=>{if(!isDragging&&(event.key==='ArrowUp'||event.key==='ArrowDown')){event.preventDefault();p.onStep(event.key==='ArrowUp'?-1:1);}else listeners?.onKeyDown?.(event);}} className="drag-handle" aria-label={`Déplacer ${NAMES[p.index]}`} disabled={p.disabled}><GripVertical size={22}/></button><span className="step-controls"><button aria-label={`Monter ${NAMES[p.index]}`} onClick={()=>p.onStep(-1)} disabled={!p.canUp||p.disabled}><ArrowUp size={12}/></button><button aria-label={`Descendre ${NAMES[p.index]}`} onClick={()=>p.onStep(1)} disabled={!p.canDown||p.disabled}><ArrowDown size={12}/></button></span></div>}
  </div>
 </div>;
}
