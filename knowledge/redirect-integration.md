# Redirect Integration (Hosted Payment Page)

The Redirect API allows merchants to integrate with 2C2P-hosted payment page services with minimum effort. This is the simplest integration path — redirect customers to a 2C2P-hosted checkout page where they can complete payment.

## How It Works

The Redirect API integration flow:

1. Customer checks out and proceeds to pay
2. Merchant requests a payment token from 2C2P
3. 2C2P returns the payment token to merchant
4. Merchant redirects customer to the hosted payment page with payment token
5. Customer selects payment method and enters payment information on 2C2P page
6. 2C2P sends payment to the acquirer for authorization
7. Acquirer responds with payment status to 2C2P
8. 2C2P sends backend notification to merchant
9. 2C2P redirects customer to merchant confirmation page

## Benefits

- **Fastest integration** - No payment UI to build or maintain
- **PCI compliance** - 2C2P handles card data collection
- **All payment methods** - Supports cards, wallets, alternative payments
- **Mobile optimized** - Responsive UI works on all devices
- **Localized** - Multi-language and multi-currency support
- **Secure** - 3DS authentication handled automatically

## Integration Steps

### Step 1: Prepare Payment Token Request

Build a JSON payload with payment details:

```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "description": "item 1",
    "amount": 1000.00,
    "currencyCode": "SGD",
    "paymentChannel": ["CC"]
}
```

**Required Parameters:**
- `merchantID` - Your merchant ID (provided by 2C2P)
- `invoiceNo` - Unique invoice number for this transaction
- `description` - Payment description
- `amount` - Payment amount (decimal with 2 places)
- `currencyCode` - ISO 4217 currency code (SGD, THB, MYR, etc.)

**Optional Parameters:**
- `paymentChannel` - Restrict payment methods (e.g., `["CC"]` for cards only)
- `frontendReturnUrl` - URL to redirect customer after payment
- `backendReturnUrl` - Webhook URL for backend notification
- `request3DS` - Force 3DS authentication (`Y` or `N`)

### Step 2: Sign and Send Request

Sign the payload as JWT and send to Payment Token API:

```bash
curl --location --request POST 'https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken' \
--header 'Content-Type: application/json' \
--data-raw '{
    "payload": "<your-signed-jwt-token>"
}'
```

### Step 3: Receive Payment Token Response

Decode the JWT response:

```json
{
  "webPaymentUrl": "https://sandbox-pgw-ui.2c2p.com/payment/4.3/#/token/kSAops9Zwhos8hSTSeLTUcCr...",
  "paymentToken": "kSAops9Zwhos8hSTSeLTUcCr...",
  "respCode": "0000",
  "respDesc": "Success"
}
```

**Response Fields:**
- `respCode` - Response code (`0000` = success)
- `respDesc` - Response description
- `webPaymentUrl` - URL to redirect customer to
- `paymentToken` - Token for this payment session

### Step 4: Validate Response

Check `respCode` before proceeding:

```javascript
if (response.respCode === "0000") {
    // Success - proceed to redirect
    window.location.href = response.webPaymentUrl;
} else {
    // Error - show error message
    console.error(`Payment token error: ${response.respDesc}`);
}
```

**Common Error Codes:**
- `2001` - Invalid merchant ID
- `2003` - Invalid currency code
- `2004` - Invalid amount
- `2014` - Duplicate invoice number

### Step 5: Redirect to Payment Page

Redirect customer to `webPaymentUrl`:

```javascript
// Browser redirect
window.location.href = response.webPaymentUrl;

// Or open in new window
window.open(response.webPaymentUrl, '_blank');
```

The customer will see the 2C2P hosted payment page where they can:
- Select payment method (card, wallet, bank transfer, etc.)
- Enter payment details
- Complete 3DS authentication if required
- Confirm payment

### Step 6: Receive Backend Notification

2C2P sends payment result to your `backendReturnUrl` via POST request with JWT payload.

**Backend Notification Example:**
```json
{
  "merchantID": "JT04",
  "invoiceNo": "280520075921",
  "accountNo": "411111XXXXXX1111",
  "amount": "230.87",
  "currencyCode": "THB",
  "tranRef": "2868821",
  "referenceNo": "2785703",
  "approvalCode": "531484",
  "eci": "05",
  "transactionDateTime": "20200528080508",
  "respCode": "0000",
  "respDesc": "Success"
}
```

**Backend Notification Handler (Node.js):**
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

