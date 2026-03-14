import os
import json
import requests
import sys
from dotenv import load_dotenv

# Add core_logic to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '_Agency_Tools', 'core_logic'))
from hubspot_audit_core import fetch_workflows, get_workflow_details

# Load environment variables from the secure Sidecar directory
env_path = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\ambrook.env'
firecrawl_path = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\firecrawl.env'

load_dotenv(dotenv_path=env_path)
load_dotenv(dotenv_path=firecrawl_path)

token = os.getenv('HUBSPOT_TOKEN')
headers = {'Authorization': f'Bearer {token}'}

def main():
    workflows = fetch_workflows(token)
    print(f'Found {len(workflows)} workflows')
    
    for wf in workflows[:20]: # Check first 20 for speed
        id = wf['id']
        wf_detail = get_workflow_details(token, id)
        if not wf_detail: continue
        
        actions = wf_detail.get('actions', [])
        for a in actions:
            if 'EMAIL' in a.get('type', '').upper():
                print(f"Workflow {id} ({wf['name']}) has email action:")
                print(json.dumps(a, indent=2))
                return
        
        meta = wf_detail.get('typeSpecificMetaData', {}).get('stepMetaDataList', [])
        for m in meta:
            if 'EMAIL' in m.get('type', '').upper():
                print(f"Workflow {id} ({wf['name']}) has email action in meta:")
                print(json.dumps(m, indent=2))
                return

if __name__ == "__main__":
    main()
