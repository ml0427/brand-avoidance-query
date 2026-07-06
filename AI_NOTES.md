# AI_NOTES — brand-avoidance-query

此檔保存品牌避雷專案的耐久工作流記憶。未來處理本專案時，優先讀本檔與 `AGENTS.md`，不要把專案細節寫到全域 memory、Obsidian 或 Hermes skill。

## 2026-07-06 專案記憶位置修正

- 老爺明確要求：「你把這些專案的記憶留在專案內」。
- 後續品牌避雷專案的規則、踩坑、近期案例與驗證口徑，應寫回本 repo：`AGENTS.md`、`AI_NOTES.md`、record 的 `summary` / `sources.note` / `aiNotes`。
- 全域 memory 只保留指標，不保存本專案具體細節。
- Obsidian 工作流筆記若已存在，可作舊索引；此 repo 內檔案才是專案記憶主檔。

## 2026-07-06 線上版確認不是預設收尾

- 老爺提醒：「我記得有說過不用確認線上版」。
- 預設收尾標準：本機 validator PASS，`warnings: 0; errors: 0`，commit 並 push 到 `origin/main`。
- 不預設查 GitHub Pages / 線上 `brands.json`。只有老爺要求，或正在處理線上版故障，才確認 Pages。
- 不預設同步 Pinecone；除非老爺要求或 legacy 查詢需要。

## 2026-07-06 統一園之味蘋果汁

- Record: `uni-president-yuanzhiwei-apple-juice-china-origin-personal`
- 依據：使用者提供瓶身標籤截圖；標籤可讀到統一「園之味 100%果汁 蘋果汁」、原產地中國、統一企業股份有限公司、統一企業楊梅廠、食品統一編號 `5549421703`、條碼約 `4710088473141`。
- 口徑：可說「這款統一園之味蘋果汁標籤顯示原產地中國，因此個人避買」。不可延伸為統一企業全部產品、中資／國資／中共控制、食安、違法或禁售。
- 查詢：正查使用 `統一企業 園之味`、`統一 園之味 蘋果汁`、`統一蘋果汁`、`園之味`、`園之味100%果汁`、食品統一編號或條碼。
- 2026-07-06 起泛稱查詢允許使用者探索；`統一`、`果汁`、`蘋果汁`、`100%果汁`、`飲料`、`食品` 等不再由查詢端硬擋，但入庫時仍不得把這些泛稱寫成 exact alias / identifier。

## 2026-07-06 蕭景田圖卡查核

- Record: `hsiao-ching-tien-kmt-1984-police-killing-case-personal`
- 社群圖卡只作線索。
- 保守口徑：公開媒體資料與中央社報導可支撐「蕭景田 1984 年涉入殺警案；中央社報導引述其因運送屍體罪被判刑入獄」。
- 不可寫成「法院認定蕭景田親手殺警」或「殺人罪定讞」，除非另有正式判決／法院資料。
- 查詢設計：姓名放 aliases；羅立柏、力照霖、1984年殺警案、運送屍體罪放 identifiers；`殺警`、`殺警案`、`殺警奪槍` 等泛稱不應作 exact alias / identifier，但使用者查詢端不再硬擋。

## 2026-07-04 纖享樂／JOY FOOD 纖享樂

- Record: `xianxiangle-li-zaishenbian-canned-pear-china-origin-personal`
- OCR 曾把「纖享樂」誤讀為「織享樂」；正式品牌名以標籤與公開通路結果的「纖享樂」為準。
- 冰糖燉梨罐頭標籤確認原產地中國；同品牌其他品項是老爺指示「反正都先加進去」後列入 personal，同時保留 caveat：不是每款都已逐一確認中國原產。
- 「家裡吃，沒花錢」：此類紀錄不是消費記帳，只是家中食用時發現標籤，列入未來避買。

## 快速處理模式

遇到商品標籤直接標示中國原產：

1. OCR / 視覺確認品牌、品名、原產地、公司、條碼或統編。
2. 本機查重。
3. 補 `data/records/*.mjs`，跑 merge。
4. validator 正查、必要 `--expect` / `--not-expect`、exact generic field guard PASS。
5. 更新本檔必要口徑。
6. commit + push origin/main。
7. 不做 Pages / Pinecone，除非老爺要求。

## 2026-07-06 豚人拉麵長榮店

- Record: `butanchu-tainan-changrong-unification-personal`
- 使用者提供 Threads 連結並明確說「支持統一，直接加入」。
- 截圖可支撐店家識別：豚人拉麵 長榮店、帳號 `butanchu_tainan`、地址台南市東區長榮路二段159號、營業時間與菜單；截圖本身未顯示政治主張。
- 口徑：可說「使用者提供 Threads 線索指稱支持統一，因此列個人避開」。不可說官方承認、違法、法院認定，或所有豚人拉麵分店都同一立場。
- 查詢設計：正查 `豚人拉麵`、`豚人拉麵 長榮店`、`butanchu_tainan`、地址、`豚人 支持統一`；`拉麵`、`餐廳`、`長榮店`、`支持統一`、`統一` 等泛稱現在允許探索命中，但不可作未限定的 exact alias / identifier。

## 2026-07-06 泛稱查詢改為使用者端可查、入庫端把關

- 老爺明確提出：泛稱應改成 AI 加入紀錄時的檢查，使用者查詢時可以使用泛稱。
- 已移除 `app-core.mjs` 的使用者查詢端 exact generic blocklist；`filterBrands()` 不再因 `GENERIC_QUERY_BLOCKLIST` 直接回空。
- 搜尋索引會處理 `identifiers` 的 `標籤：值` 格式，只索引冒號後的值，避免 `食品統一編號`、`條碼`、`地址` 等欄位標籤污染查詢。
- validator 改以 `generic-search-fields` 檢查入庫資料品質：泛稱不應是 exact `name` / `aliases` / `identifiers`；但泛稱出現在完整品牌名或 qualified alias 中可以被使用者查到。
- `--negative` 現為進階零命中回歸測試，不再拿來測普通泛稱；需要確認某查詢不該命中特定紀錄時，用 `--not-expect query=>record-id`。
