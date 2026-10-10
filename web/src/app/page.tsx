import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Recycle } from 'lucide-react';
import { SearchBox } from '@/components/SearchBox';
import { ExampleChips } from '@/components/ExampleChips';
import { Chip } from '@/components/ui/Chip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ITEM_TYPES, ITEM_TYPE_METADATA, ItemType } from '@/shared/taxonomy';

export default function HomePage() {
  const electronicsTypes = ITEM_TYPES.filter(
    (t) => ITEM_TYPE_METADATA[t]?.category === 'electronics'
  );
  const reuseTypes = ITEM_TYPES.filter(
    (t) => ITEM_TYPE_METADATA[t]?.category === 'reuse'
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero Header */}
      <section className="text-center py-4 sm:py-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100/80 text-brand-900 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-700" />
          <span>Faridabad Pilot · Verified Drop-offs</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-tight max-w-2xl mx-auto leading-tight">
          Find the right next step for unwanted items
        </h1>
        <p className="text-zinc-600 max-w-lg mx-auto text-sm sm:text-base">
          Describe what you have in plain words. EcoConnect finds human-verified
          repair, donation, and certified e-waste facilities near you.
        </p>
      </section>

      {/* Hero Search Box */}
      <section aria-label="Search items" className="max-w-2xl mx-auto">
        <SearchBox autoFocus />
      </section>

      {/* Example Queries (FR-18) */}
      <section aria-label="Example searches" className="max-w-2xl mx-auto">
        <ExampleChips />
      </section>

      {/* Browse by Category (FR-09) */}
      <section aria-label="Browse categories" className="max-w-2xl mx-auto pt-4 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              Browse by Category
            </h2>
            <p className="text-xs text-zinc-500">
              Explore local verified services directly without AI
            </p>
          </div>
          <Link
            href="/browse"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>All categories</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Electronics Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-brand-700" />
            <span>Electronics & Batteries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {electronicsTypes.map((type) => (
              <Link key={type} href={`/browse/${type}`}>
                <Chip className="bg-white hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm">
                  {ITEM_TYPE_METADATA[type]?.label || type}
                </Chip>
              </Link>
            ))}
          </div>
        </div>

        {/* Reuse Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider">
            <Recycle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reuse & Donation</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reuseTypes.map((type) => (
              <Link key={type} href={`/browse/${type}`}>
                <Chip className="bg-white hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm">
                  {ITEM_TYPE_METADATA[type]?.label || type}
                </Chip>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency Featurettes */}
      <section className="max-w-2xl mx-auto pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-white p-4">
          <ShieldCheck className="w-5 h-5 text-brand-700 mb-2" />
          <h3 className="font-semibold text-zinc-900 text-sm">Human Verified</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Every service is verified by direct phone call or official SPCB roster.
          </p>
        </Card>
        <Card className="bg-white p-4">
          <Recycle className="w-5 h-5 text-emerald-700 mb-2" />
          <h3 className="font-semibold text-zinc-900 text-sm">Waste Hierarchy</h3>
          <p className="text-xs text-zinc-500 mt-1">
            We prioritize repair and donation before safe e-waste and material recycling.
          </p>
        </Card>
        <Card className="bg-white p-4">
          <Sparkles className="w-5 h-5 text-sky-700 mb-2" />
          <h3 className="font-semibold text-zinc-900 text-sm">Amazon Bedrock</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Interprets multi-item and Hinglish messages into structured action paths.
          </p>
        </Card>
      </section>
    </div>
  );
}
