import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

export default function RootLayout() {
  const { sidebarOpen, sidebarMobile } = useSelector((s) => s.ui);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarMobile && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }}
        />
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 relative z-10 ${
          sidebarOpen ? 'lg:ml-[17.5rem]' : 'lg:ml-[5rem]'
        }`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8" style={{ animation: 'fadeIn 0.3s ease' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
