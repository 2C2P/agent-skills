# 2C2P Payments — AI Plugin

A skill that guides developers through integrating with the **2C2P Payment Gateway** — from sandbox setup to production deployment. Covers all integration methods: Hosted Payment Page, Direct API, Web SDK, Mobile SDK, QuickPay links, and shopping cart plugins.

## Platform Support

This directory is packaged for **Codex** (`.codex-plugin/plugin.json`), **Qoder** (`.qoder-plugin/plugin.json`), and **Cursor** (`.cursor-plugin/plugin.json`). The manifests coexist; each IDE reads only its own manifest file.

## Source Provenance

- **Source**: `agent-skills-main` (2C2P internal developer documentation)
- **Original formats**: Kiro Power (`POWER.md`), Codex plugin (`.codex-plugin/plugin.json`), standalone `SKILL.md`
- **Converted to**: Qoder plugin format (`.qoder-plugin/plugin.json`)
- **Repository**: https://github.com/2C2P/agent-skills

## What's Included

### Skill

| Skill | Description |
|-------|-------------|
| `2c2p-payments` | Main integration guide — detects tech stack, recommends integration path, guides credential storage, and walks through implementation step by step |

### Steering Files (Reference Docs)

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

## Setup

No external dependencies are required. All documentation is self-contained in the steering files.

### Credentials

- **Sandbox**: Demo credentials are provided in the steering file `getting-started.md`
- **Production**: Contact 2C2P at https://2c2p.com/contact-us/

## Logo

Placeholder SVG avatar generated for this plugin. Replace with the official 2C2P logo if available.

## Installation (Cursor)

```bash
curl -fsSL https://raw.githubusercontent.com/2C2P/agent-skills/main/install-cursor.sh | bash
```

Or install manually:

1. Download `2c2p-payments-0.1.0.zip` from https://github.com/2C2P/agent-skills
2. Extract the skill to `~/.cursor/skills/2c2p-payments/`
3. Restart Cursor or reload the window

For team distribution, import the repository as a Cursor Team Marketplace from **Dashboard → Settings → Plugins → Team Marketplaces → Import**.

## Installation (Qoder)

```bash
curl -fsSL https://raw.githubusercontent.com/2C2P/agent-skills/main/install-qoder.sh | bash
```

Or install manually:

1. Download `2c2p-payments-0.1.0.zip` from https://github.com/2C2P/agent-skills
2. Extract it to `~/.qoder/plugins/2c2p-payments/`
3. Restart Qoder or reload the workspace

## Installation (Codex)

```bash
codex plugin marketplace add 2C2P/agent-skills --ref main
codex plugin add 2c2p-payments@2c2p-tools
```

## Installation (VS Code)

```bash
curl -fsSL -o /tmp/2c2p-payments.vsix https://github.com/2C2P/agent-skills/releases/download/vscode-v0.1.0/2c2p-payments-0.1.0.vsix && code --install-extension /tmp/2c2p-payments.vsix
```

> `code --install-extension` accepts an extension ID or a local `.vsix` path — not a URL. The extension must be downloaded first.
