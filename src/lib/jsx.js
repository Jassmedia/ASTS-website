/**
 * WordPress prints a newline between list items; for inline-block items that
 * whitespace renders as a visible gap. JSX drops it, so lists that must match
 * the current site's layout interleave an explicit whitespace text node.
 */
export function withWhitespace(nodes) {
  const out = [];
  nodes.forEach((n, i) => {
    if (i) out.push('\n');
    out.push(n);
  });
  return out;
}
