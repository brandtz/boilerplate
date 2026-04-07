# Third-Party Integrations

## Integrations Register

| Field | Value |
|---|---|
| **Service Name** | *(e.g., Stripe, Auth0, SendGrid)* |
| **Purpose** | *(e.g., payment processing, authentication, transactional email)* |
| **Tier / Plan** | *(e.g., free, pro, enterprise)* |
| **Configuration** | *(env vars required — e.g., `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)* |
| **Auth Mechanism** | *(API key, OAuth 2.0, service account, mTLS)* |
| **SDK / Client Library** | *(package name and version — e.g., `stripe@14.x`)* |
| **Known Limitations** | *(rate limits, region restrictions, data residency)* |
| **Failure Modes** | *(timeout behaviour, retry strategy, circuit breaker)* |
| **Cost Model** | *(per-request, per-seat, flat rate, usage tiers)* |
| **Fallback / Degradation** | *(graceful degradation strategy when service is unavailable)* |

---

> Copy the table above for each integration. Group by category (auth, payments, storage, messaging, etc.) using level-2 headings.

## Categories (suggested)

- **Authentication & Identity** — Auth0, Clerk, Firebase Auth, etc.
- **Payments & Billing** — Stripe, Paddle, LemonSqueezy, etc.
- **Database & Storage** — Supabase, PlanetScale, S3, etc.
- **Messaging & Email** — SendGrid, Resend, Twilio, etc.
- **Monitoring & Logging** — Datadog, Sentry, LogRocket, etc.
- **CDN & Edge** — Cloudflare, Vercel Edge, Fastly, etc.
- **AI & ML** — OpenAI, Anthropic, Replicate, etc.
- **Other** — any service not fitting the above categories
