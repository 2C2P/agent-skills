# Direct API Integration (Custom UI)

Direct API integration gives you full control over the payment UI/UX. Build a custom checkout experience and submit payment details directly via API.

## Overview

Direct API allows merchants to:
- Build custom payment UI on their website
- Collect payment details directly from customers
- Submit payments via server-to-server API calls
- Handle various payment flows (3DS, wallets, QR, banking)
- Control the entire user experience

## Integration Flows

### Flow 1: Server-to-Server (Non-3DS)

For seamless payments without redirection (non-3DS card payments).

**Flow:**
1. Customer checks out
2. Request payment token from 2C2P
3. Receive payment token
4. (Optional) Request payment options
5. (Optional) Request payment option details
6. Customer enters payment details on your page
7. Submit payment via Do Payment API
8. Receive payment response
9. (Optional) Receive backend notification
10. (Optional) Call Payment Inquiry for status
11. Display result to customer

**Use when:**
- Non-3DS card payments
- No third-party redirection needed
- Seamless checkout experience

### Flow 2: Third Party Redirection (3DS, Wallets, Banking)

For payments requiring authentication or third-party processing.

**Flow:**
1. Customer checks out
2. Request payment token
3. Receive payment token
4. (Optional) Request payment options
5. (Optional) Request payment option details
6. Submit payment via Do Payment API
7. Receive redirect URL in response
8. Redirect customer to third-party (bank/wallet/3DS)
9. Customer completes authentication
10. Third party returns to 2C2P
11. Receive backend notification
12. Receive frontend redirect
13. (Optional) Call Payment Inquiry
14. Display result

**Use when:**
- 3DS card payments
- Digital wallet payments (GrabPay, TrueMoney, etc.)
- Internet/mobile banking
- Any payment requiring external authentication

### Flow 3: QR Code Payment

For QR-based payments (EMV QR, Visa QR, Mastercard QR).

**Flow:**
1. Customer checks out
2. Request payment token
3. Receive payment token
4. (Optional) Request payment options
5. (Optional) Request payment option details
6. Submit payment via Do Payment API
7. Receive QR code data in response
8. Display QR code to customer
9. Poll Transaction Status API for updates
10. Customer scans QR and pays
11. Third party returns status to 2C2P
12. Receive backend notification
13. Update UI with payment result

**Use when:**
- QR code payments
- PromptPay (Thailand)
- PayNow (Singapore)
- DuitNow (Malaysia)

### Flow 4: Over-the-Counter Payment

For cash payments at convenience stores or payment centers.

**Flow:**
1. Customer checks out
2. Request payment token
3. Receive payment token
4. Submit payment via Do Payment API
5. Receive payment slip/reference number
6. Display payment instructions to customer
7. Customer pays at counter
8. Receive backend notification when paid
9. Update order status

**Use when:**
- 7-Eleven payments
- Counter payments
- Cash payments

## Step-by-Step Integration

### Step 1: Request Payment Token

```json
POST /payment/4.3/paymentToken

{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "description": "Order payment",
    "amount": 1000.00,
    "currencyCode": "SGD",
    "paymentChannel": ["CC"],
    "request3DS": "Y"
}
```

**Parameters:**
- `merchantID` - Your merchant ID
- `invoiceNo` - Unique invoice number
- `amount` - Payment amount
- `currencyCode` - ISO 4217 currency code
- `paymentChannel` - Payment methods to enable
- `request3DS` - `Y` for 3DS, `N` for non-3DS

**Response:**
```json
{
  "paymentToken": "kSAops9Zwhos8hSTSeLTUU3o184xaNR...",
  "respCode": "0000",
  "respDesc": "Success"
}
```

### Step 2: Request Payment Options (Optional)

Get available payment methods for this transaction.

```json
POST /payment/4.3/paymentOption

{
    "paymentToken": "kSAops9Zwhos8hSTSeLTUU3o184xaNR...",
    "locale": "en",
    "clientID": "30c7cf51-75c4-4265-a70a-effddfbbb0ff"
}
```

**Response:**
```json
{
  "channelCategories": [
    {
      "name": "Global Card",
      "code": "GCARD",
      "groups": [
        {
          "name": "Credit Card Payment",
          "code": "CC"
        },
        {
          "name": "Installment Plan Payment",
          "code": "IPP"
        }
      ]
    }
  ],
  "respCode": "0000"
}
```

