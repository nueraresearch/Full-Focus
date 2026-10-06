/**
 * OrbitFocus: Executive Productivity & Workflow Hub
 * Seamless workflow synchronization across GitHub, WordPress (nueraresearch.com),
 * Microsoft 365, Google Workspace, Chrome/Edge, and Claude.
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { PrioritizationView } from './components/PrioritizationView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { TimeTrackingView } from './components/TimeTrackingView';
import { ObjectivesView } from './components/ObjectivesView';
import { IntegrationsHub } from './components/Integrations/IntegrationsHub';
import { TimerHUD } from './components/TimerHUD';
import { CommandPalette } from './components/CommandPalette';
import { TaskModal } from './components/TaskModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AIChatWidget } from './components/AIChatWidget';
import { UniversalIngestionModal } from './components/UniversalIngestionModal';
import { CheckCircle2, ShieldCheck, Zap, Smartphone, Download, X } from 'lucide-react';
import { triggerHaptic } from './utils/androidBridge';

const AppContent: React.FC = () => {
  const { activeView, canInstallAndroid, installAppOnAndroid, isIngestionOpen, setIsIngestionOpen } = useApp();
  const [dismissInstallBanner, setDismissInstallBanner] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-20 md:pb-0 overflow-x-hidden w-full max-w-[100vw]">
      {/* Android PWA Install Prompt Banner */}
      {canInstallAndroid && !dismissInstallBanner && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 border-b border-indigo-500/40 px-4 py-2 text-xs flex items-center justify-between gap-3 text-white sticky top-0 z-50">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="truncate">
              <strong>Install OrbitFocus for Android</strong> • Fast home-screen access & native haptics
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('tap');
                installAppOnAndroid();
              }}
              className="px-2.5 py-1 rounded-lg bg-white text-indigo-950 font-bold text-[11px] hover:bg-slate-100 transition shadow"
            >
              Install App
            </button>
            <button
              onClick={() => setDismissInstallBanner(true)}
              className="p-1 text-indigo-200 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Executive App Header */}
      <Header />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
        {activeView === 'priorities' && <PrioritizationView />}
        {activeView === 'tasks' && <TasksView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'tracking' && <TimeTrackingView />}
        {activeView === 'objectives' && <ObjectivesView />}
        {activeView === 'integrations' && <IntegrationsHub />}
      </main>

      {/* Floating Focus Controller / Fullscreen Zen View */}
      <TimerHUD />

      {/* Modals & Overlays */}
      <CommandPalette />
      <TaskModal />
      <UniversalIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
      />

      {/* AI Conversational Goal & Task Copilot Widget */}
      <AIChatWidget />

      {/* Mobile-First Bottom Thumb Navigation & FAB */}
      <MobileBottomNav />

      {/* Executive Footer (Desktop only) */}
      <footer className="hidden md:block border-t border-slate-900 bg-slate-950 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-400">
              OrbitFocus Hub Active • Connected: nueraresearch.com • GitHub • M365 • Claude
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">⌘K</kbd> Command Palette
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">⌘B</kbd> Quick Capture
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
