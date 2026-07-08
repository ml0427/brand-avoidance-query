# AI_NOTES — brand-avoidance-query

此檔保存品牌避雷專案的耐久工作流記憶。未來處理本專案時，優先讀本檔與 `AGENTS.md`；全域 memory 只保留索引，不保存本專案細節。

## 2026-07-06 專案記憶位置

- 品牌避雷專案的規則、踩坑、近期案例與驗證口徑，應寫回本 repo：`AGENTS.md`、`AI_NOTES.md`、record 的 `summary` / `sources.note` / `aiNotes`。
- Obsidian 工作流筆記若已存在，可作舊索引；此 repo 內檔案才是專案記憶主檔。

## 2026-07-06 收尾標準

- 預設收尾標準：本機 validator PASS，`warnings: 0; errors: 0`，commit 並 push 到 `origin/main`。
- 不預設查 GitHub Pages / 線上 `brands.json`。只有使用者要求，或正在處理線上版故障，才確認 Pages。
- 不預設同步 Pinecone；除非使用者要求或 legacy 查詢需要。

## 2026-07-06 台灣公司稅籍號碼不查不存

- 使用者明確修正：不是只從 `identifiers` 拿掉，而是這類號碼一開始就不要查，既有資料也要移除。
- 後續看見商品標籤、公司資料或來源頁上有台灣公司稅籍號碼時，直接略過，不寫進 `aliases`、`identifiers`、`summary`、`sources.note` 或 `aiNotes`。
- `scripts/validate-brand-records.mjs` 已增加 `tax-id-data` 檢查；generated `brands.json` 不得殘留台灣公司稅籍號碼資料或相關欄位標籤。
- 條碼、域名、地址、官方帳號、法院／制裁正式案號仍可視使用情境保留在 `identifiers`。

## 2026-07-06 泛稱查詢改為使用者端可查、入庫端把關

- 使用者明確提出：泛稱應改成 AI 加入紀錄時的檢查，使用者查詢時可以使用泛稱。
- 已移除 `app-core.mjs` 的使用者查詢端 exact generic blocklist；`filterBrands()` 不再因 `GENERIC_QUERY_BLOCKLIST` 直接回空。
- 搜尋索引會處理 `identifiers` 的 `標籤：值` 格式，只索引冒號後的值；但台灣公司稅籍號碼不得出現在任何紀錄欄位。
- validator 改以 `generic-search-fields` 檢查入庫資料品質：泛稱不應是 exact `name` / `aliases` / `identifiers`；但泛稱出現在完整品牌名或 qualified alias 中可以被使用者查到。
- `--negative` 現為進階零命中回歸測試，不再拿來測普通泛稱；需要確認某查詢不該命中特定紀錄時，用 `--not-expect query=>record-id`。

## 2026-07-06 統一園之味蘋果汁

- Record: `uni-president-yuanzhiwei-apple-juice-china-origin-personal`
- 依據：使用者提供瓶身標籤截圖；標籤可讀到統一「園之味 100%果汁 蘋果汁」、原產地中國、統一企業股份有限公司、統一企業楊梅廠、條碼約 `4710088473141`。
- 口徑：可說「這款統一園之味蘋果汁標籤顯示原產地中國，因此個人避買」。不可延伸為統一企業全部產品、中資／國資／中共控制、食安、違法或禁售。
- 查詢：正查使用 `統一企業 園之味`、`統一 園之味 蘋果汁`、`統一蘋果汁`、`園之味`、`園之味100%果汁` 或條碼。

## 2026-07-06 蕭景田圖卡查核

- Record: `hsiao-ching-tien-kmt-1984-police-killing-case-personal`
- 社群圖卡只作線索。
- 保守口徑：公開媒體資料與中央社報導可支撐「蕭景田 1984 年涉入殺警案；中央社報導引述其因運送屍體罪被判刑入獄」。
- 不可寫成「法院認定蕭景田親手殺警」或「殺人罪定讞」，除非另有正式判決／法院資料。
- 查詢設計：姓名放 aliases；羅立柏、力照霖、1984年殺警案、運送屍體罪放 identifiers；`殺警`、`殺警案`、`殺警奪槍` 等泛稱不應作 exact alias / identifier，但使用者查詢端不再硬擋。