app.post('/payment/callback', (req, res) => {
    try {
        // Decode JWT payload
        const decoded = jwt.verify(req.body.payload, secretKey);
        
        // Validate signature
        if (!decoded) {
            return res.status(400).send('Invalid signature');
        }
        
        // Process payment result
        if (decoded.respCode === "0000") {
            // Payment successful
            updateOrderStatus(decoded.invoiceNo, 'paid');
        } else {
            // Payment failed
            updateOrderStatus(decoded.invoiceNo, 'failed');
        }
        
        // Return 200 to acknowledge receipt
        res.status(200).send('OK');
    } catch (err) {
        console.error('Backend notification error:', err);
        res.status(500).send('Error');
    }
});
```

**Important:**
- Always validate JWT signature
- Return HTTP 200 to acknowledge receipt
- Process notifications asynchronously
- Handle duplicate notifications (idempotency)

### Step 7: Receive Frontend Redirect

After payment, customer is redirected to your `frontendReturnUrl` with payment status.

**Frontend Response Example:**
```json
{
    "invoiceNo": "280520075921",
    "channelCode": "CC",
    "respCode": "2000",
    "respDesc": "Transaction is completed, please do payment inquiry request for full payment information."
}
```

**Frontend Response Codes:**
- `2000` - Transaction completed (check backend notification for final status)
- `2001` - Transaction pending
- `2002` - Transaction rejected

**Frontend Handler:**
```javascript
// Parse query parameters
const urlParams = new URLSearchParams(window.location.search);
const invoiceNo = urlParams.get('invoiceNo');
const respCode = urlParams.get('respCode');

if (respCode === '2000') {
    // Show success page
    showSuccessPage(invoiceNo);
} else {
    // Show error page
    showErrorPage(respCode);
}
```

### Step 8: Payment Inquiry (Optional)

If you don't implement backend notification, call Payment Inquiry API to get payment status:

```bash
curl --location --request POST 'https://sandbox-pgw.2c2p.com/payment/4.3/paymentInquiry' \
--header 'Content-Type: application/json' \
--data-raw '{
    "payload": "<signed-jwt-with-invoiceNo>"
}'
```

**Payment Inquiry Request:**
```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661"
}
```

## Using iFrame Integration

Instead of full redirect, you can embed the payment page in an iframe on your site.

**iFrame Implementation:**
```html
<iframe 
    id="paymentFrame"
    src="<webPaymentUrl>"
    width="100%"
    height="600px"
    frameborder="0">
