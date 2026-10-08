/* ========================================
   TEST MODE

   false
   → 本番

   true
   → テスト用データを別保存
      本番の記録には影響しない
======================================== */

const TEST_MODE = false;


/* ========================================
   基本設定
======================================== */

const MAX_QUESTIONS = 3;

const MAX_WRONG = 2;

const TOTAL_PUZZLES = 10;


const STORAGE_KEY =
  TEST_MODE
    ? "kagarisoHalloweenGame_TEST_v2"
    : "kagarisoHalloweenGame_v2";


/* ========================================
   DOM
======================================== */

const screen =
  document.getElementById(
    "screen"
  );

const testModeLabel =
  document.getElementById(
    "testModeLabel"
  );

const totalProgress =
  document.getElementById(
    "totalProgress"
  );

const redProgress =
  document.getElementById(
    "redProgress"
  );

const blueProgress =
  document.getElementById(
    "blueProgress"
  );

const progressFill =
  document.getElementById(
    "progressFill"
  );


if (TEST_MODE) {

  testModeLabel.hidden = false;

}


/* ========================================
   日付
======================================== */

function getToday() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


let sessionDate =
  getToday();


/* ========================================
   セーブデータ初期値
======================================== */

function createInitialSaveData() {

  return {

    clearedPuzzleIds: [],

    gameCompleted:
      false,

    completedDate:
      null,

    daily: {

      date:
        null,

      selectedGhost:
        null,

      puzzleId:
        null,

      wrongCount:
        0,

      cleared:
        false,

      reward:
        null,

      rewardClaimed:
        false

    },

    clearHistory: [],

    rewardHistory: []

  };

}


/* ========================================
   セーブ読込
======================================== */

function loadSaveData() {

  const raw =
    localStorage.getItem(
      STORAGE_KEY
    );


  if (!raw) {

    return createInitialSaveData();

  }


  try {

    const parsed =
      JSON.parse(
        raw
      );


    const initial =
      createInitialSaveData();


    return {

      ...initial,

      ...parsed,

      daily: {

        ...initial.daily,

        ...(parsed.daily || {})

      },

      clearedPuzzleIds:
        Array.isArray(
          parsed.clearedPuzzleIds
        )
          ? parsed.clearedPuzzleIds
          : [],

      clearHistory:
        Array.isArray(
          parsed.clearHistory
        )
          ? parsed.clearHistory
          : [],

      rewardHistory:
        Array.isArray(
          parsed.rewardHistory
        )
          ? parsed.rewardHistory
          : []

    };

  }

  catch {

    return createInitialSaveData();

  }

}


/* ========================================
   保存
======================================== */

function saveGame() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      saveData
    )
  );

}


let saveData =
  loadSaveData();


/* ========================================
   共通関数
======================================== */

function randomFrom(
  list
) {

  if (
    !list ||
    !list.length
  ) {

    return null;

  }


  return list[
    Math.floor(
      Math.random() *
      list.length
    )
  ];

}


/* ========================================
   景品抽選

   現在はダブりあり
======================================== */

function randomReward() {

  return randomFrom(
    REWARDS
  );

}


/* ========================================
   問題取得
======================================== */

function getPuzzleById(
  puzzleId
) {

  return PUZZLES.find(
    puzzle =>
      puzzle.id ===
      puzzleId
  );

}


/* ========================================
   おばけ別問題取得
======================================== */

function getGhostPuzzles(
  ghostId
) {

  return PUZZLES.filter(
    puzzle =>
      puzzle.ghost ===
      ghostId
  );

}


/* ========================================
   未クリア問題取得
======================================== */

function getUnclearedGhostPuzzles(
  ghostId
) {

  return getGhostPuzzles(
    ghostId
  ).filter(
    puzzle =>
      !saveData
        .clearedPuzzleIds
        .includes(
          puzzle.id
        )
  );

}


/* ========================================
   おばけ別クリア数
======================================== */

