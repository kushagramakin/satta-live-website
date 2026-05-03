/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity } from 'lucide-react';
import { AppView } from '../types';
import { cn } from '../lib/utils';

interface HeaderProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export default function Header({ activeView, setActiveView }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Activity className="h-6 w-6 text-cyan-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white italic">
            SATTA<span className="text-cyan-400">KING</span> PREDICTOR
          </span>
        </div>
        
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Desawar Specialist</span>
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <nav className="flex gap-4">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-cyan-300",
                activeView === 'dashboard' ? "text-cyan-400" : "text-gray-400"
              )}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveView('backtest')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                activeView === 'backtest' ? "text-cyan-400" : "text-gray-400"
              )}
            >
              Backtest
            </button>
            <button 
              onClick={() => setActiveView('signals')}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                activeView === 'signals' ? "text-cyan-400" : "text-gray-400"
              )}
            >
              Signals
            </button>
          </nav>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Live Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
}
