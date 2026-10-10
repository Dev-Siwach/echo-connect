import React from 'react';
import { ITEM_TYPES } from '@/shared/taxonomy';
import { BrowseItemClient } from '@/components/BrowseItemClient';

export function generateStaticParams() {
  return ITEM_TYPES.map((itemType) => ({
    itemType,
  }));
}

interface PageProps {
  params: {
    itemType: string;
  };
}

export default function ItemTypeBrowsePage({ params }: PageProps) {
  return <BrowseItemClient itemType={params.itemType} />;
}
