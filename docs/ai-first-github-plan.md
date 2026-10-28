# GitHub AI-first 資料站改版計畫

日期：2026-10-28。狀態：規劃交付，以下功能尚未實作。

本計畫定義架構與實作驗收，不修改任何避雷判斷，也不取代 `AGENTS.md` 的現行規則。原始紀錄、驗證門檻及入庫授權仍以該檔為準。

## 1. 目標與已決定事項

將現有網站改成發布在 GitHub Pages 的 AI 資料站。外部 AI 不需要存取使用者電腦、安裝專案、啟動本機服務或操作網頁篩選器。

| 項目 | 採用方案 |
| --- | --- |
| 維護來源 | 延用 `data/records/*.mjs`；先補齊來源，不全面重寫資料模型 |
| 對外服務 | GitHub Pages 靜態檔案，不新增後端、登入、資料庫或動態搜尋 API |
| 建置發布 | GitHub Actions 驗證後產生 `_site/`，只發布這個目錄 |
| 工具型 AI | 讀 manifest、名稱索引、命中紀錄的 JSON，不把全集塞入模型上下文 |
| 瀏覽型 AI | 讀無 JavaScript 的靜態名稱目錄與單筆完整頁面 |
| 人類介面 | 首頁改成資料入口與使用契約；移除卡片、下拉篩選及即時搜尋應用 |
| 相容性 | 保留原網址的 `brands.json`；其用途是舊客戶端相容，不是唯一維護來源 |
| 規則入口 | `AGENTS.md`；技能只分工與導向，歷史筆記不另定現行流程 |

不在本次改版內：新增避雷對象、重判既有對象、改變 `personal/watchlist/confirmed`、自動擴及關係企業或人物、建立完整實體關係圖、部署向量庫、MCP 服務或遠端查詢伺服器。

## 2. 現況基線與必修問題

以下是本機與遠端追蹤分支在本次 fetch 後的基線，不是之後永久維護的總筆數：

- Commit：`4a8d4475e0edaa8a4741d9d401642e86d32a650a`。
- `brands.json`：430 筆、1,525,872 bytes；來源模組：424 筆、13 個領域模組。
- `scripts/merge-risk-records.mjs` 第 51 行先讀舊 `brands.json`；目前不是從來源獨立重建。
- 6 筆只存在產生檔：`weichuan-foods`、`tacoop-taiwan-agricultural-united-marketing-cooperative`、`shye-chuen-seafood`、`nantou-county-farmers-association`、`tianwei-agricultural-technology`、`hualien-county-farmers-association`。
- 來源陣列順序與現有產生檔不同；不能只把陣列串接就聲稱相容輸出未變。
- 網頁的 `filterBrands()` 搜尋包含 `country`；外部 `search_brand.py` 只查名稱、別名、識別碼，且使用另一套正規化。須制定單一對外契約。
- 部分技能仍要求 query blocklist、查存統編或修改合併腳本作為紀錄來源，與 `AGENTS.md` 衝突。
- `AI_NOTES.md` 約 398 KB；整個 `evidence/` 約 114 MB。不得把它們當每次查詢都要載入的資料。
- 工作區既有未追蹤的 Kevin PNG 不屬本次改版，保持內容及未追蹤狀態，不 stage、不發布。
- 本機沒有 `.github/workflows/`。GitHub 的 Pages 發布來源、Actions 權限與分支保護尚未查證，不能推定已設定完成。

開始實作時須重新 fetch 並重算基線；若期間有新紀錄，以實作當下的完整資料為保護對象，不能為了符合本文件的 430 筆而丟棄後續異動。

## 3. 目標檔案與發布範圍

