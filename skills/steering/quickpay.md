# 2C2P QuickPay Link Integration Guide

> **Verified**: This guide was tested end-to-end on 2026-05-12 against the sandbox environment. Link generation, payment page load, and card payment confirmation all succeeded using the code patterns and credentials documented below.

## Agent Onboarding Instructions

When a user asks to integrate 2C2P QuickPay (also called "QwikPay" or "QuickPay Link"), follow this onboarding flow:

### Step 1: Detect or Ask About the Codebase

Inspect the user's workspace to identify their tech stack:
- Look for `package.json` (Node.js/React/Angular/Vue)
- Look for `*.csproj` or `*.sln` (C#/.NET/Blazor)
- Look for `requirements.txt` or `pyproject.toml` (Python)
- Look for `pom.xml` or `build.gradle` (Java/Kotlin)
- Look for `Gemfile` (Ruby)
- Look for `go.mod` (Go)
- Look for `composer.json` (PHP)
- Look for `project.godot` (Godot)
- Look for `ProjectSettings/` folder (Unity)

If the workspace is empty or ambiguous, ASK the user:
> "What tech stack are you using? (e.g., Node.js, Python, C#/.NET, PHP, Java, React, Angular, Blazor, Unity, Godot, etc.)"

### Step 2: Ask About Environment

Ask the user:
> "Which environment do you want to connect to?"
> - **Sandbox** (for testing — I can provide demo credentials)
> - **Production** (requires your own merchant credentials from 2C2P)

### Step 3: Handle Credentials

**If Sandbox:**
- Use the appropriate demo account from the sandbox credentials table below
- Ask which country/currency they want to test with

**If Production:**
- Ask: "Do you already have your 2C2P production Merchant ID and Secret Key?"
- **If yes:** Guide them to store it securely based on their tech stack:
  - Node.js: `.env` file with `QUICKPAY_MERCHANT_ID` and `QUICKPAY_SECRET_KEY`
  - .NET: `appsettings.json` (non-secret) + User Secrets or Azure Key Vault for the secret key
  - Python: `.env` file or environment variables
  - PHP: `.env` file (Laravel) or `config.php`
  - Java: `application.properties` or `application.yml` with environment variable references
  - Unity/Godot: Server-side only — never embed secrets in game clients
- **If no:** Direct them to https://2c2p.com/ to contact support/sales for production credentials

### Step 4: Implement

Based on their stack, generate the QuickPay integration code using the API reference below.

### Step 5: After Link Generation — Offer QR Code

Once the link is generated, offer:
> "Would you also like me to generate a QR code from this payment link? Customers can scan to pay — great for in-store, printed invoices, or chat."

- If user doesn't want the link visible → suggest QR code as primary
- If user declines QR too → ask how they want customers to access payment (email, SMS, WebView, redirect)

### Step 6: Payment Verification

Ask the user how they want to know when a customer has paid:
- **Webhook (recommended):** Set `resultUrl2` — 2C2P notifies your server in real-time
- **Polling:** Store `qpID` and call Query API periodically
- Guide them to store `qpID` + `orderIdPrefix` in their database for later lookup

---

## Overview

**QuickPay** (also known as QwikPay) allows merchants to generate payment links and send them to customers via email or SMS. Customers click the link to access a 2C2P-hosted payment page and complete payment. No checkout UI needed on your side.

**Use cases:**
- Invoice payments via email/SMS
- Social commerce (share payment links on chat apps)
- Phone orders / manual orders
- Subscription sign-ups
- Game purchases (server-side link generation, redirect player)
- Any scenario where you need a payment link without building a checkout page

**Key features:**
- Generate short payment URLs
- Send links via email or SMS automatically
- Set link expiry dates
- Allow single or multiple payments per link
- Support recurring payments (RPP)
- Support installment payments (IPP)
- Query, update, and delete existing links

---

## Environment URLs

### QuickPay Direct API (Generate, Query, Update, Delete)

| Environment | URL |
|---|---|
| Sandbox | `https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DirectAPI` |
| Production | `https://t.2c2p.com/QuickPay/DirectAPI` |
| Production (Indonesia only) | `https://pgwcore.dp.alipay.com/QuickPay/DirectAPI` |

### QuickPay Delivery API (Generate+Send, Send)

| Environment | URL |
|---|---|
| Sandbox | `https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DeliveryAPI` |
| Production | `https://t.2c2p.com/QuickPay/DeliveryAPI` |
| Production (Indonesia only) | `https://pgwcore.dp.alipay.com/QuickPay/DeliveryAPI` |

---

## Sandbox Demo Accounts

| Country | Currency | Merchant ID | Secret Key |
|---|---|---|---|
| Singapore | SGD | JT01 | 7jYcp4FxFdf0 |
| Myanmar | MMK | JT02 | YDRbw14OtHw3 |
| Indonesia | IDR | JT03 | uA7yXRa8PjVe |
| Thailand | THB | JT04 | QnmrnH6QE23N |
| Philippines | PHP | JT05 | B6LkVg5k07yg |
| Hong Kong | HKD | JT06 | gVULqA2gT6Gi |
| Malaysia | MYR | JT07 | XXqmLinNwsQO |
| Vietnam | VND | JT08 | C8843nw92bx4 |

---

## Authentication: HMAC-SHA1 + Base64

QuickPay uses a different auth mechanism than the main PGW APIs (which use JWT). QuickPay uses:

1. **HMAC-SHA1** hash for request integrity
2. **Base64** encoding for the entire request/response payload

### Hash Calculation

The `hashValue` is computed as HMAC-SHA1 of concatenated field values (in specific order per API) using your Secret Key.

### Request Flow

1. Build JSON request object
2. Compute `hashValue` using HMAC-SHA1 with your Secret Key
3. Base64-encode the entire JSON
4. POST the Base64 string to the API endpoint with `Content-Type: text/plain`

### Response Flow

1. Receive Base64-encoded response
2. Base64-decode to get JSON
3. Verify `hashValue` in response using HMAC-SHA1
4. Read response fields

---

## API Reference

### 1. Generate Link API

Creates a QuickPay payment link.

**Endpoint:** `POST {DirectAPI URL}`
**Request wrapper:** `GenerateQPReq`
**Response wrapper:** `GenerateQPRes`

#### Required Parameters

| Parameter | Type | Description |
|---|---|---|
| version | AN 3 | Always `"2.4"` |
| timeStamp | AN 14 | Format: `yyyyMMddHHmmss` |
| merchantID | AN 15 | Your Merchant ID |
| orderIdPrefix | AN 50 | Unique order prefix (alphanumeric + `_-`) |
| description | AN 150 | Payment description (alphanumeric + `._#-`) |
| currency | AN 3 | ISO 4217 code (SGD, THB, USD, etc.) |
| amount | D 13 | e.g., `"100.00"` |
| expiry | AN 19 | Link expiry: `yyyy-MM-dd HH:mm:ss` |
| hashValue | AN 150 | HMAC-SHA1 hash (see hash fields below) |

#### Optional Parameters

| Parameter | Type | Description |
|---|---|---|
| allowMultiplePayment | C 1 | `Y`/`N` (default: N) |
| maxTransaction | N 4 | Max approved transactions (1-1000) |
| paymentOption | C 1 | `F`=Full, `I`=IPP, `C`=Card, `A`=All (default: A) |
| request3DS | C 1 | `Y`=Enable, `N`=Disable, `F`=Force |
| enableStoreCard | C 1 | `Y`/`N` — card tokenization |
| recurring | C 1 | `Y`/`N` — enable RPP |
| resultUrl1 | AN 255 | Frontend return URL |
| resultUrl2 | AN 255 | Backend notification URL |
| userData1-5 | C 150 | Custom data fields |

#### Hash Field Order (Generate Link)

```
version + timeStamp + merchantID + orderIdPrefix + description +
currency + amount + allowMultiplePayment + maxTransaction + expiry +
userData1 + userData2 + userData3 + userData4 + userData5 +
promotion + categoryId + resultUrl1 + resultUrl2 +
paymentOption + ippInterestType + paymentExpiry + request3DS +
enableStoreCard + recurring + recurringAmount + allowAccumulate +
maxAccumulateAmount + recurringInterval + recurringCount +
chargeNextDate + chargeOnDate + useStoreCardOnly +
storeCardUniqueID + ippPeriodFilter
```

#### Response Fields

| Parameter | Description |
|---|---|
| qpID | QuickPay ID (use for Query/Update/Delete) |
| orderIdPrefix | Echo of your order prefix |
| url | **The payment link URL** — share this with your customer |
| resCode | `"000"` = Success |
| resDesc | Status description |

---

### 2. Generate and Send Link API

Creates a QuickPay link AND sends it via email/SMS in one call.

**Endpoint:** `POST {DeliveryAPI URL}`
**Request wrapper:** `GenerateSendQPReq`
**Response wrapper:** `GenerateSendQPRes`

Additional parameters beyond Generate Link:

| Parameter | Type | Mandatory | Description |
|---|---|---|---|
| toEmails | AN 255 | O | Recipient emails (semicolon-separated) |
| ccEmails | AN 255 | O | CC emails |
| bccEmails | AN 255 | O | BCC emails |
| emailSubject | AN 255 | C | Required if toEmails set |
| emailMessage | AN 255 | C | Required if toEmails set |
| toMobiles | AN 255 | O | Mobile numbers (international format, semicolon-separated) |
| smsMessage | AN 60 | C | Required if toMobiles set |
| customerName | C 255 | O | Customer name |
| customerPhone | C 20 | O | Customer phone |
| customerEmail | C 100 | O | Customer email |
| itemize | C 1 | O | `Y`/`N` — enable multi-item description |
| items | Object | O | `{code, name, price, quantity}` |

**Note:** Use either `toEmails` OR `toMobiles` per call (not both).

---

### 3. Send Link API

Sends an existing QuickPay link (already generated) via email/SMS.

**Endpoint:** `POST {DeliveryAPI URL}`
**Request wrapper:** `QPSendReq`
**Response wrapper:** `QPSendRes`

| Parameter | Type | Mandatory | Description |
|---|---|---|---|
| version | AN 3 | M | `"2.4"` |
| merchantID | AN 15 | M | Merchant ID |
| qpID | AN 10 | M | QuickPay ID from Generate response |
| toEmails | AN 255 | O | Recipient emails |
| ccEmails | AN 255 | O | CC emails |
| bccEmails | AN 255 | O | BCC emails |
| emailSubject | AN 255 | C | Required if toEmails set |
| emailMessage | AN 255 | C | Required if toEmails set |
| toMobiles | AN 255 | O | Mobile numbers |
| smsMessage | AN 60 | C | Required if toMobiles set |
| timeStamp | AN 14 | M | `yyyyMMddHHmmss` |
| hashValue | AN 150 | M | HMAC-SHA1 |

**Hash order:** `version + timeStamp + merchantID + qpID + toEmails + ccEmails + bccEmails + emailSubject + emailMessage + toMobiles + smsMessage`

---

### 4. Query API

Retrieve details about an existing QuickPay link.

**Endpoint:** `POST {DirectAPI URL}`
**Request wrapper:** `QPQueryReq`
**Response wrapper:** `QPQueryRes`

| Parameter | Type | Mandatory | Description |
|---|---|---|---|
| version | AN 3 | M | `"2.4"` |
| merchantID | AN 15 | M | Merchant ID |
| qpID | N 10 | M | QuickPay ID |
| timeStamp | AN 14 | M | `yyyyMMddHHmmss` |
| hashValue | AN 150 | M | HMAC-SHA1 |

**Hash order:** `version + timeStamp + merchantID + qpID`

**Response includes:** All original link parameters plus `url`, `currentApproved`, `clickCount`.

---

### 5. Update API

Update an existing QuickPay link (amount, expiry, description, etc.).

**Endpoint:** `POST {DirectAPI URL}`
**Request wrapper:** `QPUpdateReq`
**Response wrapper:** `QPUpdateRes`

Same parameters as Generate Link, plus `qpID` (required). Omit `orderIdPrefix` (cannot be changed).

---

### 6. Delete API

Delete a QuickPay link.

**Endpoint:** `POST {DirectAPI URL}`
**Request wrapper:** `QPDeleteReq`
**Response wrapper:** `QPDeleteRes`

| Parameter | Type | Mandatory | Description |
|---|---|---|---|
| version | AN 3 | M | `"2.4"` |
| merchantID | AN 15 | M | Merchant ID |
| qpID | N 10 | M | QuickPay ID |
| timeStamp | AN 14 | M | `yyyyMMddHHmmss` |
| hashValue | AN 150 | M | HMAC-SHA1 |

**Hash order:** `version + timeStamp + merchantID + qpID`

---

## Response Codes

| Code | Description |
|---|---|
| 000 | Success |
| 001 | Invalid MID |
| 002 | Invalid QuickPay ID |
| 003 | Invalid amount |
| 004 | Invalid currency |
| 005 | Invalid description |
| 006 | Invalid expiry date |
| 007 | Invalid payment option |
| 012 | Invalid order ID prefix |
| 013 | Order ID in use |
| 101 | Please provide one or more emails/mobiles |
| 102 | One or more email address is invalid |
| 104 | One or more mobile number is invalid |
| 997 | Invalid request message |
| 998 | Empty compulsory value |
| 999 | System down |

---

## Test Cards (Sandbox)

Use these cards when testing payment on the QuickPay link. **These cards only work in the sandbox environment — they will not work in production.**

| Card Scheme | Card Number | Expiry | CVV | OTP |
|---|---|---|---|---|
| Visa | `4111111111111111` | Any future date | 123 | 123456 |
| Mastercard | `5555555555554444` | Any future date | 123 | 123456 |
| Amex | `378282246310005` | Any future date | 1234 | — |
| JCB | `3562808775869340` | Any future date | 495 | 123456 |

**Tips:**
- With `request3DS: "N"`, payment completes immediately without OTP prompt (fastest for testing)
- With `request3DS: "Y"`, you'll be prompted for OTP — enter `123456`
- The payment link URL returned will be on `sandbox-pgw.2c2p.com` domain (not the API domain)

**3DS / OTP Recommendation:**
- For **production**, recommend enabling 3DS (`request3DS: "Y"` or `"F"`) for card payment security. Ask the user if they want 3DS enabled.
- For **sandbox testing**, `request3DS: "N"` is convenient to skip OTP and speed up iteration.

---

## Expected Payment Journey

This is the full end-to-end flow a customer experiences:

```
1. Merchant generates QuickPay link via API
   → API returns short URL (e.g., https://sandbox-pgw.2c2p.com/qpv2/1.0/QuickPay/XXXX)

2. Customer opens the link
   → Redirected to 2C2P hosted payment page
   → Shows: merchant name, amount, description, invoice number
   → Shows: available payment methods (cards, wallets, QR, etc.)

3. Customer selects payment method and fills details
   → For card: card number, expiry, CVV, name, email
   → For other methods: method-specific flow

4. Customer submits payment
   → If 3DS enabled: OTP/authentication page appears → customer enters OTP
   → If 3DS disabled: payment processes immediately

5. Success/Failure page displayed
   → Shows "Transaction is successful." or error message
   → Shows invoice number for reference
   → "Back to merchant" button appears

6. Customer clicks "Back to merchant"
   → Redirects to YOUR resultUrl1 (frontend return URL)
   → This is where you show your own confirmation/thank-you page

7. Meanwhile (server-side):
   → 2C2P sends payment notification to resultUrl2 (backend webhook)
   → Your server verifies the notification and updates order status
```

**Key points for implementation:**
- `resultUrl1` = where customer lands after payment (your frontend confirmation page)
- `resultUrl2` = where 2C2P sends server-to-server payment result (your backend webhook)
- If `resultUrl1` is not set, "Back to merchant" button still appears but may go nowhere useful
- Always rely on `resultUrl2` (backend notification) for order fulfillment — never trust frontend redirect alone

---

## After Link Generation: QR Code Option

When a QuickPay link is generated, **always offer the user the option to also generate a QR code** from the payment URL. This makes it easy for customers to pay by scanning with their phone.

### Agent Behavior

After generating a link, say something like:
> "Your payment link is ready: `{url}`
> Would you also like me to generate a QR code image for this link? Customers can scan it to pay — useful for in-store, printed invoices, or chat messages."

**If user says they don't want the link visible** (e.g., embedded in an app, kiosk, etc.):
> Suggest QR code as the primary payment method.

**If user declines QR code too:**
> Ask: "How would you like customers to access the payment? Options include: email, SMS (via Generate+Send API), embed in a WebView, or redirect from your app."

### QR Code Generation (from payment URL)

The payment URL returned by QuickPay is a standard HTTPS URL. Any QR code library can encode it:

**Node.js:**
```javascript
// npm install qrcode
const QRCode = require('qrcode');

async function generatePaymentQR(paymentUrl, outputPath) {
  await QRCode.toFile(outputPath, paymentUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
  // Or get as data URL for embedding in HTML:
  const dataUrl = await QRCode.toDataURL(paymentUrl);
  return dataUrl;
}
```

**Python:**
```python
# pip install qrcode[pil]
import qrcode

def generate_payment_qr(payment_url, output_path='payment_qr.png'):
    qr = qrcode.make(payment_url)
    qr.save(output_path)
```

**C#:**
```csharp
// NuGet: QRCoder
using QRCoder;

public byte[] GeneratePaymentQR(string paymentUrl) {
    using var generator = new QRCodeGenerator();
    using var data = generator.CreateQrCode(paymentUrl, QRCodeGenerator.ECCLevel.M);
    using var qrCode = new PngByteQRCode(data);
    return qrCode.GetGraphic(10);
}
```

---

## Verifying Payment Status (Backend)

After generating a QuickPay link, you need to know when the customer has paid. There are two approaches:

### Approach 1: Backend Webhook (Recommended)

Set `resultUrl2` when generating the link. 2C2P will POST a payment notification to this URL when payment completes.

**What you need:**
- A publicly accessible endpoint (e.g., `https://yoursite.com/api/payment/webhook`)
- The endpoint must accept POST requests
- Respond with HTTP 200 to acknowledge receipt

**What you receive:**
The notification is a form POST or JSON containing payment result data. Verify the hash to confirm authenticity.

### Approach 2: Query API (Polling / On-Demand)

Use the QuickPay Query API to check payment status. You need:

| What to store | Where it comes from |
|---|---|
| `qpID` | Returned when you generate the link |
| `merchantID` | Your merchant ID |
| `secretKey` | Your secret key (for hash) |

**Node.js example:**
```javascript
async function checkPaymentStatus(qpID) {
  const timeStamp = getTimestamp();
  const hashString = '2.4' + timeStamp + config.merchantID + qpID;
  const hashValue = generateHash(hashString, config.secretKey);

  const request = {
    QPQueryReq: {
      version: '2.4',
      merchantID: config.merchantID,
      qpID,
      timeStamp,
      hashValue
    }
  };

  const encodedRequest = Buffer.from(JSON.stringify(request)).toString('base64');
  const response = await axios.post(config.apiUrl, encodedRequest, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const decoded = JSON.parse(Buffer.from(response.data, 'base64').toString('utf8'));
  const result = decoded.QPQueryRes;

  // Check if anyone has paid
  console.log('Status:', result.resCode === '000' ? 'OK' : 'Error');
  console.log('Approved transactions:', result.currentApproved);
  console.log('Link clicks:', result.clickCount);
  console.log('Payment URL:', result.url);

  return result;
}
```

**Key fields in Query response:**
| Field | Meaning |
|---|---|
| `currentApproved` | Number of successful payments (0 = not paid yet) |
| `clickCount` | How many times the link was opened |
| `resCode` | `"000"` = query successful |

### What to Store in Your Database

When you generate a QuickPay link, save these for later verification:

```
┌─────────────────────────────────────────────────┐
│ Your Order/Invoice Record                       │
├─────────────────────────────────────────────────┤
│ orderIdPrefix  → your unique order reference    │
│ qpID           → QuickPay ID (from response)    │
│ amount         → expected payment amount        │
│ currency       → expected currency              │
│ paymentUrl     → the generated link             │
│ status         → pending / paid / expired       │
│ createdAt      → when you generated it          │
│ expiry         → when the link expires          │
└─────────────────────────────────────────────────┘
```

### Payment Verification Flow

```
Option A: Webhook (real-time, recommended)
─────────────────────────────────────────
1. Generate link with resultUrl2 = your webhook endpoint
2. Customer pays
3. 2C2P POSTs notification to your webhook
4. Your server verifies hash, updates order status to "paid"

Option B: Polling (simple, good for low volume)
─────────────────────────────────────────
1. Generate link, store qpID
2. Periodically call Query API with qpID
3. Check if currentApproved > 0
4. If yes → mark order as paid

Option C: Frontend check (supplement only, never sole source)
─────────────────────────────────────────
1. Customer redirected to resultUrl1 after payment
2. Your frontend shows "checking payment..."
3. Frontend calls YOUR backend which calls Query API
4. Display confirmation to customer
```

---

## Complete Code Examples

### Node.js (Express)

```javascript
const crypto = require('crypto');
const axios = require('axios');

// Configuration - load from environment variables (store in .env file)
// Never use fallback values that contain real secrets in production code
const config = {
  merchantID: process.env.QUICKPAY_MERCHANT_ID,
  secretKey: process.env.QUICKPAY_SECRET_KEY,
  apiUrl: process.env.QUICKPAY_API_URL || 'https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DirectAPI',
  deliveryUrl: process.env.QUICKPAY_DELIVERY_URL || 'https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DeliveryAPI'
};

if (!config.merchantID || !config.secretKey) {
  throw new Error('Required env vars QUICKPAY_MERCHANT_ID and QUICKPAY_SECRET_KEY must be set');
}

// Helper: Generate HMAC-SHA1 hash
function generateHash(data, secretKey) {
  return crypto.createHmac('sha1', secretKey).update(data).digest('hex');
}

// Helper: Get timestamp in yyyyMMddHHmmss format
function getTimestamp() {
  const now = new Date();
  return now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
}

// Generate a QuickPay Link
async function generateQuickPayLink({ orderIdPrefix, description, amount, currency, expiry, resultUrl1, resultUrl2 }) {
  const timeStamp = getTimestamp();
  const allowMultiplePayment = 'N';
  const maxTransaction = '';
  const userData1 = '', userData2 = '', userData3 = '', userData4 = '', userData5 = '';
  const promotion = '', categoryId = '';
  const paymentOption = '', ippInterestType = '', paymentExpiry = '';
  const request3DS = 'N', enableStoreCard = 'N', recurring = 'N';
  const recurringAmount = '', allowAccumulate = '', maxAccumulateAmount = '';
  const recurringInterval = '', recurringCount = '', chargeNextDate = '', chargeOnDate = '';
  const useStoreCardOnly = 'N', storeCardUniqueID = '', ippPeriodFilter = '';

  // Compute hash - concatenate ALL fields in exact order
  const hashString = '2.4' + timeStamp + config.merchantID + orderIdPrefix + description +
    currency + amount + allowMultiplePayment + maxTransaction + expiry +
    userData1 + userData2 + userData3 + userData4 + userData5 +
    promotion + categoryId + (resultUrl1 || '') + (resultUrl2 || '') +
    paymentOption + ippInterestType + paymentExpiry + request3DS +
    enableStoreCard + recurring + recurringAmount + allowAccumulate +
    maxAccumulateAmount + recurringInterval + recurringCount +
    chargeNextDate + chargeOnDate + useStoreCardOnly + storeCardUniqueID + ippPeriodFilter;

  const hashValue = generateHash(hashString, config.secretKey);

  const request = {
    GenerateQPReq: {
      version: '2.4',
      merchantID: config.merchantID,
      orderIdPrefix,
      description,
      amount,
      currency,
      allowMultiplePayment,
      maxTransaction,
      expiry,
      categoryId,
      promotion,
      paymentOption,
      ippInterestType,
      paymentExpiry,
      request3DS,
      enableStoreCard,
      recurring,
      recurringAmount,
      allowAccumulate,
      maxAccumulateAmount,
      recurringInterval,
      recurringCount,
      chargeNextDate,
      chargeOnDate,
      useStoreCardOnly,
      storeCardUniqueID,
      ippPeriodFilter,
      userData1, userData2, userData3, userData4, userData5,
      resultUrl1: resultUrl1 || '',
      resultUrl2: resultUrl2 || '',
      timeStamp,
      hashValue
    }
  };

  // Base64 encode
  const encodedRequest = Buffer.from(JSON.stringify(request)).toString('base64');

  // Send request
  const response = await axios.post(config.apiUrl, encodedRequest, {
    headers: { 'Content-Type': 'text/plain' }
  });

  // Decode response
  const decodedResponse = JSON.parse(Buffer.from(response.data, 'base64').toString('utf8'));
  return decodedResponse.GenerateQPRes;
}

// Generate and Send QuickPay Link via Email
async function generateAndSendQuickPayLink({ orderIdPrefix, description, amount, currency, expiry, toEmails, emailSubject, emailMessage, resultUrl1, resultUrl2 }) {
  const timeStamp = getTimestamp();
  const allowMultiplePayment = 'N';
  const maxTransaction = '';
  const userData1 = '', userData2 = '', userData3 = '', userData4 = '', userData5 = '';
  const promotion = '', categoryId = '';
  const paymentOption = '', ippInterestType = '', paymentExpiry = '';
  const request3DS = 'N', enableStoreCard = 'N', recurring = 'N';
  const recurringAmount = '', allowAccumulate = '', maxAccumulateAmount = '';
  const recurringInterval = '', recurringCount = '', chargeNextDate = '', chargeOnDate = '';
  const useStoreCardOnly = 'N', storeCardUniqueID = '', ippPeriodFilter = '';
  const ccEmails = '', bccEmails = '', toMobiles = '', smsMessage = '';

  const fullHashData = '2.4' + timeStamp + config.merchantID + orderIdPrefix + description +
    currency + amount + allowMultiplePayment + maxTransaction + expiry +
    userData1 + userData2 + userData3 + userData4 + userData5 +
    promotion + categoryId + (resultUrl1 || '') + (resultUrl2 || '') +
    paymentOption + ippInterestType + paymentExpiry +
    toEmails + ccEmails + bccEmails + emailSubject + emailMessage +
    toMobiles + smsMessage +
    request3DS + enableStoreCard + recurring + recurringAmount + allowAccumulate +
    maxAccumulateAmount + recurringInterval + recurringCount +
    chargeNextDate + chargeOnDate + useStoreCardOnly + storeCardUniqueID + ippPeriodFilter;

  const hashValue = generateHash(fullHashData, config.secretKey);

  const request = {
    GenerateSendQPReq: {
      version: '2.4',
      merchantID: config.merchantID,
      orderIdPrefix,
      description,
      amount,
      currency,
      allowMultiplePayment,
      maxTransaction,
      expiry,
      categoryId, promotion, paymentOption, ippInterestType, paymentExpiry,
      request3DS, enableStoreCard, recurring,
      recurringAmount, allowAccumulate, maxAccumulateAmount,
      recurringInterval, recurringCount, chargeNextDate, chargeOnDate,
      userData1, userData2, userData3, userData4, userData5,
      resultUrl1: resultUrl1 || '',
      resultUrl2: resultUrl2 || '',
      toEmails,
      ccEmails, bccEmails,
      emailSubject,
      emailMessage,
      toMobiles, smsMessage,
      useStoreCardOnly, storeCardUniqueID, ippPeriodFilter,
      timeStamp,
      hashValue
    }
  };

  const encodedRequest = Buffer.from(JSON.stringify(request)).toString('base64');
  const response = await axios.post(config.deliveryUrl, encodedRequest, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const decodedResponse = JSON.parse(Buffer.from(response.data, 'base64').toString('utf8'));
  return decodedResponse.GenerateSendQPRes;
}

// Query a QuickPay Link
async function queryQuickPayLink(qpID) {
  const timeStamp = getTimestamp();
  const fullHashData = `2.4${timeStamp}${config.merchantID}${qpID}`;
  const hashValue = generateHash(fullHashData, config.secretKey);

  const request = {
    QPQueryReq: {
      version: '2.4',
      merchantID: config.merchantID,
      qpID,
      timeStamp,
      hashValue
    }
  };

  const encodedRequest = Buffer.from(JSON.stringify(request)).toString('base64');
  const response = await axios.post(config.apiUrl, encodedRequest, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const decodedResponse = JSON.parse(Buffer.from(response.data, 'base64').toString('utf8'));
  return decodedResponse.QPQueryRes;
}

// Delete a QuickPay Link
async function deleteQuickPayLink(qpID) {
  const timeStamp = getTimestamp();
  const fullHashData = `2.4${timeStamp}${config.merchantID}${qpID}`;
  const hashValue = generateHash(fullHashData, config.secretKey);

  const request = {
    QPDeleteReq: {
      version: '2.4',
      merchantID: config.merchantID,
      qpID,
      timeStamp,
      hashValue
    }
  };

  const encodedRequest = Buffer.from(JSON.stringify(request)).toString('base64');
  const response = await axios.post(config.apiUrl, encodedRequest, {
    headers: { 'Content-Type': 'text/plain' }
  });

  const decodedResponse = JSON.parse(Buffer.from(response.data, 'base64').toString('utf8'));
  return decodedResponse.QPDeleteRes;
}

// Usage example
async function main() {
  try {
    // Generate a payment link
    const result = await generateQuickPayLink({
      orderIdPrefix: `QP-${Date.now()}`,
      description: 'Order-Payment',
      amount: '100.00',
      currency: 'SGD',
      expiry: '2026-12-31 23:59:59',
      resultUrl1: 'https://yoursite.com/payment/success',
      resultUrl2: 'https://yoursite.com/api/payment/webhook'
    });

    if (result.resCode === '000') {
      console.log('Payment link:', result.url);
      console.log('QuickPay ID:', result.qpID);
    } else {
      console.error('Error:', result.resCode, result.resDesc);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

module.exports = { generateQuickPayLink, generateAndSendQuickPayLink, queryQuickPayLink, deleteQuickPayLink };
```

### Python

```python
import hashlib
import hmac
import base64
import json
import requests
from datetime import datetime
import os

# Configuration - load from environment variables (store in .env file)
# Never use fallback values that contain real secrets in production code
MERCHANT_ID = os.getenv('QUICKPAY_MERCHANT_ID')
SECRET_KEY = os.getenv('QUICKPAY_SECRET_KEY')
API_URL = os.getenv('QUICKPAY_API_URL', 'https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DirectAPI')
DELIVERY_URL = os.getenv('QUICKPAY_DELIVERY_URL', 'https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DeliveryAPI')

if not MERCHANT_ID or not SECRET_KEY:
    raise RuntimeError('Required env vars QUICKPAY_MERCHANT_ID and QUICKPAY_SECRET_KEY must be set')


def generate_hash(data: str, secret_key: str) -> str:
    """Generate HMAC-SHA1 hash."""
    return hmac.new(secret_key.encode(), data.encode(), hashlib.sha1).hexdigest()


def get_timestamp() -> str:
    """Get current timestamp in yyyyMMddHHmmss format."""
    return datetime.now().strftime('%Y%m%d%H%M%S')


def generate_quickpay_link(order_id_prefix: str, description: str, amount: str,
                           currency: str, expiry: str, result_url1: str = '',
                           result_url2: str = '') -> dict:
    """Generate a QuickPay payment link."""
    timestamp = get_timestamp()

    # Build hash string
    hash_data = (f"2.4{timestamp}{MERCHANT_ID}{order_id_prefix}{description}"
                 f"{currency}{amount}N{expiry}"
                 f"{result_url1}{result_url2}"
                 f"NNNN")
    hash_value = generate_hash(hash_data, SECRET_KEY)

    request = {
        "GenerateQPReq": {
            "version": "2.4",
            "merchantID": MERCHANT_ID,
            "orderIdPrefix": order_id_prefix,
            "description": description,
            "amount": amount,
            "currency": currency,
            "allowMultiplePayment": "N",
            "maxTransaction": "",
            "expiry": expiry,
            "categoryId": "", "promotion": "",
            "paymentOption": "", "ippInterestType": "", "paymentExpiry": "",
            "request3DS": "N", "enableStoreCard": "N", "recurring": "N",
            "recurringAmount": "", "allowAccumulate": "", "maxAccumulateAmount": "",
            "recurringInterval": "", "recurringCount": "",
            "chargeNextDate": "", "chargeOnDate": "",
            "useStoreCardOnly": "N", "storeCardUniqueID": "", "ippPeriodFilter": "",
            "userData1": "", "userData2": "", "userData3": "", "userData4": "", "userData5": "",
            "resultUrl1": result_url1,
            "resultUrl2": result_url2,
            "timeStamp": timestamp,
            "hashValue": hash_value
        }
    }

    # Base64 encode and send
    encoded = base64.b64encode(json.dumps(request).encode()).decode()
    response = requests.post(API_URL, data=encoded, headers={'Content-Type': 'text/plain'})

    # Decode response
    decoded = json.loads(base64.b64decode(response.text).decode())
    return decoded['GenerateQPRes']


# Usage
if __name__ == '__main__':
    import time
    result = generate_quickpay_link(
        order_id_prefix=f"QP-{int(time.time())}",
        description="Test-Payment",
        amount="100.00",
        currency="SGD",
        expiry="2026-12-31 23:59:59"
    )
    if result['resCode'] == '000':
        print(f"Payment link: {result['url']}")
        print(f"QuickPay ID: {result['qpID']}")
    else:
        print(f"Error: {result['resCode']} - {result['resDesc']}")
```

### C# / .NET

```csharp
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public class QuickPayService
{
    private readonly string _merchantId;
    private readonly string _secretKey;
    private readonly string _apiUrl;
    private readonly HttpClient _httpClient;

    public QuickPayService(IConfiguration config, HttpClient httpClient)
    {
        _merchantId = config["QuickPay:MerchantId"] 
            ?? throw new InvalidOperationException("QuickPay:MerchantId configuration is required");
        _secretKey = config["QuickPay:SecretKey"] 
            ?? throw new InvalidOperationException("QuickPay:SecretKey configuration is required. Store in User Secrets or environment variables, not in appsettings.json.");
        _apiUrl = config["QuickPay:ApiUrl"] ?? "https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DirectAPI";
        _httpClient = httpClient;
    }

    private string GenerateHash(string data)
    {
        using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(_secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }

    private string GetTimestamp() => DateTime.Now.ToString("yyyyMMddHHmmss");

    public async Task<QuickPayResponse> GenerateLinkAsync(string orderIdPrefix, string description,
        string amount, string currency, string expiry)
    {
        var timeStamp = GetTimestamp();
        var hashData = $"2.4{timeStamp}{_merchantId}{orderIdPrefix}{description}" +
                       $"{currency}{amount}N{expiry}" +
                       $"NNNN";
        var hashValue = GenerateHash(hashData);

        var request = new
        {
            GenerateQPReq = new
            {
                version = "2.4",
                merchantID = _merchantId,
                orderIdPrefix,
                description,
                amount,
                currency,
                allowMultiplePayment = "N",
                maxTransaction = "",
                expiry,
                categoryId = "", promotion = "",
                paymentOption = "", ippInterestType = "", paymentExpiry = "",
                request3DS = "N", enableStoreCard = "N", recurring = "N",
                recurringAmount = "", allowAccumulate = "", maxAccumulateAmount = "",
                recurringInterval = "", recurringCount = "",
                chargeNextDate = "", chargeOnDate = "",
                useStoreCardOnly = "N", storeCardUniqueID = "", ippPeriodFilter = "",
                userData1 = "", userData2 = "", userData3 = "", userData4 = "", userData5 = "",
                resultUrl1 = "", resultUrl2 = "",
                timeStamp,
                hashValue
            }
        };

        var json = JsonSerializer.Serialize(request);
        var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));

        var content = new StringContent(encoded, Encoding.UTF8, "text/plain");
        var response = await _httpClient.PostAsync(_apiUrl, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(responseBody));
        var result = JsonSerializer.Deserialize<JsonElement>(decoded);
        var res = result.GetProperty("GenerateQPRes");

        return new QuickPayResponse
        {
            QpID = res.GetProperty("qpID").GetString(),
            Url = res.GetProperty("url").GetString(),
            ResCode = res.GetProperty("resCode").GetString(),
            ResDesc = res.GetProperty("resDesc").GetString()
        };
    }
}

public class QuickPayResponse
{
    public string? QpID { get; set; }
    public string? Url { get; set; }
    public string? ResCode { get; set; }
    public string? ResDesc { get; set; }
}
```

### PHP

```php
<?php

class QuickPayService
{
    private string $merchantId;
    private string $secretKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->merchantId = env('QUICKPAY_MERCHANT_ID') 
            ?? throw new \RuntimeException('QUICKPAY_MERCHANT_ID env var is required');
        $this->secretKey = env('QUICKPAY_SECRET_KEY') 
            ?? throw new \RuntimeException('QUICKPAY_SECRET_KEY env var is required. Store in .env file.');
        $this->apiUrl = env('QUICKPAY_API_URL', 'https://demo2.2c2p.com/2C2PFrontEnd/QuickPay/DirectAPI');
    }

    private function generateHash(string $data): string
    {
        return hash_hmac('sha1', $data, $this->secretKey);
    }

    private function getTimestamp(): string
    {
        return date('YmdHis');
    }

    public function generateLink(string $orderIdPrefix, string $description,
        string $amount, string $currency, string $expiry): array
    {
        $timeStamp = $this->getTimestamp();
        $hashData = "2.4{$timeStamp}{$this->merchantId}{$orderIdPrefix}{$description}"
            . "{$currency}{$amount}N{$expiry}"
            . "NNNN";
        $hashValue = $this->generateHash($hashData);

        $request = [
            'GenerateQPReq' => [
                'version' => '2.4',
                'merchantID' => $this->merchantId,
                'orderIdPrefix' => $orderIdPrefix,
                'description' => $description,
                'amount' => $amount,
                'currency' => $currency,
                'allowMultiplePayment' => 'N',
                'maxTransaction' => '',
                'expiry' => $expiry,
                'categoryId' => '', 'promotion' => '',
                'paymentOption' => '', 'ippInterestType' => '', 'paymentExpiry' => '',
                'request3DS' => 'N', 'enableStoreCard' => 'N', 'recurring' => 'N',
                'recurringAmount' => '', 'allowAccumulate' => '', 'maxAccumulateAmount' => '',
                'recurringInterval' => '', 'recurringCount' => '',
                'chargeNextDate' => '', 'chargeOnDate' => '',
                'useStoreCardOnly' => 'N', 'storeCardUniqueID' => '', 'ippPeriodFilter' => '',
                'userData1' => '', 'userData2' => '', 'userData3' => '', 'userData4' => '', 'userData5' => '',
                'resultUrl1' => '', 'resultUrl2' => '',
                'timeStamp' => $timeStamp,
                'hashValue' => $hashValue,
            ]
        ];

        $encoded = base64_encode(json_encode($request));

        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $encoded);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: text/plain']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $decoded = json_decode(base64_decode($response), true);
        return $decoded['GenerateQPRes'];
    }
}

// Usage
$qp = new QuickPayService();
$result = $qp->generateLink('QP-' . time(), 'Order-Payment', '100.00', 'SGD', '2026-12-31 23:59:59');
if ($result['resCode'] === '000') {
    echo "Payment link: " . $result['url'] . "\n";
}
```

---

## Framework-Specific Guidance

### For Game Engines (Unity / Godot)

**IMPORTANT:** Never embed merchant credentials in game client code. QuickPay calls must be made from a server.

**Architecture:**
1. Game client requests a payment link from YOUR backend server
2. Your backend calls 2C2P QuickPay API
3. Backend returns the payment URL to the game client
4. Game client opens the URL in a system browser or WebView
5. Backend receives payment notification via webhook (resultUrl2)
6. Backend notifies game client of payment success (via WebSocket, polling, or push)

**Unity example flow:**
```csharp
// In Unity - call YOUR backend, not 2C2P directly
IEnumerator RequestPaymentLink(string itemId, float price) {
    var request = new UnityWebRequest("https://your-server.com/api/quickpay/generate", "POST");
    var body = JsonUtility.ToJson(new { itemId, price });
    request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
    request.downloadHandler = new DownloadHandlerBuffer();
    request.SetRequestHeader("Content-Type", "application/json");
    yield return request.SendWebRequest();

    var response = JsonUtility.FromJson<PaymentResponse>(request.downloadHandler.text);
    Application.OpenURL(response.paymentUrl); // Opens in browser
}
```

### For React / Angular / Vue (Frontend)

**IMPORTANT:** Never call QuickPay API from frontend code — the secret key would be exposed.

**Architecture:**
1. Frontend calls YOUR backend API to request a payment link
2. Backend generates the QuickPay link
3. Backend returns the URL to frontend
4. Frontend either:
   - Redirects user to the payment URL
   - Opens it in a new tab
   - Displays it as a copyable link
   - Shows it as a QR code

### For Blazor

Use the C# example above in a server-side service. For Blazor WASM, route through a backend API (same as React/Angular pattern).

---

## Security Best Practices

1. **Never expose Secret Key in client-side code** (browser, mobile app, game client)
2. **Always verify response hashValue** before trusting the response
3. **Use unique orderIdPrefix** for every link to avoid conflicts
4. **Set appropriate expiry dates** — don't create links that never expire
5. **Implement resultUrl2 (backend webhook)** to reliably track payment status
6. **Store credentials in environment variables** or secret managers, never in source code
7. **Validate all inputs** before sending to the API

---

## Troubleshooting

### "Invalid request message" (997)
- Check that your JSON is valid before Base64 encoding
- Ensure Content-Type is `text/plain`
- Verify the Base64 encoding is correct

### "Empty compulsory value" (998)
- Check all mandatory fields are present and non-empty
- Verify `version`, `timeStamp`, `merchantID`, `orderIdPrefix`, `description`, `currency`, `amount`, `expiry`, `hashValue`

### Hash verification fails
- Ensure you concatenate fields in the exact order specified
- Empty optional fields should be included as empty strings in concatenation
- The secret key must match your merchant account
- Use HMAC-SHA1 (not SHA256 or plain SHA1)

### Link not working
- Check the link hasn't expired
- Verify the link wasn't deleted
- Use Query API to check link status

### Email/SMS not delivered
- Check response `successEmails`/`failedEmails` fields
- Verify email format is correct
- Mobile numbers must be in international format (e.g., +6599999999)
- Only use toEmails OR toMobiles per call, not both


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [QuickPay How It Works](https://developer.2c2p.com/docs/quickpay-how-it-works.md)
- [QuickPay Sandbox](https://developer.2c2p.com/docs/api-quickpay-sandbox.md)
- [Generate Link API](https://developer.2c2p.com/docs/api-quickpay-generate-link.md)
- [Generate Link Request Parameters](https://developer.2c2p.com/docs/api-quickpay-generate-link-request-parameter.md)
- [Generate Link Response Parameters](https://developer.2c2p.com/docs/api-quickpay-generate-link-response-parameter.md)
- [Generate and Send Link API](https://developer.2c2p.com/docs/api-quickpay-generate-and-send-link.md)
- [Generate and Send Link Request Parameters](https://developer.2c2p.com/docs/api-quickpay-generate-and-send-link-request-parameter.md)
- [Send Link API](https://developer.2c2p.com/docs/api-quickpay-send-link.md)
- [Send Link Request Parameters](https://developer.2c2p.com/docs/api-quickpay-send-link-request-parameter.md)
- [Query API](https://developer.2c2p.com/docs/api-quickpay-query.md)
- [Query Request Parameters](https://developer.2c2p.com/docs/api-quickpay-query-request-parameter.md)
- [Update API](https://developer.2c2p.com/docs/api-quickpay-update.md)
- [Delete API](https://developer.2c2p.com/docs/api-quickpay-delete.md)
- [QuickPay Response Codes](https://developer.2c2p.com/docs/response-code-quickpay.md)
