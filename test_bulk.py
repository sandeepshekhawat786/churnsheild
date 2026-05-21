import requests

url = "http://127.0.0.1:8000/bulk_predict"
csv_path = r"d:\Churn\ChurnShield\ChurnShield\ml\dataset\test.csv"

try:
    with open(csv_path, 'rb') as f:
        files = {'file': ('test.csv', f, 'text/csv')}
        response = requests.post(url, files=files)
        print("Status Code:", response.status_code)
        print("Response Text:", response.text[:2000])
except Exception as e:
    print("Error:", e)
