# AI_NOTES — brand-avoidance-query

此檔保存品牌避雷專案的耐久工作流記憶。未來處理本專案時，優先讀本檔與 `AGENTS.md`；全域 memory 只保留索引，不保存本專案細節。

## 2026-07-06 專案記憶位置

- 品牌避雷專案的規則、踩坑、近期案例與驗證口徑，應寫回本 repo：`AGENTS.md`、`AI_NOTES.md`、record 的 `summary` / `sources.note` / `aiNotes`。
- Obsidian 工作流筆記若已存在，可作舊索引；此 repo 內檔案才是專案記憶主檔。

## 2026-07-06 收尾標準

- 預設收尾標準：本機 validator PASS，`warnings: 0; errors: 0`，commit 並 push 到 `origin/main`。
- 不預設查 GitHub Pages / 線上 `brands.json`。只有使用者要求，或正在處理線上版故障，才確認 Pages。
- 不預設同步 Pinecone；除非使用者要求或 legacy 查詢需要。

## 2026-07-06 台灣公司稅籍號碼不查不存

- 使用者明確修正：不是只從 `identifiers` 拿掉，而是這類號碼一開始就不要查，既有資料也要移除。
- 後續看見商品標籤、公司資料或來源頁上有台灣公司稅籍號碼時，直接略過，不寫進 `aliases`、`identifiers`、`summary`、`sources.note` 或 `aiNotes`。
- `scripts/validate-brand-records.mjs` 已增加 `tax-id-data` 檢查；generated `brands.json` 不得殘留台灣公司稅籍號碼資料或相關欄位標籤。
- 條碼、域名、地址、官方帳號、法院／制裁正式案號仍可視使用情境保留在 `identifiers`。

## 2026-07-06 泛稱查詢改為使用者端可查、入庫端把關

- 使用者明確提出：泛稱應改成 AI 加入紀錄時的檢查，使用者查詢時可以使用泛稱。
- 已移除 `app-core.mjs` 的使用者查詢端 exact generic blocklist；`filterBrands()` 不再因 `GENERIC_QUERY_BLOCKLIST` 直接回空。
- 搜尋索引會處理 `identifiers` 的 `標籤：值` 格式，只索引冒號後的值；但台灣公司稅籍號碼不得出現在任何紀錄欄位。
- validator 改以 `generic-search-fields` 檢查入庫資料品質：泛稱不應是 exact `name` / `aliases` / `identifiers`；但泛稱出現在完整品牌名或 qualified alias 中可以被使用者查到。
- `--negative` 現為進階零命中回歸測試，不再拿來測普通泛稱；需要確認某查詢不該命中特定紀錄時，用 `--not-expect query=>record-id`。

## 2026-07-06 統一園之味蘋果汁

- Record: `uni-president-yuanzhiwei-apple-juice-china-origin-personal`
- 依據：使用者提供瓶身標籤截圖；標籤可讀到統一「園之味 100%果汁 蘋果汁」、原產地中國、統一企業股份有限公司、統一企業楊梅廠、條碼約 `4710088473141`。
- 口徑：可說「這款統一園之味蘋果汁標籤顯示原產地中國，因此個人避買」。不可延伸為統一企業全部產品、中資／國資／中共控制、食安、違法或禁售。
- 查詢：正查使用 `統一企業 園之味`、`統一 園之味 蘋果汁`、`統一蘋果汁`、`園之味`、`園之味100%果汁` 或條碼。

## 2026-07-06 蕭景田圖卡查核

- Record: `hsiao-ching-tien-kmt-1984-police-killing-case-personal`
- 社群圖卡只作線索。
- 保守口徑：公開媒體資料與中央社報導可支撐「蕭景田 1984 年涉入殺警案；中央社報導引述其因運送屍體罪被判刑入獄」。
- 不可寫成「法院認定蕭景田親手殺警」或「殺人罪定讞」，除非另有正式判決／法院資料。
- 查詢設計：姓名放 aliases；羅立柏、力照霖、1984年殺警案、運送屍體罪放 identifiers；`殺警`、`殺警案`、`殺警奪槍` 等泛稱不應作 exact alias / identifier，但使用者查詢端不再硬擋。

