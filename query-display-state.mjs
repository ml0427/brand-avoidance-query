export function shouldRenderResults({ query, filters = {}, blankQuerySubmitted = false }) {
  const hasQuery = String(query ?? "").trim().length > 0;
  const hasActiveFilter = Object.values(filters).some(
    (value) => String(value ?? "").trim().length > 0,
  );

  return hasQuery || hasActiveFilter || blankQuerySubmitted;
}
