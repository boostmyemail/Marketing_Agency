import requests
import pandas as pd
import datetime
import os
import time

def get_hubspot_email_stats(token, start_date_iso, end_date_iso):
    """
    Fetches email IDs that had activity in the time span, then fetches 
    individual statistics for each of those emails.
    """
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # 1. Get the list of email IDs that were active during the span
    list_url = "https://api.hubapi.com/marketing/v3/emails/statistics/list"
    params = {
        'startTimestamp': start_date_iso,
        'endTimestamp': end_date_iso
    }
    
    print(f"Requesting active email list for period: {start_date_iso} to {end_date_iso}")
    response = requests.get(list_url, headers=headers, params=params)
    
    if response.status_code != 200:
        raise Exception(f"HubSpot API Error (List): {response.status_code} - {response.text}")
    
    list_data = response.json()
    email_ids = list_data.get('emails', [])
    
    if not email_ids:
        print("No emails found with activity in this time range.")
        return pd.DataFrame()

    # FIX: Deduplicate email IDs from the API response
    unique_email_ids = list(set(email_ids))
    print(f"Found {len(email_ids)} IDs ({len(unique_email_ids)} unique). Fetching individual statistics...")
    
    all_stats = []
    
    # 2. Fetch stats for each individual email ID
    for eid in unique_email_ids:
        email_url = f"https://api.hubapi.com/marketing/v3/emails/{eid}"
        
        stats_url = f"https://api.hubapi.com/marketing/v3/emails/statistics/list"
        stats_params = {
            'emailIds': eid,
            'startTimestamp': start_date_iso,
            'endTimestamp': end_date_iso
        }
        
        stats_resp = requests.get(stats_url, headers=headers, params=stats_params)
        
        if stats_resp.status_code == 200:
            s_data = stats_resp.json()
            agg = s_data.get('aggregate', {})
            counters = agg.get('counters', {})
            ratios = agg.get('ratios', {})
            
            # Get email name for better reporting
            name_resp = requests.get(email_url, headers=headers)
            email_name = "Unknown"
            if name_resp.status_code == 200:
                email_name = name_resp.json().get('name', 'Unknown')
            
            row = {
                'Email Id': eid,
                'Email Name': email_name
            }
            row.update(counters)
            row.update(ratios)
            all_stats.append(row)
        
        time.sleep(0.1)

    df = pd.DataFrame(all_stats)
    
    # Filter for active volume (Sent > 0)
    if not df.empty and 'sent' in df.columns:
        df = df[df['sent'] > 0]
    
    return df

def process_and_export_stats(df, output_path):
    """
    Standardizes column names and exports to Excel.
    """
    if df.empty:
        print("No active email data found for the specified period.")
        return False
        
    df.columns = [str(col).replace('_', ' ').title() for col in df.columns]
    
    df.to_excel(output_path, index=False, engine='openpyxl')
    return True
