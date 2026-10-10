'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Locate, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import localitiesData from '@/shared/localities.faridabad.json';

export interface SearchBoxProps {
  initialQuery?: string;
  initialLocalityId?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBox({
  initialQuery = '',
  initialLocalityId = 'sector-15',
  className = '',
  autoFocus = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [localityId, setLocalityId] = useState(initialLocalityId);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported in browser');
      return;
    }

    setGeoStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus('Location attached');
      },
      () => {
        // Fallback silently to locality picker per FR-14
        setGeoStatus(null);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (trimmed.length < 3) {
      setValidationError('Please enter at least 3 characters to describe what you have.');
      return;
    }
    if (trimmed.length > 500) {
      setValidationError('Query is too long (maximum 500 characters allowed).');
      return;
    }

    setValidationError(null);

    const params = new URLSearchParams();
    params.set('q', trimmed);
    if (localityId) params.set('loc', localityId);
    if (geoCoords) {
      params.set('lat', geoCoords.lat.toString());
      params.set('lng', geoCoords.lng.toString());
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm space-y-3 ${className}`}
    >
      <div>
        <label htmlFor="search-input" className="block text-sm font-semibold text-zinc-900 mb-1.5">
          What unwanted items do you have?
        </label>
        <div className="relative">
          <textarea
            id="search-input"
            rows={3}
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="e.g., Moving out next week. I have an old laptop that won't boot, 2 chargers, and 3 bags of good clothes."
            className="w-full rounded-xl border border-zinc-300 p-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:border-brand-700 focus:ring-1 focus:ring-brand-700 outline-none resize-none"
          />
        </div>
        <div className="flex justify-between items-center text-xs text-zinc-400 mt-1 px-1">
          <span>English, Hindi or Hinglish</span>
          <span>{query.length}/500</span>
        </div>
        {validationError && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Locality & Location Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          <label htmlFor="locality-select" className="sr-only">
            Select locality
          </label>
          <select
            id="locality-select"
            value={localityId}
            onChange={(e) => setLocalityId(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-lg text-xs sm:text-sm text-zinc-800 p-2 font-medium focus:ring-1 focus:ring-brand-700 outline-none w-full sm:w-auto"
          >
            {localitiesData.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name.replace('TODO: ', '')}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleUseLocation}
            className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 p-2 rounded-lg font-medium transition-colors min-h-[38px] whitespace-nowrap"
            title="Use device GPS location"
          >
            <Locate className="w-3.5 h-3.5 text-brand-700" />
            <span>{geoStatus || 'Use GPS'}</span>
          </button>
        </div>

        <Button
          type="submit"
          size="md"
          className="w-full sm:w-auto gap-2 text-sm sm:text-base font-semibold"
        >
          <Search className="w-4 h-4" />
          <span>Find Actions</span>
        </Button>
      </div>
    </form>
  );
}
