"use strict";

(() => {
  // ========================================
  // ① 自分で変更する設定
  // ========================================

  // true：テストモード
  // ・何度でも引ける
  // ・結果は保存しない
  // ・通常モードの回数や履歴には影響しない
  //
  // false：通常モード
  // ・日本時間で1日1回
  // ・結果をこのブラウザに保存する
  const testMode = false;

  // 景品が2つ出る確率。
  // 0.5 = 50％、0.3 = 30％、0.8 = 80％
  const twoPrizeChance = 0.03;

  // 手を入れてから結果を表示するまでの時間。
  // 1800 = 1.8秒
  // 紙が浮かぶ速さは style.css で変更します。
  const revealDelay = 1800;

  // 履歴の保存先の名前。
  // 以前の履歴を引き継ぐため、変更しないでください。
  const storageKey = "kagariso-enjoy-lottery-v1";

  // ========================================
  // ② HTMLとdata.jsの読み込み
  // ========================================

  // $("#result") のように、HTMLの要素を取得します。
  const $ = selector => document.querySelector(selector);

  const handButtons = [
    ...document.querySelectorAll("[data-hand]")
  ];

  const config = window.LOTTERY_CONFIG || {};
  const data = window.REQUEST_DATA;
  const timeZone = config.timeZone || "Asia/Tokyo";

  // 演出中の連打を防ぎます。
  let busy = false;

  // コピーするために、表示中の結果を覚えておきます。
  let currentResult = null;

  // ========================================
  // ③ 日付と履歴の読み込み
  // ========================================

  // 日本時間の今日を「2026-10-07」の形で取得。
  function getToday() {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const date = Object.fromEntries(
      parts.map(part => [part.type, part.value])
    );

    return `${date.year}-${date.month}-${date.day}`;
  }

  // 新しい履歴は prizes に景品をまとめて保存します。
  // 以前の「景品1つ」の履歴も読み込めます。
  function getPrizes(record) {
    return Array.isArray(record.prizes)
      ? record.prizes
      : [record];
  }

  function readHistory() {
    const saved = localStorage.getItem(storageKey);

    if (!saved) return [];

    const history = JSON.parse(saved);

    if (
      !Array.isArray(history) ||
      history.some(record =>
        !record ||
        typeof record.date !== "string" ||
        getPrizes(record).length === 0 ||
        getPrizes(record).some(prize =>
          !prize ||
          typeof prize.id !== "string" ||
          typeof prize.title !== "string" ||
          typeof prize.description !== "string"
        )
      )
    ) {
      throw new Error("保存された履歴を読み込めません。");
    }

    return history;
  }

  // 今日すでに引いた結果を探します。
  function getTodayResult(history) {
    const today = getToday();

    return [...history]
      .reverse()
      .find(record => record.date === today);
  }

  // ========================================
  // ④ 抽選対象の景品を決める
  // ========================================

  function getAvailableItems(history) {
    // data.js の allowDuplicates が true なら、
    // 過去に引いた景品も抽選対象になります。
    if (config.allowDuplicates === true) {
      return [...data];
    }

    // falseなら、過去に引いた景品を除外します。
    const receivedIds = new Set();

    history.forEach(record => {
      getPrizes(record).forEach(prize => {
        receivedIds.add(prize.id);
      });
    });

    return data.filter(prize => !receivedIds.has(prize.id));
  }

  // ========================================
  // ⑤ ランダムに景品を1つか2つ選ぶ
  // ========================================

  function selectPrizes(pool) {
    const candidates = [...pool];
    const selected = [];

    // 最初に、今回の景品数を決めます。
    const requestedCount =
      Math.random() < twoPrizeChance ? 2 : 1;

    // 抽選対象が1つしか残っていなければ、1つ出します。
    const count = Math.min(
      requestedCount,
      candidates.length
    );

    for (let i = 0; i < count; i++) {
      const index = Math.floor(
        Math.random() * candidates.length
      );

      // 選んだ景品を候補から取り除きます。
      // 同じ回に同じ景品が2つ出ることを防ぎます。
      selected.push(candidates.splice(index, 1)[0]);
    }

    return selected;
  }

  // ========================================
  // ⑥ 案内文とボタンの状態
  // ========================================

  function refresh() {
    if (testMode) {
      $("#daily-status").textContent =
        "テストモード：何度でも引けます。景品は1つか2つ出ます。";

      handButtons.forEach(button => {
        button.disabled = busy;
      });

      $("#today-button").hidden = true;
      return;
    }

    const history = readHistory();
    const todayResult = getTodayResult(history);
    const available = getAvailableItems(history);

    if (todayResult) {
      $("#daily-status").textContent =
        "本日のくじは、もう引きました。";
    } else if (available.length > 0) {
      $("#daily-status").textContent =
        "本日のくじは、まだ引いていません。景品は1つか2つ出ます。";
    } else {
      $("#daily-status").textContent =
        "すべてのくじを引き終えました。";
    }

    handButtons.forEach(button => {
      button.disabled =
        busy ||
        Boolean(todayResult) ||
        available.length === 0;
    });

    $("#today-button").hidden = !todayResult;
  }

  // ========================================
  // ⑦ 紙の上に結果を表示する
  // ========================================

  function showResult(record) {
    currentResult = record;

    const prizes = getPrizes(record);

    $("#reveal").hidden = true;

  // 上部に景品のカテゴリーを表示。
  // 同じカテゴリーは1回だけ表示します。
  $("#result-category").textContent = [
    ...new Set(
      prizes.map(prize => prize.category).filter(Boolean)
    )
  ].join(" ／ ");

// 2つ出たときだけ案内を表示。
// 1つのときは見出しごと隠します。
    $("#result-title").textContent =
      prizes.length > 1 ? `本日の景品は${prizes.length}つ` : "";

    $("#result-title").hidden = prizes.length === 1;

    const body = $("#result-description");
    body.replaceChildren();

    prizes.forEach((prize, index) => {
      const block = document.createElement("span");
      block.style.display = "block";

      // 2つ目の景品の前に、余白と区切り線を入れます。
      if (index > 0) {
        block.style.marginTop = "20px";
        block.style.paddingTop = "16px";
        block.style.borderTop =
          "1px solid rgba(53, 42, 34, 0.25)";
      }

      const title = document.createElement("strong");
      title.style.display = "block";
      title.textContent = prize.title;

      const description = document.createElement("span");
      description.style.display = "block";
      description.style.marginTop = "8px";
      description.textContent = prize.description;

      block.append(title, description);
      body.append(block);
    });

    const testLabel = record.test
      ? "【テスト・保存なし】 "
      : "";

    $("#result-date").textContent =
      `${testLabel}${record.date} ／ ${record.hand || "手"}で引いたくじ`;

    $("#copy-status").textContent = "";
    $("#result").hidden = false;

    // 結果にフォーカスを移しますが、
    // 自動スクロールはさせません。
    $("#result").focus({ preventScroll: true });

    // 紙の背景・浮かび上がる演出・背景の暗さ・
    // 右手と左手のボタンを隠す処理はCSSが担当します。
  }

  // ========================================
  // ⑧ これまでの履歴を表示する
  // ========================================

// くじの記録を、新しい順に表示します。
function showHistory() {
  const root = $("#history-list");
  const history = readHistory().slice().reverse();

  root.replaceChildren();

  if (!history.length) {
    root.textContent = "まだ、くじの記録はありません。";
    return;
  }

  history.forEach(record => {
    // 時刻が保存されている場合は、日本時間で表示。
    // 古い記録に時刻がなければ、日付だけ表示します。
    let dateTime = record.date;
    const receivedAt = new Date(record.receivedAt);

    if (!Number.isNaN(receivedAt.getTime())) {
      dateTime = new Intl.DateTimeFormat("ja-JP", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      }).format(receivedAt);
    }

    // 景品が2つ出た回も、景品ごとに表示します。
    getPrizes(record).forEach(prize => {
      const article = document.createElement("article");
      article.className = "history-item";

      // 日時 / カテゴリー / 右手・左手
      const stamp = document.createElement("small");
      stamp.textContent =
        `${dateTime} / ${prize.category || "未分類"} / ${record.hand || "手"}`;

      // タイトル
      const title = document.createElement("h3");
      title.textContent = prize.title;

      // 説明
      const description = document.createElement("p");
      description.textContent = prize.description;

      article.append(stamp, title, description);
      root.append(article);
    });
  });
}

  // ========================================
  // ⑨ エラーが起きた場合
  // ========================================

  function reportError(error) {
    console.error(error);

    $("#draw-message").textContent =
      "くじを準備できませんでした。data.jsの内容と、ブラウザの保存設定を確認してください。";

    handButtons.forEach(button => {
      button.disabled = true;
    });
  }

  // ========================================
  // ⑩ くじを引く処理
  // ========================================

  function drawLottery(button) {
    if (busy) return;

    try {
      // テスト中は通常の履歴を抽選に使用しません。
      const history = testMode ? [] : readHistory();
      const date = getToday();

      // 通常モードで今日すでに引いていたら終了。
      // 景品が2つ出ても、1回分のくじとして扱います。
      if (!testMode && getTodayResult(history)) {
        refresh();
        return;
      }

      // 右手でも左手でも、同じ景品一覧から選びます。
      const pool = testMode
        ? [...data]
        : getAvailableItems(history);

      if (pool.length === 0) {
        refresh();
        return;
      }

      const record = {
        date,
        hand: button.dataset.hand,
        receivedAt: new Date().toISOString(),
        test: testMode,
        prizes: selectPrizes(pool)
      };

      // 通常モードだけ、結果を保存します。
      // 保存できてから演出を始めます。
      if (!testMode) {
        localStorage.setItem(
          storageKey,
          JSON.stringify([...history, record])
        );
      }

      busy = true;
      refresh();

      $("#result").hidden = true;
      $("#copy-status").textContent = "";

      $("#draw-message").textContent =
        `${record.hand}を入れると、指先に何かが触れた。`;

      $("#reveal-text").textContent =
        `${record.hand}を入れると、何かが指先に触れた。`;

      $("#lottery-box").classList.add("drawing");
      $("#reveal").hidden = false;

      // 待ち時間が終わったら結果を表示。
      window.setTimeout(() => {
        busy = false;

        $("#lottery-box").classList.remove("drawing");

        $("#draw-message").textContent =
          "そっと、取り出してみる。";

        showResult(record);

        try {
          refresh();

          if (!$("#history").hidden) {
            showHistory();
          }
        } catch (error) {
          reportError(error);
        }
      }, revealDelay);

    } catch (error) {
      reportError(error);
    }
  }

  // ========================================
  // ⑪ 入口・結果画面の移動
  // ========================================

  $("#enter-button").addEventListener("click", () => {
    $("#entrance").hidden = true;
    $("#lottery-screen").hidden = false;

    $("#lottery-title").focus({ preventScroll: true });

    // 入口から箱へ移動するときだけ上部へ移動します。
    window.scrollTo(0, 0);
  });

  $("#back-entrance").addEventListener("click", () => {
    if (busy) return;

    $("#lottery-screen").hidden = true;
    $("#entrance").hidden = false;

    $("#enter-button").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });

  $("#close-result").addEventListener("click", () => {
    $("#result").hidden = true;

    const button = testMode
      ? handButtons[0]
      : $("#today-button");

    button.focus({ preventScroll: true });
  });

  // ========================================
  // ⑫ 初期設定と各ボタンの動作
  // ========================================

  try {
    // data.jsの形式とIDの重複を確認。
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      data.some(item =>
        !item ||
        typeof item.id !== "string" ||
        !item.id.trim() ||
        typeof item.title !== "string" ||
        typeof item.description !== "string"
      ) ||
      new Set(data.map(item => item.id)).size !== data.length
    ) {
      throw new Error(
        "景品データの形式と、IDの重複を確認してください。"
      );
    }

    if (
      !Number.isFinite(twoPrizeChance) ||
      twoPrizeChance < 0 ||
      twoPrizeChance > 1
    ) {
      throw new Error(
        "twoPrizeChance は0〜1の数値にしてください。"
      );
    }

    // テストモードの案内を画面上部に表示。
    if (testMode) {
      const banner = document.createElement("p");

      banner.textContent =
        "テストモード：何度でも引けます。結果は保存されません。";

      banner.setAttribute("role", "status");

      banner.style.cssText =
        "margin:0;padding:12px;text-align:center;background:#763c2d;color:#fff;";

      $("main").prepend(banner);
      document.title = "【テスト】" + document.title;
    }

    refresh();

    // 右手・左手のボタン。
    handButtons.forEach(button => {
      button.addEventListener("click", () => {
        drawLottery(button);
      });
    });

    // 今日の結果をもう一度表示。
    $("#today-button").addEventListener("click", () => {
      if (busy || testMode) return;

      try {
        const result = getTodayResult(readHistory());

        if (result) {
          showResult(result);
        }
      } catch (error) {
        reportError(error);
      }
    });

    // 履歴の開閉。
    $("#history-toggle").addEventListener("click", () => {
      try {
        const open = $("#history").hidden;

        $("#history").hidden = !open;

        $("#history-toggle").setAttribute(
          "aria-expanded",
          String(open)
        );

        if (open) {
          showHistory();
        }
      } catch (error) {
        reportError(error);
      }
    });

    // 今回出た景品を、まとめてコピー。
    $("#copy-result").addEventListener("click", async () => {
      if (!currentResult) return;

      const testLabel = currentResult.test
        ? "【テスト結果】\n"
        : "";

      const prizeText = getPrizes(currentResult)
        .map((prize, index) =>
          `【${index + 1}】${prize.title}\n${prize.description}`
        )
        .join("\n\n");

      const text =
        `${testLabel}神狩荘 おたのしみくじ\n\n${prizeText}`;

      try {
        await navigator.clipboard.writeText(text);
        $("#copy-status").textContent = "コピーしました。";
      } catch {
        // 自動コピーが使えない場合は手動コピー用に表示。
        window.prompt("結果をコピーしてください", text);
      }
    });

    // 別タブで履歴が変わった場合に更新。
    window.addEventListener("storage", event => {
      if (
        (event.key === storageKey || event.key === null) &&
        !busy
      ) {
        try {
          refresh();

          if (!$("#history").hidden) {
            showHistory();
          }
        } catch (error) {
          reportError(error);
        }
      }
    });

    // 他の画面から戻った場合に更新。
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !busy) {
        try {
          refresh();
        } catch (error) {
          reportError(error);
        }
      }
    });

    // 日付が変わった場合に備えて、30秒ごとに更新。
    window.setInterval(() => {
      if (!busy) {
        try {
          refresh();
        } catch (error) {
          reportError(error);
        }
      }
    }, 30000);

  } catch (error) {
    reportError(error);
  }
})();