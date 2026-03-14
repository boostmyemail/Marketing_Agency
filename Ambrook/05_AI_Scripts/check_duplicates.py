import pandas as pd
import os

file_path = r'C:\Users\micha_txj2ety\Documents\Marketing_Agency\Ambrook\04_Assets\hubspot_email_stats_20260306.xlsx'

if os.path.exists(file_path):
    df = pd.read_excel(file_path)
    print(f"Total rows: {len(df)}")
    
    # Check for duplicate IDs
    id_col = 'Email Id' if 'Email Id' in df.columns else 'Email ID'
    name_col = 'Email Name' if 'Email Name' in df.columns else 'Name'
    
    if id_col in df.columns:
        dup_ids = df[df.duplicated(subset=[id_col], keep=False)]
        print(f"Rows with duplicate IDs: {len(dup_ids)}")
        if len(dup_ids) > 0:
            print("Sample duplicate IDs:")
            print(dup_ids[id_col].head(10).tolist())
            
    # Check for duplicate Names
    if name_col in df.columns:
        dup_names = df[df.duplicated(subset=[name_col], keep=False)]
        print(f"Rows with duplicate Names: {len(dup_names)}")
        if len(dup_names) > 0:
            print("Sample duplicate Names:")
            print(dup_names[name_col].head(10).tolist())
else:
    print("File not found.")