## 2026-07-04 纖享樂／JOY FOOD 纖享樂

- Record: `xianxiangle-li-zaishenbian-canned-pear-china-origin-personal`
- OCR 曾把「纖享樂」誤讀為「織享樂」；正式品牌名以標籤與公開通路結果的「纖享樂」為準。
- 冰糖燉梨罐頭標籤確認原產地中國；同品牌其他品項是使用者指示「反正都先加進去」後列入 personal，同時保留 caveat：不是每款都已逐一確認中國原產。
- 「家裡吃，沒花錢」：此類紀錄不是消費記帳，只是家中食用時發現標籤，列入未來避買。

## 2026-07-06 豚人拉麵長榮店

- Record: `butanchu-tainan-changrong-unification-personal`
- 使用者提供 Threads 連結並明確說「支持統一，直接加入」。
- 截圖可支撐店家識別：豚人拉麵 長榮店、帳號 `butanchu_tainan`、地址台南市東區長榮路二段159號、營業時間與菜單；截圖本身未顯示政治主張。
- 口徑：可說「使用者提供 Threads 線索指稱支持統一，因此列個人避開」。不可說官方承認、違法、法院認定，或所有豚人拉麵分店都同一立場。
- 查詢設計：正查 `豚人拉麵`、`豚人拉麵 長榮店`、`butanchu_tainan` 與地址；`支持統一` 是收錄理由／線索，不作 alias 或 identifier，`豚人 支持統一` 也不應靠 alias 命中。`拉麵`、`餐廳`、`長榮店`、`支持統一`、`統一` 等泛稱不可作未限定的 exact alias / identifier。

## 2026-07-06 葉賓森急診衝突紀錄

- Record: `yeh-bin-sen-er-conflict-personal`
- 使用者明確指定加入個人避開。
- 公開來源一致使用「葉賓森」；截圖 OCR／使用者文字中的「葉寶森」只作誤讀線索，不作正式 alias。
- 可確認事實：民視、TVBS 等報導珠寶直播主葉賓森於雙和醫院急診等待轉院時，與護理人員、員警發生衝突；民視引述其稱「我有可能導致心臟梗塞」。
- 不可寫成已證實浪費健保資源、故意濫用醫療資源、已確診心肌梗塞、犯罪成立或法律定罪。
- 查詢設計：`葉賓森`、`鈺鑽珠寶` 命中；`葉寶森`、`直播主`、`健保`、`浪費健保資源` 不應靠 alias 命中。


## 2026-07-06 狂新聞性暗示諧音截圖

- Record: `crazy-news-sexual-pun-personal`
- 使用者明確指定直接加入個人避開。
- 截圖可見：左上『狂新聞』Logo、右上『截取自網路』、主視覺字樣『雙北慧伯起』、字幕『雙北有慧伯真的好幸福』，互動數約愛心 1.1 萬、回覆 499、轉發 476、分享 249。
- 口徑：可說「使用者提供截圖顯示狂新聞使用『雙北慧伯起』字樣，使用者認為是性暗示／性騷擾諧音梗，因此列個人避開」。不可說法律認定性騷擾、違法或定罪。
- 查詢設計：`狂新聞`、`卡提諾狂新聞`、`Crazy News` 命中；`慧伯起`、`勃起`、`性騷擾`、`性暗示`、`蘇巧慧`、`沈伯洋` 不應靠 alias 命中。

## 2026-07-06 基隆名人幼兒園不當對待幼童案

