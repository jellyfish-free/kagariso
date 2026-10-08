/* ========================================
   DOM
======================================== */

const rewardGrid =
  document.getElementById(
    "rewardGrid"
  );

const rewardCount =
  document.getElementById(
    "rewardCount"
  );

const rewardSearch =
  document.getElementById(
    "rewardSearch"
  );

const categoryButtons =
  document.querySelectorAll(
    ".category-button"
  );

const emptyMessage =
  document.getElementById(
    "emptyMessage"
  );


/* ========================================
   現在の絞り込み
======================================== */

let currentCategory =
  "all";

let currentSearch =
  "";


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
    );

}


/* ========================================
   一覧用プレビュー画像パス

   item/
   ↓
   item-preview/

   例：

   item/01黒猫.png

   ↓

   item-preview/01黒猫.png
======================================== */

function getPreviewImage(
  imagePath
) {

  return String(
    imagePath || ""
  ).replace(
    /^item\//,
    "item/"
  );

}


/* ========================================
   カテゴリ判定
======================================== */

function getRewardCategory(
  reward
) {

  const id =
    String(
      reward.id || ""
    ).toLowerCase();


  if (
    id.startsWith(
      "suit_"
    )
  ) {

    return "suit";

  }


  if (
    id.startsWith(
      "sweets_"
    )
  ) {

    return "sweets";

  }


  if (
    id.startsWith(
      "goods_"
    )
  ) {

    return "goods";

  }


  return "other";

}


/* ========================================
   カテゴリ名
======================================== */

function getCategoryLabel(
  category
) {

  switch (
    category
  ) {

    case "suit":
      return "衣装";

    case "sweets":
      return "お菓子";

    case "goods":
      return "グッズ";

    default:
      return "景品";

  }

}


/* ========================================
   表示対象取得
======================================== */

function getFilteredRewards() {

  return REWARDS.filter(
    reward => {

      const category =
        getRewardCategory(
          reward
        );


      const categoryMatch =
        currentCategory ===
          "all" ||
        category ===
          currentCategory;


      const searchTarget =
        [
          reward.name || "",
          reward.description || ""
        ]
          .join(" ")
          .toLowerCase();


      const searchMatch =
        !currentSearch ||
        searchTarget.includes(
          currentSearch
        );


      return (
        categoryMatch &&
        searchMatch
      );

    }
  );

}


/* ========================================
   景品番号取得
======================================== */

function getRewardNumber(
  reward
) {

  return (
    REWARDS.indexOf(
      reward
    ) + 1
  );

}


/* ========================================
   景品カード生成
======================================== */

function createRewardCard(
  reward
) {

  const category =
    getRewardCategory(
      reward
    );


  const rewardNumber =
    getRewardNumber(
      reward
    );


  const previewImage =
    getPreviewImage(
      reward.image
    );


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "reward-card";


  card.innerHTML =
`
<div class="reward-card-number">
  ${String(
    rewardNumber
  ).padStart(
    2,
    "0"
  )}
</div>


<div class="reward-card-image-wrap">

  <img
    src="${escapeHTML(
      previewImage
    )}"
    alt="${escapeHTML(
      reward.name
    )}"
    class="reward-card-image"
    loading="lazy"
    draggable="false"
  >

</div>


<div class="reward-card-body">

  <div class="reward-category">
    ${escapeHTML(
      getCategoryLabel(
        category
      )
    )}
  </div>


  <h2 class="reward-card-title">
    ${escapeHTML(
      reward.name
    )}
  </h2>


  ${
    reward.description
      ? `
        <p class="reward-card-description">
          ${escapeHTML(
            reward.description
          )}
        </p>
      `
      : ""
  }

</div>
`;


  return card;

}


/* ========================================
   一覧描画
======================================== */

function renderRewards() {

  const rewards =
    getFilteredRewards();


  rewardCount.textContent =
    REWARDS.length;


  rewardGrid.innerHTML =
    "";


  emptyMessage.hidden =
    rewards.length > 0;


  rewards.forEach(
    reward => {

      const card =
        createRewardCard(
          reward
        );


      rewardGrid.appendChild(
        card
      );

    }
  );

}


/* ========================================
   検索
======================================== */

rewardSearch.addEventListener(
  "input",
  event => {

    currentSearch =
      event
        .target
        .value
        .trim()
        .toLowerCase();


    renderRewards();

  }
);


/* ========================================
   カテゴリ切替
======================================== */

categoryButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        currentCategory =
          button.dataset.category;


        categoryButtons.forEach(
          item => {

            item.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        renderRewards();

      }
    );

  }
);


/* ========================================
   右クリック禁止

   景品画像部分のみ
======================================== */

rewardGrid.addEventListener(
  "contextmenu",
  event => {

    const imageArea =
      event.target.closest(
        ".reward-card-image-wrap"
      );


    if (
      imageArea
    ) {

      event.preventDefault();

    }

  }
);


/* ========================================
   画像ドラッグ禁止
======================================== */

rewardGrid.addEventListener(
  "dragstart",
  event => {

    const image =
      event.target.closest(
        ".reward-card-image"
      );


    if (
      image
    ) {

      event.preventDefault();

    }

  }
);


/* ========================================
   タッチ端末の長押し対策
======================================== */

rewardGrid.addEventListener(
  "selectstart",
  event => {

    const imageArea =
      event.target.closest(
        ".reward-card-image-wrap"
      );


    if (
      imageArea
    ) {

      event.preventDefault();

    }

  }
);


/* ========================================
   START
======================================== */

renderRewards();