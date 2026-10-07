import React, { useEffect, useState } from 'react';

export const DocumentPreview: React.FC<{ src: string; alt: string; className?: string; rotation?: number }> = ({ src, alt, className, rotation = 0 }) => {
  const [resolved, setResolved] = useState(src);
  const [isPdf, setIsPdf] = useState(src.toLowerCase().endsWith('.pdf'));
  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;
    if (!src.startsWith('/api/documents/')) { setResolved(src); setIsPdf(src.toLowerCase().endsWith('.pdf')); return; }
    const token = localStorage.getItem('morde_auth_token');
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((response) => { if (!response.ok) throw new Error('Unable to load source document'); return response.blob(); })
      .then((blob) => { objectUrl = URL.createObjectURL(blob); if (!cancelled) { setResolved(objectUrl); setIsPdf(blob.type === 'application/pdf'); } })
      .catch(() => { if (!cancelled) setResolved(''); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  if (!resolved) return <div className="text-sm text-neutral-500">Source document unavailable</div>;
  if (isPdf) return <iframe src={resolved} title={alt} className={className} style={{ width: '100%', height: '70vh', border: 0 }} />;
  return <img src={resolved} alt={alt} className={className} style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined }} />;
};
