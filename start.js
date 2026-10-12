'use strict';
/* 「はじめる」：AI・作りたいものを選ぶと、手順書の入れ方と最初に打つ言葉が切り替わる。全部コピーボタンで使える。 */
(function(){
  var root=document.getElementById('start'); if(!root)return;
  var $=function(id){return document.getElementById(id);};
  var state={ai:'cc',make:'reel'};
  var FMT={voiceover:'アフレコ',vlog:'VLOG',talk:'トーク',ranking:'ランキング',comparison:'比較'};
  var AI={
    cc:{name:'Claude Code',path:'.claude/skills/',cmd:'claude',desc:'zipをダウンロードして展開し、中の insta-ai-create フォルダを、作業フォルダの下の場所へ置きます。',after:'置いたら、その作業フォルダで下の言葉を打って、Claude Codeを起動します。'},
    codex:{name:'Codex',path:'~/.codex/skills/',cmd:'codex',desc:'zipをダウンロードして展開し、中の insta-ai-create フォルダを、下の場所へ置きます。',after:'置いたら、下の言葉を打って、Codexを起動します。'},
    app:{name:'アプリ',desc:'下のボタンで手順書をコピーします。新しい会話の入力欄に貼って、送ります。'}
  };
  function copyText(t){
    var fb=function(){try{var x=document.createElement('textarea');x.value=t;x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();var ok=document.execCommand('copy');x.remove();return ok;}catch(e){return false;}};
    if(navigator.clipboard&&navigator.clipboard.writeText){
      return Promise.race([navigator.clipboard.writeText(t).then(function(){return true;},function(){return fb();}),new Promise(function(r){setTimeout(function(){r(fb());},2500);})]);
    }
    return Promise.resolve(fb());
  }
  function bindCopy(btn,getText,status,onFail){
    btn.addEventListener('click',function(){
      var t=getText(); if(t==null)return;
      copyText(t).then(function(ok){
        if(status)status.textContent=ok?'コピーしました。':'コピーできませんでした。上の文を選んでコピーしてください。';
        if(ok){var old=btn.getAttribute('data-label')||btn.textContent;btn.setAttribute('data-label',old);btn.classList.add('is-copied');btn.textContent='コピーしました';setTimeout(function(){btn.textContent=old;btn.classList.remove('is-copied');},2000);}
        else if(onFail)onFail();
      });
    });
  }
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function copyRow(host,label,text){
    var row=el('div','start-copyrow');
    row.appendChild(el('span','start-copytext',label?label:text));
    var b=el('button','start-btn','コピー');b.type='button';
    var st=el('span','start-status','');st.setAttribute('role','status');
    bindCopy(b,function(){return typeof text==='function'?text():text;},st);
    row.appendChild(b);row.appendChild(st);host.appendChild(row);return row;
  }
  function genre(){return $('start-genre').value.trim();}
  function prefix(){return state.ai==='app'?'いま貼った手順書を使って、':'インスタAIのスキルで、';}
  function prompt(){
    var g=genre(), gn=g?g+'の':'', f=$('start-format').value, fl=f?FMT[f]+'形式の':'', P=prefix();
    switch(state.make){
      case 'reel': return P+gn+fl+'リールの台本を1本作って。質問は少なめで。';
      case 'profile': return P+gn+'プロフィールの、表示名と紹介文を作って。質問は少なめで。';
      case 'feed': return P+gn+'フィード投稿を、1ページずつの原稿で作って。質問は少なめで。';
      case 'story': return P+gn+'ストーリーを、1枚ずつの本文と使う素材で作って。質問は少なめで。';
      default:
        var fo=$('start-folder').value.trim();
        return P+gn+fl+'動画編集を進めて。'+(f?'':'形式は素材を見て決めて。')+(fo?'撮った素材は '+fo+' に入っています。':'撮った素材の場所は、あとで伝えます。')+'まず編集指示書の表だけ見せて、私がOKと言うまで進めないで。';
    }
  }
  var OUT={
    reel:'出てくるもの：「日付とタイトル」と「台本の本文」の2つのコピー用ブロック。そのあとに撮影メモ。',
    profile:'出てくるもの：表示名と紹介文の案と、選んだ理由。',
    feed:'出てくるもの：ページごとの見出し・本文・配置。',
    story:'出てくるもの：1枚ごとの本文・使う素材・その画面の役割。',
    edit:'出てくるもの：時間・声・映像・差し込み・字幕の表（編集指示書）。'
  };
  function renderS2(){
    var a=AI[state.ai], host=$('start-s2-actions'); host.replaceChildren(); $('start-s2-status').textContent='';
    $('start-s2-desc').textContent=a.desc;
    if(state.ai==='app'){
      var b=el('button','start-btn primary','手順書を全部コピー');b.type='button';
      b.addEventListener('click',function(){if(window.instaAiCopySkill)window.instaAiCopySkill('all',b,$('start-s2-status'));});
      host.appendChild(b);
    }else{
      var z=el('a','start-btn primary','zipをダウンロード');z.href='downloads/insta-ai-create.zip';z.setAttribute('download','');host.appendChild(z);
      var rows=el('div','start-copyrows');
      var r1=copyRow(rows,'置き場所　'+a.path,a.path);
      host.appendChild(rows);
      host.appendChild(el('p','start-note',a.after));
      var rows2=el('div','start-copyrows');copyRow(rows2,'起動の言葉　'+a.cmd,a.cmd);host.appendChild(rows2);
    }
  }
  function renderS3(){
    $('start-prompt').value=prompt();
    var out=OUT[state.make];
    if(state.make==='edit'&&state.ai==='app')out='出てくるもの：編集指示書の表まで。動画の書き出しはClaude CodeかCodexで行います。';
    $('start-s3-out').textContent=out;
    $('start-format-wrap').hidden=!(state.make==='reel'||state.make==='edit');
    $('start-folder-wrap').hidden=state.make!=='edit';
    $('start-edit-card').hidden=state.make!=='edit';
    $('start-edit-app').hidden=!(state.make==='edit'&&state.ai==='app');
    $('start-s3-status').textContent='';
  }
  function setPressed(groupId,attr,val){
    $(groupId).querySelectorAll('['+attr+']').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute(attr)===val?'true':'false');});
  }
  $('start-ai').addEventListener('click',function(e){var b=e.target.closest('[data-ai]');if(!b)return;state.ai=b.getAttribute('data-ai');setPressed('start-ai','data-ai',state.ai);renderS2();renderS3();});
  $('start-make').addEventListener('click',function(e){var b=e.target.closest('[data-make]');if(!b)return;state.make=b.getAttribute('data-make');setPressed('start-make','data-make',state.make);renderS3();});
  ['start-genre','start-format','start-folder'].forEach(function(id){$(id).addEventListener('input',function(){renderS3();renderAnswers();});$(id).addEventListener('change',renderS3);});
  bindCopy($('start-copy-prompt'),function(){return $('start-prompt').value;},$('start-s3-status'),function(){$('start-prompt').focus();$('start-prompt').select();});
  /* 質問への返し方 */
  function renderAnswers(){
    var host=$('start-answers');host.replaceChildren();var g=genre()||'（あなたのジャンル）';
    copyRow(host,'ジャンルを聞かれたら　ジャンルは'+g+'です。','ジャンルは'+g+'です。');
    copyRow(host,'誰向けかを聞かれたら　見る人は、'+g+'を始めたいけれど、何から手を付けるか迷っている人です。','見る人は、'+g+'を始めたいけれど、何から手を付けるか迷っている人です。');
    copyRow(host,'素材を聞かれたら　使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。','使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。');
    copyRow(host,'決まっていないとき　まだ決まっていません。候補を2つ出して、選ばせてください。','まだ決まっていません。候補を2つ出して、選ばせてください。');
  }
  var fixes=['冒頭の1行だけ、別の案を3つ出して。','30秒で話せる長さに短くして。','です・ます調の、やわらかい話し方に直して。'];
  fixes.forEach(function(t){copyRow($('start-fixes'),t,t);});
  copyRow($('start-edit-next'),'素材の場所を伝える　素材のフォルダの場所は、'+'（ここにパスを入れる）です。',function(){return '素材のフォルダの場所は、'+($('start-folder').value.trim()||'（ここにパスを入れる）')+' です。';});
  copyRow($('start-edit-next'),'表を見てよければ　表でOKです。書き出してください。','表でOKです。書き出してください。');
  /* 編集の指示文（howto.json） */
  var howto=null;
  function loadHowto(){
    if(howto)return Promise.resolve(howto);
    return fetch('assets/reels/howto.json').then(function(r){if(!r.ok)throw Error('x');return r.json();}).then(function(d){howto={};(d.items||[]).forEach(function(x){howto[x.format]=x;});return howto;});
  }
  var agentSt=$('start-agent-status');
  $('start-copy-agent').addEventListener('click',function(){
    var f=$('start-format').value;
    if(!f){agentSt.textContent='上の「形式」を選んでから、もう一度押してください。';return;}
    var btn=$('start-copy-agent');
    loadHowto().then(function(h){
      var p=h[f]&&h[f].agent_prompt;
      if(!p){agentSt.textContent='この形式の指示文を読み込めませんでした。';return;}
      return copyText(p).then(function(ok){agentSt.textContent=ok?'コピーしました（'+FMT[f]+'）。AIに貼って送ります。':'コピーできませんでした。下の「作り方」から指示文を選んでコピーしてください。';});
    }).catch(function(){agentSt.textContent='読み込めませんでした。ページを開き直してください。';});
  });
  renderS2();renderS3();renderAnswers();
})();
