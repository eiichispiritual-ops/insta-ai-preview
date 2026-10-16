'use strict';
// 現行画面ガイド。再生エラーから復旧でき、字幕と停止中の操作バーを維持する。
document.querySelectorAll('.howto-video[data-video]').forEach(function(host){
  var src=host.dataset.video;if(!/^assets\/howto\/v(?:[3456789]|1[012])\/[\w-]+\.mp4$/.test(src))return;
  var video=document.createElement('video');video.src=src;video.poster=host.dataset.poster;video.preload='metadata';video.playsInline=true;video.setAttribute('aria-label',host.getAttribute('aria-label'));
  var track=document.createElement('track');track.kind='captions';track.label='日本語';track.srclang='ja';track.src=host.dataset.track;video.appendChild(track);
  var play=document.createElement('button');play.className='howto-play';play.type='button';play.textContent='▶';play.setAttribute('aria-label',host.getAttribute('aria-label')+'を再生');
  var status=document.createElement('p');status.className='start-note';status.setAttribute('role','status');status.hidden=true;
  var failure=function(){status.hidden=false;status.textContent='再生できませんでした。通信を確認して再試行してください。';play.hidden=false;play.textContent='再試行';play.setAttribute('aria-label',host.getAttribute('aria-label')+'を再試行');};
  play.addEventListener('click',async function(){try{if(video.error)video.load();video.controls=true;await video.play();}catch(e){if(e.name!=='AbortError')failure();}});
  video.addEventListener('playing',function(){play.hidden=true;status.hidden=true;});video.addEventListener('error',failure);
  host.classList.add('is-ready');host.replaceChildren(video,play);host.after(status);
  var card=host.closest('.howto-card');
  var toolbar=document.createElement('div');toolbar.className='howto-toolbar';
  function control(label,action){var b=document.createElement('button');b.type='button';b.className='start-btn';b.textContent=label;b.addEventListener('click',action);toolbar.appendChild(b);return b;}
  control('10秒戻る',function(){if(video.readyState>=1)video.currentTime=Math.max(0,video.currentTime-10);});
  var toggle=control('再生',function(){if(video.paused)play.click();else video.pause();});
  video.addEventListener('play',function(){toggle.textContent='一時停止';document.querySelectorAll('.howto-video video').forEach(function(other){if(other!==video)other.pause();});});
  video.addEventListener('pause',function(){toggle.textContent='再生';});
  control('全画面',function(){if(video.requestFullscreen)video.requestFullscreen().catch(function(){status.hidden=false;status.textContent='動画の操作バーから全画面表示を選んでください。';});else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();else {status.hidden=false;status.textContent="動画の操作バーから全画面表示を選んでください。";}});
  status.after(toolbar);
  if(card)card.querySelectorAll('[data-seek]').forEach(function(b){b.addEventListener('click',function(){
    var seek=function(){video.currentTime=Number(b.dataset.seek);play.click();host.scrollIntoView({behavior:'smooth',block:'center'});};
    if(video.readyState>=1)seek();else video.addEventListener('loadedmetadata',seek,{once:true});
  });});
});
