---
name: brand-avoidance-project-workflow
description: Route brand-avoidance project tasks into discovery, source-record editing, or verification and publishing. Read AGENTS.md first; use the manifest/index/record protocol for queries.
---

# Brand Avoidance Project Workflow

## Authority

先讀專案根目錄 `AGENTS.md`；它是入庫授權、證據邊界、搜尋欄位、稅籍資料禁令及完整發布 gate 的唯一權威。本技能只負責分工，不另定或降低規則。專案位於 `D:/AI_workspace/brand-avoidance-query`；保留既有工作區異動。

## Router

1. **主動查**：使用 `brand-avoidance-active-discovery` 搜尋公開來源、精確辨識候選與不確定性；不得自行入庫或發布。
2. **加入／修改**：依 AGENTS 判斷寫入授權後，使用 `brand-avoidance-record-edit` 修改 `data/records/*.mjs` 等必要來源；不手改建置產物。
3. **驗證／發布**：交給 `brand-avoidance-verify-publish` 執行 AGENTS 的完整新 gate、diff 與範圍核對，再依本次授權提交／推送。子任務明示不提交時交回主代理。
4. **只查是否收錄**：讀 `docs/ai-reader-contract.md` 與 `clients/brand-avoidance-query/SKILL.md`，以 manifest → 分片索引 → 完整紀錄查詢；不修改來源。
5. **全家商品來源**：使用 `family-foodsafety-lookup` 查全家原始商品 API，再依查詢契約核對供應商；來源資料不是安全背書。

## Sequencing

- 「每天查」「主動查」「找看看」或廣泛類別先做探索。探索結果及建議分級不是入庫授權；等使用者接受明確候選後才轉編輯。
- 「加入避雷」等明確指令與持續入庫情境，依 AGENTS 的最小範圍及重大人物指控例外處理，不另重複確認。
- 編輯後一定轉完整驗證；不能只憑來源可讀或單一查詢成功宣稱完成。
- `data/compile-records.mjs` 的 `compileRecords()` 是共用編譯入口，validator／builder 直接使用清理後來源；`_site/` 只由 build 產生。
- exact 是名稱／別名／識別碼的精準鍵命中；partial 只提供候選。索引不是風險結論，無命中不等於安全；完整範圍、來源與限制必須讀單筆紀錄。
- 不使用退役的全集、合併／生成舊資料命令、舊 URL fallback 或泛稱 query blocklist。
- 外部 reader 的可分發來源在 `clients/brand-avoidance-query/`；repo push 不代表外部技能已同步，也不代表 Pages 已上線。未獲要求不輪詢遠端。

## Reporting

繁體中文精簡回報：查了什麼、做了什麼、主代理／各代理責任、親自執行的驗證與結果、提交狀態及剩餘未驗證項目。探索、編輯、驗證及部署結果分開標示。
