# SoftPOS

## What is SoftPOS?

2C2P SoftPOS turns any NFC-enabled Android device into a certified contactless payment terminal. No dedicated hardware or proprietary device is needed — merchants accept card-present payments directly on a standard Android smartphone or tablet.

## Requirements

- NFC-capable Android device
- Valid 2C2P merchant account with SoftPOS enabled

## How It Works

1. Customer taps their contactless card or device near the merchant's Android device
2. The NFC chip reads payment credentials
3. The 2C2P SoftPOS application processes the transaction through the payment network
4. A result is returned to your application (within seconds)

## Integration Options

SoftPOS supports four integration models:

### 1. Standalone App

- **No code required** — download from Google Play and activate
- Best for: merchants who want immediate payment acceptance
- [Google Play](https://play.google.com/store/apps/details?id=com.ccpp.softpos.android)

### 2. Mobile SDK (Native)

- Embed the SoftPOS SDK directly into your Android app
- Your app owns the entire payment experience (NFC tap, processing, result)
- Best for: fully integrated single-app merchant experiences

**Flow:**
```
Your App → SDK.pay(paymentToken) → NFC Tap → 2C2P → PaymentResultResponse
```

### 3. Device-to-App (Pay Server / HTTP over LAN)

- SoftPOS app runs a lightweight HTTP server on the device
- Any device on the same LAN can send HTTP requests to trigger payments
- Best for: existing POS systems, kiosks, or non-Android platforms

**Endpoint:** `POST /api/v1/trans`

**Flow:**
```
Your System → HTTP POST → SoftPOS App → NFC Tap → 2C2P → HTTP Response
```

### 4. App-to-App (Android Intents)

- Your Android app communicates with the standalone SoftPOS app via Android Intents
- Uses the `poslib` wrapper library for a clean API
- Best for: developers who want payment processing isolated in the dedicated SoftPOS app

**Flow:**
```
Your App → Android Intent (poslib) → SoftPOS App → NFC Tap → 2C2P → Intent Result
```

## Comparison

| | Standalone | Mobile SDK | App-to-App | Device-to-App |
|---|---|---|---|---|
| Integration required | No | Yes | Yes | Yes |
| Integration style | N/A | Native SDK | Android Intents | HTTP over LAN |
| Platform | Android | Android | Android | Any |
| SoftPOS app required | Yes | No | Yes | Yes |
| Network required | No | No | No | Yes (LAN) |
| NFC handled by | SoftPOS app | Your app (via SDK) | SoftPOS app | SoftPOS app |

## Full Detail

`raw/docs_content/10-softpos/overview.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [SoftPOS Overview](https://developer.2c2p.com/docs/softpos-overview.md)