</iframe>
```

**Benefits:**
- Customer stays on your site
- Seamless user experience
- No full page redirect

**Considerations:**
- Some payment methods may not work in iframe (e.g., 3DS redirects)
- Mobile responsiveness
- Browser security restrictions

## Payment Features

### Customer Tokenization (Store Card)

Allow customers to save their card for future payments.

**Enable Tokenization:**
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

**Backend Response with Token:**
```json
{
  "merchantID": "JT04",
  "invoiceNo": "280520075921",
  "accountNo": "411111XXXXXX1111",
  "amount": "230.87",
  "currencyCode": "THB",
  "customerToken": "28052010234224845229",
  "tranRef": "2868821",
  "respCode": "0000",
  "respDesc": "Success"
}
```

Store the `customerToken` for future payments.

### Payment with Stored Card

Use saved card token for subsequent payments:

```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953662",
    "amount": 500.00,
    "currencyCode": "SGD",
    "customerToken": "28052010234224845229",
    "paymentChannel": ["CC"]
}
```

Customer won't need to re-enter card details.

### Installment Payment Plan (IPP)

Offer installment plans to customers:

```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "amount": 10000.00,
    "currencyCode": "THB",
    "paymentChannel": ["CC"],
    "ippTransaction": "Y",
    "ippPeriodFilter": ["3", "6", "10"]
}
```

**Parameters:**
- `ippTransaction` - Enable IPP (`Y`)
- `ippPeriodFilter` - Available installment periods (months)

Customer can select installment plan on payment page.

### Recurring Payment Plan (RPP)

Set up automatic recurring payments:

```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "amount": 100.00,
    "currencyCode": "SGD",
    "recurring": true,
    "recurringInterval": 1,
    "recurringCount": 12,
    "chargeNextDate": "20240601",
    "paymentChannel": ["CC"]
}
```

**Parameters:**
- `recurring` - Enable recurring (`true`)
- `recurringInterval` - Interval in months
- `recurringCount` - Number of recurring payments
- `chargeNextDate` - Date of next charge (YYYYMMDD)

2C2P will automatically charge the customer based on the schedule.

## Best Practices

### Security
- Always validate JWT signatures on backend notifications
- Use HTTPS for all URLs (frontend and backend)
- Never expose Secret Key in client-side code
- Implement CSRF protection on callback endpoints

### Error Handling
- Check `respCode` before redirecting to payment page
- Handle network timeouts gracefully
- Implement retry logic for backend notifications
- Log all API requests and responses

### User Experience
- Show loading indicator while requesting payment token
- Provide clear error messages for failed payments
- Allow customers to retry failed payments
- Send email confirmation after successful payment

### Testing
- Test all payment methods in sandbox
- Test error scenarios (declined cards, timeouts)
- Verify backend notifications are received
- Test frontend redirects work correctly
- Test with different browsers and devices

## Troubleshooting

### Payment Token Request Fails

**Problem:** API returns error code

**Solutions:**
1. Verify merchant ID and secret key
2. Check all required fields are present
3. Validate amount format (decimal with 2 places)
4. Ensure invoice number is unique
5. Check currency code is valid

### Backend Notification Not Received

**Problem:** Payment completes but webhook not called

**Solutions:**
1. Verify `backendReturnUrl` is publicly accessible
2. Check firewall allows 2C2P IP addresses
3. Ensure endpoint accepts POST requests
4. Implement proper JWT validation
5. Return HTTP 200 response
6. Check webhook URL in merchant portal

### Customer Not Redirected After Payment

**Problem:** Customer stuck on payment page

**Solutions:**
1. Verify `frontendReturnUrl` is set correctly
2. Check URL is accessible
3. Ensure no browser popup blockers
4. Test redirect in different browsers

### Payment Status Mismatch

**Problem:** Frontend shows success but backend shows failure

**Solutions:**
1. Always trust backend notification over frontend redirect
2. Implement Payment Inquiry API as fallback
3. Handle race conditions (backend notification may arrive before redirect)
4. Use invoice number to reconcile status

## Complete Example

**Full integration flow (Node.js):**

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
app.post('/checkout', async (req, res) => {
    const payload = {
        merchantID: merchantID,
        invoiceNo: generateInvoiceNo(),
        description: 'Order payment',
        amount: req.body.amount,
        currencyCode: 'SGD',
        frontendReturnUrl: 'https://yoursite.com/payment/return',
        backendReturnUrl: 'https://yoursite.com/payment/callback'
    };
    
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
    
    try {
        const response = await axios.post(`${baseURL}/payment/4.3/paymentToken`, {
            payload: token
        });
        
        const decoded = jwt.verify(response.data.payload, secretKey);
        
        if (decoded.respCode === '0000') {
            res.json({ webPaymentUrl: decoded.webPaymentUrl });
        } else {
            res.status(400).json({ error: decoded.respDesc });
        }
    } catch (err) {
        res.status(500).json({ error: 'Payment token request failed' });
    }
});

// Step 2: Handle backend notification
app.post('/payment/callback', (req, res) => {
    try {
        const decoded = jwt.verify(req.body.payload, secretKey);
        
        if (decoded.respCode === '0000') {
            // Payment successful
            updateOrderStatus(decoded.invoiceNo, 'paid', decoded);
        } else {
            // Payment failed
            updateOrderStatus(decoded.invoiceNo, 'failed', decoded);
        }
        
        res.status(200).send('OK');
    } catch (err) {
        console.error('Backend notification error:', err);
        res.status(500).send('Error');
    }
});

// Step 3: Handle frontend redirect
app.get('/payment/return', (req, res) => {
    const invoiceNo = req.query.invoiceNo;
    const respCode = req.query.respCode;
    
    if (respCode === '2000') {
        res.render('success', { invoiceNo });
    } else {
        res.render('error', { respCode });
    }
});

function generateInvoiceNo() {
    return Date.now().toString();
}

function updateOrderStatus(invoiceNo, status, paymentData) {
    // Update your database
    console.log(`Order ${invoiceNo} status: ${status}`);
}

app.listen(3000);
```

## Next Steps

- For custom payment UI, read steering file: `direct-integration.md`
- For API reference, read steering file: `payment-apis.md`
- For payment maintenance (refunds, voids), read steering file: `payment-maintenance.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Redirect API How It Works](https://developer.2c2p.com/docs/redirect-api-how-it-works.md)
- [Integrate with Payment](https://developer.2c2p.com/docs/redirect-api-integrate-with-payment.md)
- [Using iFrame](https://developer.2c2p.com/docs/redirect-api-using-iframe.md)
- [Card Tokenization](https://developer.2c2p.com/docs/redirect-api-card-tokenization.md)
- [Payment with Card Token](https://developer.2c2p.com/docs/redirect-api-payment-with-card-token.md)
- [IPP Installment Payment Plan](https://developer.2c2p.com/docs/redirect-api-ipp-installment-payment-plan.md)
- [RPP Recurring Payment Plan](https://developer.2c2p.com/docs/redirect-api-rpp-recurring-payment-plan.md)
