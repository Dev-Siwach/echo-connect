import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, RefreshCw, HeartHandshake, Zap, Recycle } from 'lucide-react';
import type { SearchResultRoute } from '@/shared/contracts';
import { ProviderCard } from '@/components/ProviderCard';
import { ROUTE_METADATA, Route } from '@/shared/taxonomy';

const ROUTE_ICONS: Record<Route, React.ComponentType<{ className?: string }>> = {
  repair: Wrench,
  resell_reuse: RefreshCw,
  donate: HeartHandshake,
  ewaste_collection: Zap,
  recycle: Recycle,
};

export interface RouteGroupProps {
  routeResult: SearchResultRoute;
  className?: string;
}

export function RouteGroup({ routeResult, className = '' }: RouteGroupProps) {
  const [showUnverified, setShowUnverified] = useState(false);
  const route = routeResult.route as Route;
  const meta = ROUTE_METADATA[route];
  const IconComponent = ROUTE_ICONS[route] || Wrench;

  const verified = routeResult.providers || [];
  const unverified = routeResult.unverifiedProviders || [];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Route Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-100/70 text-brand-800">
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm sm:text-base">
              {routeResult.label || meta?.label || route}
            </h3>
            {meta?.meaning && (
              <p className="text-xs text-zinc-500">{meta.meaning}</p>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
          Priority #{meta?.order || '-'}
        </span>
      </div>

      {/* Verified Providers */}
      {verified.length > 0 ? (
        <div className="space-y-3">
          {verified.map((prov) => (
            <ProviderCard key={prov.providerId} provider={prov} />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-50 rounded-xl p-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-200">
          No verified {routeResult.label.toLowerCase()} services available in this area yet.
        </div>
      )}

      {/* Collapsed Unconfirmed Listings (FR-06, FR-11) */}
      {unverified.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowUnverified(!showUnverified)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            aria-expanded={showUnverified}
          >
            {showUnverified ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>
              {showUnverified ? 'Hide' : 'Show'} {unverified.length} unconfirmed listing{unverified.length === 1 ? '' : 's'} (unverified)
            </span>
          </button>

          {showUnverified && (
            <div className="mt-3 space-y-3 pl-2 sm:pl-3 border-l-2 border-zinc-200">
              <p className="text-[11px] text-zinc-500 mb-2">
                ⚠ Note: The following listings were submitted by community members but have not yet been directly verified by phone or inspection.
              </p>
              {unverified.map((prov) => (
                <ProviderCard key={prov.providerId} provider={prov} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
