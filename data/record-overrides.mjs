export const broadCategoryOverrides = new Map([
  ["weichuan-foods", ["食品／飲料／農水產"]],
  ["tacoop-taiwan-agricultural-united-marketing-cooperative", ["食品／飲料／農水產"]],
  ["shye-chuen-seafood", ["食品／飲料／農水產"]],
  ["nantou-county-farmers-association", ["食品／飲料／農水產"]],
  ["tianwei-agricultural-technology", ["食品／飲料／農水產"]],
  ["hualien-county-farmers-association", ["食品／飲料／農水產"]],
  ["huawei", ["科技／通訊／消費電子"]],
  ["tp-link", ["科技／通訊／消費電子"]],
  ["hikvision", ["監控／AI／資安"]],
  ["dahua", ["監控／AI／資安"]],
  ["dji", ["監控／AI／資安"]],
  ["sensetime", ["監控／AI／資安"]],
  ["megvii-facepp", ["監控／AI／資安"]],
  ["iflytek", ["監控／AI／資安"]],
  ["uniview", ["監控／AI／資安"]],
  ["cloudwalk", ["監控／AI／資安"]],
  ["yitu", ["監控／AI／資安"]],
  ["meiya-pico-sdic-intelligence", ["監控／AI／資安"]],
  ["autel-robotics", ["監控／AI／資安"]],
  ["shein", ["服飾／玩具／生活零售"]],
  ["xiaohongshu", ["電商／App／數位服務"]],
  ["baidu", ["電商／App／數位服務"]],
  ["iqiyi", ["電商／App／數位服務"]],
  ["qihoo-360", ["科技／通訊／消費電子"]],
  ["honor", ["科技／通訊／消費電子"]],
  ["wahaha-ad-calcium-milk-food-beverage", ["食品／飲料／農水產"]],
  ["wujiang-fuling-zhacai-state-owned-food", ["食品／飲料／農水產"]],
  ["coco-fresh-tea", ["食品／飲料／農水產"]],
  ["tsingtao-brewery", ["食品／飲料／農水產"]],
  ["moutai", ["食品／飲料／農水產"]],
  ["wuliangye", ["食品／飲料／農水產"]],
  ["haidilao", ["餐飲／生活服務"]],
  ["xiaogu-jiejie-malaban", ["餐飲／生活服務"]],
  ["li-ning", ["服飾／玩具／生活零售"]],
  ["pop-mart", ["服飾／玩具／生活零售"]],
  ["taiwanize-naizhi-cultural", ["服飾／玩具／生活零售"]],
  ["fu-hsu-jungliang-enterprise", ["餐飲／生活服務"]],
  ["antai-hospital-su-ching-chuan", ["餐飲／生活服務"]],
  ["shenshen-yongkang-onigiri-anti-recall", ["餐飲／生活服務"]],
  ["meilongzhen-tu-shih-mei-recall-remarks", ["餐飲／生活服務"]],
  ["byd", ["汽車／交通／能源"]],
  ["yutong", ["汽車／交通／能源"]],
  ["catl", ["汽車／交通／能源"]],
  ["midea", ["家電／智慧家庭"]],
  ["tcl", ["家電／智慧家庭"]],
  ["gree", ["家電／智慧家庭"]],
  ["hisense", ["家電／智慧家庭"]],
  ["roborock", ["家電／智慧家庭"]],
  ["haier", ["家電／智慧家庭"]],
  ["lalamove-taiwan-china-taiwan-labeling-watchlist", ["汽車／交通／能源"]],
  ["paris-evergreen-laurel-hotel-statement-event-personal", ["餐飲／生活服務"]],
  ["cha-li-wang-china-origin-food-whole-brand-personal-20260827", ["食品／飲料／農水產"]],
  ["sunshine-womens-choir-china-taiwan-labeling-watchlist", ["社群／App／媒體娛樂"]],
  ["lin-bo-rui-public-figure-watchlist", ["社群／App／媒體娛樂"]],
]);

