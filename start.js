'use strict';
/* 「はじめる」：AI・作りたいものを選ぶと、手順書の入れ方と最初に打つ言葉が切り替わる。全部コピーボタンで使える。 */
(function(){
  var root=document.getElementById('start'); if(!root)return;
  var $=function(id){return document.getElementById(id);};
  var state={ai:'cc',make:'reel'};
  var FMT={voiceover:'アフレコ',vlog:'VLOG',talk:'トーク',ranking:'ランキング',comparison:'比較'};
  var AI={
    cc:{name:'Claude Code',cmd:'claude',skills:'.claude/skills',inst:'curl -fsSL https://claude.ai/install.sh | bash',instNote:'Claude Codeを入れます（すでに入っている人は飛ばします）。入れたら claude と打ち、案内に沿ってログインします。初回に英語の確認が出たら「Yes」を選びます。ログインできたら、control＋C を2回押して元の画面に戻ります（Claude Code も Codex も同じ。戻らないと、次の行がAIへの質問になってしまいます）。',desc:'Macのターミナルで進めます。上から順に、コピーして貼ります。',after:'確認できたら、下の言葉を打って、Claude Codeを起動します。'},
    codex:{name:'Codex',cmd:'codex',skills:'~/.codex/skills',inst:'npm install -g @openai/codex',instNote:'Codexを入れます（すでに入っている人は飛ばします）。入れたら codex と打ち、案内に沿ってログインします。初回に英語の確認が出たら「Yes」を選びます。ログインできたら、control＋C を2回押して元の画面に戻ります（Claude Code も Codex も同じ。戻らないと、次の行がAIへの質問になってしまいます）。',pre:'node -v',preNote:'先に、Node.js が入っているか確認します。数字が出なければ、nodejs.org から LTS を入れて、ターミナルを開き直します。',desc:'Macのターミナルで進めます。上から順に、コピーして貼ります。',after:'確認できたら、このフォルダ（~/insta-ai）のまま、下の言葉を打って、Codexを起動します。.codex は隠しフォルダなので、Finderでは探さず、上のコマンドで置きます。Codexがすでに開いていた場合は、一度閉じて、打ち直します。'},
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
  function prefix(){return state.ai==='app'?'いま貼った手順書を使って、':(state.ai==='codex'?'insta-ai-create のスキルで、':'インスタAIのスキル（/insta-ai-create）で、');}
  function TAIL(w){return reader()+'質問せず、足りないところは要確認と書いて仮置きで、'+w+'まで出して。';}
  function reader(){var r=$('start-reader').value.trim(),t=$('start-trouble').value.trim();return (r?'見る人は、'+r+'です。':'')+(t?(r?'その人':'見る人')+'の困りごとは「'+t+'」です。':'');}
  function nameSent(){var n=$('start-name').value.trim();return n?'呼ばれたい名前は、'+n+'です。':'名前は（あなたの名前）と仮置きして。';}
  function prompt(){
    var g=genre(), gn=g?g+'の':'', f=$('start-format').value, fl=f?FMT[f]+'形式の':'', P=prefix();
    switch(state.make){
      case 'reel': return P+gn+fl+'リールの台本を1本作って。'+(f?'':'形式は2案出して、私に選ばせて。')+(f==='vlog'?'出来事は撮影予定として仮置きして、実際に撮った順に差し替える箇所も書いて。':'')+TAIL('台本');
      case 'profile': return P+gn+'プロフィールの、表示名と紹介文を作って。'+nameSent()+TAIL('案');
      case 'feed': return P+gn+'フィード投稿を、1ページずつの原稿で作って。'+TAIL('原稿');
      case 'story': return P+gn+'ストーリーを、1枚ずつの本文と使う素材で作って。'+TAIL('本文');
      default:
        var fo=$('start-folder').value.trim();
        return P+gn+fl+'動画編集を進めて。'+(f?'':'形式は素材を見て決めて。')+(fo?'撮った素材は '+fo+' に入っています。':'撮った素材の場所は、あとで伝えます。')+'まず編集指示書の表だけ見せて、私がOKと言うまで進めないで。';
    }
  }
  var OUT={
    reel:'出てくるもの：「日付とタイトル」と「台本の本文」の2つのコピー用ブロック。そのあとに撮影メモ。作りたいものを変えると、この説明も切り替わります。',
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
      var note=function(t){host.appendChild(el('p','start-note',t));};
      var row=function(label,text){var r=el('div','start-copyrows');copyRow(r,label,text);host.appendChild(r);};
      note('① ターミナルを開きます。Macは Spotlight（command＋スペース）で「ターミナル」と打って、Enterを押します。Windowsの人は、「ChatGPT・Claudeのアプリ」を選んでください。');
      if(a.pre){note('② の前に　'+a.preNote);row('確認　'+a.pre,a.pre);}
      note('② '+a.instNote);
      row('入れる　'+a.inst,a.inst);
      note('③ 作業フォルダを作って、その中へ移ります。以降の手順は、すべてこのフォルダの中で行います。');
      row('作業フォルダ　mkdir -p ~/insta-ai && cd ~/insta-ai','mkdir -p ~/insta-ai && cd ~/insta-ai');
      note('④ zipをダウンロードします。');
      var z=el('a','start-btn primary','全部入りzipをダウンロード');z.href='downloads/insta-ai-all.zip';z.setAttribute('download','');host.appendChild(z);
      note('⑤ ダウンロードしたzipを、作業フォルダへ移します。Safariは zip を自動で開くことがあります。「No such file」と出たら、Safariの設定「ダウンロード後に安全なファイルを開く」を切って、もう一度ダウンロードするか、Chromeでダウンロードします。');
      row('zipを移す　mv ~/Downloads/insta-ai-all.zip .','mv ~/Downloads/insta-ai-all.zip .');
      note('⑥ 展開して、手順書を '+a.skills+'/ に置きます（3行まとめて貼れます）。');
      var cp='unzip insta-ai-all.zip -d insta-ai-all\nmkdir -p '+a.skills+'\ncp -R insta-ai-all/insta-ai-create '+a.skills+'/';
      row(cp,cp);
      note('⑦ 入っているか確認します。zipをダウンロードしたフォルダではなく、③で作った作業フォルダのターミナルで打ちます。バージョンの数字が出れば成功です。「command not found」と出たら、②へ戻ります。');
      row('確認　'+a.cmd+' --version',a.cmd+' --version');
      host.appendChild(el('p','start-note',a.after));
      row('起動の言葉　'+a.cmd,a.cmd);
    }
  }
  function renderS3(){
    $('start-prompt').value=prompt();
    var out=OUT[state.make];
    if(state.make==='edit'&&state.ai==='app')out='出てくるもの：編集指示書の表まで。動画の書き出しはClaude CodeかCodexで行います。';
    $('start-s3-out').textContent=out;
    $('start-format-wrap').hidden=!(state.make==='reel'||state.make==='edit');
    $('start-folder-wrap').hidden=state.make!=='edit';
    $('start-name-wrap').hidden=state.make!=='profile';
    $('start-edit-card').hidden=state.make!=='edit';
    $('start-edit-app').hidden=!(state.make==='edit'&&state.ai==='app');
    $('start-s3-status').textContent='';
  }
  function setPressed(groupId,attr,val){
    $(groupId).querySelectorAll('['+attr+']').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute(attr)===val?'true':'false');});
  }
  $('start-ai').addEventListener('click',function(e){var b=e.target.closest('[data-ai]');if(!b)return;state.ai=b.getAttribute('data-ai');setPressed('start-ai','data-ai',state.ai);renderS2();renderS3();});
  $('start-make').addEventListener('click',function(e){var b=e.target.closest('[data-make]');if(!b)return;state.make=b.getAttribute('data-make');setPressed('start-make','data-make',state.make);renderS3();});
  ['start-genre','start-reader','start-trouble','start-name','start-format','start-folder'].forEach(function(id){$(id).addEventListener('input',function(){renderS3();renderAnswers();});$(id).addEventListener('change',renderS3);});
  bindCopy($('start-copy-prompt'),function(){return $('start-prompt').value;},$('start-s3-status'),function(){$('start-prompt').focus();$('start-prompt').select();});
  /* 質問への返し方 */
  function renderAnswers(){
    var host=$('start-answers');host.replaceChildren();var g=genre()||'（あなたのジャンル）';
    var exp='私が実際に試したことは（ここに書く）です。ない場合は、見る人への呼びかけで作ってください。';
    var all='ジャンルは'+g+'です。'+(reader()||'見る人は、（どんな場面で何に）困っている人です。')+'使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。'+exp;
    copyRow(host,'3点まとめて返す　'+all,all);
    copyRow(host,'ジャンルを聞かれたら　ジャンルは'+g+'です。','ジャンルは'+g+'です。');
    copyRow(host,'誰向けかを聞かれたら　見る人は、（どんな場面で何に）困っている人です。',(reader()||'見る人は、（どんな場面で何に）困っている人です。'));
    copyRow(host,'素材を聞かれたら　使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。','使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。');
    copyRow(host,'経験を聞かれたら　'+exp,exp);
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
