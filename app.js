import {
  CONFIDENCE_LABELS,
  STATUS_LABELS,
  collectOptions,
  filterBrands,
  normalizeBrandList,
  validateBrandRecord,
} from "./app-core.mjs";

const elements = {
  dataStatus: getRequiredElement("dataStatus"),
  resultCount: getRequiredElement("resultCount"),
  searchInput: getRequiredElement("searchInput"),
  confidenceFilter: getRequiredElement("confidenceFilter"),
  statusFilter: getRequiredElement("statusFilter"),
  categoryFilter: getRequiredElement("categoryFilter"),
  reasonFilter: getRequiredElement("reasonFilter"),
  warningBox: getRequiredElement("warningBox"),
  results: getRequiredElement("results"),
  emptyState: getRequiredElement("emptyState"),
};

let brands = [];

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }
  return element;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function setDataStatus(message) {
  elements.dataStatus.textContent = message;
}

function setWarning(messages) {
  const items = Array.isArray(messages) ? messages.filter(Boolean) : [messages].filter(Boolean);
  elements.warningBox.replaceChildren();
  elements.warningBox.hidden = items.length === 0;

  if (items.length === 0) {
    return;
  }

  const title = createElement("p", "", "資料格式提醒");
  const list = document.createElement("ul");

  for (const message of items) {
    const item = createElement("li", "", message);
    list.append(item);
  }

  elements.warningBox.append(title, list);
}

