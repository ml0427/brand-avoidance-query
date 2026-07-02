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
    "作家",
    "評論員",
    "评论员",
    "評論家",
    "评论家",
    "歷史學者",
    "历史学者",
    "親中",
    "亲中",
    "親中作家",
    "亲中作家",
    "親中政黨",
    "亲中政党",
    "統派",
    "统派",
    "統派作家",
    "统派作家",
    "促統",
    "促统",
    "促統政黨",
    "促统政党",
    "和平統一",
    "和平统一",
    "統一促進",
    "统一促进",
    "政黨",
    "政党",
    "小黨",
    "小党",
    "家庭黨",
    "家庭党",
    "商工",
    "泛藍",
    "泛蓝",
    "國民黨關聯",
    "国民党关联",
    "政治人物",
    "前縣長",
    "前县长",
    "台北縣長",
    "台北县长",
    "導彈",
    "导弹",
    "飛彈",
    "飞弹",
    "中國飛彈",
    "中国飞弹",
    "大陸導彈",
    "大陆导弹",
    "協會",
    "协会",
    "社團法人",
    "社团法人",
    "森林",
    "森林城市",
    "城市森林",
    "護樹",
    "护树",
    "愛樹",
    "爱树",
    "理事長",
    "理事长",
    "廣洋",
    "广洋",
    "瓶裝水",
    "導演",
    "礦泉水",
    "藝人",
    "網紅",
    "网红",
    "YouTuber",
    "Youtube",
    "YouTube",
    "實況主",
    "实况主",
    "KOL",
    "意見領袖",
    "意见领袖",
    "二伯",
    "遠端桌面",
    "飲料",
    "AD鈣奶",
    "AD钙奶",
    "ad calcium milk",
    "機器狗",
    "机器狗",
    "機械狗",
    "机械狗",
    "遮陽傘",
    "遮阳伞",
    "營造",
    "营造",
    "飲料店",
    "飲用水",
    "手搖飲",
    "手搖飲料",
    "茶飲",
    "奶茶",
    "紅茶",
    "咖啡",
    "連鎖飲料",
    "反罷免",
    "歌手",
    "馬來西亞歌手",
    "一日",
    "旅遊",
    "旅游",
    "旅行",
    "出國",
    "出国",
    "機票",
    "机票",
    "目的地",
    "國家",
    "国家",
    "風險",
    "风险",
    "水果飲",
    "綜合水果",
    "果汁",
    "蔬果汁",
    "蘋果汁",
    "濃縮汁",
    "漢堡",
    "汉堡",
    "餐車",
    "餐车",
    "環島餐車",
    "环岛餐车",
    "食用油",
    "油品",
    "中國油",
    "中国油",
    "中國製油品",
    "中国制油品",
    "贈品",
    "赠品",
    "中國製贈品",
    "中国制赠品",
    "包屁衣",
    "童裝",
    "童装",
    "嬰兒用品",
    "婴儿用品",
    "mit",
    "100%mit",
    "台灣製",
    "台湾制",
    "台灣製造",
    "台湾制造",
    "大陸製",
    "大陆制",
    "海鮮",
    "沖繩餐廳",
    "沖縄餐廳",
    "蒸汽料理",
    "蒸気料理",
    "天理スタミナラーメン",
    "學甲",
    "学甲",
    "爐碴",
    "炉碴",
    "爐渣",
    "炉渣",
    "廢棄物",
    "废弃物",
    "中執委",
    "中执委",
    "民進黨",
    "民进党",
    "民主進步黨",
    "民主进步党",
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