- Record: `keelung-mingren-kindergarten-child-mistreatment-personal`
- 使用者明確指定加入個人避開。
- 公視報導基隆準公托幼兒園疑不當對待幼童，市府第一階段裁處 2 名教保員各 40 萬、終身不得擔任教保員，並令園所停招 1 年；中央社、Newtalk、華視報導市府公布園所為七堵區名人幼兒園，涉案教保員為林佳靜、劉可婕，並提及負責人 6 萬罰鍰、解除準公共教保服務機構契約與後續調查。
- 口徑：可說「公開報導與基隆市府行政調查／裁處顯示名人幼兒園涉不當對待幼童案，因此列個人避開」。不可寫成刑事定罪、法院判決、所有幼兒園／準公托都有同樣風險，或將尚未公布的第二階段裁處當作已確定。
- 查詢設計：`名人幼兒園`、`基隆名人幼兒園` 命中；`幼兒園` 可能因名稱 substring 命中但不是 alias 污染；`劉可婕`、`林佳靜` 不應靠 aliases／identifiers 命中機構紀錄。

## 2026-07-07 匯鴻室內設計使用者指定個人避開

- Record: `huihong-interior-ai-political-video-personal`
- 使用者明確指定將匯鴻室內設計工程有限公司／匯鴻室內設計加入個人避開。
- 口徑：可說「使用者指定列入個人避開；使用者表示該品牌使用 AI 製作醜化賴清德與川普的影片」。不可寫成法律違規、官方負面判決、法院／政府認定，或客觀事實定論。
- 查詢設計：`匯鴻室內設計`、`匯鴻室內設計工程有限公司`、`HUI HONG INTERIOR DESIGN`、`huihong_design`、`huihong-design.com` 命中；`賴清德`、`川普`、`AI影片`、`醜化`、`政治`、`室內設計公司` 不應靠 aliases／identifiers 命中此 record。不要查或存台灣公司稅籍號碼。

## 2026-07-07 公開 README 重要聲明口徑

- README 開頭介紹後、使用方式前新增 `## 重要聲明`，公開說明本專案是個人風險偏好／查詢備忘，不是法律裁判、官方黑名單、事實終局認定或商業抵制號召。
- 公開文件可解釋 `personal` / `watchlist` / `confirmed`：`personal` 可能只是主觀偏好，`watchlist` 不是定論，`confirmed` 只代表公開來源支持特定收錄理由，不等於法律或主管機關認定。
- 更正／下架管道維持 GitHub issue、pull request 或 repository contact；沒有固定聯絡 email 時不要捏造。
- README 這類公開文件不得混入聊天稱呼、內部助理工具、個人環境路徑、私有知識庫或一次性工作流程敘述。

## 2026-07-07 桃園地方政治支持截圖群組紀錄

- Record: `taoyuan-local-figures-si-guangyang-support-screenshot-personal`
- 使用者明確指定依使用者提供截圖列入 personal；本筆採一筆群組紀錄，只讓五個姓名 `簡郁陞`、`劉宗樺`、`李珮瑜`、`簡士強`、`王秀璞` 作為 searchable fields。
- 口徑：可說「使用者提供截圖列有五位姓名，並呈現與既有 `si-guangyang-kmt-taoyuan-candidate` 關聯對象的政治支持／加油脈絡，因此使用者指定個人避開」。不可說五人職務／候選資格已由官方確認，不可重述或採信截圖紅字的爭議標籤，不可把既有佀廣洋紀錄的爭議外溢到五人。
- 查詢設計：`aliases` 僅五個姓名，`identifiers` 不放。`佀廣洋`、`幫加油`、地方職稱／里別與截圖爭議詞只可作 summary/source/aiNotes 脈絡與警示，不得放入 `name` / `aliases` / `identifiers`。
- 2026-07-07 追加使用者提供的「簡士強社群留言」截圖作為補充來源：公開 note 只描述為對他人家人的貶抑性性別／職業相關問句，不逐字重述敏感句；`Craig Wang`、家人稱謂、性別／職業貶抑語仍不得進入 searchable fields，也不作帳號歸屬、法律違規或性騷擾定論。

## 2026-07-07 築間餐飲集團使用者指定個人避開

