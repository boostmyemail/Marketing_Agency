# Email Templates — Boost My Email

Reusable HTML email templates for the Full Ecosystem Setup ($10k) productized service.

## Structure

- `/templates` — base HTML files for each of the 13 program types. Never edit these directly for a client.
- `/clients` — one folder per client, forked from `/templates`. This is where client-specific customisation lives.
- `/_tokens` — reference brand token files.

## How to onboard a new client

1. Create a new folder under `/clients/[client-name]/`
2. Copy `/_tokens/example-brand-tokens.css` → `/clients/[client-name]/brand-tokens.css`
3. Update the 6–8 CSS variables in `brand-tokens.css` to match the client's brand
4. Copy the relevant base template(s) from `/templates/` into the client folder
5. Paste the brand token block into the top of each copied template (replacing the default tokens)
6. Fill in copy, merge tags, and CTA URLs
7. Log each email in the Notion Template Library database with a link back to this file

## Program types (22 emails total)

| Folder | Emails | Description |
|---|---|---|
| welcome | 1 | First email after signup |
| free-user-onboarding | 4 | Activation sequence for free tier |
| trial-onboarding | 4 | Activation sequence for trial users |
| paid-onboarding | 4 | Onboarding for new paying customers |
| demo-contact-confirmation | 1 | Confirmation after demo/contact request |
| lead-nurture | 6 | 3-month nurture for non-PLG SaaS |
| product-nurture | 6 | 3-month nurture for PLG SaaS |
| product-changelog | 1 | Reusable changelog/release notes template |
| milestone | 3 | Usage milestone celebration emails |
| winback | 1 | Re-engagement for churned users |
| abandoned-cart | 1 | Abandoned upgrade/checkout recovery |
| nps-to-review | 2 | NPS ask → review request |
| expansion-upgrade | 3 | Seat/plan upgrade / cross-sell |
