import { record, source } from "../record-helpers.mjs";

const evidencePath =
  "evidence/user-submissions/2026-09-01-taiwan-tree-protection-groups-list-screenshot.png";
const evidenceSha256 =
  "c86e49d79cc12124f250c86aaa2f846447edd6b7e654753ec01a7d1cc35a4c2b";

function treeGroupRecord({
  id,
  name,
  screenshotName = name,
  bridgeWording = `將具名團體「${name}」`,
  aliases = [],
  identifiers,
  identitySources = [],
  confidence = "low",
  extraAiNote = "",
}) {
  const searchableNames = [name, ...aliases];

  return record({
    id,
    name,
    aliases,
    ...(identifiers?.length ? { identifiers } : {}),
    country: "台灣",
    categories: ["環境倡議／公民團體"],
    avoidReasons: [
      "使用者明確指定圖片中全部具名護樹團體個人避雷",
    ],
    confidence,
    status: "personal",
    summary:
      `使用者提供一張社群平台中的護樹團體整理清單截圖，並明確表示「全部避雷」；畫面可辨識列出「${screenshotName}」。因此依使用者授權，${bridgeWording}列為個人避開。截圖帶有 Facebook、Threads、Meta AI 等來源泡泡，呈現的是社群／AI 整理列表，不是各團體共同發布或簽署的聯合聲明，也沒有提出任何具體負面事件、違法、裁罰或不當行為。收錄只限這個具名團體，不擴及其成員、志工、代表人物、合作對象、其他護樹團體，或所有環境／保育倡議者。`,
    sources: [
      source(
        `使用者提供社群截圖－護樹團體清單中的「${screenshotName}」`,
        "",
        "截圖提供日 2026-09-01",
        `截圖在護樹團體整理清單中直接顯示「${screenshotName}」，並帶有 Facebook、Threads、Meta AI 等來源泡泡；使用者隨圖明確表示「全部避雷」。此來源只支持畫面可見名稱與使用者的個人避雷授權，不證明該列表完整、各段描述準確、來源泡泡內容、團體法律身分、彼此隸屬／合作、共同聲明、負面事件、違法或主管機關認定。證據檔：\`${evidencePath}\`；SHA-256：\`${evidenceSha256}\`。`,
      ),
      ...identitySources,
    ],
    aiNotes:
      `此筆是 screenshot-led / user-directed organization personal record。使用者只說「全部避雷」，沒有指定具體理由；不得替使用者推定反對護樹、都市開發、老樹保存、地方自治、特定政治立場或任何事件。截圖是社群／AI 整理清單，不是「${name}」官方自述、共同聲明或參與證明；外部來源若有，只用於正式名稱與公開身分橋接，不用來補造負面理由。收錄範圍只限這個具名團體，不外溢到成員、志工、代表人物、合作對象、清單內其他團體或所有環境／保育倡議者。searchable fields 僅保留 ${searchableNames.join("、")}；不要把護樹、團體、聯盟、協會、志工、老樹、公園、環保、保育、Facebook、Threads、Meta AI、來源泡泡、地區、人物、地址、電話或其他分類／來源／泛稱作 standalone alias／identifier。${extraAiNote}`,
    lastReviewed: "2026-09-01",
  });
}

