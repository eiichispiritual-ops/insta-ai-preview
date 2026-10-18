(function(root){
  'use strict';
  function buildPrompt(guide, data){
    if(!guide || guide.length < 500) throw new Error('手順書が読み込めませんでした。ページを再読み込みしてください。');
    var rows = [['進めたいこと',data.goal],['いま困っていること',data.concern],['仕事・発信内容',data.business],['使える時間・端末・守りたい条件',data.constraints],['投稿文や数字など、分かっていること',data.evidence]];
    var facts = rows.filter(function(r){return String(r[1]||'').trim();}).map(function(r){return r[0]+'：'+String(r[1]).trim();});
    return guide.trim()+'\n\n--- 今回の相談 ---\n'+(facts.length?facts.join('\n'):'まだ整理できていません。最初の質問を1つお願いします。')+'\n\nこの状況から、最初に確かめること、または今ここで進めることを1つ選び、理由と一緒に短く教えてください。原稿作成を頼んでいる場合は原稿を先に作ってください。';
  }
  if(typeof module==='object'&&module.exports) module.exports={buildPrompt:buildPrompt};
  if(!root.document) return;
  var form=document.getElementById('improve-form');if(!form)return;
  if(root.IntersectionObserver){new IntersectionObserver(function(entries){document.body.classList.toggle('improve-in-view',entries[0].isIntersecting);},{threshold:0}).observe(document.getElementById('improve'));}
  var out=document.getElementById('improve-output'), panel=document.getElementById('improve-result'),status=document.getElementById('improve-status'),copy=document.getElementById('improve-copy');
  function data(){var o={};['goal','concern','business','constraints','evidence'].forEach(function(k){o[k]=form.elements[k].value;});return o;}
  function render(){out.value=buildPrompt(root.INSTA_IMPROVEMENT_GUIDE,data());document.getElementById('improve-length').textContent=out.value.length.toLocaleString()+'文字・手順書と相談内容が入っています';}
  form.addEventListener('input',function(){if(!panel.hidden){try{render();status.textContent='入力の変更を反映しました。もう一度コピーしてください。';}catch(e){status.textContent=e.message;}}});
  form.addEventListener('submit',function(e){e.preventDefault();try{render();panel.hidden=false;status.textContent='相談の準備ができました。下のボタンでまとめてコピーできます。';document.getElementById('improve-result-title').focus();}catch(err){status.textContent=err.message;}});
  copy.addEventListener('click',async function(){var text=out.value;copy.disabled=true;try{
    if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent=out.value===text?'コピーしました。ChatGPTかClaudeの新しいチャットに貼り付け、そのまま送信してください。':'コピー中に入力が変わりました。最新の内容をもう一度コピーしてください。';
  }catch(err){document.getElementById('improve-manual').open=true;out.focus();out.select();status.textContent='自動コピーが使えませんでした。下の文章をすべて選択して、手動でコピーしてください。';}finally{copy.disabled=false;}});
  document.getElementById('improve-select').addEventListener('click',function(){out.focus();out.select();status.textContent='全文を選びました。パソコンは⌘C（WindowsはCtrl+C）、スマホは選択した文章の「コピー」を押してください。';});
  document.getElementById('improve-save').addEventListener('click',function(){var url=URL.createObjectURL(new Blob([out.value],{type:'text/plain;charset=utf-8'}));var a=document.createElement('a');a.href=url;a.download='インスタ改善ナビ_相談.txt';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);status.textContent='相談文を保存しました。入力した内容も含まれます。';});
  document.getElementById('improve-link').addEventListener('click',async function(){try{var u=new URL(location.href);u.search='';u.hash='improve';await navigator.clipboard.writeText(u.href);status.textContent='この相談ページのリンクをコピーしました。入力した相談内容はリンクに含まれません。';}catch(e){status.textContent='ページのURLの末尾に #improve を付けて共有できます。相談内容は含まれません。';}});
})(typeof window==='undefined'?{}:window);
