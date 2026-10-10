import React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import type { SearchResultItem } from '@/shared/contracts';
import { RouteGroup } from '@/components/RouteGroup';
import { Checklist } from '@/components/Checklist';
import { ITEM_TYPE_METADATA, CONDITION_LABELS, ItemType, Condition } from '@/shared/taxonomy';

export interface ItemResultSectionProps {
  itemResult: SearchResultItem;
  className?: string;
}

export function ItemResultSection({ itemResult, className = '' }: ItemResultSectionProps) {
  const typeMeta = ITEM_TYPE_METADATA[itemResult.itemType as ItemType];
  const conditionLabel =
    CONDITION_LABELS[itemResult.condition as Condition] || itemResult.condition;

  // Check if any route has providers (verified or unverified)
  const totalProviders = itemResult.routes.reduce(
    (sum, r) => sum + (r.providers?.length || 0) + (r.unverifiedProviders?.length || 0),
    0
  );

  return (
    <section
      aria-labelledby={`item-heading-${itemResult.itemType}`}
      className={`bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 shadow-sm space-y-5 ${className}`}
    >
      {/* Item Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div>
          <h2
            id={`item-heading-${itemResult.itemType}`}
            className="text-lg sm:text-xl font-bold text-zinc-900"
          >
            {itemResult.label || typeMeta?.label || itemResult.itemType}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Condition: <span className="font-semibold text-zinc-700 capitalize">{conditionLabel}</span>
          </p>
        </div>
        <div className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full w-fit">
          Category: {typeMeta?.category === 'electronics' ? '⚡ Electronics' : '♻ Reuse & Donation'}
        </div>
      </div>

      {/* Prep Checklist (FR-13) */}
      {itemResult.checklist && itemResult.checklist.length > 0 && (
        <Checklist
          checklist={itemResult.checklist}
          itemLabel={itemResult.label || typeMeta?.label || itemResult.itemType}
        />
      )}

      {/* Route Groups */}
      {totalProviders > 0 ? (
        <div className="space-y-6">
          {itemResult.routes.map((routeRes) => (
            <RouteGroup key={routeRes.route} routeResult={routeRes} />
          ))}
        </div>
      ) : (
        /* Honest Empty State (FR-11) */
        <div className="bg-zinc-50 rounded-xl p-6 text-center space-y-3 border border-zinc-200">
          <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" aria-hidden="true" />
          <h3 className="font-semibold text-zinc-800 text-sm sm:text-base">
            We haven&apos;t verified a service for this in Faridabad yet
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
            Our database only lists human-verified drop-off points and registered facilities. If you know of a trustworthy shop or collection drive in this locality, please let us know.
          </p>
          <div className="pt-2">
            <Link
              href="/about#suggest"
              className="inline-flex items-center text-xs font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-4"
            >
              Suggest or report a service &rarr;
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
