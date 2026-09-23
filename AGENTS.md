# MCQ Production Agent Rules

> Binding: read `ENTERPRISE_STANDARD.md` before any change. It adds to these rules; where rules conflict, the stricter rule applies.

MCQ is an established 55-year audio business. Treat this repository as a live commercial system for a real business, never as a demo, concept page, sandbox, portfolio piece or speculative startup.

## Mission

Build and operate an image-first high-quality audio web magazine that also sells equipment, supports specialist sourcing, PA hire, installation, trade supply, vinyl/music culture and MCQ's Urban Underground ecosystem.

The website must combine:
- professional audio retail,
- specialist and hard-to-find stock,
- hire and installation,
- editorial / magazine content,
- real music culture,
- MCQ heritage and knowledge.

Do not narrow the product back to a hire-only website or a generic ecommerce template.

## Truth mode

Never invent or seed business facts for presentation.

Do not fabricate:
- MCQ stock,
- supplier stock,
- supplier relationships,
- cost prices,
- margins,
- retail prices,
- delivery promises,
- customer counts,
- bookings,
- payments,
- reviews,
- votes,
- artists,
- product specifications,
- product images,
- commercial availability.

Synthetic fixtures may exist only inside tests and must never leak into public production data or screenshots presented as real operations.

When evidence is missing, say so in the product state and fail closed.

## Non-negotiable scope

Preserve client-requested capabilities. Improve or stage them; never silently remove them.

These remain part of the product:
- Shop Audio,
- specialist legacy / hard-to-find stock,
- Hire & Install,
- Trade,
- Magazine,
- Urban Underground,
- Urban Gallery / street art,
- Urban Art Chart,
- Urban music chart,
- Live,
- Vinyl / White Labels,
- Swap Shop,
- About / MCQ heritage.

Existing working APIs and business flows are grafted and improved before replacement. Do not create a parallel mock product when the real production surface can be improved directly.

## Image-first commercial rule

Pictures sell the stock. Commercial cards are image-led.

A sale, hire, sourcing or editorial product card may be rendered publicly only when all applicable checks pass:

1. the exact brand and model are identified;
2. the image exists and loads successfully;
3. the image is high enough resolution for the intended surface;
4. the image depicts the exact stated product/model;
5. the image source is recorded;
6. stock, price and availability wording match the evidence state;
7. the card has a truthful customer action.

Never ship:
- broken image icons,
- blank product-image boxes,
- text/icon placeholders standing in for product photography,
- low-resolution thumbnails stretched into hero media,
- generated branded-product lookalikes,
- a sibling/different model used as a substitute,
- generic lifestyle imagery presented as the product,
- competitor photography used as a substitute for exact product media.

If the image gate fails, remove the entire commercial card from public rendering and keep the item hidden/DRAFT until corrected.

Preferred image order:
1. MCQ-owned product photography;
2. manufacturer product media;
3. supplier product media;
4. otherwise do not publish the commercial card.

### Development-phase image permission rule

While the catalogue and ecommerce system are still being developed, image permission/licence status is **not a publication blocker**.

Development image validation requires:
- exact product/model match;
- high-resolution image;
- working image URL;
- recorded image source.

Permission/licence review can be reinstated as a separate production/legal readiness gate before full ecommerce launch.


## Required catalogue row contract

For every product MCQ may want to sell, the catalogue record must carry the following fields before it can progress beyond DRAFT:

- exact brand;
- exact model;
- category;
- at least one high-resolution image;
- image source;
- supplier;
- supplier SKU / product code;
- real current availability;
- observed public price inc VAT where relevant;
- real supplier cost price when known;
- delivery / carriage cost;
- MCQ retail price;
- last-checked date;
- source URL;
- source / evidence note.

Commercial calculation fields should also be present:

- Public Net ex VAT;
- Estimated Trade Cost ex VAT;
- Estimated Landed Cost ex VAT;
- Suggested MCQ Retail inc VAT;
- Max Buy Cost ex VAT @ Target GM;
- Required Supplier Discount vs Public Net;
- Projected GM %;
- Decision.

### Critical interpretation rules

`Estimated Trade Cost ex VAT` and `Estimated Landed Cost ex VAT` are planning values only unless they are backed by a real supplier quote, invoice, trade account price or authorised feed.

`Suggested MCQ Retail inc VAT` is not automatically the live selling price. It becomes publishable only after real landed cost and margin have been confirmed.

`VIABLE (MODEL)` means commercially viable under the model assumptions only. It does **not** mean MCQ can sell the item yet.

A row may become `AVAILABLE_TO_ORDER` only when:
- supplier route is approved,
- supplier SKU is known,
- current supplier availability is verified,
- real cost price is confirmed,
- delivery cost is confirmed,
- margin is acceptable,
- MCQ retail price is approved.

A row may become `IN_STOCK_MCQ` only when MCQ itself holds the stock and that stock position is evidenced.

Otherwise the correct state is `SOURCE_THROUGH_MCQ` or `DRAFT`.

### Public-market example rows

The 2026-09-20 market workbook contains researched public-market rows for products including:
- Sennheiser HD 25;
- Audio-Technica ATH-M50X;
- Shure SM58 LC;
- Shure SM57 LC;
- Sennheiser e835;
- Yamaha HS5;
- ADAM Audio T5V;
- JBL 305P MKII;
- PreSonus Eris 3.5 2nd Gen;
- Denon DJ SC Live 4;
- Numark Mixstream Pro+;
- Technics SL-1210MK7;
- Alto TS412;
- JBL EON715;
- Zoom H4essential;
- Ortofon Concorde Mix MKII System;
- Pioneer DJ DDJ-FLX10;
- Pioneer DJ DDJ-FLX4;
- AlphaTheta DDJ-GRV6.

