'use strict';
// 「見本｜AI再現」ギャラリー。assets/reels/manifest.json と howto.json を読んで描く。
// データが無い形式はカードを出さない（作例を捏造しない）。
(function(){
  const root=document.getElementById('reels-gallery'); if(!root) return;
  const ORDER=['ranking','voiceover','vlog','talk','comparison','taidan'];
  const LABEL={ranking:'ランキング',voiceover:'アフレコ',vlog:'VLOG',talk:'トーク',comparison:'比較',taidan:'対談'};
  const base='assets/reels/';
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
  const fmt1=v=>v==null?'—':(Math.round(v*100)/100).toFixed(2);

  function video(side,item,label){
    const box=el('figure','reel-side');
    const v=document.createElement('video');
    v.src=base+side.file; v.poster=base+side.poster; v.controls=true; v.playsInline=true; v.preload='metadata';
    v.setAttribute('aria-label',label+'：'+item.title);
    box.appendChild(v);
    const cap=el('figcaption'); cap.appendChild(el('span','reel-tag',label));
    if(side.duration_sec) cap.appendChild(el('small',null,Math.round(side.duration_sec)+'秒'));
    box.appendChild(cap); return box;
  }

  function qcLine(item){
    const q=item.qc; const p=el('p','reel-qc');
    if(q){
      const parts=['全フレーム（1コマずつ）の平均差 '+fmt1(q.mad_mean),'最大 '+fmt1(q.mad_max),'差が5を超えたコマ '+q.frames_over_5+' / '+q.frames];
      if(q.lufs_ref!=null&&q.lufs_ai!=null) parts.push('音の大きさ（LUFS） '+fmt1(q.lufs_ref)+' → '+fmt1(q.lufs_ai));
      p.textContent=parts.join(' ・ ');
      p.appendChild(el('small',null,'見本と同じ色変換で全フレームを比べた実測値。差は0〜255で、数値が小さいほど見本に近い。'));
    }else if(item.approved){ p.textContent='講師の確認済み'; }
    else{ p.textContent='数値の比較は未実施'; }
    return p;
  }

  function howtoBlock(h,format){
    const d=el('details','reel-howto'); const s=el('summary',null,'この動画の作り方'); d.appendChild(s);
    if(!h){ d.appendChild(el('p','reel-note','作り方は準備中です。')); return d; }
    if(h.summary) d.appendChild(el('p','reel-summary',h.summary));
    if(h.prepare&&h.prepare.length){const w=el('div','reel-prepare');w.appendChild(el('h4',null,'用意するもの'));const ul=el('ul');h.prepare.forEach(x=>ul.appendChild(el('li',null,x)));w.appendChild(ul);
      if(h.first_step){const p=el('p');p.appendChild(el('strong',null,'最初の一手：'));p.appendChild(document.createTextNode(h.first_step));w.appendChild(p);}
      if(h.desk) w.appendChild(el('p','reel-note',h.desk));
      d.appendChild(w);}
    const two=el('div','reel-two');
    const list=(title,arr)=>{const w=el('div');w.appendChild(el('h4',null,title));const ul=el('ul');(arr||[]).forEach(x=>ul.appendChild(el('li',null,x)));w.appendChild(ul);return w;};
    if(h.fixed&&h.fixed.length) two.appendChild(list('この型の決まり（最初はここだけ守れば形になる）',h.fixed));
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
    const a=el('a','text-link','作り方をテキストで保存（AIに貼って相談できる） ↓'); a.href=base+'howto_'+format+'.md'; a.download='作り方_'+LABEL[format]+'.md'; d.appendChild(a);
    return d;
  }

  function card(item,h){
    const c=el('article','reel-card'); c.id='reel-'+(item.key||item.format);
    const head=el('div','reel-head');
    head.appendChild(el('p','overline',(LABEL[item.format]||item.format)+(item.nav?' '+item.nav:'')+' / '+(item.account||'')));
    head.appendChild(el('h3',null,item.title||''));
    c.appendChild(head);
    const pair=el('div','reel-pair');
    if(item.ref) pair.appendChild(video(item.ref,item,'見本（人の編集）'));
    if(item.ai)  pair.appendChild(video(item.ai,item,'AI再現'+(item.ai.version?'（'+item.ai.version+'）':'')));
    c.appendChild(pair);
    c.appendChild(qcLine(item));
    if(item.stage) c.appendChild(el('p','reel-stage',item.stage));
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
    if(!items.length){ root.appendChild(el('p','reel-note','動画は準備中です。')); return; }
    // 形式のタブ
    const nav=el('nav','reel-nav'); nav.setAttribute('aria-label','形式を選ぶ');
    items.forEach((it,i)=>{const b=el('button',null,it.nav||LABEL[it.format]||it.format); b.type='button'; b.dataset.target='reel-'+(it.key||it.format); if(i===0)b.setAttribute('aria-current','true');
      b.addEventListener('click',()=>{nav.querySelectorAll('button').forEach(x=>x.removeAttribute('aria-current'));b.setAttribute('aria-current','true');document.getElementById(b.dataset.target).scrollIntoView({behavior:'smooth',block:'start'});});
      nav.appendChild(b);});
    root.appendChild(nav);
    items.forEach(it=>root.appendChild(card(it,how[it.format])));
    // 同時再生を1本に（ページが重くならないように）
    root.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>{root.querySelectorAll('video').forEach(o=>{if(o!==v)o.pause();});}));
  });
})();
