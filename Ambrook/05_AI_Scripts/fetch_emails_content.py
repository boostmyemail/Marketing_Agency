import os
import json
import sys
from dotenv import load_dotenv

# Add core_logic to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '_Agency_Tools', 'core_logic'))
from email_fetcher_py import fetch_email_details

# Load environment from the secure Sidecar directory
env_path = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\ambrook.env'
firecrawl_path = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\firecrawl.env'

load_dotenv(dotenv_path=env_path)
load_dotenv(dotenv_path=firecrawl_path)

HUBSPOT_TOKEN = os.getenv("HUBSPOT_TOKEN")
EMAIL_IDS = [
    "205468468264",
    "205592629174",
    "205592629604",
    "205592663187",
    "205592414778"
]

if __name__ == "__main__":
    results = []
    for email_id in EMAIL_IDS:
        print(f"Fetching {email_id}...")
        try:
            content = fetch_email_details(HUBSPOT_TOKEN, email_id)
            results.append(content)
            print(f"ID: {content['id']} | Name: {content['name']}")
            print(f"Subject: {content['subject']}")
            print("-" * 20)
        except Exception as e:
            print(e)
    
    with open("email_contents_raw.json", "w") as f:
        json.dump(results, f, indent=2)
