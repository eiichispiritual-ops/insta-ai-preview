'use strict';
/* 「はじめる」：AI・作りたいものを選ぶと、手順書の入れ方と最初に打つ言葉が切り替わる。全部コピーボタンで使える。 */
(function(){
  var root=document.getElementById('start'); if(!root)return;
  var $=function(id){return document.getElementById(id);};
  var state={ai:'app',make:'reel'};
  var KEY='instaAiStart.v1';
  var FIELDS=['start-genre','start-reader','start-trouble','start-name','start-today','start-format','start-folder','start-tip'];
  function save(){try{var o={ai:state.ai,make:state.make,f:{}};FIELDS.forEach(function(id){o.f[id]=$(id).value;});localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
  function restore(){try{var o=JSON.parse(localStorage.getItem(KEY)||'null');if(!o)return;if(AI[o.ai])state.ai=o.ai;if(MAKE_NAME[o.make])state.make=o.make;FIELDS.forEach(function(id){if(o.f&&typeof o.f[id]==='string'){var n=$(id);if(n.tagName==='SELECT'){var ok=Array.prototype.some.call(n.options,function(x){return x.value===o.f[id];});if(ok)n.value=o.f[id];}else n.value=o.f[id];}});}catch(e){}}
  var FMT={voiceover:'アフレコ',vlog:'VLOG',talk:'トーク',ranking:'ランキング',comparison:'比較',abstract:'抽象マーケ'};
  var AI={
    cc:{name:'Claude Code',cmd:'claude',skills:'.claude/skills',inst:'curl -fsSL https://claude.ai/install.sh | bash',pathNote:'入れたあとに「PATH」の案内（~/.local/bin is not in your PATH）が出たら、その案内に書かれた1行をコピーして貼り、Enter を押して、ターミナルを閉じて開き直します。案内が出なかった人は、飛ばします。下の1行は、その案内と同じ中身です（ユーザー名は入れなくて大丈夫です）。',pathCmd:'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc',instNote:'Claude Codeを入れます（すでに入っている人は飛ばします）。',loginNote:'claude と打ち、案内に沿ってログインします。「Do you trust the files in this folder?」と出たら、Enter（Yes）を押します。ログインできたら、control＋C（command ではなく、左下の control キー）を2回押して元の画面に戻ります（Claude Code も Codex も同じ。戻らないと、次の行がAIへの質問になってしまいます）。',desc:'この手順は Mac で行います。iPhone から見ている人は「アプリ」を選んでください。Macのターミナルで進めます。上から順に、コピーして貼ります。番号は多く見えますが、どれもコピーして貼るだけです。',after:'確認できたら、下の言葉を打って、Claude Codeを起動します。.claude は隠しフォルダなので Finder には出ませんが、ちゃんと入っています。'},
    codex:{name:'Codex',cmd:'codex',skills:'~/.codex/skills',inst:'npm install -g @openai/codex',instNote:'Codexを入れます（すでに入っている人は飛ばします）。',loginNote:'codex と打ち、案内に沿ってログインします。「Do you trust the files in this folder?」と出たら、Enter（Yes）を押します。ログインできたら、control＋C（command ではなく、左下の control キー）を2回押して元の画面に戻ります（Claude Code も Codex も同じ。戻らないと、次の行がAIへの質問になってしまいます）。',pre:'node -v',preNote:'先に、Node.js が入っているか確認します。数字が出なければ、nodejs.org から LTS を入れて、ターミナルを開き直します。',desc:'この手順は Mac で行います。iPhone から見ている人は「アプリ」を選んでください。Macのターミナルで進めます。上から順に、コピーして貼ります。番号は多く見えますが、どれもコピーして貼るだけです。',after:'確認できたら、このフォルダ（~/insta-ai）のまま、下の言葉を打って、Codexを起動します。.codex は隠しフォルダなので Finder には出ませんが、ちゃんと入っています。上のコマンドで置きます。Codexがすでに開いていた場合は、一度閉じて、打ち直します。'},
    app:{name:'アプリ',desc:'下のボタンで手順書をコピーします（上で選んだ「作りたいもの」用の版です。選び直すと切り替わります）。新しい会話の入力欄に貼って送り、AIの返事が出てから、手順3の「最初に打つ言葉」を貼ります。2つを同時には貼りません。'}
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
    var s=label?label:text,i=s.indexOf('　'),sp=el('span','start-copytext');
    if(i>0&&/^[ -~]/.test(s.slice(i+1))){sp.appendChild(el('b','start-copylabel',s.slice(0,i)));sp.appendChild(el('code','start-cmd',s.slice(i+1)));}
    else if(/^[\x20-\x7e\n]+$/.test(s)){sp.appendChild(el('code','start-cmd',s));}
    else sp.textContent=s;
    row.appendChild(sp);
    var b=el('button','start-btn','コピー');b.type='button';
    var st=el('span','start-status','');st.setAttribute('role','status');
    bindCopy(b,function(){return typeof text==='function'?text():text;},st);
    row.appendChild(b);row.appendChild(st);host.appendChild(row);return row;
  }
  function genre(){return $('start-genre').value.trim();}
  function prefix(){return state.ai==='app'?'いま貼った手順書を使って、':(state.ai==='codex'?'insta-ai-create のスキルで、':'インスタAIのスキル（/insta-ai-create）で、');}
  function TAIL(w,x,ask){return reader()+(x||'')+(ask?'形式が決まったら':'')+'質問せず、足りないところは要確認と書いて仮置きで、'+w+'まで出して。';}
  function reader(){var r=$('start-reader').value.trim(),t=$('start-trouble').value.trim();return (r?'見る人は、'+r+'です。':'')+(t?(r?'その人':'見る人')+'の困りごとは「'+t+'」です。':'');}
  function tipSent(){var t=$('start-tip').value.trim();return t?'私が見る人に伝えたい工夫は「'+t+'」です。':'';}
  function nameSent(){var n=$('start-name').value.trim();return n?'呼ばれたい名前は、'+n+'です。':'名前は（あなたの名前）と仮置きして。';}
  function prompt(){
    var g=genre(), gs=g?'ジャンルは'+g+'。':'', f=$('start-format').value, fl=f?FMT[f]+'形式の':'', P=prefix();
    switch(state.make){
      case 'reel': return P+gs+fl+'リール台本を1本作って。'+(f?'':'形式は2案出して、理由をつけて。私が選んだら台本まで出して。')+'私の経験は書いていないので、作らずに、見る人への呼びかけで入って。'+(f==='vlog'?'出来事は撮影予定として仮置きして、実際に撮った順に差し替える箇所も書いて。':'')+TAIL('台本',tipSent(),!f);
      case 'profile': return P+gs+'プロフィールの表示名と紹介文を作って。'+nameSent()+TAIL('案');
      case 'feed': return P+gs+'フィード投稿を、1ページずつの原稿で作って。'+TAIL('原稿');
      case 'story': var td=$('start-today').value.trim(); return P+gs+'ストーリーを、1枚ずつの本文と使う素材で作って。'+(td?'今日あったことは「'+td+'」です。':'出来事は（今日あったこと）と仮置きして。')+TAIL('本文');
      default:
        var fo=$('start-folder').value.trim();
        return P+gs+reader()+(f?'形式は'+FMT[f]+'です。':'')+'動画編集を進めて。'+(state.ai==='app'?'':'作業フォルダは ~/insta-ai です。完成動画は ~/insta-ai/出力/out.mp4 に出してください。')+(f?'':'形式は素材を見て決めて。')+(state.ai==='app'?'撮った素材は、ファイル名と何が映っているかを文で伝えます。':(fo?'撮った素材は '+fo+' に入っています。':'撮った素材の場所は、あとで伝えます。'))+'まず編集指示書の表だけ見せて、私がOKと言うまで進めないで。';
    }
  }
  var OUT={
    reel:'出てくるもの：「日付とタイトル」と「台本の本文」の2つのコピー用ブロック。そのあとに撮影メモ（撮れる素材か、要確認かの欄つき）。作りたいものを変えると、この説明も切り替わります。',
    profile:'出てくるもの：表示名と紹介文の案と、選んだ理由。（ ）や「要確認」の括弧は、プロフィール欄へ貼る前に書き換えるか消します。',
    feed:'出てくるもの：ページごとの見出し・本文・配置。',
    story:'出てくるもの：1枚ごとの本文・使う素材・その画面の役割。材料が1つの日は1枚で終わります。枚数を増やすには、出来事をもう1つか、見る人の困りごとを入れてください。「今日あったこと」を空欄にすると、本文の（ ）は自分で書き換える場所になります。',
    edit:'出てくるもの：時間・声・映像・差し込み・字幕の表（編集指示書）。'
  };
  var MAKE_NAME={reel:'リールの台本',profile:'プロフィール',feed:'フィード投稿',story:'ストーリー',edit:'動画編集'};
  function appKey(){var f=$('start-format').value;if(state.make==='reel')return f?'reel-'+f:'reel-any';if(state.make==='edit')return f?'edit-'+f:'edit-any';return state.make;}
  function appName(){var f=$('start-format').value;return MAKE_NAME[state.make]+((state.make==='reel'||state.make==='edit')&&f?'・'+FMT[f]:'');}
  function renderS2(){
    var a=AI[state.ai], host=$('start-s2-actions'); host.replaceChildren(); $('start-s2-status').textContent='';
    $('start-s2-desc').textContent=a.desc;
    $('start-s2-make').hidden=state.ai!=='app';
    if(state.ai==='app'){
      var key=appKey(),nm=appName();
      var mk=function(k,pre,inner,cls){
        var label=pre+'（'+inner+'）';
        var b=el('button',cls,label);b.type='button';b.setAttribute('data-label',label);
        b.addEventListener('click',function(){if(window.instaAiCopySkill)window.instaAiCopySkill(k,b,$('start-s2-status'));});
        host.appendChild(b);
        if(window.instaAiSkillLength)window.instaAiSkillLength(k).then(function(n){
          var l=pre+'（'+inner+'・約'+n.toLocaleString('ja-JP')+'字）';
          if(!b.classList.contains('is-copied')){b.textContent=l;}
          b.setAttribute('data-label',l);
        }).catch(function(){});
        return b;
      };
      mk(key,'手順書をコピー',nm+'用','start-btn primary');
      host.appendChild(el('p','start-note','「全部」は、すべての入口の手順書です。長いので、入力欄に入らないときは、上のボタンを使います。'));
      mk('all','手順書を全部コピー','全部入り','start-btn');
    }else{
      var note=function(t){host.appendChild(el('p','start-note',t));};
      var row=function(label,text){var r=el('div','start-copyrows');copyRow(r,label,text);host.appendChild(r);};
      var C='①②③④⑤⑥⑦⑧⑨⑩'.split(''),k=0,nx=function(){return C[k++];};
      var tInst,tFold;
      note(nx()+' ターミナルを開きます。Macは Spotlight（command＋スペース）で「ターミナル」と打って、Enterを押します。Windowsの人は、「ChatGPT・Claudeのアプリ」を選んでください。');
      if(a.pre){note(nx()+' '+a.preNote);row('確認　'+a.pre,a.pre);}
      tInst=C[k];note(nx()+' '+a.instNote);
      row('入れる　'+a.inst,a.inst);
      if(a.pathCmd){note(a.pathNote);row('PATHの案内が出たとき　'+a.pathCmd,a.pathCmd);}
      note(nx()+' 入っているか確認します。バージョンの数字が出れば成功です。「command not found」と出たら、'+tInst+'へ戻ります。');
      row('確認　'+a.cmd+' --version',a.cmd+' --version');
      tFold=C[k];note(nx()+' 作業フォルダを作って、その中へ移ります。以降の手順は、すべてこのフォルダの中で行います。');
      row('作業フォルダ　mkdir -p ~/insta-ai && cd ~/insta-ai','mkdir -p ~/insta-ai && cd ~/insta-ai');
      note(nx()+' '+a.loginNote);
      row('ログイン　'+a.cmd,a.cmd);
      note(nx()+' zipをダウンロードします。');
      var z=el('a','start-btn primary','全部入りzipをダウンロード');z.href='downloads/insta-ai-all.zip';z.setAttribute('download','');host.appendChild(z);
      note(nx()+' ダウンロードしたzipを、作業フォルダへ移します。Safariは zip を自動で開くことがあります。「No such file」と出たら、Safariの設定「ダウンロード後に安全なファイルを開く」を切って、もう一度ダウンロードするか、Chromeでダウンロードします。ファイル名が違えば、その名前で打ちます（例：insta-ai-all (1).zip のとき）。');
      row('zipを移す　mv ~/Downloads/insta-ai-all.zip .','mv ~/Downloads/insta-ai-all.zip .');
      row('名前が「insta-ai-all (1).zip」のとき　mv ~/Downloads/"insta-ai-all (1).zip" ./insta-ai-all.zip','mv ~/Downloads/"insta-ai-all (1).zip" ./insta-ai-all.zip');
      var tPlace=C[k];note(nx()+' 展開して、手順書を '+a.skills+'/ に置きます（3行まとめて貼れます）。');
      var cp='unzip insta-ai-all.zip -d insta-ai-all\nmkdir -p '+a.skills+'\ncp -R insta-ai-all/insta-ai-create '+a.skills+'/';
      row(cp,cp);
      var ls='ls '+a.skills;
      note(nx()+' 入ったか確かめます。この1行も、コピーして貼って Enter。insta-ai-create と出れば成功です。');
      row('確認　'+ls,ls);
      host.appendChild(el('p','start-note',a.after));
      row('起動の言葉　'+a.cmd,a.cmd);
      note('起動したら、手順書が読めているか確認します。「読めていません」と返ったら、置く3行（'+tPlace+'）をやり直して、AIを閉じて開き直します。');
      var chk=(state.ai==='codex'?'insta-ai-create のスキル':'インスタAIのスキル（/insta-ai-create）')+'は読めていますか。読めていれば「読めています」とだけ答えて。';
      row('確認　'+chk,chk);
    }
  }
  function renderS3(){
    $('start-prompt').value=prompt();
    var out=OUT[state.make];
    if(state.make==='edit'&&state.ai==='app')out='出てくるもの：編集指示書の表まで。素材は文で伝え、表を見ながら CapCut などの編集アプリで並べます。書き出しまで自動でやるのは Claude Code か Codex です。';
    $('start-s3-out').textContent=out;
    $('start-format-wrap').hidden=!(state.make==='reel'||state.make==='edit');
    $('start-folder-wrap').hidden=!(state.make==='edit'&&state.ai!=='app');
    $('start-name-wrap').hidden=state.make!=='profile';
    $('start-today-wrap').hidden=state.make!=='story';
    $('start-tip-wrap').hidden=state.make!=='reel';
    var hint='';
    if(state.make==='profile'&&!$('start-reader').value.trim())hint='プロフィールは、見る人を入れると、紹介文の（ ）が減ります。';
    if(state.make==='feed'&&!$('start-trouble').value.trim())hint='フィードは、見る人の困りごとを入れると、2ページ目の「迷う場面」が具体的になります。';
    $('start-field-hint').textContent=hint;$('start-field-hint').hidden=!hint;
    var isApp=state.ai==='app';
    $('start-edit-card').hidden=state.make!=='edit';
    $('start-edit-agent').hidden=isApp;
    $('start-edit-app').hidden=!(state.make==='edit'&&isApp);
    $('start-make-label').hidden=isApp;$('start-make').hidden=isApp;
    var fx=$('start-make-fixed');fx.hidden=!isApp;fx.textContent='作りたいもの：'+MAKE_NAME[state.make]+'（手順2で選んだもの。変えるときは手順2で選び直します）';
    $('start-s2-editnote').hidden=!(isApp&&state.make==='edit');
    $('start-s2-phone').hidden=!isApp;$('start-s3-phone').hidden=!isApp;
    $('start-s3-status').textContent='';
  }
  function setPressed(groupId,attr,val){
    $(groupId).querySelectorAll('['+attr+']').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute(attr)===val?'true':'false');});
  }
  function setMake(){save();setPressed('start-make','data-make',state.make);setPressed('start-make2','data-make',state.make);if(state.ai==='app')renderS2();renderS3();}
  $('start-ai').addEventListener('click',function(e){var b=e.target.closest('[data-ai]');if(!b)return;state.ai=b.getAttribute('data-ai');setPressed('start-ai','data-ai',state.ai);save();renderS2();renderS3();});
  $('start-make').addEventListener('click',function(e){var b=e.target.closest('[data-make]');if(!b)return;state.make=b.getAttribute('data-make');setMake();});
  $('start-make2').addEventListener('click',function(e){var b=e.target.closest('[data-make]');if(!b)return;state.make=b.getAttribute('data-make');setMake();});
  ['start-genre','start-reader','start-trouble','start-name','start-today','start-format','start-folder','start-tip'].forEach(function(id){$(id).addEventListener('input',function(){save();renderS3();renderAnswers();});$(id).addEventListener('change',function(){save();renderS3();});});
  $('start-format').addEventListener('change',function(){if(state.ai==='app')renderS2();});
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
  copyRow($('start-edit-next'),'素材の場所を伝える（台本.txt も同じフォルダに置く）　素材のフォルダの場所は、'+'（ここにパスを入れる）です。',function(){return '素材のフォルダの場所は、'+($('start-folder').value.trim()||'（ここにパスを入れる）')+' です。';});
  copyRow($('start-edit-next'),'表を見てよければ　表でOKです。書き出してください。','表でOKです。書き出してください。');
  copyRow($('start-edit-next'),'素材が足りないと言われたら　今ある素材だけで、入点を変えて再利用して、出力/out.mp4 を書き出してください。','今ある素材だけで、入点を変えて再利用して、出力/out.mp4 を書き出してください。');
  copyRow($('start-edit-next'),'表が違ったら　○行目だけ、字幕を短くして。','○行目だけ、字幕を短くして。');
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
  restore();setPressed('start-ai','data-ai',state.ai);setPressed('start-make','data-make',state.make);setPressed('start-make2','data-make',state.make);
  renderS2();renderS3();renderAnswers();
})();