```text
GitHub repository
  data/records/*.mjs                 唯一紀錄來源
  data/compile-records.mjs           共用純編譯入口：來源、cleanup、override、順序
  data/record-order.json             遷移基線的既有 ID 順序
  data/public-evidence.json          已審核可公開的證據路徑與 SHA-256
  scripts/merge-risk-records.mjs     只從來源產生相容 brands.json
  scripts/build-ai-site.mjs         靜態資料站建置器
  scripts/validate-ai-site.mjs       契約、完整性與發布範圍檢查
  schemas/                          manifest、索引、紀錄的 JSON Schema
  tests/                            既有與新增回歸測試
  .github/workflows/pages.yml        PR 驗證；main 驗證與部署
             |
             v
  _site/                            產生目錄，gitignore，不手動維護
    index.html                      簡短入口、狀態定義、讀取步驟
    llms.txt                        可分享的 AI 操作入口，不假定會自動被讀取
    manifest.json                   目前部署的資料快照指標
    brands.json                     舊 URL 與原始陣列格式保持可用
    evidence/...                    舊 brands.json 已核准相對證據 URL 的相容副本
    v1/<dataVersion>/
      inventory.json                這份快照的檔案清單、大小與雜湊
      schemas/...                   可由 manifest 發現的資料格式定義
      index/0000.json ...            分片名稱索引
      catalog/index.html            靜態目錄導覽
      catalog/0000.html ...          可直接讀取的名稱與連結
      records/<id>.json             單筆完整機器資料
      records/<id>.html             同筆資料的完整靜態文字頁
      evidence/...                  只有已審核且實際被引用的公開證據
```

JSON、HTML 與相容全集全部由 `compileRecords()` 回傳的同一份 ordered canonical records 生成，不各自讀原始陣列。共用入口必須完整套用現有 cleanup、分類 override、metadata 合併與順序規則；來源模組本身不等於清理後輸出。該函式不讀舊產生檔、不寫檔、不依賴執行當下時間；merge 與 AI-site builder 都呼叫它。

HTML 是 canonical record 的完整呈現，不是第二份人工摘要；不需要前端框架、搜尋後端或 JavaScript 才能讀取。

只發布 `_site/`。禁止整個 repository 打包發布；不複製 `AI_NOTES.md`、`AGENTS.md`、`.codex/`、`.agents/`、研究暫存、未追蹤檔案或未核准證據。這只能縮小 Pages 的暴露面，不能讓公開 GitHub repository 或其歷史中的檔案變成私人資料。

來源中的相對證據 URL 必須轉成快照內可解析的連結，並保留原始 URL 供稽核。已引用但未確認可以公開的證據不得自動複製或默默省略，必須阻止部署並列出待處理路徑。外部來源不在建置時抓取或執行；本機檔案禁止越界、符號連結與未核准副檔名。

舊 `brands.json` 的相對 `evidence/...` URL 不改寫，對應已核准檔案同時保留在網站根路徑；新快照另有版本內副本，不能只搬到版本目錄而使舊客戶端斷鏈。相容副本同樣受公開清單限制，不能藉相容性發布整個證據目錄。

## 4. 資料契約與查詢行為

### 4.1 Manifest 與版本

`manifest.json` 必須包含：`schemaVersion`、`searchVersion`、`dataVersion`、`sourceCommit`、`sourceCommitTime`、`recordCount`、`inventory`、`indexes`、`catalog`、`recordBase`、`schemas`、`compatibilityUrl`。檔案描述包含 URL、UTF-8 bytes 與 SHA-256；索引另含 `firstKey`、`lastKey`、`entryCount`。`schemas` 指向同份快照的格式定義；不是只有 repo 內部看得到的檔案。

- `schemaVersion: 1` 是讀取格式；破壞性變更升版。既有狀態的定義不可藉升版偷改。
- `sourceCommit` 是產生這份部署的提交，不等於遠端 main 此刻最新提交；發布失敗時舊版仍可能在線。
- 版本化檔案先使用快照內相對連結生成，不放資料版本、執行當下時間或提交 SHA，避免自我引用雜湊。
- 對全部版本化內容依相對路徑排序，產生只列內容檔案的 canonical `inventory.json`；其 UTF-8 bytes 的 SHA-256 就是 `dataVersion`。inventory 不列自己。
- 將整份內容與 inventory 放入 `v1/<dataVersion>/` 後，再產生根 manifest 與首頁；每個內容檔案的雜湊都可驗證，不存在版本計算循環。
- 同一輸入在 Windows、Linux 與不同執行時間建置，版本化檔案必須相同。固定 LF、鍵排序與 UTF-8；陣列保留有意義的順序。

