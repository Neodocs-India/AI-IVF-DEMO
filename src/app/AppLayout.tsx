import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toaster } from '@/components/Toaster';
import { CriticalBanner, GuidedTour, ShortcutsPanel, useDemoKeys } from './DemoControls';
import { useDemo } from '@/store/demo';

export function AppLayout() {
  const { pathname } = useLocation();
  const epoch = useDemo((s) => s.epoch);
  useDemoKeys();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-mist">
      <Sidebar />
      <div className="pl-sidebar">
        <div className="sticky top-0 z-20">
          <TopBar />
          <CriticalBanner />
        </div>
        {/* Re-key on reset so every screen's local state starts fresh */}
        <main key={epoch} className="max-w-content px-8 py-8">
          <Outlet />
        </main>
      </div>
      <Toaster />
      <ShortcutsPanel />
      <GuidedTour />
    </div>
  );
}
