# 靜態 AI 資料站部署與一次切換

現行資料規則以 [AGENTS.md](../AGENTS.md) 為唯一權威；讀取格式以 [AI Reader Contract v1](ai-reader-contract.md) 為準。[一次切換計畫](ai-first-github-plan.md) 保留作設計／遷移歷史，不恢復其中已退役的流程。

本文件是操作程序，不是上線或線上回退成功證明。2026-10-28 主代理已回報的切換前 Pages 基線為 legacy 分支發布、`main`、根目錄 `/`；尚待正式切換。此文件及 workflow 不會更改任何 GitHub 設定。實際執行切換者仍須記錄當時設定與授權，不把歷史基線當現況。

## 發布模型

`data/records/*.mjs` → `compileRecords()` → 來源驗證與測試 → build `_site/` → 站點契約驗證 → 上傳該目錄 → Pages 部署。

只發布 `_site/`，不發布 repo 根目錄，不提交產物，不由 Actions 回寫 main。產物只提供 manifest／分片索引／單筆 JSON 與無 JS HTML；沒有公開舊全集、舊 URL、adapter、redirect fallback 或永久相容模式。

公開證據以 `data/public-evidence.json` 的審核路徑及 SHA-256 為準；未追蹤檔、未核准證據、筆記、技能、研究暫存及憑證不進站點。站點縮小發布範圍不等於公開 repo 或其歷史變成私人資料。

## 切換前檢查

在同一次發版窗口前完成並留下可核對的紀錄；有缺口就停止切換：

1. 唯讀核對 Pages 的 source／branch／path／domain、HTTPS、Actions 允許清單與 repo／組織 token 限制，並確認操作者有權切換 source。
2. 檢查 `github-pages` environment、核准規則與允許部署分支；只讓 main 的正式發布進入，保留既有人工核准，不為 fork／PR 放寬。
3. 保存切換前固定 Git SHA、設定與時間；準備並核對一次性、完整且可公開的站點恢復材料，記錄檔案清單及 SHA-256。未核准／未追蹤資料不能因備份而混入恢復包。
4. 實查平台可用的舊部署恢復方式；若不能直接恢復成功部署，先準備從固定舊提交取得的、已審核的一次性整站恢復包與操作途徑。舊提交不必也不能假裝具有新 builder。材料放在部署保管位置，不放進新站或作為新 builder 輸入。
5. 主代理確認來源遷移逐欄保真、公開證據清單與所有程式／reader 已完成；同一改版分支的 PR 必須真實 build、驗證並產生可下載 artifact，不先發布半套改版。
6. 列出所有已知外部 reader 安裝位置與同步責任。查詢技能的分發來源在 `clients/brand-avoidance-query/`；repo push 不會自動更新外部 Codex／Hermes 技能。不能同步的已知必用 reader 是切換阻塞，不以舊格式相容掩蓋。

僅備份或檢查恢復包不代表已實測線上回退。未能證明有可用恢復材料及操作途徑時，明講風險並停止；只有另經授權實際部署驗證後才可稱線上回退通過。

## 本地完整 Gate

在 repo 根目錄使用 Node.js 24 與 Python 3.13：

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

來源 validator 必須 `warnings: 0; errors: 0`，重複 ID 不得通過；Node／Python 測試、建置及站點驗證必須全部成功。目標查詢矩陣可補充但不能取代完整 gate。不使用舊 merge／gen 或舊 JSON parse 作替代。

預覽用 `python -m http.server 4173 --directory _site --bind 127.0.0.1`；外部 reader 的本地驗證必須讀這次 `_site/manifest.json` 與其快照，不能讀可能落後的線上站來證明未推送變更正確。

## Actions 行為與權限

實作位於 [pages.yml](../.github/workflows/pages.yml)。事件只有 `pull_request` 與 `push main`，不使用 `pull_request_target`、跨 run 的 artifact 提升或自動設定 Pages。

| 事件 | check job | Artifact | deploy job |
| --- | --- | --- | --- |
| PR（含 fork） | npm ci → validate → node tests → Python reader tests → build → validate:site，再核對 provenance | 成功才上傳 `_site/`，名稱含 PR 號／測試 SHA／run attempt，保留 7 天 | 不執行，不給部署寫入權限 |
| push main | 同一完整 gate，從 main 本次 SHA 重新建置 | 成功才上傳本次 `_site/`，不重用 PR artifact | 依賴 check 成功、main 條件與最新提交檢查，再發布該次 artifact |

PR 審查者可從該次 Actions run 的 Artifacts 下載壓縮包；Pages artifact 內含 `artifact.tar`，解開後才是站點。先驗證檔案清單與 manifest 再閱讀，不把它視為正式上線內容。fork 若需 Actions 核准則保持等待，不以提高 token 權限繞過。

workflow 預設及 check job 只有 `contents: read`；deploy job 才另有 `pages: write`、`id-token: write`，並使用 `github-pages` environment。checkout 不保留 Git 憑證；不將 repo 的預設 Workflow permissions 從 Read 改成 Read and write。組織政策不允許時回報缺口，不放寬 PR 或所有 job。