## 2026-07-04 纖享樂／JOY FOOD 纖享樂

- Record: `xianxiangle-li-zaishenbian-canned-pear-china-origin-personal`
- OCR 曾把「纖享樂」誤讀為「織享樂」；正式品牌名以標籤與公開通路結果的「纖享樂」為準。
- 冰糖燉梨罐頭標籤確認原產地中國；同品牌其他品項是使用者指示「反正都先加進去」後列入 personal，同時保留 caveat：不是每款都已逐一確認中國原產。
- 「家裡吃，沒花錢」：此類紀錄不是消費記帳，只是家中食用時發現標籤，列入未來避買。

## 2026-07-06 豚人拉麵長榮店

- Record: `butanchu-tainan-changrong-unification-personal`
- 使用者提供 Threads 連結並明確說「支持統一，直接加入」。
- 截圖可支撐店家識別：豚人拉麵 長榮店、帳號 `butanchu_tainan`、地址台南市東區長榮路二段159號、營業時間與菜單；截圖本身未顯示政治主張。
- 口徑：可說「使用者提供 Threads 線索指稱支持統一，因此列個人避開」。不可說官方承認、違法、法院認定，或所有豚人拉麵分店都同一立場。
- 查詢設計：正查 `豚人拉麵`、`豚人拉麵 長榮店`、`butanchu_tainan` 與地址；`支持統一` 是收錄理由／線索，不作 alias 或 identifier，`豚人 支持統一` 也不應靠 alias 命中。`拉麵`、`餐廳`、`長榮店`、`支持統一`、`統一` 等泛稱不可作未限定的 exact alias / identifier。

## 2026-07-06 葉賓森急診衝突紀錄

- Record: `yeh-bin-sen-er-conflict-personal`
- 使用者明確指定加入個人避開。
- 公開來源一致使用「葉賓森」；截圖 OCR／使用者文字中的「葉寶森」只作誤讀線索，不作正式 alias。
- 可確認事實：民視、TVBS 等報導珠寶直播主葉賓森於雙和醫院急診等待轉院時，與護理人員、員警發生衝突；民視引述其稱「我有可能導致心臟梗塞」。
- 不可寫成已證實浪費健保資源、故意濫用醫療資源、已確診心肌梗塞、犯罪成立或法律定罪。
- 查詢設計：`葉賓森`、`鈺鑽珠寶` 命中；`葉寶森`、`直播主`、`健保`、`浪費健保資源` 不應靠 alias 命中。


## 2026-07-06 狂新聞性暗示諧音截圖

- Record: `crazy-news-sexual-pun-personal`
- 使用者明確指定直接加入個人避開。
- 截圖可見：左上『狂新聞』Logo、右上『截取自網路』、主視覺字樣『雙北慧伯起』、字幕『雙北有慧伯真的好幸福』，互動數約愛心 1.1 萬、回覆 499、轉發 476、分享 249。
- 口徑：可說「使用者提供截圖顯示狂新聞使用『雙北慧伯起』字樣，使用者認為是性暗示／性騷擾諧音梗，因此列個人避開」。不可說法律認定性騷擾、違法或定罪。
- 查詢設計：`狂新聞`、`卡提諾狂新聞`、`Crazy News` 命中；`慧伯起`、`勃起`、`性騷擾`、`性暗示`、`蘇巧慧`、`沈伯洋` 不應靠 alias 命中。

## 2026-07-06 基隆名人幼兒園不當對待幼童案

- Record: `keelung-mingren-kindergarten-child-mistreatment-personal`
- 使用者明確指定加入個人避開。
- 公視報導基隆準公托幼兒園疑不當對待幼童，市府第一階段裁處 2 名教保員各 40 萬、終身不得擔任教保員，並令園所停招 1 年；中央社、Newtalk、華視報導市府公布園所為七堵區名人幼兒園，涉案教保員為林佳靜、劉可婕，並提及負責人 6 萬罰鍰、解除準公共教保服務機構契約與後續調查。
- 口徑：可說「公開報導與基隆市府行政調查／裁處顯示名人幼兒園涉不當對待幼童案，因此列個人避開」。不可寫成刑事定罪、法院判決、所有幼兒園／準公托都有同樣風險，或將尚未公布的第二階段裁處當作已確定。
- 查詢設計：`名人幼兒園`、`基隆名人幼兒園` 命中；`幼兒園` 可能因名稱 substring 命中但不是 alias 污染；`劉可婕`、`林佳靜` 不應靠 aliases／identifiers 命中機構紀錄。