export const recordCleanups = new Map([
  [
    "tacoop-taiwan-agricultural-united-marketing-cooperative",
    {
      summary: "使用者標記為避買；目前以合作社名稱、英文名與 TACOOP 辨識，未查到明確消費者零售 SKU。",
      sources: [
        {
          title: "使用者提供避買清單",
          url: "",
          date: "2026-06-25",
          note: "使用者指定 TACOOP、合作社全名與英文名作為辨識字樣。",
        },
        {
          title: "保證責任台灣農產共同協力運銷合作社 - 中華黃頁",
          url: "https://www.iyp.com.tw/087512715",
          date: "2026-06-25",
          note: "公開資料列示營業名稱、地址與經營項目水果批發。",
        },
      ],
      aiNotes: "目前沒有明確零售 SKU；購買水果、農產品、食品或飲料時，主要比對合作社名稱、TACOOP 與英文名。不要把單純水果品項當成品牌命中。",
    },
  ],
  [
    "shye-chuen-seafood",
    {
      summary: "使用者標記為避買；目前未查到明確消費者品牌，購買海鮮、冷凍或加工水產時以公司名稱與英文名辨識。",
      sources: [
        {
          title: "使用者提供避買清單",
          url: "",
          date: "2026-06-25",
          note: "使用者指定協春水產、協春水產有限公司與英文名作為辨識字樣。",
        },
      ],
      aiNotes: "目前以供應商／公司標示辨識，不要推論成已確認的消費者自有品牌清單。",
    },
  ],
  [
    "nantou-county-farmers-association",
    {
      removeAliases: [
        "苦茶油",
        "苦茶粉",
        "高山茶",
        "烏龍茶",
        "紅茶",
        "凍頂烏龍茶",
        "日月潭紅茶",
        "Q梅",
        "梅汁",
        "梅粉",
        "梅精",
        "梅精粒",
        "龍眼蜂蜜",
        "山薑洗髮精",
        "山薑沐浴乳",
        "何首烏洗髮精",
        "天綠菓洗髮精",
        "天綠菓沐浴乳",
        "天綠菓美膚油",
        "天綠菓護手膏",
      ],
    },
  ],
  [
    "tianwei-agricultural-technology",
    {
      removeAliases: [
        "鳳梨鮮果萃",
        "100%鳳梨鮮果萃",
        "金鑽鳳梨",
        "珍珠芭樂",
        "冷凍鳳梨",
        "冷凍水果丁",
        "冷凍果汁",
        "鳳梨酥",
        "金鑽鳳梨脆片",
      ],
    },
  ],
  [
    "coco-fresh-tea",
    {
      identifiers: ["coco-tea.com", "coco-tea.com.cn", "OCOCO INTERNATIONAL CO., LTD."],
    },
  ],
  [
    "xiaogu-jiejie-malaban",
    {
      identifiers: ["xiaogujiejie.com", "天津小谷顿餐饮管理服务有限公司"],
    },
  ],
  [
    "hualien-county-farmers-association",
    {
      removeAliases: [
        "剝皮辣椒鰻魚罐頭",
        "紅燒樹豆鰻魚罐頭",
        "麻辣花生鰻魚罐頭",
        "花蓮紅藜醬油",
        "赤科山無硫金針",
        "花蓮 米乖乖",
        "有機百合飲",
        "薄荷清新茶",
        "洛神香草茶包",
        "魚腥草茶包",
      ],
    },
  ],
  [
    "dji",
    {
      removeAliases: ["Mini", "Air", "Phantom", "Matrice", "Agras", "Osmo"],
      addAliases: ["DJI Mini", "DJI Air", "DJI Phantom", "DJI Matrice", "DJI Agras", "DJI Osmo"],
    },
  ],
  [
    "iflytek",
    {
      removeAliases: ["ASR", "TTS"],
    },
  ],
  [
    "uniview",
    {
      removeAliases: ["IP Camera", "PTZ Camera", "NVR"],
      addAliases: ["UNV Guard"],
    },
  ],
  [
    "yitu",
    {
      removeAliases: ["AI video analytics"],
    },
  ],
  [
    "meiya-pico-sdic-intelligence",
    {
      removeAliases: ["mobile forensics", "digital forensics"],
    },
  ],
  [
    "honor",
    {
      removeAliases: ["Magic", "X series"],
      addAliases: ["HONOR Magic", "HONOR X series"],
    },
  ],
  [
    "catl",
    {
      removeAliases: ["EV battery", "bus battery", "energy storage", "儲能"],
    },
  ],
  [
    "midea",
    {
      removeAliases: ["除蟎機", "熱水壺", "洗碗機"],
    },
  ],
  [
    "gree",
    {
      removeAliases: ["家用空調", "商用空調"],
      addAliases: ["GREE 家用空調", "GREE 商用空調"],
    },
  ],
]);
