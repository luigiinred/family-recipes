import { describe, expect, it } from 'vitest';
import {
  applyRecipeNotes,
  extractNotesFromDescription,
  isRecipeNoteStep,
  splitStepsAndNotes,
} from './recipe-notes.mjs';

describe('isRecipeNoteStep', () => {
  it('flags Note: prefixed commentary', () => {
    expect(
      isRecipeNoteStep(
        'Note: Tilapia can taste muddy — go heavy on spices.',
      ),
    ).toBe(true);
  });

  it('keeps real instructions', () => {
    expect(
      isRecipeNoteStep(
        'Bake until fish flakes easily, about 20 minutes. Serve with cilantro.',
      ),
    ).toBe(false);
  });
});

describe('splitStepsAndNotes', () => {
  it('moves Note steps into notes field', () => {
    const { steps, notes } = splitStepsAndNotes([
      'Preheat oven to 425°F.',
      'Whisk sauce in a bowl.',
      'Note: Use wild-caught fish if possible.',
    ]);
    expect(steps).toHaveLength(2);
    expect(notes).toMatch(/wild-caught fish/i);
  });
});

describe('extractNotesFromDescription', () => {
  it('pulls a TIPS block from YouTube description', () => {
    const notes = extractNotesFromDescription(`RECIPE
INGREDIENTS: ...
TIPS:
Fish can taste muddy — season boldly.
⏱️ Chapters`);
    expect(notes[0]).toMatch(/muddy/i);
  });
});

describe('applyRecipeNotes', () => {
  it('drops note timed steps', () => {
    const result = applyRecipeNotes({
      steps: ['Cook fish.', 'Note: Non-stick pan helps.'],
      timedSteps: [
        { text: 'Cook fish.', startSeconds: 0 },
        { text: 'Note: Non-stick pan helps.', startSeconds: 60 },
      ],
    });
    expect(result.steps).toHaveLength(1);
    expect(result.timedSteps).toHaveLength(1);
    expect(result.notes).toMatch(/non-stick/i);
  });
});