## 2026-07-07 匯鴻室內設計使用者指定個人避開

- Record: `huihong-interior-ai-political-video-personal`
- 使用者明確指定將匯鴻室內設計工程有限公司／匯鴻室內設計加入個人避開。
- 口徑：可說「使用者指定列入個人避開；使用者表示該品牌使用 AI 製作醜化賴清德與川普的影片」。不可寫成法律違規、官方負面判決、法院／政府認定，或客觀事實定論。
- 查詢設計：`匯鴻室內設計`、`匯鴻室內設計工程有限公司`、`HUI HONG INTERIOR DESIGN`、`huihong_design`、`huihong-design.com` 命中；`賴清德`、`川普`、`AI影片`、`醜化`、`政治`、`室內設計公司` 不應靠 aliases／identifiers 命中此 record。不要查或存台灣公司稅籍號碼。

## 2026-07-07 公開 README 重要聲明口徑

- README 開頭介紹後、使用方式前新增 `## 重要聲明`，公開說明本專案是個人風險偏好／查詢備忘，不是法律裁判、官方黑名單、事實終局認定或商業抵制號召。
- 公開文件可解釋 `personal` / `watchlist` / `confirmed`：`personal` 可能只是主觀偏好，`watchlist` 不是定論，`confirmed` 只代表公開來源支持特定收錄理由，不等於法律或主管機關認定。
- 更正／下架管道維持 GitHub issue、pull request 或 repository contact；沒有固定聯絡 email 時不要捏造。
- README 這類公開文件不得混入聊天稱呼、內部助理工具、個人環境路徑、私有知識庫或一次性工作流程敘述。

## 2026-07-07 桃園地方政治支持截圖群組紀錄

- Record: `taoyuan-local-figures-si-guangyang-support-screenshot-personal`
- 使用者明確指定依使用者提供截圖列入 personal；本筆採一筆群組紀錄，只讓五個姓名 `簡郁陞`、`劉宗樺`、`李珮瑜`、`簡士強`、`王秀璞` 作為 searchable fields。
- 口徑：可說「使用者提供截圖列有五位姓名，並呈現與既有 `si-guangyang-kmt-taoyuan-candidate` 關聯對象的政治支持／加油脈絡，因此使用者指定個人避開」。不可說五人職務／候選資格已由官方確認，不可重述或採信截圖紅字的爭議標籤，不可把既有佀廣洋紀錄的爭議外溢到五人。
- 查詢設計：`aliases` 僅五個姓名，`identifiers` 不放。`佀廣洋`、`幫加油`、地方職稱／里別與截圖爭議詞只可作 summary/source/aiNotes 脈絡與警示，不得放入 `name` / `aliases` / `identifiers`。
- 2026-07-07 追加使用者提供的「簡士強社群留言」截圖作為補充來源：公開 note 只描述為對他人家人的貶抑性性別／職業相關問句，不逐字重述敏感句；`Craig Wang`、家人稱謂、性別／職業貶抑語仍不得進入 searchable fields，也不作帳號歸屬、法律違規或性騷擾定論。

## 2026-07-07 築間餐飲集團使用者指定個人避開

- Record: `jhujian-restaurant-group-political-preference-personal`
- 使用者明確指定將築間餐飲集團及官方網站品牌總覽列出的旗下品牌列入 personal；理由採保守口徑寫成「使用者表示負責人／老闆政治立場與個人偏好不合（使用者稱為小草老闆）」。
- 查詢設計：aliases 只放築間餐飲集團與官方列出的品牌名稱；不得把 `小草`、`政治`、`老闆`、`柯文哲`、`民眾黨`、`加盟`、`火鍋`、`燒肉`、`餐廳` 等理由詞或泛稱放入 aliases / identifiers。
- 回答邊界：可說使用者指定因政治立場偏好列入個人避開；不可寫成違法、官方認定、食品安全、服務品質問題，或推論每家加盟／門市與員工個人政治立場。

## 2026-07-07 愛彼蓋爾國際有限公司 LINE 帳號出租中共網軍案

