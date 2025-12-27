'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';

export default function CmsPreviewPage({
  params,
}: {
  params: { locale: string };
}) {
  useEffect(() => {
    // preview init
  }, []);

  if (!params?.locale) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A3F62' }}>
      {/* Preview Banner */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 50,
        }}
      >
        Preview Mode
      </div>
    </div>
  );
}


