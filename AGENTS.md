# brand-avoidance-query 專案 AI 規則

本檔是此專案的 AI / Hermes 單一權威入口；工作流、口徑、驗證與近期專案狀態以本 repo 為準。

## 專案來源

- 專案路徑：`D:/AI_workspace/brand-avoidance-query`
- 來源紀錄：`data/records/*.mjs`
- 唯一共用編譯入口：`data/compile-records.mjs` 的 `compileRecords()`；套用來源清理與 override、檢查重複 ID，依 ID 的 UTF-8 bytes 排序，不讀舊產物、不寫檔、不依賴當下時間。
- 來源驗證：`npm run validate`；直接驗證同一份清理後編譯結果。
- 靜態站建置與驗證：`npm run build`、`npm run validate:site`；產物僅在 `_site/`，不得手動維護或提交。
- 公開資料契約：`docs/ai-reader-contract.md`；manifest → 分片索引 → 完整單筆 JSON／無 JS HTML。
- 名稱比對規則：`app-core.mjs`；對外查詢 reader 的分發來源在 `clients/brand-avoidance-query/`。
- 公開證據審核清單：`data/public-evidence.json`；只發布已核准且實際引用的證據。
- 專案內記憶：`AI_NOTES.md`

來源、validator、builder 與測試共用 `compileRecords()`，不得各自重組另一套來源。根目錄 `brands.json`、舊 merge／gen 命令、`record-order.json`、舊 URL／舊格式 fallback 均已退役，不是輸入、產物或日常作業。Git 歷史僅供稽核；規劃文件中的舊流程是歷史，不得覆蓋本檔與 reader contract。

## 收尾規則

- 預設收尾：下方「驗證與提交」完整 gate 通過，來源 validator `warnings: 0; errors: 0`，且 diff 僅含預期變更後，commit 並 push 到 `origin/main`。本次明示僅調查、預覽、子任務交接或不提交時，以該授權範圍為限。
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
- 寫入前檢查 `data/records/*.mjs` 與 `compileRecords()` 的清理後紀錄；已有相同實體時優先補充既有紀錄。必要時以官方頁面、公開地圖或可信來源完成身分橋接，但橋接來源不自動證明爭議主張。
- 證據圖存入 `evidence/user-submissions/YYYY-MM-DD-<slug>.<ext>` 並保存 SHA-256；同步更新 source record 與本地 `AI_NOTES.md`，記錄範圍、身分橋接、證據邊界、搜尋欄位原則與雜湊。
- 要公開的本地證據須先核准並列入 `data/public-evidence.json`，核對路徑與 SHA-256；被引用但未核准、遺失、雜湊不符、越界或不允許的檔案必須阻止建置／發布，不自動複製或默默略過。未追蹤檔案不作公開來源。
- `name`、`aliases`、`identifiers` 只放穩定實體名稱與必要識別；理由詞、情緒字、平台名、分類詞、事件詞及未確認指控不得作搜尋鍵。台灣公司稅籍號碼與非必要個資一開始就不查、不存。
- 完成 source record 後，依下方「驗證與提交」的單一權威清單執行，不在此另設或重複驗證門檻。
- 回報需說明收錄對象、範圍、狀態、證據邊界、驗證結果與提交狀態，並明確區分個人避雷決定與客觀確認事實。

## 入庫口徑

- 這是個人避買／風險查詢資料庫，不是法律裁判或客觀封殺清單。
- `personal` 表示使用者個人避開，`watchlist` 表示仍需追蹤脈絡或補充證據，`confirmed` 只表示來源支持所列的特定事實／關聯；均不等於法律定論或全品牌／全體關係人適用。`confidence` 與狀態分開判讀，不因狀態名稱省略來源與限制。
- 中國原產食品：標籤清楚時足以列 `status: "personal"` 個人避買；只寫「原產地標示中國／使用者個人避買」，不得延伸為食安、違法、禁售、國資或中共控制。
- 食藥署／主管機關公布的特定食品、油品或批號不合格公告，預設做「短期品項警示」而不是整個品牌永久避雷：以 `temporaryUntil` / `reviewAfter` 記錄公告日起約 30 天的高亮與複查期限，`temporaryAlertReason` 寫明是特定品項／批號公告；30 天後若沒有新事件，降為歷史警示或複查，不主動擴大。只有重複出包、拒不回收、品牌管理系統性問題或使用者明確指定，才升級成品牌 `watchlist` / 長期個人避開。
- 使用者要求「反正都先加進去」時，可擴成同品牌／同進口商 personal record，但要保留 caveat：已確認 SKU 與使用者指定同品牌避買不同，不可宣稱每款都已逐一確認中國原產。
- 公眾人物／政治圖卡：社群圖卡只作線索。正式紀錄需用公開媒體或可查來源，並採保守法律口徑；例如「涉入某案／因某罪名判刑」，不可擴寫成來源未直接支持的殺人、詐欺、圖利等定論。

## 查詢設計