- Record: `jhujian-restaurant-group-political-preference-personal`
- 使用者明確指定將築間餐飲集團及官方網站品牌總覽列出的旗下品牌列入 personal；理由採保守口徑寫成「使用者表示負責人／老闆政治立場與個人偏好不合（使用者稱為小草老闆）」。
- 查詢設計：aliases 只放築間餐飲集團與官方列出的品牌名稱；不得把 `小草`、`政治`、`老闆`、`柯文哲`、`民眾黨`、`加盟`、`火鍋`、`燒肉`、`餐廳` 等理由詞或泛稱放入 aliases / identifiers。
- 回答邊界：可說使用者指定因政治立場偏好列入個人避開；不可寫成違法、官方認定、食品安全、服務品質問題，或推論每家加盟／門市與員工個人政治立場。

## 2026-07-07 愛彼蓋爾國際有限公司 LINE 帳號出租中共網軍案

- Record: `abigail-international-line-accounts-cyberattack-personal`
- 使用者明確指定加入個人避開。正式紀錄只用中時與太報／LINE TODAY 報導，不用公司登記頁，避免把台灣公司稅籍號碼帶入資料。
- 口徑：可說公開報導稱愛彼蓋爾國際有限公司 2 名負責人涉出租台灣 LINE 帳號給中共網軍，用於偽冒國際記者與社交工程攻擊脈絡；士林地檢署依幫助違反個資法給予緩起訴，妨害電腦使用部分不起訴。
- 人名邊界：中時列名李樺倫、陳孟森；太報／LINE TODAY 稱李姓實際負責人、陳姓前登記負責人，並稱中國端洪清涯另由士檢通緝。公司登記目前代表人與新聞中的李姓實際負責人不可混同。
- 查詢設計：aliases 放公司名、報導列名／涉及主要人名與中國端公司名；不得把 `網軍`、`LINE帳號`、`駭客`、`社交工程`、`個資法`、`緩起訴` 等原因詞放入 aliases / identifiers。

## 2026-07-08 台北市維記茶餐廳使用者指定個人避開

- Record: `wai-kee-cha-chaan-teng-china-anthem-screenshot-personal`
- 使用者明確指定依使用者提供 Threads 截圖加入個人避開。
- 口徑：可說「使用者提供截圖指稱台北市維記茶餐廳店內播放香港無線電視，且截圖文字認為其播放中國國歌造成不適，因此使用者指定個人避開」。不可寫成已查證店家每天播放、店家故意政治表態、違法、官方認定或所有港式茶餐廳都有相同問題。
- 查詢設計：aliases 僅放 `維記茶餐廳`、`台北市維記茶餐廳`；不得把 `中國國歌`、`香港無線電視`、`TVB`、`無線電視`、`國歌`、`香港`、`顧客`、`不舒服` 等原因或脈絡詞放入 aliases / identifiers。

## 2026-07-08 台灣媒體截圖清單與曾沛慈截圖

- Records:
  - `taiwan-media-china-influence-screenshot-list-personal-2026-07-08`
  - `pet-tseng-cctv-july7-peace-screenshot-personal`
- 使用者提供媒體圖卡並要求「這些都加入」：旺報／中視／中天／中國時報／工商時報已由 `want-want-china-times-media-group` 收錄；本次補 `時報周刊` / `WANT DAILY` 到該紀錄，另以一筆 screenshot-only personal 群組紀錄收 `聯合報系`、`聯合報`、`聯合新聞網`、`UDN`、`United Daily News Group`、`東森新聞`、`東森新聞台`、`東森電視`、`ETTV`、`TVBS`、`TVBS新聞`、`TVBS新聞網`、`ETtoday`、`ETtoday新聞雲`、`東森新媒體`。
- 媒體圖卡口徑：可說「使用者提供截圖列出上述媒體並指定個人避開」；不可寫成已查證中資控制、違法、主管機關認定、每位員工或每則報導均有問題。
- 曾沛慈截圖口徑：使用者提供 Threads 截圖，帳號 `cindyxxod` 轉貼「娛樂星聞」圖卡，圖卡稱「曾沛慈轉央視七七事變，3度表態珍愛和平」。英文名查 Wikidata 採 `Pets Tseng`。可說使用者依該截圖線索指定個人避開；不可寫成已由本專案獨立查證原始貼文、違法、官方認定、中共黨政關聯或定罪。
- 查詢設計：原因詞不得成為 searchable fields。`中資介入`、`中國色彩`、`偏頗`、`捏造` 不應命中新媒體群組紀錄；`央視`、`七七事變`、`珍愛和平`、`小粉紅`、`娛樂星聞`、`cindyxxod` 不應命中曾沛慈紀錄。