### Step 3: Request Payment Option Details (Optional)

Get detailed information about a specific payment method.

```json
POST /payment/4.3/paymentOptionDetail

{
  "categoryCode": "GCARD",
  "groupCode": "CC",
  "paymentToken": "kSAops9Zwhos8hSTSeLTUU3o184xaNR...",
  "locale": "en",
  "clientID": "30c7cf51-75c4-4265-a70a-effddfbbb0ff"
}
```

**Response includes:**
- Supported card types (Visa, Mastercard, Amex, JCB)
- Required input fields (cardNo, expiryDate, CVV, etc.)
- Validation rules (regex patterns, Luhn check)
- Card number prefixes

### Step 4: Collect Payment Details

Build your custom UI to collect payment information from the customer.

**For card payments, collect:**
- Card number
- Expiry date (MMYY or YYYYMM)
- CVV/CVC
- Cardholder name (optional)
- Email (optional)

**Client-side validation:**
```javascript
// Validate card number with Luhn algorithm
function validateCardNumber(cardNumber) {
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

// Validate expiry date
function validateExpiry(expiry) {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const year = 2000 + parseInt(match[2]);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const expiryDate = new Date(year, month - 1);
    
    return expiryDate > now;
}

// Validate CVV
function validateCVV(cvv, cardType) {
    if (cardType === 'amex') {
        return /^\d{4}$/.test(cvv);
    }
    return /^\d{3}$/.test(cvv);
}
```

### Step 5: Encrypt Card Data

Card data must be encrypted using SecurePay token before sending to 2C2P.

**Encryption process:**
1. Collect card data on your page
2. Use 2C2P's encryption library or implement RSA encryption
3. Generate SecurePay token
4. Send encrypted token in Do Payment request

**SecurePay Token Format:**
```
<encrypted-card-data>=<encrypted-key>
```

**Example:**
```
00acd0YYe3Ob1GHTprOPybLpDUQz+0ZIjRSYkpZzEHFtNqPXeKzC92+e/5LLUTHOfeWmAF2WA1HKGuZPFh4p2OgGxm8QIayaXyJKI5zOWF4E4XCyPx0+nJRMHXrhr0n4iCAV8MmXZbPYm2kj3fnnRX+vjyYy8FCy165eOxqq9MWDex0=U2FsdGVkX187qEju5uo37OfKlSjyBT9+FlFU0wdGFANyrycT98W73d8z9vu4O/DT
```

**Using 2C2P SecurePay JavaScript Library:**
```html
<script src="https://sandbox-pgw.2c2p.com/payment/4.3/securepay.min.js"></script>

<script>
// Initialize SecurePay
const securePay = new SecurePay({
    merchantID: 'JT01',
    environment: 'sandbox'
});

// Encrypt card data
const cardData = {
    cardNo: '4111111111111111',
    expiryDate: '1225',
    securityCode: '123'
};

securePay.encryptCardData(cardData, function(securePayToken) {
    // Use securePayToken in Do Payment request
    submitPayment(securePayToken);
});
</script>
```

### Step 6: Submit Payment (Do Payment API)

Submit the payment with encrypted card data.

**Non-3DS Payment:**
```json
POST /payment/4.3/doPayment

{
    "payment": {
        "code": {
            "channelCode": "CC"
        },
        "data": {
            "name": "John Doe",
            "email": "john@example.com",
            "securePayToken": "00acd0YYe3Ob1GHTprOPybLpDUQz..."
        }
    },
    "clientIP": "175.139.9.173",
    "paymentToken": "kSAops9Zwhos8hSTSeLTUXvfNA7ZE0px...",
    "locale": "en",
    "clientID": "30c7cf51-75c4-4265-a70a-effddfbbb0ff"
}
```

**Response (Non-3DS Success):**
```json
{
    "invoiceNo": "1523953661",
    "channelCode": "CC",
    "respCode": "2000",
    "respDesc": "Transaction is completed"
}
```

**Response (3DS Required):**
```json
{
    "data": "https://demo2.2c2p.com/2C2PFrontEnd/storedCardPaymentV2/MPaymentProcess.aspx?token=...",
    "channelCode": "CC",
    "respCode": "1001",
    "respDesc": "Redirect to authenticate ACS bank page"
}
```

