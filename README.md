# 品牌／公眾人物避雷資料站

本專案以 AI 查詢為主，提供純靜態個人避雷資料及無 JavaScript 的原文頁，整理品牌、商品、公眾人物、組織與旅遊風險的來源、個人判斷及適用限制。它不是動態搜尋 API，也不需要啟動本機專案才能讀取公開資料。

站點入口：[品牌／公眾人物避雷資料站](https://ml0427.github.io/brand-avoidance-query/)；工具型 AI 從 [manifest](https://ml0427.github.io/brand-avoidance-query/manifest.json) 開始。這些是發布目標網址，不代表本次改版已經遠端部署或驗收；實際可用版本以成功部署及實際取得的 manifest 為準，push 成功不等於上線。

## 判讀邊界

這是使用者的個人風險偏好、道德選擇與消費備忘，不是法院判決、行政處分、官方黑名單、法律定論或商業抵制號召。

- `personal`（個人避買）：使用者依個人價值或風險容忍度選擇避開，不表示已證實違法、不當或食安問題。
- `watchlist`（觀察中）：有待追蹤、補充來源或釐清脈絡的資訊，不是定論。
- `confirmed`（來源確認）：來源支持該紀錄所列的特定事實或關聯，並非所有指控、商品、分店或關係人均獲確認，也不等於法律認定。

狀態與 confidence 分開閱讀。每筆的 summary、aiNotes、sources.note、適用對象及日期都屬必要內容，不能只讀名稱或索引就下結論。同名、集團別名、名單成員或單一 SKU 命中，不證明公司控制、個人涉案或全品牌適用。

公開資訊可能過時、更正或不完整；資料未收錄不表示安全、清白或適合購買。內容不構成法律、投資、採購或消費建議。更正／下架請透過 repository 的 issue 或 pull request 提供可核對的來源與範圍。

## 工具型 AI 讀取

完整格式見 [AI Reader Contract v1](docs/ai-reader-contract.md)，可分發的查詢技能與 reader 見 [clients/brand-avoidance-query](clients/brand-avoidance-query/)。

直接使用 reader：`python clients/search_brand.py "查詢名稱"`；部分候選加 `--mode partial`。更新本機 Codex 查詢技能可執行 `./scripts/install-query-skill.ps1`，安裝器只同步 SKILL.md 與 reader，保留其餘技能設定；需要指定目錄時使用 `-SkillRoot`。腳本原始碼維護在 `clients/search_brand.py`，不另手動維護安裝副本。

1. 取得 `manifest.json`，確認支援的 schemaVersion／searchVersion，記下 dataVersion、sourceCommit 與 recordCount。它只指向目前部署的一份快照。
2. 依索引描述的 firstKey／lastKey 選片，驗證回應原始 bytes、大小與 SHA-256 後解析。exact 預設只讀唯一涵蓋鍵值的分片；partial 必須掃描所有分片。
3. 讀取所有命中 recordId 的完整 JSON，驗證其描述，再讀 record 與 sourceLinks；不要把索引名稱當成完整證據。依 recordId 去重，不能依 name 合併同名紀錄。
4. 回報資料版本、來源提交、matched field／value、模式、狀態、信心、範圍、證據限制與來源；套 limit 前先算 totalMatches，並列 returnedMatches／hasMore。

索引只涵蓋 `name`、`aliases`、`identifiers`。正規化使用合併空白、trim、NFKC 與 Unicode 小寫；identifier 只剝除契約明列的展示標籤，不任意拆除 URL 協定、埠號或冒號前綴。country、分類、摘要、理由、來源文字與 aiNotes 不算實體命中。

exact 是完整正規化名稱／別名／識別碼相等；partial 是 substring 候選，不是身分確認。可以用泛稱探索，但不能只憑候選宣告對象適用某筆風險。完整查詢無命中只表示該快照未直接收錄。

站內 artifact URL 都相對於包含它的 JSON 文件解析，並限制在 manifest 所屬 origin 與專案路徑；外部原始來源則依 sourceLinks 閱讀。本地證據只存在快照內，來源原值保留供稽核，不使用舊根目錄證據 URL。不預先下載證據圖片或全體紀錄。

遇到 404、雜湊／大小不符、無效 JSON／schema／版本或資料不一致時，丟棄該次資料、重讀 manifest，從頭重試一次；仍失敗就回報「資料不可用／無法確認」，不是「沒有收錄」。站點只保留目前快照，舊版路徑可能失效；不回退舊格式或以空陣列假成功。

## 無 JavaScript 閱讀

從站點首頁或 [llms.txt](https://ml0427.github.io/brand-avoidance-query/llms.txt) 找到目前快照的靜態目錄，再循每個名稱的真實連結讀取完整單筆 HTML。目錄有分片導覽，不需要搜尋框、表單、canvas 或 JavaScript。

無法執行 reader 的瀏覽型 AI 仍可循連結讀取；若工具截斷、無法遍歷全部必要目錄、不能核對版本或有紀錄不可讀，必須標示「未完成查詢」及具體限制，不能宣稱完整無命中。llms.txt 是可分享入口，不保證每個 AI 會自動發現或遵守。

## 日期與短期警示

特定食品／批號公告預設是短期品項警示，不擴大為全品牌永久避雷。使用 temporaryUntil、reviewAfter 與 temporaryAlertReason 保留期限與原因。

以查詢時 Asia/Taipei 曆日判斷：temporaryUntil 當日仍在期限內，次日起提示歷史警示；reviewAfter 當日即待複查。這些提示不改寫原狀態或法律判斷。靜態 HTML 保存日期與規則，不會自動跨日更新；日期未知的讀取端只列期限，不猜有效／過期。

## 來源與建置產物

唯一紀錄來源為 `data/records/*.mjs`；共用 `data/compile-records.mjs` 的 `compileRecords()` 套用 cleanup、override、重複 ID 檢查與 ID 排序。來源驗證、builder 與測試使用同一份編譯結果，保留單筆全部欄位與內部陣列順序。

建置產生：

```text
_site/
  index.html
  llms.txt
  manifest.json
  v1/<dataVersion>/
    inventory.json
    schemas/...
    index/0000.json ...
    catalog/index.html
    catalog/0000.html ...
    records/<id>.json
    records/<id>.html
    evidence/...
```

dataVersion 是 canonical inventory.json bytes 的 SHA-256。版本化檔案保留相對連結，不含建置時鐘或 sourceCommit；提交資訊在根 manifest。inventory 列相對路徑、bytes 與 SHA-256，不列自己。索引每片最多 65,536 bytes，同一鍵不拆片。

只發布經驗證的 `_site/`，不提交產物或發布整個 repo。公開證據由 `data/public-evidence.json` 的核准路徑與 SHA-256 控管；本地筆記、技能、未追蹤檔與未核准證據不進站點。公開 repo 本身及 Git 歷史不因這項限制變成私人資料。

本次採單一契約：不提供 brands.json、merge／舊 gen、record-order、舊陣列 adapter、legacy URL 或自動 fallback。一次切換及整站回退見 [部署操作](docs/deployment.md)；[改版計畫](docs/ai-first-github-plan.md) 留作設計與遷移歷史，現行規則以 AGENTS 與 reader contract 為準。

## 本地建置與驗證

需要 Node.js 24、npm 及 Python 3.13（CI 使用版本）。從 repo 根目錄執行：

```powershell
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

預覽只服務產物目錄，不能把 repo 根目錄當新站：

```powershell
python -m http.server 4173 --directory _site --bind 127.0.0.1
```

開啟 [本地資料站](http://127.0.0.1:4173/)；連接埠被占用時改用其他埠。建置中的 sourceDirty 可揭露本地工作區異動；正式 CI manifest 必須 sourceDirty 為 false、sourceCommit 等於該次 GITHUB_SHA。不得把髒來源強制標為乾淨。

## 維護與發布

入庫授權、主觀與客觀分層、證據保存、稅籍資料禁令及完整 gate 一律先讀 [AGENTS.md](AGENTS.md)。只做分析或主動探索不自動入庫；修改來源後，validator 必須 warnings: 0、errors: 0，且所有測試、build、站點驗證及 diff 檢查通過才能依授權提交／推送。

名稱／別名／識別碼只放穩定實體鍵，不放未確認指控、事件詞或無限定泛稱。台灣公司稅籍號碼與非必要個資不查、不存、不作搜尋鍵；來源中看到也略過。

PR 與 push main 都執行完整 CI。成功的 PR 可下載審查 artifact，但不部署；main 重新建置的本次 artifact 才能部署，失敗停住。外部查詢技能須在同一發版窗口另行同步，repo push 不會自動安裝。預設提交後不輪詢線上站，遠端部署／回退是否成功須有另外授權與實測證據。
