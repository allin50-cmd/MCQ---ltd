# MCQ Hire — Christmas/New Year revenue tool

Minimal dependency-free Node 20 service for MCQ's real hire journey:

equipment → availability → enquiry → quote → received deposit → confirmed booking.

This is deliberately not AgentX and not a generic platform.

## Run

npm test
npm start

Data is persisted to data/mcq.json (gitignored). Enter MCQ's real equipment through POST /equipment; no inventory or prices are seeded.

## Acceptance

1. Enter one real MCQ item and price.
2. Query availability for the real hire period.
3. Capture a real enquiry through POST /enquiries.
4. Create the quote.
5. Confirm a deposit only after money is actually received; a real payment reference is mandatory.
6. Confirm booking.
7. A second overlapping booking for that equipment must fail.

The current payment edge is manual confirmation against an actual external payment reference. Stripe/SumUp can replace that edge later without changing booking rules.
