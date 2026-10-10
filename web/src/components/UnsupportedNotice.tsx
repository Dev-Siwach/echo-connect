import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { UnsupportedItem } from '@/shared/contracts';

const REASON_GUIDANCE: Record<string, string> = {
  large_appliance:
    'Large appliances (refrigerators, washing machines, ACs) require dedicated bulk transport or brand take-back programs and are not currently accepted at drop-off kiosks.',
  hazardous:
    'Hazardous materials (chemicals, lead-acid vehicle batteries, medicines) require specialized environmental disposal handling to prevent groundwater contamination.',
  out_of_scope:
    'This item is outside the scope of our current community reuse and e-waste collection pilot.',
  unclear:
    'We could not determine the proper route for this item based on the description provided.',
};

export interface UnsupportedNoticeProps {
  unsupportedItems: UnsupportedItem[];
}

export function UnsupportedNotice({ unsupportedItems }: UnsupportedNoticeProps) {
  if (!unsupportedItems || unsupportedItems.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Items not supported"
      className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5 mb-6 space-y-3"
    >
      <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm sm:text-base">
        <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" aria-hidden="true" />
        <span>Items requiring special handling or not supported in this pilot</span>
      </div>

      <ul className="space-y-2 text-xs sm:text-sm text-zinc-700">
        {unsupportedItems.map((item, index) => {
          const guidance =
            REASON_GUIDANCE[item.reason] ||
            'Please contact local municipal authorities for safe disposal options.';

          return (
            <li key={index} className="bg-white/80 rounded-lg p-3 border border-amber-100">
              <span className="font-semibold text-zinc-900 capitalize">{item.label}</span>
              <p className="mt-0.5 text-zinc-600">{guidance}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
