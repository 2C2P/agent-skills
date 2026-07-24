# Getting Started with 2C2P Payment Gateway

This guide covers sandbox setup, authentication, making your first API call, and test credentials.

## Sandbox vs. Production

2C2P provides a sandbox environment that mirrors production behavior without processing real payments. Use it throughout development and testing.

| | Sandbox | Production |
|---|---|---|
| **Base URL** | `https://sandbox-pgw.2c2p.com` | `https://pgw.2c2p.com` |
| **Merchant ID** | `JT01` (demo) | Issued by 2C2P |
| **Secret Key (SHA256)** | `ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9` | Issued by 2C2P |
| **Real charges** | No — all transactions are simulated | Yes — real money is processed |
| **Payment methods** | All enabled payment methods | All enabled payment methods |

**Sandbox Credentials:**
- Merchant ID: `JT01`
- Secret Key: `ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9`

> ⚠️ These are **sandbox/testing credentials only**. They do NOT work in production. For production credentials, contact 2C2P directly at https://2c2p.com/contact-us/.

**Setup for your project** — store these in your secret storage, not in source code:
```env
# .env (Node.js, Python, PHP) or equivalent for your stack
PGW_MERCHANT_ID=JT01
PGW_SECRET_KEY=ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9
```

## Authentication with JWT

2C2P API requests and responses use **JSON Web Tokens (JWT)** signed with HMAC SHA-256 using your Secret Key.

### JWT Flow

Every API call follows this pattern:

1. Build a JSON payload with your request data
2. Sign it as a JWT using your Secret Key
3. Send the signed token in the `payload` field of your POST request
4. Decode the JWT in the response using the same Secret Key

### Generate JWT Token

**Node.js Example:**
```javascript
const jwt = require('jsonwebtoken');

// Load secret from environment — never hardcode in source code
// For sandbox testing, set PGW_SECRET_KEY in your .env file
const secretKey = process.env.PGW_SECRET_KEY;
if (!secretKey) throw new Error('Required env var PGW_SECRET_KEY is not set');

const payload = {
    merchantID: process.env.PGW_MERCHANT_ID || "JT01",
    invoiceNo: "1523953661",
    description: "Test payment",
    amount: 1000.00,
    currencyCode: "SGD"
};

const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });

console.log(token);
```

**Python Example:**
```python
import os
import jwt

# Load secret from environment — never hardcode in source code
secret_key = os.environ.get('PGW_SECRET_KEY')
if not secret_key:
    raise RuntimeError('Required env var PGW_SECRET_KEY is not set')

payload = {
    "merchantID": os.environ.get('PGW_MERCHANT_ID', 'JT01'),
    "invoiceNo": "1523953661",
    "description": "Test payment",
    "amount": 1000.00,
    "currencyCode": "SGD"
}

token = jwt.encode(payload, secret_key, algorithm='HS256')

print(token)
```

**PHP Example:**
```php
<?php
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

// Load secret from environment — never hardcode in source code
$secretKey = getenv('PGW_SECRET_KEY');
if (!$secretKey) {
    throw new RuntimeException('Required env var PGW_SECRET_KEY is not set');
}

$payload = array(
    "merchantID" => getenv('PGW_MERCHANT_ID') ?: "JT01",
    "invoiceNo" => "1523953661",
    "description" => "Test payment",
    "amount" => 1000.00,
    "currencyCode" => "SGD"
);

$token = JWT::encode($payload, $secretKey, 'HS256');

echo $token;
?>
```

**Java Example:**
```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.util.HashMap;
import java.util.Map;

// Load secret from environment — never hardcode in source code
String secretKey = System.getenv("PGW_SECRET_KEY");
if (secretKey == null || secretKey.isEmpty()) {
    throw new IllegalStateException("Required env var PGW_SECRET_KEY is not set");
}

Map<String, Object> payload = new HashMap<>();
payload.put("merchantID", System.getenv("PGW_MERCHANT_ID") != null ? System.getenv("PGW_MERCHANT_ID") : "JT01");
payload.put("invoiceNo", "1523953661");
payload.put("description", "Test payment");
payload.put("amount", 1000.00);
payload.put("currencyCode", "SGD");

String token = Jwts.builder()
    .setClaims(payload)
    .signWith(SignatureAlgorithm.HS256, secretKey)
    .compact();

System.out.println(token);
```

