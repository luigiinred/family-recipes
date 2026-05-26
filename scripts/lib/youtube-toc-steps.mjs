const TOC_LABEL = /^(intro|ingredients|outro)$/i;

const COOKING_VERB =
  /\b(add|mix|stir|pour|combine|whisk|toss|chop|dice|slice|heat|simmer|bake|fry|cook|serve|cover|refrigerat|season|drain|blend|make)\b/i;

/**
 * YouTube chapter titles used as a table of contents (not cookable steps).
 * @param {{ text: string, startSeconds: number }[]} timedSteps
 */
export function isTableOfContentsSteps(timedSteps) {
  if (!timedSteps?.length) return false;

  if (timedSteps.some((s) => TOC_LABEL.test(s.text.trim()))) {
    return true;
  }

  const allShort = timedSteps.every((s) => s.text.trim().length < 48);
  const noneCooking = timedSteps.every((s) => !COOKING_VERB.test(s.text));

  return allShort && noneCooking;
}
