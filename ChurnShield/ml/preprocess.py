import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
import os

# Paths
DATASET_PATH = "dataset"
SAVE_PATH = "saved_model"

os.makedirs(SAVE_PATH, exist_ok=True)

# Load datasets
train_df = pd.read_csv(f"{DATASET_PATH}/train.csv")
val_df = pd.read_csv(f"{DATASET_PATH}/validation.csv")
test_df = pd.read_csv(f"{DATASET_PATH}/test.csv")

# Remove joined customers because they have not stayed/churned properly yet
train_df = train_df[train_df["Customer Status"] != "Joined"]
val_df = val_df[val_df["Customer Status"] != "Joined"]
test_df = test_df[test_df["Customer Status"] != "Joined"]

# Target
target_col = "Churn"

# Columns to remove because of leakage or useless ID/location duplication
drop_cols = [
    "Customer ID",
    "Customer Status",
    "Churn Category",
    "Churn Reason",
    "Churn Score",
    "Lat Long"
]

# Separate features and target
X_train = train_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_train = train_df[target_col]

X_val = val_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_val = val_df[target_col]

X_test = test_df.drop(columns=drop_cols + [target_col], errors="ignore")
y_test = test_df[target_col]

# Detect column types
numeric_features = X_train.select_dtypes(include=["int64", "float64"]).columns
categorical_features = X_train.select_dtypes(include=["object"]).columns

# Numeric preprocessing
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="median"))
])

# Categorical preprocessing
categorical_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore"))
])

# Final preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)

# Fit only on training data
X_train_processed = preprocessor.fit_transform(X_train)
X_val_processed = preprocessor.transform(X_val)
X_test_processed = preprocessor.transform(X_test)

# Save preprocessor
joblib.dump(preprocessor, f"{SAVE_PATH}/preprocessor.pkl")

print("Preprocessing completed successfully.")
print("Train processed shape:", X_train_processed.shape)
print("Validation processed shape:", X_val_processed.shape)
print("Test processed shape:", X_test_processed.shape)

print("\nNumeric columns:", len(numeric_features))
print("Categorical columns:", len(categorical_features))