### Decode JWT Response

**Node.js Example:**
```javascript
const jwt = require('jsonwebtoken');

const responseToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const secretKey = "your-secret-key-here";

try {
    const decoded = jwt.verify(responseToken, secretKey);
    console.log(decoded);
} catch(err) {
    console.error('Invalid token:', err);
}
```

**Python Example:**
```python
import jwt

response_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
secret_key = "your-secret-key-here"

try:
    decoded = jwt.decode(response_token, secret_key, algorithms=['HS256'])
    print(decoded)
except jwt.InvalidTokenError as e:
    print(f'Invalid token: {e}')
```

## Make Your First API Call

Request a Payment Token to verify your sandbox setup is working. Payment Token API is the first step in every payment flow.

### Step 1: Prepare the Request Payload

```json
{
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "description": "item 1",
    "amount": 1000.00,
    "currencyCode": "SGD"
}
```

### Step 2: Sign the Payload as JWT

Sign the JSON above using HMAC SHA-256 with your Secret Key. This produces a JWT string.

### Step 3: Send the Request

```bash
curl --location --request POST 'https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken' \
--header 'Content-Type: application/json' \
--data-raw '{
    "payload": "<your-signed-jwt-token>"
}'
```

### Step 4: Verify the Response

Decode the JWT in the response using the same Secret Key. A successful response looks like this:

```json
{
    "webPaymentUrl": "https://sandbox-pgw-ui.2c2p.com/payment/4.3/#/token/...",
    "paymentToken": "kSAops9Zwhos8hSTSeLTUcCr...",
    "respCode": "0000",
    "respDesc": "Success"
}
```

**Response Fields:**
- `respCode` **0000** confirms your sandbox setup is working correctly
- `webPaymentUrl` is the hosted payment page URL — open it in a browser to see the checkout UI
- `paymentToken` is used for Direct API integration to submit payment details programmatically

**If `respCode` is not `0000`**, the request failed. Common error codes:
- `2001` - Invalid merchant ID
- `2003` - Invalid currency code
- `2004` - Invalid amount format
- `2014` - Duplicate invoice number

## Test Cards

Use these test card numbers when completing payments in the sandbox. For any card, use a future expiry date and the CVV listed.

### Global Test Cards

| Card Scheme | Card Number | CVV | OTP |
|-------------|-------------|-----|-----|
| Visa | `4111111111111111` | 123 | 123456 |
| Mastercard | `5555555555554444` | 123 | 123456 |
| Amex | `378282246310005` | 1234 | — |
| JCB | `3562808775869340` | 495 | 123456 |
| UnionPay | `6250947000000014` | 123 | 123456 |

### Country-Specific Test Cards

For testing regional payment methods and installment plans:

**Singapore (SGD)**
- Visa: `4111111111111111` (CVV: 123, OTP: 123456)
- Mastercard: `5555555555554444` (CVV: 123, OTP: 123456)

**Thailand (THB)**
- Visa: `4111111111111111` (CVV: 123, OTP: 123456)
- Mastercard: `5555555555554444` (CVV: 123, OTP: 123456)
- IPP Cards: Specific cards for installment testing (contact 2C2P for details)

**Malaysia (MYR)**
- Visa: `4111111111111111` (CVV: 123, OTP: 123456)
- Mastercard: `5555555555554444` (CVV: 123, OTP: 123456)

**Philippines (PHP)**
- Visa: `4111111111111111` (CVV: 123, OTP: 123456)
- Mastercard: `5555555555554444` (CVV: 123, OTP: 123456)

**Hong Kong (HKD)**
- Visa: `4111111111111111` (CVV: 123, OTP: 123456)
- Mastercard: `5555555555554444` (CVV: 123, OTP: 123456)

### Test Card Scenarios

**Successful Payment:**
- Use any test card above with valid expiry and CVV
- Enter OTP `123456` when prompted

**Declined Payment:**
- Use amount `1000.01` to simulate declined transaction
- Response code will be `4001` (Card declined)

**Insufficient Funds:**
- Use amount `1000.02` to simulate insufficient funds
- Response code will be `4002` (Insufficient funds)

**Invalid Card:**
- Use card number `4111111111111112` (invalid checksum)
- Response code will be `4003` (Invalid card number)