單次查詢先讀 manifest，再只使用它指向的快照。遇到 404、索引與紀錄雜湊不符、版本不支援或 JSON 不完整時，重讀 manifest 並從頭重試一次；仍失敗就回報「資料讀取失敗／無法確認」，不能回報「沒有收錄」。快照僅保留目前部署；舊版 URL 可能失效，這是明確支援的情況，不假裝永久保存。

### 4.2 索引與精準命中

索引使用反向名稱表。每個 entry 包含 `key` 與 `matches`；每個 match 包含 `recordId`、`name`、`field`、`value`、JSON／HTML 路徑及兩者的 SHA-256。`field` 僅限 `name`、`aliases`、`identifiers`。相同 key 可連到多筆紀錄，不覆蓋碰撞。

索引不帶 summary、來源正文、aiNotes、風險理由或法律判斷。它只回答「去哪一筆找」，不能單靠索引宣告對象屬於何種風險。

- 正規化固定為：轉字串、合併空白、trim、Unicode NFKC、Unicode 預設小寫；相容測試涵蓋 Python 與 JavaScript，不再一邊用 casefold、一邊用 lower 卻假定完全相同。
- identifier 只有明確白名單的展示標籤可移除，例如 `條碼：`；不剝除 URL 協定、網域埠號或任意冒號前綴。新增白名單要有測試。
- 精準模式：正規化後整個名稱／別名／識別碼相等。部分模式：只在相同欄位做 substring，結果標為候選。
- `country`、分類、理由、summary、來源與 aiNotes 不算實體命中；它們只能是顯式探索篩選或說明資料。不新增泛稱 query blocklist。
- matched field/value 與 exact/partial 必須可回溯。同名、名單成員、SKU 與集團別名命中均需讀完整紀錄的範圍限制；exact alias 不等於公司所有權、個人涉案或全品牌適用證明。
- 名稱、別名、識別碼的 exact 命中都要列出；同欄位相等才是 exact，不因搜尋鍵出現在串接文字裡就當成完整命中。
- 無命中只能表示這份完整資料快照未直接收錄，不表示安全、清白或適合購買。

索引 entry 依正規化 key 的 UTF-8 bytes 排序。每片最多 65,536 bytes，包含 JSON 包裝；同一 key 的所有 matches 不拆片。單一 entry 超限須報明確錯誤，不截斷。manifest 列出每片的 key 範圍，exact 查詢只需下載相關片；substring 探索必須掃描全部相關片，不能假定只查第一字就完整。

`indexes` 固定為分片描述的陣列，即使只有一片也不改成另一種格式。每個描述包含 `url`、`sha256`、`bytes`、`firstKey`、`lastKey`、`entryCount`；兩個邊界均包含在範圍內。exact 的完整選片步驟如下：

1. 依本節規則取得查詢 key，再比較它的 UTF-8 bytes，不使用依執行環境而異的 locale 排序。
2. 找到唯一滿足 `firstKey <= key <= lastKey` 的分片；下載並驗證該片，再以整個 key 相等取出全部 matches。
3. key 落在所有範圍之外、或有效分片中沒有相等 entry，才可回報這個 key 無 exact 命中。這不表示 substring 探索無結果。
4. 分片有重疊、排序錯誤、缺必要欄位、無效雜湊或讀取失敗，屬資料錯誤，不視為無命中。validator 必須證明所有已索引 key 恰好落入一片且無遺漏。

不建立「第 0 片包含全部名字」的第二份全集；那會隨資料成長再次要求下載全部名稱。分片數由實際產物 bytes 決定，不因目前只有幾百筆就假定必然只有一片。

