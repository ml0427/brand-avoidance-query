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

## 快速處理模式

遇到商品標籤直接標示中國原產：

1. OCR / 視覺確認品牌、品名、原產地、公司與條碼；台灣公司稅籍號碼一開始就不要查、不要抄、不要入庫。
2. 本機查重。
3. 補 `data/records/*.mjs`，跑 merge。
4. validator 正查、必要 `--expect` / `--not-expect`、exact generic field guard PASS。
5. 更新本檔必要口徑。
6. commit + push origin/main。
7. 不做 Pages / Pinecone，除非使用者要求。
