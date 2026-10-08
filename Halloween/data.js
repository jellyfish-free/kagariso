/* ========================================
   UI画像
======================================== */

const UI_IMAGES = {

  select:
    "images/ghost-select.png",

  selectAfterGhostComplete:
    "images/ghost-select-after-complete.png",

  selectAllComplete:
    "images/ghost-select-all-complete.png"

};

/* ========================================
   おばけ
======================================== */

const GHOSTS = {

  red: {

    id:
      "red",

    name:
      "赤のおばけちゃん",

    image:
      "images/ghost-red.png"

  },


  blue: {

    id:
      "blue",

    name:
      "青のおばけちゃん",

    image:
      "images/ghost-blue.png"

  }

};


/* ========================================
   景品
======================================== */

const REWARDS = [

 {
    id: "suit_001",
    name: "黒猫の耳付きフードジャケット 黒",
    image: "item/01黒猫の耳付きフードジャケット.png"
  },

  {
    id: "suit_002",
    name: "狼人間のファー付きロングコート　黒",
    image: "item/02狼人間のファー付きロングコート.png"
  },

  {
    id: "suit_003",
    name: "吸血鬼のロングジャケット　ブラック×ワイン",
    image: "item/03吸血鬼のロングジャケット.png"
  },

  {
    id: "suit_004",
    name: "かぼちゃおばけのボンバージャケット　オレンジ",
    image: "item/04かぼちゃおばけのボンバージャケット.png"
  },

  {
    id: "suit_005",
    name: "おばけちゃんのオーバーサイズパーカー　ホワイト",
    image: "item/05おばけちゃんのオーバーサイズパーカー.png"
  },

 {
    id: "suit_006",
    name: "黒猫の耳付きフードジャケット　ダークグレー",
    image: "item/01黒猫の耳付きフードジャケット.png"
  },

  {
    id: "suit_007",
    name: "02狼人間のファー付きロングコート　ダークグレー",
    image: "item/02狼人間のファー付きロングコート.png"
  },

  {
    id: "suit_008",
    name: "吸血鬼のロングジャケット　ブラック×グレー",
    image: "item/03吸血鬼のロングジャケット.png"
  },

  {
    id: "suit_009",
    name: "かぼちゃおばけのボンバージャケット　パープル",
    image: "item/04かぼちゃおばけのボンバージャケット.png"
  },

  {
    id: "suit_010",
    name: "おばけちゃんのオーバーサイズパーカー　グレー",
    image: "item/05おばけちゃんのオーバーサイズパーカー.png"
  },

{
    id: "Sweets_001",
    name: "おばけちゃんマシュマロ",
    image: "item/06おばけちゃんマシュマロ.png"
  },

  {
    id: "Sweets_002",
    name: "おばけちゃんロールケーキ",
    image: "item/07おばけちゃんロールケーキ.png"
  },

  {
    id: "Sweets_003",
    name: "おばけのアイシングクッキー",
    image: "item/08おばけのアイシングクッキー.png"
  },

  {
    id: "Sweets_004",
    name: "かぼちゃのモンブラン",
    image: "item/09かぼちゃのモンブラン.png"
  },

  {
    id: "Sweets_005",
    name: "コウモリ型チョコレート",
    image: "item/10コウモリ型チョコレート.png"
  },

    {
    id: "Sweets_006",
    name: "ジャック・オー・ランタンカップケーキ",
    image: "item/11ジャック・オー・ランタンカップケーキ.png"
  },

  {
    id: "Sweets_007",
    name: "ジャック・オー・ランタンキャンディ",
    image: "item/12ジャック・オー・ランタンキャンディ.png"
  },

  {
    id: "Sweets_008",
    name: "スカルシュガーキャンディ",
    image: "item/13スカルシュガーキャンディ.png"
  },

  {
    id: "Sweets_009",
    name: "ハロウィン・ミニケーキボックス",
    image: "item/14ハロウィン・ミニケーキボックス.png"
  },

  {
    id: "Sweets_010",
    name: "ハロウィン月夜の金平糖",
    image: "item/15ハロウィン月夜の金平糖.png"
  },

  {
    id: "Sweets_011",
    name: "吸血鬼の血色ベリーケーキ",
    image: "item/16吸血鬼の血色ベリーケーキ.png"
  },

  {
    id: "Sweets_012",
    name: "黒猫チョコクッキー",
    image: "item/17黒猫チョコクッキー.png"
  },

  {
    id: "Sweets_013",
    name: "蜘蛛の巣ブラウニー",
    image: "item/18蜘蛛の巣ブラウニー.png"
  },

  {
    id: "Sweets_014",
    name: "蜘蛛の巣ロリポップ",
    image: "item/19蜘蛛の巣ロリポップ.png"
  },
  {
    id: "Sweets_015",
    name: "毒りんごのミニチーズケーキ",
    image: "item/20毒りんごのミニチーズケーキ.png"
  },
  {
    id: "Sweets_016",
    name: "魔女のりんごタルト",
    image: "item/21魔女のりんごタルト.png"
  },
  {
    id: "Sweets_017",
    name: "魔女の黒紫モンブラン",
    image: "item/22魔女の黒紫モンブラン.png"
  },
  {
    id: "Sweets_018",
    name: "魔女の毒りんごキャンディ",
    image: "item/23魔女の毒りんごキャンディ.png"
  },
  {
    id: "Sweets_019",
    name: "夜空のハロウィンムースケーキ",
    image: "item/24夜空のハロウィンムースケーキ.png"
  },
  {
    id: "Sweets_020",
    name: "狼男の肉球クッキー",
    image: "item/25狼男の肉球クッキー.png"
  },
  {
    id: "Sweets_021",
    name: "かぼちゃおばけ練り切り",
    image: "item/26かぼちゃおばけ練り切り.png"
  },
  {
    id: "Sweets_022",
    name: "おばけちゃん大福",
    image: "item/27おばけちゃん大福.png"
  },
  {
    id: "Sweets_023",
    name: "コウモリ紫芋どら焼き",
    image: "item/28コウモリ紫芋どら焼き.png"
  },
  {
    id: "Sweets_024",
    name: "毒りんごの琥珀糖",
    image: "item/29毒りんごの琥珀糖.png"
  },
  {
    id: "Sweets_025",
    name: "月夜のハロウィン羊羹",
    image: "item/30月夜のハロウィン羊羹.png"
  },

  {
    id: "Sweets_026",
    name: "ジャック・オー・ランタンの瓶プリン",
    image: "item/31ジャック・オー・ランタンの瓶プリン.png"
  },

  {
    id: "Sweets_027",
    name: "おばけちゃんの白い瓶ティラミス",
    image: "item/32おばけちゃんの白い瓶ティラミス.png"
  },

  {
    id: "Sweets_028",
    name: "吸血鬼の黒紫ベリーゼリー",
    image: "item/33吸血鬼の黒紫ベリーゼリー.png"
  },

  {
    id: "Sweets_029",
    name: "蜘蛛の巣チョコムース",
    image: "item/34蜘蛛の巣チョコムース.png"
  },

  {
    id: "Sweets_030",
    name: "黒猫の夜空パフェ",
    image: "item/35黒猫の夜空パフェ.png"
  },

   {
    id: "Goods_001",
    name: "夜更けのキャンドル",
    image: "item/36夜更けのキャンドル.png"
  },

  {
    id: "Goods_002",
    name: "おばけの吐息瓶",
    image: "item/37おばけの吐息瓶.png"
  },

  {
    id: "Goods_003",
    name: "おばけの霧玉",
    image: "item/38おばけの霧玉.png"
  },

  {
    id: "Goods_004",
    name: "かぼちゃの影絵ランタン",
    image: "item/39かぼちゃの影絵ランタン.png"
  },

  {
    id: "Goods_005",
    name: "狼男の遠吠え笛",
    image: "item/40狼男の遠吠え笛.png"
  },

  {
    id: "Goods_006",
    name: "ゾンビの手袋",
    image: "item/41ゾンビの手袋.png"
  },

  {
    id: "Goods_007",
    name: "魔女の大釜",
    image: "item/42魔女の大釜.png"
  },

  {
    id: "Goods_008",
    name: "墓石のミニチュア",
    image: "item/43墓石のミニチュア.png"
  },

  {
    id: "Goods_009",
    name: "呪われた洋館のミニチュア",
    image: "item/44呪われた洋館のミニチュア.png"
  },

  {
    id: "Goods_010",
    name: "魔女の森のミニチュア",
    image: "item/45魔女の森のミニチュア.png"
  },

  {
    id: "Goods_011",
    name: "かぼちゃ畑のミニチュア",
    image: "item/46かぼちゃ畑のミニチュア.png"
  },

  {
    id: "Goods_012",
    name: "魔女の小屋のミニチュア",
    image: "item/47魔女の小屋のミニチュア.png"
  },

  {
    id: "Goods_013",
    name: "蜘蛛の巣温室のミニチュア",
    image: "item/48蜘蛛の巣温室のミニチュア.png"
  },

  {
    id: "Goods_014",
    name: "吸血鬼の棺のミニチュア",
    image: "item/49吸血鬼の棺のミニチュア.png"
  },

  {
    id: "Goods_015",
    name: "狼男の森のミニチュア",
    image: "item/50狼男の森のミニチュア.png"
  },

  {
    id: "Goods_016",
    name: "幽霊列車のミニチュア",
    image: "item/51幽霊列車のミニチュア.png"
  },

  {
    id: "Goods_017",
    name: "魔女の薬屋のミニチュア",
    image: "item/52魔女の薬屋のミニチュア.png"
  },

  {
    id: "Goods_018",
    name: "おばけ屋敷の玄関ミニチュア",
    image: "item/53おばけ屋敷の玄関ミニチュア.png"
  },

  {
    id: "Goods_019",
    name: "黒猫の路地裏ミニチュア",
    image: "item/54黒猫の路地裏ミニチュア.png"
  },

  {
    id: "Goods_020",
    name: "墓地の門のミニチュア",
    image: "item/55墓地の門のミニチュア.png"
  },

  {
    id: "Goods_021",
    name: "狼男の月石",
    image: "item/56狼男の月石.png"
  },

  {
    id: "Goods_022",
    name: "魔女の空飛ぶ箒",
    image: "item/57魔女の空飛ぶ箒.png"
  },

  {
    id: "Goods_023",
    name: "魔法使いの古びた杖",
    image: "item/58魔法使いの古びた杖.png"
  },

  {
    id: "Goods_024",
    name: "魔法きのこの鉢",
    image: "item/59魔法きのこの鉢.png"
  },

  {
    id: "Goods_025",
    name: "魔女の水晶玉",
    image: "item/60魔女の水晶玉.png"
  },

  {
    id: "Goods_026",
    name: "コウモリの月夜キーホルダー",
    image: "item/61コウモリの月夜キーホルダー.png"
  },

  {
    id: "Goods_027",
    name: "ジャック・オー・ランタンのミニチャーム",
    image: "item/62ジャック・オー・ランタンのミニチャーム.png"
  },

  {
    id: "Goods_028",
    name: "おばけちゃんのアクリルキーホルダー",
    image: "item/63おばけちゃんのアクリルキーホルダー.png"
  },

  {
    id: "Goods_029",
    name: "魔女の古い鍵チャーム",
    image: "item/64魔女の古い鍵チャーム.png"
  },

  {
    id: "Goods_030",
    name: "狼男の月光ピンバッジ",
    image: "item/65狼男の月光ピンバッジ.png"
  },

  {
    id: "Goods_031",
    name: "魔女の薬瓶セット",
    image: "item/66魔女の薬瓶セット.png"
  },

  {
    id: "Goods_032",
    name: "宝石が生えてくる鉢植え",
    image: "item/67宝石が生えてくる鉢植え.png"
  },

  {
    id: "Goods_033",
    name: "おばけの夜更かし砂時計",
    image: "item/68おばけの夜更かし砂時計.png"
  },

  {
    id: "Goods_034",
    name: "おばけの真夜中ベル",
    image: "item/69おばけの真夜中ベル.png"
  },

  {
    id: "Goods_035",
    name: "おばけの秘密箱",
    image: "item/70おばけの秘密箱.png"
  },

];