64 KiB 是本計畫的單次讀取預算，不是所有 AI 的通用限制，也不是達到某個筆數就必須換資料庫的標準。

### 4.3 單筆內容與時間性

`records/<id>.json` 包含 `schemaVersion`、`record`、`sourceLinks`。`record` 必須與共用編譯入口的清理後紀錄逐欄 deep-equal，不能退回未套 cleanup 的原始來源值；`sourceLinks` 只補充原始 URL 與可解析的公開 URL，不改寫原始證據或重作摘要。快照內證據使用以該紀錄 URL 為基準的 `../evidence/...` 相對連結，JSON 與 HTML 共用同一 resolver；不得把舊 record.sources 中的 `evidence/...` 直接當新紀錄目錄的相對路徑。HTML 必須完整呈現 summary、aiNotes、狀態、信心、來源 note、最後複查與所有短期警示欄位，不取前 N 字代替限制條件。

回應使用者時必須包含資料版本、實際命中名稱與欄位、狀態、信心、適用範圍、證據限制及相關來源。逾 `reviewAfter` 或 `temporaryUntil` 的內容標為待複查／歷史警示，不因到期自動改寫原紀錄，也不把歷史事件當現行違規。

日期以 Asia/Taipei 曆日比較；`temporaryUntil` 當日仍在警示期限內，次日改顯示歷史警示；`reviewAfter` 當日即列待複查。這只改變呈現提示，不重判原紀錄狀態。

不得在版本化 JSON／HTML 中以建置時的 `Date.now()` 固化 `temporaryExpired` 等「目前已過期」旗標：這會破壞跨時間可重建性，而且靜態頁留在線後仍會再次過時。版本化內容保存日期、時區與判讀規則；HTML 以 `<time datetime>` 明示期限，不能沒有重建就聲稱自己會動態降級。工具型 AI 在查詢時以明確的 `evaluationDate` 計算並回傳時間提示；日期未知的讀取端只列期限，不猜測 active／expired。測試需證明同份 bytes 在到期前後查詢可得到不同時間提示，重建版本本身不受當下日期影響。

可執行程式的 AI 若輸出查詢 JSON，回傳 `totalMatches`、`returnedMatches`、`hasMore` 與查詢模式，禁止把 limit 後的筆數當完整總數。這是客戶端的結果格式，不是 GitHub Pages 提供的遠端函式。

### 4.4 瀏覽型 AI 的最低可用路徑

首頁與 `llms.txt` 明確連結 manifest、完整目錄、狀態定義與原始來源。靜態目錄按索引分片產生，以可見名稱與真實 `<a href>` 連到紀錄頁；前後頁與完整分片清單均可直接讀取，不靠表單、canvas 或 JavaScript。

首頁不是舊搜尋應用，也不是只有空白容器：直接呈現專案名稱、個人避雷／非法律定論的邊界、資料版本入口、JSON／文字目錄及原有外部查核連結。每筆紀錄維持一個 HTML，不以分類合集替代。

所有 HTML 固定使用 `<!doctype html>`、`<html lang="zh-Hant">`、置於 head 前段的 `<meta charset="utf-8">`、有名稱的 `<title>` 與單一 `<main>`。紀錄頁以 `<article data-record-id>`、`<h1>`、`<dl>/<dt>/<dd>`、分段文字、來源 `<ol>` 與 `<time datetime>` 表達資料，不把全集包成無標記的 `<pre>`。每個值依文字／屬性情境 escape，所有 URI 經允許規則處理。驗收包含 UTF-8 中文、實體編碼、完整欄位及不執行 JS 的 HTMLParser 讀取；不把設定 lang 本身宣稱為 token 節省保證。

