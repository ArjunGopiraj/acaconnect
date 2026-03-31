import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

# Load dataset
df = pd.read_csv(os.path.join(os.path.dirname(__file__), '..', 'data', 'budget_training_dataset.csv'))

# Input features
FEATURE_COLS = [
    'event_type', 'expected_participants', 'duration_hours', 'prize_pool',
    'refreshments_needed', 'stationary_needed', 'goodies_needed',
    'physical_certificate', 'trophies_needed', 'volunteers_needed',
    'rooms_needed', 'refreshment_item_count', 'stationery_item_count'
]

# Output targets
TARGET_COLS = [
    'expense_refreshments', 'expense_stationery', 'expense_certificates',
    'expense_goodies', 'expense_trophies', 'expense_other', 'total_expense'
]

X = df[FEATURE_COLS]
y = df[TARGET_COLS]

# 80-20 split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train one Random Forest per target (MultiOutput)
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
y_pred_df = pd.DataFrame(y_pred, columns=TARGET_COLS)

print("=== Budget Prediction Model - Evaluation ===\n")
for i, col in enumerate(TARGET_COLS):
    mae = mean_absolute_error(y_test[col], y_pred_df[col])
    r2 = r2_score(y_test[col], y_pred_df[col])
    print(f"{col:25s} | MAE: Rs.{mae:,.0f} | R2: {r2:.3f}")

# Overall total_expense metrics
total_mae = mean_absolute_error(y_test['total_expense'], y_pred_df['total_expense'])
total_r2 = r2_score(y_test['total_expense'], y_pred_df['total_expense'])
print(f"\n--- Total Expense ---")
print(f"MAE: Rs.{total_mae:,.0f}")
print(f"R2 Score: {total_r2:.3f}")
print(f"Avg actual: Rs.{y_test['total_expense'].mean():,.0f}")
print(f"MAE as % of avg: {total_mae / y_test['total_expense'].mean() * 100:.1f}%")

# Feature importance
print(f"\n--- Feature Importance (for total_expense) ---")
# For multi-output RF, feature_importances_ is averaged across all targets
importances = model.feature_importances_
for feat, imp in sorted(zip(FEATURE_COLS, importances), key=lambda x: -x[1]):
    print(f"  {feat:30s}: {imp:.4f}")

# Save model
model_path = os.path.join(os.path.dirname(__file__), 'budget_model.pkl')
joblib.dump({
    'model': model,
    'feature_cols': FEATURE_COLS,
    'target_cols': TARGET_COLS
}, model_path)
print(f"\nModel saved to {model_path}")