function getGhostClearCount(
  ghostId
) {

  return getGhostPuzzles(
    ghostId
  ).filter(
    puzzle =>
      saveData
        .clearedPuzzleIds
        .includes(
          puzzle.id
        )
  ).length;

}


/* ========================================
   片方のおばけが
   5 / 5 になっているか
======================================== */

function hasAnyGhostCompleted() {

  const redCompleted =
    getGhostClearCount(
      "red"
    ) >= 5;


  const blueCompleted =
    getGhostClearCount(
      "blue"
    ) >= 5;


  return (
    redCompleted ||
    blueCompleted
  );

}


/* ========================================
   全10問クリア済みか
======================================== */

function isCompleted() {

  return (
    saveData
      .clearedPuzzleIds
      .length >=
    TOTAL_PUZZLES
  );

}


/* ========================================
   選択TOP画像を決める

   両方未コンプリート
   → ghost-select.png

   赤または青の片方5/5
   → ghost-select-after-complete.png

   10/10
   → ghost-select-all-complete.png
======================================== */

function getTopImage() {

  if (
    isCompleted()
  ) {

    return (
      UI_IMAGES
        .selectAllComplete
    );

  }


  if (
    hasAnyGhostCompleted()
  ) {

    return (
      UI_IMAGES
        .selectAfterGhostComplete
    );

  }


  return (
    UI_IMAGES.select
  );

}


/* ========================================
   HTMLエスケープ
======================================== */

function escapeHTML(
  text
) {

  return String(
    text ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    )

    .replace(
      /\n/g,
      "<br>"
    );

}


/* ========================================
   単体のおばけ画像
======================================== */

function renderGhostImage(
  ghostId
) {

  const ghost =
    GHOSTS[
      ghostId
    ];


  if (!ghost) {

    return "";

  }


  return `
    <div class="ghost-figure ${ghostId}">

      <img
        src="${ghost.image}"
        alt="${escapeHTML(
          ghost.name
        )}"
      >

    </div>
  `;

}


/* ========================================
   景品表示

   新形式
   {
     id: "...",
     name: "...",
     image: "item/....png"
   }

   に対応。

   古い文字列形式のセーブにも対応。
======================================== */

/* ========================================
   景品表示
======================================== */

function renderReward(
  reward
) {

  if (!reward) {

    return `
      <div class="reward-item">

        <div class="reward-name">
          ―
        </div>

      </div>
    `;

  }


  /*
    古いセーブデータが
    文字列だった場合
  */

  if (
    typeof reward ===
    "string"
  ) {

    return `
      <div class="reward-item">

        <div class="reward-name">
          ${escapeHTML(
            reward
          )}
        </div>

      </div>
    `;

  }


  /*
    画像付き景品
  */

  const fileName =
    reward.image
      .split("/")
      .pop();


  return `
    <div class="reward-item">

      ${
        reward.image
          ? `
            <img
              src="${escapeHTML(
                reward.image
              )}"
              alt="${escapeHTML(
                reward.name
              )}"
              class="reward-image"
            >

            <a
              href="${escapeHTML(
                reward.image
              )}"
              download="${escapeHTML(
                fileName
              )}"
              class="reward-download-button"
            >
              画像を保存する
            </a>
          `
          : ""
      }

      <div class="reward-name">
        ${escapeHTML(
          reward.name
        )}
      </div>

    </div>
  `;

}


/* ========================================
   進行状況
======================================== */

function updateProgress() {

  const total =
    saveData
      .clearedPuzzleIds
      .length;


  const red =
    getGhostClearCount(
      "red"
    );


  const blue =
    getGhostClearCount(
      "blue"
    );


  totalProgress.textContent =
    `${total} / ${TOTAL_PUZZLES}`;


  redProgress.textContent =
    `🔴 ${red} / 5`;


  blueProgress.textContent =
    `🔵 ${blue} / 5`;


  progressFill.style.width =
    `${(total / TOTAL_PUZZLES) * 100}%`;

}


/* ========================================
   日付更新
======================================== */