- Record: `abigail-international-line-accounts-cyberattack-personal`
- 使用者明確指定加入個人避開。正式紀錄只用中時與太報／LINE TODAY 報導，不用公司登記頁，避免把台灣公司稅籍號碼帶入資料。
- 口徑：可說公開報導稱愛彼蓋爾國際有限公司 2 名負責人涉出租台灣 LINE 帳號給中共網軍，用於偽冒國際記者與社交工程攻擊脈絡；士林地檢署依幫助違反個資法給予緩起訴，妨害電腦使用部分不起訴。
- 人名邊界：中時列名李樺倫、陳孟森；太報／LINE TODAY 稱李姓實際負責人、陳姓前登記負責人，並稱中國端洪清涯另由士檢通緝。公司登記目前代表人與新聞中的李姓實際負責人不可混同。
- 查詢設計：aliases 放公司名、報導列名／涉及主要人名與中國端公司名；不得把 `網軍`、`LINE帳號`、`駭客`、`社交工程`、`個資法`、`緩起訴` 等原因詞放入 aliases / identifiers。

## 2026-07-08 台北市維記茶餐廳使用者指定個人避開

- Record: `wai-kee-cha-chaan-teng-china-anthem-screenshot-personal`
- 使用者明確指定依使用者提供 Threads 截圖加入個人避開。
- 口徑：可說「使用者提供截圖指稱台北市維記茶餐廳店內播放香港無線電視，且截圖文字認為其播放中國國歌造成不適，因此使用者指定個人避開」。不可寫成已查證店家每天播放、店家故意政治表態、違法、官方認定或所有港式茶餐廳都有相同問題。
- 查詢設計：aliases 僅放 `維記茶餐廳`、`台北市維記茶餐廳`；不得把 `中國國歌`、`香港無線電視`、`TVB`、`無線電視`、`國歌`、`香港`、`顧客`、`不舒服` 等原因或脈絡詞放入 aliases / identifiers。

## 2026-07-08 台灣媒體截圖清單與曾沛慈截圖

- Records:
  - `taiwan-media-china-influence-screenshot-list-personal-2026-07-08`
  - `pet-tseng-cctv-july7-peace-screenshot-personal`
- 使用者提供媒體圖卡並要求「這些都加入」：旺報／中視／中天／中國時報／工商時報已由 `want-want-china-times-media-group` 收錄；本次補 `時報周刊` / `WANT DAILY` 到該紀錄，另以一筆 screenshot-only personal 群組紀錄收 `聯合報系`、`聯合報`、`聯合新聞網`、`UDN`、`United Daily News Group`、`東森新聞`、`東森新聞台`、`東森電視`、`ETTV`、`TVBS`、`TVBS新聞`、`TVBS新聞網`、`ETtoday`、`ETtoday新聞雲`、`東森新媒體`。
- 媒體圖卡口徑：可說「使用者提供截圖列出上述媒體並指定個人避開」；不可寫成已查證中資控制、違法、主管機關認定、每位員工或每則報導均有問題。
- 曾沛慈截圖口徑：使用者提供 Threads 截圖，帳號 `cindyxxod` 轉貼「娛樂星聞」圖卡，圖卡稱「曾沛慈轉央視七七事變，3度表態珍愛和平」。可說使用者依該截圖線索指定個人避開；不可寫成已由本專案獨立查證原始貼文、違法、官方認定、中共黨政關聯或定罪。
- 查詢設計：原因詞不得成為 searchable fields。`中資介入`、`中國色彩`、`偏頗`、`捏造` 不應命中新媒體群組紀錄；`央視`、`七七事變`、`珍愛和平`、`小粉紅`、`娛樂星聞`、`cindyxxod` 不應命中曾沛慈紀錄。

## 快速處理模式

遇到商品標籤直接標示中國原產：

1. OCR / 視覺確認品牌、品名、原產地、公司與條碼；台灣公司稅籍號碼一開始就不要查、不要抄、不要入庫。
2. 本機查重。
3. 補 `data/records/*.mjs`，跑 merge。
4. validator 正查、必要 `--expect` / `--not-expect`、exact generic field guard PASS。
5. 更新本檔必要口徑。
6. commit + push origin/main。
7. 不做 Pages / Pinecone，除非使用者要求。
