'use strict';
// 神狩荘 Christmas 2026 / GitHub Pages front-end
// Cloudflare Worker: /api/state, /api/register, /api/me, /api/history,
// /api/slot, /api/exchange, /api/draw
const API = 'https://kagariso-christmas-api.jinchyo-hiromi.workers.dev';
const TOKEN_KEY = 'kagariso_christmas_2026_player_token';
const LEVELS = [
  { min:0, title:'ツリーの準備' },
  { min:20000, title:'小さなツリー' },
  { min:60000, title:'飾り付け' },
  { min:120000, title:'冬色のリボン' },
  { min:200000, title:'明かりが灯る' },
  { min:300000, title:'てっぺんの星' },
  { min:480000, title:'みんなのクリスマス' },
];
const $ = (id) => document.getElementById(id);
const state = { token:localStorage.getItem(TOKEN_KEY) || '', me:null, public:null, busy:false, noticeTimer:null };
const format = (v) => Number(v || 0).toLocaleString('ja-JP');
const dateJST = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function msg(text,isError=false){const el=$('notice');el.textContent=text;el.classList.toggle('error',isError);el.hidden=false;clearTimeout(state.noticeTimer);state.noticeTimer=setTimeout(()=>{el.hidden=true;},7000);}
function safeError(err){msg(err instanceof Error?err.message:String(err),true);}
async function api(path,options={}){
  const headers={'Accept':'application/json',...(options.body?{'Content-Type':'application/json'}:{})};
  if(state.token) headers.Authorization=`Bearer ${state.token}`;
  let response;
  try{response=await fetch(API+path,{method:options.method||'GET',headers,body:options.body?JSON.stringify(options.body):undefined,cache:'no-store'});}catch{throw new Error('サーバーに接続できません。通信環境やWorkerの公開設定を確認してください。');}
  let data;try{data=await response.json();}catch{throw new Error('APIから正しい応答が返りませんでした。');}
  if(!response.ok||!data.success)throw new Error(data.error||`サーバーエラー (${response.status})`);
  return data;
}
function eligible(start,end='2026-12-24'){const d=state.public?.date_jst || dateJST();return d>=start && d<=end;}
function phase(){const d=state.public?.date_jst || dateJST();return d<'2026-12-01'?'開催まであと少し':d<='2026-12-24'?'クリスマス開催中':'イベントは終了しました';}
function switchTab(name){
  document.querySelectorAll('.tab').forEach(b=>{const active=b.dataset.tab===name;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('active',p.id===`pane-${name}`));
  if(name==='lottery'||name==='exchange')refreshHistory();
}
function renderPublic(){
  const data=state.public;if(!data)return;
  const growth=Number(data.tree?.growth_points||0);
  const lv=LEVELS.reduce((n,x,i)=>growth>=x.min?i:n,0), cur=LEVELS[lv],next=LEVELS[lv+1];
  $('growthPoints').textContent=format(growth);$('treeLevel').innerHTML=`${lv} <small>/ 6</small>`;
  $('treeLevelName').textContent=cur.title;
  const treeImage=$('treeVisual');
  const newImage=`../Christmas/images/step${lv}.png`;
  if(treeImage.getAttribute('src')!==newImage)treeImage.setAttribute('src',newImage);
  treeImage.alt=`みんなのクリスマスツリー：レベル${lv}（${cur.title}）`;
  $('treeStory').textContent=lv===6?'みんなで飾ったツリーが完成！':'次の飾りは、住人たちのポイントが運んできます。';
  $('growthBar').style.width=`${next?Math.min(100,Math.max(0,(growth-cur.min)/(next.min-cur.min)*100)):100}%`;
  $('nextLevel').textContent=next?`次の成長まで ${format(Math.max(0,next.min-growth))} pt`:'ツリーは最大まで成長しました';
  $('totalStock').textContent=format(data.total_stock);$('drawStock').textContent=format(data.total_stock);
  $('playerCount').textContent=String(data.ranking?.length||0)+(data.ranking?.length===100?'＋':'');
  $('eventPhase').textContent=phase();$('currentDate').textContent=data.date_jst||dateJST();
  renderRanking();updateButtons();
}
function renderRanking(){
  const el=$('rankingList');el.replaceChildren();const rows=state.public?.ranking||[];
  if(!rows.length){const p=document.createElement('p');p.className='empty';p.textContent='まだ参加者がいません。最初の住人になろう！';el.append(p);return;}
  rows.forEach((entry,i)=>{
    const row=document.createElement('div');row.className='rank-row';
    if(state.me && state.me.character_name===entry.character_name && Number(state.me.total_earned)===Number(entry.total_earned))row.classList.add('mine');
    const rank=document.createElement('strong');rank.className='rank-no';rank.textContent=i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1);
    const name=document.createElement('span');name.className='rank-name';name.textContent=entry.character_name;
    const points=document.createElement('span');points.className='rank-points';points.textContent=`${format(entry.total_earned)} pt`;
    row.append(rank,name,points);el.append(row);
  });
}
function renderMe(){
  $('playerName').textContent=state.me?.character_name||'未登録';$('headerName').textContent=state.me?.character_name||'ゲスト';
  $('myPoints').textContent=state.me?format(state.me.points):'—';$('myTotal').textContent=state.me?format(state.me.total_earned):'—';
  $('selfGiftStatus').textContent=state.me?.self_gift_used_today?'本日は交換済み（翌日0時に更新）':'1日1回交換できます';$('registerOpen').textContent=state.me?'参加済み':'参加登録';$('drawRemaining').textContent=state.me?Math.max(0,3-Number(state.me.draw_count_today||0)):'—';
  renderRanking();updateButtons();
}
function updateButtons(){
  const hasPlayer=Boolean(state.me), play=eligible('2026-12-01'),draw=eligible('2026-12-01');
  $('spinButton').disabled=state.busy||!hasPlayer||!play;
  document.querySelectorAll('.exchange-button').forEach(button=>{button.disabled=state.busy||!hasPlayer||!play||Number(state.me?.points||0)<Number(button.dataset.cost);});
  $('specificGiftButton').disabled=state.busy||!hasPlayer||!play||!$('specificGiftItem').value||( $('specificGiftDestination').value==='self' ? (Number(state.me?.points||0)<5000||Boolean(state.me?.self_purchase_used_today)) : (Number(state.me?.points||0)<2500||!$('specificGiftMessage').value.trim()) );
  $('selfGiftButton').disabled=state.busy||!hasPlayer||!play||Number(state.me?.points||0)<800||Boolean(state.me?.self_gift_used_today);
  const remaining=hasPlayer?Math.max(0,3-Number(state.me.draw_count_today||0)):0;
  $('drawButton').disabled=state.busy||!hasPlayer||!draw||remaining===0||Number(state.public?.total_stock||0)===0;
  $('lotteryHint').textContent=!draw?'くじは2026年12月1日〜24日に開催します。':Number(state.public?.total_stock||0)===0?'プレゼントがなくなり次第終了です。在庫は現在0個です。':remaining===0?'今日の抽選は3回終了しました。翌日0時（日本時間）に再び引けます。':'1日3回まで。引いたプレゼントは共通在庫からなくなります。';
}
async function refreshPublic(){try{const d=await api('/api/state');state.public=d;$('connectionDot').classList.add('online');$('connectionText').textContent='接続中';renderPublic();}catch(e){$('connectionDot').classList.remove('online');$('connectionText').textContent='接続エラー';safeError(e);}}
async function refreshMe(){if(!state.token){state.me=null;renderMe();return;}try{const d=await api('/api/me');state.me={...d.player,draw_count_today:d.draw_count_today,self_gift_used_today:d.self_gift_used_today,self_purchase_used_today:d.self_purchase_used_today};renderMe();}catch(e){state.me=null;renderMe();msg('参加者情報を確認できません。保存済みトークンをご確認ください。',true);}}
async function refreshAll(){await Promise.all([refreshPublic(),refreshMe()]);}
function openRegister(){if(state.me){msg('このブラウザではすでに「'+state.me.character_name+'」として参加しています。');return;}if(state.token){msg('保存済みの参加情報を確認できません。ページ更新後も続く場合は運営へ連絡してください。',true);return;}$('registerDialog').showModal();}
async function register(e){e.preventDefault();if(state.busy)return;const name=$('characterName').value.trim();if(!name)return;state.busy=true;$('registerSubmit').disabled=true;
  try{const d=await api('/api/register',{method:'POST',body:{character_name:name}});state.token=d.token;localStorage.setItem(TOKEN_KEY,state.token);$('registerDialog').close();msg('ようこそ、'+d.character_name+'さん！ クリスマスを楽しもう。');await refreshAll();}
  catch(err){safeError(err);}finally{state.busy=false;$('registerSubmit').disabled=false;updateButtons();}
}
const SLOT_SYMBOLS = ['🍬','❄️','🔔','🎁','⭐'];
const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function spin(){
  if(state.busy)return;
  if(!state.me)return openRegister();
  state.busy=true;updateButtons();
  const reels=[0,1,2].map(i=>$('reel'+i));
  const spinning=reels.map(()=>true);
  const started=performance.now();
  $('slotMessage').textContent='リール回転中…';
  reels.forEach(r=>r.classList.add('spinning'));
  // Animate independently of the server response. Only the server decides the prize.
  const interval=setInterval(()=>{
    reels.forEach((r,i)=>{if(spinning[i]){
      r.textContent=SLOT_SYMBOLS[Math.floor(Math.random()*SLOT_SYMBOLS.length)];
    }});
  },75);
  try{
    const d=await api('/api/slot',{method:'POST',body:{}});
    // Keep animation visible even if the API responds very quickly.
    await pause(Math.max(0,480-(performance.now()-started)));
    for(let i=0;i<reels.length;i++){
      spinning[i]=false;
      reels[i].textContent=d.symbols?.[i]||'✦';
      reels[i].classList.remove('spinning');
      reels[i].classList.add('reel-stopped');
      await pause(145);
    }
    $('slotMessage').textContent=`${d.outcome}！ +${format(d.earned_points)} pt`;
    state.me.points=d.player.points;
    state.me.total_earned=d.player.total_earned;
    renderMe();
    // Let the next spin start immediately; refresh shared data without locking the slot.
    refreshPublic();
  }catch(err){
    $('slotMessage').textContent='スロットを回せませんでした';safeError(err);
  }finally{
    clearInterval(interval);
    reels.forEach(r=>{r.classList.remove('spinning');r.classList.remove('reel-stopped');});
    state.busy=false;updateButtons();
  }
}
// 上段の3つは従来どおりランダム交換専用（300/600/1200pt）。
// 2500pt超豪華なプレゼントは下段の「好きなプレゼントを選ぶ」から指定交換する。
let chosenCost=null;
function askExchange(cost){
  if(!state.me)return openRegister();
  if(state.busy)return;
  if(![300,600,1200].includes(cost))return msg('この種類は下の指定交換欄から選んでください。',true);
  chosenCost=cost;
  $('confirmText').textContent=`${format(cost)}ptを使ってランダムなプレゼントを1個生成します。共通くじへ自動登録されます。`;
  $('confirmDialog').showModal();
}
async function exchange(){
  if(state.busy||chosenCost===null)return;
  const cost=chosenCost;
  state.busy=true;updateButtons();$('confirmAccept').disabled=true;
  try{
    const d=await api('/api/exchange',{method:'POST',body:{cost}});
    $('confirmDialog').close();
    state.me.points=d.player.points;
    state.me.total_earned=d.player.total_earned;
    renderMe();
    msg(`「${d.present.title}」を共通の抽選箱へ追加しました！`);
    await refreshPublic();await refreshHistory();
  }catch(err){safeError(err);}
  finally{chosenCost=null;state.busy=false;$('confirmAccept').disabled=false;updateButtons();}
}
async function claimSelfGift(){
  if(state.busy)return;
  if(!state.me)return openRegister();
  if(!window.confirm('800ptを使って自分へのプレゼントを交換しますか？（1日1回）'))return;
  state.busy=true;updateButtons();
  try{
    const d=await api('/api/self-gift',{method:'POST',body:{}});
    state.me.points=d.player.points;
    state.me.total_earned=d.player.total_earned;
    state.me.self_gift_used_today=true;
    renderMe();
    renderPrizeCard($('selfGiftResult'), d.gift.title, d.gift.gift_type, null, {self:true});
    $('selfGiftResult').hidden=false;
    msg(`自分へのプレゼント：${d.gift.title}を受け取りました！`);
    await refreshHistory();
  }catch(err){safeError(err);}finally{state.busy=false;updateButtons();}
}
async function draw(){if(state.busy)return;if(!state.me)return openRegister();if(!window.confirm('本日のくじを1回引きます。よろしいですか？'))return;
  state.busy=true;updateButtons();$('prizeReveal').hidden=true;
  try{const d=await api('/api/draw',{method:'POST',body:{}});$('prizeTitle').textContent=d.prize.title;$('prizeMessage').textContent=d.prize.message||'素敵なクリスマスを！';renderPrizeCard($('prizeImageSlot'), d.prize.title, d.prize.gift_type, d.prize.item_title);$('prizeReveal').hidden=false;
    state.me.draw_count_today=d.draw_count_today;renderMe();msg('プレゼントが当たりました！');await refreshPublic();await refreshHistory();$('prizeReveal').scrollIntoView({behavior:'smooth',block:'center'});}
  catch(err){safeError(err);}finally{state.busy=false;updateButtons();}
}
const GIFT_LABELS = {10:'ささやかなプレゼント',50:'まあまあなプレゼント',100:'豪華なプレゼント',150:'超豪華なプレゼント'};
function fillHistory(target,items,kind){const root=$(target);root.replaceChildren();if(!items?.length){const p=document.createElement('p');p.className='empty';p.textContent=kind==='draw'?'まだプレゼントを受け取っていません。':'まだプレゼントを用意していません。';root.append(p);return;}
  for(const item of items){const row=document.createElement('article');row.className='history-item';const name=document.createElement('strong');name.textContent=item.title;const desc=document.createElement('small');desc.textContent=kind==='draw'?`${item.draw_date} · ${GIFT_LABELS[item.gift_type] || "プレゼント"}${item.creator_name?' · '+item.creator_name+'作':''}`:`${GIFT_LABELS[item.gift_type] || "プレゼント"} · ${item.status==='claimed'?'当選済':'抽選待ち'}`;/* プレゼント画像は当選結果の画面だけに表示する */row.append(name,desc);if(item.message){const p=document.createElement('p');p.textContent=item.message;row.append(p);}root.append(row);}
}
// くじ当選・自分用ランダム交換・指定購入を1つの受取履歴にまとめる。
// 同日の複数件も正確に並べられるよう、D1から返された日時を使う。
function renderReceivedHistory(data){
  const root=$('drawHistory');
  root.replaceChildren();
  const received=[
    ...(data.draws||[]).map(x=>({...x,source:'draw',sort_at:x.drawn_at||x.draw_date||''})),
    ...(data.self_gifts||[]).map(x=>({...x,source:'random',sort_at:x.created_at||x.claim_date||''})),
    ...(data.self_purchases||[]).map(x=>({...x,source:'specific',sort_at:x.created_at||x.purchase_date||''})),
  ];
  received.sort((a,b)=>String(b.sort_at).localeCompare(String(a.sort_at)));
  if(!received.length){
    const p=document.createElement('p');
    p.className='empty';
    p.textContent='まだプレゼントを受け取っていません。';
    root.append(p);
    return;
  }
  for(const item of received){
    const row=document.createElement('article');
    row.className='history-item';
    const name=document.createElement('strong');
    const date=item.draw_date||item.claim_date||item.purchase_date||'';
    const type=GIFT_LABELS[item.gift_type]||'プレゼント';
    const sub=document.createElement('small');
    if(item.source==='draw'){
      name.textContent=item.item_title&&item.title!==item.item_title?`${item.title}（${item.item_title}）`:item.title;
      sub.textContent=`${date} · 🎟️ くじ当選 · ${type}${item.creator_name?' · '+item.creator_name+'作':''}`;
    }else if(item.source==='random'){
      name.textContent=item.title||type;
      sub.textContent=`${date} · 🎁 自分用ランダム交換（800pt） · ${type}`;
    }else{
      name.textContent=item.title||type;
      sub.textContent=`${date} · 🛍️ 自分用指定購入（5,000pt） · ${type}`;
    }
    row.append(name,sub);
    if(item.message){const p=document.createElement('p');p.textContent=item.message;row.append(p);}
    root.append(row);
  }
}
async function refreshHistory(){
  if(!state.me)return;
  try{
    const data=await api('/api/history');
    renderReceivedHistory(data);
    fillHistory('generatedHistory',data.generated,'generated');
  }catch(err){safeError(err);}
}