function prepareToday() {

  const today =
    getToday();


  if (
    saveData.daily.date ===
    today
  ) {

    return;

  }


  saveData.daily = {

    date:
      today,

    selectedGhost:
      null,

    puzzleId:
      null,

    wrongCount:
      0,

    cleared:
      false,

    reward:
      null,

    rewardClaimed:
      false

  };


  saveGame();

}


/* ========================================
   現在のゲーム状態
======================================== */

let currentPuzzle =
  null;

let questionCount =
  0;

let askedQuestionKeys =
  [];


/* ========================================
   起動
======================================== */

function initializeGame() {

  prepareToday();

  updateProgress();


  /*
    全10問クリア済み
  */

  if (
    saveData.gameCompleted ||
    isCompleted()
  ) {

    if (
      !saveData.gameCompleted
    ) {

      saveData.gameCompleted =
        true;


      saveData.completedDate =
        saveData.completedDate ||
        getToday();


      saveGame();

    }


    showAfterComplete();

    return;

  }


  /*
    今日すでに正解済み
  */

  if (
    saveData.daily.cleared
  ) {

    showTodayCleared();

    return;

  }


  /*
    今日すでに2回不正解
  */

  if (
    saveData.daily.wrongCount >=
    MAX_WRONG
  ) {

    showLocked();

    return;

  }


  /*
    今日の問題がすでに固定済み
  */

  if (
    saveData.daily.puzzleId
  ) {

    currentPuzzle =
      getPuzzleById(
        saveData.daily.puzzleId
      );


    if (currentPuzzle) {

      startQuestionRound();

      return;

    }

  }


  showTop();

}


/* ========================================
   TOP
======================================== */

function showTop() {

  const redRemaining =
    getUnclearedGhostPuzzles(
      "red"
    ).length;


  const blueRemaining =
    getUnclearedGhostPuzzles(
      "blue"
    ).length;


  const redCleared =
    5 -
    redRemaining;


  const blueCleared =
    5 -
    blueRemaining;


  const topImage =
    getTopImage();


  screen.innerHTML =
`
<section class="screen">

  <h2>
    どちらのおばけちゃんを助ける？
  </h2>


  <div class="ghost-select-message">

    赤のおばけちゃんと
    青のおばけちゃん。

    <br>

    どちらもハロウィンに使う
    大切なものを
    なくしてしまったようです。

    <br><br>

    今日助けるおばけちゃんを
    選んでください。

  </div>


  <div class="ghost-select-scene">

    <img
      src="${topImage}"
      alt="赤のおばけちゃんと青のおばけちゃん"
      class="ghost-select-image"
    >


    <!-- 赤 -->

    <button
      type="button"
      class="ghost-hotspot red"
      id="selectRed"
      aria-label="赤のおばけちゃんを選ぶ"
      ${
        redRemaining === 0
          ? "disabled"
          : ""
      }
    ></button>


    <div class="ghost-select-label red">

      ${
        redRemaining === 0
          ? "🔴 COMPLETE"
          : `🔴 赤　${redCleared} / 5`
      }

    </div>


    ${
      redRemaining === 0
        ? `
          <div class="ghost-complete-mark red">
            ✓ 全部見つかった！
          </div>
        `
        : ""
    }


    <!-- 青 -->

    <button
      type="button"
      class="ghost-hotspot blue"
      id="selectBlue"
      aria-label="青のおばけちゃんを選ぶ"
      ${
        blueRemaining === 0
          ? "disabled"
          : ""
      }
    ></button>


    <div class="ghost-select-label blue">

      ${
        blueRemaining === 0
          ? "🔵 COMPLETE"
          : `🔵 青　${blueCleared} / 5`
      }

    </div>


    ${
      blueRemaining === 0
        ? `
          <div class="ghost-complete-mark blue">
            ✓ 全部見つかった！
          </div>
        `
        : ""
    }

  </div>


  <div class="small">

    画像の赤または青のおばけちゃんを
    選んでください。

    <br><br>

    一度選ぶと、
    今日の問題は固定されます。

    <br>

    問題を変更したり、
    もう一方のおばけちゃんへ
    変更することはできません。

  </div>


  ${renderTestControls()}

</section>
`;


  const redButton =
    document.getElementById(
      "selectRed"
    );


  const blueButton =
    document.getElementById(
      "selectBlue"
    );


  if (
    redButton &&
    !redButton.disabled
  ) {

    redButton.addEventListener(
      "click",
      () => {

        chooseGhost(
          "red"
        );

      }
    );

  }


  if (
    blueButton &&
    !blueButton.disabled
  ) {

    blueButton.addEventListener(
      "click",
      () => {

        chooseGhost(
          "blue"
        );

      }
    );

  }


  attachTestControls();

}


