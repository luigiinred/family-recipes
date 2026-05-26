export type ParsedRecipeStep = {
  uses: string[];
  instruction: string;
};

const USES_LINE = /^uses:\s*(.+)$/i;

/**
 * Steps may start with `Uses: olive oil · paprika` then a blank line, then the instruction.
 * Items are separated by middle dots (·).
 */
export function parseRecipeStep(text: string): ParsedRecipeStep {
  const trimmed = text.trim();
  if (!trimmed) return { uses: [], instruction: '' };

  const lines = trimmed.split(/\r?\n/);
  const first = lines[0] ?? '';
  const match = first.match(USES_LINE);
  if (!match) {
    return { uses: [], instruction: trimmed };
  }

  const uses = match[1]
    .split(/\s*·\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const instruction = lines.slice(1).join('\n').trim();
  return { uses, instruction };
}

export function formatRecipeStep(uses: string[], instruction: string): string {
  if (uses.length === 0) return instruction;
  return `Uses: ${uses.join(' · ')}\n\n${instruction}`;
}
