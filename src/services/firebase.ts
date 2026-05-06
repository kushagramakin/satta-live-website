/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { HistoricalDraw, DailyPrediction, MonthlyMetric } from '../types';

// Mock Data
export const MOCK_HISTORICAL_DRAWS: HistoricalDraw[] = [
  { id: '1', date: new Date('2026-05-02'), winning_number: 42, predicted_number: 42, is_hit: true },
  { id: '2', date: new Date('2026-05-01'), winning_number: 17, predicted_number: 89, is_hit: false },
  { id: '3', date: new Date('2026-04-30'), winning_number: 23, predicted_number: 23, is_hit: true },
  { id: '4', date: new Date('2026-04-29'), winning_number: 88, predicted_number: 12, is_hit: false },
  { id: '5', date: new Date('2026-04-28'), winning_number: 10, predicted_number: 10, is_hit: true },
  { id: '6', date: new Date('2026-04-27'), winning_number: 55, predicted_number: 50, is_hit: false },
  { id: '7', date: new Date('2026-04-26'), winning_number: 22, predicted_number: 22, is_hit: true },
  { id: '8', date: new Date('2023-12-25'), winning_number: 7, predicted_number: 7, is_hit: true },
];

export const MOCK_DAILY_PREDICTIONS: DailyPrediction[] = [
  {
    id: 'p1',
    target_date: new Date('2026-05-04'),
    top_prediction: 42,
    probabilities: { '42': 0.1494, '17': 0.082, '23': 0.075 },
    log_loss_penalty: 0.45,
    runner_ups: [17, 23, 89, 12]
  }
];

export const MOCK_MONTHLY_METRICS: MonthlyMetric[] = [
  { id: 'm1', month_year: '2026-01', accuracy_rate: 0.65, average_log_loss: 0.55 },
  { id: 'm2', month_year: '2026-02', accuracy_rate: 0.68, average_log_loss: 0.52 },
  { id: 'm3', month_year: '2026-03', accuracy_rate: 0.72, average_log_loss: 0.48 },
  { id: 'm4', month_year: '2026-04', accuracy_rate: 0.75, average_log_loss: 0.45 },
  { id: 'm5', month_year: '2026-05', accuracy_rate: 0.78, average_log_loss: 0.42 },
];

// Firebase Initialization
let db: any = null;

try {
  // We use dynamic import or check for config file existence in a real app.
  // For now, we'll try to initialize but keep a flag.
  // In AI Studio, the config is usually in firebase-applet-config.json
  // but we provide mock data first.
  const app = getApps().length === 0 ? initializeApp({
    apiKey: "mock-api-key",
    authDomain: "mock-auth-domain",
    projectId: "mock-project-id",
    storageBucket: "mock-storage-bucket",
    messagingSenderId: "mock-sender-id",
    appId: "mock-app-id"
  }) : getApp();
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase config not found or invalid. Using mock data mode.", error);
}

export { db };

// Service functions
export async function getHistoricalDraws(year?: number, month?: number): Promise<HistoricalDraw[]> {
  if (!db || db._databaseId?.projectId === 'mock-project-id') {
    return MOCK_HISTORICAL_DRAWS.filter(draw => {
      const d = draw.date instanceof Date ? draw.date : (draw.date as any).toDate();
      const yrMatch = year ? d.getFullYear() === year : true;
      const moMatch = month !== undefined ? d.getMonth() === month : true;
      return yrMatch && moMatch;
    }).sort((a, b) => {
      const db = b.date instanceof Date ? b.date.getTime() : (b.date as any).toMillis();
      const da = a.date instanceof Date ? a.date.getTime() : (a.date as any).toMillis();
      return db - da;
    });
  }

  // Real implementation
  const constraints = [];
  if (year && month !== undefined) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    constraints.push(where('date', '>=', Timestamp.fromDate(start)));
    constraints.push(where('date', '<=', Timestamp.fromDate(end)));
  } else if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    constraints.push(where('date', '>=', Timestamp.fromDate(start)));
    constraints.push(where('date', '<=', Timestamp.fromDate(end)));
  }

  const q = query(
    collection(db, 'historical_draws'),
    ...constraints,
    orderBy('date', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoricalDraw));
}

export async function getDailyPredictions(targetDate?: Date): Promise<DailyPrediction[]> {
  if (!db || db._databaseId?.projectId === 'mock-project-id') {
    return MOCK_DAILY_PREDICTIONS;
  }

  const q = query(
    collection(db, 'daily_predictions'),
    orderBy('target_date', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyPrediction));
}

export async function getMonthlyMetrics(): Promise<MonthlyMetric[]> {
  if (!db || db._databaseId?.projectId === 'mock-project-id') {
    return MOCK_MONTHLY_METRICS;
  }

  const q = query(collection(db, 'monthly_metrics'), orderBy('month_year', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonthlyMetric));
}