不能執行程式的 AI 可以循連結定位，但不保證其瀏覽工具支援站內搜尋、完整下載或雜湊驗證。工具截斷索引、未遍歷完整目錄或無法讀取資料時，要回報「未完成查詢」，不能宣稱完整無命中。`llms.txt` 是明確提供給使用者分享的說明入口，不是存取控制或所有 AI 都會自動遵守的標準。

### 4.5 llms.txt 與爬蟲政策

`llms.txt` 採 Jeremy Howard 的 llms.txt v2 提案核心 Markdown 結構：H1 專案名稱、blockquote 短摘要、非 heading 的判讀說明，再以 H2 檔案清單列出 Markdown 連結與用途。發布位置是本專案的 `/brand-avoidance-query/llms.txt`，涵蓋專案路徑；HTML head 加入指向它的 `rel="describedby"`。第一版提供本計畫已定的 JSON 與無 JS HTML，不額外維護全站第三套 Markdown，也不宣告不存在的 `.md` alternate。

`llms.txt` 與 `robots.txt` 不是同一種機制。依 RFC 9309，爬蟲規則位於 origin 的 `/robots.txt`；目前 Pages project site 對應的是 `https://ml0427.github.io/robots.txt`，不是 `/brand-avoidance-query/robots.txt`。本 repo 不藉放一份子路徑檔案假裝能控制整個 origin，也不擅自修改其他 repository。若日後確實能管理 origin 根路徑，另行確認既有規則與授權後才修改。

本次不以 Disallow 阻斷查核必需的公開證據，也不把 robots 當成隱私保護。減少無用下載靠不將圖片塞入索引、清楚的讀取順序與只發布已核准證據；不應公開的內容仍需真正移除／限制存取，不能只寫爬蟲約定。

## 5. 實作任務、依賴與交付物

所有任務目前均未執行。實作依 T1 至 T6 收斂，不以完成這份文件冒稱網站改版完成。

T1 是第一個不動網站介面的資料編譯提交，補回孤兒紀錄、抽共用編譯入口與改寫 merge 都是它本身的交付物，不另設一個內容相同的 T0。主實作代理負責修改，獨立審查代理核對 baseline 與 clean rebuild；主代理完成最終 gate。T1 的全欄位／順序等值及冪等證據未通過前，不合入後續建置或啟用 workflow。只驗證舊 ID 集合是新集合的子集不足以驗收，因為仍可能多出錯誤紀錄或改壞欄位值。

| 任務 | 必須完成的變更 | 完成證據 |
| --- | --- | --- |
| T1 來源可重建 | 新增 legacy-baseline 紀錄模組補回 6 筆；建立現有 430 IDs 的順序基線；抽出共用 compileRecords；merge 不再讀產生檔；重複 ID 在寫入前失敗 | 移走產生檔的暫存測試仍能重建；全部值、ID 與順序和實作基線相同；第二次 merge bytes 不變 |
| T2 機器契約 | 新增共用 identity matcher、schemas、builder 與 AI-site validator；輸出分片索引、完整 JSON、雜湊清單 | 用 schema 實際驗證全部產物；名稱／別名／identifier／碰撞／部分查詢及失敗語意測試通過 |
| T3 靜態閱讀與證據 | 生成無 JS 首頁、目錄與完整紀錄頁；建立 public-evidence 清單；處理相對來源連結與 HTML escaping | 關閉 JS 仍可從首頁找到指定紀錄；所有內部連結解析成功；未核准與未追蹤證據不進產物 |
| T4 CI 與技能 | 新增 Actions，預設只驗證及產 artifact、不啟用正式部署；修正路由／編輯／發布技能及 README；筆記按需讀取，不強制搬移歷史 | PR 無部署權；main artifact 可驗證但現站不變；技能只引用 AGENTS 的驗證清單，沒有統編／blocklist 舊操作 |
| T5 成長與回退演練 | 用合成資料做擴量與刪改測試；演練 manifest 競態、錯誤版本；保存原 Pages 設定並驗證 legacy 與新站兩種回退打包模式 | 索引上限、增刪一致性、版本重試與回退 artifact 通過；生產回退權限另核對，不把打包當成已完成線上回退 |
| T6 切換與刪除舊 UI | T1 至 T5 驗收後才啟用正式 Actions 部署並切換 Pages source；首頁換成資料入口；移除舊展示程式與其專用測試 | 保留 brands.json 舊 URL、根路徑證據、官方 PDF 及候選人查核外鏈；刪除程式沒有殘留引用；新測試覆蓋外鏈不是避雷鍵 |

