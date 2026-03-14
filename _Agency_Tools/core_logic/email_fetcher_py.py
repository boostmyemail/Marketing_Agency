import requests

def clean_html(html):
    if not html: return ''
    # Simple clean, similar to JS version
    import re
    clean = re.sub(r'<p[^>]*>', '\n', html, flags=re.IGNORECASE)
    clean = re.sub(r'</p>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<br\s*/?>', '\n', clean, flags=re.IGNORECASE)
    clean = re.sub(r'&nbsp;', ' ', clean)
    clean = re.sub(r'<[^>]+>', '', clean)
    return clean.strip()

def fetch_email_details(token, email_id):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    url = f"https://api.hubapi.com/marketing/v3/emails/{email_id}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Error fetching {email_id}: {response.status_code} - {response.text}")
    
    data = response.json()
    subject = data.get("subject", "")
    widgets = data.get("content", {}).get("widgets", {})
    
    preview_text = widgets.get("preview_text", {}).get("body", {}).get("value", "")
    preview_text = preview_text.split("\n")[0].strip()

    main_body = ""
    cta_text = ""
    cta_link = ""
    
    for widget_id, widget in widgets.items():
        body = widget.get("body", {})
        module_id = body.get("module_id")
        if module_id == 1155639:
            html = body.get("html", "")
            if len(html) > len(main_body):
                main_body = html
        if module_id == 1976948:
            cta_text = body.get("text", "")
            cta_link = body.get("destination", "")

    return {
        "id": data.get("id"),
        "name": data.get("name"),
        "subject": subject,
        "preview_text": preview_text,
        "main_body": clean_html(main_body),
        "cta_text": cta_text,
        "cta_link": cta_link
    }
