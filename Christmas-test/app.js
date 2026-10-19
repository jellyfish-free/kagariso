'use strict';
// 神狩荘 Christmas 2026 / GitHub Pages front-end
// Cloudflare Worker: /api/state, /api/register, /api/me, /api/history,
// /api/slot, /api/exchange, /api/draw
const API = 'https://kagariso-christmas-test-api.jinchyo-hiromi.workers.dev';
const TOKEN_KEY = 'kagariso_christmas_2026_TEST_player_token';
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
function phase(){const d=state.public?.date_jst || dateJST();return d<'2026-12-01'?'開催まであと少し':d<='2026-12-15'?'ツリー育成・プレゼント交換期間':d<='2026-12-24'?'プレゼントくじ開催中':'イベントは終了しました';}
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
  const hasPlayer=Boolean(state.me), play=eligible('2026-12-01'),draw=eligible('2026-12-16');
  $('spinButton').disabled=state.busy||!hasPlayer||!play;
  document.querySelectorAll('.exchange-button').forEach(button=>{button.disabled=state.busy||!hasPlayer||!play||Number(state.me?.points||0)<Number(button.dataset.cost);});
  $('selfGiftButton').disabled=state.busy||!hasPlayer||!play||Number(state.me?.points||0)<800||Boolean(state.me?.self_gift_used_today);
  const remaining=hasPlayer?Math.max(0,3-Number(state.me.draw_count_today||0)):0;
  $('drawButton').disabled=state.busy||!hasPlayer||!draw||remaining===0||Number(state.public?.total_stock||0)===0;
  $('lotteryHint').textContent=!draw?'くじは2026年12月16日〜24日に開催します。':Number(state.public?.total_stock||0)===0?'プレゼントがなくなり次第終了です。在庫は現在0個です。':remaining===0?'今日の抽選は3回終了しました。翌日0時（日本時間）に再び引けます。':'1日3回まで。引いたプレゼントは共通在庫からなくなります。';
}
async function refreshPublic(){try{const d=await api('/api/state');state.public=d;$('connectionDot').classList.add('online');$('connectionText').textContent='接続中';renderPublic();}catch(e){$('connectionDot').classList.remove('online');$('connectionText').textContent='接続エラー';safeError(e);}}
async function refreshMe(){if(!state.token){state.me=null;renderMe();return;}try{const d=await api('/api/me');state.me={...d.player,draw_count_today:d.draw_count_today,self_gift_used_today:d.self_gift_used_today};renderMe();}catch(e){state.me=null;renderMe();msg('参加者情報を確認できません。保存済みトークンをご確認ください。',true);}}
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
let chosenCost=null;
function askExchange(cost){if(!state.me)return openRegister();if(state.busy)return;const message=$('giftMessage').value.trim();if(cost===2500&&!message){msg('2,500ptのプレゼントにはメッセージを入力してください。',true);$('giftMessage').focus();return;}chosenCost=cost;
  $('confirmText').textContent=`${cost}ptを使って${cost===2500?'「'+state.me.character_name+'からのプレゼント」':'プレゼント'}を1個生成します。共通のくじへ自動登録されます。${cost===2500?' メッセージ：「'+message+'」':''}`;
  $('confirmDialog').showModal();
}
async function exchange(){if(state.busy||chosenCost===null)return;const cost=chosenCost;state.busy=true;updateButtons();$('confirmAccept').disabled=true;
  try{const d=await api('/api/exchange',{method:'POST',body:{cost,...(cost===2500?{message:$('giftMessage').value.trim()}:{})}});$('confirmDialog').close();if(cost===2500)$('giftMessage').value='';state.me.points=d.player.points;state.me.total_earned=d.player.total_earned;renderMe();msg(`「${d.present.title}」${d.present.item_title?'（'+d.present.item_title+'）':''}を共通の抽選箱へ追加しました！`);await refreshPublic();await refreshHistory();}
  catch(err){safeError(err);}finally{chosenCost=null;state.busy=false;$('confirmAccept').disabled=false;updateButtons();}
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
const GIFT_LABELS = {10:'ささやかなプレゼント',50:'まあまあなプレゼント',100:'豪華なプレゼント',150:'名前とメッセージ入り'};
function fillHistory(target,items,kind){const root=$(target);root.replaceChildren();if(!items?.length){const p=document.createElement('p');p.className='empty';p.textContent=kind==='draw'?'まだプレゼントを受け取っていません。':'まだプレゼントを用意していません。';root.append(p);return;}
  for(const item of items){const row=document.createElement('article');row.className='history-item';const name=document.createElement('strong');name.textContent=item.title;const desc=document.createElement('small');desc.textContent=kind==='draw'?`${item.draw_date} · ${GIFT_LABELS[item.gift_type] || "プレゼント"}${item.creator_name?' · '+item.creator_name+'作':''}`:`${GIFT_LABELS[item.gift_type] || "プレゼント"} · ${item.status==='claimed'?'当選済':'抽選待ち'}`;/* 景品画像は当選結果の画面だけに表示する */row.append(name,desc);if(item.message){const p=document.createElement('p');p.textContent=item.message;row.append(p);}root.append(row);}
}
async function refreshHistory(){if(!state.me)return;try{const data=await api('/api/history');fillHistory('drawHistory',data.draws,'draw');fillHistory('generatedHistory',data.generated,'generated');const root=$('selfGiftHistory');root.replaceChildren();if(!data.self_gifts?.length){const e=document.createElement('p');e.className='empty';e.textContent='まだ交換していません。';root.append(e);}else for(const gift of data.self_gifts){const e=document.createElement('article');e.className='history-item';e.textContent=`${gift.claim_date} · ${GIFT_LABELS[gift.gift_type]}`;root.append(e);}}catch(err){safeError(err);}}
function bind(){document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));document.querySelectorAll('.refresh').forEach(b=>b.addEventListener('click',refreshAll));
  $('registerOpen').addEventListener('click',openRegister);$('registerClose').addEventListener('click',()=>$('registerDialog').close());$('registerForm').addEventListener('submit',register);$('spinButton').addEventListener('click',spin);
  document.querySelectorAll('.exchange-button').forEach(b=>b.addEventListener('click',()=>askExchange(Number(b.dataset.cost))));$('confirmCancel').addEventListener('click',()=>$('confirmDialog').close());$('confirmAccept').addEventListener('click',exchange);$('drawButton').addEventListener('click',draw);$('selfGiftButton').addEventListener('click',claimSelfGift);
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
  const labels={10:'ささやかなプレゼント',50:'まあまあなプレゼント',100:'豪華なプレゼント',150:'名前入りプレゼント'};
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
renderGiftCatalog();bind();refreshAll();setInterval(()=>{if(!document.hidden)refreshAll();},60000);
