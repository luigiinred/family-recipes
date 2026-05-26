export const QUEUE_DRAG_TYPE = 'application/x-recipes-starred-queue';

export type QueueDragPayload = {
  slug: string;
  fromIndex: number;
};

export function readQueueDrag(event: DragEvent): QueueDragPayload | null {
  const raw = event.dataTransfer?.getData(QUEUE_DRAG_TYPE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QueueDragPayload;
    if (typeof parsed.slug !== 'string' || typeof parsed.fromIndex !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeQueueDrag(event: DragEvent, payload: QueueDragPayload): void {
  event.dataTransfer?.setData(QUEUE_DRAG_TYPE, JSON.stringify(payload));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

export function allowQueueDrop(event: DragEvent): void {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}