function optionFromValue(value, label = value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function resetSelectOptions(select, options) {
  const placeholder = select.options[0] ?? optionFromValue("", "全部");
  select.replaceChildren(placeholder);
  select.value = placeholder.value;

  for (const option of options) {
    select.append(option);
  }
}

function optionEntriesFromMap(labelMap) {
  return Object.entries(labelMap).map(([value, label]) => optionFromValue(value, label));
}

function optionEntriesFromValues(values) {
  return values.map((value) => optionFromValue(value, value));
}

function populateFilterOptions() {
  resetSelectOptions(elements.confidenceFilter, optionEntriesFromMap(CONFIDENCE_LABELS));
  resetSelectOptions(elements.statusFilter, optionEntriesFromMap(STATUS_LABELS));
  resetSelectOptions(elements.categoryFilter, optionEntriesFromValues(collectOptions(brands, "categories")));
  resetSelectOptions(elements.reasonFilter, optionEntriesFromValues(collectOptions(brands, "avoidReasons")));
}

function getCurrentFilters() {
  return {
    query: elements.searchInput.value,
    confidence: elements.confidenceFilter.value,
    status: elements.statusFilter.value,
    category: elements.categoryFilter.value,
    reason: elements.reasonFilter.value,
  };
}

function formatList(values) {
  return values.length > 0 ? values.join("、") : "未提供";
}

function appendMetaItem(list, label, value) {
  const term = createElement("dt", "", label);
  const description = createElement("dd", "", value || "未提供");
  list.append(term, description);
}

function appendOptionalMetaItem(list, label, values) {
  if (!values.length) {
    return;
  }

  appendMetaItem(list, label, formatList(values));
}

function createBadge(kind, value, labels) {
  const label = labels[value] ?? value ?? "未提供";
  return createElement("span", `badge ${kind}-${value}`, label);
}

function createSourcesSection(sources) {
  const section = createElement("div", "sources");
  section.append(createElement("h3", "", "來源"));

  if (!sources.length) {
    section.append(createElement("p", "", "未提供來源。"));
    return section;
  }

  const list = document.createElement("ul");

  for (const source of sources) {
    const item = document.createElement("li");

    if (source.url) {
      const link = createElement("a", "", source.title || source.url);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      item.append(link);
    } else {
      item.append(createElement("span", "", source.title || "未命名來源"));
    }

    if (source.date) {
      item.append(createElement("span", "", `日期：${source.date}`));
    }

    if (source.note) {
      item.append(createElement("span", "", source.note));
    }

    list.append(item);
  }

  section.append(list);
  return section;
}

function createAiNotesSection(aiNotes) {
  const section = createElement("div", "ai-notes");
  section.append(createElement("h3", "", "AI 備註"));
  section.append(createElement("p", "", aiNotes || "未提供 AI 備註。"));
  return section;
}

function createFullSummarySection(summary) {
  const section = createElement("div", "full-summary");
  section.append(createElement("h3", "", "完整摘要"));
  section.append(createElement("p", "", summary || "未提供摘要。"));
  return section;
}

function createDetailMetaSection(brand) {
  const section = createElement("section", "detail-meta-section");
  const meta = createElement("dl", "detail-meta-grid");

  section.append(createElement("h3", "", "辨識與審閱資料"));
  appendMetaItem(meta, "別名", formatList(brand.aliases));
  appendOptionalMetaItem(meta, "辨識編號", brand.identifiers);
  appendMetaItem(meta, "最後檢查", brand.lastReviewed);
  if (brand.temporaryUntil) {
    appendMetaItem(meta, "短期警示到期", brand.temporaryUntil);
  }
  if (brand.reviewAfter) {
    appendMetaItem(meta, "建議複查", brand.reviewAfter);
  }
  if (brand.temporaryAlertReason) {
    appendMetaItem(meta, "短期警示原因", brand.temporaryAlertReason);
  }

  section.append(meta);
  return section;
}

function disclosureLabel(brand) {
  const name = brand.name || "未命名品牌";
  const contents = brand.summary
    ? "包含完整摘要、來源、AI備註與辨識及審閱資料"
    : "未提供摘要（完整摘要欄位為空）；可查看來源、AI備註與辨識及審閱資料";

  return `查看 ${name} 的完整資料：${contents}`;
}

function createBrandCard(brand) {
  const card = createElement("article", "brand-card");
  const header = createElement("div", "brand-card__header");
  const title = createElement("h2", "", brand.name || "未命名品牌");
  const badges = createElement("div", "badges");

  badges.append(
    createBadge("confidence", brand.confidence, CONFIDENCE_LABELS),
    createBadge("status", brand.status, STATUS_LABELS),
  );
  header.append(title, badges);

  const summaryPreview = createElement("p", "summary-preview", brand.summary || "未提供摘要。");
  summaryPreview.setAttribute("aria-hidden", "true");
  const meta = createElement("dl", "meta-grid compact-meta-grid");
  appendMetaItem(meta, "分類", formatList(brand.categories));
  appendMetaItem(meta, "避買理由", formatList(brand.avoidReasons));
  if (brand.temporaryUntil) {
    appendMetaItem(meta, "短期警示到期", brand.temporaryUntil);
  }

  const details = document.createElement("details");
  const disclosure = createElement("summary", "", "查看完整資料");
  disclosure.setAttribute("aria-label", disclosureLabel(brand));
  details.append(
    disclosure,
    createFullSummarySection(brand.summary),
    createSourcesSection(brand.sources),
    createAiNotesSection(brand.aiNotes),
    createDetailMetaSection(brand),
  );

  card.append(header, summaryPreview, meta, details);
  return card;
}

function renderResults(filteredBrands) {
  elements.resultCount.textContent = `結果計數：${filteredBrands.length}`;
  elements.results.replaceChildren(...filteredBrands.map(createBrandCard));

  elements.emptyState.hidden = filteredBrands.length > 0;
  elements.emptyState.textContent =
    brands.length === 0 ? "目前沒有可顯示的品牌資料。" : "沒有符合條件的品牌資料。";
}

function updateResults() {
  renderResults(filterBrands(brands, getCurrentFilters()));
}

function collectValidationErrors(normalizedBrands) {
  return normalizedBrands.flatMap((brand, index) => {
    const label = brand.name || brand.id || `第 ${index + 1} 筆`;
    return validateBrandRecord(brand).map((error) => `${label}：${error}`);
  });
}

function bindFilterEvents() {
  elements.searchInput.addEventListener("input", updateResults);

  for (const select of [
    elements.confidenceFilter,
    elements.statusFilter,
    elements.categoryFilter,
    elements.reasonFilter,
  ]) {
    select.addEventListener("input", updateResults);
    select.addEventListener("change", updateResults);
  }
}

async function loadBrands() {
  setDataStatus("資料狀態：載入中");

  try {
    const response = await fetch("./brands.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    brands = normalizeBrandList(data);
    const validationErrors = collectValidationErrors(brands);

    populateFilterOptions();
    setWarning(validationErrors);
    setDataStatus(`資料狀態：已載入 ${brands.length} 筆`);
    updateResults();
  } catch (error) {
    brands = [];
    setDataStatus("資料載入失敗");
    setWarning(`資料載入失敗：${error instanceof Error ? error.message : String(error)}`);
    renderResults([]);
  }
}

bindFilterEvents();
loadBrands();