function bind(){document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));document.querySelectorAll('.refresh').forEach(b=>b.addEventListener('click',refreshAll));
  $('registerOpen').addEventListener('click',openRegister);$('registerClose').addEventListener('click',()=>$('registerDialog').close());$('registerForm').addEventListener('submit',register);$('spinButton').addEventListener('click',spin);
  document.querySelectorAll('.exchange-button').forEach(b=>b.addEventListener('click',()=>askExchange(Number(b.dataset.cost))));$('confirmCancel').addEventListener('click',()=>$('confirmDialog').close());$('confirmAccept').addEventListener('click',exchange);$('drawButton').addEventListener('click',draw);$('selfGiftButton').addEventListener('click',claimSelfGift);$('specificGiftType').addEventListener('change',renderSpecificGiftChoice);$('specificGiftItem').addEventListener('change',renderSpecificGiftChoice);$('specificGiftDestination').addEventListener('change',renderSpecificGiftChoice);$('specificGiftButton').addEventListener('click',exchangeSpecificGift);$('specificGiftMessage').addEventListener('input',updateButtons);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshAll();});
}
function findGiftItem(title, giftType, itemTitle=null){
  const items=window.CHRISTMAS_GIFTS||[];
  const lookup=itemTitle||title;
  if(!lookup) return null;
  // ギフトの種類を優先して同名の品物でも画像を取り違えない
  return items.find(g=>g.gift_type===Number(giftType)&&g.name===lookup)
      ||items.find(g=>g.name===lookup)||null;
}
function renderPrizeCard(root, title, giftType, itemTitle=null, options={}){
  root.replaceChildren();
  const gift=findGiftItem(title,giftType,itemTitle);
  const card=document.createElement('div');
  card.className='prize-item-card';
  const imageFrame=document.createElement('div');
  imageFrame.className='prize-image-frame';
  if(gift?.image){
    const img=document.createElement('img');
    img.className='prize-result-image';
    img.src=gift.image;
    img.alt=gift.name;
    img.loading='eager';
    img.onerror=()=>{
      imageFrame.replaceChildren();
      const placeholder=document.createElement('span');
      placeholder.className='prize-placeholder';
      placeholder.textContent='🎁';
      imageFrame.append(placeholder);
    };
    imageFrame.append(img);
  }else{
    const placeholder=document.createElement('span');
    placeholder.className='prize-placeholder';
    placeholder.textContent='🎁';
    imageFrame.append(placeholder);
  }
  const details=document.createElement('div');
  details.className='prize-item-details';
  const rank=document.createElement('small');
  const labels={10:'ささやかなプレゼント',50:'まあまあなプレゼント',100:'豪華なプレゼント',150:'超豪華なプレゼント'};
  rank.textContent=labels[giftType]||'クリスマスプレゼント';
  const name=document.createElement('strong');
  name.textContent=gift?.name||itemTitle||title||'プレゼント';
  details.append(rank,name);
  if(gift?.description){
    const desc=document.createElement('p');
    desc.textContent=gift.description;
    details.append(desc);
  }
  card.append(imageFrame,details);
  if(options.self){
    const intro=document.createElement('p');
    intro.textContent='🎁 自分へのプレゼントが当たりました！';
    root.append(intro);
  }
  root.append(card);
}
function renderGiftCatalog(){
  for(const [id,type] of [['giftCatalogList',10],['mediumGiftCatalogList',50],['largeGiftCatalogList',100],['namedGiftCatalogList',150]]){
    const box=document.getElementById(id);
    if(!box)continue;
    box.replaceChildren();
    const items=(window.CHRISTMAS_GIFTS||[]).filter(g=>g.gift_type===type);
    for(const gift of items){
      const item=document.createElement('div');item.className='catalog-item';
      const title=document.createElement('strong');title.textContent=gift.name;
      const category=document.createElement('small');category.textContent=gift.category;
      const description=document.createElement('p');description.textContent=gift.description;
      item.append(title,category,description);box.append(item);
    }
    // 候補一覧の最下部に「閉じる」ボタンを追加する。
    // 上部の見出し(summary)を押して開閉する既存の動作はそのまま残す。
    const details=box.closest('details.catalog-details');
    if(details){
      // 再描画されてもボタンが重複しないようにする。
      let closeButton=details.querySelector('.catalog-close-button');
      if(!closeButton){
        closeButton=document.createElement('button');
        closeButton.type='button';
        closeButton.className='catalog-close-button';
        closeButton.textContent='▲ 候補一覧を閉じる';
        closeButton.addEventListener('click',()=>{
          details.open=false;
          // 長い一覧を閉じても現在位置がページ下部に残らないように、
          // 閉じた見出しの位置へスムーズに戻す。
          const summary=details.querySelector('summary');
          if(summary)summary.scrollIntoView({behavior:'smooth',block:'start'});
        });
        details.append(closeButton);
      }
    }
  }
}

