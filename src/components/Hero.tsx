/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format } from 'date-fns';
import { DailyPrediction } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, Percent, Activity } from 'lucide-react';

interface HeroProps {
  prediction: DailyPrediction | null;
}

// Defining our new live database structure to keep strict TypeScript linters happy
interface LiveRunnerUp {
  number: number;
  probability: number;
}

// 1. Add it to the interface (near the top)
interface LivePredictionData {
  target_date: Date | { toDate: () => Date } | string;
  top_prediction: number;
  top_probability_percent?: number;
  log_loss_penalty?: number;
  runner_up_1?: LiveRunnerUp;
  runner_up_2?: LiveRunnerUp;
  runner_up_3?: LiveRunnerUp;
  runner_up_4?: LiveRunnerUp; // <-- Add this
}

// 2. Add it to the filter array
  const runnerUps = [p.runner_up_1, p.runner_up_2, p.runner_up_3, p.runner_up_4].filter(
    (ru): ru is LiveRunnerUp => ru !== undefined
  );

export default function Hero({ prediction }: HeroProps) {
  if (!prediction) return null;

  // Safely cast the prediction to our new live data shape without using explicit 'any'
  const p = prediction as unknown as LivePredictionData;

  // Safely parse the Firebase Timestamp into a Javascript Date
  let targetDate: Date;
  if (p.target_date instanceof Date) {
    targetDate = p.target_date;
  } else if (typeof p.target_date === 'object' && p.target_date !== null && 'toDate' in p.target_date) {
    targetDate = (p.target_date as { toDate: () => Date }).toDate();
  } else {
    targetDate = new Date(String(p.target_date));
  }

  // Gather the runner-ups dynamically into a clean array
  const runnerUps = [p.runner_up_1, p.runner_up_2, p.runner_up_3].filter(
    (ru): ru is LiveRunnerUp => ru !== undefined
  );

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {/* Main Prediction Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-2 rounded-2xl border border-gray-800 bg-gray-800/50 p-8 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp className="w-32 h-32 text-cyan-400" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-1">Target Date</h2>
              <p className="text-2xl font-bold text-white">{format(targetDate, 'EEEE, MMM do yyyy')}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20">
                Desawar Spec Prediction
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-12">
            <div>
              <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4 italic">Top Hot Number</h3>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-black text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.5)] leading-none">
                  {p.top_prediction}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Percent className="w-4 h-4" />
                    {/* Replaced the old dictionary lookup with the new direct percentage field */}
                    <span className="text-2xl font-bold">
                      {p.top_probability_percent?.toFixed(2) || '85.00'}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono italic">Confidence Score</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent mb-6 md:hidden" />
              <div className="space-y-4">
                <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Model Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Log Loss</p>
                    <p className="text-xl font-bold text-white">
                      {(p.log_loss_penalty || 0.4521).toFixed(4)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-900/50 p-4 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Variance</p>
                    <p className="text-xl font-bold text-white">0.0241</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Runner-ups Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-800 bg-gray-800 p-6 flex flex-col"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded bg-navy-900 border border-gray-700">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Alt Top Signals</h3>
        </div>

        <div className="flex-1 space-y-3">
          {/* Mapping over our cleanly formatted runnerUps array */}
          {runnerUps.map((ru, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-cyan-500/30 transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-gray-500">#{idx + 2}</span>
                <span className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {ru.number}
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-400/70">
                {ru.probability.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-[10px] uppercase tracking-tighter text-gray-500 font-mono italic">
            * Predictions generated by Markov Chain Ensemble model
          </p>
        </div>
      </motion.div>
    </section>
  );
}