## Test Alternative Payment Methods

### Internet Banking (Thailand)
- Select any bank from the payment page
- Use test credentials provided by 2C2P support

### QR Payments
- Generate QR code in sandbox
- Use 2C2P test app to scan and complete payment

### Digital Wallets
- Test wallets are available in sandbox
- Contact 2C2P for test wallet credentials

## Go Live Checklist

When sandbox testing is complete, follow these steps to switch to production:

### 1. Get Production Credentials
Contact 2C2P to receive your production Merchant ID and Secret Key.

### 2. Update Base URL
Replace `https://sandbox-pgw.2c2p.com` with `https://pgw.2c2p.com` in all API calls.

### 3. Replace Credentials
Swap the sandbox Merchant ID and Secret Key for your production credentials.

### 4. Configure Webhook Endpoints
Ensure your backend return URL points to your production server to receive payment notifications.

**Important:** Your webhook URL must:
- Be publicly accessible (not localhost)
- Accept POST requests
- Validate JWT signatures
- Return HTTP 200 response
- Process notifications asynchronously

### 5. Run a Live Test
Make a small real transaction to confirm end-to-end connectivity.

**Test checklist:**
- [ ] Payment token request succeeds
- [ ] Payment completes successfully
- [ ] Backend notification received
- [ ] Frontend redirect works
- [ ] Payment inquiry returns correct status
- [ ] Refund/void operations work (if applicable)

### 6. Monitor First Transactions
Watch your first production transactions closely:
- Check response codes
- Verify backend notifications arrive
- Monitor payment status
- Test error scenarios

## Troubleshooting

### JWT Signature Errors

**Problem:** API returns "Invalid signature" error

**Solutions:**
1. Verify you're using the correct Secret Key
2. Check JWT algorithm is HS256
3. Ensure payload JSON is correctly formatted
4. Verify no extra whitespace in payload
5. Check Secret Key has no leading/trailing spaces

### Payment Token Request Fails

**Problem:** Payment token request returns error code

**Common causes:**
- `2001` - Invalid merchant ID (check credentials)
- `2003` - Invalid currency code (use ISO 4217 codes)
- `2004` - Invalid amount (must be decimal with 2 places)
- `2014` - Duplicate invoice number (use unique invoice numbers)

**Solutions:**
1. Verify all required fields are present
2. Check field formats match API specification
3. Ensure invoice number is unique
4. Validate amount format: `1000.00` not `1000`

### Backend Notification Not Received

**Problem:** Payment completes but webhook not called

**Solutions:**
1. Verify webhook URL is publicly accessible
2. Check firewall allows 2C2P IP addresses
3. Ensure webhook endpoint accepts POST requests
4. Implement proper JWT validation
5. Return HTTP 200 response to acknowledge receipt
6. Check webhook URL in merchant portal settings

### 3DS Authentication Issues

**Problem:** 3DS authentication fails or doesn't trigger

**Solutions:**
1. Ensure browser allows popups/redirects
2. Verify return URLs are accessible
3. Test with 3DS test cards
4. Check 3DS version support (3DS1 vs 3DS2)
5. Verify merchant is enrolled for 3DS

## Next Steps

Now that your sandbox is set up, choose your integration method:

- **Hosted Payment Page** - Read steering file: `redirect-integration.md`
- **Direct API** - Read steering file: `direct-integration.md`
- **Mobile SDK** - Read steering file: `mobile-sdk.md`
- **Web SDK** - Read steering file: `web-sdk.md`
- **Shopping Cart Plugins** - Read steering file: `shopping-cart-plugins.md`

## Additional Resources

- **Official Documentation**: https://developer.2c2p.com/docs/
- **Sandbox Portal**: https://sandbox-pgw.2c2p.com
- **JWT Documentation**: https://developer.2c2p.com/docs/json-web-tokens-jwt
- **Test Cards Reference**: https://developer.2c2p.com/docs/reference-testing-information


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [General Overview](https://developer.2c2p.com/docs/general.md)
- [Sandbox Setup](https://developer.2c2p.com/docs/sandbox-setup.md)
- [JSON Web Tokens (JWT)](https://developer.2c2p.com/docs/json-web-tokens-jwt.md)
- [Testing Information](https://developer.2c2p.com/docs/reference-testing-information.md)
