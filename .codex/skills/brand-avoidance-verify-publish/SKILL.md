---
name: brand-avoidance-verify-publish
description: Verify compiled records, Node and Python reader tests, the real static-site build and site contract, then review scoped changes for authorized commit and push. Read AGENTS.md first; do not discover new targets or publish on partial checks.
---

# Brand Avoidance Verify Publish

## Authority And Boundary

先讀專案根目錄 `AGENTS.md`，它是完整發布 gate、資料品質、證據口徑、稅籍資料禁令、提交範圍及遠端查核授權的唯一權威。部署與一次切換讀 `docs/deployment.md`，對外讀取格式讀 `docs/ai-reader-contract.md`。

本技能只驗證當前變更及依授權發布；不作廣泛探索、不新增無關目標、不改既有風險判斷。失敗時只做本次範圍內的必要修正或交回主代理；修正後重跑受影響檢查與完整 gate。子任務明示不提交／推送時只交接結果。

## Complete Gate

從 repo 根目錄依 AGENTS 依序執行，不得挑選或以遠端結果代替本地 gate：

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

來源 validator 必須 warnings: 0、errors: 0，重複 ID 不得通過；Node 與 Python reader 測試、真實建置、站點契約及 diff 檢查全數成功才可提交。--allow-warnings 僅供調查。舊 merge／gen、舊全集 JSON parse 或 syntax check 都不能作替代。

compileRecords 是來源 validator 與 builder 的共用入口；_site 僅為產物，不手改、不 stage。不能以已發布遠端資料驗證未推送的變更。

## Targeted Matching And Evidence Review

完整 gate 之外，對本次 recordId 補充明確查詢矩陣：

```powershell
npm run validate -- --target-id <record-id> --positive <明確名稱> --positive <明確別名>
```

必要時加入 --expect／--not-expect，並以 `compileRecords()` 和 `app-core.mjs` 的 `matchRecords()` 檢查實際 matchedTerms；不要另造正規化。可用唯讀命令：

```powershell
node --input-type=module -e "import {compileRecords} from './data/compile-records.mjs'; import {matchRecords} from './app-core.mjs'; console.log(JSON.stringify(matchRecords(compileRecords(), '<查詢>', {mode:'exact'}).map(({recordId,matchedTerms})=>({recordId,matchedTerms})),null,2));"
```

- 正查：完整 name、穩定 aliases 與 identifiers；核對 matched field／value 及全部碰撞 recordId。
- 負查：來源／文章／理由詞不成實體鍵，同名、關係人及明確排除對象不得被錯誤擴張。
- partial：substring 只作候選，不能把泛稱允許探索當成測試失敗；不新增 query blocklist。
- 本地產物 reader：用 clients/brand-avoidance-query 的新 reader 與這次 _site 的 manifest 查詢，依契約驗雜湊、版本重試與完整單筆；參數以該分發技能為準，不使用退役 URL。
- 範圍與證據：讀完整 status、confidence、summary、aiNotes、sources.note、lastReviewed 及短期日期／原因；個人避雷與客觀已證實事實分開，稅籍資料及未核准證據不得進公開產物。

## Diff And Publication Review

親自核對 `git diff` 與新檔內容，而非只相信代理回報或 diff --stat。確認變動只含本次來源、必要證據／清單／筆記或已授權程式與文件；無遺漏、無不相關修改、無產物或外部憑證。

新契約來源、validator、builder、五個專案技能及已知外部 reader 必須一致。外部技能分發來源在 clients/brand-avoidance-query；一次切換必須另行同步已知外部安裝，未同步者明列阻塞，不假裝 repo push 會自動安裝。

只在完整 gate 及範圍核對全部成功，且本次授權允許時，逐檔 stage 已核對路徑、commit 並依 AGENTS 推送 origin/main。不用 git add . 或整個 evidence／資料夾掃入其他代理與使用者的異動；不自行合併／重設分支、force-push 或提升 GitHub 權限。

push 後回報提交 SHA、推送目標與狀態。未明確要求不輪詢 Pages，也不執行遠端查詢來冒充部署驗收；只有使用者授權線上驗收時才依 deployment 文件檢查。部署失敗停住，不重用 PR artifact 或回退舊格式。

## Report

繁體中文說明：查了什麼、各代理及主代理責任、改了什麼、親自執行的完整命令與正／負查結果、warnings／errors、commit／push 狀態，以及未執行或未驗證項目。沒有實測證據不得聲稱已上線、外部 reader 已同步或線上回退成功。
