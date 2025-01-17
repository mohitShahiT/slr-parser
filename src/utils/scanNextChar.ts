export function scanNextChar(
  rule: string,
  prefixIndex: number,
  symbolIndex: number
) {
  const prefix = rule[prefixIndex];
  const beforeDot = rule.slice(0, prefixIndex); // Part before `•`
  const idPart = rule.slice(prefixIndex + 1, symbolIndex + 1); // `id` part (e.g., "abc123")
  const afterId = rule.slice(symbolIndex + 1); // Part after `id`

  // Reconstruct the string with `•` moved to the end of symbol
  const newRule = beforeDot + idPart + prefix + afterId;
  return newRule;
}