/* ========================================
   質問10種類
======================================== */

const QUESTIONS = [

  {
    key:
      "food",

    text:
      "食べられるもの？"
  },

  {
    key:
      "wear",

    text:
      "身につけるもの？"
  },

  {
    key:
      "carry",

    text:
      "持ち歩くもの？"
  },

  {
    key:
      "outside",

    text:
      "外で使うもの？"
  },

  {
    key:
      "light",

    text:
      "明かりがつくもの？"
  },

  {
    key:
      "magic",

    text:
      "魔法に関係するもの？"
  },

  {
    key:
      "night",

    text:
      "夜に使うもの？"
  },

  {
    key:
      "small",

    text:
      "小さいもの？"
  },

  {
    key:
      "fly",

    text:
      "空を飛ぶことに関係する？"
  },

  {
    key:
      "container",

    text:
      "中に何か入れられるもの？"
  }

];


/* ========================================
   問題10種類
======================================== */

const PUZZLES = [

  /* =====================================
     RED 01
     かぼちゃランタン
  ===================================== */

  {

    id:
      "red_pumpkin",

    ghost:
      "red",

    name:
      "おばけのかぼちゃランタン",

    icon:
      "https://discord.com/assets/dcce7481d64c9441.svg",

    ending:
`「あっ！
ぼくのかぼちゃランタン！」

赤のおばけちゃんは
ぱっと顔を明るくした。

「夜になると
ぴかーって光るんだ。

ハロウィンには
これがないとね！

見つけてくれて
ありがとう！」`,

    answers: {

      food:
        "ううん。食べるものじゃないよ。",

      wear:
        "身につけるものじゃないよ。",

      carry:
        "うん。持って運ぶことはできるよ。",

      outside:
        "うん。外に飾ることもあるよ。",

      light:
        "うん！ 明かりがつくよ。",

      magic:
        "魔法そのものではないかな。",

      night:
        "うん。夜に使うときれいなんだ。",

      small:
        "そんなに小さくないよ。",

      fly:
        "空は飛ばないよ。",

      container:
        "物を入れて持ち歩くものじゃないよ。"

    }

  },


  /* =====================================
     RED 02
     キャンディ
  ===================================== */

  {

    id:
      "red_candy",

    ghost:
      "red",

    name:
      "おばけのハロウィンキャンディ",

    icon:
      "https://discord.com/assets/7df8642c79a9d3ec.svg",

    ending:
`「キャンディ！」

赤のおばけちゃんは
うれしそうに飛び跳ねた。

「これ、
あとで食べようと思って
とっておいたんだ！

甘くて
おいしいんだよ。

ありがとう！」`,

    answers: {

      food:
        "うん！ 食べられるよ。",

      wear:
        "身につけるものじゃないよ。",

      carry:
        "うん。小さいから簡単に持ち歩けるよ。",

      outside:
        "外だけで使うものじゃないよ。",

      light:
        "光らないよ。",

      magic:
        "魔法とは関係ないかな。",

      night:
        "夜だけのものじゃないよ。",

      small:
        "うん。小さいよ。",

      fly:
        "飛ばないよ。",

      container:
        "物を入れるものではないよ。"

    }

  },


  /* =====================================
     RED 03
     魔女帽子
  ===================================== */

  {

    id:
      "red_witch_hat",

    ghost:
      "red",

    name:
      "おばけサイズの魔女帽子",

    icon:
      "https://discord.com/assets/4cac04d85d59e8dd.svg",

    ending:
`「ぼくの魔女帽子！」

赤のおばけちゃんは
頭に帽子をのせた。

「どう？

ちゃんと
魔法使いっぽい？

先っぽが
とんがってるところが
お気に入りなんだ！

ありがとう！」`,

    answers: {

      food:
        "食べられないよ。",

      wear:
        "うん！ 身につけるものだよ。",

      carry:
        "持ち歩くこともできるよ。",

      outside:
        "外でも使えるよ。",

      light:
        "明かりはつかないよ。",

      magic:
        "うん。魔法に関係するよ！",

      night:
        "夜だけのものではないよ。",

      small:
        "ぼくサイズだから、人間から見ると小さいかな。",

      fly:
        "これだけじゃ空は飛べないよ。",

      container:
        "物を入れるものじゃないよ。"

    }

  },


  /* =====================================
     RED 04
     空飛ぶほうき
  ===================================== */

  {

    id:
      "red_broom",

    ghost:
      "red",

    name:
      "空飛ぶおばけほうき",

    icon:
      "https://discord.com/assets/6b85904c052ce6c7.svg",

    ending:
`「あっ！
ぼくのほうき！」

赤のおばけちゃんは
ひょいっとまたがった。

「これがあれば
空をびゅーんって
飛べるんだ！

見つけてくれて
ありがとう！」`,

    answers: {

      food:
        "食べものじゃないよ。",

      wear:
        "身につけるものじゃないよ。",

      carry:
        "うん。持って運ぶことはできるよ。",

      outside:
        "うん。外で使うことが多いよ。",

      light:
        "光らないよ。",

      magic:
        "うん。魔法に関係するよ！",

      night:
        "夜にも使うけど、夜だけじゃないよ。",

      small:
        "小さくはないよ。細長いんだ。",

      fly:
        "うん！ 空を飛べるよ！",

      container:
        "物を入れるものじゃないよ。"

    }

  },


  /* =====================================
     RED 05
     魔法小瓶
  ===================================== */

  {

    id:
      "red_magic_bottle",

    ghost:
      "red",

    name:
      "おばけの魔法小瓶",

    icon:
      "https://discord.com/assets/e5aa5c7ba473596f.svg",

    ending:
`「魔法の小瓶！」

赤のおばけちゃんは
そっと瓶を持ち上げた。

瓶の中では
赤い光が
ゆらゆら揺れている。

「だいじな魔法を
しまってあるんだ。

なくしたら
大変だったよ！

ありがとう！」`,

    answers: {

      food:
        "食べものじゃないよ。",

      wear:
        "身につけるものじゃないよ。",

      carry:
        "うん。小さいから持ち歩けるよ。",

      outside:
        "外だけで使うものじゃないよ。",

      light:
        "うん。中が光ってるよ。",

      magic:
        "うん！ 魔法に関係するよ。",

      night:
        "夜だけ使うものではないよ。",

      small:
        "うん。とっても小さいよ。",

      fly:
        "空は飛ばないよ。",

      container:
        "うん。中に何か入ってるよ。"

    }

  },


  /* =====================================
     BLUE 01
     コウモリの羽飾り
  ===================================== */

  {

    id:
      "blue_bat_wings",

    ghost:
      "blue",

    name:
      "コウモリの羽飾り",

    icon:
      "https://discord.com/assets/350b18687bfdeebe.svg",

    ending:
`「羽飾り！」

青のおばけちゃんは
背中に羽飾りをつけた。

ふわっ。

ほんの少しだけ
体が浮かぶ。

「これがあると
ちょっとだけ
飛んでる気分になれるんだ。

ありがとう！」`,

    answers: {

      food:
        "食べものじゃないよ。",

      wear:
        "うん。身につけるものだよ。",

      carry:
        "持ち歩くこともできるよ。",

      outside:
        "外でも使えるよ。",

      light:
        "光らないよ。",

      magic:
        "少し不思議な力はあるよ。",

      night:
        "夜に似合うけど、夜だけじゃないよ。",

      small:
        "ぼくサイズだから、そんなに大きくないよ。",

      fly:
        "ほんの少しだけ浮けるよ。",

      container:
        "物を入れるものじゃないよ。"

    }

  },


  /* =====================================
     BLUE 02
     毒りんご
  ===================================== */

  {

    id:
      "blue_poison_apple",

    ghost:
      "blue",

    name:
      "おばけの毒りんご",

    icon:
      "https://discord.com/assets/a674e7d0da99d47d.svg",

    ending:
`「毒りんご！」

青のおばけちゃんは
青いりんごを
じーっと見つめた。

「これ、
食べちゃだめなやつだった！

なくしたままなのも
危ないよね。

見つけてくれて
ありがとう！」`,

    answers: {

      food:
        "うん。食べ物ではあるよ。……おすすめはしないけど。",

      wear:
        "身につけるものじゃないよ。",

      carry:
        "うん。持ち歩くことはできるよ。",

      outside:
        "外だけで使うものではないよ。",

      light:
        "光らないよ。",

      magic:
        "ちょっと怪しい感じはするよ。",

      night:
        "夜だけのものではないよ。",

      small:
        "手に持てるくらいだよ。",

      fly:
        "飛ばないよ。",

      container:
        "物を入れるものじゃないよ。"

    }

  },


  /* =====================================
     BLUE 03
     青いキャンドル
  ===================================== */

  {

    id:
      "blue_candle",

    ghost:
      "blue",

    name:
      "青い呪いのキャンドル",

    icon:
      "https://discord.com/assets/191233bd63f59a90.svg",

    ending:
`「キャンドル！」

青のおばけちゃんが
そっと火をつける。

ぼうっ。

青い炎が
静かに揺れた。

「ちょっと怖いけど、
この光、
きれいなんだよ。

ありがとう！」`,

    answers: {

      food:
        "食べられないよ。",

      wear:
        "身につけるものじゃないよ。",

      carry:
        "うん。持ち運ぶことはできるよ。",

      outside:
        "外でも使えるけど、風には弱いよ。",

      light:
        "うん。明かりがつくよ。",

      magic:
        "呪いっぽい不思議な力があるよ。",

      night:
        "うん。夜に使うとよく見えるよ。",

      small:
        "そんなに大きくないよ。",

      fly:
        "飛ばないよ。",

      container:
        "物を入れるものではないよ。"

    }

  },


  /* =====================================
     BLUE 04
     蜘蛛の巣バッグ
  ===================================== */

  {

    id:
      "blue_spider_bag",

    ghost:
      "blue",

    name:
      "おばけの蜘蛛の巣バッグ",

    icon:
      "https://discord.com/assets/ba8c8625b6dcf6f1.svg",

    ending:
`「ぼくのバッグ！」

青のおばけちゃんは
蜘蛛の巣バッグを
ぎゅっと抱えた。

「これに
お菓子とか
いろいろ入れるんだ。

ちょっと
ベタベタするけどね。

ありがとう！」`,

    answers: {

      food:
        "食べものじゃないよ。",

      wear:
        "身につけるというより、持ち歩くものだよ。",

      carry:
        "うん！ 持ち歩くためのものだよ。",

      outside:
        "外にも持っていくよ。",

      light:
        "光らないよ。",

      magic:
        "魔法とは関係ないよ。",

      night:
        "夜だけ使うものじゃないよ。",

      small:
        "ぼくが持てるくらいの大きさだよ。",

      fly:
        "飛ばないよ。",

      container:
        "うん。中に物を入れられるよ。"

    }

  },


  /* =====================================
     BLUE 05
     吸血鬼マント
  ===================================== */

  {

    id:
      "blue_vampire_cape",

    ghost:
      "blue",

    name:
      "吸血鬼の小さなマント",

    icon:
      "https://discord.com/assets/11b093ad78dc4ee5.svg",

    ending:
`「マント！」

青のおばけちゃんは
小さなマントを
ばさっと羽織った。

「どう？

吸血鬼っぽいでしょ？

夜になると
これを着たくなるんだ。

ありがとう！」`,

    answers: {

      food:
        "食べものじゃないよ。",

      wear:
        "うん。身につけるものだよ。",

      carry:
        "畳めば持ち歩けるよ。",

      outside:
        "外でも使えるよ。",

      light:
        "光らないよ。",

      magic:
        "魔法というより、吸血鬼っぽいものかな。",

      night:
        "うん。夜に使うと雰囲気が出るよ。",

      small:
        "ぼくサイズだから、小さいよ。",

      fly:
        "これだけで空は飛べないよ。",

      container:
        "物を入れるものじゃないよ。"

    }

  }

];