// 指定購入・指定投入は最新のdata.jsのプレゼントIDを使用する。
// 共通くじへの指定交換は、プレゼントランクに関係なく一律2,500pt。
const SPECIFIC_POOL_COST=2500;
function renderSpecificGiftChoice(){
  const type=Number($('specificGiftType').value);
  const select=$('specificGiftItem');
  const previous=select.value;
  const items=(window.CHRISTMAS_GIFTS||[]).filter(x=>Number(x.gift_type)===type);
  // ランク変更時は候補を更新。同じランクなら選択中のプレゼントを維持。
  if(select.dataset.type!==String(type)){
    select.replaceChildren();
    items.forEach(x=>{const opt=document.createElement('option');opt.value=x.id;opt.textContent=x.name;select.append(opt);});
    select.dataset.type=String(type);
  }
  if(items.some(x=>x.id===previous))select.value=previous;
  const chosen=items.find(x=>x.id===select.value);
  const preview=$('specificGiftPreview');preview.replaceChildren();
  if(chosen){
    const card=document.createElement('div');
    card.className='specific-preview-card';

    const frame=document.createElement('div');
    frame.className='specific-preview-frame';
    // SAMPLE付きの選択画面だけ右クリックメニュー・画像ドラッグを抑止。
    // 当選結果・購入後の画像には適用しない。
    frame.addEventListener('contextmenu', event => event.preventDefault());
    frame.addEventListener('dragstart', event => event.preventDefault());

    if(chosen.image){
      const img=document.createElement('img');
      img.className='specific-preview-image';
      img.src=chosen.image;
      img.alt=`${chosen.name} のサンプル画像`;
      img.loading='eager';
      img.draggable=false;
      img.setAttribute('aria-description','選択用サンプル画像です');
      img.onerror=()=>{
        frame.replaceChildren();
        const placeholder=document.createElement('span');
        placeholder.className='specific-preview-placeholder';
        placeholder.textContent='🎁';
        frame.append(placeholder);
        const badge=document.createElement('span');
        badge.className='sample-watermark';
        badge.textContent='SAMPLE';
        frame.append(badge);
      };
      frame.append(img);
    }else{
      const placeholder=document.createElement('span');
      placeholder.className='specific-preview-placeholder';
      placeholder.textContent='🎁';
      frame.append(placeholder);
    }

    const badge=document.createElement('span');
    badge.className='sample-watermark';
    badge.textContent='SAMPLE';
    frame.append(badge);

    const details=document.createElement('div');
    details.className='specific-preview-details';
    const small=document.createElement('small');
    small.textContent='選択中のプレゼントイメージ';
    const strong=document.createElement('strong');
    strong.textContent=chosen.name;
    const p=document.createElement('p');
    p.textContent=chosen.description||'';
    const note=document.createElement('div');
    note.className='specific-preview-note';
    note.textContent='※ この画像は選択用サンプルです';
    details.append(small,strong,p,note);

    card.append(frame,details);
    preview.append(card);
  }
  const dest=$('specificGiftDestination').value;
  $('specificGiftMessageWrap').hidden=dest!=='pool';
  $('specificGiftLimit').textContent=dest==='self'?'5,000pt・1日1回（ランダム800pt交換とは別枠）':`どのプレゼントも2,500pt・メッセージ必須・共通箱へ1個追加`;
  $('specificGiftButton').textContent=dest==='self'?'5,000ptで自分用に購入':'2,500ptで共通くじに追加';
  updateButtons();
}
async function exchangeSpecificGift(){
  if(state.busy)return;
  if(!state.me)return openRegister();
  const type=Number($('specificGiftType').value),giftId=$('specificGiftItem').value,dest=$('specificGiftDestination').value;
  const chosen=(window.CHRISTMAS_GIFTS||[]).find(x=>x.id===giftId&&Number(x.gift_type)===type);
  if(!chosen)return msg('プレゼントを選んでください。',true);
  const message=$('specificGiftMessage').value.trim();
  if(dest==='pool'&&!message){msg('共通くじへの指定交換にはメッセージが必要です。',true);$('specificGiftMessage').focus();return;}
  const cost=dest==='self'?5000:SPECIFIC_POOL_COST;
  if(!window.confirm(`「${chosen.name}」を${cost.toLocaleString('ja-JP')}ptで${dest==='self'?'自分用に購入':'共通くじに投入'}しますか？`))return;
  state.busy=true;updateButtons();
  try{
    const d=dest==='self'?await api('/api/self-purchase',{method:'POST',body:{gift_id:giftId}}):await api('/api/exchange',{method:'POST',body:{cost,gift_id:giftId,...(message?{message}:{})}});
    state.me.points=d.player.points;state.me.total_earned=d.player.total_earned;
    if(dest==='self'){
      state.me.self_purchase_used_today=true;
      renderPrizeCard($('specificGiftResult'),chosen.name,type,null,{self:true});$('specificGiftResult').hidden=false;
      msg(`「${chosen.name}」を自分用に購入しました！`);
    }else{
      msg(`「${chosen.name}」を共通くじへ追加しました！`);$('specificGiftMessage').value='';
    }
    renderMe();await refreshPublic();await refreshHistory();
  }catch(e){safeError(e);}finally{state.busy=false;updateButtons();}
}

renderGiftCatalog();bind();renderSpecificGiftChoice();refreshAll();setInterval(()=>{if(!document.hidden)refreshAll();},60000);
