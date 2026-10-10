import React from 'react';
import { Tag, MapPin, Edit2 } from 'lucide-react';
import type { InterpretedItem } from '@/shared/contracts';
import {
  ITEM_TYPES,
  CONDITIONS,
  ITEM_TYPE_METADATA,
  CONDITION_LABELS,
  ItemType,
  Condition,
} from '@/shared/taxonomy';

export interface InterpretationChipsProps {
  items: InterpretedItem[];
  locationHint?: string | null;
  onUpdateItem?: (index: number, updated: InterpretedItem) => void;
  className?: string;
}

export function InterpretationChips({
  items,
  locationHint,
  onUpdateItem,
  className = '',
}: InterpretationChipsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Understood items"
      className={`bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-sm space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-700" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">
            We understood
          </h2>
        </div>
        {locationHint && (
          <div className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full w-fit">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
            <span>Detected area: <strong>{locationHint}</strong></span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {items.map((item, idx) => {
          const typeMeta = ITEM_TYPE_METADATA[item.itemType as ItemType];
          const conditionLabel =
            CONDITION_LABELS[item.condition as Condition] || item.condition;

          return (
            <div
              key={idx}
              className="inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-3 py-2 bg-brand-50/70 border border-brand-200 rounded-lg text-xs sm:text-sm text-brand-950"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span>{item.label}</span>
                {item.quantity && item.quantity > 1 && (
                  <span className="bg-brand-200 text-brand-900 px-1.5 py-0.2 rounded-full text-xs font-bold">
                    &times;{item.quantity}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span className="text-zinc-400">·</span>
                {/* Editable Type dropdown if callback provided */}
                {onUpdateItem ? (
                  <select
                    value={item.itemType}
                    onChange={(e) =>
                      onUpdateItem(idx, {
                        ...item,
                        itemType: e.target.value as ItemType,
                      })
                    }
                    className="bg-white/80 border border-brand-300 rounded px-1.5 py-0.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-brand-700"
                    aria-label={`Change category for ${item.label}`}
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {ITEM_TYPE_METADATA[t]?.label || t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-medium text-zinc-700">
                    {typeMeta?.label || item.itemType}
                  </span>
                )}

                <span className="text-zinc-400">·</span>
                {/* Editable Condition dropdown if callback provided */}
                {onUpdateItem ? (
                  <select
                    value={item.condition}
                    onChange={(e) =>
                      onUpdateItem(idx, {
                        ...item,
                        condition: e.target.value as Condition,
                      })
                    }
                    className="bg-white/80 border border-brand-300 rounded px-1.5 py-0.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-brand-700"
                    aria-label={`Change condition for ${item.label}`}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {CONDITION_LABELS[c] || c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-white/80 px-1.5 py-0.5 rounded border border-brand-200 text-zinc-700">
                    {conditionLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {onUpdateItem && (
        <p className="text-[11px] text-zinc-500 italic">
          💡 You can change the category or condition above to adjust the recommendations.
        </p>
      )}
    </div>
  );
}
