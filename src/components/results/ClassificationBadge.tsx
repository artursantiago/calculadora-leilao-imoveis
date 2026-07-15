import { COLOR_CLASSES } from '../../constants';
import type { Classification } from '../../types';

export function ClassificationBadge({ classification }: { classification: Classification }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ' +
        COLOR_CLASSES[classification.color]
      }
    >
      <span>{classification.emoji}</span>
      {classification.label}
    </span>
  );
}
