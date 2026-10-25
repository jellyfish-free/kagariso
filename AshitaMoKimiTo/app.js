(() => {
  'use strict';

  // ゲームの保存キー、シナリオ文章、画面の描画先。
  const KEY = 'ashita-kagariso-v1', S = window.STORY, app = document.getElementById('app');
  // 新しく開始する場合の初期進行データ。
  const fresh = () => ({ version: 1, phase: 'setup', pc: 'あなた', kpc: '大切な人', intro: 0,
     loop: 0, period: 0, explored: [], notes: [], amulets: 0, offered: 0, shrineKnown: false,
    goat: false, encounterFrom: '', ending: '', log: [] });
  // 保存データがあれば再開し、なければ初期状態で開始。
  let state = load() || fresh(), notice = '';
  // ブラウザに保存された進行状況を読み込みます。
  function load() {
    try {
      let s = JSON.parse(localStorage.getItem(KEY));
      return s && s.version === 1 ? s : null;
    }
    catch {
      return null;
    }
  }
  // 現在の進行状況をブラウザに保存します。
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  // HTML要素を新規作成し、クラス名と文字を設定します。
  function el(tag, cls, text) {
    const n = document.createElement(tag); if (cls)
      n.className = cls; if (text !== undefined)
      n.textContent = text; return n;
  }
  // 指定した親要素に新しいHTML要素を追加します。
  function put(parent, tag, cls, text) { const n = el(tag, cls, text); parent.append(n); return n; }
  // ゲーム画面に見出し付きの枠を追加します。
  function section(title, cls = 'panel') {
    let p = put(app, 'section', cls); if (title)
      put(p, 'h2', '', title); return p;
  }
  // 描写テキストを枠の中に表示します。
  function text(p, t, cls = 'story') { put(p, 'div', cls, t); }
  // クリック時の処理を持つボタンを作ります。
  function btn(p, label, fn, cls = '') { let b = put(p, 'button', cls, label);
    b.type = 'button'; b.addEventListener('click', fn); return b; }
  // 状態変更→保存→再描画をまとめて実行します。
  function next(mut) { mut(); save(); render(); }
  // 同じ内容を重複させず探索記録へ追加します。
  function note(s) {
    if (!state.notes.includes(s))
      state.notes.push(s);
  }
  // 現在の進行状況・花弁・お守りの数を表示します。
  function header() {
    const p = section('', 'panel soft');
    const r = put(p, 'div', 'row');
    const inLoop = [
      'day', 'clue', 'goat', 'offer'
    ].includes(state.phase);

    const chapter = state.phase === 'intro'
      ? '第一日｜旅行'
      : inLoop
        ? `五月二十九日｜ループ ${state.loop}`
        : '神狩荘 常設シナリオ';

    put(r, 'span', 'chapter', chapter);
    put(r, 'span', 'pill', 'ダイス不要');

    if (state.loop) {
      const stats = put(p, 'div', 'stats');
      put(stats, 'span', 'stat', `黒い花弁 ${state.loop} / 6`);
      put(stats, 'span', 'stat', `奉納 ${state.offered} / 2`);
      put(stats, 'span', 'stat', `手元のお守り ${state.amulets} 個`);

      if (inLoop) {
        put(stats, 'span', 'stat', `探索 ${state.period} / 3`);
      }
      p.append(lily(state.loop));
    }
  }
  // 6枚の百合の花弁を描画し、ループ数に応じて黒くします。
  function lily(num) {
    let s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
       s.setAttribute('viewBox', '0 0 260 232'); s.setAttribute('class', 'lily');
      s.setAttribute('aria-label', `百合の花弁、${num}枚が黒い`); for (let i = 0; i < 6; i++) {
      let pet = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pet.setAttribute('d', 'M130 118 C95 95 96 35 130 14 C164 35 165 95 130 118Z');
      pet.setAttribute('transform', `rotate(${i * 60} 130 118)`);
      pet.setAttribute('fill', i < num ? '#352f3c' : '#f2e8e1');
      pet.setAttribute('stroke', '#a798a6');
      pet.setAttribute('stroke-width', '1.7');
      s.append(pet);
    } let c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
       c.setAttribute('cx', '130'); c.setAttribute('cy', '118'); c.setAttribute('r', '16');
      c.setAttribute('fill', '#ccb270'); s.append(c); return s;
  }
  // 開始画面。プレイヤー名を入力しシナリオを開始します。
  function setup() {
    const p = section('ふたりの物語を始める');

    // プレイヤー向け導入。真相はここに書かないでください。
    text(p, (
      'このシナリオは、別の世界の自分たちが体験した出来事を追体験する物語です。' +
      '結末で死亡・消失しても、神狩荘で暮らす本人たちには影響しません。\n\n' +
      'BANDで二人がRPをしながら、代表者がこのページを操作してください。' +
      '判定やダイスは使用しません。'
    ), 'story');

    // 二人の名前の入力欄。
    const labelPc = put(p, 'label', '', '参加者①の名前');
    labelPc.htmlFor = 'pc';
    const pc = put(p, 'input');
    pc.id = 'pc';
    pc.value = state.pc === 'あなた' ? '' : state.pc;
    pc.placeholder = '例：新田';

    const labelKpc = put(p, 'label', '', '参加者②の名前');
    labelKpc.htmlFor = 'kpc';
    const kpc = put(p, 'input');
    kpc.id = 'kpc';
    kpc.value = state.kpc === '大切な人' ? '' : state.kpc;
    kpc.placeholder = '例：相方';

    // 入力された二人の名前を保存して初日のシーンへ。
    btn(p, '旅行を始める', () => next(() => {
      state.pc = pc.value.trim().slice(0, 40) || 'あなた';
      state.kpc = kpc.value.trim().slice(0, 40) || '大切な人';
      state.phase = 'intro';
    }), 'primary full');

    // 初めての人でも遊べるように基本操作を案内。
    const guide = put(p, 'details', 'accordion');
    put(guide, 'summary', '', '遊び方と注意事項');
    text(guide, (
      '初日は二人で旅行を楽しむ自由RPです。' +
      '物語が進むと、画面に探索方法や選択肢が表示されます。\n' +
      '一緒に物語を読み、BANDで会話や行動を描写してください。' +
      '選択にはそれぞれ異なる結果があります。\n' +
      'どの結末でも、神狩荘で暮らす参加キャラクターが' +
      '永久に失われることはありません。'
    ), 'fine');
  }
  // 初日の旅行シーンを順番に表示します。ネタバレ禁止。
  function intro() {
    const sc = S.intro[state.intro], p = section(sc.title); put(p, 'div', 'chapter',
      `旅行の日｜${state.intro + 1} / ${S.intro.length}`); text(p, sc.text.replaceAll('あなた', state.pc)); text(p, sc.prompt, 'fine'); btn(p, state.intro === S.intro.length - 1 ? '眠りにつく' : '次の場面へ', () => next(() => {
      if (state.intro === S.intro.length - 1) {
        state.phase = 'day';
        state.loop = 1;
        state.period = 0;
      }
      else
        state.intro++;
    }), 'primary full'); let q = section('初日の自由RPについて', 'panel soft'); text(q,
      '屋台・神社・花火・温泉・蛍などは、自由に描写してかまいません。初日は探索回数の制限なし。絵馬の願いは必ず出来事として扱ってください。', 'fine');
  }
  // ループ開始時の朝の異変を表示します。
  function opening() {
    if (state.period === 0) {
      let p = section('繰り返される朝');
      text(p, state.loop === 1 ? S.loopStart : `朝、目が覚める。五月二十九日。\n${state.kpc}は今回も前日のことを覚えていない。百合の花弁は${state.loop}枚、黒く染まっている。\n${state.loop >= 4 ? '窓のすぐ外で、重い足音が響いた。' : '遠くから山羊の鳴き声がする。'}\n同じ一日を、また始めなければならない。`);
      text(p, '同じ場所を再訪してもよいですが、既に得た情報は「記録」から無料で読み返せます。', 'fine');
    }
  }
  // 一日の午前・午後・夕方の探索場所を選ぶ画面です。
  function day() {
    opening();
    let p = section(`探索｜${S.periods[state.period] || '夕方終了'}`);
    if (state.period >= 3) {
      text(p, '今日の探索は終わった。祭りの花火が遠くで上がり始める。夜が近づいている。');
      btn(p, '夜の選択へ', () => next(() => state.phase = 'night'), 'primary full');
      return;
    }
    text(p, `残り探索枠：${3 - state.period}。次の探索先をひとつ選んでください。調べた結果は自動で記録されます。`, 'fine');
    const groups = [...new Set(S.clues.map(x => x[0]))];
    for (const g of groups) {
      let d = put(p, 'details', 'accordion');
      put(d, 'summary', '', `${g}（${S.clues.filter(x => x[0] === g).length}項目）`);
      for (let i = 0; i < S.clues.length; i++) {
        let [area, name] = S.clues[i];
        if (area !== g)
          continue;
        let seen = state.explored.includes(i);
        btn(d, (seen ? '✓ ' : '') + name, () => next(() => { state.selected = i;
          state.phase = 'clue'; }), 'option' + (seen ? ' chosen' : ''));
      }
    }
    renderUtility();
  }
  // 探索先の情景と手掛かりを表示し、探索枠を消費します。
  function clue() {
    let [area, name, description, discovery] = S.clues[state.selected], p = section(`${area}｜${name}`);
    text(p, description);
    text(p, '得られた情報：' + discovery, 'fine');
    if (state.selected === 8) {
      text(p, 'お守りを入手する場合は、下のボタンで任意の数を購入できます。お守りを調べること自体はこの時間帯の探索です。', 'fine');
      btn(p, 'お守りを2つ買う', () => next(() => { state.amulets += 2; notice = 'お守りを2つ入手した。'; }), 'small');
    }
    if (state.selected === 11) {
      btn(p, 'お守りを2つ買う（社務所）', () => next(() => { state.amulets += 2; notice = 'お守りを2つ入手した。';
        }), 'small');
    }
    if (state.selected === 15) {
      btn(p, '祠で奉納する', () => next(() => { state.phase = 'offer'; }), 'primary full');
    }
    if (state.selected === 13) {
      btn(p, '黒い山羊と向き合う', () => next(() => { state.phase = 'goat'; state.goat = true;
        state.encounterFrom = '神主の祈祷'; }), 'primary full');
    }
    if (state.selected === 19) {
      text(p, '山道の奥へ進めば祠へ到着する。祠の情報は「祠」の探索項目から確認できる。', 'fine');
    }
    btn(p, '調査を終える（この時間帯を消費）', () => next(() => {
      if (!state.explored.includes(state.selected))
        state.explored.push(state.selected);
          note(`${area}｜${name}：${discovery}`); if (state.selected === 15)
        state.shrineKnown = true; state.period++; state.phase = 'day'; notice = '調査した内容を記録した。';
    }), 'primary full');
    btn(p, '調査をやめる（枠を消費しない）', () => next(() => state.phase = 'day'), 'ghost full');
  }
  // 祠でお守りを奉納する処理です。奉納個数で分岐します。
  function offer() {
    let p = section('祠への奉納');
    text(p, '祠は、黒い山羊の主に捧げ物を届ける場所。\nお守りを供えると、それは人間の身代わりとして受け取られる。\n\n二人に必要な身代わりは、いくつだろうか。');
    text(p, `手元：${state.amulets}個　／　奉納済み：${state.offered}個`, 'fine');
    for (let n of [1, 2]) {
      let b = btn(p, `${n}個を奉納する`, () => next(() => {
        state.amulets -= n; state.offered += n;
          note(`祠にお守りを${n}個奉納した（合計${state.offered}個）。`); if (state.offered >= 2) {
          state.ending = 'A';
          state.phase = 'ending';
        }
        else {
          state.phase = 'goat';
          state.goat = true;
          state.encounterFrom = '祠で一つ奉納';
        }
      }), 'option' + (n === 2 ? ' primary' : ''));
      b.disabled = state.amulets < n || state.offered + n > 2;
    }
    btn(p, '何も供えず引き返す', () => next(() => { state.phase = 'day'; notice = '何も奉納しなかった。'; }), 'ghost full');
  }
  // 黒い山羊との遭遇時に対話・戦闘・逃走を選びます。
  function goat() {
    const p = section('黒い山羊');
    text(p, (
      '神主の祈祷も、古い祠も、とうとう二人を見つけてしまったらしい。\n' +
      '黒い靄から、角を持つ巨大な山羊が姿を現す。\n\n' +
      '「ようやく見つけた。主への献上品は、お前ら二人だ」\n\n' +
      `${state.kpc}はあなたの手を握る。どうする？`
    ));

    // 戦闘技能やダイスの判定は使わず、行動を選択する。
    const acts = put(p, 'div', 'stack');
    btn(acts, '対話する：「願いの叶え方が違う」', () => next(() => {
      state.phase = 'goatTalk';
    }), 'full');
    btn(acts, '戦う・相手を守る', () => next(() => {
      state.phase = 'goatFight';
    }), 'full');
    btn(acts, 'お守りを使う方法を考える', () => next(() => {
      state.phase = 'goatHint';
    }), 'full');
    btn(acts, '百合の間へ逃げる', () => next(() => {
      state.phase = 'night';
      notice = '黒い山羊は結界の内側には入って来られない。';
    }), 'full');
  }
  // 黒い山羊への対処とお守りによる別解を処理します。
  function goatBranch() {
    let p = section(state.phase === 'goatTalk' ? '言葉で抗う' : state.phase === 'goatFight' ? '立ちはだかる' : '身代わりの意味'); if (state.phase === 'goatTalk')
      text(p, '「ずっと一緒にいたい」と願うことと、魂を食われることは同じではない。\n黒い山羊は、言葉の意味などどうでもよいとばかりに唸る。\n「永遠に一緒だ。何が不服だ？」'); if (state.phase === 'goatFight')
      text(p, 'あなたは相手をかばい、黒い山羊の前に立つ。攻撃しても影が歪むばかりで、倒せる気配がない。\nけれど、その間だけは大切な人を守れる。山羊を倒す以外の方法が必要だ。'); if (state.phase === 'goatHint')
      text(p, (
              "お守りに記された言葉が蘇る。\n「このお守りが貴方の身を守る代わりになることを願う」\n" +
              "祠で守り袋が命の身代わりになった伝承。\n\n" +
              "もし山羊に身代わりそのものを食べさせたら、主へ献上すべき品を勝手に食べたことになるのではないか。"
            )); if (state.amulets > 0)
      btn(p, 'お守りを黒い山羊へ投げつける', () => next(() => { state.amulets--; state.phase = 'ending';
        state.ending = 'A_ALT'; note('山羊にお守りを食べさせ、絵馬を破棄させた。'); }), 'primary full');
    else
      text(p, '手元に投げつけられるお守りはない。', 'warning'); btn(p, '百合の間へ逃げる',
         () => next(() => state.phase = 'night'), 'full'); btn(p, 'もう一度対峙する',
        () => next(() => state.phase = 'goat'), 'ghost full');
  }
  // 毎晩の帰還選択と百合の花弁の進行を処理します。
  function night() {
    let p = section('一日の終わり'); text(p, '遠くで最後の花火が上がる。\n夜空の光が消えると、辺りは深い暗闇に包まれていく。\n\nメェェェエエエ――。\n\n何かが二人を探している。旅館へ戻れば、今夜も百合の結界が守ってくれるかもしれない。'); btn(p, '旅館へ戻る（今日の探索を終える）', () => next(() => {
      if (state.loop >= 5) {
        state.loop = 6;
        state.phase = 'ending';
        state.ending = state.offered === 1 ? 'B' : 'C';
      }
      else {
        state.loop++;
        state.period = 0;
        state.phase = 'day';
      }
    }), 'primary full'); btn(p, '旅館には帰らない（逃げ出す）', () => next(() => { state.ending = 'D';
      state.phase = 'ending'; }), 'danger full'); text(p, 'この選択は確定します。旅館に帰らない場合は、神狩荘版・未解決ENDになります。', 'fine');
  }
  // エンディング本文。ここを編集すると結末の文章を変更できます。
  const endings = { A: { title: 'END A ― 明日も君と',
     description: '目を覚ますと、五月三十日。\nあれほど繰り返した日付が、ようやく進んでいる。\n隣には、大切な人の寝顔。\n二人で迎える明日が、確かにここにある。' },
    A_ALT: { title: 'END A ― 明日も君と（別解）', description: (
              "黒い山羊はお守りを飲み込んで、はたと動きを止めた。\n主へ献上するはずの品を、食べてしまった。\n" +
              "「……もう、その願いはなしだ！」\n山羊は絵馬を吐き出し、乱暴に踏み砕く。" +
              "黒い靄が消え、百合の彫刻に白さが戻った。\n翌朝、五月三十日。二人は確かに同じ明日を迎える。"
            ) }, B: { title: 'END B ― 君のいない明日（仮題）', description: '朝が来た。\nカレンダーには五月三十日とある。\nもうループは起きない。\nけれど、隣には誰もいなかった。\n何度名前を呼んでも、返事はない。\n一人分だけの身代わりが、守ったのはあなたの明日だった。' }, C: { title: 'END C ― 永遠にキミと', description: (
              "六枚目の百合が黒く染まった。\n守り続けていた結界は、ついに呪いへと変わる。\n" +
              "闇の奥から、黒い山羊の鳴き声が響く。\n二人の魂は主へ献上される。\nここではない、どこか。" +
              "時間も命も意味を持たない場所で。\nふたりは永遠に、共に在るだろう。"
            ) }, D: { title: '未解決END ― 帰る場所（仮題）', description: (
              "気がつけば、見慣れた天井があった。神狩荘の自室だ。\n隣には、確かに大切な人がいる。\nああ、よかった。\n" +
              "手を伸ばそうとした、その瞬間。\n\nメェェェェエエエ――。\n\n耳元で、何かが鳴いた。\n" +
              "今日も、何かが俺たちを探し、彷徨う音が聞こえる。"
            ) } };
  // 現在のエンディングを表示します。
  function ending() { const e = endings[state.ending] || endings.C, p = section(e.title);
     put(p, 'div', 'chapter', '物語の結末'); text(p, e.description); put(p, 'div', 'divider'); text(p,
     '神狩荘版では、ここまでの出来事は「別次元の自分たちの追体験」です。どの結末でも、神狩荘の住人としての二人は無事で、日常のRPを続けられます。', 'fine');
     let a = put(p, 'div', 'actions'); btn(a, '物語の記録を保存', exportSave, 'primary'); btn(a,
    '最初から別の二人で遊ぶ', reset, 'ghost'); }
  // 探索記録とセーブ関連の補助ボタンを表示します。
  function renderUtility() {
    let p = section('探索記録・便利機能', 'panel soft'); let d = put(p, 'details', 'accordion'); put(d,
      'summary', '', 'これまでに得た情報'); if (state.notes.length) {
      let ul = put(d, 'ul');
      for (const n of state.notes)
        put(ul, 'li', 'fine', n);
    }
    else
      text(d, 'まだ記録はありません。', 'fine'); let tools = put(p, 'div', 'actions'); btn(tools,
         'セーブを出力', exportSave, 'small'); btn(tools, 'セーブを読込',
         () => document.getElementById('fileImport').click(), 'small'); btn(tools, '最初からやり直す', reset,
        'small ghost');
  }
  // 進行状況をJSONファイルとして保存します。
  function exportSave() { let b = new Blob([JSON.stringify(state, null, 2)],
     { type: 'application/json' }), url = URL.createObjectURL(b), a = document.createElement('a');
     a.href = url; a.download = 'ashita-save.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); }
  // 確認後にセーブを初期化します。
  function reset() {
    if (!confirm('現在のセーブを削除して最初から始めますか？'))
      return; state = fresh(); save(); render();
  }
  // ゲームの状態に対応する画面だけを描画します。
  function render() {
    app.replaceChildren(); if (state.phase !== 'setup')
      header(); if (state.phase === 'setup')
      setup();
    else if (state.phase === 'intro')
      intro();
    else if (state.phase === 'day')
      day();
    else if (state.phase === 'clue')
      clue();
    else if (state.phase === 'offer')
      offer();
    else if (state.phase === 'goat')
      goat();
    else if (['goatTalk', 'goatFight', 'goatHint'].includes(state.phase))
      goatBranch();
    else if (state.phase === 'night')
      night();
    else if (state.phase === 'ending')
      ending(); if (notice) {
        let x = put(app, 'p', 'toast', notice);
        notice = '';
      } if (!['setup', 'day', 'ending'].includes(state.phase)) {
        let p = section('セーブ', 'panel soft');
        let r = put(p, 'div', 'actions');
        btn(r, 'セーブを書き出す', exportSave, 'small');
        btn(r, '最初からやり直す', reset, 'small ghost');
      } let f = document.getElementById('fileImport'); if (!f) {
        f = el('input');
        f.type = 'file';
        f.id = 'fileImport';
        f.accept = '.json,application/json';
        f.addEventListener('change', async () => {
          try {
            const s = JSON.parse(await f.files[0].text());
            if (s.version !== 1 || !['setup', 'intro', 'day', 'clue', 'offer', 'goat',
              'goatTalk', 'goatFight', 'goatHint', 'night', 'ending'].includes(s.phase))
              throw Error('invalid');
            if (!confirm('読み込んだセーブで現在の進行を上書きしますか？'))
              return;
            state = s;
            save();
            render();
          }
          catch {
            alert('セーブデータを読み込めませんでした。');
          }
          finally {
            f.value = '';
          }
        });
        document.body.append(f);
      } window.scrollTo({ top: 0, behavior: 'instant' });
  }
  // 読み込み完了後、現在のシーンを描画します。
  render();
})();
