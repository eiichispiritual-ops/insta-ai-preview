'use strict';
// 現行画面ガイド。再生エラーから復旧でき、字幕と停止中の操作バーを維持する。
document.querySelectorAll('.howto-video[data-video]').forEach(function(host){
  var src=host.dataset.video;if(!/^assets\/howto\/v[345]\/[\w-]+\.mp4$/.test(src))return;
  var video=document.createElement('video');video.src=src;video.poster=host.dataset.poster;video.preload='metadata';video.playsInline=true;video.setAttribute('aria-label',host.getAttribute('aria-label'));
  var track=document.createElement('track');track.kind='captions';track.label='日本語';track.srclang='ja';track.src=host.dataset.track;video.appendChild(track);
  var play=document.createElement('button');play.className='howto-play';play.type='button';play.textContent='▶';play.setAttribute('aria-label',host.getAttribute('aria-label')+'を再生');
  var status=document.createElement('p');status.className='start-note';status.setAttribute('role','status');status.hidden=true;
  var failure=function(){status.hidden=false;status.textContent='再生できませんでした。通信を確認して再試行してください。';play.hidden=false;play.textContent='再試行';play.setAttribute('aria-label',host.getAttribute('aria-label')+'を再試行');};
  play.addEventListener('click',async function(){try{if(video.error)video.load();video.controls=true;await video.play();}catch(e){if(e.name!=='AbortError')failure();}});
  video.addEventListener('playing',function(){play.hidden=true;status.hidden=true;});video.addEventListener('error',failure);
  host.classList.add('is-ready');host.replaceChildren(video,play);host.after(status);
});
