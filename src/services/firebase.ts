/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { HistoricalDraw, DailyPrediction, MonthlyMetric } from '../types';

// --- 1. YOUR REAL FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDLU7pzBB9XBlZV1HS_kiY9ttecjaSXKBw",
  authDomain: "sattaking-264df.firebaseapp.com",
  projectId: "sattaking-264df",
  storageBucket: "sattaking-264df.firebasestorage.app",
  messagingSenderId: "100826068718",
  appId: "1:100826068718:web:8eb36fc1c60af9bdf4e5ff",
  measurementId: "G-2Z2160TTF1"
};

// --- 2. INITIALIZE FIREBASE ---
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

// --- 3. LIVE DATABASE SERVICE FUNCTIONS ---

export async function getHistoricalDraws(year?: number, month?: number): Promise<HistoricalDraw[]> {
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
  const q = query(
    collection(db, 'daily_predictions'),
    orderBy('target_date', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyPrediction));
}

export async function getMonthlyMetrics(): Promise<MonthlyMetric[]> {
  const q = query(collection(db, 'monthly_metrics'), orderBy('month_year', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MonthlyMetric));
}
