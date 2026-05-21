# ChurnShield
ChurnShield is an AI-powered Customer Retention Intelligence System that predicts customer churn using XGBoost and Explainable AI (SHAP). The system analyzes customer behavior, identifies key churn-driving factors, calculates churn risk probability, and provides personalized retention recommendations to help proactively reduce customer attrition.

# 🚀 ChurnShield — AI Powered Telecom Customer Retention Intelligence System

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-orange?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-Frontend-61dafb?style=for-the-badge&logo=react)
![SHAP](https://img.shields.io/badge/Explainable_AI-SHAP-purple?style=for-the-badge)

---

# 📌 Overview

ChurnShield is an AI-powered Telecom Customer Retention Intelligence System designed to predict customer churn using Machine Learning and Explainable AI.

The system not only predicts whether a telecom customer is likely to churn, but also:

✅ Identifies the key factors influencing churn  
✅ Calculates customer churn probability and risk level  
✅ Provides personalized retention recommendations  
✅ Generates business-focused churn insights using SHAP Explainable AI  

---

# 🎯 Problem Statement

Telecom companies face significant revenue loss due to customer churn. Traditional business analysis methods often fail to identify complex behavioral patterns hidden inside telecom datasets.

ChurnShield solves this problem by using:

- 📊 Machine Learning
- 🧠 Explainable AI
- 📈 Predictive Analytics
- 🎯 Retention Intelligence

to proactively identify high-risk customers before they leave the service.

---

# ✨ Key Features

## 🔥 AI-Based Churn Prediction
- Predict telecom customer churn using XGBoost

## 📈 Churn Probability & Risk Scoring
- Low Risk
- Medium Risk
- High Risk
- Critical Risk

## 🧠 Explainable AI using SHAP
- Detects why a customer is likely to churn
- Feature-level churn analysis
- SHAP summary visualizations

## 💡 Personalized Retention Recommendations
Examples:
- Offer discounts
- Suggest better plans
- Provide premium support
- Loyalty benefits
- Service recovery actions

## 📊 Business Analytics Insights
- Feature importance analysis
- Customer churn trends
- Risk segmentation

---

# 🛠️ Technologies Used

## 💻 Frontend
- React.js
- Tailwind CSS

## ⚙️ Backend
- FastAPI
- Python

## 🤖 Machine Learning
- XGBoost
- Scikit-learn
- Pandas
- NumPy

## 🧠 Explainable AI
- SHAP

## 📉 Visualization
- Matplotlib
- Plotly

## 🗄️ Database
- PostgreSQL / MySQL

---

# 🏗️ System Architecture

```text
                           ┌────────────────────┐
                           │ Telecom Customer   │
                           │ Dataset (CSV)      │
                           └─────────┬──────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │ Data Preprocessing     │
                        │ • Missing Values       │
                        │ • Encoding             │
                        │ • Feature Selection    │
                        │ • Data Cleaning        │
                        └─────────┬──────────────┘
                                  │
                                  ▼
                        ┌────────────────────────┐
                        │ XGBoost ML Model       │
                        │ Churn Prediction       │
                        └─────────┬──────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
                ▼                                   ▼
     ┌──────────────────────┐          ┌──────────────────────┐
     │ SHAP Explainability  │          │ Churn Probability    │
     │ Feature Contribution │          │ Risk Classification  │
     └──────────┬───────────┘          └──────────┬───────────┘
                │                                  │
                └─────────────────┬────────────────┘
                                  ▼
                     ┌─────────────────────────┐
                     │ Retention Recommendation│
                     │ Engine                  │
                     │ • Discounts             │
                     │ • Loyalty Plans         │
                     │ • Premium Support       │
                     │ • Plan Optimization     │
                     └─────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Customer Retention       │
                    │ Intelligence Dashboard   │
                    └──────────────────────────┘
```

---

# ⚙️ Architecture Components

| Component | Purpose |
|---|---|
| Dataset Layer | Stores telecom customer data |
| Preprocessing Pipeline | Cleans and transforms raw data |
| XGBoost Model | Predicts churn probability |
| SHAP Explainability | Explains churn-driving factors |
| Recommendation Engine | Generates retention strategies |
| Dashboard/API Layer | Displays predictions and analytics |

---

# 🔄 Workflow Summary

1. Customer telecom data is uploaded  
2. Data preprocessing pipeline cleans and transforms the data  
3. XGBoost model predicts customer churn probability  
4. SHAP identifies the main factors influencing churn  
5. Recommendation engine generates personalized retention actions  
6. Final results are displayed through dashboard/API  

# 🧠 Machine Learning Workflow

```text
Dataset
   ↓
Data Preprocessing
   ↓
Feature Engineering
   ↓
XGBoost Training
   ↓
Model Evaluation
   ↓
SHAP Explainability
   ↓
Retention Recommendation Engine
```

---

# 📂 Project Structure

```text
ChurnShield/
│
├── ml/
│   ├── dataset/
│   ├── saved_model/
│   ├── shap_outputs/
│   ├── preprocess.py
│   ├── train_model.py
│   ├── evaluate.py
│   ├── shap_analysis.py
│   ├── customer_analysis.py
│   └── recommendation_engine.py
│
├── backend/
│
├── frontend/
│
└── README.md
```

---

# 📊 Model Performance

| Metric | Score |
|---|---|
| Accuracy | 96.66% |
| Precision | 96.61% |
| Recall | 91.44% |
| F1 Score | 93.96% |
| ROC-AUC | 99.42% |

---

# 🧪 Explainable AI Insights

SHAP analysis identifies the major factors influencing customer churn such as:

- Satisfaction Score
- Monthly Charges
- Contract Type
- Tenure in Months
- Online Security
- Number of Referrals

---

# 💡 Example Output

```text
Prediction          : Churn
Churn Probability   : 91%
Risk Level          : Critical Risk

Top Influencing Factors:
- Satisfaction Score
- Monthly Charge
- Contract

Retention Recommendations:
- Offer 15-20% discount
- Assign priority support
- Offer yearly contract benefits
```

---

# 🚀 Future Enhancements

- 📡 Real-time prediction API
- 📱 Interactive React Dashboard
- ☁️ Cloud Deployment
- 📈 Revenue-at-Risk Analytics
- 🤝 Customer Segmentation
- 📬 Automated Retention Campaigns

---

# 👨‍💻 Team Members

- Rameez Pathan
- Sandeep Shekhawat
- Pragati Sharma
- Aditi Agrawal

---

# 🌟 Project Goal

The goal of ChurnShield is to bridge the gap between AI prediction systems and real-world telecom business decision-making by combining:

✅ Predictive Analytics  
✅ Explainable AI  
✅ Retention Intelligence  

into one intelligent platform.

---
