# 2C2P Payments Power

A Kiro Power that provides comprehensive developer documentation for integrating with the **2C2P Payment Gateway** — accept cards, digital wallets, QR payments, and alternative payment methods across Southeast Asia.

## What's Included

- **POWER.md** — Main power definition with onboarding flow, sandbox credentials, and integration overview
- **steering/** — Detailed guides for each integration method

### Steering Files

| File | Description |
|------|-------------|
| getting-started.md | Sandbox setup, authentication, first API call, test cards |
| redirect-integration.md | Hosted payment page (simplest method) |
| direct-integration.md | Direct API with custom UI (full control) |
| payment-apis.md | Core API reference (payment token, do payment, inquiry) |
| payment-maintenance.md | Refunds, voids, settlements, recurring payments |
| mobile-sdk.md | iOS and Android SDK integration |
| web-sdk.md | Web SDK drop-in UI |
| quickpay.md | Payment link generation (no-code payments) |
| shopping-cart-plugins.md | WooCommerce, Magento, Shopify, OpenCart |
| softpos.md | NFC device as payment terminal |
| payout.md | Disburse funds to beneficiaries |
| snap.md | SNAP integration (Indonesia) |
| batch-services.md | Bulk operations and reconciliation |
| references.md | Response codes, test cards, encryption, JWT |
| troubleshooting.md | Error diagnosis grouped by integration type |

## Usage

Install this power in Kiro, then ask about 2C2P payment integration. The agent will:

1. Detect your tech stack
2. Ask about your target environment (sandbox/production)
3. Guide credential storage securely
4. Recommend the best integration path for your use case

## Supported Payment Methods

- **Cards** — Visa, Mastercard, Amex, JCB, UnionPay
- **Digital Wallets** — Apple Pay, Google Pay, Alipay, WeChat Pay, Line Pay, GrabPay
- **Alternative** — Internet banking, QR codes, over-the-counter, direct debit

## License

MIT — see [LICENSE](./LICENSE)