/* ========================================
   おばけ選択
======================================== */

function chooseGhost(
  ghostId
) {

  const candidates =
    getUnclearedGhostPuzzles(
      ghostId
    );


  if (
    !candidates.length
  ) {

    showTop();

    return;

  }


  const puzzle =
    randomFrom(
      candidates
    );


  saveData.daily.selectedGhost =
    ghostId;


  saveData.daily.puzzleId =
    puzzle.id;


  saveData.daily.wrongCount =
    0;


  saveData.daily.cleared =
    false;


  saveData.daily.reward =
    null;


  saveGame();


  currentPuzzle =
    puzzle;


  startQuestionRound();

}


/* ========================================
   質問を最初から開始
======================================== */

function startQuestionRound() {

  currentPuzzle =
    getPuzzleById(
      saveData.daily.puzzleId
    );


  if (
    !currentPuzzle
  ) {

    showTop();

    return;

  }


  questionCount =
    0;


  askedQuestionKeys =
    [];


  showQuestions();

}


/* ========================================
   質問10択
======================================== */

function showQuestions() {

  const ghost =
    GHOSTS[
      currentPuzzle.ghost
    ];


  const remainingQuestions =
    MAX_QUESTIONS -
    questionCount;


  const answerAttempts =
    MAX_WRONG -
    saveData.daily.wrongCount;


  screen.innerHTML =
`
<section class="screen">

  ${renderGhostImage(
    currentPuzzle.ghost
  )}


  <div class="ghost-name">
    ${escapeHTML(
      ghost.name
    )}
  </div>


  <div class="status">

    質問できる回数：
    あと${remainingQuestions}回

    ｜
    回答チャンス：
    あと${answerAttempts}回

  </div>


  <div class="dialogue">
「何をなくしたのか、
ぼくもちゃんと
思い出せなくて……。

聞きたいことを
選んでね。

質問できるのは
3つまでだよ」
  </div>


  <div
    class="choices"
    id="questionChoices"
  ></div>

</section>
`;


  const area =
    document.getElementById(
      "questionChoices"
    );


  QUESTIONS.forEach(
    question => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.textContent =
        question.text;


      if (
        askedQuestionKeys.includes(
          question.key
        )
      ) {

        button.disabled =
          true;

      }


      button.addEventListener(
        "click",
        () => {

          askQuestion(
            question
          );

        }
      );


      area.appendChild(
        button
      );

    }
  );

}


/* ========================================
   質問への回答
======================================== */

function askQuestion(
  question
) {

  if (
    askedQuestionKeys.includes(
      question.key
    )
  ) {

    return;

  }


  askedQuestionKeys.push(
    question.key
  );


  questionCount++;


  const answer =
    currentPuzzle.answers[
      question.key
    ];


  const ghost =
    GHOSTS[
      currentPuzzle.ghost
    ];


  const remaining =
    MAX_QUESTIONS -
    questionCount;


  screen.innerHTML =
`
<section class="screen">

  ${renderGhostImage(
    currentPuzzle.ghost
  )}


  <div class="ghost-name">
    ${escapeHTML(
      ghost.name
    )}
  </div>


  <div class="status">
    質問できる回数：
    あと${remaining}回
  </div>


  <div class="dialogue">
あなた
「${escapeHTML(
  question.text
)}」

${escapeHTML(
  ghost.name
)}
「${escapeHTML(
  answer
)}」
  </div>


  <div
    class="choices"
    id="afterAnswerChoices"
  ></div>

</section>
`;


  const area =
    document.getElementById(
      "afterAnswerChoices"
    );


  if (
    questionCount >=
    MAX_QUESTIONS
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "primary-button";


    button.textContent =
      "なくしたものを答える";


    button.addEventListener(
      "click",
      showFinalAnswers
    );


    area.appendChild(
      button
    );


    return;

  }


  const nextButton =
    document.createElement(
      "button"
    );


  nextButton.type =
    "button";


  nextButton.className =
    "primary-button";


  nextButton.textContent =
    "次の質問を選ぶ";


  nextButton.addEventListener(
    "click",
    showQuestions
  );


  area.appendChild(
    nextButton
  );

}


