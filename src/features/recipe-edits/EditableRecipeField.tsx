import { useEffect, useId, useState, type ReactNode } from 'react';
import { Button, Stack } from '@/design-system/primitives';
import type { RecipeAiNotes } from './types';
import styles from './EditableRecipeField.module.css';

type Props = {
  label: string;
  editorMode: boolean;
  multiline?: boolean;
  value: string;
  aiNoteKey?: keyof RecipeAiNotes;
  initialAiNote?: string;
  onSave: (value: string, aiNote: string) => void;
  children: ReactNode;
};

export function EditableRecipeField({
  label,
  editorMode,
  multiline = false,
  value,
  aiNoteKey,
  initialAiNote = '',
  onSave,
  children,
}: Props) {
  const formId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [aiNote, setAiNote] = useState(initialAiNote);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
      setAiNote(initialAiNote);
    }
  }, [value, initialAiNote, isEditing]);

  if (!editorMode) {
    return <>{children}</>;
  }

  if (isEditing) {
    const Input = multiline ? 'textarea' : 'input';
    return (
      <form
        className={styles.form}
        aria-label={`Edit ${label}`}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft, aiNote);
          setIsEditing(false);
        }}
      >
        <label className={styles.label} htmlFor={`${formId}-value`}>
          {label}
          <Input
            id={`${formId}-value`}
            className={multiline ? styles.textarea : styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={multiline ? 6 : undefined}
            autoFocus
          />
        </label>
        {aiNoteKey ? (
          <label className={styles.aiLabel} htmlFor={`${formId}-ai`}>
            AI note (optional)
            <textarea
              id={`${formId}-ai`}
              className={styles.textarea}
              value={aiNote}
              onChange={(e) => setAiNote(e.target.value)}
              placeholder="How Cursor should change this in recipes.json"
              rows={2}
            />
          </label>
        ) : null}
        <Stack direction="row" gap="sm" className={styles.actions}>
          <Button type="submit">Save</Button>
          <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </Stack>
      </form>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.display}>{children}</div>
      <button
        type="button"
        className={styles.editButton}
        onClick={() => setIsEditing(true)}
        aria-label={`Edit ${label}`}
      >
        Edit
      </button>
    </div>
  );
}