## 2026-07-08 三立／SETN 使用者指定個人避開

- Record: `sanlih-setn-wrong-ai-taiwan-map-personal`
- 使用者指定將三立新聞加入個人避開，理由是「使用錯誤 AI 台灣地圖」。初輪代理查證沒有取得可靠公開來源，故採 user-directed personal / 使用者提供文字線索口徑，不作客觀定論。
- 口徑：可說「使用者指出三立新聞使用錯誤 AI 台灣地圖，因此指定個人避開」。不可寫成已由本專案獨立查證地圖畫面、三立故意造假、違法、主管機關認定、每則報導品質均有問題或法律定論。
- 查詢設計：為避免 substring 搜尋讓 `新聞` 泛稱命中本紀錄，searchable fields 只放 `三立`、`SETN`、`Sanlih`、`setn.com`；不要把 `三立新聞`、`三立新聞網`、`三立新聞台`、`SETN三立新聞網`、`AI`、`錯誤AI台灣地圖`、`台灣地圖`、`錯誤地圖`、`地圖`、`新聞`、`媒體` 放入 aliases / identifiers。若後續 read-only worker 找到可靠公開來源，只補 sources / summary 邊界，不擴張 aliases。

## 2026-07-08 林思齊文章抄襲線索個人避開

- Record: `lin-siqi-plagiarism-article-screenshot-personal`
- 使用者指定將林思齊加入個人避開，理由是「抄襲文章」。來源為使用者提供 Threads 截圖；截圖可見 `piupiu_j_j` 發文、內嵌名為「林思齊」的個人檔案畫面與回覆批評，但未呈現原文與被抄襲文章逐字對照。
- 口徑：可說「使用者表示林思齊抄襲文章，因此指定個人避開」。不可寫成已由本專案獨立查證抄襲成立、著作權侵害、違法、官方認定、法律責任、政治立場或法院定論。
- 查詢設計：searchable fields 僅保留 `林思齊`。不要把 `抄襲`、`抄襲文章`、`文章`、`原創`、`piupiu_j_j`、`shin_22333`、`doctorkowj`、`柯文哲`、`草`、`小草`、`Threads` 或截圖中疑似 handle 放入 aliases / identifiers。

## 2026-07-08 bgirl_anlei 合作／團購促銷廠商個人避開

- Records: `evolsense-aiyanshi-bgirl-anlei-collab-personal`, `hair-gene-scalp-recovery-bgirl-anlei-collab-personal`
- 使用者表示 `bgirl_anlei` / Anlei 一直抄襲，要求把與其合作／代言的台灣廠商加入個人避開。公開 IG profile snapshot 可見：璦研司相關貼文含 `#團購優惠`、`@evolsense`、`#璦研司`、`#喚原輕飲`；髮基因相關貼文含 `#團購優惠`、`#髮基因`、`@scalprecovery_official`、`#髮基因頭皮護理專家`、`#髮基因青春露`。
- 口徑：可說使用者因 bgirl_anlei 抄襲爭議與公開 IG 上合作／團購促銷線索，指定個人避開璦研司／EvolSense 與髮基因／Scalp Recovery。不可寫成抄襲已由本專案獨立查證、廠商抄襲、付費代言合約已確認、違法、官方認定或法律責任。
- 查詢設計：searchable fields 僅保留品牌、官方帳號與具體產品線。不要把 `bgirl_anlei`、`Anlei`、`安蕾`、`抄襲`、`一直抄襲`、`代言`、`合作`、`團購優惠`、`網紅`、`吉伊卡哇`、`Bandai`、`chiikawa` 作為 aliases / identifiers。

