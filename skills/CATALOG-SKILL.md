---
name: 2c2p-payments
description: Guide developers through 2C2P payment gateway integration — accept cards, digital wallets, QR payments, and alternative payment methods across Southeast Asia. Use when the user asks about 2C2P, payment integration, checkout, QuickPay links, or payment gateway setup.
type: skill
version: v1.0.0
team: tech-team
tags: [payments, 2c2p, gateway, integration, checkout, quickpay, sdk, southeast-asia]
runtime: None
badge: null

compatibility:
  claude: true
  kiroCli: true
  kiroIde: true
  mac: true
  windows: true
  linux: true

requirements:
  runtime: "None"
  packages: []
  mcp: []
  disk: "~250 KB"

author: tech-team
source: bitbucket.org/2c2p/agent-skills
license: MIT

install:
  claudeCode: |
    Install the "2c2p-payments" skill for Claude Code.
    1. Create ~/.claude/skills/2c2p-payments/
    2. Download from: https://ai-hub.uat-shareservice.twocp.xyz/dl/2c2p-payments-1.0.0.tar.gz
    3. Extract so SKILL.md and steering/ directory are at the root.
    4. Verify by reading SKILL.md and confirming trigger phrases.

  kiroCli: |
    Install the "2c2p-payments" skill for Kiro CLI.
    1. Create ~/.kiro/skills/2c2p-payments/
    2. Download from: https://ai-hub.uat-shareservice.twocp.xyz/dl/2c2p-payments-1.0.0.tar.gz
    3. Extract so SKILL.md and steering/ directory are at the root.
    4. Verify by reading SKILL.md and confirming trigger phrases.

  kiroIde: |
    Install the "2c2p-payments" skill for Kiro IDE.
    1. Create ~/.kiro/skills/2c2p-payments/
    2. Download from: https://ai-hub.uat-shareservice.twocp.xyz/dl/2c2p-payments-1.0.0.tar.gz
    3. Extract so SKILL.md and steering/ directory are at the root.
    4. Verify by reading SKILL.md and confirming trigger phrases.

  manual: |
    Install the "2c2p-payments" skill manually.
    1. Choose install dir: ~/.claude/skills/ (Claude Code) or ~/.kiro/skills/ (Kiro CLI/IDE)
    2. Create 2c2p-payments/ subdirectory.
    3. Download from: https://ai-hub.uat-shareservice.twocp.xyz/dl/2c2p-payments-1.0.0.tar.gz
    4. Extract so SKILL.md and steering/ are at the root.
    5. Verify SKILL.md is readable.
---

## Overview

Guides developers through integrating with the 2C2P Payment Gateway — from sandbox setup to production deployment. Covers Hosted Payment Page, Direct API, Web SDK, Mobile SDK, QuickPay links, and shopping cart plugins across Southeast Asia.

## What this skill does

Detects the user's tech stack, recommends the best integration path, guides secure credential storage, and provides step-by-step implementation using 15 detailed steering files covering every 2C2P integration method, API reference, and troubleshooting guide.

## Trigger phrases

- "integrate 2c2p", "2c2p payment", "2c2p gateway"
- "accept payments", "payment integration", "checkout integration"
- "quickpay", "payment link", "generate payment link"
- "hosted payment page", "redirect api"
- "direct api payment", "card payment api"
- "mobile sdk payment", "web sdk payment"
- "2c2p sandbox", "2c2p test credentials"
- "refund payment", "void transaction", "recurring payment"

## Configuration

No external dependencies required. All documentation is self-contained in the steering files.