T1 新增的 `data/record-order.json` 只固定遷移基線順序。未在基線中的新 ID 按 UTF-8 ID 排序接在後面，不要求每次新增就修改順序表；來源要刪除基線 ID 時，必須同步更新順序表，避免意外消失或舊產物把紀錄復活。

T2 在 `app-core.mjs` 增加獨立、可測試的 identity matching 函式，先不改舊 `filterBrands()` 的探索行為；建置器與契約測試重用該函式。T6 只刪確定沒有消費者的展示程式，不順手重構 unrelated exports。

建置環境採 Node.js 24，鎖定實作時驗證過的安全修訂版；本次檢查機器是 v24.11.0，不把它視為最新修訂版。JSON Schema 採 2020-12，以 Ajv 的對應實作在開發／CI 驗證，版本與 lockfile 一併納入；不在網站執行 Ajv，也不另建 Postman workspace、OpenAPI 或前端 bundler。

## 6. GitHub 發布與回退

工作流程固定為：checkout -> 安裝鎖定的建置依賴 -> merge -> 驗證來源及相容產物 -> tests -> build `_site/` -> validate AI-site -> upload artifact -> deploy。

T4 開始、建立 workflow 前先完成唯讀部署核查並留下結果：目前 Pages source／branch／path／domain、允許使用的 Actions、repo／組織對 token 權限的限制、`github-pages` environment 與保護／核准規則、部署者能否在 T6 切換設定。核查不是現在就更改設定；Pages source 在 T6 才切換，無權核查者明列缺口，不要求使用者提前逐項操作。

| 事件 | 必須跑的 check job | Artifact 與 deploy |
| --- | --- | --- |
| pull_request | 安裝鎖定依賴、merge、檢查 brands.json 無未提交差異、完整 validator、node --test、真實 build `_site/`、AI-site validator | 成功後上傳以 PR／SHA 命名的可下載審查 artifact；不可部署 |
| push main | 和 PR 相同的完整建置與驗證，不沿用 PR 的產物 | T4 至 T5 只上傳 artifact；T6 之後才讓 deploy job 使用本次成功 artifact |
| 受保護手動發布／回退 | 核對指定固定 SHA、模式與部署條件，按本節對應方式打包／驗證 | 驗證成功且經所需核准才發布，不得直接信任外部提供的 artifact |

PR 的「不部署」由 job 條件與權限隔離保證，不新增一個略過實際 build 的 `--dry-run` 作替代。PR artifact 不直接提升為正式站；fork 若需 GitHub 核准，保持等待或明確失敗，不靠開放更多權限繞過。