## 2026-07-08 README 不列總筆數／完整資料內容

- 使用者明確要求：README 不用寫完整資料內容，才不用一直更新。
- README 應只保留用途、使用方式、穩定收錄原則與欄位原則；不要寫 `brands.json` 目前總筆數，也不要列會隨入庫變動的完整資料範圍。
- `scripts/validate-brand-records.mjs` 已調整：README 沒有總筆數列時，`readme-count` 視為通過／略過，不再產生 warning；若未來 README 又寫了總筆數，仍會檢查一致性。
- 新增紀錄時仍需更新 source records、重生 `brands.json`、跑 validator、更新必要 AI_NOTES；但不因總筆數變動而修改 README，除非 README 的穩定說明本身需要調整。

## 2026-07-08 黃建銘／KEN大叔觀察日記著作權判決個人避開

- Record: `huang-jianming-kenh0813-copyright-judgment-personal`
- 使用者明確指定加入個人避開。司法院裁判書系統可確認臺灣桃園地方法院 `114年度智易字第13號` 刑事判決：黃建銘犯著作權法第92條侵害著作財產權罪，處拘役40日，得易科罰金；另 `114年度智附民字第8號` 附帶民事判決命給付原告3萬元及法定遲延利息。
- 口徑：可說公開法院判決確認其將他人「台派」美術著作改作為「超台派」並公開傳輸至 `kenh0813` / KEN大叔觀察日記等帳號，因而受一審刑事與附帶民事判決。不可說判決已確定、不可說一定入監、不可把社群圖卡的「民眾黨御用畫師」或柯文哲／民眾黨活動關聯當成法院確認事實。
- 查詢設計：searchable fields 僅保留 `黃建銘`、`KEN大叔觀察日記`、`kenh0813` 與正式法院案號。`民眾黨`、`柯文哲`、`台派`、`台派BB寶寶`、`超台派`、`著作權`、`抄襲`、`拘役`、`小草`、`畫師` 等只作 summary/source/aiNotes 脈絡，不得進 aliases / identifiers。

## 2026-07-08 伍兩五炸雞太平二店備料衛生觀感截圖個人避開

- Record: `wuliangwu-fried-chicken-taiping-second-store-screenshot-personal`
- 使用者明確指定加入個人避開。使用者提供 Threads 截圖可見帳號 `dafeiji_new` 發文點名「台中伍兩五炸雞太平二店」，文字稱「香噴噴地去角質」；嵌入故事畫面可見一名男子在廚房／備料區以雙腳站在大量淺色食材或備料盆中。公開搜尋結果可見 `伍兩五炸雞 太平二店` 作為外送／店名條目，用於支撐店名存在。
- 口徑：可說使用者因截圖畫面造成餐飲備料衛生觀感疑慮，指定個人避開伍兩五炸雞太平二店。不可寫成官方食安裁罰、法令違反、店家已承認、影片真實來源已獨立查證、故意污染、所有分店皆有相同問題，或對畫面中人物作身分判定。
- 查詢設計：searchable fields 僅保留店名常見寫法。不要把 `dafeiji_new`、`l.jeff_y`、`香噴噴地去角質`、`去角質`、`赤腳`、`踩食材`、`食安`、`衛生`、`Threads` 等帳號／脈絡／原因詞放進 aliases / identifiers。

## 2026-07-09 Hana Mu / hana.mu721 社群頁面截圖個人避開

