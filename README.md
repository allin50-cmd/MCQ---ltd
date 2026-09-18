# MCQ Entertainments — Hire Website

Dependency-light Node 20 website and hire backend for MCQ Entertainments Ltd.

## What is included

- public customer website
- mobile responsive hire catalogue
- availability checks
- hire enquiry flow
- automatic draft quote when a real inventory item is selected
- existing deposit and booking rules preserved
- live supplier directory
- Farnell / element14 Product Search API adapter
- protected admin mutations
- Docker image for AWS/container deployment

## Run

```bash
cp .env.example .env
npm test
npm start
```

Open http://localhost:3000.

## Environment

- `PORT` — HTTP port
- `MCQ_DATA_FILE` — current JSON persistence path
- `MCQ_ADMIN_TOKEN` — bearer token required for equipment, payment-confirmation and booking mutations
- `FARNELL_API_KEY` — optional element14/Farnell API key. Without it the website falls back to the live Farnell product-search link.

## Supplier integration

The public site links directly to Farnell, CPC, Canford Audio, Thomann UK and Gear4music.

When `FARNELL_API_KEY` is configured, `GET /api/suppliers/farnell/search?q=...` calls the official element14 Product Search API for the UK Farnell catalogue.

No undocumented supplier API is simulated.

## Hire flow

Real equipment must be added through the protected equipment API. No fake MCQ inventory or prices are seeded.

Customer journey:

equipment → availability → enquiry → draft quote → received deposit → confirmed booking

A general hire enquiry can also be submitted without selecting an equipment item.

## Important production note

The current store remains the repo's original JSON file store. It is suitable for local/demo use and a single server with persistent storage, but it is **not yet the final AWS production database**. Before multi-instance production deployment, move persistence to PostgreSQL while keeping the same business rules.

## Truth status

- Website/backend: CODED
- Core hire-rule tests: TESTED once CI passes on this branch
- Supplier links: CODED
- Farnell live API: CODED, requires MCQ API credentials for LIVE-VERIFIED
- AWS: NOT DEPLOYED
