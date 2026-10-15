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
    cc:{name:'Claude Code',cmd:'claude',skills:'.claude/skills',inst:'curl -fsSL https://claude.ai/install.sh | bash',pathNote:'入れたあとに「~/.local/bin is not in your PATH」と出たら、下の1行を貼って Enter。ターミナルを閉じて開き直せば反映されます。この表示が出なければ、ここは飛ばしてかまいません。下の1行は案内に書かれているものと同じで、ユーザー名を書き換える必要はありません。',pathCmd:'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc',instNote:'Claude Code を入れます。入っていれば飛ばしてください。',loginNote:'claude と打ち、案内どおりにログインします。「Do you trust the files in this folder?」と聞かれたら Enter。ログインが済んだら、左下の control キーと C を2回押して元の画面に戻ってください（command キーではありません）。戻らずに次の行を貼ると、AIへの質問として送られてしまいます。',desc:'この手順は Mac で行います。iPhone から見ている人は「アプリ」を選んでください。Macのターミナルで進めます。A・B・C の3つを上から順に。どれも「コピー」を押して、ターミナルに貼って（command＋V）、Enter するだけです。',after:'確認できたら、下の言葉を打って、Claude Codeを起動します。.claude は隠しフォルダなので Finder には出ませんが、ちゃんと入っています。'},
    codex:{name:'Codex',cmd:'codex',skills:'~/.agents/skills',inst:'npm install -g @openai/codex',instNote:'Codex を入れます。入っていれば飛ばしてください。',loginNote:'codex と打ち、案内どおりにログインします。「Do you trust the files in this folder?」と聞かれたら Enter。ログインが済んだら、左下の control キーと C を2回押して元の画面に戻ってください（command キーではありません）。戻らずに次の行を貼ると、AIへの質問として送られてしまいます。',pre:'node -v',preNote:'先に、Node.js が入っているか確認します。数字が出なければ、nodejs.org から LTS を入れて、ターミナルを開き直します。',desc:'この手順は Mac で行います。iPhone から見ている人は「アプリ」を選んでください。Macのターミナルで進めます。A・B・C の3つを上から順に。どれも「コピー」を押して、ターミナルに貼って（command＋V）、Enter するだけです。',after:'確認できたら、このフォルダ（~/insta-ai）のまま、下の言葉を打って、Codexを起動します。.agents は隠しフォルダなので Finder には出ませんが、ちゃんと入っています。古い版の Codex で「インスタAIの手順書」が効かないときだけ、同じ cp の行の ~/.agents/skills を ~/.codex/skills に変えて、もう一度貼ります。Codexがすでに開いていた場合は、一度閉じて、打ち直します。'},
    app:{name:'アプリ',desc:'① 下のボタンでコピー → ② AIアプリで新しい会話を開き、貼って送信 → ③ 返事が出たら、手順3へ。長い文なので、貼ると「ファイル」のように表示されることがあります。そのまま送信して大丈夫です。'}
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
  function copyRow(host,label,text,split){
    var row=el('div','start-copyrow');
    var s=label?label:text,i=s.indexOf('　'),sp=el('span','start-copytext');
    if(i>0&&/^[ -~]/.test(s.slice(i+1))){sp.appendChild(el('b','start-copylabel',s.slice(0,i)));sp.appendChild(el('code','start-cmd',s.slice(i+1)));}
    else if(split&&i>0){sp.appendChild(el('b','start-copylabel',s.slice(0,i)));sp.appendChild(el('span','start-copybody',s.slice(i+1)));}
    else if(/^[\x20-\x7e\n]+$/.test(s)){sp.appendChild(el('code','start-cmd',s));}
    else sp.textContent=s;
    row.appendChild(sp);
    var b=el('button','start-btn','コピー');b.type='button';
    var st=el('span','start-status','');st.setAttribute('role','status');
    bindCopy(b,function(){return typeof text==='function'?text():text;},st);
    row.appendChild(b);row.appendChild(st);host.appendChild(row);return row;
  }
  function genre(){return $('start-genre').value.trim();}
  function prefix(){return state.ai==='app'?'いま貼った手順書を使って、':'インスタAIの手順書（insta-ai-create）で、';}
  function TAIL(w,x,ask){return reader()+(x||'')+(ask?'形式が決まったら':'')+'質問せず、足りないところは要確認と書いて仮置きで、'+w+'まで出して。';}
  function reader(){var r=$('start-reader').value.trim(),t=$('start-trouble').value.trim();return (r?'見る人は、'+r+'です。':'')+(t?(r?'その人':'見る人')+'の困りごとは「'+t+'」です。':'');}
  function tipSent(){var t=$('start-tip').value.trim();return t?'私が見る人に伝えたい工夫は「'+t+'」です。':'';}
  function nameSent(){var n=$('start-name').value.trim();return n?'呼ばれたい名前は、'+n+'です。':'名前は（あなたの名前）と仮置きして。';}
  function prompt(){
    var g=genre(), gs=g?'ジャンルは'+g+'。':'', f=$('start-format').value, fl=f?FMT[f]+'形式の':'', P=prefix();
    switch(state.make){
      case 'reel': return P+gs+fl+'リール台本を1本作って。'+reader()+tipSent()+(f?'':'形式を2案、理由つきで出して。私が選んだら、')+'質問せずに台本まで出して。私の体験談は作らず、見る人への問いかけで始めて。'+(f==='vlog'?'出来事は撮影予定として仮に置き、実際に撮った順に差し替える箇所も書いて。':'')+'分からないところは【要確認】と書いて仮に入れて。';
      case 'profile': return P+gs+'プロフィールの表示名と紹介文を作って。'+nameSent()+TAIL('案');
      case 'feed': return P+gs+'フィード投稿を、1ページずつの原稿で作って。'+TAIL('原稿');
      case 'story': var td=$('start-today').value.trim(); return P+gs+'ストーリーを、1枚ずつの本文と使う素材で作って。'+(td?'今日あったことは「'+td+'」です。':'出来事は（今日あったこと）と仮置きして。')+TAIL('本文');
      default:
        var fo=$('start-folder').value.trim();
        return P+gs+reader()+(f?'形式は'+FMT[f]+'です。':'')+'動画編集を進めて。'+(state.ai==='app'?'':'作業フォルダは ~/insta-ai です。完成動画は ~/insta-ai/出力/out.mp4 に出してください。')+(f?'':'形式は素材を見て決めて。')+(state.ai==='app'?'撮った素材は、ファイル名と何が映っているかを文で伝えます。':(fo?'撮った素材は '+fo+' に入っています。':'撮った素材の場所は、あとで伝えます。'))+'まず編集指示書の表だけ見せて、私がOKと言うまで進めないで。';
    }
  }
  var OUT={
    reel:'形式を「相談して決める」のままにした人は、先に形式の案が2つ出ます。下の「形式の案が2つ出たら」をコピーして返すと、台本が出ます（AIがそのまま台本まで出すこともあります）。出てくるもの：「日付とタイトル」と「台本の本文」の2つのコピー用ブロック。そのあとに撮影メモ（撮れる素材か、要確認かの欄つき）。作りたいものを変えると、この説明も切り替わります。',
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
          var l=pre+'（'+inner+'）';b.title='長い文章です（約'+Math.round(n/1000)+'千字）';
          if(!b.classList.contains('is-copied')){b.textContent=l;}
          b.setAttribute('data-label',l);
        }).catch(function(){});
        return b;
      };
      (function(){var p=el('p','start-note','アプリがまだないとき：');var l1=el('a',null,'App Store で ChatGPT');l1.href='https://apps.apple.com/app/chatgpt/id6448311069';l1.target='_blank';l1.rel='noopener';var l2=el('a',null,'Google Play で ChatGPT');l2.href='https://play.google.com/store/apps/details?id=com.openai.chatgpt';l2.target='_blank';l2.rel='noopener';var l3=el('a',null,'ブラウザ版（chatgpt.com）');l3.href='https://chatgpt.com/';l3.target='_blank';l3.rel='noopener';p.append(l1,' ／ ',l2,'（どちらも無料）。アプリを入れずに使うなら、',l3,'でも同じです。');host.appendChild(p);})();
      if(key.indexOf('reel-')===0){mk(key+'-lite','手順書をコピー',nm+'・短い版','start-btn primary');mk(key,'くわしい版をコピー',nm+'・長い','start-btn');host.appendChild(el('p','start-note','まずは短い版で大丈夫です。台本の質を上げたいときは、くわしい版（参照資料つき）を貼ります。'));}
      else mk(key,'手順書をコピー',nm+'用','start-btn primary');
      host.appendChild(el('p','start-note','「全部」は、すべての入口の手順書です。長いので、入力欄に入らないときは、上のボタンを使います。'));
      mk('all','手順書を全部コピー','全部入り','start-btn');
    }else{
      var note=function(t){host.appendChild(el('p','start-note',t));};
      var ok=function(t){host.appendChild(el('p','start-note start-ok','【成功の目安】'+t));};
      var head=function(t){host.appendChild(el('h4','start-stage',t));};
      var row=function(label,text){var r=el('div','start-copyrows');copyRow(r,label,text);host.appendChild(r);};
      var help=function(title,items){var d=el('details','start-more start-help');d.appendChild(el('summary',null,title));items.forEach(function(it){var p=el('p','start-note');p.appendChild(el('b',null,it[0]+'：'));p.appendChild(document.createTextNode(it[1]));d.appendChild(p);if(it[2]){var r=el('div','start-copyrows');copyRow(r,null,it[2]);d.appendChild(r);}});host.appendChild(d);};
      var isCodex=state.ai==='codex';
      var quick=el('details','start-more start-quick');quick.appendChild(el('summary',null,'慣れている人向け：コマンドだけ見る'));host.appendChild(quick);
      note(isCodex?'Codex は ChatGPT の有料プラン（Plus 以上）か、OpenAI の API キーで使えます。':'Claude Code は Claude の有料プラン（Pro 以上）か、Anthropic の API キーで使えます。無料プランでは使えません。');
      head('A　ターミナルを開いて、'+a.name+'を入れる（初回だけ）');
      note('command＋スペースで「ターミナル」と打って Enter。文字だけの画面が開きます。打ち間違えても Mac は壊れません。すでに '+a.name+' が入っている人は、B へ進みます。');
      if(isCodex){note('Codex には Node.js が要ります。先に次の1行で確認します。数字（例：v22.11.0）が出ればOK。出なければ nodejs.org で「LTS」をダウンロードして入れ、ターミナルを開き直します。');row('確認　node -v','node -v');}
      var inst=a.inst+' && '+a.cmd+' --version';
      row('入れる　'+inst,inst);
      ok('最後に数字（バージョン）が出る。');
      help('うまくいかないとき',isCodex?[
        ['「command not found: npm」','Node.js が入っていません。nodejs.org から LTS を入れて、ターミナルを開き直してから、もう一度貼ります。'],
        ['「EACCES」「permission denied」と出た','パソコンの権限の問題です。次の1行を貼り、Mac のパスワード（画面に出ません）を打って Enter。','sudo npm install -g @openai/codex'],
        ['「command not found: codex」','ターミナルを閉じて開き直し、もう一度「入れる」を貼ります。']]:[
        ['「~/.local/bin is not in your PATH」や「command not found: claude」','次の1行を貼って Enter。そのあと、ターミナルを閉じて開き直し、もう一度「入れる」を貼ります。',a.pathCmd],
        ['何も出ずに止まって見える','ダウンロード中です。1〜2分待ちます。']]);
      head('B　手順書（zip）を受け取って、入れる');
      note('まず下のボタンで zip をダウンロードします（ダウンロードフォルダに入ります。開かなくてかまいません）。貼ったあとに「“ターミナル”が“ダウンロード”フォルダ内のファイルにアクセスしようとしています」と出たら「許可」を押します。');
      var z=el('a','start-btn primary','全部入りzipをダウンロード');z.href='downloads/insta-ai-all.zip';z.setAttribute('download','');host.appendChild(z);
      var sk=isCodex?'~/.agents/skills':'.claude/skills';
      var put='mkdir -p ~/insta-ai && cd ~/insta-ai && Z=$(ls -t ~/Downloads | grep "^insta-ai-all.*\\.zip$" | head -1); D=$(ls -t ~/Downloads | grep "^insta-ai-all" | grep -v "\\.zip$" | head -1); if [ -n "$Z" ]; then unzip -oq ~/Downloads/"$Z" -d insta-ai-all; elif [ -n "$D" ]; then rm -rf insta-ai-all && cp -R ~/Downloads/"$D" insta-ai-all; fi; if [ -d insta-ai-all/insta-ai-create ]; then mkdir -p '+sk+' && cp -R insta-ai-all/insta-ai-create '+sk+'/ && ls '+sk+'; else echo "zip が見つかりません。ダウンロードし直してください"; fi';
      note('下の「コピー」を押して、ターミナルに貼って Enter。作業フォルダ ~/insta-ai を作り、zip を開いて手順書を置くところまで自動で進みます。ファイル名が「insta-ai-all (1).zip」になっていても、Safari が先に zip を開いていても動きます。');
      row('入れる（長いので中身は省略しています）',put);
      ok('最後に insta-ai-create と出れば成功です。');
      help('うまくいかないとき',[
        ['「zip が見つかりません」と出た','ダウンロードフォルダに zip がありません。上のボタンでダウンロードし直してから、同じ1行を貼ってください。'],
        ['違う場所に保存した','zip を Finder の「ダウンロード」に移してから、もう一度貼ります。']].concat(isCodex?[['古い版の Codex で「スキルが見つからない」と出た','次の1行で、古い置き場所にもコピーします。','mkdir -p ~/.codex/skills && cp -R ~/insta-ai/insta-ai-all/insta-ai-create ~/.codex/skills/']]:[]));
      head('C　'+a.name+'を起動して、ログインする');
      var run='cd ~/insta-ai && '+a.cmd;
      row('起動　'+run,run);
      note('初回はログインが必要です。ブラウザが開いたら、いつものアカウントで許可してください。英語で何か聞かれたら、文字の色の設定も含めて Enter で進めてかまいません。');
      var chk='インスタAIの手順書（insta-ai-create）は読めていますか。読めていれば「読めています」とだけ答えて。';
      note('起動したら、この1行を貼って Enter。');
      row('確認　'+chk,chk);
      ok('「読めています」と返ってきたら、手順3へ進みます。');
      note('「読めています」と返らないとき：'+(isCodex?'「~/.agents/skills/insta-ai-create/SKILL.md を読んでから進めて」':'「.claude/skills/insta-ai-create/SKILL.md を読んでから進めて」')+'と貼れば、ファイルを直接読ませて進められます。');
      help('うまくいかないとき',[
        ['「読めていません」と返ってきた','control＋C を2回押して AI を閉じ、B の1行をもう一度貼ってから、C の「起動」を貼り直します。'],
        ['動画の書き出しで「ffmpeg がない」と言われた','AI に「ffmpeg を Homebrew で入れて」と頼めば入れてくれます。途中で Mac のパスワードを聞かれたら、入力して Enter（画面には表示されません）。'],
        ['次の日に続きをやる','ターミナルを開いて、C の「起動」を貼るだけです。']]);
      (function(){var qn=el('p','start-note','ターミナルに上から順に貼ります。2 の行で zip をダウンロードフォルダに取ります（ボタンで受け取ってあれば飛ばせます）。');quick.appendChild(qn);
        [['1 入れる',inst],['2 zip を取る','curl -fsSLo ~/Downloads/insta-ai-all.zip '+new URL('downloads/insta-ai-all.zip',location.href).href],['3 手順書を置く',put],['4 起動',run],['5 確認（AIに貼る）',chk]].forEach(function(x){var r=el('div','start-copyrows');copyRow(r,x[0],x[1]);quick.appendChild(r);});})();
    }
  }
  function renderS3(){
    $('start-prompt').value=prompt();
    var out=OUT[state.make];
    if(state.make==='edit'&&state.ai==='app')out='アプリで出るのは編集の段取り表までです。表を見ながら CapCut などで並べてください。書き出しまで自動で進むのは Claude Code と Codex です。';
    $('start-s3-out').textContent=out;
    $('start-format-wrap').hidden=!(state.make==='reel'||state.make==='edit');
    $('start-folder-wrap').hidden=!(state.make==='edit'&&state.ai!=='app');
    $('start-name-wrap').hidden=state.make!=='profile';
    $('start-today-wrap').hidden=state.make!=='story';
    $('start-tip-wrap').hidden=state.make!=='reel';
    var hint='';
    if(state.make==='profile'&&!$('start-reader').value.trim())hint='プロフィールは「見る人」を書くと、紹介文の空欄が減ります。';
    if(state.make==='feed'&&!$('start-trouble').value.trim())hint='フィードは、見る人の困りごとを入れると、2ページ目の「迷う場面」が具体的になります。';
    $('start-field-hint').textContent=hint;$('start-field-hint').hidden=!hint;
    var isApp=state.ai==='app';
    $('start-edit-card').hidden=state.make!=='edit';
    $('start-edit-agent').hidden=isApp;
    $('start-edit-app').hidden=!(state.make==='edit'&&isApp);
    $('start-make-label').hidden=isApp;$('start-make').hidden=isApp;
    var fx=$('start-make-fixed');fx.hidden=!isApp;fx.textContent='作りたいもの：'+MAKE_NAME[state.make]+'（手順2で選んだもの。変えるときは手順2へ）';
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
    copyRow(host,'3点まとめて返す　'+all,all,true);
    copyRow(host,'形式の案が2つ出たら　おすすめの方で、台本まで出してください。','おすすめの方で、台本まで出してください。',true);
    copyRow(host,'ジャンルを聞かれたら　ジャンルは'+g+'です。','ジャンルは'+g+'です。',true);
    copyRow(host,'見る人を聞かれたら　見る人は、（どんな場面で何に）困っている人です。',(reader()||'見る人は、（どんな場面で何に）困っている人です。'),true);
    copyRow(host,'素材を聞かれたら　使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。','使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。',true);
    copyRow(host,'経験を聞かれたら　'+exp,exp,true);
    copyRow(host,'決まっていないとき　まだ決まっていません。候補を2つ出して、選ばせてください。','まだ決まっていません。候補を2つ出して、選ばせてください。',true);
  }
  var fixes=['冒頭の1行だけ、別の案を3つ出して。','30秒で話せる長さに短くして。','です・ます調の、やわらかい話し方に直して。'];
  fixes.forEach(function(t){copyRow($('start-fixes'),t,t);});
  copyRow($('start-edit-next'),'素材の場所を伝える。台本.txt も同じフォルダへ　素材のフォルダの場所は、'+'（ここにパスを入れる）です。',function(){return '素材のフォルダの場所は、'+($('start-folder').value.trim()||'（ここにパスを入れる）')+' です。';},true);
  copyRow($('start-edit-next'),'表を見てよければ　表でOKです。書き出してください。','表でOKです。書き出してください。',true);
  copyRow($('start-edit-next'),'素材が足りないと言われたら　今ある素材だけで、入点を変えて再利用して、出力/out.mp4 を書き出してください。','今ある素材だけで、入点を変えて再利用して、出力/out.mp4 を書き出してください。',true);
  copyRow($('start-edit-next'),'表が違ったら　○行目だけ、字幕を短くして。','○行目だけ、字幕を短くして。',true);
  /* 編集の指示文（howto.json） */
  var howto=null;
  function loadHowto(){
    if(howto)return Promise.resolve(howto);
    return fetch('assets/reels/howto.json').then(function(r){if(!r.ok)throw Error('x');return r.json();}).then(function(d){howto={};(d.items||[]).forEach(function(x){howto[x.format]=x;});return howto;});
  }
  var agentSt=$('start-agent-status');
  $('start-copy-agent').addEventListener('click',function(){
    var f=$('start-format').value;
    if(!f){agentSt.textContent='先に「形式」を選んでください。';return;}
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
/* 入口の振り分け：ヒーローのボタンで手順1のAIを選んでから「はじめる」へ進む */
(function(){document.querySelectorAll('.route-btn[data-route]').forEach(function(a){a.addEventListener('click',function(){var b=document.querySelector('#start-ai [data-ai="'+a.getAttribute('data-route')+'"]');if(b)b.click();});});})();
/* 自分の動画の型：コピーボタン */
(function(){document.querySelectorAll('.ms-btn[data-copy]').forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-copy'));if(!t)return;var st=b.parentNode.querySelector('.ms-status');var done=function(ok){if(st)st.textContent=ok?'コピーしました。':'コピーできませんでした。上の文を長押し（選択）してコピーしてください。';};var fb=function(){try{t.focus();t.select();return document.execCommand('copy');}catch(e){return false;}};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t.value).then(function(){done(true);},function(){done(fb());});}else done(fb());});});})();
/* 進み具合：各手順でボタンを押したら印を付ける（このブラウザだけに保存） */
(function(){var K='instaAiProgress.v1',done={};try{done=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
function paint(){var n=0;[1,2,3].forEach(function(i){var d=document.querySelector('.sp-dots [data-sp="'+i+'"]');if(d)d.classList.toggle('on',!!done[i]);if(done[i])n++;});var t=document.getElementById('sp-text');if(t)t.textContent=n===3?'3/3　1本目の下書きができました':n+'/3';}
document.querySelectorAll('.start-step').forEach(function(li,idx){li.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(idx===0&&!b.closest('#start-ai'))return;if(idx>0&&!/コピー|ダウンロード/.test(b.textContent))return;done[idx+1]=1;try{localStorage.setItem(K,JSON.stringify(done))}catch(_){}paint();});});paint();var rb=document.getElementById('sp-resume');var steps=document.querySelectorAll('.start-step');var any=done[1]||done[2]||done[3];if(rb&&any&&!(done[1]&&done[2]&&done[3])){var nx=!done[1]?0:!done[2]?1:2;rb.hidden=false;rb.textContent='前回の続きから（手順'+(nx+1)+'）';rb.addEventListener('click',function(){steps[nx].scrollIntoView({behavior:'smooth',block:'start'});});}})();
