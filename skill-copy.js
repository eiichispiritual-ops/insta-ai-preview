'use strict';
/* スキルのコピー：SKILL.md と、入口ごとの references を1つのテキストに連結してクリップボードへ。
   束ね方は app.js の相談メモ生成と同じ（どの入口でどの references を使うか）。 */
(function(){
  var COMMON=['conversation-flow.md'];
  var ENTRIES={
    profile:{name:'プロフィール',refs:['conversation-flow.md','concept.md','profile.md','profile-patterns.md','profile-interview.md']},
    feed:{name:'フィード投稿',refs:['conversation-flow.md','feed.md','feed-operations.md']},
    story:{name:'ストーリー',refs:['conversation-flow.md','story.md','story-operations.md','story-campaign.md']},
    'reel-voiceover':{name:'リール（アフレコ）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','voiceover.md','hook-patterns-short.md','structure-patterns.md','examples-buzz-short.md']},
    'reel-vlog':{name:'リール（VLOG）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','vlog.md','hook-patterns-short.md','structure-patterns.md','examples-buzz-short.md']},
    'reel-talk':{name:'リール（トーク）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','talk.md','hook-patterns-short.md','structure-patterns.md','examples-buzz-short.md']},
    'reel-abstract':{name:'リール（抽象マーケ）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','abstract.md','hook-patterns-short.md','structure-patterns.md','examples-buzz-short.md']},
    'reel-ranking':{name:'リール（ランキング）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','ranking.md','hook-patterns-short.md','structure-patterns.md','examples-buzz-short.md']},
    'reel-comparison':{name:'リール（比較）',refs:['format-taxonomy.md','genre-adaptation.md','output-quality.md','conversation-flow.md','comparison.md','hook-patterns-short.md','structure-patterns.md','examples-buzz-short.md']},
    /* 形式別の入口（アフレコ・VLOG等）：2.5万字以内に収めるため、ジャンル別の欲求の地図（genre-desire-map.md）は載せない。形式別の参照はその形式の1本だけ。ジャンルの痛みは本人の材料から決める。 */
    /* 形式は相談：2.5万字以内に収めるため、形式別の参照（voiceover.md 等）は載せず、構成の型（structure-patterns.md の形式別の当てはめ）で代える。形式が決まっている人は形式別の入口を使う。 */
    'reel-any':{name:'リール（形式は相談）',refs:['format-taxonomy.md','output-quality.md','conversation-flow.md','hook-patterns-short.md','structure-patterns.md','genre-desire-map.md','examples-buzz-short.md']},
    'edit-voiceover':{name:'動画編集（アフレコ）',refs:['edit-common.md','conversation-flow.md','edit-voiceover.md']},
    'edit-vlog':{name:'動画編集（VLOG）',refs:['edit-common.md','conversation-flow.md','edit-vlog.md']},
    'edit-talk':{name:'動画編集（トーク）',refs:['edit-common.md','conversation-flow.md','edit-talk.md']},
    'edit-abstract':{name:'動画編集（抽象マーケ）',refs:['edit-common.md','conversation-flow.md','video-edit/edit-abstract.md']},
    'edit-ranking':{name:'動画編集（ランキング）',refs:['edit-common.md','conversation-flow.md','edit-ranking.md']},
    'edit-comparison':{name:'動画編集（比較）',refs:['edit-common.md','conversation-flow.md','edit-comparison.md']},
    'edit-any':{name:'動画編集（形式は相談）',refs:['edit-common.md','conversation-flow.md','edit-voiceover.md','edit-vlog.md','edit-talk.md','video-edit/edit-abstract.md','edit-ranking.md','edit-comparison.md']},
    all:{name:'全部入り（SKILL.md と参照資料すべて）',refs:null}
  };
  /* 軽量版（スマホ・アプリ向け、1万字以下）：SKILL.md＋会話の進め方＋その形式の資料だけ。全部入りの版も残す。 */
  Object.keys(ENTRIES).forEach(function(k){if(k.indexOf('reel-')!==0)return;var e=ENTRIES[k];var fmt=e.refs.filter(function(n){return ['voiceover.md','vlog.md','talk.md','abstract.md','ranking.md','comparison.md'].indexOf(n)>=0;});ENTRIES[k+'-lite']={name:e.name+'・短い版',refs:['hook-patterns-lite.md'].concat(fmt.length?fmt:['format-taxonomy.md'])};});
  var bundle=null;
  function load(){
    if(bundle)return Promise.resolve(bundle);
    return fetch('skill-bundle.json').then(function(r){if(!r.ok)throw Error('read-failed');return r.json();}).then(function(d){bundle=d;return d;});
  }
  function build(key,b){
    var e=ENTRIES[key];
    var names=e.refs||Object.keys(b.references).filter(function(n){return !/-(short|lite)\.md$/.test(n);}).sort(); /* 全部入りは本体を載せ、アプリ用の短縮版（-short.md）は重ねない */
    /* 先頭はSKILL.mdそのまま（frontmatter付き）。SKILL.mdファイルへそのまま貼っても動く並び。 */
    var out=[b.skill.replace(/\s+$/,''),'','---','','（以下は、'+e.name+'の入口で使う参照資料です。上の本文にある references/○○.md への言及は、下の「## 参照：」の見出しを指します。'+(names.some(function(n){return /-short\.md$/.test(n);})?'hook-patterns.md と examples-buzz.md は、短縮版（-short.md）を載せています。':'')+'下にない参照は、この入口では使いません。）'];
    if(names.some(function(n){return /-lite\.md$/.test(n);}))out.push('','（短い版です。上の本文が挙げる参照資料のうち、下に載っていないもの（構成の型・具体性の基準・完成例など）は読まずに、この本文の決まりと下の資料だけで完成稿まで出す。冒頭の型は hook-patterns-lite.md を使う。読んでいない資料を読んだことにしない。）');
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
    say('読み込み中…');
    var text;
    try{text=build(key,await load());}
    catch(err){say('手順書を読み込めませんでした。ページを再読み込みするか、zip をダウンロードしてください。');return;}
    try{
      if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('unavailable');
      await Promise.race([navigator.clipboard.writeText(text),new Promise(function(_,rej){setTimeout(function(){rej(Error('timeout'));},2500);})]);
      say('コピーしました（'+e.name+'・'+text.length.toLocaleString('ja-JP')+'文字）。ChatGPT か Claude の新しい会話に貼って、送信してください。'+(text.length>10000?'長いので、貼ると「ファイル」のように表示されることがあります。そのまま送信して大丈夫です。':''));
      if(btn){var old=btn.getAttribute('data-label')||btn.textContent;btn.setAttribute('data-label',old);btn.classList.add('is-copied');btn.textContent='コピーしました';setTimeout(function(){btn.textContent=old;btn.classList.remove('is-copied');},2200);}
    }catch(err){fallback(text,e.name);}
  }
  /* 入口ごとの字数（サイトのボタン表示用）。ボタンを押したときのコピー文と同じ build() の長さ。 */
  window.instaAiSkillLength=function(key){return load().then(function(b){return build(key,b).length;});};
  window.instaAiCopySkill=function(key,btn,extra){return copyKey(key,btn,extra);};
  document.querySelectorAll('#get-skill [data-skillcopy]').forEach(function(b){
    b.addEventListener('click',function(){copyKey(b.getAttribute('data-skillcopy'),b);});
  });
})();