**Response (QR Payment):**
```json
{
    "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "channelCode": "QRPH",
    "respCode": "1003",
    "respDesc": "Display QR code for customer to scan"
}
```

### Step 7: Handle Response

**Response Code Actions:**

| Code | Action |
|------|--------|
| 2000 | Transaction completed - call Payment Inquiry for details |
| 1001 | Redirect to URL in `data` field (3DS authentication) |
| 1002 | Redirect to URL in `data` field (third party) |
| 1003 | Display QR code from `data` field |
| 1004 | Display payment instructions from `data` field |
| 2001 | Transaction pending - wait for backend notification |
| 2002 | Transaction rejected - show error |

**Handle 3DS Redirect:**
```javascript
if (response.respCode === '1001') {
    // Open 3DS authentication in popup or redirect
    window.location.href = response.data;
    
    // Or open in popup
    const popup = window.open(response.data, '3DS', 'width=600,height=600');
}
```

**Handle QR Code:**
```javascript
if (response.respCode === '1003') {
    // Display QR code image
    document.getElementById('qr-code').src = response.data;
    
    // Start polling for payment status
    pollPaymentStatus(invoiceNo);
}

function pollPaymentStatus(invoiceNo) {
    const interval = setInterval(async () => {
        const status = await checkTransactionStatus(invoiceNo);
        
        if (status.respCode === '0000') {
            // Payment successful
            clearInterval(interval);
            showSuccessPage();
        } else if (status.respCode === '4001') {
            // Payment failed
            clearInterval(interval);
            showErrorPage();
        }
        // Continue polling if still pending
    }, 3000); // Poll every 3 seconds
}
```

### Step 8: Receive Backend Notification

2C2P sends payment result to your webhook URL.

**Backend Notification:**
```json
{
  "merchantID": "JT01",
  "invoiceNo": "1523953661",
  "accountNo": "411111XXXXXX1111",
  "amount": "1000.00",
  "currencyCode": "SGD",
  "tranRef": "2868821",
  "referenceNo": "2785703",
  "approvalCode": "531484",
  "eci": "05",
  "transactionDateTime": "20200528080508",
  "respCode": "0000",
  "respDesc": "Success"
}
```

**Handler (Node.js):**
```javascript
app.post('/payment/callback', (req, res) => {
    try {
        const decoded = jwt.verify(req.body.payload, secretKey);
        
        if (decoded.respCode === '0000') {
            // Payment successful
            updateOrderStatus(decoded.invoiceNo, 'paid', {
                tranRef: decoded.tranRef,
                approvalCode: decoded.approvalCode,
                cardNo: decoded.accountNo
            });
        } else {
            // Payment failed
            updateOrderStatus(decoded.invoiceNo, 'failed');
        }
        
        res.status(200).send('OK');
    } catch (err) {
        console.error('Backend notification error:', err);
        res.status(500).send('Error');
    }
});
```

### Step 9: Call Payment Inquiry (Optional)

If backend notification is not implemented, call Payment Inquiry to get payment status.

```json
POST /payment/4.3/paymentInquiry

{
    "paymentToken": "kSAops9Zwhos8hSTSeLTUXvfNA7ZE0px...",
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "locale": "en"
}
```

**Response:**
```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "amount": 1000.00,
    "currencyCode": "SGD",
    "transactionDateTime": "20200528080508",
    "channelCode": "VI",
    "approvalCode": "717282",
    "referenceNo": "00010001",
    "pan": "411111XXXXXX1111",
    "eci": "05",
    "respCode": "0000",
    "respDesc": "Transaction is successful"
}
```

## Payment Methods

### Card Payments

**Non-3DS:**
- Set `request3DS: "N"` in Payment Token request
- No redirection required
- Faster checkout
- Lower authentication security

**3DS (3D Secure):**
- Set `request3DS: "Y"` in Payment Token request
- Requires customer authentication (OTP, biometric)
- Redirect to bank's authentication page
- Higher security, lower fraud

**Card Tokenization:**
```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "amount": 1000.00,
    "currencyCode": "SGD",
    "tokenize": true,
    "paymentChannel": ["CC"]
}
```

Backend response includes `customerToken` for future payments.

### Digital Wallets

**Supported wallets:**
- GrabPay, TrueMoney, ShopeePay (Thailand)
- Touch 'n Go, Boost (Malaysia)
- GCash, PayMaya (Philippines)
- Apple Pay, Google Pay (Global)

