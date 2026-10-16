'use strict';
/* 「はじめる」：AI・作りたいものを選ぶと、手順書の入れ方と最初に打つ言葉が切り替わる。全部コピーボタンで使える。 */
(function(){
  var root=document.getElementById('start'); if(!root)return;
  var $=function(id){return document.getElementById(id);};
  var state={ai:'app',make:'reel'};
  var KEY='instaAiStart.v1';
  var FIELDS=['start-genre','start-reader','start-trouble','start-name','start-today','start-format','start-folder','start-tip','start-experience','start-face','start-voice','start-hands'];
  function save(){try{var o={ai:state.ai,make:state.make,f:{}};FIELDS.forEach(function(id){o.f[id]=$(id).value;});localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
  function restore(){try{var o=JSON.parse(localStorage.getItem(KEY)||'null');if(!o)return;if(AI[o.ai])state.ai=o.ai;if(MAKE_NAME[o.make])state.make=o.make;FIELDS.forEach(function(id){if(o.f&&typeof o.f[id]==='string'){var n=$(id);if(n.tagName==='SELECT'){var ok=Array.prototype.some.call(n.options,function(x){return x.value===o.f[id];});if(ok)n.value=o.f[id];}else n.value=o.f[id];}});}catch(e){}}
  var FMT={voiceover:'アフレコ',vlog:'VLOG',talk:'トーク',ranking:'ランキング',comparison:'比較',abstract:'抽象マーケ'};
  var AI={
    cc:{name:'Claude Code',cmd:'claude',skills:'.claude/skills',inst:'curl -fsSL https://claude.ai/install.sh | bash',pathNote:'入れたあとに「~/.local/bin is not in your PATH」と出たら、下の1行を貼って Enter。ターミナルを閉じて開き直せば反映されます。この表示が出なければ、ここは飛ばしてかまいません。下の1行は案内に書かれているものと同じで、ユーザー名を書き換える必要はありません。',pathCmd:'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc',instNote:'Claude Code を入れます。入っていれば飛ばしてください。',loginNote:'claude と打ち、案内どおりにログインします。「Do you trust the files in this folder?」と聞かれたら Enter。ログインが済んだら、左下の control キーと C を2回押して元の画面に戻ってください（command キーではありません）。戻らずに次の行を貼ると、AIへの質問として送られてしまいます。',desc:'この手順は Mac で行います。iPhone から見ている人は「アプリ」を選んでください。Macのターミナルで進めます。A・B・C の3つを上から順に。各行の「貼る場所」を確認し、コピーしてcommand＋Vで貼り、Enterで進めます。CでAIを起動したあとは、AIのチャットへ送ります。',after:'確認できたら、下の言葉を打って、Claude Codeを起動します。.claude は隠しフォルダなので Finder には出ませんが、ちゃんと入っています。'},
    codex:{name:'Codex',cmd:'codex',skills:'~/.agents/skills',inst:'npm install -g @openai/codex',instNote:'Codex を入れます。入っていれば飛ばしてください。',loginNote:'codex と打ち、案内どおりにログインします。「Do you trust the files in this folder?」と聞かれたら Enter。ログインが済んだら、左下の control キーと C を2回押して元の画面に戻ってください（command キーではありません）。戻らずに次の行を貼ると、AIへの質問として送られてしまいます。',pre:'node -v',preNote:'先に、Node.js が入っているか確認します。数字が出なければ、nodejs.org から LTS を入れて、ターミナルを開き直します。',desc:'この手順は Mac で行います。iPhone から見ている人は「アプリ」を選んでください。Macのターミナルで進めます。A・B・C の3つを上から順に。各行の「貼る場所」を確認し、コピーしてcommand＋Vで貼り、Enterで進めます。CでAIを起動したあとは、AIのチャットへ送ります。',after:'確認できたら、このフォルダ（~/insta-ai）のまま、下の言葉を打って、Codexを起動します。.agents は隠しフォルダなので Finder には出ませんが、ちゃんと入っています。古い版の Codex で「インスタAIの手順書」が効かないときだけ、同じ cp の行の ~/.agents/skills を ~/.codex/skills に変えて、もう一度貼ります。Codexがすでに開いていた場合は、一度閉じて、打ち直します。'},
    app:{name:'アプリ',desc:'① 下のボタンでコピー → ② AI（アプリかブラウザ）で新しいチャットを開き、貼ってそのまま送信 → ③ 返事が出たら、手順3へ。長い文なので、貼ると「ファイル」のように表示されることがあります。そのまま送信して大丈夫です。'}
  };
  function copyText(t){
    function fallback(){try{var x=document.createElement('textarea');x.value=t;x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();var ok=document.execCommand('copy');x.remove();return ok;}catch(e){return false;}}
    if(!navigator.clipboard||!navigator.clipboard.writeText)return Promise.resolve(fallback());
    return new Promise(function(resolve){var settled=false;var timer=setTimeout(function(){if(!settled){settled=true;resolve(false);}},2500);
      navigator.clipboard.writeText(t).then(function(){if(settled)return;settled=true;clearTimeout(timer);resolve(true);},function(){if(settled)return;settled=true;clearTimeout(timer);resolve(fallback());});
    });
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
  function copyRow(host,label,text,split,destination){
    var row=el('div','start-copyrow');
    var s=label?label:text,i=s.indexOf('　'),sp=el('span','start-copytext');
    if(i>0&&/^[ -~]/.test(s.slice(i+1))){sp.appendChild(el('b','start-copylabel',s.slice(0,i)));sp.appendChild(el('code','start-cmd',s.slice(i+1)));}
    else if(split&&i>0){sp.appendChild(el('b','start-copylabel',s.slice(0,i)));sp.appendChild(el('span','start-copybody',s.slice(i+1)));}
    else if(/^[\x20-\x7e\n]+$/.test(s)){sp.appendChild(el('code','start-cmd',s));}
    else sp.textContent=s;
    row.appendChild(sp);row.appendChild(el('small','start-note copy-destination','貼る場所：'+(destination==='terminal'?'ターミナル（AIを起動する前の入力欄）':'AIのチャットの入力欄')));
    var b=el('button','start-btn','コピー');b.type='button';
    var st=el('span','start-status','');st.setAttribute('role','status');
    bindCopy(b,function(){return typeof text==='function'?text():text;},st,function(){
      var manual=row.querySelector('textarea');if(!manual){manual=el('textarea','start-manual');manual.readOnly=true;manual.rows=5;manual.setAttribute('aria-label','手でコピーする全文');row.appendChild(manual);}
      manual.value=typeof text==='function'?text():text;manual.focus();manual.select();st.textContent='下の全文を選択しました。スマホは長押ししてコピー、PCはcommand＋C（WindowsはCtrl＋C）。';
    });
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
    if(!g&&state.make!=='edit')return P+'発信テーマがまだ決まっていません。まず、私が普段していることや実際に試したことを1つだけ聞いて、テーマを2案に絞ってください。選んだテーマで'+MAKE_NAME[state.make]+'を作りたいです。実績や体験は作らないでください。';
    switch(state.make){
      case 'reel': return P+gs+fl+'リール台本を1本作って。'+reader()+tipSent()+(f?'':'形式を2案、理由つきで出して。私が選んだら、')+'質問せずに台本まで出して。私の体験談は作らず、見る人への問いかけで始めて。'+(f==='vlog'?'出来事は撮影予定として仮に置き、実際に撮った順に差し替える箇所も書いて。':'')+'分からないところは【要確認】と書いて仮に入れて。';
      case 'profile': return P+gs+'プロフィールの表示名と紹介文を作って。'+nameSent()+($('start-experience').value.trim()?'実際に担当した作業・経験は「'+$('start-experience').value.trim()+'」です。':'実績の数字はまだありません。')+'与えていない売上・人数・資格・無料特典は作らないで。'+TAIL('案');
      case 'feed': return P+gs+'フィード投稿を、1ページずつの原稿で作って。'+TAIL('原稿');
      case 'story': var td=$('start-today').value.trim(); return P+gs+'ストーリーを、1枚ずつの本文と使う素材で作って。'+(td?'今日あったことは「'+td+'」です。':'出来事は（今日あったこと）と仮置きして。')+TAIL('本文');
      default:
        var fo=$('start-folder').value.trim();
        return P+gs+reader()+(f?'形式は'+FMT[f]+'です。':'')+'動画編集を進めて。'+(state.ai==='app'?'':'作業フォルダは ~/insta-ai です。完成動画は ~/insta-ai/出力/out.mp4 に出してください。')+(f?'':'形式は素材を見て決めて。')+(state.ai==='app'?'撮った素材は、ファイル名と何が映っているかを文で伝えます。':(fo?'撮った素材は '+fo+' に入っています。':'撮った素材の場所は、あとで伝えます。'))+'まず編集指示書の表だけ見せて、私がOKと言うまで進めないで。';
    }
  }
  var OUT={
    reel:'形式を相談にした場合は、先に案が2つ出ます。下の「形式の案が2つ出たら」を返してください。\n出てくるもの：\n・日付とタイトル\n・台本の本文\n・撮影メモ（話す一文・映すもの・撮れるか要確認か）',
    profile:'出てくるもの：表示名と紹介文の案と、選んだ理由。（ ）や「要確認」の括弧は、プロフィール欄へ貼る前に書き換えるか消します。',
    feed:'出てくるもの：ページごとの見出し・本文・配置。',
    story:'出てくるもの：1枚ごとの本文・使う素材・その画面の役割。材料が1つの日は1枚で終わります。枚数を増やすには、出来事をもう1つか、見る人の困りごとを入れてください。「今日あったこと」を空欄にすると、本文の（ ）は自分で書き換える場所になります。',
    edit:'出てくるもの：時間・声・映像・差し込み・字幕の表（編集指示書）。'
  };
  var MAKE_NAME={reel:'リールの台本',profile:'プロフィール',feed:'フィード投稿',story:'ストーリー',edit:'動画編集'};
  function appKey(){var f=$('start-format').value;if(state.make==='reel')return f?'reel-'+f:'reel-any';if(state.make==='edit')return f?'edit-'+f:'edit-any';return state.make;}
  function appName(){var f=$('start-format').value;return MAKE_NAME[state.make]+((state.make==='reel'||state.make==='edit')&&f?'・'+FMT[f]:'');}
  var formatHome=$('start-format-wrap').parentNode;
  function renderS2(){
    var a=AI[state.ai], host=$('start-s2-actions'); host.replaceChildren(); $('start-s2-status').textContent='';
    $('start-s2-desc').textContent=a.desc;
    $('start-s2-make').hidden=state.ai!=='app';
    var fmt=$('start-format-wrap');if(state.ai==='app'){$('start-s2-make').appendChild(fmt);}else{formatHome.appendChild(fmt);}
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
      var main=mk(key.indexOf('reel-')===0?key+'-lite':key,'手順書をコピー',nm+'用','start-btn primary');
      host.appendChild(el('p','start-note','初めての方は、このボタンだけで進められます。'));
      var links=el('div','ai-open-links');
      [['ChatGPTを開く','https://chatgpt.com/'],['Claudeを開く','https://claude.ai/']].forEach(function(x){var a=el('a','start-btn',x[0]+' ↗');a.href=x[1];a.target='_blank';a.rel='noopener';links.appendChild(a);});
      host.appendChild(links);
      host.appendChild(el('p','start-note','別のタブが開きます。新しいチャットの入力欄に貼ってそのまま送信し、返事が出たらこのページのタブに戻ります。すでにアプリを使っている方は、いつものアプリを開いてください。'));
      var help=el('details','start-more');help.appendChild(el('summary',null,'コピーした後の貼り方・戻り方'));
      help.appendChild(el('p','start-note','スマホ：AIの入力欄を長押し →「ペースト」または「貼り付け」→ 送信。パソコン：入力欄をクリック → Macはcommand＋V、WindowsはCtrl＋V → 送信。ブラウザのタブ一覧からインスタAIに戻ります。'));
      host.appendChild(help);
      var full=el('details','start-more');full.id='start-full-preview';full.appendChild(el('summary',null,'送る手順書の全文を確認する'));var fullnote=el('p','start-note','ここで送るのは手順書の文章だけです。');var fulltext=el('textarea','start-manual');fulltext.readOnly=true;fulltext.rows=8;fulltext.setAttribute('aria-label','送る手順書の全文');full.appendChild(fullnote);full.appendChild(fulltext);full.addEventListener('toggle',function(){if(!full.open)return;var k=key.indexOf('reel-')===0?key+'-lite':key;window.instaAiSkillText(k).then(function(t){fulltext.value=t;}).catch(function(){fullnote.textContent='読み込めませんでした。閉じて開くと再試行できます。';});});host.appendChild(full);
      var more=el('details','start-more');more.appendChild(el('summary',null,'慣れてきたら：詳しい手順書を使う'));
      more.appendChild(el('p','start-note','まず1本作ってからで大丈夫です。詳しい版は参照資料を追加します。全部入りは、複数の用途をまとめて使う方向けです。'));
      if(key.indexOf('reel-')===0)more.appendChild(mk(key,'くわしい版をコピー',nm+'用','start-btn'));
      more.appendChild(mk('all','手順書を全部コピー','全部入り','start-btn'));host.appendChild(more);
    }else{
      var note=function(t){host.appendChild(el('p','start-note',t));};
      var ok=function(t){host.appendChild(el('p','start-note start-ok','【成功の目安】'+t));};
      var warn=function(t){host.appendChild(el('p','start-note start-warn',t));};
      var head=function(t){var h=el('h4','start-stage',t);var k=t.charAt(0);if(k==='A'||k==='B'||k==='C')h.id='start-s2-'+k.toLowerCase();host.appendChild(h);};
      var row=function(label,text,destination){var r=el('div','start-copyrows');copyRow(r,label,text,false,destination||'terminal');host.appendChild(r);};
      var help=function(title,items){var d=el('details','start-more start-help');d.appendChild(el('summary',null,title));items.forEach(function(it){var p=el('p','start-note');p.appendChild(el('b',null,it[0]+'：'));p.appendChild(document.createTextNode(it[1]));d.appendChild(p);if(it[2]){var r=el('div','start-copyrows');copyRow(r,null,it[2],false,'terminal');d.appendChild(r);}});host.appendChild(d);};
      var isCodex=state.ai==='codex';
      var quick=el('details','start-more start-quick');quick.appendChild(el('summary',null,'慣れている人向け：コマンドだけ見る'));host.appendChild(quick);
      note(isCodex?'Codex は ChatGPT の有料プラン（Plus 以上）か、OpenAI の API キーで使えます。':'Claude Code は Claude の有料プラン（Pro 以上）か、Anthropic の API キーで使えます。無料プランでは使えません。');
      head('A　ターミナルを開いて、'+a.name+'を入れる（初回だけ）');
      note('command＋スペースで「ターミナル」と打って Enter。文字だけの画面が開きます。ここでは、このページのコマンドだけをコピーして使います。すでに '+a.name+' が入っている人は、B へ進みます。');
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
      head('B　手順書（zip）を受け取って、入れる');note('貼る場所はAIのチャットではなく、ターミナルのコマンド入力欄です。すでにAIが起動していて区別できないときは、ターミナルでcommand＋Nを押して、新しいウインドウにBを貼ってください。');
      note('下の1行で、このページの配布パックを新しく取得し、手順書を置きます。前に入れた手順書があれば、バックアップ用フォルダに残します。zipを手元に保存したい場合だけ、ダウンロードボタンを使ってください。');
      var z=el('a','start-btn primary','全部入りzipをダウンロード');z.href='downloads/insta-ai-all.zip';z.setAttribute('download','');host.appendChild(z);
      var sk=isCodex?'~/.agents/skills':'.claude/skills';var ZURL=new URL('downloads/insta-ai-all.zip',location.href).href;
      var put='(set -eu; mkdir -p ~/insta-ai; cd ~/insta-ai; D=$(mktemp -d "$PWD/setup.XXXXXX"); curl -fLSs "'+ZURL+'" -o "$D/pack.zip"; unzip -q "$D/pack.zip" -d "$D/unpacked"; test -s "$D/unpacked/insta-ai-create/SKILL.md"; test -d "$D/unpacked/insta-ai-create/references"; S='+sk+'; mkdir -p "$S"; if [ -e "$S/insta-ai-create" ]; then B=$(mktemp -d "$S/insta-ai-backup.XXXXXX"); mv "$S/insta-ai-create" "$B/"; fi; cp -R "$D/unpacked/insta-ai-create" "$S/"; test -s "$S/insta-ai-create/SKILL.md"; sh "$D/unpacked/insta-ai-safety/apply.sh"; echo "insta-ai-create の配置を確認しました"; shasum -a 256 "$S/insta-ai-create/SKILL.md")';
      note('下の「コピー」を押して、ターミナルに貼って Enter。取得・展開・必須ファイルの確認を行います。エラーが出た場合は、その内容を確認してから先へ進みます。');
      row('入れる（長いので中身は省略しています）',put);
      ok('「安全設定：OK」「insta-ai-create の配置を確認しました」と、ファイル確認用の英数字が出れば配置完了です。作業フォルダ内で進めるためのルールと設定ファイルも配置します。「安全設定：OK」は配置完了の表示です。有効な権限は、起動したAIの権限画面でも確認してください。');
      help('うまくいかないとき',[
        ['「curl」「unzip」のエラーが出た','取得または展開に失敗しています。通信を確認し、エラーの文をAIに伝えてください。配置完了の表示が出るまではCへ進みません。'],
        ['前の手順書に戻したい','skillsフォルダ内の insta-ai-backup で始まるフォルダに前の手順書が残っています。戻し方はAIに相談してください。']].concat(isCodex?[['古い版の Codex で「スキルが見つからない」と出た','次の1行で、古い置き場所にもコピーします。','mkdir -p ~/.codex/skills && cp -R ~/.agents/skills/insta-ai-create ~/.codex/skills/']]:[]));
      head('C　'+a.name+'を起動して、ログインする');
      var run='cd ~/insta-ai && '+a.cmd;
      row('起動　'+run,run);
      warn('動画の書き出しで「ffmpeg がない」と言われたら：AI に「ffmpeg を Homebrew で入れて」と頼みます。Mac のパスワードを聞かれたら入力して Enter（画面には出ません）。');
      note('初回はログインが必要です。ブラウザが開いたら、いつものアカウントで許可してください。英語の確認が出たら、表示内容を読んで進めます。分からない場合は、別途ChatGPTやClaudeの新しいチャットを開き、表示文の意味を確認してください。確認後、このターミナルへ戻ります。パスワードや認証コードは貼りません。');
      var chk='インスタAIの手順書（insta-ai-create）のSKILL.mdと、そこから参照する資料を1つ実際に読んで。読めたファイル名と、参照資料の見出しを1つ挙げて。読めない場合はその場所を教えて。';
      note('ここからは起動したAIのチャットに貼ってEnterで送信します。Bのコマンド入力欄とは違います。');
      row('確認　'+chk,chk,'ai');
      ok('SKILL.mdと参照資料のファイル名・見出しが返り、配布資料と一致していれば手順3へ進みます。');
      warn('「読めています」と返らないとき：'+(isCodex?'「~/.agents/skills/insta-ai-create/SKILL.md を読んでから進めて」':'「.claude/skills/insta-ai-create/SKILL.md を読んでから進めて」')+'と貼れば、ファイルを直接読ませて進められます。');
      help('うまくいかないとき',[
        ['「読めていません」と返ってきた','control＋C を2回押して AI を閉じ、B の1行をもう一度貼ってから、C の「起動」を貼り直します。'],
        ['動画の書き出しで「ffmpeg がない」と言われた','AI に「ffmpeg を Homebrew で入れて」と頼めば入れてくれます。途中で Mac のパスワードを聞かれたら、入力して Enter（画面には表示されません）。'],
        ['次の日に続きをやる','ターミナルを開いて、C の「起動」を貼るだけです。']]);
      (function(){var qn=el('p','start-note','1〜3はターミナル、4は起動したAIの入力欄へ貼ります。2の行でzipも取得します。');quick.appendChild(qn);quick.appendChild(el('p','start-note start-warn','「読めています」と返らないとき：'+(isCodex?'「~/.agents/skills/insta-ai-create/SKILL.md を読んでから進めて」':'「.claude/skills/insta-ai-create/SKILL.md を読んでから進めて」')+'と貼ります。ffmpeg がないと言われたら「ffmpeg を Homebrew で入れて」と頼みます。'));
        [['1 入れる',inst],['2 zip を取って手順書を置く',put],['3 起動',run],['4 確認（AIに貼る）',chk]].forEach(function(x){var r=el('div','start-copyrows');copyRow(r,x[0],x[1],false,x[1]===chk?'ai':'terminal');quick.appendChild(r);});})();
    }
  }
  function renderS3(){
    $('start-prompt').value=prompt();if(window.__fitPrompt)window.__fitPrompt();
    var out=OUT[state.make];
    if(state.make==='edit'&&state.ai==='app')out='アプリで出るのは編集の段取り表までです。表を見ながら CapCut などで並べてください。書き出しまで自動で進むのは Claude Code と Codex です。';
    $('start-s3-out').textContent=out;
    $('start-format-wrap').hidden=!(state.make==='reel'||state.make==='edit');
    $('start-folder-wrap').hidden=!(state.make==='edit'&&state.ai!=='app');
    $('start-name-wrap').hidden=state.make!=='profile';$('start-experience-wrap').hidden=state.make!=='profile';
    $('start-today-wrap').hidden=state.make!=='story';
    $('start-tip-wrap').hidden=state.make!=='reel';
    var hint='';
    if(state.make==='profile'&&!$('start-reader').value.trim())hint='プロフィールは「見る人」を書くと具体的になります。実績の数字がなくても、実際に担当した作業で進められます。';
    if(state.make==='feed'&&!$('start-trouble').value.trim())hint='フィードは、見る人の困りごとを入れると、2ページ目の「迷う場面」が具体的になります。';
    $('start-field-hint').textContent=hint;$('start-field-hint').hidden=!hint;
    var isApp=state.ai==='app';
    $('start-edit-card').hidden=state.make!=='edit';
    $('start-edit-agent').hidden=isApp;
    $('start-edit-app').hidden=!(state.make==='edit'&&isApp);
    $('start-make-label').hidden=isApp;$('start-make').hidden=isApp;
    var fx=$('start-make-fixed');fx.hidden=!isApp;fx.textContent='作りたいもの：'+MAKE_NAME[state.make]+'（手順2で選んだもの。変えるときは手順2へ）';
    $('start-s2-editnote').hidden=!(isApp&&state.make==='edit');
    $('start-s3-phone').hidden=!isApp;
    $('start-s3-status').textContent='';renderFinish();
  }
  function setPressed(groupId,attr,val){
    $(groupId).querySelectorAll('['+attr+']').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute(attr)===val?'true':'false');});
  }
  function setMake(){save();setPressed('start-make','data-make',state.make);setPressed('start-make2','data-make',state.make);if(state.ai==='app')renderS2();renderS3();}
  $('start-ai').addEventListener('click',function(e){var b=e.target.closest('[data-ai]');if(!b)return;var changed=state.ai!==b.getAttribute('data-ai');state.ai=b.getAttribute('data-ai');if(changed)document.dispatchEvent(new Event('insta-ai-selection-change'));setPressed('start-ai','data-ai',state.ai);save();renderS2();renderS3();});
  $('start-make').addEventListener('click',function(e){var b=e.target.closest('[data-make]');if(!b)return;var changed=state.make!==b.getAttribute('data-make');state.make=b.getAttribute('data-make');if(changed)document.dispatchEvent(new Event('insta-ai-selection-change'));setMake();});
  $('start-make2').addEventListener('click',function(e){var b=e.target.closest('[data-make]');if(!b)return;var changed=state.make!==b.getAttribute('data-make');state.make=b.getAttribute('data-make');if(changed)document.dispatchEvent(new Event('insta-ai-selection-change'));setMake();});
  ['start-genre','start-reader','start-trouble','start-name','start-today','start-format','start-folder','start-tip','start-experience','start-face','start-voice','start-hands'].forEach(function(id){$(id).addEventListener('input',function(){save();renderS3();renderAnswers();});$(id).addEventListener('change',function(){save();renderS3();});});
  $('start-format').addEventListener('change',function(){if(state.ai==='app')renderS2();document.dispatchEvent(new Event('insta-ai-selection-change'));});
  bindCopy($('start-copy-prompt'),function(){return $('start-prompt').value;},$('start-s3-status'),function(){$('start-prompt').focus();$('start-prompt').select();});

  function renderFinish(){
    var h=$('start-finish-content');if(!h)return;h.replaceChildren();
    var tasks={reel:['【要確認】・数字・体験を自分の事実に直す','声に出して読み、撮る映像を決める','撮影後、手順2（Macでは手順3）で動画編集を選ぶ'],profile:['未提供の実績や特典が入っていないか確かめる','表示名と紹介文を1案選び、（ ）を埋める','Instagramのプロフィールへ貼り、表示を確認する'],feed:['各ページの原稿の事実を確かめる','原稿を画像制作ツールで1枚ずつ配置する','スマホで文字を読み、順番を確認して保存する'],story:['自分に起きた出来事と合うか確かめる','原稿を写真・動画に載せる','文字の読める時間を確認して投稿する'],edit:state.ai==='app'?['編集アプリへ素材を読み込み、段取り表の順に並べる','声・字幕を合わせて動画を書き出す','音声、字幕、映像、末尾を全編再生して確認する']:['編集指示書の素材名・字幕・順番を確かめる','表でOKなら書き出しを頼み、完了の返事を待つ','動画を開き、音声・字幕・映像・末尾を全編再生する']};
    var list=el('ol','start-finish-list');tasks[state.make].forEach(function(t){list.appendChild(el('li',null,t));});h.appendChild(list);
    if(state.make==='edit'&&state.ai!=='app'){
      h.appendChild(el('p','start-note','完成ファイルの標準の場所は ~/insta-ai/出力/out.mp4 です。Finderでcommand＋shift＋Gを押し、~/insta-ai/出力 を貼ってEnter。out.mp4をダブルクリックします。別の保存先を指定したときは、AIが返した場所を開きます。'));
      copyRow(h,'完成ファイルが見つからない　書き出した動画の絶対パスと、ファイルが存在するか確認して教えて。','書き出した動画の絶対パスと、ファイルが存在するか確認して教えて。',true);
    }
    copyRow(h,'直す箇所が見つかったら　（場所・秒数）の（気になる点）だけ直して。未提供の事実は足さず、元の版を残して別名で保存して。','（場所・秒数）の（気になる点）だけ直して。未提供の事実は足さず、元の版を残して別名で保存して。',true);
    h.appendChild(el('p','start-note','修正後は、直したところと前後をもう一度確認します。3/3になった後も、この確認を行ってください。'));
  }
  copyRow($('start-shoot-copy'),'撮れる条件をAIへ送る',function(){return '撮れる条件で形式を選んでください。顔出しは'+$('start-face').value+'、声の録音は'+$('start-voice').value+'、手元の撮影は'+$('start-hands').value+'です。今ある条件で作れる案を1つおすすめし、用意する素材を示して台本まで進めてください。';});
  $('start-recover-copy').addEventListener('click',async function(){
    var st=$('start-recover-status'),box=$('start-recover-manual'),key=appKey();if(key.indexOf('reel-')===0)key+='-lite';st.textContent='再開用の文章を準備しています…';
    var request=prompt(), selection=state.ai+'|'+state.make;try{var skill=await window.instaAiSkillText(key);if(request!==prompt()||selection!==state.ai+'|'+state.make){st.textContent='入力が変わりました。もう一度コピーしてください。';return;}var t=skill+'\n\n## 今回の依頼\n'+request;box.value=t;var ok=await copyText(t);box.hidden=ok;st.textContent=ok?'コピーしました。新しいAIのチャットへ貼ってそのまま送信してください。以前の返事は含まれません。':'下の全文を選択してコピーし、新しいAIのチャットへ貼ってそのまま送信してください。';if(!ok){box.focus();box.select();}}catch(e){st.textContent='手順書を読み込めませんでした。通信を確認してもう一度押してください。';}
  });

  /* 質問への返し方 */
  function renderAnswers(){
    var host=$('start-answers');host.replaceChildren();var g=genre()||'（あなたのジャンル）';
    var exp='私が実際に試したことは（ここに書く）です。ない場合は、見る人への呼びかけで作ってください。';
    var all='ジャンルは'+g+'です。'+(reader()||'見る人は、（どんな場面で何に）困っている人です。')+'使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。'+exp;
    copyRow(host,'まとめて返す　'+all,all,true);
    copyRow(host,'形式の案が2つ出たら　おすすめの方で、台本まで出してください。','おすすめの方で、台本まで出してください。',true);
    copyRow(host,'ジャンルを聞かれたら　ジャンルは'+g+'です。','ジャンルは'+g+'です。',true);
    copyRow(host,'見る人を聞かれたら　見る人は、（どんな場面で何に）困っている人です。',(reader()||'見る人は、（どんな場面で何に）困っている人です。'),true);
    copyRow(host,'素材を聞かれたら　使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。','使える素材は、スマホで撮れる手元の動画と写真です。ないものは作らないでください。',true);
    copyRow(host,'経験を聞かれたら　'+exp,exp,true);
    copyRow(host,'決まっていないとき　まだ決まっていません。候補を2つ出して、選ばせてください。','まだ決まっていません。候補を2つ出して、選ばせてください。',true);
  }
  var fixes=['冒頭の1行だけ、別の案を3つ出して。','30秒で話せる長さに短くして。','です・ます調の、やわらかい話し方に直して。','（場所）の（気になる点）だけ直して。それ以外は変えず、自分が伝えていない事実は足さないで。'];
  fixes.forEach(function(t){copyRow($('start-fixes'),t,t);});
  copyRow($('start-material-prep'),'素材フォルダを作って開く','mkdir -p ~/insta-ai/素材 && open ~/insta-ai/素材',false,'terminal');
  copyRow($('start-material-prep'),'素材を確認してもらう','~/insta-ai/素材 のファイル一覧と、読み取れる映像・声・台本を確認して教えて。不足するものは質問し、まだ編集を始めないで。');
  copyRow($('start-edit-next'),'素材の場所を伝える。台本.txt も同じフォルダへ　素材のフォルダの場所は、'+'（ここにパスを入れる）です。',function(){return '素材のフォルダの場所は、'+($('start-folder').value.trim()||'（ここにパスを入れる）')+' です。';},true);
  copyRow($('start-edit-next'),'表を見てよければ　表でOKです。書き出してください。','表でOKです。書き出してください。',true);
  copyRow($('start-edit-next'),'素材が足りないと言われたら　今ある素材で成立する短い構成を提案して。使い回す場合はその箇所を示し、修正した表を確認するまで書き出さないで。','今ある素材で成立する短い構成を提案して。使い回す場合はその箇所を示し、修正した表を確認するまで書き出さないで。',true);
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
    if(!f){var t='インスタAIの手順書で、素材の一覧を確認し、撮れている映像と声から合う形式を2案に絞ってください。素材の場所は '+($('start-folder').value.trim()||'未指定なので最初に聞いてください')+' です。私が形式を選んだら、その形式の参照資料を読んで編集指示書の表まで出し、OKするまで書き出さないでください。';copyText(t).then(function(ok){agentSt.textContent=ok?'形式を相談する指示をコピーしました。同じAIのチャットへ送り、案を選んでください。決まった形式を上の欄でも選び直せます。':'下の全文を選んでコピーしてください。';$('start-agent-manual').value=t;$('start-agent-manual').hidden=ok;});return;}
    var btn=$('start-copy-agent');
    loadHowto().then(function(h){
      var p=h[f]&&h[f].agent_prompt;
      if(!p){agentSt.textContent='この形式の指示文を読み込めませんでした。';return;}
      if(f!==$('start-format').value){agentSt.textContent='形式が変わりました。もう一度コピーしてください。';return;}return copyText(p).then(function(ok){$('start-agent-manual').value=p;$('start-agent-manual').hidden=ok;agentSt.textContent=ok?'コピーしました（'+FMT[f]+'）。AIのチャットに貼って、そのまま送信してください。':'コピーできませんでした。下の全文を選んでコピーしてください。';});
    }).catch(function(){agentSt.textContent='読み込めませんでした。ページを開き直してください。';});
  });
  restore();setPressed('start-ai','data-ai',state.ai);setPressed('start-make','data-make',state.make);setPressed('start-make2','data-make',state.make);
  renderS2();renderS3();renderAnswers();
})();
/* 入口の振り分け：ヒーローのボタンで手順1のAIを選んでから「はじめる」へ進む */
(function(){document.querySelectorAll('.route-btn[data-route]').forEach(function(a){a.addEventListener('click',function(){var b=document.querySelector('#start-ai [data-ai="'+a.getAttribute('data-route')+'"]');if(b)b.click();});});})();
/* 自分の動画の型：コピーボタン */
(function(){document.querySelectorAll('.ms-btn[data-copy]').forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-copy'));if(!t)return;var st=b.parentNode.querySelector('.ms-status');var done=function(ok){if(st)st.textContent=ok?'コピーしました。':'コピーできませんでした。上の文を長押し（選択）してコピーしてください。';};var fb=function(){try{t.focus();t.select();return document.execCommand('copy');}catch(e){return false;}};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t.value).then(function(){done(true);},function(){done(fb());});}else done(fb());});});})();
/* 進み具合は利用者の確認で記録。コピー失敗やダウンロードを完了にしない。 */
(function(){
  var K='instaAiProgress.v2',done={},steps=document.querySelectorAll('.start-step');
  try{done=JSON.parse(localStorage.getItem(K)||'{}')||{};}catch(e){}
  function paint(){var n=0;[1,2,3].forEach(function(i){var on=done[i]===1,d=document.querySelector('.sp-dots [data-sp="'+i+'"]');if(d)d.classList.toggle('on',on);if(on)n++;});
    document.getElementById('sp-text').textContent=n+'/3'+(n===3?'　最初の回答を受け取りました':'');
    document.querySelectorAll('[data-progress-confirm]').forEach(function(b){var on=done[b.dataset.progressConfirm]===1;b.setAttribute('aria-pressed',String(on));b.textContent=(on?'✓ ':'')+b.dataset.label;});
    document.querySelectorAll('.sp-inline').forEach(function(el){var dots='';[1,2,3].forEach(function(i){dots+='<i class="'+(done[i]===1?'on':'')+'"></i>';});el.innerHTML='<span class="sp-inline-dots">'+dots+'</span>進み具合 '+n+'/3　'+(n===3?'最初の回答を受け取りました':'あと'+(3-n)+'つ（次は手順'+(n+1)+'）');});
    var rb=document.getElementById('sp-resume');if(rb){rb.hidden=n===0||n===3;var nx=done[1]!==1?0:done[2]!==1?1:2;rb.textContent='続きから（手順'+(nx+1)+'）';rb.onclick=function(){steps[nx].scrollIntoView({block:'start',behavior:'smooth'});};}}
  function save(){try{localStorage.setItem(K,JSON.stringify(done));}catch(e){}paint();}
  [['手順書を送信し、AIの返事を確認した',2],['台本・原稿・編集指示書を受け取り、要確認を確かめた',3]].forEach(function(x){var b=document.createElement('button');b.type='button';b.className='sp-confirm';b.dataset.progressConfirm=x[1];b.dataset.label=x[0];b.addEventListener('click',function(){done[1]=1;done[x[1]]=done[x[1]]===1?0:1;save();});var wrap=document.createElement('p');wrap.className='sp-confirm-wrap';wrap.appendChild(b);var il=document.createElement('span');il.className='sp-inline';il.setAttribute('aria-live','polite');wrap.appendChild(il);steps[x[1]-1].querySelector('div').appendChild(wrap);});
  document.addEventListener('insta-ai-selection-change',function(){
    var had=done[2]===1||done[3]===1;done={1:1};save();var note=document.getElementById('start-selection-note');
    if(note){note.hidden=!had;note.textContent='選ぶ内容が変わりました。手順2の手順書をコピーし直してAIに送り、そのあと手順3の言葉を送ってください。';}
  });
  document.getElementById('start-ai').addEventListener('click',function(e){if(e.target.closest('[data-ai]')){done[1]=1;save();}});
  paint();
})();
;(function(){var d=document.getElementById('howto-mac');if(d&&window.matchMedia('(min-width:761px)').matches)d.open=true;
document.addEventListener('click',function(e){var a=e.target.closest('.howto-alt');if(!a)return;var b=document.querySelector('.hx-route .route-btn[data-route="'+a.getAttribute('data-route')+'"]');if(b){e.preventDefault();b.click();var t=a.getAttribute('data-target');setTimeout(function(){var g=t&&document.getElementById(t);if(g)g.scrollIntoView({block:'start'});},120);}});})();
;(function(){function fit(t){if(!t||!t.offsetParent)return;t.style.height='auto';t.style.height=(t.scrollHeight+4)+'px';}window.__fitPrompt=function(){fit(document.getElementById('start-prompt'));all();};
function all(){fit(document.getElementById('start-prompt'));fit(document.getElementById('ms-mk'));document.querySelectorAll('#mystyle .ms-text').forEach(fit);}
var t=document.getElementById('start-prompt');if(t){new MutationObserver(all).observe(t,{childList:true,characterData:true,subtree:true});['input','change','click'].forEach(function(ev){document.addEventListener(ev,function(){setTimeout(all,30);});});}
window.addEventListener('resize',all);window.addEventListener('load',all);setTimeout(all,300);})();
