---
name: brand-avoidance-active-discovery
description: Discover precise brand-avoidance candidates from current public sources. Read AGENTS.md first. Report evidence and uncertainty only; do not edit records, build, commit, push, or publish.
---

# Brand Avoidance Active Discovery

## Authority And Boundary

先讀專案根目錄 `AGENTS.md`，依其個人價值、入庫授權、重大人物指控、證據分層、最小範圍及稅籍資料防線執行。本技能只作主動探索，不另定狀態門檻。

只找候選、核對來源並回報；不得修改來源、編譯器、匹配核心、證據清單、筆記或產物，不執行 build、提交或推送。探索結果及建議分級不是寫入授權，必須等使用者接受明確候選後才交給 record-edit。

可唯讀查看 `git status --short --branch`、以 rg 檢查 `data/records/`，並依 `compileRecords()` 與共用 `matchRecords()` 核對清理後本地紀錄。不讀退役全集或用舊格式查庫。精準規則見 `docs/ai-reader-contract.md`；若使用已建好的本地站，依 `clients/brand-avoidance-query/SKILL.md` 查 manifest／索引／單筆，不拿遠端站證明未推送來源已更新。

## Discovery Strategy

以高訊號、低誤判為原則，候選必須是可辨識的品牌、公司、人物、店家、產品／SKU、App、作品、公開帳號或網域，不用泛稱／事件詞冒充實體。

1. 每日固定：制裁、資安、出口管制、主管機關檢驗與法院／主要新聞原始來源。
2. 每週或線索觸發：所有權／控制、國資、黨建、年報與公司官方聲明。
3. 個案觸發：臺灣標示、政治表態、產品原產地、店家或人物爭議。不每日無差別掃所有藝人、政黨成員或關係人。

延續既有探索方向：中國國資／中共治理關聯、監控／人權／強迫勞動／審查／資料安全、臺灣標示與政治配合、旺旺等紅媒集團的可證明直接控制對象，以及精確商品原產地。店家或人物政治偏好只作可歸屬的 personal 候選，不冒充中共／國安風險；不因國民黨／民眾黨身分或親屬關係就擴張到企業，須有直接角色／控制證據或使用者明確指定。

## Search Lanes

### A: Sanctions, Security And Official Notices

優先查 OFAC／美國財政部、BIS、FCC、國安／強迫勞動名單，以及臺灣資安、食藥、法院、採購與檢驗原始公告。確認名單實際對象、日期、措施及適用範圍；公告存在不自動證明其他未提及指控。

例：`site:ofac.treasury.gov/recent-actions "<target>"`、`site:bis.gov "<target>"`、`site:moda.gov.tw "<target>"`、`site:fda.gov.tw "<product>"`。

### B: Ownership, State Control And Party Links

以公司官網、投資人關係、MOPS／證交所、CNINFO、HKEX、SEC、年報或官方黨建頁核對可歸屬的控制鏈。只採來源直接支持的關聯，不將投資、通路、授權或親屬關係等同控制。

例：`"<target>" 股權 結構`、`"<target>" 年報 黨建`、`site:hkexnews.hk "<target>"`。不查、不保存台灣公司稅籍號碼，不以該號碼作身分橋接或搜尋鍵。

### C: Taiwan Labels And Public Political Statements

查品牌條款、註冊流程、官方公告、具可歸屬性的公開貼文與可信原始報導；頁面變動時找可核對的存檔。藝人在中國工作本身不等於政治配合；須有直接表態、轉發或活動參與證據。

例：`"<target>" "中國台灣"`、`"<target>" "九二共識"`、`"<target>" 國台辦 央視`。

### D: Product, Origin And Ingredient

只有精確商品、SKU、包裝、條碼、產品頁或使用者指定目標才查。原產地／原料資料只支持已確認品項，不擴大到全部同品牌商品，也不因中國原產推定食安、違法、國資或中共控制。全家商品可轉 family-foodsafety-lookup。

### E: Social Leads, Shops And People

社群截圖、論壇與圖卡先作線索，尋找原始公開貼文、明確人物／店家及可歸屬來源。依 AGENTS，重大刑事、兒少傷害、性暴力、暴力、掩蓋、貪腐或官方失職指控，不得以純截圖或 personal 偏好跳過事實查核。

## Evidence And Scope Check

- 優先使用政府／法院／官方名單、企業與當事人原始公開資料，再以具名可信報導補脈絡。社群線索不自行升為來源確認。
- 每個來源保留直接 URL、日期、種類及實際支持的窄幅事實；身分橋接與爭議主張分開。
- 分開來源可見事實、使用者個人判斷、外部可驗證事實與法律定性；建議狀態與 confidence 依 AGENTS，不因未違法就否定個人避開理由。
- 單一店家／分店／SKU 不擴成全品牌、集團或關係人；制裁／檢驗也只按公告範圍。
- 快速檢查既有來源及清理後紀錄，重複或被 umbrella 紀錄涵蓋時回報既有 ID；較窄新線索可建議補來源，不再造重複紀錄。partial 命中只作候選，無命中不表示安全。

## Report And Stop

以繁體中文回報候選名稱／精確類型、lane、建議分級、個人理由與來源事實、直接來源與日期、既有 recordId 或未確認、範圍、未證實事項及下一步。資料不足寫 lead／hold／needs evidence，不假裝已入庫。

回報後停止。只有使用者依 AGENTS 給予寫入授權，才由 router 轉 record-edit；主動探索不自動發布。
