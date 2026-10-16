'use strict';
// 「見本｜AI再現」ギャラリー。assets/reels/manifest.json と howto.json を読んで描く。
// データが無い形式はカードを出さない（作例を捏造しない）。
(function(){
  const root=document.getElementById('reels-gallery'); if(!root) return;
  const ORDER=['ranking','voiceover','vlog','talk','abstract','comparison'];
  const LABEL={ranking:'ランキング',voiceover:'アフレコ',vlog:'VLOG',talk:'トーク',abstract:'抽象マーケ',comparison:'比較'};
  const FOR={ranking:'ツールや商品、やり方をいくつか紹介して、順位を付けたいとき。',voiceover:'顔を出さずに、あとから録った声と生活の映像で作りたいとき。',talk:'自分が話している映像に、大きな字幕や図を入れたいとき。',abstract:'身近な題材から反応される理由を説明して、実績の画像も入れたいとき。',comparison:'2つの考え方や2人を並べて、違いを見せたいとき。',vlog:'朝から外出までの日常を撮って、話につなげたいとき。'};
  const base='assets/reels/';
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  const fmt1=v=>v==null?'—':(Math.round(v*100)/100).toFixed(2);

  function video(side,item,label){
    const box=el('figure','reel-side');
    const frame=el('div','reel-vframe');
    const v=document.createElement('video');
    v.src=base+side.file; v.poster=base+side.poster; v.controls=false; v.playsInline=true; v.preload='metadata';
    v.setAttribute('aria-label',label+'：'+item.title);
    const b=el('button','howto-play reel-play','▶'); b.type='button'; b.setAttribute('aria-label',label+'を再生');
    const status=el('p','reel-note'); status.hidden=true; status.setAttribute('role','status');
    let attempt=0;
    const failed=()=>{status.textContent='動画を再生できませんでした。「再試行」を押してください。';status.hidden=false;b.textContent='再試行';b.setAttribute('aria-label',label+'を再試行');b.hidden=false;};
    const play=async()=>{
      const request=++attempt;
      try{if(v.error)v.load();await v.play();}
      catch(error){if(request===attempt&&error.name!=='AbortError')failed();}
    };
    // 初回再生後は、停止中も標準の操作バーを残す。
    v.addEventListener('play',()=>{v.controls=true;b.hidden=true;});
    v.addEventListener('playing',()=>{++attempt;v.controls=true;b.hidden=true;status.hidden=true;status.textContent='';});
    v.addEventListener('error',()=>{++attempt;failed();});
    b.addEventListener('click',play);
    v.addEventListener('click',()=>{if(!v.controls)play();});
    frame.appendChild(v); frame.appendChild(b); box.appendChild(frame); box.appendChild(status);
    const cap=el('figcaption'); cap.appendChild(el('span','reel-tag',label));
    if(side.duration_sec) cap.appendChild(el('small',null,Math.round(side.duration_sec)+'秒'));
    box.appendChild(cap); return box;
  }

  function qcLine(item){
    const q=item.qc; const wrap=el('div','reel-qc');
    if(q){
      const ok=!!(item.stage&&item.stage.indexOf('見本と同等')===0);
      if(!item.stage) wrap.appendChild(el('p','reel-qc-main',ok?'見本とほぼ同じ（数値で確認）':'差が残っている場面を修正中（数値で確認）'));
      const parts=['全フレーム（1コマずつ）の平均差 '+fmt1(q.mad_mean),'最大 '+fmt1(q.mad_max),'差が5を超えたコマ '+q.frames_over_5+' / '+q.frames];
      if(q.lufs_ref!=null&&q.lufs_ai!=null) parts.push('音の大きさ（LUFS） '+fmt1(q.lufs_ref)+' → '+fmt1(q.lufs_ai));
      const d=el('details','reel-qc-detail'); d.appendChild(el('summary',null,'くわしい数値'));
      const p=el('p',null,parts.join(' ・ '));
      p.appendChild(el('small',null,'見本と同じ色変換で全フレームを比べた実測値。差は0〜255で、平均差も最大（いちばん差が大きいコマ）も、0に近いほど見本に近い。「5を超えたコマ」は差が大きめのコマの数で、少ないほど近い（5は目安の線）。音は、2つの数字が同じなら音量がそろっている。'));
      d.appendChild(p); wrap.appendChild(d);
    }else if(item.approved){ wrap.appendChild(el('p','reel-qc-main','制作側の確認済み（数値比較なし）')); }
    else{ wrap.appendChild(el('p','reel-qc-main','数値の比較は行っていません')); }
    return wrap;
  }

  function copyText(t){
    const fb=()=>{try{const x=document.createElement('textarea');x.value=t;x.style.position='fixed';x.style.opacity='0';document.body.appendChild(x);x.select();const ok=document.execCommand('copy');x.remove();return ok;}catch(e){return false;}};
    if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(()=>true,()=>fb());
    return Promise.resolve(fb());
  }
  function howtoBlock(h,format){
    const d=el('details','reel-howto'); const s=el('summary',null,'この動画の作り方'); const sp=el('span',null,'+'); sp.setAttribute('aria-hidden','true'); s.appendChild(sp); d.appendChild(s);
    if(!h){ d.appendChild(el('p','reel-note','この形式の作り方の記録は、まだ公開していません。')); return d; }
    if(h.summary) d.appendChild(el('p','reel-summary',h.summary));
    if(h.prepare&&h.prepare.length){const w=el('div','reel-prepare');w.appendChild(el('h4',null,'用意するもの'));const ul=el('ul');h.prepare.forEach(x=>ul.appendChild(el('li',null,x)));w.appendChild(ul);
      if(h.first_step){const p=el('p');p.appendChild(el('strong',null,'最初の一手：'));p.appendChild(document.createTextNode(h.first_step));w.appendChild(p);}
      if(h.desk) w.appendChild(el('p','reel-note',h.desk));
      d.appendChild(w);}
    const two=el('div','reel-two');
    const list=(title,arr)=>{const w=el('div');w.appendChild(el('h4',null,title));const ul=el('ul');(arr||[]).forEach(x=>ul.appendChild(el('li',null,x)));w.appendChild(ul);return w;};
    if(h.fixed&&h.fixed.length) two.appendChild(list('この型の決まり',h.fixed));
    if(h.rules&&h.rules.length) two.appendChild(list('字幕と音のコツ',h.rules));
    d.appendChild(two);
    if(h.timeline&&h.timeline.length){
      d.appendChild(el('h4',null,'時間順の流れ（秒数は目安）'));
      if(h.timeline_note) d.appendChild(el('p','reel-note',h.timeline_note));
      const t=document.createElement('table'); t.className='reel-timeline';
      const thead=t.createTHead(); const hr=thead.insertRow();
      ['時間','声','映像','差し込み','字幕'].forEach(x=>{const th=document.createElement('th');th.textContent=x;hr.appendChild(th);});
      const tb=t.createTBody();
      const LAB=['時間','声','映像','差し込み','字幕'];
      h.timeline.forEach(r=>{const tr=tb.insertRow();[r.t,r.voice,r.video,r.insert,r.caption].forEach((x,i)=>{const td=tr.insertCell();td.textContent=x==null||x===''?'—':x;td.setAttribute('data-label',LAB[i]);});});
      d.appendChild(t);
    }
    if(h.materials&&h.materials.length) d.appendChild(list('見本で使った素材',h.materials));
    if(h.agent_prompt){
      const w=el('div','reel-agent'); w.appendChild(el('h4',null,'Claude Code／Codex で作る'));w.appendChild(el('p','start-note start-warn','書き出しで「ffmpeg がない」と言われたら、AI に「ffmpeg を Homebrew で入れて」と頼みます（Mac のパスワードを聞かれたら入力して Enter）。'));
      w.appendChild(el('p','reel-note','コピーして Claude Code か Codex に貼ると、自分の素材でこの型の編集指示書と動画を作ります。'));
      const det=el('details','reel-agent-body'); det.appendChild(el('summary',null,'指示文の本文を見る'));
      const ta=el('textarea','reel-agent-text'); ta.readOnly=true; ta.value=h.agent_prompt; ta.rows=14; ta.setAttribute('aria-label','指示文の本文'); det.appendChild(ta);
      const btn=el('button','reel-copy','指示文をコピー'); btn.type='button';
      const st=el('span','reel-copy-state',''); st.setAttribute('role','status');
      btn.addEventListener('click',()=>copyText(h.agent_prompt).then(ok=>{st.textContent=ok?'コピーしました':'コピーできませんでした。下の本文を選んでコピーしてください。';if(!ok)det.open=true;}));
      w.appendChild(btn); w.appendChild(st); w.appendChild(det); d.appendChild(w);
    }
    const a=el('a','text-link','作り方をテキストで保存 ↓'); a.href=base+'howto_'+format+'.md'; a.download='作り方_'+LABEL[format]+'.md'; d.appendChild(a);
    return d;
  }

  function brief(h){
    const w=el('div','reel-brief'); w.appendChild(el('h4',null,'このカードの作り方'));
    if(!h||!h.summary){ w.appendChild(el('p','reel-note','この形式の作り方の記録は、まだ公開していません。')); return w; }
    w.appendChild(el('p','reel-brief-text',h.summary));
    if(h.first_step){const p=el('p','reel-brief-text');p.appendChild(el('strong',null,'最初の一手：'));p.appendChild(document.createTextNode(h.first_step));w.appendChild(p);}
    w.appendChild(el('p','reel-note','手順と指示文は、下の「この動画の作り方」にあります。'));
    return w;
  }

  function card(item,h){
    const c=el('article','reel-card'); c.id='reel-'+(item.key||item.format);
    const head=el('div','reel-head');
    head.appendChild(el('p','overline',(item.nav||LABEL[item.format]||item.format)+' / '+(item.account||'')));
    head.appendChild(el('h3',null,item.title||''));
    if(FOR[item.format]) head.appendChild(el('p','reel-note','使う場面：'+FOR[item.format]));
    head.appendChild(el('p','reel-note','自分のジャンルに置き換えて作ります。'));
    c.appendChild(head);
    const pair=el('div','reel-pair');
    if(item.ref) pair.appendChild(video(item.ref,item,'見本（人の編集）'));
    if(item.ai)  pair.appendChild(video(item.ai,item,'AI再現'));
    c.appendChild(pair);
    const info=el('div','reel-info'); const qcNode=qcLine(item); c.appendChild(info);
    if(item.stage&&!(item.approved&&!item.qc)){ info.appendChild(el('p','reel-stage',item.stage.indexOf('仕上げ中')===0?'改善を続けている作例（数値は見本との差）':item.stage));
      const SN=item.stage.indexOf('仕上げ中')===0?'見本との差が残る場面を、数値で確かめながら直し続けている作例です。数値が大きいほど、見本との差が大きいことを表します。下の作り方は、見本の編集メモです。':item.stage.indexOf('見本と同等')===0?'数値の比較で基準内に収まった作例です。':'';
      if(SN) info.appendChild(el('p','reel-note',SN)); }
    info.appendChild(qcNode);
    info.appendChild(brief(h));
    c.appendChild(howtoBlock(h,item.format));
    return c;
  }

  Promise.all([
    fetch(base+'manifest.json').then(r=>r.ok?r.json():{items:[]}).catch(()=>({items:[]})),
    fetch(base+'howto.json').then(r=>r.ok?r.json():{items:[]}).catch(()=>({items:[]}))
  ]).then(([m,h])=>{
    const how={}; (h.items||[]).forEach(x=>{how[x.format]=x;});
    const items=(m.items||[]).map((x,i)=>({x,i})).sort((a,b)=>(ORDER.indexOf(a.x.format)-ORDER.indexOf(b.x.format))||(a.i-b.i)).map(o=>o.x);
    root.replaceChildren();
    if(!items.length){ root.appendChild(el('p','reel-note','表示できる動画がありません。')); return; }
    // 形式のチップ：選んだ1件だけ表示（初期は先頭）
    const nav=el('nav','reel-nav'); nav.setAttribute('aria-label','形式を選ぶ');
    root.appendChild(nav);
    const cards=items.map(it=>card(it,how[it.format]));
    const chips=[];
    const show=i=>{
      cards.forEach((c,j)=>{c.hidden=j!==i; if(j!==i) c.querySelectorAll('video').forEach(v=>v.pause());});
      chips.forEach((b,j)=>{b.setAttribute('aria-pressed',String(j===i)); if(j===i)b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');});
    };
    items.forEach((it,i)=>{const b=el('button',null,it.nav||LABEL[it.format]||it.format); b.type='button'; b.addEventListener('click',()=>show(i)); chips.push(b); nav.appendChild(b);});
    cards.forEach(c=>root.appendChild(c));
    show(0);
    // #reel-○○ で来た場合は、その1件を出す
    const fromHash=()=>{const id=(location.hash||'').slice(1);const i=cards.findIndex(c=>c.id===id);if(i>=0)show(i);};
    window.addEventListener('hashchange',fromHash); fromHash();
    // 同時再生を1本に（ページが重くならないように）
    root.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>{root.querySelectorAll('video').forEach(o=>{if(o!==v)o.pause();});}));
  });
})();

// 作例と使い方動画をまたいで、再生は常に1本だけにする
(function(){
  document.addEventListener('play',function(e){
    var t=e.target; if(!t||t.tagName!=='VIDEO') return;
    document.querySelectorAll('video').forEach(function(o){ if(o!==t&&!o.paused) o.pause(); });
  },true);
})();
