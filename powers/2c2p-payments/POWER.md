---
name: "2c2p-payments"
displayName: "2c2p-payments"
description: "Integration guide for 2C2P. Accept cards, digital wallets, QR payments, and alternative payment methods across Southeast Asia via Hosted Payment Page, Direct API, Web SDK, QuickPay links, and shopping cart plugins."
keywords: ["2c2p", "payments", "gateway", "api", "integration", "quickpay", "paymentlink", "checkout", "pgw"]
author: "2C2P By Antom"
---

# 2C2P Payment Gateway Developer Guide

## Overview

This power provides comprehensive developer documentation for integrating with the **2C2P Payment Gateway (PGW)** — a full-service payment platform enabling online merchants to accept card, digital wallet, and alternative payment methods across Southeast Asia and globally.

**What 2C2P offers:**
- Accept payments via Visa, Mastercard, Amex, JCB, UnionPay, and more
- Digital wallets: Apple Pay, Google Pay, Alipay, WeChat Pay, Line Pay, GrabPay
- Alternative payments: Internet banking, over-the-counter, QR codes, direct debit
- Multiple integration methods: Hosted payment page, Direct API, Mobile SDK, Web SDK, plugins
- Regional coverage: Singapore, Thailand, Malaysia, Philippines, Hong Kong, and beyond

This documentation covers all integration methods, API references, payment flows, SDKs, and troubleshooting guidance.

## Agent Onboarding Behavior

When a user activates this power or asks about 2C2P / QuickPay / payment integration, follow this conversational flow:

### 1. Detect the User's Tech Stack
Inspect the workspace for project files (package.json, *.csproj, requirements.txt, composer.json, go.mod, project.godot, etc.). If the workspace is empty or ambiguous, ask the user what tech stack they're using.

### 2. Ask About Environment
Ask: "Which environment do you want to connect to — **Sandbox** (testing) or **Production** (live payments)?"
- Sandbox: Provide demo credentials from the steering file
- Production: Ask if they already have credentials. If not, direct them to https://2c2p.com/contact-us/

### 3. Guide Credential Storage
Based on their tech stack, guide secure credential placement:
- Node.js → `.env` file
- .NET → User Secrets / appsettings + Key Vault
- Python → `.env` or environment variables
- PHP → `.env` (Laravel) or config file
- Java → `application.properties` with env var references
- Unity/Godot → Server-side only, never in game client

### 4. Choose Integration Path
Based on what they want to do, load the appropriate steering file and guide implementation.

**If the user is unsure or wants the simplest option, recommend QuickPay Link first** — it's one API call to generate a payment link, no frontend UI needed, works from any backend language.

**For QuickPay Link integration**, load steering file: `quickpay.md`

### 5. Collect URLs for Redirect API Integration

**When the user chooses Redirect API (Hosted Payment Page) or you recommend it**, you **MUST** ask for the following URLs before proceeding with implementation:

1. **Frontend URL** — The URL where the customer will be redirected after payment completion (success/failure page).
2. **Backend URL** — The webhook/callback URL where 2C2P will send payment notifications (backend-to-backend).

Ask:
> "To configure the Redirect API integration, I need two URLs:
> 1. **Frontend URL** — Where should customers be redirected after payment? (e.g., `https://yoursite.com/payment/complete`)
> 2. **Backend URL** — Where should 2C2P send payment notifications? (e.g., `https://yoursite.com/api/payment/notify`)
>
> ⚠️ Both URLs must be **publicly accessible** — 2C2P's servers need to reach them over the internet."

**Do NOT proceed with code generation until both URLs are provided.** If the user provides a localhost or private network URL, warn them that it will not work in sandbox or production — 2C2P cannot reach private addresses. Suggest using a tunneling tool (e.g., ngrok) for local development if needed.

---

## Sandbox / Test Credentials

> ⚠️ **IMPORTANT**: The credentials below are for **sandbox/testing only**. They do NOT work in production. For production credentials, merchants must contact 2C2P directly at https://2c2p.com/contact-us/.

### Payment Gateway API (JWT-based)

| Country | Currency | Merchant ID | Secret Key (HMAC SHA-256) |
|---------|----------|-------------|---------------------------|
| Singapore | SGD | `JT01` | `ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9` |

### QuickPay API (HMAC-SHA1-based)

