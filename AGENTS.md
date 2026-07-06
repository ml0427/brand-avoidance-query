# brand-avoidance-query 專案 AI 規則

本檔是此專案的 AI / Hermes 專案內記憶入口。品牌避雷專案的工作流、口徑、驗證與近期經驗應優先留在本 repo；不要把細節散到全域 memory、Obsidian 或 Hermes skill。

## 專案來源

- 專案路徑：`D:/AI_workspace/brand-avoidance-query`
- 來源紀錄：`data/records/*.mjs`
- 產生檔：`brands.json`
- 合併腳本：`scripts/merge-risk-records.mjs`
- 驗證腳本：`scripts/validate-brand-records.mjs`
- 查詢核心：`app-core.mjs`
- 專案內記憶：`AI_NOTES.md`

## 收尾規則

- 預設收尾：本機 `node scripts/validate-brand-records.mjs` PASS，且 `warnings: 0; errors: 0`；commit 並 push 到 `origin/main`。
- 不預設確認 GitHub Pages / 線上版。只有老爺明確要求、或正在排查線上版問題時，才查 Pages 發布結果。
- 不預設同步 Pinecone。除非老爺明確要求或 legacy 查找真的需要，否則以本 repo、git history、`AI_NOTES.md` 為耐久紀錄。
- 不把 Obsidian/Hermes skill/global memory 當作此專案的主要記憶位置；那些地方最多只留索引或通用偏好。

## 入庫口徑

- 這是個人避買／風險查詢資料庫，不是法律裁判或客觀封殺清單。
- 中國原產食品：標籤清楚時足以列 `status: "personal"` 個人避買；只寫「原產地標示中國／使用者個人避買」，不得延伸為食安、違法、禁售、國資或中共控制。
- 使用者要求「反正都先加進去」時，可擴成同品牌／同進口商 personal record，但要保留 caveat：已確認 SKU 與使用者指定同品牌避買不同，不可宣稱每款都已逐一確認中國原產。
- 公眾人物／政治圖卡：社群圖卡只作線索。正式紀錄需用公開媒體或可查來源，並採保守法律口徑；例如「涉入某案／因某罪名判刑」，不可擴寫成來源未直接支持的殺人、詐欺、圖利等定論。

## 查詢設計

- `aliases` 放品牌名、公司名、明確產品線、域名與常見查詢字。
- `identifiers` 會被查詢也會在 UI 顯示，僅放使用者真的會拿來查的穩定識別，例如條碼、食品業者登錄字號、法院案號、網域、地址或官方帳號；不要放未採信指控或說明性括號。
- 台灣公司統編／統一編號、食品統一編號、公司統編預設不作 searchable/display identifier，也不放 aliases；若需保存佐證，寫在 `summary`、`sources.note` 或 `aiNotes`。
- 使用者查詢端允許泛稱探索，不再用 query blocklist 硬擋 `餐廳`、`拉麵`、`果汁`、`統一` 等詞。
- 泛稱管控改在入庫驗證：不要把沒有品牌／人物／公司限定的泛稱寫成 exact `aliases` 或 `identifiers`；validator 的 `generic-search-fields` 會檢查這類資料品質問題。
- 特別注意 substring：`filterBrands()` 會搜 `name`、`aliases`、`country` 與處理後的 `identifiers`；`identifiers` 中 `標籤：值` 只索引值，但仍不要把統編／統一編號等低使用率佐證號碼放進 `identifiers`。

## 驗證與提交

新增／修改紀錄後至少跑：

```bash
node scripts/merge-risk-records.mjs
node scripts/validate-brand-records.mjs --target-id <record-id> --positive <明確查詢>
```

提交前檢查：

```bash
git status --short --branch
git diff --stat
git diff --check
```

只 stage 本專案需要的檔案；不要把外部 Obsidian、Hermes skill、profile memory 或憑證檔混進 repo commit。

## 專案記憶維護

- 流程、口徑、踩坑、近期重要案例寫進 `AI_NOTES.md`。
- 若只是單筆資料，優先讓 record 本身的 `summary`、`sources.note`、`aiNotes` 承載，不額外散到全域記憶。
- 全域 memory 只保留「此專案記憶在本 repo」這類指標，不保存具體專案細節。
