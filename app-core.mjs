export const CONFIDENCE_LABELS = {
  high: "高可信度",
  medium: "中可信度",
  low: "低可信度",
};

export const STATUS_LABELS = {
  confirmed: "來源確認",
  watchlist: "觀察中",
  personal: "個人避買",
};

const ALLOWED_CONFIDENCES = new Set(Object.keys(CONFIDENCE_LABELS));
const ALLOWED_STATUSES = new Set(Object.keys(STATUS_LABELS));

function cleanString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).normalize("NFKC").replace(/\s+/g, " ").trim();
}

function normalizeChoice(value, allowedValues, fallback) {
  const normalized = normalizeText(value);
  return allowedValues.has(normalized) ? normalized : fallback;
}

function activeFilterSet(value) {
  return new Set(
    asStringArray(value)
      .map(normalizeText)
      .filter((item) => item && item !== "all"),
  );
}

function normalizeSource(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const url = cleanString(value);
    return url ? { title: "", url, date: "", note: "" } : null;
  }

  const source = {
    title: cleanString(value.title),
    url: cleanString(value.url),
    date: cleanString(value.date),
    note: cleanString(value.note),
  };

  return Object.values(source).some(Boolean) ? source : null;
}

function normalizeSources(value) {
  const values = Array.isArray(value)
    ? value
    : value === null || value === undefined
      ? []
      : [value];

  return values.map(normalizeSource).filter(Boolean);
}

export function normalizeText(value) {
  return cleanString(value).toLowerCase();
}

const GENERIC_QUERY_BLOCKLIST = new Set(
  [
    "APP",
    "中國製",
    "中国制",
    "中国製",
    "口腔用品",
    "口腔清潔用品",
    "水",
    "牙刷",
    "牙膏",
    "政治人物",
    "瓶裝水",
    "導演",
    "礦泉水",
    "藝人",
    "遠端桌面",
    "飲料",
    "飲料店",
    "飲用水",
    "反罷免",
    "歌手",
    "馬來西亞歌手",
    "一日",
    "水果飲",
    "綜合水果",
    "果汁",
    "蔬果汁",
    "蘋果汁",
    "濃縮汁",
    "海鮮",
    "沖繩餐廳",
    "沖縄餐廳",
    "蒸汽料理",
    "蒸気料理",
    "天理スタミナラーメン",
  ].map(normalizeText),
);

export function asStringArray(value) {
  const values = Array.isArray(value)
    ? value
    : value === null || value === undefined
      ? []
      : [value];

  return values.map(cleanString).filter(Boolean);
}

export function normalizeBrand(record, index = 0) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};

  return {
    id: cleanString(source.id) || `brand-${index + 1}`,
    name: cleanString(source.name),
    aliases: asStringArray(source.aliases),
    country: cleanString(source.country),
    categories: asStringArray(source.categories),
    avoidReasons: asStringArray(source.avoidReasons),
    identifiers: asStringArray(source.identifiers),
    summary: cleanString(source.summary),
    aiNotes: cleanString(source.aiNotes),
    confidence: normalizeChoice(source.confidence, ALLOWED_CONFIDENCES, "low"),
    status: normalizeChoice(source.status, ALLOWED_STATUSES, "personal"),
    lastReviewed: cleanString(source.lastReviewed),
    sources: normalizeSources(source.sources),
  };
}

export function validateBrandRecord(brand) {
  if (!brand || typeof brand !== "object" || Array.isArray(brand)) {
    return ["record must be an object"];
  }

  const errors = [];

  if (!cleanString(brand.name)) {
    errors.push("name is required");
  }

  if (normalizeText(brand.status) === "confirmed" && normalizeSources(brand.sources).length === 0) {
    errors.push("confirmed records require at least one source");
  }

  return errors;
}

export function normalizeBrandList(records) {
  if (!Array.isArray(records)) {
    throw new TypeError("brands.json must contain a JSON array");
  }

  return records.map((record, index) => normalizeBrand(record, index));
}

export function collectOptions(brands, field) {
  if (!Array.isArray(brands) || !field) {
    return [];
  }

  const options = new Map();

  for (const brand of brands) {
    if (!brand || typeof brand !== "object") {
      continue;
    }

    for (const value of asStringArray(brand[field])) {
      const key = normalizeText(value);
      if (key && !options.has(key)) {
        options.set(key, value);
      }
    }
  }

  return [...options.values()].sort((left, right) => {
    const normalizedOrder = normalizeText(left).localeCompare(normalizeText(right));
    return normalizedOrder || left.localeCompare(right);
  });
}

export function getSearchText(brand) {
  if (!brand || typeof brand !== "object") {
    return "";
  }

  return normalizeText(
    [
      brand.name,
      ...asStringArray(brand.aliases),
      brand.country,
      ...asStringArray(brand.identifiers),
    ].join(" "),
  );
}

export function filterBrands(brands, filters = {}) {
  if (!Array.isArray(brands)) {
    return [];
  }

  const query = normalizeText(filters.query);
  const confidenceFilters = activeFilterSet(filters.confidence);
  const statusFilters = activeFilterSet(filters.status);
  const countryFilters = activeFilterSet(filters.country);
  const categoryFilters = activeFilterSet(filters.category ?? filters.categories);
  const reasonFilters = activeFilterSet(filters.reason ?? filters.avoidReason ?? filters.avoidReasons);

  if (query && GENERIC_QUERY_BLOCKLIST.has(query)) {
    return [];
  }

  return brands.filter((brand) => {
    if (!brand || typeof brand !== "object") {
      return false;
    }

    if (query && !getSearchText(brand).includes(query)) {
      return false;
    }

    if (confidenceFilters.size > 0 && !confidenceFilters.has(normalizeText(brand.confidence))) {
      return false;
    }

    if (statusFilters.size > 0 && !statusFilters.has(normalizeText(brand.status))) {
      return false;
    }

    if (countryFilters.size > 0 && !countryFilters.has(normalizeText(brand.country))) {
      return false;
    }

    if (
      categoryFilters.size > 0 &&
      !asStringArray(brand.categories).some((category) => categoryFilters.has(normalizeText(category)))
    ) {
      return false;
    }

    if (
      reasonFilters.size > 0 &&
      !asStringArray(brand.avoidReasons).some((reason) => reasonFilters.has(normalizeText(reason)))
    ) {
      return false;
    }

    return true;
  });
}
