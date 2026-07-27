---
name: 2c2p-payments
description: Guide developers through 2C2P payment gateway integration — accept cards, digital wallets, QR payments, and alternative payment methods across Southeast Asia. Use when the user asks about 2C2P, payment integration, checkout, QuickPay links, or payment gateway setup.
---

# 2C2P Payments Integration

A skill that guides developers through integrating with the 2C2P Payment Gateway — from sandbox setup to production deployment. Covers all integration methods: Hosted Payment Page, Direct API, Web SDK, Mobile SDK, QuickPay links, and shopping cart plugins.

## When this skill activates

- "integrate 2c2p", "2c2p payment", "2c2p gateway"
- "accept payments", "payment integration", "checkout integration"
- "quickpay", "payment link", "generate payment link"
- "hosted payment page", "redirect api"
- "direct api payment", "card payment api"
- "mobile sdk payment", "web sdk payment"
- "2c2p sandbox", "2c2p test credentials"
- "refund payment", "void transaction", "recurring payment"
- "payment token", "jwt payment"

## Workflow

### Step 1: Detect tech stack

Inspect the workspace for project files (`package.json`, `*.csproj`, `requirements.txt`, `composer.json`, `go.mod`, `pom.xml`, etc.). If ambiguous, ask the user what tech stack they're using.

### Step 2: Ask about environment

Ask: "Which environment — **Sandbox** (testing) or **Production** (live payments)?"

- **Sandbox**: Provide demo credentials from steering file `getting-started.md`
- **Production**: Ask if they have credentials. If not, direct to https://2c2p.com/contact-us/

### Step 3: Guide credential storage

Based on tech stack, guide secure credential placement:
- Node.js → `.env` file
- .NET → User Secrets / appsettings + Key Vault
- Python → `.env` or environment variables
- PHP → `.env` (Laravel) or config file
- Java → `application.properties` with env var references

**Rules:**
- Never hardcode secrets in source code
- Never use fallback values containing real secrets
- Fail explicitly if required secret is missing
- Use placeholder format `<YOUR_MERCHANT_ID>` / `<YOUR_SECRET_KEY>` in code

### Step 4: Choose integration path

Based on user needs, recommend and load the appropriate steering file:

| Method | Best for | Steering file |
|--------|----------|---------------|
| **QuickPay Link** ⭐ | Simplest — one API call, no UI needed | `quickpay.md` |
| **Hosted Payment Page** | E-commerce with minimal dev | `redirect-integration.md` |
| **Direct API** | Full UI control, custom checkout | `direct-integration.md` |
| **Mobile SDK** | Native iOS/Android apps | `mobile-sdk.md` |
| **Web SDK** | Drop-in web payment UI | `web-sdk.md` |
| **Shopping Cart Plugins** | WooCommerce, Magento, Shopify | `shopping-cart-plugins.md` |

**If the user is unsure, recommend QuickPay Link first** — it's one API call, no frontend needed.

### Step 5: Collect required URLs (for Redirect API)

When using Hosted Payment Page / Redirect API, **MUST** ask for:
1. **Frontend URL** — where customers redirect after payment
2. **Backend URL** — webhook for payment notifications

Both must be publicly accessible. Warn about localhost URLs.

### Step 6: Implement

Load the relevant steering file and guide implementation step by step. Follow credential handling rules strictly.

### Step 7: Test

Guide testing with sandbox test cards:
- Visa: `4111111111111111` (CVV: 123, OTP: 123456)
- Mastercard: `5555555555554444` (CVV: 123, OTP: 123456)
- Amex: `378282246310005` (CVV: 1234)

### Step 8: Go live

When ready for production:
1. Get production credentials from 2C2P
2. Update base URL to `https://pgw.2c2p.com`
3. Replace credentials
4. Configure production webhook URL
5. Run live test with small amount

## Knowledge Base

All detailed integration documentation is stored in the `steering/` directory relative to this skill file. Read the appropriate steering file when you need in-depth guidance for a specific integration method.

**Path:** `steering/` (relative to this SKILL.md)

## Steering files

| File | Topic |
|------|-------|
| `getting-started.md` | Sandbox setup, authentication, first API call, test cards |
| `redirect-integration.md` | Hosted payment page (simplest full integration) |
| `direct-integration.md` | Direct API with custom UI |
| `payment-apis.md` | Core API reference (payment token, do payment, inquiry) |
| `payment-maintenance.md` | Refunds, voids, settlements, recurring payments |
| `mobile-sdk.md` | iOS and Android SDK |
| `web-sdk.md` | Web SDK drop-in UI |
| `quickpay.md` | Payment link generation (no-code payments) |
| `shopping-cart-plugins.md` | WooCommerce, Magento, Shopify, OpenCart |
| `softpos.md` | NFC device as payment terminal |
| `payout.md` | Disburse funds to beneficiaries |
| `snap.md` | SNAP integration (Indonesia) |
| `batch-services.md` | Bulk operations and reconciliation |
| `references.md` | Response codes, test cards, encryption, JWT |
| `troubleshooting.md` | Error diagnosis by integration type |

## Examples

### Example 1 — QuickPay link integration

> User: "I want to generate a payment link for my Node.js app"

1. Detect Node.js stack
2. Confirm sandbox environment
3. Create `.env` with sandbox credentials
4. Load `quickpay.md` steering file
5. Implement HMAC-SHA1 signed request to QuickPay API
6. Return generated payment URL

### Example 2 — Hosted payment page

> User: "Set up 2C2P checkout for my .NET e-commerce site"

1. Detect .NET stack
2. Ask sandbox vs production
3. Guide User Secrets setup for credentials
4. Ask for frontend URL and backend webhook URL
5. Load `redirect-integration.md`
6. Implement JWT-signed payment token request
7. Redirect to `webPaymentUrl`
8. Implement webhook handler

### Example 3 — Refund a payment

> User: "How do I refund a 2C2P transaction?"

1. Load `payment-maintenance.md`
2. Guide through Payment Inquiry to verify transaction
3. Implement refund request via Maintenance API
4. Show how to check refund status

## Sandbox credentials

Available on request — these are public demo values for testing only:

- **Base URL**: `https://sandbox-pgw.2c2p.com`
- **Merchant ID**: `JT01` (Singapore/SGD)
- **Secret Key**: provided from steering file

Always remind users these are sandbox-only and won't work in production.

## Authentication

All 2C2P APIs use JWT (HMAC SHA-256):
1. Build JSON payload
2. Sign as JWT with Secret Key
3. Send in `payload` field
4. Decode JWT response with same key

## Notes

- When steering file content is insufficient, fetch from `https://developer.2c2p.com/docs/<page>.md`
- Always ask permission before reading files that may contain secrets
- For production credentials, direct users to https://2c2p.com/contact-us/