These rows are public-market evidence and planning inputs. They are not proof of MCQ stock, MCQ trade cost, final MCQ retail price.


## Inventory and ecommerce truth states

Do not confuse public-market research with MCQ inventory.

Use these commercial states:

### IN_STOCK_MCQ
Requires real MCQ stock evidence, current quantity/availability, valid image and confirmed selling price.
May support a genuine Buy action when payment and fulfilment are live.

### AVAILABLE_TO_ORDER
Requires an approved supplier route, confirmed current supplier availability, real MCQ cost/terms, valid image and calculated MCQ selling price.
May support Order/Buy only when fulfilment and payment are actually operational.

### SOURCE_THROUGH_MCQ
Used when a product is visible in the market but MCQ supply/cost is not yet confirmed.
CTA must be quote/source/enquiry — never fake checkout.

### DRAFT
Any item missing required image, supply, cost, margin, price or evidence remains non-public.

Public competitor/retailer prices are benchmarks only. They are not MCQ cost prices and do not prove MCQ can sell the product.

## Pricing and margin

Wholesale/trade cost must come from a real supplier quote, account price, invoice, approved feed or other attributable evidence.

Never reverse-engineer a pretend wholesale cost from a public retail price and present it as real.

Modelled figures are allowed for planning only when labelled MODELLED/ESTIMATED and must never be used as production truth.

Before public Buy/Order:
- calculate landed cost,
- include delivery/carriage and applicable VAT treatment,
- calculate target gross margin,
- confirm the final customer retail price,
- record checked-at time/source.

## Supplier and competitor research

Market monitoring may discover products, prices, stock signals, delivery promises, bundles, finance, editorial ideas and competitor tactics.

Research must preserve:
- source URL,
- supplier/competitor,
- observed value,
- observed availability wording,
- checked-at timestamp,
- evidence state.

A research observation does not automatically become a public product.

Fortnightly market research should identify:
- new relevant products,
- price changes,
- stock changes,
- bundles,
- delivery changes,
- finance/credit,
- warranties/returns,
- loyalty/VIP mechanics,
- clearance/B-stock,
- editorial/content ideas,
- hire/install propositions,
- UX/merchandising changes.

Learn from competitors; do not copy their brand identity, proprietary content or imagery.

## Client-supplied Urban art

Client-supplied Urban artwork is primary source material for the Urban visual identity.

Do not replace, hide or dilute supplied artwork with generic stock imagery unless explicitly directed.

Do not invent artist identities, provenance, ownership or vote counts.

Credit wording must remain factual when artist information is unconfirmed.

## Visual direction

High-end audio editorial × London club culture × street art × MCQ heritage.

The visual goal is a premium, image-first web magazine with commercial functionality.

Prefer:
- strong photography,
- dense editorial composition,
- clear product hierarchy,
- black/dark visual foundation where appropriate to the approved references,
- gold/white accents,
- bold condensed type,
- real equipment imagery,
- large image-led features,
- coherent magazine rhythm.

Avoid:
- generic SaaS dashboards,
- empty oversized whitespace,
- cheap template ecommerce,
- cream/serif drift when it conflicts with approved references,
- crowded navigation,
- decorative visuals that obscure buying/hire actions.

Uploaded/approved reference imagery is a visual contract, not a request to generate a separate mockup. Apply the direction to the real production website.

## Navigation and usability

The site must remain understandable on iPhone and desktop.

Every major interior page must provide:
- a reliable Home route,
- a reliable Back/parent route,
- clear current-section context,
- access to Shop, Urban, Magazine, Live, Hire/Install, Trade and About.

Do not solve navigation problems by adding more competing nav bars.

## Production architecture

Do not claim durability that does not exist.

If persistence is JSON/local/ephemeral, state that explicitly.

Do not call a supplier API live unless credentials and a real provider response are verified.

Do not claim ecommerce checkout is live unless:
- payment provider is connected,
- live mode is confirmed,
- successful payment flow is tested,
- order/fulfilment state is durable,
- cancellation/refund/error handling is defined.

## AgentX boundary

AgentX/AI may assist with research, summarisation, candidate discovery, document analysis and recommendations.

It must not invent commercial truth.

A deterministic publish decision must be based on evidence fields such as:
product identity → image validation → supply/stock evidence → cost → delivery → margin → retail price → publish/reject.

Do not make MCQ depend on probabilistic AI for core stock, pricing, payment or fulfilment truth.

## Evidence states

Use only:
- CODED
- TESTED
- DEPLOYED
- LIVE-VERIFIED

Do not:
- call CODED work tested,
- call TESTED work deployed,
- call DEPLOYED work live-verified,
- call a green CI build production verification.

## Change discipline

Before significant changes:
1. inspect the current production implementation;
2. state the intended outcome;
3. preserve working business flows;
4. make the smallest coherent change;
5. add/adjust tests for the rule being protected;
6. run CI;
7. deploy only if gates pass;
8. verify the live route where tooling permits.

Do not create parallel prototypes as substitutes for fixing production.

## Production closeout

Every significant change must report:
- what changed,
- what was tested,
- deployed commit,
- deployment state,
- live routes actually verified,
- evidence gaps,
- remaining blockers.

If browser/live verification was not possible, say DEPLOYED — NOT LIVE-VERIFIED.