| Country | Currency | Merchant ID | Secret Key |
|---------|----------|-------------|------------|
| Singapore | SGD | `JT01` | `7jYcp4FxFdf0` |
| Myanmar | MMK | `JT02` | `YDRbw14OtHw3` |
| Indonesia | IDR | `JT03` | `uA7yXRa8PjVe` |
| Thailand | THB | `JT04` | `QnmrnH6QE23N` |
| Philippines | PHP | `JT05` | `B6LkVg5k07yg` |
| Hong Kong | HKD | `JT06` | `gVULqA2gT6Gi` |
| Malaysia | MYR | `JT07` | `XXqmLinNwsQO` |
| Vietnam | VND | `JT08` | `C8843nw92bx4` |

### When Users Ask for Test Credentials

Users can ask for sandbox/test credentials at any time. Provide them freely — they are public demo values. Always remind users:
- These are **sandbox-only** credentials for development and testing
- They will **NOT** work against production endpoints
- For production credentials, contact 2C2P sales/support

---

## Credential Handling Rules for Agent

When implementing code for users, follow these **strict rules** for handling credentials:

### Rule 1: Never Hardcode Secrets in Application Code

❌ **NEVER do this:**
```csharp
string secretKey = "7jYcp4FxFdf0"; // WRONG — hardcoded secret
```

❌ **NEVER do this either (fallback to hardcoded value):**
```csharp
string secretKey = Environment.GetEnvironmentVariable("SECRET_KEY") ?? "7jYcp4FxFdf0"; // WRONG — fallback exposes secret
```

✅ **DO THIS — fail if secret is missing:**
```csharp
string secretKey = Environment.GetEnvironmentVariable("PGW_SECRET_KEY") 
    ?? throw new InvalidOperationException("Required environment variable PGW_SECRET_KEY is not set.");
```

### Rule 2: Store Secrets in the Preferred Secret Storage for the Tech Stack

When generating implementation code, place credentials in the appropriate secret storage file — **never inline in source code**.

**Node.js / JavaScript / TypeScript → `.env` file:**
```env
PGW_MERCHANT_ID=<YOUR_MERCHANT_ID>
PGW_SECRET_KEY=<YOUR_SECRET_KEY>
QUICKPAY_MERCHANT_ID=<YOUR_MERCHANT_ID>
QUICKPAY_SECRET_KEY=<YOUR_SECRET_KEY>
```

**C# / .NET → `appsettings.json` (non-secret values) + User Secrets or environment variables (secrets):**
```json
// appsettings.json — safe for non-secret config
{
  "PGW": {
    "BaseUrl": "https://sandbox-pgw.2c2p.com",
    "MerchantId": "<YOUR_MERCHANT_ID>"
  }
}
```
```env
# Secret Key via environment variable or User Secrets — never in appsettings.json
PGW__SecretKey=<YOUR_SECRET_KEY>
```

**Python → `.env` file:**
```env
PGW_MERCHANT_ID=<YOUR_MERCHANT_ID>
PGW_SECRET_KEY=<YOUR_SECRET_KEY>
```

**PHP → `.env` file (Laravel) or environment variables:**
```env
PGW_MERCHANT_ID=<YOUR_MERCHANT_ID>
PGW_SECRET_KEY=<YOUR_SECRET_KEY>
```

**Java → `application.properties` with env var references:**
```properties
pgw.merchant-id=${PGW_MERCHANT_ID}
pgw.secret-key=${PGW_SECRET_KEY}
```

### Rule 3: Use Placeholder Values — Never Inject Real Keys into Code

When writing code for the user, always use placeholder format:
```
<YOUR_MERCHANT_ID>
<YOUR_SECRET_KEY>
```

Do NOT inject the sandbox test keys directly into the user's source code files, even for testing. Place them only in the appropriate secret storage file (`.env`, User Secrets, etc.).

### Rule 4: Ask Permission Before Reading User Secrets

Before reading any file that may contain secrets (`.env`, `appsettings.json` with secrets, User Secrets, `credentials.json`, etc.), **always ask the user for permission first**. Example:

> "I need to check your `.env` file to verify your credential configuration. May I read it?"

Never silently read secret-containing files.

### Rule 5: Providing Sandbox Values on Request

When a user explicitly asks for sandbox/test credentials (e.g., "What's the test secret key for Singapore?"), provide the value from the table above. But when writing implementation code, still follow Rules 1–3: place the value in the secret storage file with placeholder format, and read it from environment in the code.

