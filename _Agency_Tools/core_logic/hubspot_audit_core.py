import requests
import datetime

def get_headers(token):
    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

def fetch_workflows(token):
    url = "https://api.hubapi.com/automation/v3/workflows"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code != 200:
        return []
    return response.json().get('workflows', [])

def get_workflow_details(token, workflow_id):
    url = f"https://api.hubapi.com/automation/v3/workflows/{workflow_id}"
    response = requests.get(url, headers=get_headers(token))
    if response.status_code != 200:
        return None
    return response.json()

def extract_email_ids(wf_detail):
    email_ids = []
    actions = wf_detail.get('actions', [])
    for action in actions:
        if action.get('type') == 'EMAIL':
            email_id = action.get('emailContentId')
            if email_id:
                email_ids.append(str(email_id))
    return list(set(email_ids))

def fetch_30_day_stats(token, email_ids):
    # Define time window
    end_time = datetime.datetime.now(datetime.UTC)
    start_time = end_time - datetime.timedelta(days=30)
    
    start_iso = start_time.isoformat().replace('+00:00', 'Z')
    end_iso = end_time.isoformat().replace('+00:00', 'Z')

    all_stats = {}
    chunk_size = 50
    
    for i in range(0, len(email_ids), chunk_size):
        chunk = email_ids[i:i + chunk_size]
        url = "https://api.hubapi.com/marketing/v3/emails/statistics/list"
        query_params = [
            ('startTimestamp', start_iso),
            ('endTimestamp', end_iso),
            ('limit', 100)
        ]
        for eid in chunk:
            query_params.append(('emailIds', eid))
            
        response = requests.get(url, headers=get_headers(token), params=query_params)
        if response.status_code != 200:
            continue
            
        data = response.json().get('results', [])
        for item in data:
            email_id = str(item.get('emailId'))
            all_stats[email_id] = item

    return all_stats
