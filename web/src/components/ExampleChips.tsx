'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

const EXAMPLE_QUERIES = [
  "I'm moving: old laptop, 2 chargers & 3 bags of clothes",
  'Old phone with cracked screen, still boots up',
  'Dead AA batteries and a puffed power bank',
  'Purana mixer kharab ho gaya hai',
  'Books, stationery and a wooden study table',
];

export interface ExampleChipsProps {
  onSelect?: (query: string) => void;
  className?: string;
}

export function ExampleChips({ onSelect, className = '' }: ExampleChipsProps) {
  const router = useRouter();

  const handleSelect = (query: string) => {
    if (onSelect) {
      onSelect(query);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}&loc=sector-15`);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-brand-700" />
        <span>Try these example requests</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((query, idx) => (
          <Chip
            key={idx}
            onClick={() => handleSelect(query)}
            className="text-xs bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-900"
          >
            &ldquo;{query}&rdquo;
          </Chip>
        ))}
      </div>
    </div>
  );
}
