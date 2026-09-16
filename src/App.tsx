import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { ToastContainer } from './components/ui/ToastContainer.tsx';
import { PixCheckoutModal } from './components/modals/PixCheckoutModal.tsx';

// Views
import { LandingView } from './views/LandingView.tsx';
import { LoginView } from './views/LoginView.tsx';
import { RegisterView } from './views/RegisterView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { CreateSiteView } from './views/CreateSiteView.tsx';
import { MySitesView } from './views/MySitesView.tsx';
import { ProspectingView } from './views/ProspectingView.tsx';
import { LeadsView } from './views/LeadsView.tsx';
import { ProposalsView } from './views/ProposalsView.tsx';
import { SalesView } from './views/SalesView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { HelpCenterView } from './views/HelpCenterView.tsx';
import { AdminPanelView } from './views/AdminPanelView.tsx';

import type { Plan } from './types/index.ts';
import { api } from './utils/apiClient.ts';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, loading, isAdmin, refreshUser } = useAuth();

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cross-view state passing
  const [prospectingDataForSite, setProspectingDataForSite] = useState<any>(null);
  const [leadForProposal, setLeadForProposal] = useState<any>(null);
  const [leadForSale, setLeadForSale] = useState<any>(null);

  // Plans modal state
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [selectedPlanForPix, setSelectedPlanForPix] = useState<Plan | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handler = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // If user logged in and currently on auth/landing views, go straight to dashboard
        if (currentView === 'landing' || currentView === 'login' || currentView === 'register') {
          setCurrentView('dashboard');
        }
      } else {
        // If not authenticated and trying to view internal pages, redirect to landing
        if (currentView !== 'landing' && currentView !== 'login' && currentView !== 'register') {
          setCurrentView('landing');
        }
      }
    }
  }, [isAuthenticated, loading, isAdmin]);

  const handleOpenPlansModal = async () => {
    try {
      const res = await api.getPlans();
      if (res.plans?.length) {
        setSelectedPlanForPix(res.plans[0]);
        setPixModalOpen(true);
      }
    } catch {}
  };

  const handleNavigate = (view: string) => {
    if (view === 'plans-modal') {
      handleOpenPlansModal();
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <p className="text-xs text-gray-400 font-medium tracking-wide">Carregando Vende AI...</p>
        </div>
      </div>
    );
  }

  // Public Unauthenticated Pages
  if (!isAuthenticated) {
    if (currentView === 'login') {
      return (
        <>
          <LoginView
            onSuccess={() => setCurrentView('dashboard')}
            onGoToRegister={() => setCurrentView('register')}
            onGoToLanding={() => setCurrentView('landing')}
          />
          <ToastContainer />
        </>
      );
    }

    if (currentView === 'register') {
      return (
        <>
          <RegisterView
            onSuccess={() => setCurrentView('dashboard')}
            onGoToLogin={() => setCurrentView('login')}
            onGoToLanding={() => setCurrentView('landing')}
          />
          <ToastContainer />
        </>
      );
    }

    return (
      <>
        <LandingView
          onGoToApp={() => setCurrentView('dashboard')}
          onGoToLogin={() => setCurrentView('login')}
          onGoToRegister={() => setCurrentView('register')}
        />
        <ToastContainer />
      </>
    );
  }

  // Authenticated Application Layout
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col antialiased selection:bg-purple-600 selection:text-white">
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={handleNavigate}
          currentView={currentView}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}

          {currentView === 'create-site' && (
            <CreateSiteView
              initialData={prospectingDataForSite}
              onSiteSaved={() => {
                setProspectingDataForSite(null);
                setCurrentView('my-sites');
              }}
            />
          )}

          {currentView === 'my-sites' && (
            <MySitesView onNavigateToCreate={() => setCurrentView('create-site')} />
          )}

          {currentView === 'prospecting' && (
            <ProspectingView
              onCreateSiteForCompany={(data) => {
                setProspectingDataForSite(data);
                setCurrentView('create-site');
              }}
              onGenerateProposalForCompany={(lead) => {
                setLeadForProposal(lead);
                setCurrentView('proposals');
              }}
            />
          )}

          {currentView === 'leads' && (
            <LeadsView
              onCreateSiteForLead={(lead) => {
                setProspectingDataForSite(lead);
                setCurrentView('create-site');
              }}
              onGenerateProposalForLead={(lead) => {
                setLeadForProposal(lead);
                setCurrentView('proposals');
              }}
              onRegisterSaleForLead={(lead) => {
                setLeadForSale(lead);
                setCurrentView('sales');
              }}
            />
          )}

          {currentView === 'proposals' && (
            <ProposalsView initialLead={leadForProposal} />
          )}

          {currentView === 'sales' && (
            <SalesView initialSaleData={leadForSale} />
          )}

          {currentView === 'settings' && <SettingsView />}

          {currentView === 'help' && <HelpCenterView />}

          {currentView === 'admin' && <AdminPanelView onNavigate={handleNavigate} />}
        </main>
      </div>
      </div>

      {/* Pix Payment Modal */}
      {selectedPlanForPix && (
        <PixCheckoutModal
          isOpen={pixModalOpen}
          onClose={() => setPixModalOpen(false)}
          selectedPlan={selectedPlanForPix}
          onPaymentSubmitted={() => {
            setPixModalOpen(false);
            refreshUser();
          }}
        />
      )}

      {/* Global Toast System */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
