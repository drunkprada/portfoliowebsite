import React, {useEffect, useRef, useState} from 'react';

const noteNames=['C','D','E','F','G','A','B','C'];
const offsets=[0,2,4,5,7,9,11,12];

function releaseVoice(voice,stop=false){
  voice.osc.onended=null;
  // Nodes may already have ended or disconnected when cleanup runs.
  if(stop){try{voice.osc.stop()}catch{}}
  try{voice.osc.disconnect()}catch{}
  try{voice.gain?.disconnect()}catch{}
}

function stopVoices(voices){
  for(const voice of voices)releaseVoice(voice,true);
  voices.clear();
}

export default function Piano(){
  const audio=useRef(null);
  const voices=useRef(new Set());
  const timer=useRef(null);
  const [active,setActive]=useState(null);

  useEffect(()=>()=>{
    clearTimeout(timer.current);
    const ctx=audio.current;
    // Invalidate any pending resume before stopping nodes or closing the device.
    audio.current=null;
    stopVoices(voices.current);
    if(ctx&&ctx.state!=='closed'){
      try{Promise.resolve(ctx.close()).catch(()=>{})}catch{}
    }
  },[]);

  async function play(index){
    let ctx,voice;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      ctx=audio.current;
      if(!ctx||ctx.state==='closed'){
        stopVoices(voices.current);
        ctx=new Audio();
        audio.current=ctx;
      }
      await ctx.resume();
      if(audio.current!==ctx||ctx.state==='closed')return;

      voice={osc:ctx.createOscillator(),gain:null};
      voice.gain=ctx.createGain();
      voices.current.add(voice);
      voice.osc.onended=()=>{
        voices.current.delete(voice);
        releaseVoice(voice);
      };
      voice.osc.type='triangle';
      voice.osc.frequency.value=261.63*2**(offsets[index]/12);
      voice.gain.gain.setValueAtTime(0,ctx.currentTime);
      voice.gain.gain.linearRampToValueAtTime(.13,ctx.currentTime+.012);
      voice.gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+1);
      voice.osc.connect(voice.gain);
      voice.gain.connect(ctx.destination);
      voice.osc.start();
      voice.osc.stop(ctx.currentTime+1);
      setActive(index);
      clearTimeout(timer.current);
      timer.current=setTimeout(()=>setActive(null),220);
    }catch{
      if(voice){voices.current.delete(voice);releaseVoice(voice,true)}
      if(audio.current===ctx){clearTimeout(timer.current);setActive(null)}
    }
  }

  return <div className="piano-wrap"><div className="piano" aria-label="Small playable piano">{noteNames.map((note,i)=><button key={i} className={active===i?'playing':''} aria-label={`Play ${note}${i===7?'5':'4'}`} onClick={()=>play(i)}><span>{note}</span>{![2,6,7].includes(i)&&<i aria-hidden="true"/>}</button>)}</div></div>;
}
