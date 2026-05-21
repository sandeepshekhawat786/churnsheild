from fastapi import FastAPI
from fastapi.responses import JSONResponse
import pandas as pd
import shap
import traceback
from fastapi import UploadFile, File
import io
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from app.model_loader import get_model, get_preprocessor
from app.schemas import CustomerData
from app.recommendation_engine import (
    get_risk_level,
    get_retention_recommendations
)

app = FastAPI(
    title="ChurnShield API",
    description="AI Powered Telecom Customer Retention Intelligence System",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and preprocessor
model = get_model()
preprocessor = get_preprocessor()

# -----------------------------
# Prediction API
# -----------------------------
@app.post("/predict")
def predict_churn(customer: CustomerData):

    # Convert incoming JSON to dataframe
    customer_df = pd.DataFrame([customer.data])

    # Preprocess
    processed_data = preprocessor.transform(customer_df)

    # Predict
    prediction = model.predict(processed_data)[0]
    probability = float(model.predict_proba(processed_data)[0][1])

    # Risk level
    risk_level = get_risk_level(probability)

    # SHAP explainability
    explainer = shap.TreeExplainer(model)

    shap_values = explainer.shap_values(
        processed_data.toarray()
    )

    feature_names = preprocessor.get_feature_names_out()

    shap_df = pd.DataFrame({
        "feature": feature_names,
        "shap_value": shap_values[0]
    })

    # Keep positive impact features
    positive_shap = shap_df[
        shap_df["shap_value"] > 0
    ]

    top_features = positive_shap.sort_values(
        by="shap_value",
        ascending=False
    ).head(5)

    # Clean feature names
    top_reasons = []

    for feature in top_features["feature"]:

        clean_name = (
            feature
            .replace("num__", "")
            .replace("cat__", "")
        )

        if clean_name.startswith("Contract_"):
            clean_name = "Contract"

        elif clean_name.startswith("Offer_"):
            clean_name = "Offer"

        elif clean_name.startswith("Internet Type_"):
            clean_name = "Internet Type"

        elif clean_name.startswith("Payment Method_"):
            clean_name = "Payment Method"

        elif clean_name.startswith("Gender_"):
            clean_name = "Gender"

        elif clean_name.startswith("City_"):
            clean_name = "City"

        # Ignore non-business useful geographic features
        ignored_features = [
            "City",
            "Zip Code",
            "Latitude",
            "Longitude",
            "Country",
            "Population"
        ]

        if clean_name not in ignored_features and clean_name not in top_reasons:
            top_reasons.append(clean_name)

    # Retention recommendations
    recommendations = get_retention_recommendations(
        customer.data,
        top_reasons
    )

    return {
        "prediction": (
            "Churn"
            if prediction == 1
            else "Not Churn"
        ),

        "churn_probability": round(probability * 100, 2),

        "risk_level": risk_level,

        "top_influencing_factors": top_reasons,

        "retention_recommendations": recommendations
    }

@app.post("/bulk_predict")
async def bulk_predict(file: UploadFile = File(...)):
    try:
        print("BULK API HIT", flush=True)

        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        print("CSV Loaded:", df.shape, flush=True)

        if "Customer Status" in df.columns:
            df = df[df["Customer Status"] != "Joined"]

        drop_cols = [
            "Customer ID",
            "Customer Status",
            "Churn Category",
            "Churn Reason",
            "Churn Score",
            "Lat Long",
            "Churn"
        ]

        X = df.drop(columns=drop_cols, errors="ignore")

        expected_columns = list(preprocessor.feature_names_in_)

        for col in expected_columns:
            if col not in X.columns:
                X[col] = None

        X = X[expected_columns]

        processed_data = preprocessor.transform(X)

        predictions = model.predict(processed_data)
        probabilities = model.predict_proba(processed_data)[:, 1]

        results = []

        for i in range(len(X)):
            probability = float(probabilities[i])
            risk_level = get_risk_level(probability)

            results.append({
                "customer_index": int(i),
                "prediction": "Churn" if int(predictions[i]) == 1 else "Not Churn",
                "churn_probability": round(probability * 100, 2),
                "risk_level": risk_level,
                "customer_data": (
    X.iloc[i]
    .replace({np.nan: None})
    .to_dict()
)
            })

        return {
            "total_customers": len(results),
            "predicted_churn_customers": sum(1 for r in results if r["prediction"] == "Churn"),
            "predicted_not_churn_customers": sum(1 for r in results if r["prediction"] == "Not Churn"),
            "average_churn_probability": round(sum(r["churn_probability"] for r in results) / len(results), 2),
            "risk_distribution": {
                "critical_risk": sum(1 for r in results if r["risk_level"] == "Critical Risk"),
                "high_risk": sum(1 for r in results if r["risk_level"] == "High Risk"),
                "medium_risk": sum(1 for r in results if r["risk_level"] == "Medium Risk"),
                "low_risk": sum(1 for r in results if r["risk_level"] == "Low Risk")
            },
            "results": results[:100]
        }

    except Exception as e:
        import traceback
        traceback.print_exc()

        return JSONResponse(
            status_code=400,
            content={
                "error": str(e)
            }
        )
    
@app.post("/upload_test")
async def upload_test(file: UploadFile = File(...)):
    contents = await file.read()
    return {
        "filename": file.filename,
        "size": len(contents)
    }

# -----------------------------
# Root API
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "ChurnShield API Running Successfully"
    }