/* ========================================
   最終回答
======================================== */

function showFinalAnswers() {

  const ghost =
    GHOSTS[
      currentPuzzle.ghost
    ];


  const candidates =
    getGhostPuzzles(
      currentPuzzle.ghost
    );


  const attempts =
    MAX_WRONG -
    saveData.daily.wrongCount;


  screen.innerHTML =
`
<section class="screen">

  ${renderGhostImage(
    currentPuzzle.ghost
  )}


  <div class="ghost-name">
    ${escapeHTML(
      ghost.name
    )}
  </div>


  <h2>
    なくしたものはどれ？
  </h2>


  <div class="status">
    回答チャンス：
    あと${attempts}回
  </div>


  <div class="dialogue">
「……ねえ。

ぼくがなくしたもの、
わかった？」
  </div>


  <div
    class="choices"
    id="answerChoices"
  ></div>

</section>
`;


  const area =
    document.getElementById(
      "answerChoices"
    );


  candidates.forEach(
    puzzle => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "answer-button";


     const text =
  document.createElement(
    "span"
  );

text.className =
  "answer-text";

text.textContent =
  puzzle.name;

button.appendChild(
  text
);


      button.addEventListener(
        "click",
        () => {

          checkFinalAnswer(
            puzzle.id
          );

        }
      );


      area.appendChild(
        button
      );

    }
  );

}


/* ========================================
   最終回答判定
======================================== */

function checkFinalAnswer(
  selectedPuzzleId
) {

  if (
    selectedPuzzleId ===
    currentPuzzle.id
  ) {

    handleCorrect();

    return;

  }


  handleWrong();

}


/* ========================================
   不正解
======================================== */

function handleWrong() {

  saveData.daily.wrongCount++;


  saveGame();


  if (
    saveData.daily.wrongCount >=
    MAX_WRONG
  ) {

    showLocked();

    return;

  }


  const ghost =
    GHOSTS[
      currentPuzzle.ghost
    ];


  screen.innerHTML =
`
<section class="screen">

  ${renderGhostImage(
    currentPuzzle.ghost
  )}


  <div class="ghost-name">
    ${escapeHTML(
      ghost.name
    )}
  </div>


  <h2>
    ちがうみたい……
  </h2>


  <div class="dialogue">
「……ううん。

それじゃないみたい。

もう一度だけ、
最初から考えてみて。

なくしたものは
さっきと同じだよ。

質問はまた
3つ選んでいいからね」
  </div>


  <div class="status">
    残り回答チャンス：1回
  </div>


  <div class="choices">

    <button
      type="button"
      class="primary-button"
      id="retryButton"
    >
      最初から質問する
    </button>

  </div>

</section>
`;


  document
    .getElementById(
      "retryButton"
    )
    .addEventListener(
      "click",
      startQuestionRound
    );

}


/* ========================================
   2回不正解
======================================== */

