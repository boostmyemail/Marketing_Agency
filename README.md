# Marketing Agency - Fractional Email Marketing Workspace

This repository serves as the central hub for our fractional email marketing agency operations. It contains client-specific strategies, campaign drafts, automated flows, and a custom CLI for HubSpot integration.

## 📁 Directory Structure

- `/_Agency_Tools`: The core engine. Contains the HubSpot CLI and reusable logic.
- `/01_Strategy_Tone`: Brand DNA, persona pain points, and writing rules (Client-specific).
- `/02_Campaigns`: Past and current one-off email drafts and results.
- `/03_Automations`: Flow logic, lifecycle emails, and drip sequences.
- `/04_Assets`: Branding files, logos, and image assets.
- `/05_AI_Scripts`: Technical prompt templates and CLI launcher scripts.

## 🛠 Core Engine (_Agency_Tools)

The centralized CLI lives at `_Agency_Tools/index.js`. **ALWAYS** run commands from inside a client folder to ensure the correct `templates.json` and environment are used.

### Common Commands
```bash
# Email Management
node ../_Agency_Tools/index.js email list
node ../_Agency_Tools/index.js email templates
node ../_Agency_Tools/index.js email clone <template_key> "New Email Name"
node ../_Agency_Tools/index.js email update <id> <content_file.json>

# Reporting
node ../_Agency_Tools/index.js reporting stats --ids <id1,id2> --start <ISO8601> --end <ISO8601>
```

## 🎙 Client Voice Profiles

- **Glide**: Professional, technical, scale-oriented. Focus on "Efficiency" and "No-Code Power."
- **Ambrook**: Gritty, reliable, agricultural focus. Speaking to "Ranchers" and "Farmers."
- **SchoolAI**: Educational, empathetic, visionary. Focus on "Teachers" and "Time-saving."

## 🔐 Security & Operating Rules

1.  **STRICT CREDENTIAL PROTECTION**: Never reference literal `.env` content in chats. Secrets are store in an external sidecar directory.
2.  **CLIENT SANDBOXING**: Treat each client folder (Glide, Ambrook, SchoolAI) as strictly isolated. Only work within the requested client context.
3.  **CONTEXT FIRST**: Always confirm which client you are working on before starting a task.
4.  **READ-MODIFY-WRITE**: Always `GET` an email's JSON layout before performing an `update` to preserve structure.

## 🔄 Workflows

### Email Creation
1. Write copy based on brand voice in `01_Strategy_Tone/brand_context.md`.
2. Format into a JSON payload.
3. Run `email update` via CLI from the client folder.

### Reporting
1. Confirm Client, Email ID(s), and Date Range.
2. Run `reporting stats` and summarize open rates, CTR, and bounces in plain language.