- `pull_request` 只執行驗證，不給 Pages 寫入權限，不發布 fork 內容，不使用 `pull_request_target` 執行提交中的程式。
- `push` 到 main 或手動 workflow 才可進部署；部署 job 明確依賴驗證／建置 job 成功。
- T4 至 T5 的正式部署開關預設關閉，main 只產待驗 artifact；T6 核對前置條件後才啟用，不能在 T4 就把新首頁部署到正式站。
- build job 使用 `contents: read`；部署 job 才授予所需 `pages: write`、`id-token: write`，使用 `github-pages` environment。
- 不以 repo 的預設 Workflow permissions 改成全面 Read and write 當前置條件。按 job 宣告最低必要 scopes；組織限制不允許時回報設定缺口，不把 PR token 或所有 job 放寬。
- Actions 不替本地 commit／push，不把 `_site/` 回寫 main，避免機器人循環提交。root `brands.json` 仍由既有維護流程產生並檢查與來源一致。
- 同一站點的部署要序列化並略過過時、尚未部署的候選；不可讓較舊的排隊工作在新版後覆蓋新版。
- 切換前確認 GitHub Settings 的 Pages source 可設為 GitHub Actions，及 environment／分支規則；這是設定前置檢查，不假定本機檔案能自行變更。
- 改版提交先產出可驗證 artifact，切換時才改 Pages 發布來源；不提前刪舊站。相容 `brands.json` 不停供。
- 驗證或 build 失敗不得部署。上一個成功站點留在線；錯誤必須可由 Actions job 結果辨識。
- 首次切換前保存原 Pages source／branch／path／domain 設定及舊站固定 SHA。受保護的手動流程要有 `legacy-static` 模式：workflow 使用受信任的新流程，但 checkout 固定舊 SHA，只打包舊 index.html、app.js、styles.css、app-core.mjs、query-display-state.mjs、brands.json 與已核准且被引用的根路徑證據，不能要求舊提交存在新的 builder 或 lockfile。
- T5 必須先產生並檢查 legacy 回退 artifact 的模組引用、資料與證據連結；同時核對可用的部署權限及原 Pages 設定恢復方式，這些都是 T6 正式切換的前置條件。只有另經授權並實際部署測過，才可稱「線上回退已驗證」。
- AI-first 站的日後回退，則以之前成功的固定 commit 在受保護手動流程中重建／重部署。兩種模式都不 reset 主分支、不 force-push、不把會過期的 artifact 當唯一備份。若所需依賴已不可用，停止並回報，不假裝回退成功。
- 回退發布的是舊資料快照，要揭露該提交與時間，不能把新版 manifest、舊紀錄或新版證據混成一份自稱最新的資料。
- 日常 commit/push 後仍依 AGENTS 停止，不另開瀏覽器輪詢 Pages。正式改版若要宣稱線上驗收，須另有使用者授權及實測證據；本機測試或 push 成功不能代替。

## 7. 驗收矩陣

| 測試 | 預期結果 |
| --- | --- |
| clean rebuild | 不讀舊 brands.json 也能產生相同基線；重建冪等 |
| 刪除／改名來源 | 產物同步刪改，不從舊 brands.json 復活；缺基線 ID 明確失敗 |
| 資料完整性 | compileRecords、相容全集與每筆 JSON.record 的所有欄位值及全集順序一致；HTML 可還原同筆完整內容；索引只引用清理後欄位值，不能只核對 ID 集合 |
| 精準名稱 | TikTok、Palladium、蔡詩萍等 fixture 可回到正確紀錄及 matched field/value |
| 泛稱與國家 | 可作探索，但 country 不成實體 exact match；不恢復 generic blocklist |
| 同名／名單 | 保留所有碰撞；不把名單命中升為個人涉案、集團別名升為全品牌風險 |
| 證據邊界 | personal/watchlist/confirmed、confidence、aiNotes 與 sources.note 不被截掉或重判 |
| 時間性 | 過期警示及待複查訊息可見，不自動改寫法律／事實結論 |
| 故障與快取 | 404、雜湊不符、格式錯誤、unknown schema 及競態僅有限重試；不變成假無命中 |
| 靜態閱讀 | 無 JS 可循連結到完整內容；瀏覽器／AI 工具截斷有明確未完成語意 |
| 安全與範圍 | 惡意 HTML／URL 被安全處理；無路徑越界；公開 artifact 只有 allowlist 檔案 |
| 擴量 | 使用 10,000 與 50,000 筆清楚標記的合成資料；每片不超 64 KiB，exact 不載完整證據集 |
| 發布與回退 | 失敗不覆蓋現站、PR 不部署、舊 commit 可重建；沒有推送成功即上線成功的誤報 |