**Integration:**
1. Request payment token with wallet channel code
2. Submit Do Payment with wallet details
3. Redirect customer to wallet app/page
4. Customer authorizes payment
5. Receive backend notification

### Internet Banking

**Supported banks:**
- Thailand: All major banks (SCB, KBANK, BBL, etc.)
- Malaysia: FPX (all banks)
- Singapore: PayNow, eNETS
- Philippines: Online banking

**Integration:**
1. Request payment token with banking channel
2. Submit Do Payment with bank code
3. Redirect to bank's online banking
4. Customer logs in and authorizes
5. Receive backend notification

### QR Payments

**Supported QR types:**
- EMV QR
- PromptPay (Thailand)
- PayNow (Singapore)
- DuitNow (Malaysia)

**Integration:**
1. Request payment token with QR channel
2. Submit Do Payment
3. Receive QR code image (base64)
4. Display QR to customer
5. Poll Transaction Status API
6. Customer scans and pays
7. Receive backend notification

## Best Practices

### Security
- Always encrypt card data before transmission
- Never store raw card data
- Implement CSP headers to prevent XSS
- Use HTTPS for all pages collecting payment data
- Validate all input on client and server side
- Implement rate limiting on payment endpoints

### User Experience
- Show clear payment method icons
- Provide real-time card validation feedback
- Handle 3DS popups gracefully (don't block)
- Show loading states during API calls
- Provide clear error messages
- Allow customers to retry failed payments

### Error Handling
- Implement timeout handling (30 seconds)
- Retry failed API calls with exponential backoff
- Log all API requests and responses
- Handle network errors gracefully
- Provide fallback payment methods

### Performance
- Cache payment options response
- Minimize API calls (combine when possible)
- Implement client-side validation before API calls
- Use async/await for better error handling
- Optimize QR code polling interval

## Troubleshooting

### Payment Token Fails

**Problem:** Payment token request returns error

**Solutions:**
1. Verify merchant ID and secret key
2. Check all required fields present
3. Validate amount format (decimal with 2 places)
4. Ensure invoice number is unique
5. Check currency code is valid

### Card Encryption Fails

**Problem:** SecurePay token generation fails

**Solutions:**
1. Verify SecurePay library is loaded
2. Check card number passes Luhn validation
3. Ensure expiry date is future date
4. Verify CVV format (3-4 digits)
5. Check 2C2P public key is correct

### 3DS Authentication Fails

**Problem:** Customer can't complete 3DS

**Solutions:**
1. Ensure popup blockers are disabled
2. Check redirect URL is accessible
3. Verify return URLs are configured
4. Test with 3DS test cards
5. Check browser allows third-party cookies

### Backend Notification Not Received

**Problem:** Webhook not called after payment

**Solutions:**
1. Verify webhook URL is publicly accessible
2. Check firewall allows 2C2P IPs
3. Ensure endpoint accepts POST requests
4. Implement proper JWT validation
5. Return HTTP 200 response
6. Check webhook URL in merchant portal

### QR Payment Stuck Pending

**Problem:** QR payment doesn't complete

**Solutions:**
1. Verify polling interval is appropriate (3-5 seconds)
2. Check Transaction Status API is called correctly
3. Ensure QR code is displayed clearly
4. Verify customer scanned correct QR
5. Check payment timeout settings

## Complete Example

**Full Direct API integration (Node.js + Express):**

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();

// Load credentials from environment — never hardcode in source code
const merchantID = process.env.PGW_MERCHANT_ID;
const secretKey = process.env.PGW_SECRET_KEY;
const baseURL = process.env.PGW_BASE_URL || 'https://sandbox-pgw.2c2p.com';

if (!merchantID || !secretKey) {
    throw new Error('Required env vars PGW_MERCHANT_ID and PGW_SECRET_KEY must be set');
}

// Step 1: Request payment token
app.post('/api/payment/init', async (req, res) => {
    const payload = {
        merchantID: merchantID,
        invoiceNo: generateInvoiceNo(),
        description: 'Order payment',
        amount: req.body.amount,
        currencyCode: 'SGD',
        paymentChannel: ['CC'],
        request3DS: 'Y',
        backendReturnUrl: 'https://yoursite.com/api/payment/callback',
        frontendReturnUrl: 'https://yoursite.com/payment/return'
    };
    
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    
    try {
        const response = await axios.post(`${baseURL}/payment/4.3/paymentToken`, {
            payload: token
        });
        
        const decoded = jwt.verify(response.data.payload, secretKey);
        
        if (decoded.respCode === '0000') {
            res.json({ paymentToken: decoded.paymentToken });
        } else {
            res.status(400).json({ error: decoded.respDesc });
        }
    } catch (err) {
        res.status(500).json({ error: 'Payment token request failed' });
    }
});

// Step 2: Submit payment
app.post('/api/payment/submit', async (req, res) => {
    const payload = {
        payment: {
            code: {
                channelCode: 'CC'
            },
            data: {
                name: req.body.name,
                email: req.body.email,
                securePayToken: req.body.securePayToken
            }
        },
        clientIP: req.ip,
        paymentToken: req.body.paymentToken,
        locale: 'en',
        clientID: generateClientID()
    };
    
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    
    try {
        const response = await axios.post(`${baseURL}/payment/4.3/doPayment`, {
            payload: token
        });
        
        const decoded = jwt.verify(response.data.payload, secretKey);
        res.json(decoded);
    } catch (err) {
        res.status(500).json({ error: 'Payment submission failed' });
    }
});

// Step 3: Handle backend notification
app.post('/api/payment/callback', (req, res) => {
    try {
        const decoded = jwt.verify(req.body.payload, secretKey);
        
        if (decoded.respCode === '0000') {
            updateOrderStatus(decoded.invoiceNo, 'paid', decoded);
        } else {
            updateOrderStatus(decoded.invoiceNo, 'failed', decoded);
        }
        
        res.status(200).send('OK');
    } catch (err) {
        console.error('Backend notification error:', err);
        res.status(500).send('Error');
    }
});

// Step 4: Payment inquiry
app.get('/api/payment/status/:invoiceNo', async (req, res) => {
    const payload = {
        merchantID: merchantID,
        invoiceNo: req.params.invoiceNo,
        locale: 'en'
    };
    
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    
    try {
        const response = await axios.post(`${baseURL}/payment/4.3/paymentInquiry`, {
            payload: token
        });
        
        const decoded = jwt.verify(response.data.payload, secretKey);
        res.json(decoded);
    } catch (err) {
        res.status(500).json({ error: 'Payment inquiry failed' });
    }
});

function generateInvoiceNo() {
    return Date.now().toString();
}

function generateClientID() {
    return require('crypto').randomUUID();
}

function updateOrderStatus(invoiceNo, status, paymentData) {
    // Update your database
    console.log(`Order ${invoiceNo} status: ${status}`);
}

app.listen(3000);
```

## Next Steps

- For hosted payment page, read steering file: `redirect-integration.md`
- For API reference, read steering file: `payment-apis.md`
- For payment maintenance, read steering file: `payment-maintenance.md`
- For mobile integration, read steering file: `mobile-sdk.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Direct API How It Works](https://developer.2c2p.com/docs/direct-api-how-it-works.md)
- [Server to Server Flow](https://developer.2c2p.com/docs/direct-api-server-to-server.md)
- [Third Party Redirection](https://developer.2c2p.com/docs/direct-api-third-party-redirection.md)
- [Scan QR Flow](https://developer.2c2p.com/docs/direct-api-scan-qr.md)
- [Offline Payment Flow](https://developer.2c2p.com/docs/direct-api-offline-payment.md)
- [Using SecurePay JS Library](https://developer.2c2p.com/docs/direct-api-using-secure-pay-javascript-library.md)
- [Using SecureFields](https://developer.2c2p.com/docs/direct-api-using-securefields.md)
- [3DS Card Payment](https://developer.2c2p.com/docs/direct-api-3ds-card-payment.md)
- [Non-3DS Card Payment](https://developer.2c2p.com/docs/direct-api-non-3ds-card-payment.md)
- [Internet/Mobile Banking](https://developer.2c2p.com/docs/direct-api-internet-mobile-banking.md)
- [QR Payment](https://developer.2c2p.com/docs/direct-api-qr-payment.md)
- [Digital Payment Wallet](https://developer.2c2p.com/docs/direct-api-digital-payment-wallet.md)
- [Apple Pay](https://developer.2c2p.com/docs/direct-api-apple-pay.md)
- [Google Pay](https://developer.2c2p.com/docs/direct-api-google-pay.md)
