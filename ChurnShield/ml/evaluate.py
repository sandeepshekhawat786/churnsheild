import pandas as pd
import joblib

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
# Load test dataset
# -----------------------------
test_df = pd.read_csv(f"{DATASET_PATH}/test.csv")

# -----------------------------
# Remove joined customers
# -----------------------------
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
# Features & target
# -----------------------------
X_test = test_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_test = test_df[target_col]

# -----------------------------
# Load preprocessor
# -----------------------------
preprocessor = joblib.load(f"{SAVE_PATH}/preprocessor.pkl")

# -----------------------------
# Transform test data
# -----------------------------
X_test_processed = preprocessor.transform(X_test)

# -----------------------------
# Load trained model
# -----------------------------
model = joblib.load(f"{SAVE_PATH}/xgboost_model.pkl")

# -----------------------------
# Predict
# -----------------------------
y_pred = model.predict(X_test_processed)
y_prob = model.predict_proba(X_test_processed)[:, 1]

# -----------------------------
# Metrics
# -----------------------------
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

# -----------------------------
# Print results
# -----------------------------
print("\n========== FINAL TEST PERFORMANCE ==========\n")

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {roc_auc:.4f}")

print("\n========== CONFUSION MATRIX ==========\n")
print(confusion_matrix(y_test, y_pred))

print("\n========== CLASSIFICATION REPORT ==========\n")
print(classification_report(y_test, y_pred))