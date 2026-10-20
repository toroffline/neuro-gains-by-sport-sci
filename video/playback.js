// Playback stays usable if narration cannot load or the browser blocks audio.
const audio=document.querySelector('#audio'),seek=document.querySelector('#seek'),play=document.querySelector('#play');
let playing=false,position=0,origin=0,audioActive=false,playEpoch=0;
const failedAudioSources=new Set();
const audioStatus=document.createElement('span'),retryAudio=document.createElement('button');
audioStatus.id='audio-status';audioStatus.setAttribute('role','status');audioStatus.setAttribute('aria-live','polite');
retryAudio.id='retry-audio';retryAudio.type='button';retryAudio.textContent=TH?'ลองเปิดเสียงอีกครั้ง':'Retry audio';retryAudio.hidden=true;
document.querySelector('nav').append(audioStatus,retryAudio);
function clock(v){return Math.floor(v/60)+':'+String(Math.floor(v%60)).padStart(2,'0');}
function playbackStatus(error){
 audioActive=false;origin=performance.now()-position*1000;
 audioStatus.textContent=error?.name==='NotAllowedError'?(TH?'เบราว์เซอร์ยังไม่อนุญาตเสียง ลองเปิดเสียงอีกครั้ง หรือเล่นภาพต่อได้':'Audio permission was blocked. Retry audio or continue the animation.'):(TH?'โหลดไฟล์เสียงไม่ได้ ลองเปิดเสียงอีกครั้ง หรือเล่นภาพต่อโดยไม่มีเสียงได้':'Narration could not load. Retry audio or continue without sound.');
 retryAudio.hidden=false;
}
function syncView(t){let index=renderFrame(t);document.querySelectorAll('#chapters button').forEach((b,i)=>b.classList.toggle('active',i===index));seek.value=t;document.querySelector('#time').value=clock(t)+' / 4:00';}
function seekTo(t){position=Math.max(0,Math.min(240,t));origin=performance.now()-position*1000;if(audio.readyState>=1)try{audio.currentTime=Math.min(position,239.99);}catch{}syncView(position);}
async function tryNarration(epoch){
 try{
  if(audio.networkState===HTMLMediaElement.NETWORK_NO_SOURCE)throw new Error('No narration source could load');
  if(audio.readyState>=1)audio.currentTime=Math.min(position,239.99);
  await audio.play();
  if(epoch!==playEpoch||!playing)return;
  if(Math.abs(audio.currentTime-position)>.2)audio.currentTime=Math.min(position,239.99);
  audioActive=true;audioStatus.textContent='';retryAudio.hidden=true;
 }catch(error){if(epoch===playEpoch&&playing)playbackStatus(error);}
}
play.onclick=()=>{
 if(playing){playing=false;audioActive=false;playEpoch++;audio.pause();play.textContent=TH?'เล่นวิดีโอ':'Play film';return;}
 if(position>=239.9)seekTo(0);
 origin=performance.now()-position*1000;playing=true;audioActive=false;play.textContent=TH?'หยุดชั่วคราว':'Pause';
 // Call play inside the user's gesture; animation is independent of its promise.
 void tryNarration(++playEpoch);
};
retryAudio.onclick=()=>{failedAudioSources.clear();audio.load();if(playing)void tryNarration(++playEpoch);else play.onclick();};
audio.addEventListener('error',()=>playbackStatus(audio.error));
// Child <source> failures do not bubble to <audio>; some browsers leave play()
// pending when every source returns 404, rather than rejecting its promise.
audio.querySelectorAll('source').forEach(source=>source.addEventListener('error',()=>{
 failedAudioSources.add(source);
 const sources=audio.querySelectorAll('source');
 // Earlier source errors may have fired during HTML parsing, before this
 // script loaded. Failure of the final candidate still proves exhaustion.
 if(failedAudioSources.size===sources.length||source===sources[sources.length-1])playbackStatus(new Error('Narration sources unavailable'));
}));
audio.addEventListener('loadedmetadata',()=>{try{audio.currentTime=Math.min(position,239.99);}catch{}});
seek.oninput=()=>seekTo(+seek.value);
document.querySelector('#cc').onclick=e=>{captions=!captions;e.target.textContent=captions?(TH?'เปิดคำบรรยาย':'Captions on'):(TH?'ปิดคำบรรยาย':'Captions off');e.target.setAttribute('aria-pressed',captions);renderFrame(position||1);};
document.querySelector('#full').onclick=()=>canvas.requestFullscreen();
SCENES.forEach(s=>{let b=document.createElement('button');b.innerHTML=`${clock(s.start)}<br>${s.short}`;b.onclick=()=>seekTo(s.start+.1);document.querySelector('#chapters').append(b);});
function loop(now){
 if(playing){
  position=Math.min(240,audioActive?audio.currentTime:(now-origin)/1000);syncView(position);
  if(position>=239.95||audioActive&&audio.ended){position=240;syncView(240);playing=false;audioActive=false;playEpoch++;audio.pause();play.textContent=TH?'เล่นอีกครั้ง':'Replay';}
 }
 requestAnimationFrame(loop);
}
renderFrame(1);requestAnimationFrame(loop);
