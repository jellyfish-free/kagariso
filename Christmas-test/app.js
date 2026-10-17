'use strict';
// 神狩荘 Christmas 2026 / GitHub Pages front-end
// Cloudflare Worker: /api/state, /api/register, /api/me, /api/history,
// /api/slot, /api/exchange, /api/draw
const API = 'https://kagariso-christmas-test-api.jinchyo-hiromi.workers.dev';
const TOKEN_KEY = 'kagariso_christmas_2026_TEST_player_token';
const LEVELS = [
  { min:0, title:'小さなツリー' },{ min:5000,title:'小さな飾り' },
  { min:15000,title:'冬色のリボン' },{ min:30000,title:'明かりが灯る' },
  { min:50000,title:'てっぺんの星' },{ min:80000,title:'みんなのクリスマス' },
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
  if(name==='lottery')refreshHistory();
}
function renderPublic(){
  const data=state.public;if(!data)return;
  const growth=Number(data.tree?.growth_points||0);
  const lv=LEVELS.reduce((n,x,i)=>growth>=x.min?i:n,0), cur=LEVELS[lv],next=LEVELS[lv+1];
  $('growthPoints').textContent=format(growth);$('treeLevel').innerHTML=`${lv+1} <small>/ 6</small>`;
  $('treeLevelName').textContent=cur.title;$('treeVisual').className=`tree-shape level-${lv+1}`;
  $('treeStory').textContent=lv===5?'みんなで飾ったツリーが完成！':'次の飾りは、住人たちのポイントが運んできます。';
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
  $('registerOpen').textContent=state.me?'参加済み':'参加登録';$('drawRemaining').textContent=state.me?Math.max(0,3-Number(state.me.draw_count_today||0)):'—';
  renderRanking();updateButtons();
}
function updateButtons(){
  const hasPlayer=Boolean(state.me), play=eligible('2026-12-01'),draw=eligible('2026-12-16');
  $('spinButton').disabled=state.busy||!hasPlayer||!play;
  document.querySelectorAll('.exchange-button').forEach(button=>{button.disabled=state.busy||!hasPlayer||!play||Number(state.me?.points||0)<Number(button.dataset.cost);});
  const remaining=hasPlayer?Math.max(0,3-Number(state.me.draw_count_today||0)):0;
  $('drawButton').disabled=state.busy||!hasPlayer||!draw||remaining===0||Number(state.public?.total_stock||0)===0;
  $('lotteryHint').textContent=!draw?'くじは2026年12月16日〜24日に開催します。':Number(state.public?.total_stock||0)===0?'プレゼントがなくなり次第終了です。在庫は現在0個です。':remaining===0?'今日の抽選は3回終了しました。翌日0時（日本時間）に再び引けます。':'1日3回まで。引いたプレゼントは共通在庫からなくなります。';
}
async function refreshPublic(){try{const d=await api('/api/state');state.public=d;$('connectionDot').classList.add('online');$('connectionText').textContent='接続中';renderPublic();}catch(e){$('connectionDot').classList.remove('online');$('connectionText').textContent='接続エラー';safeError(e);}}
async function refreshMe(){if(!state.token){state.me=null;renderMe();return;}try{const d=await api('/api/me');state.me={...d.player,draw_count_today:d.draw_count_today};renderMe();}catch(e){state.me=null;renderMe();msg('参加者情報を確認できません。保存済みトークンをご確認ください。',true);}}
async function refreshAll(){await Promise.all([refreshPublic(),refreshMe()]);}
function openRegister(){if(state.me){msg('このブラウザではすでに「'+state.me.character_name+'」として参加しています。');return;}if(state.token){msg('保存済みの参加情報を確認できません。ページ更新後も続く場合は運営へ連絡してください。',true);return;}$('registerDialog').showModal();}
async function register(e){e.preventDefault();if(state.busy)return;const name=$('characterName').value.trim();if(!name)return;state.busy=true;$('registerSubmit').disabled=true;
  try{const d=await api('/api/register',{method:'POST',body:{character_name:name}});state.token=d.token;localStorage.setItem(TOKEN_KEY,state.token);$('registerDialog').close();msg('ようこそ、'+d.character_name+'さん！ クリスマスを楽しもう。');await refreshAll();}
  catch(err){safeError(err);}finally{state.busy=false;$('registerSubmit').disabled=false;updateButtons();}
}
async function spin(){if(state.busy)return;if(!state.me)return openRegister();state.busy=true;updateButtons();$('slotMessage').textContent='くるくる…';const reels=[0,1,2].map(i=>$('reel'+i));reels.forEach(r=>r.classList.add('spinning'));
  try{const d=await api('/api/slot',{method:'POST',body:{}});reels.forEach((r,i)=>{r.textContent=d.symbols?.[i]||'✦';});$('slotMessage').textContent=`${d.outcome}！ +${format(d.earned_points)} pt`;
    state.me.points=d.player.points;state.me.total_earned=d.player.total_earned;renderMe();await refreshPublic();}
  catch(err){$('slotMessage').textContent='スロットを回せませんでした';safeError(err);}finally{reels.forEach(r=>r.classList.remove('spinning'));state.busy=false;updateButtons();}
}
let chosenCost=null;
function askExchange(cost){if(!state.me)return openRegister();if(state.busy)return;const message=$('giftMessage').value.trim();if(cost===150&&!message){msg('150ptのプレゼントにはメッセージを入力してください。',true);$('giftMessage').focus();return;}chosenCost=cost;
  $('confirmText').textContent=`${cost}ptを使って${cost===150?'「'+state.me.character_name+'からのプレゼント」':'プレゼント'}を1個生成します。共通のくじへ自動登録されます。${cost===150?' メッセージ：「'+message+'」':''}`;
  $('confirmDialog').showModal();
}
async function exchange(){if(state.busy||chosenCost===null)return;const cost=chosenCost;state.busy=true;updateButtons();$('confirmAccept').disabled=true;
  try{const d=await api('/api/exchange',{method:'POST',body:{cost,...(cost===150?{message:$('giftMessage').value.trim()}:{})}});$('confirmDialog').close();if(cost===150)$('giftMessage').value='';state.me.points=d.player.points;state.me.total_earned=d.player.total_earned;renderMe();msg(`「${d.present.title}」を共通の抽選箱へ追加しました！`);await refreshPublic();await refreshHistory();}
  catch(err){safeError(err);}finally{chosenCost=null;state.busy=false;$('confirmAccept').disabled=false;updateButtons();}
}
async function draw(){if(state.busy)return;if(!state.me)return openRegister();if(!window.confirm('本日のくじを1回引きます。よろしいですか？'))return;
  state.busy=true;updateButtons();$('prizeReveal').hidden=true;
  try{const d=await api('/api/draw',{method:'POST',body:{}});$('prizeTitle').textContent=d.prize.title;$('prizeMessage').textContent=d.prize.message||'素敵なクリスマスを！';$('prizeReveal').hidden=false;
    state.me.draw_count_today=d.draw_count_today;renderMe();msg('プレゼントが当たりました！');await refreshPublic();await refreshHistory();$('prizeReveal').scrollIntoView({behavior:'smooth',block:'center'});}
  catch(err){safeError(err);}finally{state.busy=false;updateButtons();}
}
function fillHistory(target,items,kind){const root=$(target);root.replaceChildren();if(!items?.length){const p=document.createElement('p');p.className='empty';p.textContent=kind==='draw'?'まだプレゼントを受け取っていません。':'まだプレゼントを用意していません。';root.append(p);return;}
  for(const item of items){const row=document.createElement('article');row.className='history-item';const name=document.createElement('strong');name.textContent=item.title;const desc=document.createElement('small');desc.textContent=kind==='draw'?`${item.draw_date} · ${item.gift_type}pt${item.creator_name?' · '+item.creator_name+'作':''}`:`${item.gift_type}pt · ${item.status==='claimed'?'当選済':'抽選待ち'}`;row.append(name,desc);if(item.message){const p=document.createElement('p');p.textContent=item.message;row.append(p);}root.append(row);}
}
async function refreshHistory(){if(!state.me)return;try{const data=await api('/api/history');fillHistory('drawHistory',data.draws,'draw');fillHistory('generatedHistory',data.generated,'generated');}catch(err){safeError(err);}}
function bind(){document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));document.querySelectorAll('.refresh').forEach(b=>b.addEventListener('click',refreshAll));
  $('registerOpen').addEventListener('click',openRegister);$('registerClose').addEventListener('click',()=>$('registerDialog').close());$('registerForm').addEventListener('submit',register);$('spinButton').addEventListener('click',spin);
  document.querySelectorAll('.exchange-button').forEach(b=>b.addEventListener('click',()=>askExchange(Number(b.dataset.cost))));$('confirmCancel').addEventListener('click',()=>$('confirmDialog').close());$('confirmAccept').addEventListener('click',exchange);$('drawButton').addEventListener('click',draw);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshAll();});
}
bind();refreshAll();setInterval(()=>{if(!document.hidden)refreshAll();},60000);
