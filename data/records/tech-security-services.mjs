import {
  bis2019,
  cosmedChinaOriginOralCareSkuAliases20260628,
  dod1260h2026,
  euBevDuties,
  fccCoveredList,
  kmtCouncilListAliases20260626,
  kmtCurrentPublicFigureAliases,
  longTermMainlandChinaEntertainmentAliases,
  record,
  sasacCentralEnterprises,
  source,
  taiwanHighRiskApps,
  tppCouncilListAliases20260626,
  tppCurrentPublicFigureAliases,
  treeProtectionPublicFigureAliases,
} from "../record-helpers.mjs";
import { splitRecord } from "../split-record.mjs";

export const records = [
  record({
    "id": "anhe-technology-mofa-software-origin-personal-20261013",
    "name": "安和科技",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "科技／通訊／消費電子"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "medium",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對安和科技個人避開。據TVBS報導，安和科技涉嫌將含中國原始碼的 IP-guard 重新包裝為 ITS 系統，透過坤侑科技名義參與外交部採購。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：安和科技涉嫌將含中國原始碼的 IP-guard 重新包裝為 ITS 系統，透過坤侑科技名義參與外交部採購。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：安和科技涉嫌將含中國原始碼的 IP-guard 重新包裝為 ITS 系統，透過坤侑科技名義參與外交部採購。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。",
    "lastReviewed": "2026-10-13"
  }),
  record({
    "id": "kunyou-technology-mofa-software-origin-personal-20261013",
    "name": "坤侑科技",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "科技／通訊／消費電子"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "medium",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對坤侑科技個人避開。據TVBS報導，坤侑科技涉嫌以其名義投標外交部資訊資產管理軟體採購案，涉及軟體來源與台灣原創切結爭議。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。公視轉述坤侑科技稱遭廠商隱瞞產品技術來源、將配合司法調查；此為公司回應，非江家德本人親口聲明。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：坤侑科技涉嫌以其名義投標外交部資訊資產管理軟體採購案，涉及軟體來源與台灣原創切結爭議。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：坤侑科技涉嫌以其名義投標外交部資訊資產管理軟體採購案，涉及軟體來源與台灣原創切結爭議。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。另刊載坤侑科技稱遭廠商隱瞞產品技術來源、將配合司法調查；只屬媒體轉述公司回應，不是江家德親口聲明或公司原始聲明已核。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。公視刊載的反方說法屬坤侑公司回應，不歸為江家德親口發言；公司聲明原件未取得。",
    "lastReviewed": "2026-10-13"
  }),
  record({
    "id": "yiwei-technology-mofa-software-origin-personal-20261013",
    "name": "鎰威科技",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "科技／通訊／消費電子"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "medium",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對鎰威科技個人避開。據TVBS報導，鎰威科技被指涉本案的使用者介面修改與後續系統維護。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：鎰威科技被指涉本案的使用者介面修改與後續系統維護。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：鎰威科技被指涉修改程式介面。媒體報導公司於2026-10-12遭搜索；公司不是自然人交保對象，本輪未確認起訴或定罪。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。",
    "lastReviewed": "2026-10-13"
  }),
  record({
    "id": "lu-yi-kun-mofa-software-origin-personal-20261013",
    "name": "呂宜坤",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "司法／公眾人物案件"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "medium",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對呂宜坤個人避開。據TVBS報導，呂宜坤被列為安和科技實際負責人，涉嫌將含中國原始碼的軟體重新包裝並借名投標。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：呂宜坤被列為安和科技實際負責人，涉嫌將含中國原始碼的軟體重新包裝並借名投標。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：呂宜坤被列為安和科技負責人，涉嫌軟體重新包裝與借名投標；實際負責人的限定採TVBS，不據本篇推定登記角色。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。實際負責人僅依TVBS報導，不改寫為登記負責人或現任公司登記資料已核。",
    "lastReviewed": "2026-10-13"
  }),
  record({
    "id": "jiang-jia-de-mofa-software-origin-personal-20261013",
    "name": "江家德",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "司法／公眾人物案件"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "medium",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對江家德個人避開。據TVBS報導，江家德被列為坤侑科技負責人，被指涉以坤侑名義投標的安排。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。公視轉述坤侑科技稱遭廠商隱瞞產品技術來源、將配合司法調查；此為公司回應，非江家德本人親口聲明。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：江家德被列為坤侑科技負責人，被指涉以坤侑名義投標的安排。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：江家德被列為坤侑科技負責人，被指涉以坤侑名義投標的安排。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。另刊載坤侑科技稱遭廠商隱瞞產品技術來源、將配合司法調查；只屬媒體轉述公司回應，不是江家德親口聲明或公司原始聲明已核。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。公視刊載的反方說法屬坤侑公司回應，不歸為江家德親口發言；公司聲明原件未取得。",
    "lastReviewed": "2026-10-13"
  }),
  record({
    "id": "wu-sheng-zhen-mofa-software-origin-personal-20261013",
    "name": "吳聲振",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "司法／公眾人物案件"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "medium",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對吳聲振個人避開。據TVBS報導，吳聲振被列為鎰威科技負責人，被指涉使用者介面修改與後續維護。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：吳聲振被列為鎰威科技負責人，被指涉使用者介面修改與後續維護。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：吳聲振被列為鎰威科技負責人及本案被約談者。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。",
    "lastReviewed": "2026-10-13"
  }),
  record({
    "id": "zhan-zhong-xin-mofa-software-origin-personal-20261013",
    "name": "詹仲昕",
    "aliases": [],
    "identifiers": [],
    "country": "",
    "categories": [
      "司法／公眾人物案件"
    ],
    "avoidReasons": [
      "使用者個人避開",
      "軟體中國來源透明度疑慮",
      "採購與資安風險"
    ],
    "confidence": "low",
    "status": "personal",
    "summary": "使用者依本案軟體中國來源透明度、採購與資安風險，選擇對詹仲昕個人避開。據TVBS報導，詹仲昕被列為坤侑科技業務代表，被指涉協助修改程式介面。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。TVBS與聯合報寫詹仲昕，壹蘋寫詹種昕；本輪未取得官方姓名正字資料，採TVBS與聯合報所載的詹仲昕，另一字形僅為媒體差異、不作正式 alias。",
    "sources": [
      {
        "title": "外交部電腦藏大陸軟體？廠商偽台製「詐標2千萬」 4人交保限出境",
        "url": "https://news.tvbs.com.tw/local/4035218",
        "date": "2026-10-13",
        "note": "TVBS記者陳冠宇報導：詹仲昕被列為坤侑科技業務代表，被指涉協助修改程式介面。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。本篇姓名為詹仲昕；其他媒體字形不同，官方正字本輪未取得。"
      },
      {
        "title": "影／外交部資安系統竟藏陸製程式 坤侑科技等4廠商重金交保",
        "url": "https://udn.com/news/story/7321/9810679",
        "date": "2026-10-13",
        "note": "聯合報記者張宏業報導：詹仲昕被列為坤侑科技業務代表，被指涉協助修改程式介面。媒體報導本人於2026-10-12被約談，2026-10-13複訊後交保並限制出境、出海；本輪未確認起訴或定罪。本篇使用詹仲昕字形；官方姓名正字本輪未取得。"
      },
      {
        "title": "外交部外館電腦遭裝中國軟體 廠商涉洗產地投標4人訊後交保 ｜ 公視新聞網 PNN",
        "url": "https://news.pts.org.tw/article/831117",
        "date": "2026-10-13",
        "note": "公視轉述外交部稱軟體僅裝在上網電腦、未涉及機敏資訊，近一年連線紀錄沒有異常；不證明已外洩或遭入侵。"
      },
      {
        "title": "外館資訊系統涉含中國原始碼　外交部：主動通報已做損害管控",
        "url": "https://www.cna.com.tw/news/aipl/202610130041.aspx",
        "date": "2026-10-13",
        "note": "中央社記者林敬殷、楊堯茹轉述外交部：2025年12月稽核發現軟體部分檔案含中國企業簽章，主動通報並提供程式調查；軟體裝設於上網電腦、未涉及機敏資訊，連線紀錄無異常。本來源用作案件背景與部方回應，不證明四人完整姓名或本案定罪。"
      },
      {
        "title": "大漏洞！外交部資安系統竟用中國軟體　3廠商4人全交保",
        "url": "https://news.nextapple.com/local/20261013/90AFF801C58A7967E31BD4F681697C0D",
        "date": "2026-10-13",
        "note": "壹蘋記者張欽在同案將坤侑業務姓名寫為詹種昕；與TVBS、聯合報的詹仲昕字形不同。本來源僅保存姓名差異，官方正字本輪未取得，不採作正式 alias。"
      }
    ],
    "aiNotes": "本筆僅為使用者指定對象的 personal 個人避開；媒體報導的涉嫌角色與交保程序不是有罪認定。本輪未取得本案檢方、調查局或外交部官方發布原件、起訴書或裁判，未確認起訴或定罪；未取得不等於文件不存在。不推定已洩密、已入侵、通敵或背後動機。公視與中央社轉述外交部稱軟體裝設於上網電腦、未涉及機敏資訊，查連線紀錄無異常；這是媒體保存的部方說法，不是本輪直接取得官方原件。搜尋只本卡名稱；aliases、identifiers、country皆空，不以其他公司、人物、產品、來源媒體、機關、職稱或事件詞作搜尋鍵，不擴上游廣州溢信、IP-guard／ITS、員工或家屬。TVBS與聯合報寫詹仲昕，壹蘋寫詹種昕；本輪未取得官方姓名正字資料，採TVBS與聯合報所載的詹仲昕，另一字形僅為媒體差異、不作正式 alias。",
    "lastReviewed": "2026-10-13"
  }),

  record({
    id: "huawei",
    name: "華為 / Huawei",
    aliases: ["Huawei", "HUAWEI", "華為", "Mate", "Pura", "nova", "MateBook", "HUAWEI WATCH", "HUAWEI Band", "FreeBuds", "MatePad", "AppGallery", "華為路由器"],
    categories: ["手機", "平板", "筆電", "穿戴裝置", "耳機", "路由器", "網通設備", "消費電子"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "軍民融合風險", "資料安全風險"],
    confidence: "high",
    status: "confirmed",
    summary: "華為消費品與網通設備在台灣仍可見，且有 FCC Covered List、歐盟 5G 高風險供應商與美國國防部 1260H 名單等國安來源支撐。",
    sources: [
      source("HUAWEI 消費者業務台灣官網", "https://consumer.huawei.com/tw/", "查核日 2026-06-25", "支撐台灣消費者可接觸智慧穿戴、平板、音頻、路由器等產品。"),
      fccCoveredList,
      dod1260h2026,
      source("European Commission - 5G Cybersecurity Toolbox Implementation", "https://digital-strategy.ec.europa.eu/en/library/communication-commission-implementation-5g-cybersecurity-toolbox", "2023-06-15", "歐委會說明 Huawei/ZTE 較其他 5G 供應商有實質更高風險。"),
    ],
  }),
  ...splitRecord(record({
    id: "zte-nubia-redmagic",
    name: "中興通訊 / ZTE / nubia / REDMAGIC",
    aliases: ["ZTE", "中興", "中興通訊", "nubia", "努比亞", "REDMAGIC", "紅魔", "Axon", "Blade", "5G CPE"],
    categories: ["手機", "電競手機", "通訊設備", "網路設備"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "資料安全風險"],
    confidence: "high",
    status: "confirmed",
    summary: "ZTE 及其消費品牌 nubia/REDMAGIC 可用 FCC 國安清單、歐盟高風險供應商與制裁違規紀錄支撐風險標籤。",
    sources: [
      fccCoveredList,
      source("U.S. Treasury - Settlement with ZTE", "https://home.treasury.gov/news/press-releases/sm0023", "2017-03-07", "OFAC 說明 ZTE 違反伊朗制裁並隱匿交易。"),
      source("European Commission - 5G Cybersecurity Toolbox Implementation", "https://digital-strategy.ec.europa.eu/en/library/communication-commission-implementation-5g-cybersecurity-toolbox", "2023-06-15", "歐委會說明 Huawei/ZTE 5G 供應商風險。"),
    ],
  }), [
    {
      "name": "中興通訊",
      "aliases": [
        "ZTE",
        "中興",
        "ZTE Axon",
        "ZTE Blade",
        "ZTE 5G CPE"
      ],
      "identifiers": [],
      "summary": "中興通訊（ZTE）保留 FCC Covered List、2017 年 OFAC 制裁違規和解及歐盟 5G 供應商風險來源；這些來源的實體、設備及服務範圍各有差異，不等於每款 ZTE 消費品皆有問題。",
      "aiNotes": "本筆只限 ZTE。nubia／REDMAGIC 另列，不能把 ZTE 的制裁違規直接歸責於其他品牌；Axon／Blade／5G CPE 僅保留加上 ZTE 限定的既有有效鍵。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [
        {
          "title": "FCC Covered List",
          "url": "https://www.fcc.gov/supplychain/coveredlist",
          "date": "查核日 2026-06-25",
          "note": "FCC Covered List 納入被認定對美國國家安全構成不可接受風險的通訊或影像監控設備與服務。"
        },
        {
          "title": "U.S. Treasury - Settlement with ZTE",
          "url": "https://home.treasury.gov/news/press-releases/sm0023",
          "date": "2017-03-07",
          "note": "OFAC 說明 ZTE 違反伊朗制裁並隱匿交易。"
        },
        {
          "title": "European Commission - 5G Cybersecurity Toolbox Implementation",
          "url": "https://digital-strategy.ec.europa.eu/en/library/communication-commission-implementation-5g-cybersecurity-toolbox",
          "date": "2023-06-15",
          "note": "歐委會說明 Huawei/ZTE 5G 供應商風險。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "nubia",
      "aliases": [
        "努比亞"
      ],
      "identifiers": [],
      "summary": "nubia 原已列於群組收錄範圍；本筆保留為關聯觀察，不把ZTE 的 OFAC 制裁違規、FCC 清單與歐盟 5G 供應商風險視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。ZTE 的 OFAC 制裁違規、FCC 清單與歐盟 5G 供應商風險的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "REDMAGIC",
      "aliases": [
        "紅魔"
      ],
      "identifiers": [],
      "summary": "REDMAGIC 原已列於群組收錄範圍；本筆保留為關聯觀察，不把ZTE 的 OFAC 制裁違規、FCC 清單與歐盟 5G 供應商風險視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。ZTE 的 OFAC 制裁違規、FCC 清單與歐盟 5G 供應商風險的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    }
  ]),
  ...splitRecord(record({
    id: "china-state-telecoms",
    name: "中國移動／中國電信／中國聯通",
    aliases: ["中國移動", "China Mobile", "CMLink", "CMHK", "中國電信", "China Telecom", "中國聯通", "China Unicom", "SIM", "eSIM", "漫遊卡"],
    categories: ["電信服務", "SIM 卡", "eSIM", "行動通訊", "漫遊"],
    avoidReasons: ["中共政權關聯風險", "國企／央企", "制裁／國安風險"],
    confidence: "high",
    status: "confirmed",
    summary: "中國三大電信商屬中國國資體系，且被 FCC 與美國國防部名單以國安理由納入風險範圍。",
    sources: [dod1260h2026, fccCoveredList],
  }), [
    {
      "name": "中國移動",
      "aliases": [
        "China Mobile"
      ],
      "identifiers": [],
      "summary": "中國移動在既有群組中列為中國國資體系電信商，保留原美國國防部 1260H 國安風險來源。FCC 清單涉及特定實體／服務，不把其範圍直接擴為中國移動所有品牌與服務。",
      "aiNotes": "本筆只處理中國移動；CMLink、CMHK 另列。未重新核對 FCC 清單中各法人與服務的精確適用範圍，故不承接 FCC 來源；1260H 名單不等於一般消費禁售。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [
        {
          "title": "U.S. DoD Section 1260H Chinese Military Companies List",
          "url": "https://media.defense.gov/2026/Jun/08/2003945537/-1/-1/1/ENTITIES-IDENTIFIED-AS-CHINESE-MILITARY-COMPANIES-OPERATING-IN-THE-UNITED-STATES-IN-ACCORDANCE-WITH-SECTION-1260H.PDF",
          "date": "2026-06-08",
          "note": "美國國防部依 Section 1260H 公布中國軍事公司名單；此為國安／軍民融合風險來源，不等同一般消費禁售。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "中國電信",
      "aliases": [
        "China Telecom"
      ],
      "identifiers": [],
      "summary": "中國電信在既有群組中列為中國國資體系電信商，保留原美國國防部 1260H 國安風險來源。FCC 清單涉及特定實體／服務，不擴寫為中國電信所有服務均受相同限制。",
      "aiNotes": "只承接原群組的中國電信國安風險脈絡。未重新核對 FCC 清單各法人／服務範圍，不承接該來源，也不宣稱一般消費禁售。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [
        {
          "title": "U.S. DoD Section 1260H Chinese Military Companies List",
          "url": "https://media.defense.gov/2026/Jun/08/2003945537/-1/-1/1/ENTITIES-IDENTIFIED-AS-CHINESE-MILITARY-COMPANIES-OPERATING-IN-THE-UNITED-STATES-IN-ACCORDANCE-WITH-SECTION-1260H.PDF",
          "date": "2026-06-08",
          "note": "美國國防部依 Section 1260H 公布中國軍事公司名單；此為國安／軍民融合風險來源，不等同一般消費禁售。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "中國聯通",
      "aliases": [
        "China Unicom"
      ],
      "identifiers": [],
      "summary": "中國聯通在既有群組中列為中國國資體系電信商，保留原美國國防部 1260H 國安風險來源。FCC 清單涉及特定實體／服務，不擴寫為中國聯通所有服務均受相同限制。",
      "aiNotes": "只承接原群組的中國聯通國安風險脈絡。未重新核對 FCC 清單各法人／服務範圍，不承接該來源，也不宣稱一般消費禁售。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [
        {
          "title": "U.S. DoD Section 1260H Chinese Military Companies List",
          "url": "https://media.defense.gov/2026/Jun/08/2003945537/-1/-1/1/ENTITIES-IDENTIFIED-AS-CHINESE-MILITARY-COMPANIES-OPERATING-IN-THE-UNITED-STATES-IN-ACCORDANCE-WITH-SECTION-1260H.PDF",
          "date": "2026-06-08",
          "note": "美國國防部依 Section 1260H 公布中國軍事公司名單；此為國安／軍民融合風險來源，不等同一般消費禁售。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "CMLink",
      "aliases": [],
      "identifiers": [],
      "summary": "CMLink 原已列於群組收錄範圍；本筆保留為關聯觀察，不把中國移動的法人名單與特定服務限制視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。中國移動的法人名單與特定服務限制的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "CMHK",
      "aliases": [],
      "identifiers": [],
      "summary": "CMHK 原已列於群組收錄範圍；本筆保留為關聯觀察，不把中國移動的法人名單與特定服務限制視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。中國移動的法人名單與特定服務限制的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    }
  ]),
  ...splitRecord(record({
    id: "tp-link",
    name: "TP-Link",
    aliases: ["TP-Link", "Archer", "Deco", "Tapo", "Omada", "VIGI", "Mercusys"],
    categories: ["路由器", "Mesh Wi-Fi", "網路設備", "智慧家庭", "攝影機"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "TP-Link 是常見消費網路設備品牌；2026 年美國國防部 1260H 名單將 TP-Link Technologies 列入，支撐國安／軍民融合風險標籤。",
    sources: [dod1260h2026],
  }), [
    {
      "id": "tp-link",
      "name": "TP-Link",
      "aliases": [
        "TP-Link",
        "Archer",
        "Deco",
        "Omada"
      ],
      "identifiers": [],
      "summary": "TP-Link 是常見消費網路設備品牌；2026 年美國國防部 1260H 名單將 TP-Link Technologies 列入，支撐國安／軍民融合風險標籤。"
    },
    {
      "name": "Mercusys",
      "aliases": [],
      "identifiers": [],
      "summary": "Mercusys 原已列於TP-Link 原紀錄的名稱鍵；本筆僅保留原群組的關聯觀察範圍，既有來源未直接支持本品牌獨立風險，不將母卡的制裁、官方名單或特定產品問題套用於本筆。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "sources": [],
      "aiNotes": "由既有名稱鍵移為獨立對象，未新增品牌關聯或風險事實。原來源不足以支持本品牌的個別制裁、國安、人權或供應鏈結論，故 sources 留空，僅保留原群組觀察；不推定母卡所有限制自動適用。本次未外查，查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "Tapo",
      "aliases": [],
      "identifiers": [],
      "summary": "Tapo 原已列於TP-Link 原紀錄的名稱鍵；本筆僅保留原群組的關聯觀察範圍，既有來源未直接支持本品牌獨立風險，不將母卡的制裁、官方名單或特定產品問題套用於本筆。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "sources": [],
      "aiNotes": "由既有名稱鍵移為獨立對象，未新增品牌關聯或風險事實。原來源不足以支持本品牌的個別制裁、國安、人權或供應鏈結論，故 sources 留空，僅保留原群組觀察；不推定母卡所有限制自動適用。本次未外查，查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "VIGI",
      "aliases": [],
      "identifiers": [],
      "summary": "VIGI 原已列於TP-Link 原紀錄的名稱鍵；本筆僅保留原群組的關聯觀察範圍，既有來源未直接支持本品牌獨立風險，不將母卡的制裁、官方名單或特定產品問題套用於本筆。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "sources": [],
      "aiNotes": "由既有名稱鍵移為獨立對象，未新增品牌關聯或風險事實。原來源不足以支持本品牌的個別制裁、國安、人權或供應鏈結論，故 sources 留空，僅保留原群組觀察；不推定母卡所有限制自動適用。本次未外查，查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "lastReviewed": "2026-06-25"
    }
  ]),
  ...splitRecord(record({
    id: "hikvision",
    name: "海康威視 / Hikvision",
    aliases: ["Hikvision", "海康威視", "HiLook", "Hik-Connect", "HiLookVision", "Turbo HD", "AcuSense", "ColorVu", "DarkFighter", "DeepinView"],
    categories: ["監控攝影機", "NVR", "DVR", "AI 影像監控", "智慧安防"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Hikvision 有 BIS Entity List、FCC Covered List 與 DoD 1260H 等官方來源，風險焦點在新疆高科技監控、國安與軍民融合。",
    sources: [bis2019, fccCoveredList, dod1260h2026],
  }), [
    {
      "id": "hikvision",
      "name": "海康威視 / Hikvision",
      "aliases": [
        "Hikvision",
        "海康威視",
        "Hik-Connect",
        "Turbo HD",
        "AcuSense",
        "ColorVu",
        "DarkFighter",
        "DeepinView"
      ],
      "identifiers": [],
      "summary": "Hikvision 有 BIS Entity List、FCC Covered List 與 DoD 1260H 等官方來源，風險焦點在新疆高科技監控、國安與軍民融合。"
    },
    {
      "name": "HiLook",
      "aliases": [
        "HiLookVision"
      ],
      "identifiers": [],
      "summary": "HiLook 原已列於海康威視原紀錄的名稱鍵；本筆僅保留原群組的關聯觀察範圍，既有來源未直接支持本品牌獨立風險，不將母卡的制裁、官方名單或特定產品問題套用於本筆。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "sources": [],
      "aiNotes": "由既有名稱鍵移為獨立對象，未新增品牌關聯或風險事實。原來源不足以支持本品牌的個別制裁、國安、人權或供應鏈結論，故 sources 留空，僅保留原群組觀察；不推定母卡所有限制自動適用。本次未外查，查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "lastReviewed": "2026-06-25"
    }
  ]),
  ...splitRecord(record({
    id: "dahua",
    name: "大華 / Dahua",
    aliases: ["Dahua", "大華", "Imou", "DMSS", "SmartPSS", "WizSense", "WizMind", "TiOC", "HDCVI", "XVR", "NVR"],
    categories: ["監控攝影機", "NVR", "DVR", "智慧安防", "家用攝影機"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Dahua 有 BIS Entity List、FCC Covered List 與 DoD 1260H 等官方來源，風險焦點在新疆高科技監控與國安。",
    sources: [bis2019, fccCoveredList, dod1260h2026],
  }), [
    {
      "id": "dahua",
      "name": "大華 / Dahua",
      "aliases": [
        "Dahua",
        "大華",
        "DMSS",
        "SmartPSS",
        "WizSense",
        "WizMind",
        "TiOC",
        "HDCVI",
        "XVR",
        "NVR"
      ],
      "identifiers": [],
      "summary": "Dahua 有 BIS Entity List、FCC Covered List 與 DoD 1260H 等官方來源，風險焦點在新疆高科技監控與國安。"
    },
    {
      "name": "Imou",
      "aliases": [],
      "identifiers": [],
      "summary": "Imou 原已列於大華原紀錄的名稱鍵；本筆僅保留原群組的關聯觀察範圍，既有來源未直接支持本品牌獨立風險，不將母卡的制裁、官方名單或特定產品問題套用於本筆。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "sources": [],
      "aiNotes": "由既有名稱鍵移為獨立對象，未新增品牌關聯或風險事實。原來源不足以支持本品牌的個別制裁、國安、人權或供應鏈結論，故 sources 留空，僅保留原群組觀察；不推定母卡所有限制自動適用。本次未外查，查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "lastReviewed": "2026-06-25"
    }
  ]),
  record({
    id: "dji",
    name: "大疆 / DJI",
    aliases: ["DJI", "大疆", "Mavic", "Mini", "Air", "Phantom", "Matrice", "Agras", "Osmo", "DJI Fly", "DJI Pilot", "DJI Terra", "DJI Dock", "ROMO"],
    categories: ["無人機", "空拍機", "影像設備", "工業巡檢", "智慧家電"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "軍民融合風險", "人權監控風險"],
    confidence: "high",
    status: "confirmed",
    summary: "DJI 在台有購買渠道；OFAC 曾以新疆監控脈絡說明其風險，並被列入美國國防部 1260H 名單。",
    sources: [
      source("DJI 台灣購買渠道", "https://www.dji.com/tw/where-to-buy/retail-stores", "查核日 2026-06-25", "支撐台灣有 DJI 授權體驗店與購買渠道。"),
      source("U.S. Treasury - Chinese tech firms and military-industrial complex", "https://home.treasury.gov/news/press-releases/jy0538", "2021-12-16", "OFAC 指稱 DJI 提供無人機給新疆公安局，用於監控維吾爾人。"),
      dod1260h2026,
    ],
  }),
  record({
    id: "sensetime",
    name: "商湯科技 / SenseTime",
    aliases: ["SenseTime", "商湯", "SenseFoundry", "SenseNebula", "SensePass", "SenseME", "SenseCore"],
    categories: ["AI 視覺", "人臉辨識", "智慧城市", "監控分析"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "SenseTime 被 BIS、OFAC 與 DoD 來源納入風險脈絡，重點在人臉辨識、人權監控與軍民融合。",
    sources: [
      source("U.S. Treasury - Human rights abuse sanctions", "https://home.treasury.gov/news/press-releases/jy0526", "2021-12-10", "OFAC 指稱 SenseTime 子公司開發可判定目標族裔、特別識別維吾爾人的人臉辨識程式。"),
      bis2019,
      dod1260h2026,
    ],
  }),
  record({
    id: "megvii-facepp",
    name: "曠視科技 / Megvii / Face++",
    aliases: ["Megvii", "曠視", "Face++", "FaceID", "Brain++", "MegEngine"],
    categories: ["AI 視覺", "人臉辨識", "身分驗證", "智慧安防"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Megvii/Face++ 被 BIS 與 OFAC 放入新疆監控與人權風險脈絡，適合列為高信心智慧安防候選。",
    sources: [
      bis2019,
      source("U.S. Treasury - Chinese tech firms and military-industrial complex", "https://home.treasury.gov/news/press-releases/jy0538", "2021-12-16", "OFAC 指稱 Megvii/Kuangshi 開發可對維吾爾等族群進行監控與警報的客製軟體。"),
    ],
  }),
  record({
    id: "iflytek",
    name: "科大訊飛 / iFlytek",
    aliases: ["iFLYTEK", "科大訊飛", "訊飛", "Xfyun", "iFLYTEK Open Platform", "訊飛輸入法", "SparkDesk", "星火", "ASR", "TTS"],
    categories: ["AI 語音", "聲紋辨識", "輸入法", "AI 服務", "公安科技"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險"],
    confidence: "high",
    status: "confirmed",
    summary: "iFlytek 被 BIS Entity List 納入新疆高科技監控與人權風險脈絡；其消費辨識可包含輸入法、語音與 AI 服務。",
    sources: [bis2019],
  }),
  record({
    id: "uniview",
    name: "宇視科技 / Uniview / UNV",
    aliases: ["Uniview", "宇視", "UNV", "UNV Guard", "IP Camera", "PTZ Camera", "NVR"],
    categories: ["監控攝影機", "影像監控", "智慧安防"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Uniview 於 2024 年被 BIS 加入 Entity List，理由涉及高科技監控一般民眾、維吾爾人及其他少數族群。",
    sources: [
      source("Federal Register - Additions to the Entity List", "https://www.federalregister.gov/documents/2024/12/11/2024-29136/additions-to-the-entity-list", "2024-12-11", "BIS 指稱 Uniview 促成針對一般民眾、維吾爾人及其他少數族群的高科技監控。"),
    ],
  }),
  record({
    id: "cloudwalk",
    name: "雲從科技 / CloudWalk",
    aliases: ["CloudWalk", "雲從", "CloudWalk facial recognition", "CWOS"],
    categories: ["AI 視覺", "人臉辨識", "智慧城市", "監控分析"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險"],
    confidence: "high",
    status: "confirmed",
    summary: "CloudWalk 被 OFAC 放入少數族群監控風險脈絡，重點在人臉辨識與公安監控應用。",
    sources: [
      source("U.S. Treasury - Chinese tech firms and military-industrial complex", "https://home.treasury.gov/news/press-releases/jy0538", "2021-12-16", "OFAC 指稱 CloudWalk 開發追蹤藏人與維吾爾人的人臉辨識軟體，並可向當局警報。"),
    ],
  }),
  record({
    id: "yitu",
    name: "依圖科技 / Yitu",
    aliases: ["Yitu", "依圖", "Yitu facial recognition", "AI video analytics"],
    categories: ["AI 視覺", "人臉辨識", "監控分析"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Yitu 有 BIS、OFAC 與 DoD 來源，風險焦點在人臉辨識、維吾爾監控與軍民融合。",
    sources: [
      bis2019,
      source("U.S. Treasury - Chinese tech firms and military-industrial complex", "https://home.treasury.gov/news/press-releases/jy0538", "2021-12-16", "OFAC 指稱 Yitu 開發專門尋找維吾爾人的人臉辨識技術並整合進監控攝影機網路。"),
      dod1260h2026,
    ],
  }),
  ...splitRecord(record({
    id: "netposa-sensenets",
    name: "東方網力 / NetPosa / SenseNets",
    aliases: ["NetPosa", "東方網力", "SenseNets", "video cloud", "facial recognition database"],
    categories: ["影像監控平台", "人臉辨識", "公安資料庫"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險"],
    confidence: "high",
    status: "confirmed",
    summary: "NetPosa/SenseNets 被 OFAC 與 DoD 放入公安監控、人臉辨識資料庫與安全部隊關聯風險脈絡。",
    sources: [
      source("U.S. Treasury - Chinese tech firms and military-industrial complex", "https://home.treasury.gov/news/press-releases/jy0538", "2021-12-16", "OFAC 指稱 NetPosa 控制 SenseNets，其人臉辨識資料庫結合 GPS 與敏感個資追蹤包含維吾爾人在內的人員。"),
      dod1260h2026,
    ],
  }), [
    {
      "name": "東方網力",
      "aliases": [
        "NetPosa"
      ],
      "identifiers": [],
      "summary": "既有美國財政部來源指稱 NetPosa 控制 SenseNets，並描述後者的人臉辨識資料庫與維吾爾人追蹤；本筆保留對 NetPosa 的控制關聯與國防部名單風險，不把子公司具體行為改寫為母公司所有產品的功能。",
      "aiNotes": "NetPosa 與 SenseNets 分列；財政部來源中的資料庫功能須歸屬 SenseNets，不宣稱所有 NetPosa 產品均具相同行為。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [
        {
          "title": "U.S. Treasury - Chinese tech firms and military-industrial complex",
          "url": "https://home.treasury.gov/news/press-releases/jy0538",
          "date": "2021-12-16",
          "note": "OFAC 指稱 NetPosa 控制 SenseNets，其人臉辨識資料庫結合 GPS 與敏感個資追蹤包含維吾爾人在內的人員。"
        },
        {
          "title": "U.S. DoD Section 1260H Chinese Military Companies List",
          "url": "https://media.defense.gov/2026/Jun/08/2003945537/-1/-1/1/ENTITIES-IDENTIFIED-AS-CHINESE-MILITARY-COMPANIES-OPERATING-IN-THE-UNITED-STATES-IN-ACCORDANCE-WITH-SECTION-1260H.PDF",
          "date": "2026-06-08",
          "note": "美國國防部依 Section 1260H 公布中國軍事公司名單；此為國安／軍民融合風險來源，不等同一般消費禁售。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "SenseNets",
      "aliases": [],
      "identifiers": [],
      "summary": "既有美國財政部來源指稱，NetPosa 控制的 SenseNets 人臉辨識資料庫結合 GPS 與敏感個資，追蹤包含維吾爾人在內的人員；本筆只承接該具名描述，不推定其獨立列入美國國防部名單。",
      "avoidReasons": [
        "中共政權關聯風險",
        "人權監控風險"
      ],
      "aiNotes": "不承接原群組 DoD 1260H 來源；未重新核對 SenseNets 是否另以獨立法人列名。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "科技／通訊資安"
      ],
      "sources": [
        {
          "title": "U.S. Treasury - Chinese tech firms and military-industrial complex",
          "url": "https://home.treasury.gov/news/press-releases/jy0538",
          "date": "2021-12-16",
          "note": "OFAC 指稱 NetPosa 控制 SenseNets，其人臉辨識資料庫結合 GPS 與敏感個資追蹤包含維吾爾人在內的人員。"
        }
      ],
      "lastReviewed": "2026-06-25"
    }
  ]),
  record({
    id: "meiya-pico-sdic-intelligence",
    name: "美亞柏科 / SDIC Intelligence",
    aliases: ["Meiya Pico", "美亞柏科", "SDIC Intelligence", "國投智能", "mobile forensics", "digital forensics"],
    categories: ["數位鑑識", "公安科技", "監控軟體"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "人權監控風險", "國企／央企"],
    confidence: "high",
    status: "confirmed",
    summary: "Meiya Pico/SDIC Intelligence 屬公安監控與數位鑑識供應商脈絡，有 BIS、OFAC 與 DoD 來源。",
    sources: [
      bis2019,
      source("U.S. Treasury - Chinese tech firms and military-industrial complex", "https://home.treasury.gov/news/press-releases/jy0538", "2021-12-16", "OFAC 指稱 Meiya Pico 開發可追蹤手機圖片、音訊、位置與訊息的應用。"),
      dod1260h2026,
    ],
  }),
  record({
    id: "autel-robotics",
    name: "道通智能 / Autel Robotics",
    aliases: ["Autel Robotics", "Autel", "道通", "Autel EVO", "Dragonfish", "Autel Sky"],
    categories: ["無人機", "工業無人機", "公共安全 UAV"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Autel Robotics 被美國國防部 1260H 名單列入，支撐軍民融合與國安風險標籤。",
    sources: [dod1260h2026],
  }),
  ...splitRecord(record({
    id: "bytedance",
    name: "字節跳動 / ByteDance",
    aliases: ["ByteDance", "字節跳動", "TikTok", "抖音", "Douyin", "CapCut", "剪映", "Lemon8", "Hypic"],
    categories: ["短影音", "社群 App", "影音剪輯 App", "內容平台"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "資料安全／審查風險"],
    confidence: "high",
    status: "confirmed",
    summary: "ByteDance/TikTok 有美國最高法院與台灣公部門資安限制來源，風險重點在外國敵對控制 App、資料與演算法控制。",
    sources: [
      source("TikTok Inc. v. Garland, U.S. Supreme Court opinion", "https://www.supremecourt.gov/opinions/24pdf/24-656_ca7d.pdf", "2025-01-17", "美國最高法院意見書處理 ByteDance-owned TikTok 相關國安風險與 PAFACA 適用。"),
      source("台灣公部門：勿以公務設備使用抖音或小紅書等軟體", "https://www.tyy.moj.gov.tw/233917/234014/1328913/1328982/post", "2022-12-27", "公告稱抖音/TikTok、小紅書列入危害國家資通安全產品。"),
    ],
  }), [
    {
      "name": "字節跳動",
      "aliases": [
        "ByteDance"
      ],
      "identifiers": [],
      "summary": "既有美國最高法院 TikTok Inc. v. Garland 意見書處理 ByteDance-owned TikTok 的國安風險與 PAFACA 適用；本筆保留字節跳動在該案的控制關聯，不擴為旗下所有 App 皆受相同法律限制。",
      "aiNotes": "TikTok、抖音及其他已收錄 App 各自分列；法院意見限於原案與原查核時點，不證明所有旗下 App 的資料行為或現行法律狀態。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "TikTok Inc. v. Garland, U.S. Supreme Court opinion",
          "url": "https://www.supremecourt.gov/opinions/24pdf/24-656_ca7d.pdf",
          "date": "2025-01-17",
          "note": "美國最高法院意見書處理 ByteDance-owned TikTok 相關國安風險與 PAFACA 適用。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "TikTok",
      "aliases": [],
      "identifiers": [],
      "summary": "TikTok 保留既有美國最高法院意見書的 ByteDance-owned TikTok 國安／PAFACA 脈絡，以及台灣公部門公告的公務設備使用限制；不擴張至其他 App 或一般消費禁售。",
      "aiNotes": "只承接 TikTok 的既有來源，不將抖音或其他字節 App 的行為混為同一產品；法院意見與公告皆保留原日期，並非本次重新查核現況。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "TikTok Inc. v. Garland, U.S. Supreme Court opinion",
          "url": "https://www.supremecourt.gov/opinions/24pdf/24-656_ca7d.pdf",
          "date": "2025-01-17",
          "note": "美國最高法院意見書處理 ByteDance-owned TikTok 相關國安風險與 PAFACA 適用。"
        },
        {
          "title": "台灣公部門：勿以公務設備使用抖音或小紅書等軟體",
          "url": "https://www.tyy.moj.gov.tw/233917/234014/1328913/1328982/post",
          "date": "2022-12-27",
          "note": "公告稱抖音/TikTok、小紅書列入危害國家資通安全產品。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "抖音",
      "aliases": [
        "Douyin"
      ],
      "identifiers": [],
      "summary": "抖音保留既有台灣公部門公告列入危害國家資通安全產品的脈絡；本筆不承接以 TikTok 為對象的美國最高法院意見書結論。",
      "aiNotes": "抖音與 TikTok 分列；不將 TikTok 案的法律適用或其他字節 App 的資料行為直接套用。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "台灣公部門：勿以公務設備使用抖音或小紅書等軟體",
          "url": "https://www.tyy.moj.gov.tw/233917/234014/1328913/1328982/post",
          "date": "2022-12-27",
          "note": "公告稱抖音/TikTok、小紅書列入危害國家資通安全產品。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "CapCut",
      "aliases": [],
      "identifiers": [],
      "summary": "CapCut 原已列於群組收錄範圍；本筆保留為關聯觀察，不把TikTok 法院意見書或抖音／TikTok 公務設備限制視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。TikTok 法院意見書或抖音／TikTok 公務設備限制的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "剪映",
      "aliases": [],
      "identifiers": [],
      "summary": "剪映 原已列於群組收錄範圍；本筆保留為關聯觀察，不把TikTok 法院意見書或抖音／TikTok 公務設備限制視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。TikTok 法院意見書或抖音／TikTok 公務設備限制的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "Lemon8",
      "aliases": [],
      "identifiers": [],
      "summary": "Lemon8 原已列於群組收錄範圍；本筆保留為關聯觀察，不把TikTok 法院意見書或抖音／TikTok 公務設備限制視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。TikTok 法院意見書或抖音／TikTok 公務設備限制的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "Hypic",
      "aliases": [],
      "identifiers": [],
      "summary": "Hypic 原已列於群組收錄範圍；本筆保留為關聯觀察，不把TikTok 法院意見書或抖音／TikTok 公務設備限制視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。TikTok 法院意見書或抖音／TikTok 公務設備限制的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    }
  ]),
  ...splitRecord(record({
    id: "tencent-wechat",
    name: "騰訊 / Tencent / WeChat",
    aliases: ["Tencent", "騰訊", "WeChat", "微信", "Weixin", "QQ", "QQ Wallet", "WeChat Pay", "微信支付", "Tencent Video", "WeTV", "騰訊會議", "騰訊遊戲"],
    categories: ["通訊 App", "社群", "支付", "影音串流", "遊戲", "雲端服務"],
    avoidReasons: ["中共政權關聯風險", "制裁／國安風險", "資料安全／審查風險", "軍民融合風險"],
    confidence: "high",
    status: "confirmed",
    summary: "Tencent/WeChat 有美國國防部 1260H、台灣資安署與 Citizen Lab 技術研究來源；風險焦點在微信資料、審查與國安。",
    sources: [
      dod1260h2026,
      taiwanHighRiskApps,
      source("Citizen Lab - We Chat, They Watch", "https://citizenlab.ca/research/we-chat-they-watch/", "2020-05-07", "研究指出非中國註冊 WeChat 帳號通訊也會被監測以支援中國區審查系統。"),
    ],
  }), [
    {
      "name": "騰訊",
      "aliases": [
        "Tencent"
      ],
      "identifiers": [],
      "summary": "騰訊保留原美國國防部 1260H 名單的國安／軍民融合風險脈絡；微信資料與審查研究另列於 WeChat，不將特定 App 技術結論套用於騰訊全部服務。",
      "avoidReasons": [
        "中共政權關聯風險",
        "制裁／國安風險",
        "軍民融合風險"
      ],
      "aiNotes": "1260H 名單不等於一般消費禁售；WeChat、QQ、支付、影音、會議與遊戲品牌各自分列。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "U.S. DoD Section 1260H Chinese Military Companies List",
          "url": "https://media.defense.gov/2026/Jun/08/2003945537/-1/-1/1/ENTITIES-IDENTIFIED-AS-CHINESE-MILITARY-COMPANIES-OPERATING-IN-THE-UNITED-STATES-IN-ACCORDANCE-WITH-SECTION-1260H.PDF",
          "date": "2026-06-08",
          "note": "美國國防部依 Section 1260H 公布中國軍事公司名單；此為國安／軍民融合風險來源，不等同一般消費禁售。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "WeChat",
      "aliases": [
        "微信",
        "Weixin"
      ],
      "identifiers": [],
      "summary": "WeChat 保留台灣資安署高風險 App 警示與 Citizen Lab 2020 年研究：研究指非中國註冊帳號通訊也會被監測以支援中國區審查系統；不把騰訊公司的 1260H 名單身分當成 WeChat 獨立受列名。",
      "avoidReasons": [
        "中共政權關聯風險",
        "資料安全／審查風險"
      ],
      "aiNotes": "Citizen Lab 結論限於該研究的 WeChat 情境與時點，不移植至 QQ、微信支付或其他騰訊 App。Weixin 保留為原群組的微信名稱鍵，不宣稱各區版本功能完全相同。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "台灣資安署：提醒民眾對於資安高風險 App 須慎選使用",
          "url": "https://moda.gov.tw/ACS/press/news/press/18104",
          "date": "2025-12-03",
          "note": "台灣資安署點名多款中國 App 具高風險，並說明中國法規下企業可能被要求提供用戶資料。"
        },
        {
          "title": "Citizen Lab - We Chat, They Watch",
          "url": "https://citizenlab.ca/research/we-chat-they-watch/",
          "date": "2020-05-07",
          "note": "研究指出非中國註冊 WeChat 帳號通訊也會被監測以支援中國區審查系統。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "QQ",
      "aliases": [],
      "identifiers": [],
      "summary": "QQ 原已列於群組收錄範圍；本筆保留為關聯觀察，不把WeChat 的 Citizen Lab 技術研究、資安署具名警示或騰訊公司 1260H 列名視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。WeChat 的 Citizen Lab 技術研究、資安署具名警示或騰訊公司 1260H 列名的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "QQ Wallet",
      "aliases": [],
      "identifiers": [],
      "summary": "QQ Wallet 原已列於群組收錄範圍；本筆保留為關聯觀察，不把WeChat 技術研究或騰訊公司 1260H 列名視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。WeChat 技術研究或騰訊公司 1260H 列名的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "WeChat Pay",
      "aliases": [
        "微信支付"
      ],
      "identifiers": [],
      "summary": "WeChat Pay 原已列於群組收錄範圍；本筆保留為關聯觀察，不把WeChat 通訊研究或騰訊公司 1260H 列名視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。WeChat 通訊研究或騰訊公司 1260H 列名的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "Tencent Video",
      "aliases": [],
      "identifiers": [],
      "summary": "Tencent Video 原已列於群組收錄範圍；本筆保留為關聯觀察，不把WeChat 技術研究或騰訊公司 1260H 列名視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。WeChat 技術研究或騰訊公司 1260H 列名的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "WeTV",
      "aliases": [],
      "identifiers": [],
      "summary": "WeTV 保留原已收錄的騰訊服務範圍；本檔既有 2020 年 OTT 報導同時具名 WeTV，記錄台灣主管機關及對中國 OTT 業者服務的限制脈絡。這是原日期的媒體報導，不是本次重新查核現行法律，也不承接 WeChat 技術研究或騰訊公司 1260H 列名。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險",
        "政府限制"
      ],
      "aiNotes": "沿用本檔愛奇藝紀錄原有且同時具名 WeTV 的歷史 OTT 報導；未新增外部事實或重新核對法規現況。不把 WeChat 通訊研究或騰訊公司的 1260H 名單身分套用至 WeTV，也不視為騰訊所有影音服務均受同一限制。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        source("Taipei Times - China's iQiyi is illegal in Taiwan, NCC says", "https://www.taipeitimes.com/News/taiwan/archives/2020/05/21/2003736791", "2020-05-21", "報導台灣 NCC/跨部會會議認定 iQIYI 與 WeTV 為非法中國 OTT 業者。"),
        source("TechCrunch - Taiwan set to bar Chinese streaming services", "https://techcrunch.com/2020/08/19/taiwan-set-to-bar-chinese-streaming-services-like-iqiyi-and-tencents-wetv/", "2020-08-19", "報導台灣禁止台灣公司或個人替中國 OTT 業者提供服務。"),
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "騰訊會議",
      "aliases": [],
      "identifiers": [],
      "summary": "騰訊會議 原已列於群組收錄範圍；本筆保留為關聯觀察，不把WeChat 技術研究或騰訊公司 1260H 列名視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。WeChat 技術研究或騰訊公司 1260H 列名的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "騰訊遊戲",
      "aliases": [],
      "identifiers": [],
      "summary": "騰訊遊戲 原已列於群組收錄範圍；本筆保留為關聯觀察，不把WeChat 技術研究或騰訊公司 1260H 列名視為本對象已獲證實的獨立風險。",
      "status": "watchlist",
      "confidence": "medium",
      "avoidReasons": [
        "既有群組關聯風險"
      ],
      "aiNotes": "原群組已收錄本名稱，但既有來源未直接支持本對象的獨立風險結論；sources 留空，不以關聯代替證據。WeChat 技術研究或騰訊公司 1260H 列名的直接結論不適用於本筆。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [],
      "lastReviewed": "2026-06-25"
    }
  ]),
  ...((group) => splitRecord(group, [
    {
      id: group.id, name: "愛彼蓋爾國際有限公司", aliases: ["愛彼蓋爾"], country: "台灣",
      summary: "使用者原指定愛彼蓋爾國際有限公司個人避開。既有具名報導稱其兩名負責人涉將台灣門號註冊的 LINE 帳號出租給中共網軍，士林地檢署對兩名自然人依幫助違反個資法作緩起訴，妨害電腦使用部分不起訴；這是公司關聯背景，不表示公司法人獲刑事有罪判決、全體人員涉案或攻擊均成功。",
      aiNotes: "公司與三名人物、中國端公司各自查詢。緩起訴／不起訴程序屬報導中的自然人，不改成公司被判同罪；不推定現任代表人、歷任負責人皆涉案。本次沿用2026-07-07報導，未核程序後續。",
    },
    ...["李樺倫", "陳孟森"].map((name) => ({
      name, country: "",
      avoidReasons: ["使用者個人避開", "本人個資法緩起訴報導"],
      summary: `既有中時具名報導將${name}列為愛彼蓋爾兩名負責人之一，太報報導士林地檢署對兩人依幫助違反個資法給予緩起訴、妨害電腦使用部分不起訴。使用者原已將該具名本人列入個人避開；不是法院有罪判決，不把洪清涯的通緝或中國端公司的行為歸於本人，也不推定查詢日仍有同一職務或程序狀態。`,
      aiNotes: "本人姓名由既有具名新聞橋接，不從公司現任登記猜人。保留緩起訴與妨害電腦使用不起訴的分別，不推實際入侵成功、其他人罪責或今日職務。本次只拆資料，沒有重新查偵查結果。",
    })),
    {
      name: "洪清涯", country: "", sources: [group.sources[1]],
      avoidReasons: ["使用者個人避開", "中國端負責人通緝報導"],
      summary: "使用者原已對洪清涯本人個人避開。既有太報／LINE TODAY 2026年7月7日報導稱，中國端負責人洪清涯另由士林地檢署發布通緝；通緝不是有罪判決，也不能改成愛彼蓋爾兩名負責人的緩起訴或不起訴結果適用本人。未核後續是否到案、撤銷通緝或裁判。",
      aiNotes: "只承接來源對洪清涯的具名通緝報導，不把程序混成其他兩人的緩起訴／不起訴；不新增罪名、判刑、定讞或現況。",
    },
    {
      name: "廈門市女帝信息科技有限公司", country: "中國",
      aliases: ["廈門市女帝訊息科技有限公司", "厦门市女帝信息科技有限公司"],
      sources: [group.sources[0]],
      avoidReasons: ["使用者個人避開", "新聞所載中國端公司與帳號租用／社交工程關聯"],
      summary: "既有中時2026年7月7日報導稱廈門市女帝信息科技有限公司透過台灣愛彼蓋爾公司租用 LINE 帳號並涉及偽冒記者的社交工程攻擊脈絡，使用者原已依此對該中國端公司個人避開。這是報導所載關聯，不表示公司、全體人員均遭有罪判決，亦不將台灣兩名負責人緩起訴或洪清涯通緝直接當成公司處分。",
      aiNotes: "只保留原具名公司及繁簡／信息與訊息名稱變體；中共網軍是來源的說法，不自行新增國資、股權、控制、制裁或成功入侵事實。本次沒有重新核對公司或案件現況。",
    },
  ]))(record({
    id: "abigail-international-line-accounts-cyberattack-personal",
    name: "愛彼蓋爾國際有限公司",
    aliases: [
      "愛彼蓋爾國際有限公司",
      "愛彼蓋爾",
      "李樺倫",
      "陳孟森",
      "洪清涯",
      "廈門市女帝信息科技有限公司",
      "廈門市女帝訊息科技有限公司",
      "厦门市女帝信息科技有限公司",
    ],
    country: "台灣／中國",
    categories: ["資安", "資訊服務", "數位服務"],
    avoidReasons: [
      "使用者個人避開",
      "中共網軍關聯風險",
      "LINE 帳號出租／個資法緩起訴報導",
      "社交工程攻擊脈絡",
    ],
    confidence: "medium",
    status: "personal",
    summary:
      "使用者指定列入個人避開：公開報導稱，愛彼蓋爾國際有限公司 2 名負責人涉將台灣手機門號註冊的 LINE 帳號出租給中共網軍使用，相關帳號被用於偽冒國際記者身分、接觸台灣政學界人士並發動社交工程攻擊；士林地檢署對李姓實際負責人與陳姓前登記負責人依幫助違反個人資料保護法給予緩起訴，妨害電腦使用部分則獲不起訴。中時報導直接列名李樺倫、陳孟森；太報／LINE TODAY 報導則稱中國端洪清涯另由士檢發布通緝。此筆僅記錄使用者個人避開與公開報導可確認的偵查／緩起訴脈絡，不作法院有罪判決、所有關係人現況、公司現任登記代表人或未經來源支持的延伸定論。",
    sources: [
      source("中時新聞網 - 冒天下雜誌總編蒐集機密 台『愛彼蓋爾』2負責人勾結中共網軍下場曝", "https://www.chinatimes.com/realtimenews/20260707001775-260402", "2026-07-07", "報導稱調查局查出中共網軍『廈門市女帝信息科技有限公司』透過台灣『愛彼蓋爾』公司租用台灣民眾 LINE 帳號，偽冒國際記者對政學界人士發動網攻；文中列名李樺倫、陳孟森，並稱士林地檢署對 2 人緩起訴。"),
      source("太報／LINE TODAY - 冒充《天下》總編輯駭國會 台男租帳號給中共網軍涉個資法獲緩起訴", "https://today.line.me/tw/v3/article/YaKz5xM", "2026-07-07", "報導稱愛彼蓋爾國際有限公司 2 名負責人涉嫌將台灣手機門號註冊的 LINE 帳號以每個人民幣 1100 元代價出租給中共網軍；士林地檢署依幫助違反個人資料保護法給予緩起訴，妨害電腦使用部分不起訴；並提到中國端負責人洪清涯另由士檢發布通緝。"),
    ],
    aiNotes:
      "此筆是 user-directed personal record with public reporting. 可說公開報導支持愛彼蓋爾國際有限公司與 LINE 帳號出租、中共網軍、社交工程攻擊、個資法緩起訴脈絡；不可寫成法院有罪判決、妨害電腦使用成立、惡意程式已成功入侵、所有公司現任／歷任登記代表人都涉案，或把公司登記現任代表人與新聞中的李姓實際負責人混同。台灣公司稅籍號碼不得放入任何欄位；aliases 僅保留公司名、報導列名／涉及的主要人名與中國端公司名，不放『網軍』『LINE帳號』『駭客』『社交工程』『個資法』『緩起訴』等原因詞。",
    lastReviewed: "2026-07-07",
  })),
  record({
    id: "lg-webos-smart-tv-privacy-acr-personal-20260909",
    name: "LG webOS 智慧電視",
    aliases: [
      "LG webOS TV",
      "LG Smart TV",
      "LG 智慧電視",
      "LG OLED TV",
      "LG OLED evo",
      "LG G5 OLED",
      "LG G3 OLED",
      "LG QNED TV",
      "LG QNED",
      "LG QNED73B",
      "樂金智慧電視",
      "樂金電視",
    ],
    categories: ["科技／通訊／消費電子", "監控／AI／資安"],
    avoidReasons: [
      "使用者個人避開",
      "ACR 觀看資料與廣告追蹤",
      "居家網路與裝置盤點疑慮",
      "待機語音與資安風險疑慮",
    ],
    confidence: "high",
    status: "personal",
    summary:
      "使用者提供 BlockTempo 文章並明確指定避雷；本筆只收錄 LG 品牌的 webOS 智慧電視，不擴及 LG 冰箱、洗衣機、顯示器等其他產品，也不擴及採用 webOS 的其他電視品牌。LG 官方 Smart TV 法律文件明載：連網電視即使未接受選用附加協議，仍會接收部分裝置資訊、基本使用資訊及 LG Channels 資料；同意觀看資訊協議後，ACR／Live Plus 可辨識廣播、串流、機上盒、遊戲機與 HDMI 等來源內容，觀看、裝置及基本使用資訊可提供給 Alphonso，並可能用於分析、廣告、資料擴充與商業化；另同意感興趣／跨裝置廣告後，可向與電視共用 IP 的其他裝置投放廣告。美國版文件同時明確說 ACR 分析的是電視喇叭 soundboard 的播放訊號，不直接取用電視或遙控器麥克風；語音功能則需另行同意／啟用。LG 於2022年也官方宣布把 LG Ads Solutions 自有 ACR 部署至27國、數百萬台 LG 智慧電視。美國德州總檢察長於2026年5月宣布與 LG Electronics U.S.A. 達成協議，要求在德州收集 ACR 觀看資料前取得明確知情同意並提供簡單退出方式；協議文本明載這不是 LG 承認違法或責任。Gamers Nexus 與合作研究者於2026年9月公布 G5、G3、QNED73B 等零售 LG 電視測試，報告原生功能會列舉區域網路裝置與附近 Wi‑Fi 資訊；調查也在啟用語音功能後取得語音轉錄，並另以研究用遠端存取／漏洞情境展示螢幕待機、網路斷線時仍可收音及本機保存。Ars Technica 與 The Register 均將這些內容歸屬於該團隊報告；LG 經 Ars 表示同網路裝置掃描是為裝置連線、內容分享及智慧家庭功能。現有公開材料仍不足以證明所有 LG 型號、出廠預設狀態都會持續偷錄環境聲音，或所有掃描所得資料都會傳送給 LG；LG 曾否認收集、錄製或保存環境對話。LG 官方支援文件則確認，部分型號啟用 Direct Voice Recognition、Always Ready 或 Quick Start 後，螢幕關閉時仍可等待喚醒詞。本筆個人避開理由以官方確認的裝置／使用資料處理、ACR 觀看資料與跨裝置廣告商業化、德州同意機制整改，以及新技術調查呈現的居家裝置盤點與受控入侵後待機收音風險為限；不把 ACR 寫成房間麥克風錄音，也不把『全面竊聽』、自動上傳離線房間錄音、遠端攻擊可行性或尚在負責任揭露中的漏洞當成已獲獨立驗證的事實。",
    sources: [
      source("BlockTempo - LG webOS TV 待機麥克風、網路掃描與 ACR 隱私報導", "https://www.blocktempo.com/lg-webos-tv-standby-microphone-network-scanning-acr-advertising-privacy/", "查核日 2026-09-09", "使用者提供的二手報導；用於確認其避雷理由與追溯 Gamers Nexus 原始調查，不單獨作為所有技術主張已證實的依據。"),
      source("Gamers Nexus - LG webOS TV privacy investigation", "https://www.youtube.com/watch?v=6IFVTcM28KA", "查核日 2026-09-09", "原始技術調查；團隊以 G5、G3、QNED73B 等零售 LG 電視、封包分析與韌體檢視報告 LAN／Wi‑Fi 掃描及 ACR，另在啟用語音功能後取得轉錄，並以研究用遠端存取／漏洞情境展示待機、離線收音與本機保存；尚未公開漏洞仍在負責任揭露期。"),
      source("Ars Technica - LG TV shown capable of tracking user activity, even when offline", "https://arstechnica.com/gadgets/2026/09/lg-tv-shown-capable-of-tracking-user-activity-even-when-offline/", "2026-09-08", "具名科技媒體整理 Gamers Nexus 測試；LG 經 Ars 表示同網路掃描用於裝置連線、內容分享及智慧家庭功能。Ars 同時保留是否把全部掃描資訊傳給 LG、用途是否超出廣告或診斷仍不清楚。"),
      source("The Register - LG accused of egregious invasion of privacy over TV data collection", "https://www.theregister.com/security/2026/09/08/lg-accused-of-egregious-invasion-of-privacy-over-tv-data-collection/", "2026-09-08", "具名資安媒體交代語音、網路掃描與 ACR 指控，並記錄 LG 先前否認收集環境對話、稱語音辨識為可選且由使用者啟用的回應。"),
      source("LG Global - LG Smart TVs Get a New ACR Solution", "https://www.lg.com/global/newsroom/news/media-entertainment-solution/lg-smart-tvs-get-a-new-acr-solution-legacy-technology-replaced-by-lg-ads-solutions", "2022-09-15", "LG 官方確認自有 ACR 部署至27國數百萬台智慧電視，家庭層級觀看資料供品牌進行廣告觸及、頻率與成效分析；LG 稱資料已去識別化並符合法規。"),
      source("LG Legal Documents (Smart TV) - Taiwan", "https://tw.lgappstv.com/main/terms", "上次更新 2026-01；查核日 2026-09-09", "台灣版官方文件說明未接受附加協議時仍接收部分裝置、基本使用與 LG Channels 資料；同意觀看資訊後，ACR／Live Plus 會把觀看、裝置及基本使用資訊提供給 Alphonso；另同意感興趣廣告後可向共用 IP 的其他裝置投放廣告。"),
      source("LG Legal Documents (Smart TV) - United States", "https://us.lgappstv.com/main/terms", "上次更新 2026-05；查核日 2026-09-09", "美國版官方 ACR、語音與跨裝置廣告協議；明載 ACR 分析 soundboard 播放訊號而非直接取用麥克風、語音麥克風預設關閉且須同意才能啟用，並說明撤回觀看資訊、關閉 Live Plus、Limit Ad Tracking 等選項。"),
      source("Texas Attorney General - Agreement with LG on Smart TV ACR", "https://www.texasattorneygeneral.gov/news/releases/attorney-general-ken-paxton-secures-major-agreement-lg-protect-texans-privacy-and-stop-data-being", "2026-05-11", "德州總檢察長宣布與 LG Electronics U.S.A. 達成協議，要求 ACR 觀看資料收集前取得明確知情同意、揭露用途並提供容易退出的方式。"),
      source("Texas v. LG - Agreed Final Judgment and Permanent Injunction", "https://www.texasattorneygeneral.gov/sites/default/files/images/press/LG.pdf", "2026-05", "協議判決文本把適用消費者與 Smart TV 定義限於德州，要求 affirmative express consent，並明載協議不構成 LG 承認違法、過失或責任。"),
      source("LG USA Support - How to Use the Always Ready Function", "https://www.lg.com/us/support/help-library/lg-tv-how-to-use-the-always-ready-function--20153870949064", "查核日 2026-09-09", "LG 官方說明部分2022年後型號啟用 Always Ready 後，遙控關機會進入該模式；若另啟用語音辨識設定，螢幕關閉時仍可使用語音辨識。拔除電源線則不會啟用。"),
      source("LG USA Support - Using Voice Commands", "https://www.lg.com/us/support/help-library/lg-tv-using-voice-commands-CT10000018-20153219134177", "2026-07-17", "LG 官方確認支援 Direct Voice Recognition 的電視，可在關閉時透過 Hi LG 喚醒；需啟用語音辨識，且依年份另須 Always Ready 或 Quick Start／Quick Start+。"),
      source("TechRadar - LG statement on ambient conversations", "https://www.techradar.com/televisions/lgs-gaming-monitors-and-tvs-are-facing-a-user-revolt", "2026-07-22更新", "TechRadar 刊載 LG 電郵聲明：LG 電視不收集、錄製或儲存環境對話；語音辨識是可選、由使用者啟動的功能。此為媒體保存的廠商聲明，不是 LG 官方永久頁面。"),
    ],
    aiNotes:
      "本筆是 LG 品牌 webOS 智慧電視產品線的 personal 避雷，不是 LG 全集團或所有 webOS 授權品牌。可直接陳述 LG 官方 Smart TV 條款中的基礎裝置／使用資料、同意後的 ACR／Alphonso 資料分享與跨裝置廣告、LG 官方 ACR 商業化及德州同意機制協議。ACR 使用電視播放 soundboard 訊號，不得寫成 ACR 本身透過房間麥克風偷聽。LAN／附近 Wi‑Fi 詳細列舉、離線／待機收音與漏洞內容須歸屬於 Gamers Nexus 及其合作研究者；LG 只經 Ars 承認同網路相容裝置探索是標準智慧功能。不得把研究者以 root／漏洞示範的遠端麥克風情境寫成 LG 出廠預設持續竊聽，也不得聲稱離線錄音會由原生服務自動上傳、所有掃描資訊都已證實傳給 LG、漏洞已公開驗證，或德州協議等同 LG 承認違法。",
    lastReviewed: "2026-09-09",
  }),
  ...splitRecord(record({
    id: "deskin-zuler-todesk",
    name: "DeskIn / Zuler / ToDesk",
    aliases: ["DeskIn", "DeskIn Remote Desktop", "Zuler", "ZULER TECHNOLOGY PTE. LTD.", "ToDesk", "ToDesk Remote Desktop", "ToDesk远程控制"],
    identifiers: ["deskin.io", "todesk.com", "com.zuler.deskin", "海南有趣科技有限公司", "琼ICP备20000605号-1", "琼B2-20190526"],
    country: "新加坡／中國",
    categories: ["遠端控制軟體", "遠端桌面 App", "雲端服務"],
    avoidReasons: ["中國公司／中國法域關聯風險", "資料安全／遠端控制風險", "品牌與 ToDesk 關聯"],
    confidence: "medium",
    status: "watchlist",
    summary: "DeskIn 的 Google Play 與官方隱私政策列開發／服務主體為新加坡 ZULER TECHNOLOGY PTE. LTD.；但 DeskIn 官方 About 頁同時稱 Zuler 旗下知名品牌包含 DeskIn 與 ToDesk，而 ToDesk 官網／隱私政策列中國公司海南有趣科技有限公司、海南 ICP／增值電信許可與中國境內個資儲存。因 DeskIn 是遠端控制軟體，先列中可信度 watchlist。",
    sources: [
      source("Google Play - DeskIn Remote Desktop", "https://play.google.com/store/apps/details?id=com.zuler.deskin", "查核日 2026-06-28", "Google Play 列 DeskIn Remote Desktop，開發者為 ZULER TECHNOLOGY PTE. LTD.，功能包含遠端存取、無人值守遠端存取、檔案傳輸與行動裝置控制。"),
      source("DeskIn - Privacy Policy", "https://deskin.io/privacy-policy", "查核日 2026-06-28", "DeskIn 隱私政策列 ZULER TECHNOLOGY PTE. LTD. 為 DeskIn 服務主體。"),
      source("DeskIn - About Us", "https://deskin.io/about-zuler", "查核日 2026-06-28", "DeskIn 官方 About 頁稱 Zuler 旗下知名品牌包含 DeskIn 與 ToDesk，並列新加坡地址與 Zuler Technology PTE. LTD.。"),
      source("ToDesk - About Us", "https://www.todesk.com/about.html", "查核日 2026-06-28", "ToDesk 官網介紹久尺科技，列北京、上海、廣州、海口、新加坡辦公地點；頁腳列海南有趣科技有限公司、琼公网安备、琼B2 與琼 ICP。"),
      source("ToDesk - 隱私政策", "https://www.todesk.com/privacy.html", "查核日 2026-06-28", "ToDesk 隱私政策列海南有趣科技有限公司，並稱在中華人民共和國境內收集和產生的個人信息將存儲於中國境內。"),
    ],
    aiNotes: "此筆是 watchlist：目前公開來源支持 DeskIn 與 ToDesk／海南有趣科技存在官方品牌與服務關聯，且 DeskIn/ToDesk 是高敏感度遠端控制軟體；但尚未查到 DeskIn 本身被制裁、列入台灣高風險 App 清單、國資或中共黨建證據。回答時不要寫成已確認國資、黨建或制裁案例；也不要把『遠端桌面』『遠控』『檔案傳輸』等功能泛稱當成 alias。",
  }), [
    {
      "name": "DeskIn",
      "aliases": [
        "DeskIn Remote Desktop"
      ],
      "identifiers": [
        "deskin.io",
        "com.zuler.deskin"
      ],
      "summary": "DeskIn 的既有 Google Play 與官方隱私政策列新加坡 ZULER TECHNOLOGY PTE. LTD. 為開發／服務主體；官方 About 頁列 DeskIn 與 ToDesk 為 Zuler 品牌。只以遠端控制軟體的敏感性及既有品牌關聯保留觀察，不將 ToDesk 的中國境內個資儲存政策當成 DeskIn 政策。",
      "country": "新加坡／中國關聯",
      "aiNotes": "原群組列的 ToDesk 海南服務公司、許可及中國境內儲存只屬 ToDesk；不推定 DeskIn 個資均存於中國，也不稱其已遭制裁、列入台灣高風險 App、國資或黨建已證實。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "Google Play - DeskIn Remote Desktop",
          "url": "https://play.google.com/store/apps/details?id=com.zuler.deskin",
          "date": "查核日 2026-06-28",
          "note": "Google Play 列 DeskIn Remote Desktop，開發者為 ZULER TECHNOLOGY PTE. LTD.，功能包含遠端存取、無人值守遠端存取、檔案傳輸與行動裝置控制。"
        },
        {
          "title": "DeskIn - Privacy Policy",
          "url": "https://deskin.io/privacy-policy",
          "date": "查核日 2026-06-28",
          "note": "DeskIn 隱私政策列 ZULER TECHNOLOGY PTE. LTD. 為 DeskIn 服務主體。"
        },
        {
          "title": "DeskIn - About Us",
          "url": "https://deskin.io/about-zuler",
          "date": "查核日 2026-06-28",
          "note": "DeskIn 官方 About 頁稱 Zuler 旗下知名品牌包含 DeskIn 與 ToDesk，並列新加坡地址與 Zuler Technology PTE. LTD.。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "Zuler",
      "aliases": [
        "ZULER TECHNOLOGY PTE. LTD."
      ],
      "identifiers": [],
      "summary": "既有 DeskIn 隱私政策與 About 頁列 ZULER TECHNOLOGY PTE. LTD. 為新加坡服務主體，並列 DeskIn、ToDesk 品牌；本筆只保留服務主體與遠端控制品牌關聯觀察，不將 ToDesk 中國公司的資料儲存條款套用於 Zuler 全部服務。",
      "country": "新加坡",
      "avoidReasons": [
        "遠端控制服務關聯風險",
        "品牌與 ToDesk 關聯"
      ],
      "aiNotes": "不因品牌關聯推定 Zuler 與海南有趣科技為同一法人，或認定國資、黨建、制裁與統一的中國境內資料儲存政策。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "Google Play - DeskIn Remote Desktop",
          "url": "https://play.google.com/store/apps/details?id=com.zuler.deskin",
          "date": "查核日 2026-06-28",
          "note": "Google Play 列 DeskIn Remote Desktop，開發者為 ZULER TECHNOLOGY PTE. LTD.，功能包含遠端存取、無人值守遠端存取、檔案傳輸與行動裝置控制。"
        },
        {
          "title": "DeskIn - Privacy Policy",
          "url": "https://deskin.io/privacy-policy",
          "date": "查核日 2026-06-28",
          "note": "DeskIn 隱私政策列 ZULER TECHNOLOGY PTE. LTD. 為 DeskIn 服務主體。"
        },
        {
          "title": "DeskIn - About Us",
          "url": "https://deskin.io/about-zuler",
          "date": "查核日 2026-06-28",
          "note": "DeskIn 官方 About 頁稱 Zuler 旗下知名品牌包含 DeskIn 與 ToDesk，並列新加坡地址與 Zuler Technology PTE. LTD.。"
        }
      ],
      "lastReviewed": "2026-06-25"
    },
    {
      "name": "ToDesk",
      "aliases": [
        "ToDesk Remote Desktop",
        "ToDesk远程控制"
      ],
      "identifiers": [
        "todesk.com",
        "海南有趣科技有限公司",
        "琼ICP备20000605号-1",
        "琼B2-20190526"
      ],
      "summary": "既有 ToDesk 官網與隱私政策列海南有趣科技有限公司及海南 ICP／增值電信許可，並稱中國境內收集和產生的個人信息存儲於中國境內；與 DeskIn 的品牌關聯由原官方 About 頁保留。此筆為遠端控制與中國法域資料風險觀察，不是制裁或已外洩認定。",
      "country": "中國",
      "avoidReasons": [
        "中國公司／中國法域關聯風險",
        "資料安全／遠端控制風險"
      ],
      "aiNotes": "海南公司名稱與許可只歸 ToDesk，不是 DeskIn 或 Zuler 的獨立識別。中國境內儲存描述限於政策所稱中國境內收集／產生的個資，不推為所有地區資料均適用。本次僅重整既有紀錄、未重新外查；查核日期沿用原紀錄。",
      "categories": [
        "App／數位服務"
      ],
      "sources": [
        {
          "title": "DeskIn - About Us",
          "url": "https://deskin.io/about-zuler",
          "date": "查核日 2026-06-28",
          "note": "DeskIn 官方 About 頁稱 Zuler 旗下知名品牌包含 DeskIn 與 ToDesk，並列新加坡地址與 Zuler Technology PTE. LTD.。"
        },
        {
          "title": "ToDesk - About Us",
          "url": "https://www.todesk.com/about.html",
          "date": "查核日 2026-06-28",
          "note": "ToDesk 官網介紹久尺科技，列北京、上海、廣州、海口、新加坡辦公地點；頁腳列海南有趣科技有限公司、琼公网安备、琼B2 與琼 ICP。"
        },
        {
          "title": "ToDesk - 隱私政策",
          "url": "https://www.todesk.com/privacy.html",
          "date": "查核日 2026-06-28",
          "note": "ToDesk 隱私政策列海南有趣科技有限公司，並稱在中華人民共和國境內收集和產生的個人信息將存儲於中國境內。"
        }
      ],
      "lastReviewed": "2026-06-25"
    }
  ]),
];