- Record: `hana-mu-hana-mu721-social-profile-screenshot-personal`
- 使用者以無文字截圖提供 Threads 個人頁，依近期避雷脈絡視為加入個人避開。截圖可見顯示名稱「哈娜 Hana Mu｜被酒呎誤的歌手」、帳號 `hana.mu721`，自介對「青鳥」使用侮辱性改稱與排斥留言文字，另可見自媒體、貓咪、麻將、塔羅、合作私訊與 `tiktok.com/@hana721mu` 連結。
- 口徑：可說使用者因該社群頁面自介內容指定個人避開此帳號／創作者。不可寫成已查證真人身分、違法、騷擾、詐欺、官方認定、政治組織關係、法律責任或對其線下活動作安全／合法性定論。
- 查詢設計：searchable fields 僅保留 `哈娜 Hana Mu`、`Hana Mu`、`hana.mu721`、`hana721mu`。不要把 `青鳥`、侮辱性改稱原詞、`很臭`、`留言封鎖`、`台北麻將`、`麻將`、`貓咪`、`塔羅`、`台北桌遊`、`進擊の巨人`、`Love always be right`、`自媒體`、`小盒子`、`歌手`、`Threads`、`TikTok` 放入 aliases / identifiers。

## 2026-07-09 食藥署／主管機關品項公告短期警示規則

- 使用者確認：近期油品／食品品項問題這類食藥署公布資訊通常只需要約一個月的高亮時效，不應無限期擴大成整個品牌永久避雷。
- 新增欄位支援：`temporaryUntil`、`reviewAfter`、`temporaryAlertReason`。`app-core.mjs` 會保留欄位並驗證 `lastReviewed` / `temporaryUntil` / `reviewAfter` 使用 `YYYY-MM-DD`；有 `temporaryUntil` 時必須有 `temporaryAlertReason`。`app.js` 會在卡片顯示短期警示到期、建議複查與原因。
- 入庫口徑：食藥署或主管機關公布的特定食品、油品、批號、有效日期或進口批次，預設建 `watchlist` 或使用者指定的 `personal` 短期品項紀錄；`temporaryUntil` / `reviewAfter` 抓公告日或查核日起約 30 天。summary / sources 必須寫明「特定品項／批號」，不可直接宣稱整個品牌所有產品都有問題。
- 到期後口徑：若沒有新公告、新批次或拒不回收／反覆出包證據，降為歷史警示或複查，不主動高亮；若同品牌反覆出包、明確拒不回收、主管機關認定系統性管理問題，或使用者明確指定，才升級成品牌層級 `watchlist` / 長期個人避開。
- 查詢設計：aliases / identifiers 只放品牌、品名、批號、條碼、食藥署公告編號或官方可查識別；不要把 `油品問題`、`食安`、`不合格`、`回收`、`召回`、`食藥署` 等原因／機關泛稱做成 searchable fields。

## 2026-07-09 WOAWOA / Woawoa 中國製袖套截圖個人避買

- Record: `woawoa-sleeve-made-in-china-screenshot-personal`
- 使用者以無文字截圖提供 Threads 貼文；截圖可見 `chengan.chang` 發文點名 Woawoa，文字稱花時間找台灣製袖套後發現其產品標籤；附圖可見 WOAWOA 樣式 logo 與洗標底部 `Made in China`。
- 口徑：可說使用者提供截圖中的產品洗標顯示 `Made in China`，因此依使用者偏好列個人避買。不可寫成官方認定欺騙消費者、違法、台灣禁售、品牌曾正式宣稱台灣製、全部 WOAWOA 商品皆中國製，或本專案已獨立查證所有 SKU 產地。
- 查詢設計：searchable fields 僅保留 `WOAWOA`、`Woawoa`、`woawoa`、`WOA WOA`。不要把 `chengan.chang`、`欺騙消費者`、`台灣製`、`袖套`、`中國製`、`Made in China`、`Threads`、`服飾`、`運動`、`戶外` 放入 aliases / identifiers。

## 2026-07-10 中廣《千秋萬事》與文姿云社群截圖個人避開

