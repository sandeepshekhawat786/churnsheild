import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(BASE_DIR, "ml", "saved_model", "xgboost_model.pkl")
PREPROCESSOR_PATH = os.path.join(BASE_DIR, "ml", "saved_model", "preprocessor.pkl")

model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)


def get_model():
    return model


def get_preprocessor():
    return preprocessor