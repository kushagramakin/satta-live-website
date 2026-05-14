/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { format } from 'date-fns';
import { HistoricalDraw } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoricalTableProps {
  data: HistoricalDraw[];
}

export default function HistoricalTable({ data }: HistoricalTableProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Historical Audit
          <span className="text-xs font-mono text-gray-500 font-normal">({data.length} records)</span>
        </h3>
      </div>
      
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
        <div className="overflow-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-800 z-20">
              <tr className="text-xs font-mono text-gray-400 uppercase tracking-widest border-b border-gray-700">
                <th className="px-6 py-4 font-medium">Draw Date</th>
                <th className="px-6 py-4 font-medium">Outcome</th>
                <th className="px-6 py-4 font-medium">ML Prediction</th>
                <th className="px-6 py-4 font-medium">Signal Hit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.map((draw, idx) => {
                const date = draw.date instanceof Date ? draw.date : (draw.date as any).toDate();
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={draw.id} 
                    className="hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {format(date, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-white font-bold group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all">
                        {draw.winning_number !== undefined && draw.winning_number !== null 
                          ? draw.winning_number.toString().padStart(2, '0') 
                          : '--'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-400 italic">
                      {/* THE FIX: Strict null check plus 2-digit padding */}
                      {draw.predicted_number !== undefined && draw.predicted_number !== null 
                        ? draw.predicted_number.toString().padStart(2, '0') 
                        : '--'}
                    </td>
                    <td className="px-6 py-4">
                      {draw.is_hit ? (
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <CheckCircle2 className="w-4 h-4 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-full" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">Direct Hit</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">Null Signal</span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                    No records found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
