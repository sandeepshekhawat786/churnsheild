import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt
import os

# Paths
DATASET_PATH = "dataset"
SAVE_PATH = "saved_model"
OUTPUT_PATH = "shap_outputs"

os.makedirs(OUTPUT_PATH, exist_ok=True)

# Load test data
test_df = pd.read_csv(f"{DATASET_PATH}/test.csv")

# Remove joined customers
test_df = test_df[test_df["Customer Status"] != "Joined"]

target_col = "Churn"

drop_cols = [
    "Customer ID",
    "Customer Status",
    "Churn Category",
    "Churn Reason",
    "Churn Score",
    "Lat Long"
]

X_test = test_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_test = test_df[target_col]

# Load saved files
preprocessor = joblib.load(f"{SAVE_PATH}/preprocessor.pkl")
model = joblib.load(f"{SAVE_PATH}/xgboost_model.pkl")

# Transform test data
X_test_processed = preprocessor.transform(X_test)

# Get final feature names
feature_names = preprocessor.get_feature_names_out()

# Convert sparse matrix to dense only for SHAP sample
X_sample = X_test_processed[:300].toarray()

# Create SHAP explainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_sample)

# 1. SHAP bar plot
plt.figure()
shap.summary_plot(
    shap_values,
    X_sample,
    feature_names=feature_names,
    plot_type="bar",
    show=False
)
plt.savefig(f"{OUTPUT_PATH}/shap_bar_plot.png", bbox_inches="tight")
plt.close()

# 2. SHAP summary plot
plt.figure()
shap.summary_plot(
    shap_values,
    X_sample,
    feature_names=feature_names,
    show=False
)
plt.savefig(f"{OUTPUT_PATH}/shap_summary_plot.png", bbox_inches="tight")
plt.close()

print("SHAP analysis completed successfully.")
print("Saved files:")
print("1. shap_outputs/shap_bar_plot.png")
print("2. shap_outputs/shap_summary_plot.png")