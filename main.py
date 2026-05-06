import pandas as pd
import numpy as np
from datetime import datetime

def prepare_data(df):
    """
    Performs feature engineering on the raw Satta draws data.
    Expected raw columns: ['Date', 'Number']
    """
    # 1. Convert Date to datetime object
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')

    # 2. Extract basic date features
    df['Month'] = df['Date'].dt.month
    df['Day'] = df['Date'].dt.day
    df['DayOfWeek'] = df['Date'].dt.dayofweek

    # 3. Cyclical encoding for Month (12 months)
    df['Month_Sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    df['Month_Cos'] = np.cos(2 * np.pi * df['Month'] / 12)

    # 4. Cyclical encoding for Day of Month (approx 31 days)
    df['Day_Sin'] = np.sin(2 * np.pi * df['Day'] / 31)
    df['Day_Cos'] = np.cos(2 * np.pi * df['Day'] / 31)

    # 5. Lag features (Previous winning numbers)
    df['Lag_1'] = df['Number'].shift(1)
    df['Lag_2'] = df['Number'].shift(2)
    df['Lag_3'] = df['Number'].shift(3)
    df['Lag_7'] = df['Number'].shift(7) # Weekly seasonality

    # 6. Rolling averages (Optional but helpful)
    df['Rolling_Mean_3'] = df['Number'].shift(1).rolling(window=3).mean()
    
    return df

def train_model(csv_path='data/historical_draws.csv'):
    # Load raw data
    try:
        df_raw = pd.read_csv(csv_path)
    except FileNotFoundError:
        print(f"Error: {csv_path} not found. Creating dummy data for demonstration.")
        # Create dummy data if file doesn't exist
        dates = pd.date_range(start='2022-01-01', end='2026-05-01', freq='D')
        df_raw = pd.DataFrame({
            'Date': dates,
            'Number': np.random.randint(0, 100, size=len(dates))
        })

    # Apply Feature Engineering
    df = prepare_data(df_raw)

    # Define features to use for training
    features = [
        'Lag_1', 'Lag_2', 'Lag_3', 'Lag_7',
        'Month_Sin', 'Month_Cos', 
        'Day_Sin', 'Day_Cos',
        'Rolling_Mean_3'
    ]

    # Drop rows with NaN values created by lags
    df_clean = df.dropna().copy()

    # Assign X and Y
    X = df_clean[features]
    Y = df_clean['Number']

    print(f"Data prepared successfully. Features: {features}")
    print(f"X shape: {X.shape}, Y shape: {Y.shape}")
    
    # Model training logic would go here (e.g., RandomForest/XGBoost)
    # model = RandomForestRegressor()
    # model.fit(X, Y)
    
    return X, Y

if __name__ == "__main__":
    train_model()
