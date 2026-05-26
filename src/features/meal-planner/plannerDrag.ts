import type { DragEvent } from 'react';
import { PLANNER_DRAG_TYPE, type PlannerDragPayload } from './types';

export function readPlannerDrag(event: DragEvent): PlannerDragPayload | null {
  const raw = event.dataTransfer.getData(PLANNER_DRAG_TYPE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PlannerDragPayload;
    if (typeof parsed.slug === 'string' && parsed.slug.length > 0) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function writePlannerDrag(event: DragEvent, payload: PlannerDragPayload): void {
  event.dataTransfer.setData(PLANNER_DRAG_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = 'move';
}

export function allowPlannerDrop(event: DragEvent): void {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}
