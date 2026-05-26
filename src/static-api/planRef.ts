export type PlanRef =
  | { kind: 'recipe'; slug: string }
  | { kind: 'idea'; slug: string };

const IDEA_PREFIX = 'idea:';

export function encodePlanRef(ref: PlanRef): string {
  return ref.kind === 'idea' ? `${IDEA_PREFIX}${ref.slug}` : ref.slug;
}

export function decodePlanRef(value: string): PlanRef {
  if (value.startsWith(IDEA_PREFIX)) {
    return { kind: 'idea', slug: value.slice(IDEA_PREFIX.length) };
  }
  return { kind: 'recipe', slug: value };
}

export function isFoodIdeaPlanRef(value: string): boolean {
  return value.startsWith(IDEA_PREFIX);
}
