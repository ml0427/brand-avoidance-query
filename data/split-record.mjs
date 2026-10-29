import { record } from "./record-helpers.mjs";

const own = (value, key) => Object.hasOwn(value, key);
const REQUIRED = ["country", "categories", "avoidReasons", "confidence", "status", "sources", "aiNotes", "lastReviewed"];

/** Explicit members become independent records; lookup keys never leak between members. */
export function splitRecord(group, members) {
  if (!group?.id || !Array.isArray(members) || members.length < 2) {
    throw new TypeError("A split needs a source group and at least two explicit members");
  }
  const ids = new Set();
  return members.map((member) => {
    if (!member || typeof member.name !== "string" || !member.name.trim() ||
        typeof member.summary !== "string" || !member.summary.trim()) {
      throw new TypeError(`Each member of ${group.id} needs its own name and scoped summary`);
    }
    for (const field of REQUIRED) {
      if (own(member, field) && member[field] === undefined) {
        throw new TypeError(`Undefined ${field} would hide shared metadata in ${group.id}: ${member.name}`);
      }
    }
    // Code points provide stable IDs without guessing romanizations or relying on row order.
    const suffix = Array.from(member.name).map((char) => char.codePointAt(0).toString(16)).join("-");
    const id = member.id ?? `${group.id}-${suffix}`;
    if (ids.has(id)) throw new Error(`Duplicate split member ID: ${id}`);
    ids.add(id);
    return record({
      ...group,
      ...member,
      id,
      aliases: member.aliases ?? [],
      identifiers: member.identifiers ?? [],
      aiNotes: `由群組「${group.name}」（${group.id}）拆成獨立對象；共用來源不代表其他成員的言論、行為或責任適用本對象。${own(member, "aiNotes") ? member.aiNotes : group.aiNotes ?? ""}`,
    });
  });
}