部署 concurrency 為全站共用的 `github-pages`，`cancel-in-progress: false`，避免新工作中斷正在部署的版本。進入此序列化區段後，再以唯讀 API 比對 main tip 與該次 `GITHUB_SHA`；不同就略過該候選，API 失敗則失敗停住。不能只靠佇列順序推定最新，較舊 run 重跑也不得覆蓋新版。此 workflow 沒有任意 SHA 手動發布入口。

建置環境使用 Node 24 的可用安全修訂版及 setup-python 的 Python 3.13，實際修訂版由 CI 日誌記錄。checkout 明確固定在該次 `GITHUB_SHA`，建置器從此 checkout 取得來源提交；CI 額外斷言 manifest 的 `sourceCommit` 等於 `GITHUB_SHA`、`sourceDirty === false`，並要求建置前 checkout 無異動。不得強制改寫 dirty 旗標。PR 的測試 SHA 可能是 GitHub merge commit，不一定是 PR head SHA；正式 main 發布則對應 push 的 SHA。

### 官方 Actions 固定版本

2026-10-28 已以唯讀 `gh api` 核對官方 repository 的 release tag、解析到完整 commit SHA，並核對該 SHA 的 `action.yml` 所需輸入與 runtime：

| Action | 發行版本 | 固定 SHA |
| --- | --- | --- |
| actions/checkout | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| actions/setup-node | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| actions/setup-python | v7.1.0 | `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0` |
| actions/upload-pages-artifact | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| actions/deploy-pages | v5.0.1 | `368f82528645a54fb793d4d04e342629a3f51346` |

更新依賴時重新查 release、tag 與 action metadata，不只更改版本註解。固定 SHA 的核對不是本 repo 的遠端 workflow 執行證明。

## 一次切換操作

1. 所有本地 gate、PR artifact、資料保真與恢復材料核對通過後，由主代理整合完整改版；先準備已知外部 reader 的新版本，不在開發中逐次切換正式站。
2. 在同一授權發版窗口合入／推送完整改版到 main，並於 repository **Settings → Pages → Build and deployment → Source** 將分支發布改成 **GitHub Actions**；保留已記錄的 domain／HTTPS 與 environment 保護。設定是操作者在切換時完成，不是 workflow 自動提升權限或修改設定。
3. 同窗口同步外部查詢技能及腳本，移除舊 URL／陣列讀取與 fallback；不可只把舊程式的網址改成 manifest 卻仍當全集解析。跨平台更新不是原子交易，切換期間暫時不可讀須明確報失敗。
4. 讓 main 的本次完整 CI 完成並部署。若 source 尚未切換導致 deploy 失敗，完成設定後只重跑仍是 main tip 的對應工作；main 已前進時跑新 tip，不重播過期 artifact。
5. 只有使用者授權線上驗收時，才核對 Actions 結果、實際 manifest 的 sourceCommit／dataVersion、索引及完整紀錄讀取、無 JS 路徑與已知外部 reader；記下實際時間及 SHA。未實測的項目一律列未驗證。

不把成功 push、本機 build 或 artifact 上傳當成線上驗收。日常依 AGENTS 提交／推送後停止，不自行輪詢 Pages。

## 失敗處理與整站回退

- check、測試、build、site validator 或 provenance 任一步失敗：不執行上傳／部署，先修正來源。上個成功部署可能仍在線，但未讀取遠端前不能保證當下可用性。
- deploy 權限、environment 核准或設定失敗：停止在失敗／等待狀態，不提高 repo 預設 token、不改 PR 事件或借用其他 run 的 artifact。保留錯誤與 SHA，由有權操作者處理。
- 查詢失敗依契約只從 manifest 起重試一次；仍失敗就回報不可用，不回報無命中、不切舊資料格式。
- 新契約上線後若須恢復先前成功內容，以已記錄的固定成功提交為基準，在一般新分支／新提交恢復整套來源與建置設定，經完整 gate 及審查合入 main，再由本次 main workflow 重建、整站替換。manifest 如實標示這次恢復提交，不偽稱是原成功提交或資料最新。不要 reset 主分支、force-push、混用新版 manifest 與舊紀錄／證據，或重跑舊 run 繞過過時提交檢查。
- 第一次切換若必須恢復切換前整站，使用事先核對、另經授權的一次性恢復材料與操作途徑，連同當時的 Pages source／domain 等設定一起恢復。新 main 已刪除舊站，單純把 source 改回 `main /` 不會自動還原；不得這樣假裝回退成功。若須臨時恢復發布流程，須先明確審核固定內容、發布範圍及權限，不能新增常設 legacy 模式或把恢復包塞進新 builder。
- 恢復途徑、依賴或材料不可用時，停止並明講阻塞；不要以空站、拼接資料或未審核舊包代替。回退是整站恢復的例外操作，不是正常新站支援雙格式。

## 官方參考

- [GitHub Pages 自訂 workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)：artifact、deploy job、權限與 environment。
- [設定 Pages 發布來源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)：一次切換的 source 設定。
- [Actions concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)：序列化不保證依提交先後，因此另檢查 main tip。