擴量測試紀錄建置時間、記憶體、產物大小與一次 exact 查詢需要的檔案數。這些是以後是否增加專用搜尋服務的依據，不用 2,000／20,000 這類筆數門檻自動升級架構。完整 corpus 增長不應迫使一次精準查詢讀取全部 record 或所有圖片。

實作驗證需通過 AGENTS 現行 gate，另加 `node scripts/build-ai-site.mjs` 與 `node scripts/validate-ai-site.mjs`；後兩個命令是未來交付物，目前不存在。來源／schema／連結／雜湊／安全檢查一律零錯誤、零警告才可部署；外部來源可否即時連線則另標為未測，不冒充本機可證明。

## 8. 本次交付與尚未確認項目

本次只提交這份計畫、README 入口與 AI_NOTES 索引。不新增公開資料、不改網站行為、不部署新站。T1 至 T6 仍待實作；未對任一 AI 產品做遠端相容性實測。

部署前仍須實查 GitHub Pages source、Actions 權限／environment、現有外部消費者，以及公開證據清單。這些是計畫列明的執行工作，不要求使用者現在逐項提供答案。

## 9. 官方依據

- [GitHub Pages 靜態託管定位](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。本計畫不把 Pages 當成會執行搜尋的伺服器。
- [GitHub Actions 建置與發布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。本計畫只發布驗證過的 `_site/` artifact。
- [GitHub 固定提交連結](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files)。回退與歷史稽核使用固定 SHA，不把 main 當不可變版本。
- [Node.js 發布與支援狀態](https://nodejs.org/en/about/previous-releases)。修訂版於實作時再核對，不永久鎖死本機歷史版本。
- [Ajv 的 JSON Schema 版本支援](https://ajv.js.org/json-schema.html)。使用相符的 2020-12 驗證器，不只發布沒有實際驗證的 schema 檔。
- [llms.txt v2 提案](https://llmstxt.org/)。採核心 Markdown 結構與可指定子路徑的定位；不是 Anthropic 專屬格式，也不是存取控制。
- [RFC 9309 的 robots.txt 位置與安全邊界](https://datatracker.ietf.org/doc/html/rfc9309#section-2.3)。origin 根路徑規則與專案子路徑不同，不以 robots 代替權限控制。
- [GitHub Actions 的 GITHUB_TOKEN 最小權限](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)。權限由 workflow／job 明確指定，不把 repo 整體開放讀寫當成必要步驟。

## 10. 2026-10-28 外部規劃審查處置

以目前已提交計畫為準核對 `plan-review.md`，外部審查是意見來源，不是自動執行授權。處置如下：

| 外部項目 | 核對結果與決定 |
| --- | --- |
| 1 補 6 筆的時序 | T1 已明列；補強成第一個原子資料編譯提交及依賴 gate，不重複設 T0，也不只驗 ID 子集 |
| 2 merge 真正重建 | T1 與 compileRecords 已明列；補主實作／獨立審查／主代理的責任及完整等值門檻 |
| 3 Pages 核查 | 補 T4 建 workflow 前的唯讀核查；不提早切換 Pages、不全面開啟讀寫權限 |
| 4 llms.txt／robots | 明定 v2 核心格式、專案路徑與 origin-root robots 邊界；不新增無效的子路徑 Disallow |
| 5 索引選片 | 已有範圍欄位；補索引陣列契約、UTF-8 含邊界比較與異常處理，不再增加全名字第 0 片 |
| 6 HTML 粒度 | 原本已是每筆一頁；補 charset、lang、語意標記與無 JS 解析驗收 |
| 7 建置時計算過期 | 不採用 Date.now 固化旗標；改明訂讀取端依查詢日期評估，確保同資料跨日重建不變 |
| 8 PR Actions | 補 PR／main／手動矩陣；PR 必須真實 build、驗證並提供 artifact，不給部署權限 |

這次只修訂規劃及本地筆記，未執行 T1 至 T6，也未改 GitHub 設定。外部審查所列「必須補」不代表目前文件完全缺失；已涵蓋內容不重複建另一套流程。
