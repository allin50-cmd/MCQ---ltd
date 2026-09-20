# MCQ Audio — Production Website, Commerce, Hire & Culture

Production repository for MCQ Entertainments Ltd, an established 55-year audio business.

MCQ is not a demo storefront. The product combines an image-first audio web magazine with real commercial workflows for equipment sales/sourcing, PA hire, installation, trade supply, specialist legacy audio, vinyl and Urban music culture.

## Product surfaces

Current product scope includes:

- image-first Shop Audio
- headphones
- microphones
- DJ equipment
- wireless / hi-fi
- specialist sourcing
- hard-to-find and legacy audio
- PA hire
- installation
- trade enquiries
- Magazine / editorial
- Urban Underground
- Urban Chart
- Urban Art / client-supplied street art
- Live
- Vinyl / White Labels
- Swap Shop
- About / MCQ heritage

## Core commercial rule

**No validated image = no public commercial card.**

A public product also needs truthful supply/price wording.

The site distinguishes:

- **IN_STOCK_MCQ** — real MCQ stock evidence
- **AVAILABLE_TO_ORDER** — approved supplier route with confirmed current terms
- **SOURCE_THROUGH_MCQ** — market-visible item that MCQ still needs to confirm
- **DRAFT** — incomplete evidence; not public

Public retailer data is market research, not MCQ stock.

No fake MCQ inventory or prices are seeded.

## Image policy

Commercial product imagery must be the exact product/model and suitable for the displayed size.

Preferred sources:

1. MCQ-owned photography
2. authorised manufacturer/reseller media
3. authorised supplier feeds

Wrong-model substitutions, generated branded lookalikes, broken images and text/icon product placeholders are rejected.

The production image gate is implemented by the site image validation code and build/runtime tests.

## Supplier and market integration

The codebase contains supplier/search support and market evidence surfaces.

Current principles:

- no undocumented supplier API is simulated
- public market price is not wholesale cost
- cost price must come from real supplier/account evidence
- market rows retain source and checked-at information
- incomplete supplier evidence results in a quote/source CTA, not fake Buy Now

The repo includes support for Farnell/element14 integration when valid MCQ credentials are configured.

## Competitor monitoring

MCQ tracks relevant UK competitors and specialists to understand:

- current retail prices
- availability
- bundles
- delivery propositions
- finance
- warranties/returns
- loyalty/VIP
- clearance/B-stock
- editorial ideas
- hire/install propositions
- UX and merchandising

This research is for learning and commercial positioning. It must not copy competitor branding, proprietary content or unlicensed imagery.

## Hire flow

Real hire equipment must be added through the protected equipment API.

Customer journey:

equipment → availability → enquiry → draft quote → received deposit → confirmed booking

General hire enquiries can also be submitted without selecting an equipment item.

The core hire business rules remain deterministic.

## Ecommerce status

Do not assume full ecommerce checkout from the presence of product cards.

A genuine live Buy flow requires:

- confirmed MCQ sellable inventory/supplier route
- real cost and retail price
- durable order state
- connected live payment provider
- successful payment testing
- fulfilment/error/refund handling

Until those conditions are met, the correct public action is quote/reserve/source/enquiry.

## Persistence

The application currently uses the repository's JSON-backed store unless production infrastructure overrides it.

That store is acceptable only where the deployed service provides appropriate persistent storage and the operating model remains compatible with a single writer.

It must not be described as durable multi-instance ecommerce storage.

Before scaling order/payment/inventory operations across multiple instances, migrate the business data to a durable production database while preserving the deterministic business rules.

## Run locally

```bash
cp .env.example .env
npm test
npm start
```

Open:

```
http://localhost:3000
```

## Environment

- `PORT` — HTTP port
- `MCQ_DATA_FILE` — JSON persistence path
- `MCQ_ADMIN_TOKEN` — bearer token for protected equipment/payment/booking mutations
- `FARNELL_API_KEY` — optional element14/Farnell Product Search API key

Never commit production credentials.

## Evidence discipline

Repository status language is restricted to:

- **CODED**
- **TESTED**
- **DEPLOYED**
- **LIVE-VERIFIED**

CI success proves tests passed. It does not by itself prove a production route works for a real customer.

See `AGENTS.md` for the binding MCQ production rules.
