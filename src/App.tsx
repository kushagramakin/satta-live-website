/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Slicers from './components/Slicers';
import HistoricalTable from './components/HistoricalTable';
import AccuracyChart from './components/AccuracyChart';
import { 
  getHistoricalDraws, 
  getDailyPredictions, 
  getMonthlyMetrics 
} from './services/firebase';
import { 
  HistoricalDraw, 
  DailyPrediction, 
  MonthlyMetric,
  AppView
} from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ShieldAlert, BarChart3, Binary } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState<number | undefined>(4); // May (0-indexed)
  
  const [historicalData, setHistoricalData] = useState<HistoricalDraw[]>([]);
  const [prediction, setPrediction] = useState<DailyPrediction | null>(null);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [hist, pred, met] = await Promise.all([
          getHistoricalDraws(year, month),
          getDailyPredictions(),
          getMonthlyMetrics()
        ]);
        
        setHistoricalData(hist);
        setPrediction(pred[0] || null);
        setMetrics(met);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [year, month]);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <Hero prediction={prediction} />
            
            <Slicers 
              year={year} 
              month={month} 
              setYear={setYear} 
              setMonth={setMonth} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[400px] flex items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/20"
                    >
                      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      key={year + "-" + (month ?? "all")}
                      className="h-full"
                    >
                      <HistoricalTable data={historicalData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <aside className="space-y-8">
                <AccuracyChart data={metrics} />
              </aside>
            </div>
          </div>
        );
      case 'backtest':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-800 bg-gray-800/50 p-12 text-center"
          >
            <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold text-white mb-4 italic">Satta Backtest Engine</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 font-mono">
              Historical Desawar simulation module. Testing against 5 years of time-series data to optimize weights and bias.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium uppercase tracking-widest">Optimizing Parameters...</span>
            </div>
          </motion.div>
        );
      case 'signals':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-800 bg-gray-800/50 p-12 text-center"
          >
            <Binary className="w-16 h-16 text-red-400 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold text-white mb-4 italic">Live Signal Streams</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 font-mono">
              Real-time Desawar signal interception and pattern recognition. Monitoring live market fluctuations for high-probability sequences.
            </p>
            <div className="flex justify-center gap-4">
               <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 min-w-[120px]">
                  <span className="block text-[10px] text-gray-500 uppercase mb-1">Signal Strength</span>
                  <span className="text-xl font-bold text-red-500">WEAK</span>
               </div>
               <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 min-w-[120px]">
                  <span className="block text-[10px] text-gray-500 uppercase mb-1">Market Volatility</span>
                  <span className="text-xl font-bold text-cyan-400">MED</span>
               </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      <footer className="border-t border-gray-800 bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-tighter">SATTA<span className="text-cyan-400">KING</span> PREDICTOR</span>
              <span className="text-[10px] text-gray-500 font-mono">DESAWAR-CORE v4.2.0</span>
            </div>
            <p className="text-xs text-gray-600 max-w-md text-center md:text-right font-mono italic">
              Quantum analysis module initialized. Numerical stability: Optimal. Probabilities generated using non-linear ensemble regressions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
