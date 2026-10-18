(function(root){
  'use strict';
  function buildPrompt(guide, data){
    if(!guide || guide.length < 500) throw new Error('手順書を読み込めませんでした。ページを再読み込みしてください。');
    var rows = [
      ['まず進めたいこと',data.goal],
      ['いま困っていること・止まっていること',data.concern],
      ['お仕事・発信のジャンル',data.business],
      ['使える時間・端末・守りたい条件',data.constraints],
      ['現在の投稿文や数字など（分かっていること）',data.evidence]
    ];
    var facts = rows.filter(function(r){return String(r[1]||'').trim();}).map(function(r){return r[0]+'：'+String(r[1]).trim();});
    return guide.trim()+'\n\n--- 今回の相談内容 ---\n'+(facts.length?facts.join('\n'):'まだ整理できていません。最初の質問を1つお願いします。')+'\n\n今の私の状況なら、何から始めるとよいですか？ 次に確かめることか、小さな作業を1つ選び、理由も短く教えてください。原稿や下書きを頼んでいる場合は、先に案を作ってください。';
  }
  if(typeof module==='object'&&module.exports) module.exports={buildPrompt:buildPrompt};
  if(!root.document) return;
  var form=document.getElementById('improve-form');if(!form)return;
  if(root.IntersectionObserver){new IntersectionObserver(function(entries){document.body.classList.toggle('improve-in-view',entries[0].isIntersecting);},{threshold:0}).observe(document.getElementById('improve'));}
  var out=document.getElementById('improve-output'), panel=document.getElementById('improve-result'),status=document.getElementById('improve-status'),copy=document.getElementById('improve-copy');
  function writeClipboard(text){return new Promise(function(resolve,reject){var timer=setTimeout(function(){reject(new Error('コピーが完了しませんでした。手動でコピーしてください。'));},2000);Promise.resolve().then(function(){return navigator.clipboard.writeText(text);}).then(function(){clearTimeout(timer);resolve();},function(err){clearTimeout(timer);reject(err);});});}
  function data(){var o={};['goal','concern','business','constraints','evidence'].forEach(function(k){o[k]=form.elements[k].value;});return o;}
  var downloadStatus=document.getElementById('improve-download-status');
  function saveFile(text){var url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));var a=document.createElement('a');a.href=url;a.download='インスタ改善ナビ.txt';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
  document.getElementById('improve-download').addEventListener('click',function(e){e.preventDefault();try{saveFile(buildPrompt(root.INSTA_IMPROVEMENT_GUIDE,data()));downloadStatus.textContent='ダウンロードを開始しました。保存したファイルを新しいチャットに添付し、開始文を送ってください。入力した相談内容も入っています。';}catch(err){downloadStatus.textContent=err.message;}});
  document.getElementById('improve-start-copy').addEventListener('click',async function(){var field=document.getElementById('improve-start-message');try{await writeClipboard(field.value);document.getElementById('improve-start-copy').textContent='コピーしました';downloadStatus.textContent='開始文をコピーしました。ChatGPTかClaudeを開き、ファイルを添付してから貼り付けて送ってください。';}catch(err){field.focus();field.select();document.getElementById('improve-start-copy').textContent='開始文を選択しました';downloadStatus.textContent='自動コピーができませんでした。選択した開始文をコピーするか、同じ文をAIに入力してください。';}});
  form.addEventListener('input',function(){downloadStatus.textContent='相談内容を変更しました。ファイルで使う場合は、もう一度ダウンロードしてください。';});
  function render(){out.value=buildPrompt(root.INSTA_IMPROVEMENT_GUIDE,data());document.getElementById('improve-length').textContent=out.value.length.toLocaleString()+'文字（手順書と相談内容）';}
  form.addEventListener('input',function(){if(!panel.hidden){try{render();status.textContent='相談内容を更新しました。もう一度コピーしてください。';}catch(e){status.textContent=e.message;}}});
  form.addEventListener('submit',function(e){e.preventDefault();try{render();panel.hidden=false;status.textContent='準備できました。下のボタンでコピーしてください。';document.getElementById('improve-result-title').focus();}catch(err){status.textContent=err.message;}});
  copy.addEventListener('click',async function(){var text=out.value;copy.disabled=true;try{
    if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('clipboard unavailable');
    await writeClipboard(text);
    status.textContent=out.value===text?'コピーしました。ChatGPTかClaudeの新しいチャットに貼り付けて送ってください。':'コピー中に相談内容が変わりました。もう一度コピーしてください。';
  }catch(err){document.getElementById('improve-manual').open=true;out.focus();out.select();status.textContent='自動コピーができませんでした。下の文章をすべて選んでコピーしてください。';}finally{copy.disabled=false;}});
  document.getElementById('improve-copy-fallback').addEventListener('click',async function(){
    var button=this;button.disabled=true;try{render();var snapshot=out.value;await writeClipboard(snapshot);downloadStatus.textContent=buildPrompt(root.INSTA_IMPROVEMENT_GUIDE,data())===snapshot?'コピーしました。ChatGPTかClaudeの新しいチャットに貼り付けて送ってください。ファイル添付や開始文は不要です。':'入力が変わりました。もう一度コピーしてください。';}
    catch(err){document.getElementById('improve-customize').open=true;panel.hidden=false;document.getElementById('improve-manual').open=true;out.focus();out.select();status.textContent=out.value?'自動コピーができませんでした。選択した全文をコピーして、AIに貼り付けてください。':err.message;}
    finally{button.disabled=false;}
  });
  document.getElementById('improve-select').addEventListener('click',function(){out.focus();out.select();status.textContent='全文を選びました。Macは⌘C、WindowsはCtrl+C、スマホは「コピー」を押してください。';});
  document.getElementById('improve-save').addEventListener('click',function(){var url=URL.createObjectURL(new Blob([out.value],{type:'text/plain;charset=utf-8'}));var a=document.createElement('a');a.href=url;a.download='インスタ改善ナビ_相談.txt';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);status.textContent='相談文のダウンロードを開始しました。入力した内容も入っています。';});
  document.getElementById('improve-link').addEventListener('click',async function(){try{var u=new URL(location.href);u.search='';u.hash='improve';await writeClipboard(u.href);downloadStatus.textContent='改善ナビのリンクをコピーしました。入力した相談内容は含まれません。';}catch(e){downloadStatus.textContent='リンクをコピーできませんでした。ページのURLの末尾に #improve を付けて共有してください。相談内容は含まれません。';}});
})(typeof window==='undefined'?{}:window);