- Records:
  - `qianqiu-wanshi-bcc-newsradio-screenshot-personal`
  - `wen-tzu-yun-social-post-screenshot-personal`
- 中廣《千秋萬事》：使用者提供影片截圖，畫面可見中廣新聞網 NewsRadio 背板與節目標示「千秋萬事 盡付笑談中」。口徑只說使用者依截圖指定節目個人避開；不可擴張成中廣新聞網全體、主持人／來賓違法或完整節目內容已查證。
- 文姿云／`wen_tzu_yun`：使用者提供社群截圖並稱其為運動員；公開百科僅用於核對文姿云羅馬拼音 Wen Tzu-Yun 與台灣空手道運動員身分。口徑只說使用者依截圖指定個人避開，不作違法、官方認定或完整上下文定論。
- 查詢設計：節目 record searchable fields 僅節目名與限定字串 `中廣千秋萬事`；不放 `中廣新聞網`、`新聞網`、`NewsRadio`、`無辜被害`、`按讚`、`訂閱`。文姿云 record searchable fields 僅姓名、羅馬拼音與帳號；不放 `運動員`、`空手道`、`言論自由`、`權益`、`尊重他人`、`等你來當運動員` 等原因詞。

## 2026-07-10 《功夫道長》／kung_fu168 社群頁面截圖個人避開（搜尋設計更正）

- Record: `kung-fu168-social-profile-screenshot-personal`
- 維持 `status: personal`、`confidence: low`、`country: 未查核`。帳號截圖／帳號自述只支撐《功夫道長》／`kung_fu168`、自介與可見貼文；不得據此確認真人、資格、傳承、服務效果、違法或詐欺。
- 使用者明確偏好改正：**具體辨識詞可查、泛稱不單獨入庫**。因此 aliases 保留帳號／Facebook 精確頁名，以及台南烏山腳飛龍宮、烏山腳飛龍宮、羅正道長、黃羅正、諦威武術館、謚威武術館（OCR recovery）、龍眼宅飛龍宮（使用者指定地圖辨識線索）、中國閭漢道教總會法師、祖傳第四代三壇法師、諦威武術館館長、閭山派淨明宗、正一符籙宗、紀府法壇、仙靈壇三壇小法、正一劉厝派鼎新門高階行道師、港傳蔡李佛派第五傳人、祭煞補運、打財入庫、收驚安神、祈安禮斗、靈符客製；identifier 保留 `lin.ee/ZoSnaNN`。
- 上述非帳號具體詞僅能描述為截圖／帳號經營方自述、貼文自稱／hashtag、OCR recovery 或使用者指定地圖線索；不是外部對真人、資格、傳承、團體關係或服務效果的證明。龍眼宅飛龍宮不得與帳號、Facebook 頁面或台南烏山腳飛龍宮／烏山腳飛龍宮合併認定為同一實體／地點／經營方。
- Facebook 精確頁 URL 存於 source，精確頁名「台南烏山腳飛龍宮-功夫道長」可由 alias 查詢；不保留不完整 share URL。因 URL 本身會讓 bare `Facebook` substring 命中，URL 不放 identifier；同理 bare `LINE`／`Facebook` 不得靠本 record 的 identifier 命中。
- 未限定泛稱台南、龍崎、法師、館長、道教、武術、LINE、Facebook、宗教、服務、補運等不可作 standalone exact alias／identifier；它們在具體完整辨識詞中出現不等於另建泛稱查詢鍵。

## 快速處理模式

遇到商品標籤直接標示中國原產：

1. OCR / 視覺確認品牌、品名、原產地、公司與條碼；台灣公司稅籍號碼一開始就不要查、不要抄、不要入庫。
2. 本機查重。
3. 補 `data/records/*.mjs`，跑 merge。
4. validator 正查、必要 `--expect` / `--not-expect`、exact generic field guard PASS。
5. 更新本檔必要口徑。
6. commit + push origin/main。
7. 不做 Pages / Pinecone，除非使用者要求。
