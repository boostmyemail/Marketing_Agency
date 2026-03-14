import requests
import os
import datetime
from dotenv import load_dotenv

ENV_PATH = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\ambrook.env'
load_dotenv(dotenv_path=ENV_PATH)
token = os.getenv('HUBSPOT_TOKEN')

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

url = "https://api.hubapi.com/marketing/v3/emails/statistics/list"
end_iso = datetime.datetime.now(datetime.UTC).isoformat().replace('+00:00', 'Z')
start_iso = (datetime.datetime.now(datetime.UTC) - datetime.timedelta(days=365)).isoformat().replace('+00:00', 'Z')

params = {
    'startTimestamp': start_iso,
    'endTimestamp': end_iso,
    'limit': 5
}

response = requests.get(url, headers=headers, params=params)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Top level keys: {list(data.keys())}")
if 'results' in data:
    print(f"Results count: {len(data['results'])}")
    if len(data['results']) > 0:
        first = data['results'][0]
        print(f"First result keys: {list(first.keys())}")
        print(f"First result aggregate keys: {list(first.get('aggregate', {}).keys())}")
        print(f"First result counters: {first.get('aggregate', {}).get('counters', {})}")
else:
    print("No 'results' key found in response.")
