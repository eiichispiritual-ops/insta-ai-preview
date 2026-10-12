'use strict';
/* スキルのコピー：SKILL.md と、入口ごとの references を1つのテキストに連結してクリップボードへ。
   束ね方は app.js の相談メモ生成と同じ（どの入口でどの references を使うか）。 */
(function(){
  var COMMON=['conversation-flow.md'];
  var ENTRIES={
    profile:{name:'プロフィール',refs:['conversation-flow.md','concept.md','profile.md','profile-patterns.md','profile-interview.md']},
    feed:{name:'フィード投稿',refs:['conversation-flow.md','feed.md','feed-operations.md']},
    story:{name:'ストーリー',refs:['conversation-flow.md','story.md','story-operations.md','story-campaign.md']},
    'reel-voiceover':{name:'リール（アフレコ）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','voiceover.md']},
    'reel-vlog':{name:'リール（VLOG）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','vlog.md']},
    'reel-talk':{name:'リール（トーク）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','talk.md']},
    'reel-ranking':{name:'リール（ランキング）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','ranking.md']},
    'reel-comparison':{name:'リール（比較）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','comparison.md']},
    'edit-voiceover':{name:'動画編集（アフレコ）',refs:['edit-common.md','conversation-flow.md','edit-voiceover.md']},
    'edit-vlog':{name:'動画編集（VLOG）',refs:['edit-common.md','conversation-flow.md','edit-vlog.md']},
    'edit-talk':{name:'動画編集（トーク）',refs:['edit-common.md','conversation-flow.md','edit-talk.md']},
    'edit-ranking':{name:'動画編集（ランキング）',refs:['edit-common.md','conversation-flow.md','edit-ranking.md']},
    'edit-comparison':{name:'動画編集（比較）',refs:['edit-common.md','conversation-flow.md','edit-comparison.md']},
    all:{name:'全部（SKILL.md＋全 references）',refs:null}
  };
  var bundle=null;
  function load(){
    if(bundle)return Promise.resolve(bundle);
    return fetch('skill-bundle.json').then(function(r){if(!r.ok)throw Error('read-failed');return r.json();}).then(function(d){bundle=d;return d;});
  }
  function build(key,b){
    var e=ENTRIES[key];
    var names=e.refs||Object.keys(b.references).sort();
    /* 先頭はSKILL.mdそのまま（frontmatter付き）。SKILL.mdファイルへそのまま貼っても動く並び。 */
    var out=[b.skill.replace(/\s+$/,''),'','---','','（以下は、'+e.name+'の入口で使う参照資料です。上の本文にある references/○○.md への言及は、下の「## 参照：」の見出しを指します。）'];
    names.forEach(function(n){
      if(!b.references[n])throw Error('missing-reference');
      out.push('','## 参照：references/'+n,'',b.references[n]);
    });
    return out.join('\n');
  }
  var statusEl=document.getElementById('skillcopy-status');
  var manual=document.getElementById('skillcopy-manual');
  var manualBox=document.getElementById('skillcopy-manual-box');
  var extraSay=null;
  function say(m){if(statusEl)statusEl.textContent=m;if(extraSay)extraSay.textContent=m;}
  function fallback(text,name){
    if(!manual||!manualBox){say('コピーできませんでした。zipをダウンロードしてください。');return;}
    manual.value=text;manualBox.hidden=false;manual.focus();manual.select();try{manualBox.scrollIntoView({block:'center'});}catch(e){}
    say('自動コピーが使えませんでした。下の全文を選択済みです。コピー操作（長押し／Ctrl・⌘＋C）でコピーしてください：'+name);
  }
  async function copyKey(key,btn,extra){
    var e=ENTRIES[key];extraSay=extra||null;
    if(manualBox)manualBox.hidden=true;
    say('読み込んでいます。');
    var text;
    try{text=build(key,await load());}
    catch(err){say('スキルの読み込みに失敗しました。ページを再読み込みするか、zipをダウンロードしてください。');return;}
    try{
      if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('unavailable');
      await Promise.race([navigator.clipboard.writeText(text),new Promise(function(_,rej){setTimeout(function(){rej(Error('timeout'));},2500);})]);
      say('コピーしました（'+e.name+'・'+text.length.toLocaleString('ja-JP')+'文字）。AIの入力欄、またはSKILL.mdのファイルへ貼り付けてください。');
      if(btn){var old=btn.getAttribute('data-label')||btn.textContent;btn.setAttribute('data-label',old);btn.classList.add('is-copied');btn.textContent='コピーしました';setTimeout(function(){btn.textContent=old;btn.classList.remove('is-copied');},2200);}
    }catch(err){fallback(text,e.name);}
  }
  window.instaAiCopySkill=function(key,btn,extra){return copyKey(key,btn,extra);};
  document.querySelectorAll('#get-skill [data-skillcopy]').forEach(function(b){
    b.addEventListener('click',function(){copyKey(b.getAttribute('data-skillcopy'),b);});
  });
})();
