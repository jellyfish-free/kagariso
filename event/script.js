"use strict";
(() => {
  const $ = s => document.querySelector(s);
  const buttons = [...document.querySelectorAll('[data-hand]')];
  const config = window.LOTTERY_CONFIG || {};
  const data = window.REQUEST_DATA;
  const zone = config.timeZone || 'Asia/Tokyo';
  const key = 'kagariso-enjoy-lottery-v1';
  // URLの末尾に ?test=1 を付けるとテストモードになります。
  // 通常の履歴・回数には影響しません。
  const testMode = new URLSearchParams(window.location.search).get('test') === '1';
  if (testMode) {
    const banner = document.createElement('p');
    banner.textContent = 'テストモード：何度でも引けます。結果は保存されません。';
    banner.setAttribute('role', 'status');
    banner.style.cssText = 'margin:0;padding:12px;text-align:center;background:#763c2d;color:#fff;';
    document.querySelector('main').prepend(banner);
    document.title = '【テスト】' + document.title;
  }
  let busy = false;
  let current = null;
  const dateKey = () => {
    const parts = new Intl.DateTimeFormat('en',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const p = Object.fromEntries(parts.map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  const read = () => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const history = JSON.parse(raw);
    if (!Array.isArray(history) || history.some(x=>!x || typeof x.id!=='string' || typeof x.date!=='string')) throw new Error('保存されたくじの記録を読み込めません。');
    return history;
  };
  const remaining = history => data.filter(x=>config.allowDuplicates===true || !history.some(h=>h.id===x.id));
  function refresh() {
    if (testMode) {
      $('#daily-status').textContent = 'テストモード：全てのくじから、何度でも引けます。';
      buttons.forEach(b => b.disabled = busy);
      $('#today-button').hidden = true;
      return;
    }
    const history = read();
    const today = history.findLast(x=>x.date===dateKey());
    const available = remaining(history);
    $('#daily-status').textContent = today ? '本日のくじは、もう引きました。' : available.length ? '本日のくじは、まだ引いていません。' : 'すべてのくじを引き終えました。';
    buttons.forEach(b=>b.disabled=busy || !!today || !available.length);
    $('#today-button').hidden = !today;
  }
  function showResult(item, focus=true) {
    $('#reveal').hidden = true;
    current = item;
    $('#result-category').textContent = item.category || 'おたのしみくじ';
    $('#result-title').textContent = item.title;
    $('#result-description').textContent = item.description;
    $('#result-date').textContent = `${item.test ? '【テスト・保存なし】 ' : ''}${item.date} ／ ${item.hand || '手'}で引いたくじ`;
    $('#copy-status').textContent = '';
    $('#result').hidden = false;
    if (focus) { $('#result').focus({preventScroll:true}); $('#result').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); }
  }
  function showHistory() {
    const root = $('#history-list'); root.replaceChildren();
    const history = read().slice().reverse();
    if (!history.length) { root.textContent='まだ、くじの記録はありません。'; return; }
    history.forEach(item=>{
      const article=document.createElement('article'); article.className='history-item';
      const stamp=document.createElement('small'); stamp.textContent=`${item.date} ／ ${item.category} ／ ${item.hand || '手'}`;
      const title=document.createElement('h3'); title.textContent=item.title;
      const body=document.createElement('p'); body.textContent=item.description;
      article.append(stamp,title,body); root.append(article);
    });
  }
  function report(error) { console.error(error); $('#draw-message').textContent='くじを準備できませんでした。data.jsの読み込みと、ブラウザの保存設定を確認してください。'; buttons.forEach(b=>b.disabled=true); }
  $('#enter-button').addEventListener('click',()=>{
    $('#entrance').hidden=true; $('#lottery-screen').hidden=false;
    $('#lottery-title').focus({preventScroll:true}); window.scrollTo(0,0);
  });
  $('#back-entrance').addEventListener('click',()=>{
    if(busy)return;
    $('#lottery-screen').hidden=true; $('#entrance').hidden=false;
    $('#enter-button').focus({preventScroll:true}); window.scrollTo(0,0);
  });
  $('#close-result').addEventListener('click',()=>{ $('#result').hidden=true; (testMode ? buttons[0] : $('#today-button')).focus(); });
  try {
    if (!Array.isArray(data) || !data.length || data.some(x=>!x || typeof x.id!=='string' || typeof x.title!=='string' || typeof x.description!=='string') || new Set(data.map(x=>x.id)).size!==data.length) throw new Error('くじデータを確認してください。');
    refresh();
    buttons.forEach(button=>button.addEventListener('click',()=>{
      if (busy) return;
      try {
        const history=testMode ? [] : read(), date=dateKey();
        if (history.some(x=>x.date===date)) { refresh(); return; }
        const pool=testMode ? data : remaining(history);
        if (!pool.length) { refresh(); return; }
        const item={...pool[Math.floor(Math.random()*pool.length)],date,hand:button.dataset.hand,receivedAt:new Date().toISOString(),test:testMode};
        // 保存できた場合にだけ結果を確定します。
        if (!testMode) localStorage.setItem(key,JSON.stringify([...history,item]));
        busy=true; refresh(); $('#result').hidden=true;
        $('#draw-message').textContent=`${item.hand}を入れると、指先に何かが触れた。`;
        $('#lottery-box').classList.add('drawing');
        $('#reveal-text').textContent = `${item.hand}を入れると、何かが指先に触れた。`;
        $('#reveal').hidden = false;
        setTimeout(()=>{
          busy=false; $('#lottery-box').classList.remove('drawing');
          $('#draw-message').textContent='そっと、取り出してみる。'; showResult(item);
          try {refresh(); if (!$('#history').hidden) showHistory();} catch(error) {report(error);}
        },1800);
      } catch(error) { report(error); }
    }));
    $('#today-button').addEventListener('click',()=>{try{const item=read().findLast(x=>x.date===dateKey());if(item)showResult(item);}catch(error){report(error);}});
    $('#history-toggle').addEventListener('click',()=>{try{const open=$('#history').hidden;$('#history').hidden=!open;$('#history-toggle').setAttribute('aria-expanded',String(open));if(open)showHistory();}catch(error){report(error);}});
    $('#copy-result').addEventListener('click',async()=>{
      if(!current)return;
      const text=`${current.test ? '【テスト結果】\n' : ''}神狩荘 おたのしみくじ\n【${current.title}】\n${current.description}`;
      try{await navigator.clipboard.writeText(text);$('#copy-status').textContent='コピーしました。';}catch{window.prompt('結果をコピーしてください',text);}
    });
    window.addEventListener('storage',event=>{if(event.key===key && !busy){try{refresh();if(!$('#history').hidden)showHistory();}catch(error){report(error);}}});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden && !busy){try{refresh();}catch(error){report(error);}}});
    setInterval(()=>{if(!busy){try{refresh();}catch(error){report(error);}}},30000);
  } catch(error) {report(error);}
})();
