import requests
import sys

url = "http://localhost:8000/bulk_predict"
file_path = "ml/dataset/test.csv"

print(f"Testing bulk_predict with {file_path}...")
try:
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files)
        
    if response.status_code == 200:
        data = response.json()
        print("Success!")
        print("contract_distribution:", data.get("contract_distribution"))
        print("internet_churn_distribution:", data.get("internet_churn_distribution"))
        print("monthly_charge_churn_distribution:", data.get("monthly_charge_churn_distribution"))
        print("top_influencing_factors:", data.get("top_influencing_factors"))
    else:
        print(f"Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"Failed to connect or process: {e}")
