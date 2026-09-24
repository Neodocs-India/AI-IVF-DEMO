import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-mist">
      <Sidebar />
      <div className="pl-sidebar">
        <TopBar />
        <main className="max-w-content px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
