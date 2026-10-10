import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';

export interface ChecklistProps {
  checklist: string[];
  itemLabel: string;
}

export function Checklist({ checklist, itemLabel }: ChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  if (!checklist || checklist.length === 0) return null;

  const toggleItem = (idx: number) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 text-left text-xs sm:text-sm font-medium text-emerald-900 hover:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <span>📋 Prep checklist for {itemLabel}</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
            {completedCount}/{checklist.length} done
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-emerald-700" />
        ) : (
          <ChevronDown className="w-4 h-4 text-emerald-700" />
        )}
      </button>

      {isOpen && (
        <div className="p-3.5 pt-0 border-t border-emerald-100/60 bg-white/70 space-y-2">
          <p className="text-xs text-zinc-500 mb-2">
            Complete these recommended preparation steps before visiting or donating:
          </p>
          <ul className="space-y-1.5">
            {checklist.map((step, idx) => {
              const isDone = !!completed[idx];
              return (
                <li
                  key={idx}
                  onClick={() => toggleItem(idx)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors select-none text-xs sm:text-sm ${
                    isDone ? 'bg-emerald-50/80 text-emerald-800 line-through' : 'hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{step}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
