# References and Response Codes

This guide covers response codes, test cards, encryption/JWT, and reference data for 2C2P Payment Gateway integration.

## Response Codes

### Payment Response Codes

Response codes indicate the status of payment transactions and API calls.

#### Success Codes

| Code | Description |
|------|-------------|
| 0000 | Success - Transaction completed successfully |

#### API Error Codes (2xxx)

| Code | Description | Solution |
|------|-------------|----------|
| 2001 | Invalid merchant ID | Verify merchant ID matches credentials |
| 2002 | Invalid secret key | Check secret key is correct |
| 2003 | Invalid currency code | Use valid ISO 4217 currency code |
| 2004 | Invalid amount | Ensure amount is decimal with 2 places |
| 2005 | Invalid invoice number format | Check invoice number format |
| 2006 | Missing required parameter | Include all required fields |
| 2007 | Invalid parameter format | Verify parameter formats |
| 2008 | Invalid payment channel | Use valid payment channel code |
| 2009 | Payment channel not enabled | Contact 2C2P to enable channel |
| 2010 | Invalid payment token | Token expired or invalid |
| 2011 | Payment token expired | Request new payment token |
| 2012 | Invalid customer token | Token not found or expired |
| 2013 | Invalid card token | Token not found or expired |
| 2014 | Duplicate invoice number | Use unique invoice number |
| 2015 | Transaction not found | Verify invoice number |
| 2016 | Invalid JWT signature | Check secret key and JWT generation |
| 2017 | JWT expired | Generate new JWT token |
| 2018 | Invalid request format | Check JSON format |
| 2019 | Invalid IP address | Verify IP whitelist settings |
| 2020 | Merchant not active | Contact 2C2P support |

#### Payment Declined Codes (4xxx)

| Code | Description | Action |
|------|-------------|--------|
| 4001 | Card declined | Ask customer to use different card |
| 4002 | Insufficient funds | Ask customer to use different card |
| 4003 | Invalid card number | Verify card number is correct |
| 4004 | Expired card | Ask customer to use valid card |
| 4005 | Invalid CVV | Verify CVV is correct |
| 4006 | Card not supported | Use supported card type |
| 4007 | Card blocked | Contact card issuer |
| 4008 | Card restricted | Contact card issuer |
| 4009 | Transaction limit exceeded | Reduce amount or contact issuer |
| 4010 | 3DS authentication failed | Retry with correct OTP |
| 4011 | 3DS authentication timeout | Retry transaction |
| 4012 | 3DS not enrolled | Card not enrolled for 3DS |

#### System Error Codes (5xxx)

| Code | Description | Action |
|------|-------------|--------|
| 5000 | System error | Retry transaction |
| 5001 | Gateway timeout | Retry transaction |
| 5002 | Service unavailable | Try again later |
| 5003 | Database error | Contact 2C2P support |
| 5004 | Connection error | Check network connectivity |

### Payment Flow Response Codes

These codes indicate what action to take next in the payment flow.

| Code | Description | Action |
|------|-------------|--------|
| 1001 | Redirect to 3DS authentication | Redirect to URL in `data` field |
| 1002 | Redirect to third party | Redirect to URL in `data` field |
| 1003 | Display QR code | Show QR code from `data` field |
| 1004 | Display payment instructions | Show instructions from `data` field |
| 2000 | Transaction completed | Call Payment Inquiry for final status |
| 2001 | Transaction pending | Wait for backend notification |
| 2002 | Transaction rejected | Show error to customer |

### Payment Maintenance Result Codes

For refund, void, and settlement operations:

| Code | Description |
|------|-------------|
| 0000 | Success |
| 3001 | Transaction not found |
| 3002 | Transaction already refunded |
| 3003 | Transaction already voided |
| 3004 | Refund amount exceeds original |
| 3005 | Refund not allowed |
| 3006 | Void not allowed |
| 3007 | Settlement not allowed |
| 3008 | Partial refund not supported |

### Card ISO 8583 Response Codes

Standard card response codes from acquirers:

