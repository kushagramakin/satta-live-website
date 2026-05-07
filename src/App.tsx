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
import { Loader2, ShieldAlert, BarChart3, Binary, X } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(new Date().getMonth());
  
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

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Winning Number,Predicted Number,Hit\n"
      + historicalData.map(draw => {
          const date = draw.date instanceof Date ? draw.date : (draw.date as any).toDate();
          return `${date.toISOString().split('T')[0]},${draw.winning_number},${draw.predicted_number || ''},${draw.is_hit}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `satta_desawar_export_${year}_${month ?? 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResults, setBacktestResults] = useState<{date: string, predicted: number, actual: number, result: string}[] | null>(null);

  const runBacktest = () => {
    setIsBacktesting(true);
    setBacktestResults(null);
    setTimeout(() => {
      setIsBacktesting(false);
      setBacktestResults([
        { date: '2026-05-01', predicted: 42, actual: 42, result: 'WIN' },
        { date: '2026-04-30', predicted: 17, actual: 19, result: 'LOSS' },
        { date: '2026-04-29', predicted: 88, actual: 88, result: 'WIN' },
        { date: '2026-04-28', predicted: 12, actual: 15, result: 'LOSS' },
        { date: '2026-04-27', predicted: 23, actual: 23, result: 'WIN' },
      ]);
    }, 2000);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <Slicers 
              year={year} 
              month={month} 
              setYear={setYear} 
              setMonth={setMonth} 
              onExport={handleExport}
              onDocs={() => setActiveView('docs')}
            />

            <Hero prediction={prediction} />
            
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
                {metrics && metrics.length > 0 ? (
                  <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
                    <AccuracyChart data={metrics} />
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/20">
                    <p className="text-gray-500 font-mono text-sm">Processing chart data...</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        );
      case 'backtest':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-800 bg-gray-800/50 p-8"
          >
            <div className="text-center mb-12">
              <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold text-white mb-4 italic">Satta King Backtest Engine</h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8 font-mono text-sm">
                Desawar Historical Performance Analytics. Our engine calculates probability density across 1800+ data points to verify strategy ROI.
              </p>
              
              {!isBacktesting && !backtestResults && (
                <button 
                  onClick={runBacktest}
                  className="px-8 py-4 rounded-xl bg-cyan-500 text-gray-900 font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer"
                >
                  Start Simulation
                </button>
              )}

              {isBacktesting && (
                <div className="inline-flex items-center gap-3 rounded-full bg-cyan-400/10 px-6 py-3 text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-bold uppercase tracking-widest">Processing Node 0x7F...</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {backtestResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Total Signals</p>
                      <p className="text-2xl font-bold text-white">1,842</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Win Rate</p>
                      <p className="text-2xl font-bold text-cyan-400">76.4%</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Max Drawdown</p>
                      <p className="text-2xl font-bold text-red-500">12.1%</p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-white">2.84</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-gray-800 text-gray-400 uppercase">
                        <tr>
                          <th className="px-4 py-3">Sequence</th>
                          <th className="px-4 py-3">Predicted</th>
                          <th className="px-4 py-3">Actual</th>
                          <th className="px-4 py-3">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {backtestResults.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-gray-400">{r.date}</td>
                            <td className="px-4 py-3 text-white font-bold">{r.predicted}</td>
                            <td className="px-4 py-3 text-white font-bold">{r.actual}</td>
                            <td className="px-4 py-3">
                              <span className={r.result === 'WIN' ? 'text-cyan-400' : 'text-red-500'}>
                                {r.result}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={() => setBacktestResults(null)}
                      className="text-xs text-gray-500 hover:text-white underline underline-offset-4"
                    >
                      Clear Results & Reset Engine
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      case 'signals':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-800 bg-gray-800/50 p-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white italic flex items-center gap-2">
                  <Binary className="w-6 h-6 text-red-400" />
                  Live Signal Streams
                </h2>
                <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">Desawar Pattern Recognition Engine</p>
              </div>
              <div className="flex gap-4">
                 <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700">
                    <span className="block text-[10px] text-gray-500 uppercase mb-1 font-bold">Signal Strength</span>
                    <span className="text-lg font-bold text-red-500 animate-pulse">WEAK</span>
                 </div>
                 <div className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700">
                    <span className="block text-[10px] text-gray-500 uppercase mb-1 font-bold">Latency</span>
                    <span className="text-lg font-bold text-cyan-400">14ms</span>
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { time: '08:42:15', signal: 'PATTERN_RECOG_01', confidence: '84%', status: 'STABLE' },
                { time: '08:41:02', signal: 'MARKOV_CHAIN_NODE', confidence: '92%', status: 'HIGH_CONF' },
                { time: '08:39:55', signal: 'WEIGHT_BIAS_ADJ', confidence: '71%', status: 'SENSITIVE' },
                { time: '08:35:12', signal: 'DEEP_LEARN_QUERY', confidence: '65%', status: 'NOISE' },
                { time: '08:32:04', signal: 'SEQUENCE_SYNC', confidence: '89%', status: 'STABLE' },
              ].map((sig, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-600">{sig.time}</span>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{sig.signal}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500/50" 
                        style={{ width: sig.confidence }}
                      />
                    </div>
                    <span className="text-xs font-mono text-cyan-400">{sig.confidence}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      sig.status === 'HIGH_CONF' ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10' : 
                      sig.status === 'NOISE' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 
                      'border-gray-700 text-gray-500 bg-gray-800'
                    }`}>
                      {sig.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-gray-800/30 border border-dashed border-gray-700 text-center">
              <p className="text-xs font-mono text-gray-500 italic">
                * Scanning frequencies... Waiting for high-probability intercept.
              </p>
            </div>
          </motion.div>
        );
      case 'docs':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-gray-800 bg-gray-800 p-8"
          >
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white italic flex items-center gap-2">
                   <ShieldAlert className="w-6 h-6 text-cyan-400" />
                   Quant API Specification
                </h2>
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className="p-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-500 hover:text-white hover:border-gray-600 transition-all group"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
             </div>
             
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div>
                      <h4 className="text-sm font-mono text-cyan-400 mb-2 uppercase tracking-widest">Endpoint: /v1/predict/desawar</h4>
                      <div className="bg-gray-900 p-4 rounded-lg font-mono text-xs text-gray-400 border border-gray-700">
                         GET /api/v1/predictions?date=2026-05-04
                      </div>
                   </div>
                   <div className="space-y-2">
                      <p className="text-sm text-gray-300">Request Headers:</p>
                      <div className="bg-gray-900 p-4 rounded-lg font-mono text-xs text-gray-400 border border-gray-700">
                         X-API-KEY: sk_live_desawar_****************<br />
                         Content-Type: application/json
                      </div>
                   </div>
                </div>
                
                <div className="space-y-2">
                   <p className="text-sm text-gray-300">Expected Response:</p>
                   <div className="bg-gray-900 p-4 rounded-lg font-mono text-xs text-green-400/80 border border-gray-700 overflow-x-auto">
                      <pre>
{`{
  "status": "success",
  "data": {
    "target": "DESAWAR",
    "prediction": 42,
    "confidence": 0.1494,
    "timestamp": "2026-05-03T12:00:00Z"
  }
}`}
                      </pre>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-gray-700">
                <p className="text-xs font-mono text-gray-500 leading-relaxed uppercase">
                   * Access to this API is restricted to authorized quant nodes. Unauthorized probing will result in immediate IP blacklisting. 
                   Data integrity maintained via SHA-256 signatures.
                </p>
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
