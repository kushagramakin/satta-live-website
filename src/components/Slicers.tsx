/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar } from 'lucide-react';

interface SlicersProps {
  year: number;
  month: number | undefined;
  setYear: (y: number) => void;
  setMonth: (m: number | undefined) => void;
}

export default function Slicers({ year, month, setYear, setMonth }: SlicersProps) {
  const years = [2022, 2023, 2024, 2025, 2026];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 py-6 border-b border-gray-800">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono uppercase text-gray-500 tracking-wider">Historical Context</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Year Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Period Year</label>
          <select 
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">Period Month</label>
          <select 
            value={month === undefined ? "" : month}
            onChange={(e) => setMonth(e.target.value === "" ? undefined : Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 min-w-[140px]"
          >
            <option value="">All Months</option>
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="ml-auto hidden md:block">
        <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-navy-900 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500 hover:text-white transition-all">
                Export Data
            </button>
            <button className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 text-xs font-bold hover:bg-gray-700 transition-all">
                API Docs
            </button>
        </div>
      </div>
    </div>
  );
}
