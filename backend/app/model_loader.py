import joblib

MODEL_PATH = "../../ml/saved_model/xgboost_model.pkl"
PREPROCESSOR_PATH = "../../ml/saved_model/preprocessor.pkl"

# Load trained model
model = joblib.load(MODEL_PATH)

# Load preprocessor
preprocessor = joblib.load(PREPROCESSOR_PATH)