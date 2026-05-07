/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { MonthlyMetric } from '../types';

interface AccuracyChartProps {
  data: MonthlyMetric[];
}

export default function AccuracyChart({ data }: AccuracyChartProps) {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-800/50 p-6 flex-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            Engine Efficiency
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </h3>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="month_year" 
                stroke="#9CA3AF" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => val.split('-')[1] + '/' + val.split('-')[0].slice(2)}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', fontSize: '12px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
              <Line 
                name="Accuracy Rate"
                type="monotone" 
                dataKey="accuracy_rate" 
                stroke="#22d3ee" 
                strokeWidth={3}
                dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-800/50 p-6 flex-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            Log Loss Penalty
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        </h3>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="month_year" 
                stroke="#9CA3AF" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => val.split('-')[1]}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', fontSize: '12px' }}
              />
              <Area 
                name="Log Loss"
                type="stepAfter" 
                dataKey="average_log_loss" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorLoss)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
