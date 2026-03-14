import os
import datetime
import pandas as pd
import sys
from dotenv import load_dotenv
from openpyxl.styles import Font

# Add core_logic to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '_Agency_Tools', 'core_logic'))
from hubspot_audit_core import fetch_workflows, get_workflow_details, extract_email_ids, fetch_30_day_stats

# Load environment variables from the secure Sidecar directory
env_path = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\ambrook.env'
firecrawl_path = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\firecrawl.env'

load_dotenv(dotenv_path=env_path)
load_dotenv(dotenv_path=firecrawl_path)

HUBSPOT_TOKEN = os.getenv('HUBSPOT_TOKEN')

def main():
    if not HUBSPOT_TOKEN:
        print("Missing HUBSPOT_TOKEN in .env file.")
        return

    workflows = fetch_workflows(HUBSPOT_TOKEN)
    if not workflows:
        print("No workflows found.")
        return

    workflow_emails_map = {}
    all_unique_email_ids = set()

    print(f"Analyzing {len(workflows)} workflows...")
    for wf in workflows:
        wf_id = wf['id']
        wf_name = wf['name']
        detail = get_workflow_details(HUBSPOT_TOKEN, wf_id)
        if detail:
            email_ids = extract_email_ids(detail)
            if email_ids:
                workflow_emails_map[wf_name] = email_ids
                all_unique_email_ids.update(email_ids)

    stats_map = fetch_30_day_stats(HUBSPOT_TOKEN, list(all_unique_email_ids))

    report_data = []
    today = datetime.date.today()

    for wf_name, email_ids in workflow_emails_map.items():
        for email_id in email_ids:
            email_stats_entry = stats_map.get(email_id)
            if not email_stats_entry: continue
            counters = email_stats_entry.get('counters', {})
            sends = counters.get('sent', 0)
            if sends == 0: continue

            opens = counters.get('open', 0)
            clicks = counters.get('click', 0)
            bounces = counters.get('bounce', 0)
            unsubs = counters.get('unsubscribed', 0)

            report_data.append({
                'Workflow Name': wf_name,
                'Email ID': email_id,
                'Sends': sends,
                'Opens': opens,
                'Clicks': clicks,
                'Bounces': bounces,
                'Unsubscribes': unsubs,
                'Open Rate': opens / sends if sends > 0 else 0,
                'Click Rate': clicks / sends if sends > 0 else 0,
                'CTOR': clicks / opens if opens > 0 else 0,
                'Bounce Rate': bounces / sends if sends > 0 else 0,
                'Unsubscribe Rate': unsubs / sends if sends > 0 else 0
            })

    if not report_data:
        print("No automated emails found with activity in the last 30 days.")
        return

    df = pd.DataFrame(report_data)
    df = df.sort_values(by='Workflow Name')
    output_file = f"HubSpot_Audit_Last30Days_{today}.xlsx"
    sheet_name = f"Audit_{today}"

    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=sheet_name)
        worksheet = writer.sheets[sheet_name]
        for cell in worksheet["1:1"]:
            cell.font = Font(bold=True)
        for col_idx in range(8, 13):
            for row in range(2, len(df) + 2):
                cell = worksheet.cell(row=row, column=col_idx)
                cell.number_format = '0.0%'
        for column_cells in worksheet.columns:
            length = max(len(str(cell.value)) for cell in column_cells)
            worksheet.column_dimensions[column_cells[0].column_letter].width = length + 2

    print(f"\nAudit complete! File saved: {output_file}")

if __name__ == "__main__":
    main()
