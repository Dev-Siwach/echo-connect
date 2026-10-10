import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function SampleDataBanner() {
  return (
    <div
      role="status"
      className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 mb-6"
    >
      <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" aria-hidden="true" />
      <span>
        <strong>Demo notice:</strong> Results contain fictional sample records (<code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">isSample: true</code>) for demonstration. Real listings are verified by human contributors.
      </span>
    </div>
  );
}
