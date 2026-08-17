# brand-avoidance-query 專案 AI 規則

本檔是此專案的 AI / Hermes 單一權威入口；工作流、口徑、驗證與近期專案狀態以本 repo 為準。

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
- 不預設確認 GitHub Pages / 線上版。只有使用者明確要求、或正在排查線上版問題時，才查 Pages 發布結果。
- Obsidian 與 global memory 最多只留索引或通用偏好；Hermes skill 可保留可重用導引與案例，但不得保存唯一的現行專案狀態，與本 repo 衝突時一律以本 repo 為準。

## 判斷原則

- 本專案是使用者的個人風險偏好、道德選擇與消費備忘，不以法律責任或主管機關處分作為個人避開的必要門檻。
- 處理消費爭議、動物友善、服務友善及其他價值判斷時，先看實際行為、資訊透明、合理期待，以及對消費者、動物或相對弱勢一方的實質影響；不得把「未違法」「條款可解釋」或「商家能自圓其說」直接等同合理或友善。
- 必須分開「使用者有理由依個人價值／風險選擇避開」與「客觀不當、違法或法律責任已獲證實」。證據不足只限制客觀定性，不得反過來否定使用者的個人避買理由。
- 不預設替商家或強勢一方合理化，也不因受影響者用詞不精確就忽略核心問題；先處理實質待遇與合理期待，再補充契約、收費或法律層面的分析。
- 對外文字仍須保留證據邊界：主觀理由寫成使用者個人判斷，未確認指控不得擴張為違法、官方認定、事實定論或所有品項／分店均有相同問題。

## 入庫觸發與流程

- 使用者明確說「加入避雷」「列入避買」「直接避雷」「全品牌避雷」「這些都加進去」等，即構成寫入授權，不重複確認。只要求分析、重新判斷、查證、詢問是否合理或先預覽內容，不構成入庫授權。
- 在持續進行中的避雷收錄對話裡，只有圖片但可辨識明確品牌、店家、商品、人物或組織時，可視為 `personal` intake；沒有避雷上下文時先辨識與分析，不靜默寫入。
- 公眾人物若涉及重大刑事、兒少傷害、性暴力、暴力、掩蓋、貪腐或官方失職指控，圖片／社群貼文只授權查核與研究，不得僅憑截圖或主觀 `personal` 理由發布。必須以可歸屬的官方資料或具名可信來源確認人物身分、角色與來源實際支持的窄幅事實；找不到可歸屬來源就不入庫。
- 先辨識實體、理由與範圍；預設採最小可確認範圍。單一商品、店家或分店不得自行擴張為全品牌、集團、其他分店、合作對象或關係人，除非使用者明確指定。
- 分開三層：圖片／來源直接可見事實、使用者個人理由與道德判斷、外部可驗證事實與法律定性。主觀理由足以建立 `personal` 紀錄，但未證實內容必須明確歸屬於使用者或來源。
- 寫入前檢查 `data/records/*.mjs` 與 `brands.json`；已有相同實體時優先補充既有紀錄。必要時以官方頁面、公開地圖或可信來源完成身分橋接，但橋接來源不自動證明爭議主張。
- 證據圖存入 `evidence/user-submissions/YYYY-MM-DD-<slug>.<ext>` 並保存 SHA-256；同步更新 source record 與本地 `AI_NOTES.md`，記錄範圍、身分橋接、證據邊界、搜尋欄位原則與雜湊。
- `name`、`aliases`、`identifiers` 只放穩定實體名稱與必要識別；理由詞、情緒字、平台名、分類詞、事件詞及未確認指控不得作搜尋鍵。台灣公司稅籍號碼與非必要個資一開始就不查、不存。
- 完成 source record 後，依下方「驗證與提交」的單一權威清單執行，不在此另設或重複驗證門檻。
- 回報需說明收錄對象、範圍、狀態、證據邊界、驗證結果與提交狀態，並明確區分個人避雷決定與客觀確認事實。

## 入庫口徑

- 這是個人避買／風險查詢資料庫，不是法律裁判或客觀封殺清單。
- 中國原產食品：標籤清楚時足以列 `status: "personal"` 個人避買；只寫「原產地標示中國／使用者個人避買」，不得延伸為食安、違法、禁售、國資或中共控制。
- 食藥署／主管機關公布的特定食品、油品或批號不合格公告，預設做「短期品項警示」而不是整個品牌永久避雷：以 `temporaryUntil` / `reviewAfter` 記錄公告日起約 30 天的高亮與複查期限，`temporaryAlertReason` 寫明是特定品項／批號公告；30 天後若沒有新事件，降為歷史警示或複查，不主動擴大。只有重複出包、拒不回收、品牌管理系統性問題或使用者明確指定，才升級成品牌 `watchlist` / 長期個人避開。
- 使用者要求「反正都先加進去」時，可擴成同品牌／同進口商 personal record，但要保留 caveat：已確認 SKU 與使用者指定同品牌避買不同，不可宣稱每款都已逐一確認中國原產。
- 公眾人物／政治圖卡：社群圖卡只作線索。正式紀錄需用公開媒體或可查來源，並採保守法律口徑；例如「涉入某案／因某罪名判刑」，不可擴寫成來源未直接支持的殺人、詐欺、圖利等定論。

## 查詢設計

- `aliases` 放品牌名、公司名、明確產品線、域名與常見查詢字。
- `identifiers` 會被查詢也會在 UI 顯示，僅放使用者真的會拿來查的穩定識別，例如條碼、食品業者登錄字號、法院案號、網域、地址或官方帳號；不要放未採信指控或說明性括號。
- 台灣公司稅籍號碼一開始就不要查，也不要寫進 `aliases`、`identifiers`、`summary`、`sources.note` 或 `aiNotes`；看到標籤或來源上有這類號碼時直接略過。
- 使用者查詢端允許泛稱探索，不再用 query blocklist 硬擋 `餐廳`、`拉麵`、`果汁`、`統一` 等詞。
- 泛稱管控改在入庫驗證：不要把沒有品牌／人物／公司限定的泛稱寫成 exact `aliases` 或 `identifiers`；validator 的 `generic-search-fields` 會檢查這類資料品質問題。
- 特別注意 substring：`filterBrands()` 會搜 `name`、`aliases`、`country` 與處理後的 `identifiers`；不要用稅籍號碼建立任何可查或不可查的紀錄資料。

## 驗證與提交

新增／修改紀錄後依序執行：

```bash
node scripts/merge-risk-records.mjs
node scripts/validate-brand-records.mjs --target-id <record-id> --positive <明確查詢>
node --test
git status --short --branch
git diff --stat
git diff --check
```

必要時加入 `--expect`／`--not-expect`。只有 validator `warnings: 0; errors: 0`、無重複 ID、測試通過且 diff 僅含預期檔案時，才能 commit 並 push 到 `origin/main`。

只 stage 本專案需要的檔案；不要把外部 Obsidian、Hermes skill、profile memory 或憑證檔混進 repo commit。

## 專案記憶維護

- 流程、口徑、踩坑、近期重要案例寫進 `AI_NOTES.md`。
- 若只是單筆資料，優先讓 record 本身的 `summary`、`sources.note`、`aiNotes` 承載，不額外散到全域記憶。
- 全域 memory 只保留「此專案記憶在本 repo」這類指標，不保存具體專案細節。
