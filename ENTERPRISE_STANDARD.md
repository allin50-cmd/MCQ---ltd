# Enterprise Platform Standard

Status: BINDING FOR ALL AGENTS AND CONTRIBUTORS
Effective: 2026-09-23

This standard applies to every change in this repository. It adds to, and never relaxes, any other binding rule file in this repository. Where two rules conflict, the stricter rule applies.

## 0. Execution boundary

This repository is its own business/product boundary. Consequential actions go through this product's governed execution path, and through UltraTech Runtime where this product is integrated with AgentX. Do not merge data, authority or IP across business boundaries. AgentX agents operating on this product act only through the governed Runtime and never bypass authority, policy, tenant boundaries or audit controls.

## 1. Standard

Every change is held to: enterprise-grade, production-ready, auditable, secure, reliable, supportable, operationally useful. The customer must be able to use the system in a real business environment now.

This is not a demo, funding prototype, MVP, sales mockup or sandbox unless the customer has explicitly requested an experimental environment. Do not use "good enough for now", "MVP", "we can harden it later", "demo", "proof of concept" or "temporary production workaround" to justify a change.

## 2. Non-negotiable operating principles

1. Graft before build.
2. Inspect the existing estate before changing anything.
3. Reuse proven production components.
4. Do not create duplicate systems (runtime, memory, approval, orchestration, connector, database, control plane).
5. Do not weaken controls to make tests pass.
6. Do not hide failures behind polished UI.
7. Do not fake business data, transactions, customers, integrations or evidence.
8. Do not ship "temporary" production shortcuts.
9. Do not defer reliability, security, auditability or data-integrity work to "later".
10. Do not treat a successful deployment as successful business operation.

## 3. Truth states

Use only: `CODED`, `TESTED`, `DEPLOYED`, `LIVE_VERIFIED`, `BLOCKED`, `UNKNOWN`.

`CODED ≠ TESTED ≠ DEPLOYED ≠ LIVE_VERIFIED`. Never promote a state without evidence. `LIVE_VERIFIED` requires a real production journey.

Code existing, tests passing, CI green, an API returning 200, a host reporting LIVE, a page rendering, a database row existing, an email request being accepted or an AI producing a plausible answer are intermediate engineering states, not completion.

## 4. Trusted execution path

Probabilistic AI may interpret, classify, summarise, recommend, plan, draft and reason. It must not be the final authority for consequential business execution.

```
USER / BUSINESS EVENT -> INTENT -> VALIDATED PARAMETERS -> PREPARED ACTION
-> POLICY -> AUTHORITY -> APPROVAL WHEN REQUIRED -> DETERMINISTIC EXECUTION
-> RESULT -> EVIDENCE -> AUDIT RECEIPT
```

AI models are replaceable components. The business control plane must keep working when an AI provider is degraded or unavailable wherever deterministic operation is possible.

Every consequential action must be authenticated, authorised, policy-controlled, traceable, durable, idempotent, recoverable, observable and evidenced, and reconstructable as:
`OBJECTIVE -> INTENT -> POLICY -> AUTHORITY -> ACTION -> APPROVAL -> EXECUTION -> RESULT -> EVIDENCE`.
No invisible consequential actions.

## 5. Approval policy

- `AUTO` — low-risk, reversible, routine actions.
- `PREPARE` — AI prepares; an operator executes.
- `HITL` — financial, contractual, legal, destructive, high-value or otherwise consequential actions per policy.

Approval must be meaningful, not ceremonial. Do not force approval on everything.

## 6. Engineering requirements

**Access control:** centralised identity; least privilege; role-based permissions; secure sessions; no public administrative access; no hard-coded bypasses; no shared plaintext credentials; auditable access changes.

**Data:** clear system of record; durable persistence; transaction and foreign-key integrity; explicit ownership; tenant/business separation; backup and recovery; no cross-client leakage.

**Security:** secrets server-side only; RLS where applicable; privileged functions reviewed; no exposed service-role credentials; secure storage policies; verified webhook signatures; input validation; IDOR/BOLA protection; dependency review; security-advisor findings reviewed.

**Reliability:** retries only where safe; idempotency for external effects; stale-write protection; deterministic conflict handling; failure isolation; timeouts; provider fallback where appropriate; no double charging, duplicate messages or duplicate external actions.

**Observability:** structured logs; request/action IDs; business correlation IDs; provider status; failure reason; latency; execution result; evidence reference; operator-visible status.

## 7. Integrations

Treat every external integration as a production dependency. Verify authentication, scopes, request contract, error handling, retry behaviour, rate limits, webhook verification, idempotency, provider evidence, business-side persistence and degraded behaviour.

Never claim "email sent", "payment taken", "booking created", "record updated", "lead delivered" or "invoice issued" from a local API call alone. Verify the external effect wherever the provider supports it.

## 8. User experience

The product is for business staff, not developers. It must be understandable without technical knowledge, work on desktop and mobile, distinguish pending/successful/failed states, never claim success before evidence exists, provide recovery paths, avoid dead ends and technical jargon, and keep infrastructure complexity invisible.

A polished screen with broken operations is a failed product. A working backend with an unusable interface is also a failed product.

## 9. Business-journey testing

Tests cover business outcomes, not only functions. "POST returned 200" is not a business test. A journey test proves: authenticated operator initiated the action; policy authorised it; correct customer/account selected; provider accepted it; external effect verified; business record updated; audit receipt created; duplicate replay produced no second effect; the UI showed the correct final state.

## 10. Production completion rule

Before declaring a workflow `LIVE_VERIFIED`, prove all of:

1. correct user/tenant;
2. correct permissions;
3. correct production configuration;
4. real production persistence;
5. correct policy decision;
6. real external integration where required;
7. correct result;
8. evidence retained;
9. failure path tested;
10. retry/idempotency behaviour tested;
11. UI reflects actual state;
12. audit trail exists.

If any item cannot be demonstrated the state is `UNKNOWN` or `BLOCKED`. Never "mostly working".

## 11. Change control

1. Inspect the existing implementation.
2. Inspect contracts and architecture.
3. Search for reusable components.
4. Determine customer/business impact.
5. Determine security and data impact.
6. Make the smallest safe production change.
7. Add or repair tests.
8. Deploy through the existing path.
9. Verify production.
10. Retain evidence.

Do not rewrite major systems casually, introduce infrastructure for fashion, or migrate working production components without a concrete business or reliability reason.

## 12. Failure handling

If the same area fails repeatedly, stop patching symptoms. Perform an end-to-end root-cause audit across every boundary:
`Browser -> API -> authentication -> authorisation -> policy -> database -> queue -> external provider -> callback/webhook -> persistence -> receipt -> UI`.
Fix the actual broken boundary. Do not stack workarounds.

## 13. Iteration

`TEST -> REVIEW -> IMPROVE -> REPEAT` until `LIVE_VERIFIED` or a genuine external blocker exists. PR open, CI green, deployment live, health 200 and UI visible are not stopping points.

## 14. Reporting

For every major workflow report:

- **VERIFIED** — facts supported by production evidence.
- **BLOCKED** — known blockers and exact cause.
- **UNKNOWN** — anything not yet proven.
- **NEXT ACTION** — the single most important production action.
- **EVIDENCE** — exact commit, workflow run, deployment, database record, provider receipt or production journey receipt.

No optimism, implied success, investor language or demo language.