export const records = [
  treeGroupRecord({
    id: "taiwan-tree-people-association-list-screenshot-personal-20260901",
    name: "台灣樹人會",
    confidence: "medium",
    identitySources: [
      source(
        "政府資料開放平臺－全國性人民團體名冊",
        "https://data.gov.tw/dataset/13603",
        "查核日 2026-09-01",
        "內政部公開資料下載檔可精確命中『台灣樹人會』；只支持全國性人民團體名稱身分，不保存序號、成立日期、屆次、地址、人物或其他非必要欄位，也不作本次避雷理由。",
      ),
      source(
        "台灣樹人會 Facebook 公開頁",
        "https://www.facebook.com/treehuggerstw/",
        "查核日 2026-09-01",
        "公開頁面 title 直接顯示『台灣樹人會』，只用於橋接清單中的同名團體；不證明法律登記、清單描述、負面事件或使用者避雷理由。",
      ),
      source(
        "公民行動影音紀錄資料庫－富民生態公園綁黃絲帶活動新聞稿",
        "https://www.civilmedia.tw/archives/140094",
        "2026-07-09",
        "頁面署名『文／台灣樹人會、撫遠公園護樹聯盟』，可交叉確認兩個團體名稱曾共同發布該篇內容；只作名稱身分橋接，不代表本截圖由其製作、兩團體永久隸屬或有任何負面事實。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "taiwan-tree-protection-groups-alliance-list-screenshot-personal-20260901",
    name: "台灣護樹團體聯盟",
    confidence: "medium",
    identitySources: [
      source(
        "台灣護樹團體聯盟 Facebook 公開頁",
        "https://www.facebook.com/lovetreelaw/",
        "查核日 2026-09-01",
        "公開頁面 title 直接顯示『台灣護樹團體聯盟』，只用於橋接清單中的同名團體；不證明法律登記、清單描述、負面事件或使用者避雷理由。",
      ),
      source(
        "台灣護樹團體聯盟公開部落格",
        "https://twtreehugger.blogspot.com/",
        "查核日 2026-09-01",
        "部落格 title 使用『台灣護樹團體聯盟』，可作同名公開頁面交叉確認；頁面內容不作本次避雷理由，也不支持與清單其他團體的固定隸屬關係。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "taiwan-tree-protection-association-list-screenshot-personal-20260901",
    name: "台灣護樹協會",
    confidence: "medium",
    identitySources: [
      source(
        "政府資料開放平臺－全國性人民團體名冊",
        "https://data.gov.tw/dataset/13603",
        "查核日 2026-09-01",
        "內政部公開資料下載檔可精確命中『台灣護樹協會』；只支持全國性人民團體名稱身分，不保存序號、成立日期、屆次、地址、人物或其他非必要欄位，也不作本次避雷理由。",
      ),
      source(
        "台灣護樹協會 Facebook 公開頁",
        "https://www.facebook.com/LoveTree.org/about",
        "查核日 2026-09-01",
        "公開頁面 title 顯示『台灣護樹協會』，可與內政部名冊交叉橋接清單中的同名團體；社群帳號不進 searchable fields，頁面內容不作負面理由。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "taiwan-forest-city-association-list-screenshot-personal-20260901",
    name: "社團法人台灣森林城市協會",
    screenshotName: "森林城市協會",
    aliases: ["台灣森林城市協會", "森林城市協會"],
    identifiers: ["fcat2020.org"],
    confidence: "medium",
    identitySources: [
      source(
        "森林城市協會官方網站",
        "https://www.fcat2020.org/",
        "查核日 2026-09-01",
        "官方網站以『森林城市協會』名義呈現樹木、林蔭街道、森林公園與守護森林等倡議；只支持公開名稱與官方網域，不作本次個人避雷的負面理由。",
      ),
      source(
        "森林城市協會支持者管理系統",
        "https://fcat.neticrm.tw/",
        "查核日 2026-09-01",
        "頁面明稱是『森林城市協會』支持者管理系統，並直接連向 fcat2020.org 官網，可橋接清單中的簡稱與官方網域；不證明清單其他描述或任何負面事件。",
      ),
      source(
        "司法院全球資訊網－社團法人台灣森林城市協會法人登記公告",
        "https://www.judicial.gov.tw/tw/cp-144-932739-49a7e-1.html",
        "2023-08-31",
        "司法院公告直接使用正式名稱『社團法人台灣森林城市協會』，用於橋接正式法人名與『森林城市協會』；不保存人物、地址或其他非必要登記資料，也不支持負面定性。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "taiwan-beautiful-tree-association-list-screenshot-personal-20260901",
    name: "台灣真美樹協會",
    confidence: "medium",
    identitySources: [
      source(
        "台灣真美樹協會 Facebook 公開頁",
        "https://www.facebook.com/twsusg2tree/",
        "查核日 2026-09-01",
        "公開頁面 title 直接顯示『台灣真美樹協會』，只用於橋接清單中的同名團體；不證明法律登記、清單描述、負面事件或使用者避雷理由。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "fuyuan-park-tree-protection-alliance-list-screenshot-personal-20260901",
    name: "撫遠公園護樹聯盟",
    confidence: "medium",
    identitySources: [
      source(
        "公民行動影音紀錄資料庫－富民生態公園綁黃絲帶活動新聞稿",
        "https://www.civilmedia.tw/archives/140094",
        "2026-07-09",
        "頁面署名『文／台灣樹人會、撫遠公園護樹聯盟』，可交叉確認兩個團體名稱；只作身分橋接，不把該篇活動、其他作者或主張納入本次避雷理由。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "songyan-tree-protection-alliance-list-screenshot-personal-20260901",
    name: "松菸護樹聯盟",
    confidence: "medium",
    identitySources: [
      source(
        "公民行動影音紀錄資料庫－〈別讓中信金接手大巨蛋〉",
        "https://www.civilmedia.tw/archives/42637",
        "2016-01-22",
        "公庫採訪報導直接並列『松菸護樹志工團、松菸護樹聯盟』，支持兩者是分開具名的公開團體；本卡只橋接截圖中的『松菸護樹聯盟』，不把報導事件、另一團體、人物或主張納入避雷範圍。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "songshan-tree-protection-volunteer-group-list-screenshot-personal-20260901",
    name: "松山護樹志工團",
    extraAiNote:
      "公開查核可找到字形不同且與松菸護樹聯盟並列的『松菸護樹志工團』，但尚無來源證明它等同截圖所寫『松山護樹志工團』；本卡因此維持 low confidence，不加入『松菸護樹志工團』為 alias，也不合併兩者。",
  }),
  treeGroupRecord({
    id: "chengnan-old-tree-patrol-team-list-screenshot-personal-20260901",
    name: "城南老樹巡守隊",
    confidence: "medium",
    identitySources: [
      source(
        "公民行動影音紀錄資料庫－富民生態公園綁黃絲帶活動新聞稿",
        "https://www.civilmedia.tw/archives/140094",
        "2026-07-09",
        "新聞稿的聲援團體欄直接列出『城南老樹巡守隊』，可橋接截圖中的同名團體；只支持公開名稱曾被列出，不把該活動、其他團體、人物或主張納入避雷範圍。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "zhushu-xiaoqiu-tree-protection-studio-list-screenshot-personal-20260901",
    name: "筑樹小丘護樹工作室",
    confidence: "medium",
    identitySources: [
      source(
        "公民行動影音紀錄資料庫－富民生態公園綁黃絲帶活動新聞稿",
        "https://www.civilmedia.tw/archives/140094",
        "2026-07-09",
        "新聞稿的聲援團體欄直接列出『筑樹小丘護樹工作室』，可橋接截圖中的同名團體；只支持公開名稱曾被列出，不把該活動、其他團體、人物或主張納入避雷範圍。",
      ),
    ],
  }),
  treeGroupRecord({
    id: "xingding-old-tree-protection-action-list-screenshot-personal-20260901",
    name: "幸町老樹保護行動",
    screenshotName: "幸町老樹保護……（畫面截斷）",
    bridgeWording:
      "依同期公開團體清單完成字串為『幸町老樹保護行動』，並將此具名倡議行動",
    confidence: "medium",
    identitySources: [
      source(
        "公民行動影音紀錄資料庫－富民生態公園綁黃絲帶活動新聞稿",
        "https://www.civilmedia.tw/archives/140094",
        "2026-07-09",
        "新聞稿的聲援團體欄直接列出『城南老樹巡守隊、筑樹小丘護樹工作室、幸町老樹保護行動』，與截圖同段可見的前兩個名稱及截斷字串順序一致，支持把『幸町老樹保護……』補全為『幸町老樹保護行動』。此來源不證明它與歷史名稱『幸町百年老樹聯盟』或另見的『幸町老樹守護行動』是同一法律／組織實體，因此兩者都不作本卡 alias。",
      ),
    ],
  }),
];
