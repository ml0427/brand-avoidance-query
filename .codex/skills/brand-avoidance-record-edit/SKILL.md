---
name: brand-avoidance-record-edit
description: Edit authorized brand-avoidance source records after targets and evidence are selected. Read AGENTS.md first. Never edit generated site data, run broad discovery, commit, push, or bypass the complete verification handoff.
---

# Brand Avoidance Record Edit

## Authority And Boundary

先讀專案根目錄 `AGENTS.md`；入庫授權、重大人物指控例外、個人判斷與客觀定性、證據保存、稅籍資料禁令及驗證門檻全部以該檔為準。本技能只執行已授權對象的來源編輯，不另定狀態／信心規則。

不作廣泛主動探索。來源不足時只核對當前精確對象必要的身分與事實，否則回報 needs evidence。只要求分析／查證不等於入庫授權；探索報告也不是授權。

只改本次必要來源：`data/records/*.mjs`、經授權證據與 AGENTS 要求的公開證據清單／本地筆記。不手改 `_site/`、匹配核心、編譯器或契約，不建立 query blocklist、另一套來源表、排序相容表或舊格式輸出器；需要程式修正則交回主代理另行切分。不執行發布、不提交、不推送。

## Source Model

- 唯一紀錄來源：`data/records/*.mjs`；既有實體優先補同一筆。
- 共用清理後結果：`data/compile-records.mjs` 的 `compileRecords()`，套用 cleanup／override 並依 ID 排序。編輯後須檢查清理規則是否遮蔽了預期來源值；有衝突交回主代理，不自行新增第二套優先序。
- 公開證據核准來源：`data/public-evidence.json`，依 AGENTS 審核路徑、公開範圍及 SHA-256。
- 產物由 verify-publish 的 build 生成；不讀退役全集補資料，也不執行舊 merge／gen。

## Editing Steps

1. 先讀 `git status --short --branch` 與相關既有異動；保留不屬本任務的修改及未追蹤檔。以 rg 搜 `data/records/`，再以 compileRecords 與共用精準比對確認既有實體、同名與最小適用範圍。
2. 用 apply_patch 修改適當領域來源。保留 id、name、aliases、必要 identifiers、country、categories、avoidReasons、confidence、status、summary、sources、aiNotes 及需要的 lastReviewed／短期警示日期與原因；不為改技術格式重判既有風險。
3. name／aliases／identifiers 只放穩定實體名稱與必要識別。泛稱、理由／事件詞、未確認指控及台灣公司稅籍號碼不能入任何紀錄欄位；不以禁查泛稱來修補錯誤 alias。
4. summary 寫明收錄理由與範圍，aiNotes 與 sources.note 保留不可推論的部分。來源可見事實、使用者主觀理由、外部事實／法律定性分開；單一 SKU／分店不擴大為全品牌。
5. 依 AGENTS 保存證據雜湊、核准公開清單與必要筆記。身份橋接不自動證明爭議，未核准或無法歸屬的重大人物指控不發布。
6. 以清理後編譯結果核對這筆實際欄位；保留完整來源 note 與內部陣列順序，不把未讀取／編譯失敗當成無紀錄。

## Handoff

將本次 recordId、所有修改檔、正查名稱／別名／識別碼、負查與排除範圍、partial 候選、證據 SHA-256／公開核准情形及未解問題交給 `brand-avoidance-verify-publish`。

編輯成功不是驗證通過；必須由 verify-publish 完整執行 AGENTS 新 gate，不能只做局部語法檢查。繁體中文回報來源改動與待驗證項目，不宣稱已提交、已上線或外部 reader 已同步。
