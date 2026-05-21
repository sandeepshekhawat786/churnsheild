import pandas as pd
import joblib
import os

from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

# -----------------------------
# Paths
# -----------------------------
DATASET_PATH = "dataset"
SAVE_PATH = "saved_model"

# -----------------------------
# Load datasets
# -----------------------------
train_df = pd.read_csv(f"{DATASET_PATH}/train.csv")
val_df = pd.read_csv(f"{DATASET_PATH}/validation.csv")
test_df = pd.read_csv(f"{DATASET_PATH}/test.csv")

# -----------------------------
# Remove joined customers
# -----------------------------
train_df = train_df[train_df["Customer Status"] != "Joined"]
val_df = val_df[val_df["Customer Status"] != "Joined"]
test_df = test_df[test_df["Customer Status"] != "Joined"]

# -----------------------------
# Target column
# -----------------------------
target_col = "Churn"

# -----------------------------
# Remove leakage columns
# -----------------------------
drop_cols = [
    "Customer ID",
    "Customer Status",
    "Churn Category",
    "Churn Reason",
    "Churn Score",
    "Lat Long"
]

# -----------------------------
# Features & Target
# -----------------------------
X_train = train_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_train = train_df[target_col]

X_val = val_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_val = val_df[target_col]

X_test = test_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_test = test_df[target_col]

# -----------------------------
# Load preprocessor
# -----------------------------
preprocessor = joblib.load(f"{SAVE_PATH}/preprocessor.pkl")

# -----------------------------
# Transform data
# -----------------------------
X_train_processed = preprocessor.transform(X_train)
X_val_processed = preprocessor.transform(X_val)
X_test_processed = preprocessor.transform(X_test)

# -----------------------------
# Create XGBoost model
# -----------------------------
model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss"
)

# -----------------------------
# Train model
# -----------------------------
print("Training model...\n")

model.fit(X_train_processed, y_train)

print("Model training completed.\n")

# -----------------------------
# Validation predictions
# -----------------------------
y_val_pred = model.predict(X_val_processed)
y_val_prob = model.predict_proba(X_val_processed)[:, 1]

# -----------------------------
# Evaluation Metrics
# -----------------------------
accuracy = accuracy_score(y_val, y_val_pred)
precision = precision_score(y_val, y_val_pred)
recall = recall_score(y_val, y_val_pred)
f1 = f1_score(y_val, y_val_pred)
roc_auc = roc_auc_score(y_val, y_val_prob)

# -----------------------------
# Print results
# -----------------------------
print("========== MODEL PERFORMANCE ==========\n")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {roc_auc:.4f}")

print("\n========== CONFUSION MATRIX ==========\n")
print(confusion_matrix(y_val, y_val_pred))

print("\n========== CLASSIFICATION REPORT ==========\n")
print(classification_report(y_val, y_val_pred))

# -----------------------------
# Save trained model
# -----------------------------
joblib.dump(model, f"{SAVE_PATH}/xgboost_model.pkl")

print("\nModel saved successfully.")