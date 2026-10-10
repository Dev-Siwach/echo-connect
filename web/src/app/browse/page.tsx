import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu, Recycle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ITEM_TYPES, ITEM_TYPE_METADATA, ItemType } from '@/shared/taxonomy';

export default function BrowsePage() {
  const electronicsTypes = ITEM_TYPES.filter(
    (t) => ITEM_TYPE_METADATA[t]?.category === 'electronics'
  );
  const reuseTypes = ITEM_TYPES.filter(
    (t) => ITEM_TYPE_METADATA[t]?.category === 'reuse'
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <span className="text-xs text-zinc-500 font-medium">Non-AI Directory</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Browse Verified Services
        </h1>
        <p className="text-sm text-zinc-600">
          Select an item category below to see authorized drop-off points, repair workshops, and donation centers in Faridabad.
        </p>
      </div>

      {/* Electronics Category */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <Cpu className="w-5 h-5 text-brand-700" />
          <h2 className="text-lg font-bold text-zinc-900">Electronics & Batteries</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {electronicsTypes.map((type) => {
            const meta = ITEM_TYPE_METADATA[type];
            return (
              <Link key={type} href={`/browse/${type}`}>
                <Card className="h-full hover:border-brand-300 hover:shadow-md transition-all group p-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm sm:text-base font-semibold group-hover:text-brand-800">
                      {meta?.label || type}
                    </CardTitle>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-700 transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardContent className="p-0 pt-2 text-xs text-zinc-500">
                    Includes: {meta?.includes}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Reuse & Donation Category */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
          <Recycle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-zinc-900">Reuse & Donation</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reuseTypes.map((type) => {
            const meta = ITEM_TYPE_METADATA[type];
            return (
              <Link key={type} href={`/browse/${type}`}>
                <Card className="h-full hover:border-brand-300 hover:shadow-md transition-all group p-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm sm:text-base font-semibold group-hover:text-brand-800">
                      {meta?.label || type}
                    </CardTitle>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-700 transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardContent className="p-0 pt-2 text-xs text-zinc-500">
                    Includes: {meta?.includes}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
