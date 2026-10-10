'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from 'lucide-react';
import { getProviders, ApiClientError } from '@/lib/api';
import type { ProvidersResponse } from '@/shared/contracts';
import { ProviderCard } from '@/components/ProviderCard';
import { SampleDataBanner } from '@/components/SampleDataBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ITEM_TYPE_METADATA, ItemType } from '@/shared/taxonomy';
import localitiesData from '@/shared/localities.faridabad.json';

export interface BrowseItemClientProps {
  itemType: string;
}

export function BrowseItemClient({ itemType }: BrowseItemClientProps) {
  const meta = ITEM_TYPE_METADATA[itemType as ItemType];
  const [localityId, setLocalityId] = useState<string>('sector-15');
  const [data, setData] = useState<ProvidersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnverified, setShowUnverified] = useState(false);

  const fetchCategoryProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProviders({
        itemType,
        localityId: localityId || undefined,
      });
      setData(res);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to load providers for this item.');
      }
    } finally {
      setLoading(false);
    }
  }, [itemType, localityId]);

  useEffect(() => {
    fetchCategoryProviders();
  }, [fetchCategoryProviders]);

  const verified = data?.providers || [];
  const unverified = data?.unverifiedProviders || [];
  const hasSampleData =
    verified.some((p) => p.isSample) || unverified.some((p) => p.isSample);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All categories</span>
        </Link>
        <span className="text-xs text-zinc-500 font-medium">Direct Directory</span>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          {meta?.label || itemType}
        </h1>
        {meta?.includes && (
          <p className="text-xs sm:text-sm text-zinc-600">
            Accepts: {meta.includes}
          </p>
        )}
      </div>

      {/* Locality Selector */}
      <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-zinc-200 text-xs sm:text-sm shadow-sm">
        <span className="text-zinc-500 font-medium">Filter by area:</span>
        <select
          value={localityId}
          onChange={(e) => setLocalityId(e.target.value)}
          className="bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 text-zinc-800 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-700"
        >
          {localitiesData.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name.replace('TODO: ', '')}
            </option>
          ))}
        </select>
      </div>

      {hasSampleData && <SampleDataBanner />}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-base font-bold text-red-900">Failed to load services</h2>
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchCategoryProviders()}>
            Try again
          </Button>
        </div>
      )}

      {/* Provider List */}
      {!loading && !error && (
        <div className="space-y-6">
          {verified.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Verified Services ({verified.length})
              </h2>
              {verified.map((prov) => (
                <ProviderCard key={prov.providerId} provider={prov} />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-semibold text-zinc-800 text-sm sm:text-base">
                No verified services found for this category in Faridabad yet
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                We are actively adding and verifying local centers.
              </p>
              <div className="pt-2">
                <Link
                  href="/about#suggest"
                  className="text-xs font-semibold text-brand-700 underline"
                >
                  Suggest a service &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Unverified Section */}
          {unverified.length > 0 && (
            <div className="pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setShowUnverified(!showUnverified)}
                className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors p-1 rounded"
              >
                {showUnverified ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {showUnverified ? 'Hide' : 'Show'} {unverified.length} unconfirmed listing{unverified.length === 1 ? '' : 's'}
                </span>
              </button>

              {showUnverified && (
                <div className="mt-3 space-y-3 pl-2 sm:pl-3 border-l-2 border-zinc-200">
                  <p className="text-[11px] text-zinc-500 mb-2">
                    ⚠ These listings have not yet been directly verified by telephone or on-site visit.
                  </p>
                  {unverified.map((prov) => (
                    <ProviderCard key={prov.providerId} provider={prov} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
