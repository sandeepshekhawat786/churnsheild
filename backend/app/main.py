from fastapi import FastAPI
from predictor import analyze_customer

app = FastAPI(
    title="ChurnShield API",
    description="AI Powered Telecom Customer Retention Intelligence System",
    version="1.0"
)


@app.get("/")
def home():
    return {
        "message": "ChurnShield API Running Successfully"
    }


@app.post("/predict")
def predict(customer_data: dict):

    result = analyze_customer(customer_data)

    return result