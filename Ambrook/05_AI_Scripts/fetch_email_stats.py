import os
import sys
import datetime
from dotenv import load_dotenv

# Path Awareness: Add core_logic directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '_Agency_Tools', 'core_logic'))

from hubspot_analytics import get_hubspot_email_stats, process_and_export_stats

# Follow the Sidecar Protocol: Absolute path for credentials
ENV_PATH = r'C:\Users\micha_txj2ety\Documents\Agency_Secrets\ambrook.env'

def run_analytics_tool():
    # Load Environment Variables
    if not os.path.exists(ENV_PATH):
        print(f"Error: Credentials not found at {ENV_PATH}")
        sys.exit(1)
        
    load_dotenv(dotenv_path=ENV_PATH)
    
    # Adhere to Logging Safety
    HUBSPOT_TOKEN = os.getenv('HUBSPOT_TOKEN')
    
    if not HUBSPOT_TOKEN:
        print("Error: HUBSPOT_TOKEN not found in environment variables.")
        sys.exit(1)

    # Date Handling: v3 API requires ISO8601 format
    today = datetime.datetime.now(datetime.UTC)
    thirty_days_ago = today - datetime.timedelta(days=30)
    
    # Format to ISO 8601 (e.g., 2026-03-06T12:00:00Z)
    start_iso = thirty_days_ago.isoformat().replace('+00:00', 'Z')
    end_iso = today.isoformat().replace('+00:00', 'Z')
    
    # Filename naming convention: hubspot_email_stats_YYYYMMDD.xlsx
    timestamp = today.strftime('%Y%m%d')
    output_filename = f"hubspot_email_stats_{timestamp}.xlsx"
    
    # Workspace Hygiene: Save output to 04_Assets
    output_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '04_Assets', output_filename))

    print(f"--- Fetching HubSpot Email Stats for Ambrook ---")
    print(f"Period: {start_iso} to {end_iso}")
    
    try:
        # Fetch data
        df = get_hubspot_email_stats(HUBSPOT_TOKEN, start_iso, end_iso)
        
        # Process and Export
        if process_and_export_stats(df, output_path):
            print(f"Successfully exported data to: {output_path}")
        else:
            print("No data available to export.")
            
    except Exception as e:
        print(f"Extraction failed: {str(e)}")

if __name__ == "__main__":
    run_analytics_tool()
