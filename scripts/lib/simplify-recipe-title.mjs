/**
 * Turn noisy source titles (YouTube, blogs) into short cookbook-style names.
 * Example: "25 MIN CHICKEN TORTILLA SOUP (So Much Better…) | Weeknighting"
 *       → "Chicken Tortilla Soup"
 */

const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

function toTitleCase(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function isMostlyUppercase(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (!letters.length) return false;
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return upper / letters.length > 0.6;
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function simplifyRecipeTitle(raw) {
  if (!raw || typeof raw !== 'string') return 'Untitled Recipe';

  let title = raw.trim();

  // Channel / series suffixes: "| Weeknighting", "| The Mediterranean Dish"
  while (/\s*\|\s*[^|]+$/.test(title)) {
    title = title.replace(/\s*\|\s*[^|]+$/, '').trim();
  }

  // Leading duration: "25 MIN", "20-Minute", "1 Hour"
  title = title
    .replace(
      /^\d+\s*[-\s]?(?:min(?:ute)?s?|mins?|hr|hrs|hours?)\b\s*/i,
      '',
    )
    .trim();

  // Clickbait or alternate titles in parentheses
  title = title.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

  // Trailing separators left after stripping
  title = title.replace(/\s*[-–—:|]+\s*$/g, '').trim();
  title = title.replace(/\s+/g, ' ');

  if (isMostlyUppercase(title)) {
    title = toTitleCase(title);
  }

  return title || 'Untitled Recipe';
}
