# Agency Operations Manual: Marketing_Agency

## System Architecture

- **Root Directory**: `Marketing_Agency`
- **Client Folders**: `./Glide`, `./Ambrook`, `./SchoolAI` (each organized into `01` through `05` subfolders)
- **Core Engine**: `_Agency_Tools/` (centralized CLI, shared across all clients)
  - `index.js` — CLI entry point
  - `config/api.js` — Axios client, loads `HUBSPOT_TOKEN` from the current working directory's `.env`
  - `services/email-manager.js` — Email list, clone, update logic
  - `services/stats-manager.js` — Reporting / statistics logic

## Security Protocols

- **Credential Isolation**: Each client folder contains a private `.env` file with its own `HUBSPOT_TOKEN` and `HUBSPOT_PORTAL_ID`. Never copy tokens between folders.
- **Git Safety**: The root `.gitignore` protects all `.env` and `node_modules` folders.
- **Path Rule**: Always `cd` into the client folder before running any CLI command so the correct `.env` is loaded.

## Operational Commands

All commands are run from inside the client folder (e.g., `cd Glide`).

### Email Management
```bash
node ../_Agency_Tools/index.js email list
node ../_Agency_Tools/index.js email get <id>
node ../_Agency_Tools/index.js email templates
node ../_Agency_Tools/index.js email clone <template_key_or_id> "<new name>"
node ../_Agency_Tools/index.js email update <id> <content_file.json>
```

### Reporting
```bash
node ../_Agency_Tools/index.js reporting stats \
  --ids <id1,id2,...> \
  --start <ISO8601_timestamp> \
  --end <ISO8601_timestamp>
```

**Stats output includes:**
- Counters: sent, delivered, open, click, bounce (hard/soft), unsubscribed, dropped
- Rates: open rate, click rate, click-through rate (clicks/opens), bounce rate, unsubscribe rate
- Email IDs active during the specified period

For brand strategy and tone, refer to `agency_system_instructions.md`.
