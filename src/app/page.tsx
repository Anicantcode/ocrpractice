'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-3">
        <img src="/morde-logo.png" alt="Morde Logo" className="h-7 w-auto object-contain" />
        <div className="w-5 h-5 border-2 border-neutral-300 border-t-[#E4022D] rounded-full animate-spin" />
      </div>
    </div>
  )
});

export default function HomePage() {
  return <App />;
}