| Code | Description |
|------|-------------|
| 00 | Approved |
| 01 | Refer to card issuer |
| 03 | Invalid merchant |
| 04 | Pick up card |
| 05 | Do not honor |
| 12 | Invalid transaction |
| 13 | Invalid amount |
| 14 | Invalid card number |
| 30 | Format error |
| 41 | Lost card |
| 43 | Stolen card |
| 51 | Insufficient funds |
| 54 | Expired card |
| 55 | Incorrect PIN |
| 57 | Transaction not permitted |
| 58 | Transaction not permitted to terminal |
| 61 | Exceeds withdrawal limit |
| 62 | Restricted card |
| 63 | Security violation |
| 65 | Exceeds withdrawal frequency |
| 75 | PIN tries exceeded |
| 91 | Issuer unavailable |
| 96 | System malfunction |

## Test Cards and Accounts

### Global Test Cards

Use these cards in sandbox environment:

| Card Scheme | Card Number | CVV | OTP | Expiry |
|-------------|-------------|-----|-----|--------|
| Visa | 4111111111111111 | 123 | 123456 | Any future date |
| Mastercard | 5555555555554444 | 123 | 123456 | Any future date |
| Amex | 378282246310005 | 1234 | — | Any future date |
| JCB | 3562808775869340 | 495 | 123456 | Any future date |
| UnionPay | 6250947000000014 | 123 | 123456 | Any future date |
| Diners | 36259600000004 | 123 | — | Any future date |
| Discover | 6011111111111117 | 123 | — | Any future date |

### Test Scenarios

**Successful Payment:**
- Use any test card above
- Amount: Any valid amount
- Expected: respCode 0000

**Declined Payment:**
- Use any test card
- Amount: 1000.01
- Expected: respCode 4001

**Insufficient Funds:**
- Use any test card
- Amount: 1000.02
- Expected: respCode 4002

**Invalid Card:**
- Card: 4111111111111112
- Expected: respCode 4003

**Expired Card:**
- Use any test card
- Expiry: Past date
- Expected: respCode 4004

### Country-Specific Test Cards

**Singapore (SGD):**
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Amex: 378282246310005

**Thailand (THB):**
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- IPP Cards: Contact 2C2P for installment test cards

**Malaysia (MYR):**
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- FPX: Use test bank accounts from 2C2P

**Philippines (PHP):**
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- GCash: Use test wallet from 2C2P

**Hong Kong (HKD):**
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Alipay: Use test wallet from 2C2P

### Test Alternative Payment Methods

**Internet Banking (Thailand):**
- Bank: Any bank from dropdown
- Account: Use test credentials from 2C2P

**QR Payments:**
- Generate QR in sandbox
- Use 2C2P test app to scan

**Digital Wallets:**
- Test wallets available in sandbox
- Contact 2C2P for credentials

**Over-the-Counter:**
- Generate payment slip
- Use test reference number

## Encryption and JWT

### JWT (JSON Web Tokens)

All 2C2P API requests and responses use JWT for security.

**JWT Structure:**
```
header.payload.signature
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "merchantID": "JT01",
  "invoiceNo": "1523953661",
  "amount": 1000.00,
  "currencyCode": "SGD"
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Generate JWT

**Node.js:**
```javascript
const jwt = require('jsonwebtoken');

const payload = {
    merchantID: "JT01",
    invoiceNo: "1523953661",
    amount: 1000.00,
    currencyCode: "SGD"
};

const token = jwt.sign(payload, secretKey, { algorithm: 'HS256' });
```

**Python:**
```python
import jwt

payload = {
    "merchantID": "JT01",
    "invoiceNo": "1523953661",
    "amount": 1000.00,
    "currencyCode": "SGD"
}

token = jwt.encode(payload, secret_key, algorithm='HS256')
```

**PHP:**
```php
use \Firebase\JWT\JWT;

$payload = array(
    "merchantID" => "JT01",
    "invoiceNo" => "1523953661",
    "amount" => 1000.00,
    "currencyCode" => "SGD"
);

