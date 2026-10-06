"use strict";

(() => {
  // ========================================
  // ① 変更して使う設定
  // ========================================

  // true  ：テスト用。何度でも引けます。結果は保存しません。
  // false ：公開用。日本時間で1日1回。結果を保存します。
  // URLに ?test=1 を付けても、この設定は変わりません。
  const testMode = true;

  // 手を入れてから結果が出るまでの待ち時間。
  // 1800 = 1.8秒
  // 紙が浮かび上がる速度は style.css で変更します。
  const revealDelay = 1800;

  // 履歴の保存先の名前。
  // 変更すると、それまでの履歴を参照しなくなります。
  const storageKey = "kagariso-enjoy-lottery-v1";

  // ========================================
  // ② HTMLとdata.jsの読み込み
  // ========================================

  const $ = selector => document.querySelector(selector);

  const handButtons = [
    ...document.querySelectorAll("[data-hand]")
  ];

  const config = window.LOTTERY_CONFIG || {};
  const data = window.REQUEST_DATA;
  const timeZone = config.timeZone || "Asia/Tokyo";

  // 演出中の連打を防ぐための状態。
  let busy = false;

  // 現在表示している結果。コピーに使用します。
  let currentResult = null;

  // ========================================
  // ③ 日付・履歴・抽選対象
  // ========================================

  // 指定された時間帯の今日を「2026-10-06」の形で取得。
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

  // このブラウザに保存されている通常モードの履歴を取得。
  function readHistory() {
    const saved = localStorage.getItem(storageKey);

    if (!saved) return [];

    const history = JSON.parse(saved);

    if (
      !Array.isArray(history) ||
      history.some(item =>
        !item ||
        typeof item.id !== "string" ||
        typeof item.date !== "string"
      )
    ) {
      throw new Error("保存されたくじの記録を読み込めません。");
    }

    return history;
  }

  // 今日の結果を取得。履歴の最後から探します。
  function getTodayResult(history) {
    const today = getToday();

    return [...history]
      .reverse()
      .find(item => item.date === today);
  }

  // 通常モードの抽選対象。
  // data.js の allowDuplicates が true なら重複を許可。
  // false または未設定なら、過去に引いたくじを除外。
  function getAvailableItems(history) {
    return data.filter(item =>
      config.allowDuplicates === true ||
      !history.some(record => record.id === item.id)
    );
  }

  // ========================================
  // ④ ボタン・案内文の更新
  // ========================================

  function refresh() {
    if (testMode) {
      $("#daily-status").textContent =
        "テストモード：全てのくじから、何度でも引けます。";

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
    } else if (available.length) {
      $("#daily-status").textContent =
        "本日のくじは、まだ引いていません。";
    } else {
      $("#daily-status").textContent =
        "すべてのくじを引き終えました。";
    }

    handButtons.forEach(button => {
      button.disabled =
        busy || Boolean(todayResult) || available.length === 0;
    });

    $("#today-button").hidden = !todayResult;
  }

  // ========================================
  // ⑤ 結果の表示
  // ========================================

  function showResult(item) {
    currentResult = item;

    $("#reveal").hidden = true;

    $("#result-category").textContent =
      item.category || "おたのしみくじ";

    $("#result-title").textContent = item.title;
    $("#result-description").textContent = item.description;

    const testLabel = item.test
      ? "【テスト・保存なし】 "
      : "";

    $("#result-date").textContent =
      `${testLabel}${item.date} ／ ${item.hand || "手"}で引いたくじ`;

    $("#copy-status").textContent = "";
    $("#result").hidden = false;

    // フォーカスだけ移動し、画面はスクロールさせません。
    // scrollIntoView() は使用しません。
    $("#result").focus({ preventScroll: true });

    // 紙の背景と浮かび上がる演出は style.css が担当します。
  }

  // ========================================
  // ⑥ 通常モードの履歴表示
  // ========================================

  function showHistory() {
    const root = $("#history-list");
    const history = readHistory().slice().reverse();

    root.replaceChildren();

    if (!history.length) {
      root.textContent = "まだ、くじの記録はありません。";
      return;
    }

    history.forEach(item => {
      const article = document.createElement("article");
      article.className = "history-item";

      const stamp = document.createElement("small");
      stamp.textContent =
        `${item.date} ／ ${item.category || "おたのしみくじ"} ／ ${item.hand || "手"}`;

      const title = document.createElement("h3");
      title.textContent = item.title;

      const body = document.createElement("p");
      body.textContent = item.description;

      article.append(stamp, title, body);
      root.append(article);
    });
  }

  // ========================================
  // ⑦ エラーが起きた場合
  // ========================================

  function reportError(error) {
    console.error(error);

    $("#draw-message").textContent =
      "くじを準備できませんでした。data.jsの読み込みと、ブラウザの保存設定を確認してください。";

    handButtons.forEach(button => {
      button.disabled = true;
    });
  }

  // ========================================
  // ⑧ くじを引く処理
  // ========================================

  function drawLottery(button) {
    if (busy) return;

    try {
      // テスト中は通常の履歴を抽選に使用しません。
      const history = testMode ? [] : readHistory();
      const date = getToday();

      // 通常モードで今日すでに引いていれば終了。
      if (!testMode && getTodayResult(history)) {
        refresh();
        return;
      }

      // 右手・左手ともに同じ抽選対象を使用。
      // テスト中は常に全件から抽選します。
      const pool = testMode
        ? data
        : getAvailableItems(history);

      if (!pool.length) {
        refresh();
        return;
      }

      const selected = pool[
        Math.floor(Math.random() * pool.length)
      ];

      const result = {
        ...selected,
        date,
        hand: button.dataset.hand,
        receivedAt: new Date().toISOString(),
        test: testMode
      };

      // 通常モードのみ保存。
      // 保存に成功してから、演出を開始します。
      if (!testMode) {
        localStorage.setItem(
          storageKey,
          JSON.stringify([...history, result])
        );
      }

      busy = true;
      refresh();

      $("#result").hidden = true;
      $("#copy-status").textContent = "";

      $("#draw-message").textContent =
        `${result.hand}を入れると、指先に何かが触れた。`;

      $("#reveal-text").textContent =
        `${result.hand}を入れると、何かが指先に触れた。`;

      $("#lottery-box").classList.add("drawing");
      $("#reveal").hidden = false;

      // 少し待ってから結果を表示。
      window.setTimeout(() => {
        busy = false;
        $("#lottery-box").classList.remove("drawing");

        $("#draw-message").textContent =
          "そっと、取り出してみる。";

        showResult(result);

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
  // ⑨ 入口・結果画面の移動
  // ========================================

  $("#enter-button").addEventListener("click", () => {
    $("#entrance").hidden = true;
    $("#lottery-screen").hidden = false;

    $("#lottery-title").focus({ preventScroll: true });

    // 入口から箱へ移動する時だけページ上部へ移動。
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

    // 結果を閉じた時も、自動スクロールを防ぎます。
    button.focus({ preventScroll: true });
  });

  // ========================================
  // ⑩ 初期設定と各ボタンの動作
  // ========================================

  try {
    // data.jsの形式とIDの重複を確認。
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      data.some(item =>
        !item ||
        typeof item.id !== "string" ||
        typeof item.title !== "string" ||
        typeof item.description !== "string"
      ) ||
      new Set(data.map(item => item.id)).size !== data.length
    ) {
      throw new Error("くじデータを確認してください。");
    }

    // テスト中は画面上部に案内を表示。
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

    // 結果をテキストとしてコピー。
    $("#copy-result").addEventListener("click", async () => {
      if (!currentResult) return;

      const testLabel = currentResult.test
        ? "【テスト結果】\n"
        : "";

      const text =
        `${testLabel}神狩荘 おたのしみくじ\n` +
        `【${currentResult.title}】\n` +
        currentResult.description;

      try {
        await navigator.clipboard.writeText(text);
        $("#copy-status").textContent = "コピーしました。";
      } catch {
        // 自動コピーできない環境では、手動コピー用に表示。
        window.prompt("結果をコピーしてください", text);
      }
    });

    // 別タブで履歴が更新された場合に表示を更新。
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

    // 他の画面からこのページへ戻った場合に更新。
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