- `aliases` 放品牌名、公司名、明確產品線、域名與常見查詢字。
- `identifiers` 會被索引也會在完整紀錄頁顯示，僅放使用者真的會拿來查的穩定識別，例如條碼、食品業者登錄字號、法院案號、網域、地址或官方帳號；不要放未採信指控或說明性括號。
- 台灣公司稅籍號碼一開始就不要查，也不要寫進 `aliases`、`identifiers`、`summary`、`sources.note` 或 `aiNotes`；看到標籤或來源上有這類號碼時直接略過。
- 使用者查詢端允許泛稱探索，不再用 query blocklist 硬擋 `餐廳`、`拉麵`、`果汁`、`統一` 等詞。
- 泛稱管控改在入庫驗證：不要把沒有品牌／人物／公司限定的泛稱寫成 exact `aliases` 或 `identifiers`；validator 的 `generic-search-fields` 會檢查這類資料品質問題。
- 對外索引只使用 `name`、`aliases`、`identifiers`；`country`、分類、理由、摘要、來源正文與 `aiNotes` 不作實體命中。精準模式預設比對完整正規化鍵，partial 的 substring 結果只列候選；兩者都必須保留實際命中欄位／值，不得由名稱碰撞推定身分、集團關係或風險範圍。
- 正規化為合併空白、trim、NFKC、Unicode 小寫；只移除 reader contract 列明的 identifier 展示標籤，不任意剝除 URL 協定、埠號或冒號前綴。不建立 query blocklist。
- 查詢先驗 manifest，再驗命中索引與紀錄的 bytes／SHA-256，讀完整 `record`、`sourceLinks` 與所有限制。依 recordId 去重、先計完整命中數再套 limit；partial 必須掃描所有索引分片。
- 404、雜湊／大小不符、無效 JSON／版本或資料不一致時，丟棄本次結果、重讀 manifest 並從頭重試一次；仍失敗即資料不可用，不得轉成成功無命中。不自動抓證據圖片。
- 無命中只表示這份快照未直接收錄，不代表安全或清白。無 JS 閱讀未遍歷完整目錄、工具截斷或紀錄不可讀，須回報未完成查詢。
- 回報資料版本／來源提交、實際命中欄位與值、狀態、信心、適用範圍、證據限制及來源。`sourceLinks` 以紀錄文件位置解析，不依賴退役的根路徑證據 URL。
- 時間性以查詢時的 Asia/Taipei 曆日判斷：`temporaryUntil` 當日仍有效，`reviewAfter` 當日即待複查；不改寫原狀態、不在版本化產物固化當下過期旗標。日期未知時只列期限。
- 不要用稅籍號碼建立任何可查或不可查的紀錄資料；來源、索引、JSON、HTML 及 reader 均須維持此防線。

## 驗證與提交

新增／修改紀錄與發布前，於 repo 根目錄依序執行完整 gate：

```bash
npm ci
npm run validate
node --test
python -m unittest discover -s clients -p test_*.py
npm run build
npm run validate:site
git status --short --branch
git diff --stat
git diff --check
```

對紀錄另補目標查詢矩陣，例如 `npm run validate -- --target-id <record-id> --positive <明確查詢>`；必要時加入 `--expect`／`--not-expect`，不得代替完整 gate。精準命中檢查名稱、別名及穩定識別；負查檢查來源／理由詞不作實體鍵、同名碰撞與明確排除範圍，partial 則只能作候選。不要把泛稱允許探索誤當成應該全部無命中。

只有來源 validator `warnings: 0; errors: 0`、無重複 ID、Node／Python 測試通過、真實 build 與站點契約驗證通過，且 diff 僅含預期檔案時，才能 commit 並 push 到 `origin/main`。`--allow-warnings` 僅供調查，不是發布 gate；不能以舊 JSON parse、syntax check 或遠端查詢取代這些檢查。

只 stage 本專案需要的檔案；不要把外部 Obsidian、Hermes skill、profile memory 或憑證檔混進 repo commit。

GitHub Actions 對 PR 與 main 都執行完整 gate，只上傳 `_site/`。PR 成功只提供審查 artifact、不部署；main 成功的本次 artifact 才可由最低權限 deploy job 發布，不重用 PR 產物、不回寫 main、不全面提高 repo 預設 token 權限。manifest 的 `sourceCommit` 必須等於該次 `GITHUB_SHA`，`sourceDirty` 必須為 false；部署序列化並略過過時提交。設定、一次切換與整站回退見 `docs/deployment.md`。

已知外部 reader 與網站在同一發版窗口更新；repo push 不會自動安裝外部技能，不留舊格式相容。任何部署／讀取失敗都停住並明講，不以無命中或舊格式 fallback 掩蓋；沒有遠端實測不得宣稱已上線或線上回退已驗證。

## 專案記憶維護

- 流程、口徑、踩坑、近期重要案例寫進 `AI_NOTES.md`。
- 若只是單筆資料，優先讓 record 本身的 `summary`、`sources.note`、`aiNotes` 承載，不額外散到全域記憶。
- 全域 memory 只保留「此專案記憶在本 repo」這類指標，不保存具體專案細節。
