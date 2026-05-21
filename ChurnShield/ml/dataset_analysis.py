import pandas as pd

# Load datasets
train_df = pd.read_csv("dataset/train.csv")
val_df = pd.read_csv("dataset/validation.csv")
test_df = pd.read_csv("dataset/test.csv")

# Display shapes
print("Train Shape:", train_df.shape)
print("Validation Shape:", val_df.shape)
print("Test Shape:", test_df.shape)

# Display first rows
print("\nTrain Dataset Preview:")
print(train_df.head())

# Dataset info
print("\nDataset Info:")
print(train_df.info())

# Missing values
print("\nMissing Values:")
print(train_df.isnull().sum())

# Target distribution
print("\nCustomer Status Distribution:")
print(train_df['Customer Status'].value_counts())