**Example workflow when user asks to implement with sandbox credentials:**

1. Create/update `.env` (or equivalent) with the sandbox value:
   ```env
   PGW_SECRET_KEY=ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9
   ```
2. In the source code, read from environment — no fallback:
   ```javascript
   const secretKey = process.env.PGW_SECRET_KEY;
   if (!secretKey) throw new Error('Required env var PGW_SECRET_KEY is not set');
   ```

---

## Available Steering Files

This power organizes documentation into focused steering files. Load specific files based on your integration needs:

- **getting-started** - Sandbox setup, authentication, first API call, test cards
- **redirect-integration** - Hosted payment page integration (simplest method)
- **direct-integration** - Direct API integration with custom UI (full control)
- **payment-apis** - Core API reference (payment token, do payment, inquiry, maintenance)
- **payment-maintenance** - Refunds, voids, settlements, recurring payments
- **mobile-sdk** - iOS and Android SDK integration
- **shopping-cart-plugins** - WooCommerce, Magento, Shopify, OpenCart plugins
- **web-sdk** - Web SDK drop-in UI for websites
- **quickpay** - Payment link generation for no-code payments
- **softpos** - Turn NFC devices into payment terminals
- **payout** - Disburse funds to beneficiaries
- **snap** - SNAP integration (Indonesia)
- **batch-services** - Bulk operations and reconciliation
- **references** - Response codes, test cards, encryption, JWT, reference data
- **troubleshooting** - Complete response code reference and troubleshooting guide grouped by integration type and user situation

Call action "readSteering" with the appropriate steering file name to access detailed documentation.

## External Documentation (For Deeper Detail)

When steering files don't have enough detail, the agent can fetch source documents directly from 2C2P's developer portal. Each steering file includes a `## References` section with fetchable URLs (add `.md` to any 2C2P docs URL to get markdown format).

Example: `https://developer.2c2p.com/docs/api-quickpay-generate-link.md`

The agent should use `web_fetch` on these URLs when the steering content is insufficient for the user's question.

## Quick Start

### 1. Get Sandbox Credentials

Start with the sandbox environment to test without processing real payments:

- **Sandbox Base URL**: `https://sandbox-pgw.2c2p.com`
- **Demo Merchant ID**: `JT01` (or request from 2C2P team)
- **Authentication**: JWT tokens signed with HMAC SHA-256

### 2. Choose Your Integration Method

