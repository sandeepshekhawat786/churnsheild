import pandas as pd
import joblib
import shap

from recommendation_engine import get_risk_level, get_retention_recommendations

DATASET_PATH = "dataset"
SAVE_PATH = "saved_model"

# Load dataset
test_df = pd.read_csv(f"{DATASET_PATH}/test.csv")
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

# Load model and preprocessor
preprocessor = joblib.load(f"{SAVE_PATH}/preprocessor.pkl")
model = joblib.load(f"{SAVE_PATH}/xgboost_model.pkl")

# Select one customer
customer_index = 1000
customer_raw = X_test.iloc[[customer_index]]
customer_dict = customer_raw.iloc[0].to_dict()

# Preprocess customer
customer_processed = preprocessor.transform(customer_raw)

# Predict
prediction = model.predict(customer_processed)[0]
probability = model.predict_proba(customer_processed)[0][1]
risk_level = get_risk_level(probability)

# SHAP explanation
feature_names = preprocessor.get_feature_names_out()
explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(customer_processed.toarray())

# Create SHAP dataframe
shap_df = pd.DataFrame({
    "feature": feature_names,
    "shap_value": shap_values[0]
})

# Keep only features increasing churn risk
positive_shap = shap_df[shap_df["shap_value"] > 0]

# Sort by highest impact
top_features = positive_shap.sort_values(
    by="shap_value",
    ascending=False
).head(8)

# Clean feature names
top_reasons = []

for feature in top_features["feature"]:
    clean_name = feature.replace("num__", "").replace("cat__", "")

    # For one-hot encoded columns like Contract_Month-to-Month
    if clean_name.startswith("Contract_"):
        clean_name = "Contract"
    elif clean_name.startswith("City_"):
        clean_name = "City"
    elif clean_name.startswith("Offer_"):
        clean_name = "Offer"
    elif clean_name.startswith("Internet Type_"):
        clean_name = "Internet Type"
    elif clean_name.startswith("Payment Method_"):
        clean_name = "Payment Method"
    elif clean_name.startswith("Gender_"):
        clean_name = "Gender"

    if clean_name not in top_reasons:
        top_reasons.append(clean_name)

# Get recommendations
recommendations = get_retention_recommendations(customer_dict, top_reasons)

# Print final customer analysis
print("\n========== CUSTOMER CHURN ANALYSIS ==========\n")

print(f"Customer Index      : {customer_index}")
print(f"Prediction          : {'Churn' if prediction == 1 else 'Not Churn'}")
print(f"Churn Probability   : {probability:.2%}")
print(f"Risk Level          : {risk_level}")

print("\nTop Influencing Factors:")
for reason in top_reasons[:5]:
    print(f"- {reason}")

print("\n========== RETENTION RECOMMENDATIONS ==========\n")

for idx, rec in enumerate(recommendations, start=1):
    print(f"{idx}. Issue:")
    print(f"   {rec['issue']}")

    print("   Recommended Action:")
    print(f"   {rec['recommended_action']}\n")
    
print("\nActual Churn Value:")
print(y_test.iloc[customer_index])