/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from 'firebase/firestore';

export interface HistoricalDraw {
  id: string;
  date: Timestamp | Date;
  winning_number: number;
  predicted_number?: number;
  is_hit?: boolean;
}

export interface DailyPrediction {
  id: string;
  target_date: Timestamp | Date;
  top_prediction: number;
  probabilities: Record<string, number>;
  log_loss_penalty: number;
  runner_ups: number[];
}

export interface MonthlyMetric {
  id: string;
  month_year: string; // e.g. "2024-05"
  accuracy_rate: number;
  average_log_loss: number;
}

export type AppView = 'dashboard' | 'backtest' | 'signals' | 'docs';
