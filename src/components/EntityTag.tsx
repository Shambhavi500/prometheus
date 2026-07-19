'use client';

import { useWorkspace } from '@/core/state/workspace';

/**
 * EntityTag — a node from the Knowledge Graph, traversable from anywhere.
 * Click opens the ContextDrawer. Low-confidence AI resolution renders a
 * dashed underline (06_COMPONENTS §1, 04_INTERACTION §4).
 */
export function EntityTag({
  id,
  tag,
  label,
  uncertain = false,
}: {
  id: string;
  tag: string;
  label?: string;
  uncertain?: boolean;
}) {
  const openDrawer = useWorkspace((s) => s.openDrawer);
  return (
    <button
      type="button"
      className={`etag${uncertain ? ' etag--uncertain' : ''}`}
      aria-label={label ?? `Open context for ${tag}`}
      title={uncertain ? `${tag} — resolved by entity resolution below the confidence threshold` : undefined}
      onClick={(e) => {
        e.stopPropagation();
        openDrawer(id, e.currentTarget);
      }}
    >
      {tag}
    </button>
  );
}