**QuickPay Link** — Easiest to implement ⭐
- Generate a payment link via one API call, send to customer
- No checkout UI to build — 2C2P hosts everything
- Works from any backend (Node, Python, PHP, C#, Java, etc.)
- Customer pays via the link in browser — supports all payment methods
- Best for: Invoicing, social commerce, phone orders, any scenario needing a payment link fast
- **Read steering file**: `quickpay.md`

**Hosted Payment Page (Redirect API)** — Simple, full-featured
- Redirect customers to 2C2P-hosted checkout
- No UI to build or maintain
- All payment methods supported
- Best for: E-commerce checkout with minimal development

**Direct API** — Full control
- Build custom checkout UI
- Submit payment details via API
- Handle 3DS, wallets, alternative payments
- Best for: Custom user experience, brand control

**Mobile SDK** — Native mobile apps
- iOS and Android SDKs
- Native payment UI components
- Best for: Mobile app integration

**Web SDK** — Embedded payment UI
- Drop-in payment UI for websites
- Minimal frontend code
- Best for: Quick web integration with customization

**Shopping Cart Plugins** — No code required
- Pre-built plugins for WooCommerce, Magento, Shopify, OpenCart
- Best for: E-commerce platforms

### 3. Make Your First API Call

Request a payment token to verify your setup:

```bash
curl --location --request POST 'https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken' \
--header 'Content-Type: application/json' \
--data-raw '{
    "payload": "<your-signed-jwt-token>"
}'
```

The payload is a JWT-signed JSON containing:
```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "description": "Test payment",
    "amount": 1000.00,
    "currencyCode": "SGD"
}
```

Successful response:
```json
{
    "webPaymentUrl": "https://sandbox-pgw-ui.2c2p.com/payment/4.3/#/token/...",
    "paymentToken": "kSAops9Zwhos8hSTSeLTUcCr...",
    "respCode": "0000",
    "respDesc": "Success"
}
```

### 4. Test with Test Cards

Use these test cards in sandbox:

| Card Scheme | Card Number        | CVV  | OTP    |
|-------------|-------------------|------|--------|
| Visa        | 4111111111111111  | 123  | 123456 |
| Mastercard  | 5555555555554444  | 123  | 123456 |
| Amex        | 378282246310005   | 1234 | —      |

## Integration Paths

### Hosted Payment Page (Redirect API)

**Flow:**
1. Request payment token from 2C2P
2. Redirect customer to hosted payment page
3. Customer completes payment on 2C2P page
4. Receive backend notification
5. Redirect customer back to your site

**Prerequisites — collect from user before implementation:**
- **Frontend URL** (redirect after payment) — must be publicly accessible
- **Backend URL** (webhook for payment notifications) — must be publicly accessible

**Use when:**
- You want the fastest integration
- You don't need custom payment UI
- You want 2C2P to handle PCI compliance

**Read steering file**: `redirect-integration.md`

### Direct API Integration

**Flow:**
1. Request payment token
2. Collect payment details on your page
3. Submit payment via Do Payment API
4. Handle 3DS redirects if needed
5. Receive payment result

**Use when:**
- You need full control over UI/UX
- You want custom checkout experience
- You're handling PCI compliance

**Read steering file**: `direct-integration.md`

### Mobile SDK

**Flow:**
1. Import SDK into iOS/Android app
2. Initialize SDK with merchant credentials
3. Present payment UI
4. Handle payment result in app

**Use when:**
- Building native mobile apps
- Want native payment experience
- Need mobile-optimized flows

**Read steering file**: `mobile-sdk.md`

## Payment Methods Supported

### Card Payments
- Visa, Mastercard, Amex, JCB, UnionPay, Diners, Discover
- 3D Secure authentication
- Card tokenization for recurring payments
- Installment payment plans (IPP)

### Digital Wallets
- Apple Pay, Google Pay
- Alipay, WeChat Pay
- Line Pay, GrabPay
- Regional wallets (GCash, TrueMoney, Touch 'n Go, etc.)

### Alternative Payments
- Internet banking / Mobile banking
- Over-the-counter payments
- QR code payments (EMV QR, Visa QR, Mastercard QR)
- Direct debit
- Self-service kiosks

## Authentication

All 2C2P API requests use **JSON Web Tokens (JWT)** for security:

1. Build JSON payload with request parameters
2. Sign payload as JWT using HMAC SHA-256 with your Secret Key
3. Send signed JWT in `payload` field
4. Decode JWT response using same Secret Key

**Example JWT generation** (Node.js):
```javascript
const jwt = require('jsonwebtoken');

// Secret key loaded from environment — never hardcode
const secretKey = process.env.PGW_SECRET_KEY;
if (!secretKey) throw new Error('Required env var PGW_SECRET_KEY is not set');

const payload = {
    merchantID: process.env.PGW_MERCHANT_ID,
    invoiceNo: "1523953661",
    amount: 1000.00,
    currencyCode: "SGD"
};

const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
```

For complete JWT documentation, read steering file: `references.md` (Encryption and Signature section)

## Environment URLs

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://sandbox-pgw.2c2p.com` |
| Production | `https://pgw.2c2p.com` |

## Common Workflows

### Accept a Card Payment (Hosted Page)
1. Request payment token → `POST /payment/4.3/paymentToken`
2. Redirect to `webPaymentUrl` from response
3. Customer completes payment
4. Receive backend notification at your webhook URL
5. Show confirmation page

### Accept a Card Payment (Direct API)
1. Request payment token → `POST /payment/4.3/paymentToken`
2. Collect card details on your page
3. Submit payment → `POST /payment/4.3/doPayment`
4. Handle 3DS redirect if required
5. Check payment status → `POST /payment/4.3/paymentInquiry`

### Refund a Payment
1. Call Payment Inquiry to verify transaction
2. Submit refund request → Payment Maintenance API
3. Check refund status → Refund Status Inquiry API

### Tokenize a Card for Recurring Payments
1. Request payment token with `storeCard: true`
2. Complete initial payment
3. Store returned `cardToken`
4. Use `cardToken` for future payments without re-entering card

## Best Practices

### Security
- Never expose Secret Key in client-side code
- Never hardcode secrets in source code — always load from environment variables or secret managers
- Never use fallback values that contain real secrets (e.g., `?? "7jYcp4FxFdf0"` is forbidden)
- Always fail explicitly if a required secret is missing from the environment
- Store secrets in the appropriate location for the tech stack (`.env`, User Secrets, Key Vault, etc.)
- Always validate JWT signatures on responses
- Use HTTPS for all API calls
- Implement backend notification handling (webhooks)
- Store card tokens securely, never store raw card data

### Error Handling
- Check `respCode` in all API responses
- `0000` = Success, other codes indicate errors
- Implement retry logic for network failures
- Log all API requests and responses for debugging
- Handle 3DS redirects gracefully

### Testing
- Test all payment methods in sandbox before going live
- Use country-specific test cards for regional payment methods
- Test error scenarios (declined cards, expired cards, insufficient funds)
- Verify backend notifications are received correctly
- Test refund and void operations

### Performance
- Cache payment tokens appropriately (they expire)
- Implement timeout handling for API calls
- Use asynchronous processing for backend notifications
- Monitor API response times

### Compliance
- Follow PCI DSS requirements if handling card data
- Implement Strong Customer Authentication (SCA) for European cards
- Handle customer data per GDPR/local regulations
- Display clear payment terms and conditions

## Troubleshooting

### Common Issues

**Payment Token Request Fails**
- Verify JWT signature is correct
- Check Merchant ID matches your credentials
- Ensure all required fields are present
- Validate amount format (decimal with 2 places)

**3DS Authentication Fails**
- Ensure you're handling redirects correctly
- Check browser allows popups/redirects
- Verify return URLs are accessible
- Test with 3DS test cards

**Backend Notification Not Received**
- Verify webhook URL is publicly accessible
- Check firewall allows 2C2P IP addresses
- Implement proper JWT validation on notifications
- Return HTTP 200 response to acknowledge receipt

**Payment Inquiry Returns Wrong Status**
- Allow time for payment processing (few seconds)
- Use correct invoice number
- Check you're querying correct environment (sandbox vs production)

### Response Codes

Common response codes:

| Code | Meaning |
|------|---------|
| 0000 | Success |
| 2001 | Invalid merchant ID |
| 2003 | Invalid currency code |
| 2004 | Invalid amount |
| 2014 | Duplicate invoice number |
| 4001 | Card declined |
| 4002 | Insufficient funds |
| 4003 | Invalid card number |

For complete response code reference, read steering file: `references.md`

## Going Live

When ready to move from sandbox to production:

1. **Get production credentials** — Contact 2C2P via https://2c2p.com/contact-us/ or your regional office (see Contact section below)
2. **Update base URL** to `https://pgw.2c2p.com`
3. **Replace credentials** with production Merchant ID and Secret Key
4. **Configure production webhook URL** for backend notifications
5. **Run live test transaction** with small amount
6. **Monitor first transactions** closely

## Contact 2C2P

**Sales & General Enquiries:** https://2c2p.com/contact-us/

| Region | Email | Phone |
|--------|-------|-------|
| Singapore | singapore@2c2p.com | +65 6717 2333 |
| Thailand | support@2c2p.com | +66 2 116 7000 |
| Malaysia | malaysia@2c2p.com | +603 27164523 |
| Indonesia | indonesia@2c2p.com | +62 21 29339169 |
| Philippines | philippines@2c2p.com | +63 2 8899 7996 |
| Vietnam | vietnam@2c2p.com | +84 2888802299 |
| Hong Kong | hongkong@2c2p.com | +852 8202 2280 |

Use the contact form for: production credential requests, account activation, payment method enablement, technical support escalation, merchant onboarding, sales inquiries, or any general questions about 2C2P services.

## Additional Resources

- **Official Documentation**: https://developer.2c2p.com/docs/
- **Sandbox Environment**: https://sandbox-pgw.2c2p.com
- **Contact / Support**: https://2c2p.com/contact-us/

---

**Platform**: 2C2P Payment Gateway
**Documentation Version**: 2026-04-30
**Coverage**: All integration methods, APIs, SDKs, and payment methods
**License**: Proprietary

## License and support

**License**: Proprietary
- [Privacy Policy](https://2c2p.com/privacy/)
- [Support](https://2c2p.com/contact-us/)
