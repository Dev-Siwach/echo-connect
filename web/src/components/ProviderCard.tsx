import React from 'react';
import { Phone, MessageCircle, Navigation, ExternalLink, MapPin, Tag } from 'lucide-react';
import type { ProviderCard as ProviderCardType } from '@/shared/contracts';
import { TrustBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ITEM_TYPE_METADATA, ItemType } from '@/shared/taxonomy';

const SERVICE_MODE_LABELS: Record<string, string> = {
  drop_off: 'Drop-off',
  pickup: 'Home pickup',
  online_booking: 'Online booking',
};

const COST_LABELS: Record<string, string> = {
  free: 'Free',
  paid: 'Paid',
  pays_you: 'Pays you / buyback',
  varies: 'Price varies',
  unknown: 'Unknown cost',
};

export interface ProviderCardProps {
  provider: ProviderCardType;
  className?: string;
}

export function ProviderCard({ provider, className = '' }: ProviderCardProps) {
  // Clean phone number for WhatsApp wa.me link (digits only, e.g. 919876543210)
  const whatsappDigits = provider.whatsapp
    ? provider.whatsapp.replace(/\D/g, '')
    : null;

  // Directions URL: mapsUrl or Google Maps search query from lat,lng
  const directionsUrl =
    provider.mapsUrl ||
    (provider.lat != null && provider.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${provider.lat},${provider.lng}`
      : null);

  const costLabel =
    COST_LABELS[provider.cost as keyof typeof COST_LABELS] || provider.cost;

  return (
    <Card className={`transition-shadow hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
        <div>
          <CardTitle as="h4" className="text-base sm:text-lg font-bold text-zinc-900">
            {provider.name}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <span>{provider.address}</span>
            </span>
            {provider.distanceKm != null && (
              <span className="font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                {provider.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <TrustBadge verification={provider.verification} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-700">{provider.description}</p>

        {/* Accepted Items & Notes */}
        <div className="bg-zinc-50 rounded-lg p-2.5 text-xs border border-zinc-100 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <Tag className="w-3 h-3 text-zinc-400 flex-shrink-0" />
            <strong className="text-zinc-700">Accepts:</strong>
            <span className="text-zinc-600">
              {provider.acceptedItemTypes
                .map((type) => ITEM_TYPE_METADATA[type as ItemType]?.label || type)
                .join(', ')}
            </span>
          </div>
          {provider.acceptanceNotes && (
            <div className="text-zinc-600 italic">
              Note: {provider.acceptanceNotes}
            </div>
          )}
        </div>

        {/* Details: Cost, Modes, Hours */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
          <div>
            <span className="text-zinc-400">Cost: </span>
            <span className="font-medium text-zinc-800">{costLabel}</span>
          </div>
          <div>
            <span className="text-zinc-400">Service: </span>
            <span className="font-medium text-zinc-800">
              {provider.serviceModes
                .map((m) => SERVICE_MODE_LABELS[m as keyof typeof SERVICE_MODE_LABELS] || m)
                .join(', ')}
            </span>
          </div>
          {provider.hours && (
            <div>
              <span className="text-zinc-400">Hours: </span>
              <span className="font-medium text-zinc-800">{provider.hours}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Phone, WhatsApp, Directions, Website */}
        <div className="pt-2 flex flex-wrap gap-2 border-t border-zinc-100">
          {provider.phone && (
            <a
              href={`tel:${provider.phone}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
              aria-label={`Call ${provider.name}`}
            >
              <Phone className="w-4 h-4 text-brand-700" aria-hidden="true" />
              <span>Call</span>
            </a>
          )}

          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
              aria-label={`WhatsApp ${provider.name}`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          )}

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
              aria-label={`Get directions to ${provider.name}`}
            >
              <Navigation className="w-4 h-4 text-sky-700" aria-hidden="true" />
              <span>Directions</span>
            </a>
          )}

          {provider.website && (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 ml-auto"
              aria-label={`Visit website of ${provider.name}`}
            >
              <span>Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