$token = JWT::encode($payload, $secretKey, 'HS256');
```

**Java:**
```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

Map<String, Object> payload = new HashMap<>();
payload.put("merchantID", "JT01");
payload.put("invoiceNo", "1523953661");
payload.put("amount", 1000.00);
payload.put("currencyCode", "SGD");

String token = Jwts.builder()
    .setClaims(payload)
    .signWith(SignatureAlgorithm.HS256, secretKey)
    .compact();
```

### Decode JWT

**Node.js:**
```javascript
const jwt = require('jsonwebtoken');

try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
} catch(err) {
    console.error('Invalid token');
}
```

**Python:**
```python
import jwt

try:
    decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
    print(decoded)
except jwt.InvalidTokenError:
    print('Invalid token')
```

### Card Data Encryption

For Direct API integration, card data must be encrypted using SecurePay token.

**Encryption Process:**
1. Collect card data on your page
2. Encrypt using 2C2P public key
3. Send encrypted token in Do Payment request

**SecurePay Token Format:**
```
<encrypted-data>=<encrypted-key>
```

**Example:**
```
00acd0YYe3Ob1GHTprOPybLpDUQz+0ZIjRSYkpZzEHFtNqPXeKzC92+e/5LLUTHOfeWmAF2WA1HKGuZPFh4p2OgGxm8QIayaXyJKI5zOWF4E4XCyPx0+nJRMHXrhr0n4iCAV8MmXZbPYm2kj3fnnRX+vjyYy8FCy165eOxqq9MWDex0=U2FsdGVkX187qEju5uo37OfKlSjyBT9+FlFU0wdGFANyrycT98W73d8z9vu4O/DT
```

## Reference Codes

### Currency Codes (ISO 4217)

| Code | Currency | Country |
|------|----------|---------|
| SGD | Singapore Dollar | Singapore |
| THB | Thai Baht | Thailand |
| MYR | Malaysian Ringgit | Malaysia |
| PHP | Philippine Peso | Philippines |
| HKD | Hong Kong Dollar | Hong Kong |
| USD | US Dollar | United States |
| EUR | Euro | European Union |
| GBP | British Pound | United Kingdom |
| JPY | Japanese Yen | Japan |
| CNY | Chinese Yuan | China |
| IDR | Indonesian Rupiah | Indonesia |
| VND | Vietnamese Dong | Vietnam |
| KRW | South Korean Won | South Korea |
| AUD | Australian Dollar | Australia |
| NZD | New Zealand Dollar | New Zealand |

### Payment Channel Codes

| Code | Description |
|------|-------------|
| CC | Global Card (Visa, Mastercard, Amex, JCB, etc.) |
| LCC | Local Card |
| IPP | Installment Payment Plan |
| DPAY | Digital Payment (Wallets) |
| BNPL | Buy Now Pay Later |
| QRPH | QR Payment |
| WEBPAY | Web Payment |
| IBANK | Internet Banking |
| MBANK | Mobile Banking |
| COUNTER | Over-the-Counter |
| ATM | ATM Payment |
| KIOSK | Self-Service Kiosk |

### Agent Codes (Banks)

**Thailand:**
- BAY - Bank of Ayudhya
- BBL - Bangkok Bank
- KBANK - Kasikornbank
- KTB - Krung Thai Bank
- SCB - Siam Commercial Bank
- TMB - TMB Bank

**Malaysia:**
- CIMB - CIMB Bank
- HLB - Hong Leong Bank
- MBB - Maybank
- PBB - Public Bank
- RHB - RHB Bank

**Singapore:**
- DBS - DBS Bank
- OCBC - OCBC Bank
- UOB - United Overseas Bank

**Philippines:**
- BDO - Banco de Oro
- BPI - Bank of the Philippine Islands
- MBTC - Metrobank

### Payment Scheme Codes

| Code | Description |
|------|-------------|
| VISA | Visa |
| MAST | Mastercard |
| AMEX | American Express |
| JCB | JCB |
| UPOP | UnionPay |
| DINE | Diners Club |
| DISC | Discover |

## Environment URLs

| Environment | Base URL |
|-------------|----------|
| Sandbox | https://sandbox-pgw.2c2p.com |
| Production | https://pgw.2c2p.com |

## API Endpoints

| API | Endpoint |
|-----|----------|
| Payment Token | /payment/4.3/paymentToken |
| Payment Options | /payment/4.3/paymentOption |
| Payment Option Details | /payment/4.3/paymentOptionDetail |
| Do Payment | /payment/4.3/doPayment |
| Payment Inquiry | /payment/4.3/paymentInquiry |
| Transaction Status Inquiry | /payment/4.3/transactionStatusInquiry |
| Payment Maintenance | /payment/4.3/paymentMaintenance |

## Payment Channels by Country

### Singapore
- Cards: Visa, Mastercard, Amex, JCB, UnionPay
- Wallets: GrabPay, Apple Pay, Google Pay, Alipay, WeChat Pay
- Banking: PayNow, eNETS

### Thailand
- Cards: Visa, Mastercard, JCB, UnionPay
- Wallets: TrueMoney, Rabbit LINE Pay, ShopeePay, AirPay
- Banking: Internet Banking (all major banks)
- Counter: 7-Eleven, Tesco Lotus
- Installments: Available for major banks

### Malaysia
- Cards: Visa, Mastercard, Amex
- Wallets: Touch 'n Go, Boost, GrabPay, ShopeePay
- Banking: FPX (all major banks)
- Counter: 7-Eleven

### Philippines
- Cards: Visa, Mastercard, JCB
- Wallets: GCash, PayMaya, GrabPay
- Banking: Online Banking (BDO, BPI, etc.)
- Counter: 7-Eleven, SM, Cebuana

### Hong Kong
- Cards: Visa, Mastercard, Amex, JCB, UnionPay
- Wallets: Alipay HK, WeChat Pay HK, Apple Pay, Google Pay
- Banking: FPS (Faster Payment System)

## Cut-Off Times

Payment channels have daily cut-off times for settlement:

| Channel | Cut-Off Time (GMT+8) |
|---------|---------------------|
| Credit Card | 23:59 |
| Internet Banking (TH) | 15:30 |
| Counter Payment | 20:00 |
| QR Payment | 23:59 |

Transactions after cut-off time are processed next business day.

## Troubleshooting

### JWT Signature Errors

**Problem:** Invalid signature error

**Solutions:**
1. Verify secret key is correct
2. Check algorithm is HS256
3. Ensure no extra whitespace in payload
4. Verify JSON format is valid

### Response Code Errors

**Problem:** Receiving error response codes

**Solutions:**
1. Check response code meaning in tables above
2. Verify all required parameters present
3. Validate parameter formats
4. Check merchant configuration

### Test Card Issues

**Problem:** Test cards not working

**Solutions:**
1. Verify using sandbox environment
2. Check card number is correct
3. Use future expiry date
4. Enter correct CVV
5. Use OTP 123456 for 3DS

## Additional Resources

- **Official Documentation**: https://developer.2c2p.com/docs/
- **Response Code Reference**: https://developer.2c2p.com/docs/response-code-payment
- **Test Cards**: https://developer.2c2p.com/docs/reference-testing-information
- **JWT Documentation**: https://developer.2c2p.com/docs/json-web-tokens-jwt
- **Payment Channels**: https://developer.2c2p.com/docs/reference-payment-channels


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Response Code Guide](https://developer.2c2p.com/docs/reference-response-code-guide.md)
- [Testing Information](https://developer.2c2p.com/docs/reference-testing-information.md)
- [JSON Web Tokens (JWT)](https://developer.2c2p.com/docs/json-web-tokens-jwt.md)
- [Payment Channels](https://developer.2c2p.com/docs/reference-payment-channels.md)
- [Payment Channels Cut-Off Time](https://developer.2c2p.com/docs/reference-payment-channels-cut-off-time.md)
