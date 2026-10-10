'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { search, ApiClientError } from '@/lib/api';
import type { SearchResponse, InterpretedItem } from '@/shared/contracts';
import { SearchBox } from '@/components/SearchBox';
import { InterpretationChips } from '@/components/InterpretationChips';
import { UnsupportedNotice } from '@/components/UnsupportedNotice';
import { ItemResultSection } from '@/components/ItemResultSection';
import { SampleDataBanner } from '@/components/SampleDataBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const localityId = searchParams.get('loc') || 'sector-15';
  const mockParam = searchParams.get('mock');
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (manualItems?: InterpretedItem[]) => {
      if (!query && !manualItems) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const reqPayload = manualItems
          ? {
              items: manualItems,
              localityId: localityId || undefined,
              lat: latStr ? parseFloat(latStr) : undefined,
              lng: lngStr ? parseFloat(lngStr) : undefined,
            }
          : {
              query,
              localityId: localityId || undefined,
              lat: latStr ? parseFloat(latStr) : undefined,
              lng: lngStr ? parseFloat(lngStr) : undefined,
            };

        const res = await search(reqPayload, mockParam);
        setData(res);
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Failed to fetch recommendations. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [query, localityId, mockParam, latStr, lngStr]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for editable chips (FR-12): updates item and re-fetches via items payload
  const handleUpdateItem = (index: number, updatedItem: InterpretedItem) => {
    if (!data) return;
    const newItems = [...data.interpretation.items];
    newItems[index] = updatedItem;
    fetchData(newItems);
  };

  // Determine if any provider across results is sample data
  const hasSampleData = data?.results.some((item) =>
    item.routes.some(
      (r) =>
        r.providers.some((p) => p.isSample) ||
        r.unverifiedProviders.some((p) => p.isSample)
    )
  );

  return (
    <div className="space-y-6">
      {/* Back to search & compact search header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New search</span>
        </Link>

        {data?.meta && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {data.meta.classifier === 'fallback' && (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                <Info className="w-3 h-3" />
                <span>Basic mode active</span>
              </span>
            )}
            <span>Faridabad</span>
            <span>·</span>
            <span>{data.meta.latencyMs} ms</span>
          </div>
        )}
      </div>

      {/* Query Banner */}
      {query && (
        <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 text-xs sm:text-sm text-zinc-700 flex items-center justify-between gap-2 shadow-sm">
          <div>
            <span className="text-zinc-400 font-medium">Query: </span>
            <span className="font-semibold text-zinc-900">&ldquo;{query}&rdquo;</span>
          </div>
          <button
            onClick={() => fetchData()}
            title="Refresh results"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sample Data Banner */}
      {hasSampleData && <SampleDataBanner />}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-6" aria-busy="true" aria-label="Loading recommendations">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-8 w-36 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-base font-bold text-red-900">Unable to load recommendations</h2>
          <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchData()} className="mt-2">
            Try again
          </Button>
        </div>
      )}

      {/* Clarifying Question UI (FR-15) */}
      {!loading && !error && data?.interpretation.clarifyingQuestion && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-amber-950">
                Could you clarify what you have?
              </h2>
              {/* Plain text rendering for AI generated clarifying question */}
              <p className="text-sm text-amber-900">
                {data.interpretation.clarifyingQuestion}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
              Suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip
                onClick={() =>
                  router.push(
                    `/search?q=${encodeURIComponent('Old laptop and smartphone')}&loc=${localityId}`
                  )
                }
              >
                Old laptop & smartphone
              </Chip>
              <Chip
                onClick={() =>
                  router.push(
                    `/search?q=${encodeURIComponent('Bags of clothes in good condition')}&loc=${localityId}`
                  )
                }
              >
                Bags of reusable clothes
              </Chip>
              <Chip
                onClick={() =>
                  router.push(
                    `/search?q=${encodeURIComponent('Household batteries and power bank')}&loc=${localityId}`
                  )
                }
              >
                Household batteries & power banks
              </Chip>
            </div>
          </div>
        </div>
      )}

      {/* Main Results View */}
      {!loading && !error && data && (
        <>
          {/* "We understood" Chips */}
          <InterpretationChips
            items={data.interpretation.items}
            locationHint={data.interpretation.locationHint}
            onUpdateItem={handleUpdateItem}
          />

          {/* Unsupported Items Notice */}
          <UnsupportedNotice
            unsupportedItems={data.interpretation.unsupportedItems}
          />

          {/* Item Result Sections */}
          {data.results.length > 0 ? (
            <div className="space-y-6">
              {data.results.map((itemResult, idx) => (
                <ItemResultSection key={idx} itemResult={itemResult} />
              ))}
            </div>
          ) : (
            /* Only unsupported items or empty search */
            !data.interpretation.clarifyingQuestion && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-3">
                <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-semibold text-zinc-800 text-base">
                  No recognized recyclable or reusable items found
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                  Try describing specific electronics, household appliances, clothes, books or furniture.
                </p>
                <div className="pt-2">
                  <Link href="/" className="text-xs font-semibold text-brand-700 underline">
                    Return to home search &rarr;
                  </Link>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-zinc-500 text-sm">
          Loading search parameters...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
