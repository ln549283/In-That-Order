let context:AudioContext|undefined;
export function sound(kind:'move'|'vote'|'win'|'hint',enabled:boolean){
 if(!enabled)return;
 try {context??=new AudioContext();void context.resume();const notes=kind==='win'?[523,659,784]:kind==='hint'?[440,660]:kind==='vote'?[392]:[260];
 notes.forEach((f,i)=>{const osc=context!.createOscillator();const gain=context!.createGain();const t=context!.currentTime+i*.1;osc.type='sine';osc.frequency.value=f;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+.18);osc.connect(gain);gain.connect(context!.destination);osc.start(t);osc.stop(t+.2);});}catch{/* Audio is optional. */}
}