function showLocked() {

  const puzzle =
    getPuzzleById(
      saveData.daily.puzzleId
    );


  const ghostId =
    puzzle
      ? puzzle.ghost
      : saveData.daily.selectedGhost;


  screen.innerHTML =
`
<section class="screen">

  ${
    ghostId
      ? renderGhostImage(
          ghostId
        )
      : ""
  }


  <h2>
    きょうの挑戦はおしまい
  </h2>


  <div class="dialogue">
「今日はもう、
思い出せそうにないや……。

また明日、
探しにきてくれる？」
  </div>


  <div class="small">

    本日は2回不正解だったため、
    これ以上回答できません。

    <br><br>

    日付が変わると、
    また遊べます。

  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   正解
======================================== */

function handleCorrect() {

  if (
    !saveData
      .clearedPuzzleIds
      .includes(
        currentPuzzle.id
      )
  ) {

    saveData
      .clearedPuzzleIds
      .push(
        currentPuzzle.id
      );

  }


  /*
    景品抽選

    一度決まった景品は
    その日の間固定。
  */

  if (
    !saveData.daily.reward
  ) {

    saveData.daily.reward =
      randomReward();

  }


  saveData.daily.cleared =
    true;


  /*
    正解履歴
  */

  const alreadyRecorded =
    saveData
      .clearHistory
      .some(
        record =>
          record.puzzleId ===
          currentPuzzle.id
      );


  if (
    !alreadyRecorded
  ) {

    saveData
      .clearHistory
      .push({

        date:
          getToday(),

        ghost:
          currentPuzzle.ghost,

        puzzleId:
          currentPuzzle.id,

        puzzleName:
          currentPuzzle.name,

        reward:
          saveData.daily.reward

      });

  }


  /*
    景品履歴
  */

  const rewardAlreadyRecorded =
    saveData
      .rewardHistory
      .some(
        record =>
          record.date ===
            getToday() &&
          record.type ===
            "puzzle"
      );


  if (
    !rewardAlreadyRecorded
  ) {

    saveData
      .rewardHistory
      .push({

        date:
          getToday(),

        type:
          "puzzle",

        reward:
          saveData.daily.reward

      });

  }


  /*
    全10問正解
  */

  if (
    isCompleted()
  ) {

    saveData.gameCompleted =
      true;


    saveData.completedDate =
      getToday();

  }


  saveGame();

  updateProgress();


  if (
    isCompleted()
  ) {

    showEnding();

    return;

  }


  showCorrect();

}


/* ========================================
   通常正解
======================================== */

function showCorrect() {

  const ghost =
    GHOSTS[
      currentPuzzle.ghost
    ];


  screen.innerHTML =
`
<section class="screen">

  ${renderGhostImage(
    currentPuzzle.ghost
  )}


  <div class="ghost-name">
    ${escapeHTML(
      ghost.name
    )}
  </div>


  <h2>
    せいかい！
  </h2>


  <div class="dialogue">
${escapeHTML(
  currentPuzzle.ending
)}
  </div>


  <div class="reward-box">

    おばけちゃんからのお礼

    <br><br>

    ${renderReward(
      saveData.daily.reward
    )}

  </div>


  <div class="small">

    見つけたなくしもの：
    ${saveData.clearedPuzzleIds.length}
    / ${TOTAL_PUZZLES}

    <br><br>

    今日はこれでおしまいです。

    <br>

    また明日、
    おばけちゃんを助けにきてね。

  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   今日すでに正解済み
======================================== */

function showTodayCleared() {

  const ghostId =
    saveData.daily.selectedGhost;


  screen.innerHTML =
`
<section class="screen">

  ${
    ghostId
      ? renderGhostImage(
          ghostId
        )
      : ""
  }


  <h2>
    きょうはクリア済み！
  </h2>


  <div class="dialogue">
「今日はもう
なくしものを
見つけてもらったよ。

ありがとう！

また明日、
遊びにきてね」
  </div>


  <div class="reward-box">

    今日の景品

    ${renderReward(
      saveData.daily.reward
    )}

  </div>


  <div class="small">

    見つけたなくしもの：
    ${saveData.clearedPuzzleIds.length}
    / ${TOTAL_PUZZLES}

  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   10問目正解
   エンディング

   ここから最終画像
======================================== */

function showEnding() {

  screen.innerHTML =
`
<section class="screen">

  <div class="ghost-select-scene">

    <img
      src="${UI_IMAGES.selectAllComplete}"
      alt="ハロウィンの準備を終えた赤と青のおばけちゃん"
      class="ghost-select-image"
    >

  </div>


  <h2>
    🎃 10 / 10 COMPLETE！ 🎃
  </h2>


  <div class="dialogue">
「全部見つかった！」

赤のおばけちゃんも、
青のおばけちゃんも、

なくしていたものを
全部取り戻すことができました。

これで神狩荘の
ハロウィンの準備も完璧です。

「ずっと探してくれて
ありがとう！」

「明日からも
遊びにきてね！」

HAPPY HALLOWEEN！
  </div>


  <div class="reward-box">

    今日のお礼
    
    <br><br>

    ${renderReward(
      saveData.daily.reward
    )}

  </div>


  <div class="complete-box">

    <div class="complete-title">
      ALL COMPLETE
    </div>

    10個のなくしものを
    すべて見つけました。

    <br><br>

    これ以降、
    なくしものの問題は
    出題されません。

    <br><br>

    明日からは1日1回、
    赤と青のおばけちゃんから
    ランダムなプレゼントを
    受け取れます。

  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   コンプリート後
======================================== */

function showAfterComplete() {

  const today =
    getToday();


  /*
    コンプリート当日
  */

  if (
    saveData.completedDate ===
    today
  ) {

    showCompleteToday();

    return;

  }


  /*
    今日の景品受取済み
  */

  if (
    saveData.daily.rewardClaimed
  ) {

    showRewardClaimed();

    return;

  }


  showDailyRewardTop();

}


/* ========================================
   コンプリート当日
   リロードした場合
======================================== */

function showCompleteToday() {

  screen.innerHTML =
`
<section class="screen">

  <div class="ghost-select-scene">

    <img
      src="${UI_IMAGES.selectAllComplete}"
      alt="ハロウィンの準備を終えた赤と青のおばけちゃん"
      class="ghost-select-image"
    >

  </div>


  <h2>
    ALL COMPLETE！
  </h2>


  <div class="dialogue">
「全部のなくしものが
見つかったよ！」

「ずっと探してくれて
ありがとう！」

「明日からは、
ぼくたちから
お礼をあげるね」
  </div>


  <div class="reward-box">

    今日の景品

    ${renderReward(
      saveData.daily.reward
    )}

  </div>


  <div class="small">

    明日0時以降からは
    問題は出題されません。

    <br>

    1日1回、
    ランダムな景品を
    受け取れるようになります。

  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   コンプリート後のTOP

   以後ずっと最終画像
======================================== */

function showDailyRewardTop() {

  screen.innerHTML =
`
<section class="screen">

  <div class="ghost-select-scene">

    <img
      src="${UI_IMAGES.selectAllComplete}"
      alt="ハロウィンの準備を終えた赤と青のおばけちゃん"
      class="ghost-select-image"
    >

  </div>


  <h2>
    今日も来てくれたんだ！
  </h2>


  <div class="dialogue">
「なくしものは
全部見つかったけど……

今日も神狩荘に
遊びに来てくれたから、

ぼくたちから
お礼をひとつあげるね！」
  </div>


  <div class="choices">

    <button
      type="button"
      class="primary-button"
      id="claimRewardButton"
    >
      Trick or Treat !!
    </button>

  </div>


  ${renderTestControls()}

</section>
`;


  document
    .getElementById(
      "claimRewardButton"
    )
    .addEventListener(
      "click",
      claimDailyReward
    );


  attachTestControls();

}


/* ========================================
   コンプリート後
   毎日の景品
======================================== */

function claimDailyReward() {

  if (
    saveData.daily.rewardClaimed
  ) {

    showRewardClaimed();

    return;

  }


  if (
    !saveData.daily.reward
  ) {

    saveData.daily.reward =
      randomReward();

  }


  saveData.daily.rewardClaimed =
    true;


  const alreadyRecorded =
    saveData
      .rewardHistory
      .some(
        record =>
          record.date ===
            getToday() &&
          record.type ===
            "daily"
      );


  if (
    !alreadyRecorded
  ) {

    saveData
      .rewardHistory
      .push({

        date:
          getToday(),

        type:
          "daily",

        reward:
          saveData.daily.reward

      });

  }


  saveGame();


  showDailyReward();

}


/* ========================================
   景品を引いた直後

   最終画像
======================================== */

function showDailyReward() {

  screen.innerHTML =
`
<section class="screen">

  <div class="ghost-select-scene">

    <img
      src="${UI_IMAGES.selectAllComplete}"
      alt="ハロウィンの準備を終えた赤と青のおばけちゃん"
      class="ghost-select-image"
    >

  </div>


  <h2>
    今日のプレゼント
  </h2>


  <div class="dialogue">
「はい！

今日も来てくれて
ありがとう。

また明日も
遊びにきてね！」
  </div>


  <div class="reward-box">


    ${renderReward(
      saveData.daily.reward
    )}

  </div>


  <div class="small">
    この画面をスタッフに見せてね。
  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   今日の景品受取済み

   最終画像
======================================== */

function showRewardClaimed() {

  screen.innerHTML =
`
<section class="screen">

  <div class="ghost-select-scene">

    <img
      src="${UI_IMAGES.selectAllComplete}"
      alt="ハロウィンの準備を終えた赤と青のおばけちゃん"
      class="ghost-select-image"
    >

  </div>


  <h2>
    今日はもう受け取ったよ
  </h2>


  <div class="dialogue">
「今日のプレゼントは
もう渡したよ。

また明日、
遊びにきてね！」
  </div>


  <div class="reward-box">

    今日の景品

    ${renderReward(
      saveData.daily.reward
    )}

  </div>


  ${renderTestControls()}

</section>
`;


  attachTestControls();

}


/* ========================================
   TEST MODE用
======================================== */

function renderTestControls() {

  if (
    !TEST_MODE
  ) {

    return "";

  }


  return `
    <div class="test-controls">

      <button
        type="button"
        class="test-button"
        id="testNextDayButton"
      >
        TEST：翌日に進める
      </button>

      <button
        type="button"
        class="test-button"
        id="testResetButton"
      >
        TEST：全データをリセット
      </button>

    </div>
  `;

}


/* ========================================
   TESTボタン接続
======================================== */

function attachTestControls() {

  if (
    !TEST_MODE
  ) {

    return;

  }


  const nextDayButton =
    document.getElementById(
      "testNextDayButton"
    );


  const resetButton =
    document.getElementById(
      "testResetButton"
    );


  if (
    nextDayButton
  ) {

    nextDayButton.addEventListener(
      "click",
      simulateNextDay
    );

  }


  if (
    resetButton
  ) {

    resetButton.addEventListener(
      "click",
      resetTestData
    );

  }

}


/* ========================================
   TEST：翌日扱い
======================================== */

function simulateNextDay() {

  saveData.daily.date =
    "TEST_PREVIOUS_DAY";


  if (
    saveData.gameCompleted &&
    saveData.completedDate ===
      getToday()
  ) {

    saveData.completedDate =
      "TEST_PREVIOUS_DAY";

  }


  saveGame();


  location.reload();

}


/* ========================================
   TEST：全リセット
======================================== */

function resetTestData() {

  if (
    !TEST_MODE
  ) {

    return;

  }


  localStorage.removeItem(
    STORAGE_KEY
  );


  location.reload();

}


/* ========================================
   0時越え検知
======================================== */

setInterval(
  () => {

    const nowDate =
      getToday();


    if (
      nowDate !==
      sessionDate
    ) {

      location.reload();

    }

  },
  60000
);


/* ========================================
   スマホ等で翌日戻ってきた場合
======================================== */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      return;

    }


    const nowDate =
      getToday();


    if (
      nowDate !==
      sessionDate
    ) {

      location.reload();

    }

  }
);


/* ========================================
   START
======================================== */

initializeGame();