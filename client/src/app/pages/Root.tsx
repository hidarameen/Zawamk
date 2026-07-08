import { Outlet, useLocation } from 'react-router';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import PlayerBar from '../components/player/PlayerBar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { PlayerProvider } from '../contexts/PlayerContext';
import { AuthProvider } from '../contexts/AuthContext';
import { SidebarProvider, useSidebarState } from '../contexts/SidebarContext';

import { Toaster } from '../components/ui/sonner';

import SkipToContent from '../components/accessibility/SkipToContent';

function AppLayout() {
  const location = useLocation();
  const { isOpen } = useSidebarState();
  const isLandingPage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const showMainNav = !isLandingPage && !isAdminPage;

  const sidebarW = isOpen ? 'md:mr-64' : 'md:mr-16';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden">
      <div className="ambient-glow" />
      <SkipToContent />
      {showMainNav && (
        <>
          <Sidebar />
          <TopBar />
        </>
      )}

      <main
        id="main-content"
        className={
          isLandingPage
            ? ''
            : isAdminPage
            ? ''
            : `${sidebarW} mt-16 mb-24 p-4 md:p-6 transition-all duration-300`
        }
      >
        <Outlet />
      </main>

      {showMainNav && <PlayerBar />}
      <Toaster />
    </div>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      
        <AuthProvider>
          <PlayerProvider>
            <SidebarProvider>
              <AppLayout />
            </SidebarProvider>
          </PlayerProvider>
        </AuthProvider>
      
    </ThemeProvider>
  );
}
