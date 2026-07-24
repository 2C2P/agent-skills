# 2C2P Troubleshooting & Response Code Reference

> Use this guide when a user encounters errors, needs to understand a response code, or is debugging their integration.

## How to Use This Guide

When a user reports an error:
1. Identify which integration they're using (QuickPay, Redirect, Direct API, Payout, etc.)
2. Find the response code in the appropriate section below
3. Provide the explanation AND actionable fix

---

## Group 1: QuickPay Link Errors (codes 000-999)

These codes are returned in the `resCode` field of QuickPay API responses.

| Code | Description | What to Do |
|---|---|---|
| 000 | Success | No action needed |
| 001 | Invalid MID | Check `merchantID` matches your sandbox/production account |
| 002 | Invalid QuickPay ID | The `qpID` doesn't exist or belongs to another merchant |
| 003 | Invalid amount | Check amount format (e.g., `"100.00"` not `"100"` for SGD) |
| 004 | Invalid currency | Use ISO 4217 codes: SGD, THB, USD, MYR, PHP, IDR, etc. |
| 005 | Invalid description | Only alphanumeric + `._#-` allowed. Remove special chars |
| 006 | Invalid expiry date | Format must be `yyyy-MM-dd HH:mm:ss`. Must be future date |
| 007 | Invalid payment option | Use: F (full), I (IPP), C (card), A (all) |
| 008 | Invalid IPP interest type | Use: M (merchant), C (customer), A (all) |
| 009 | Invalid payment expiry date | Check format `yyyy-MM-dd HH:mm:ss` |
| 010 | Invalid allowMultiplePayment | Must be `"Y"` or `"N"` |
| 011 | Invalid max transactions | Must be 1-1000 |
| 012 | Invalid order ID prefix | Only alphanumeric + `_-`. Check length limits |
| 013 | Order ID in use | Use a unique `orderIdPrefix` — this one already exists |
| 014 | Max transaction must be more than pending/approved | Increase maxTransaction or create new link |
| 015 | Invalid request version | Must be `"2.4"` |
| 016 | Invalid request 3DS value | Must be `"Y"`, `"N"`, or `"F"` |
| 017 | Invalid enable store card value | Must be `"Y"` or `"N"` |
| 018 | Invalid recurring flag | Must be `"Y"` or `"N"` |
| 019 | Invalid recurring amount | Check decimal format |
| 020 | Invalid allow accumulate flag | Check value |
| 021 | Invalid allow accumulate amount | Check decimal format |
| 022 | Invalid recurring interval | Must be 1-365 (days) |
| 023 | Invalid recurring count | Must be numeric, 0 = indefinite |
| 024 | Invalid charge next date | Format: `ddMMyyyy` |
| 025 | Invalid charge on date | Format: `ddMM` |
| 026 | Provide either chargeOnDate or recurringInterval | Set one, not neither |
| 027 | Provide only one: chargeOnDate or recurringInterval | Set one, not both |
| 101 | Provide one or more emails/mobiles | Send Link requires toEmails or toMobiles |
| 102 | Invalid email address | Check email format |
| 103 | Invalid BCC email address | Check email format |
| 104 | Invalid mobile number | Use international format: +6599999999 |
| 105 | Invalid CC email address | Check email format |
| 106 | Invalid email subject | Remove `<` and `>` characters |
| 107 | Invalid email message | Remove `<` and `>` characters |
| 108 | Invalid SMS message | Max 60 chars, remove `<` and `>` |
| 997 | Invalid request message | JSON malformed or Base64 encoding wrong |
| 998 | Empty compulsory value | A mandatory field is missing or empty |
| 999 | System down | 2C2P system issue — retry later |

### Common QuickPay Troubleshooting Scenarios

**"I get 997 every time"**
- Verify JSON is valid before Base64 encoding
- Check Content-Type is `text/plain` (not `application/json`)
- Ensure Base64 encoding is standard (not URL-safe variant)
- Check for BOM or invisible characters in your JSON string

**"I get 998 but all fields are there"**
- Check `hashValue` is present and computed correctly
- Verify `timeStamp` format is exactly `yyyyMMddHHmmss` (14 chars)
- Ensure `version` is `"2.4"` (string, not number)

**"Hash keeps failing"**
- Concatenate fields in EXACT order documented (order matters!)
- Empty optional fields = empty string in concatenation (not skipped)
- Use HMAC-SHA1 (not SHA256, not plain SHA1)
- Secret key must match your merchant account exactly (no trailing spaces)
- Output should be lowercase hex

**"Order ID in use (013)"**
- `orderIdPrefix` must be unique per merchant. Use timestamp or UUID component

---

## Group 2: Payment API Errors — Redirect & Direct Integration (codes 0000-9999)

These codes appear in the `respCode` field of Payment Token, Do Payment, and Payment Inquiry responses.

### Success & Pending

| Code | Description | Action |
|---|---|---|
| 0000 | Successful | Payment completed |
| 0001 | Transaction is pending | Wait for backend notification or poll inquiry |
| 0003 | Transaction is cancelled | Customer cancelled — show appropriate message |
| 0004 | Soft-declined, resubmit after 3DS | Retry with 3DS authentication enabled |

### System Errors

| Code | Description | Action |
|---|---|---|
| 0999 | System error | Retry after delay. If persistent, contact 2C2P |
| 2001 | Transaction in progress | Wait — don't resubmit |
| 2002 | Transaction not found | Check invoice number is correct |
| 2003 | Payment/Inquiry failed | Verify request parameters |

### Card Declined (4xxx)

| Code | Description | Customer Action |
|---|---|---|
| 4001 | Refer to card issuer | Customer should contact their bank |
| 4005 | Do not honor | Generic decline — try different card |
| 4012 | Invalid transaction | Card doesn't support this transaction type |
| 4013 | Invalid amount | Check amount format |
| 4014 | Invalid card number | Customer entered wrong number |
| 4033 | Expired card | Card is expired |
| 4034 | Suspected fraud | Bank flagged as suspicious |
| 4041 | Lost card | Card reported lost — DO NOT RETRY |
| 4043 | Stolen card | Card reported stolen — DO NOT RETRY |
| 4051 | Insufficient funds | Customer needs more balance |
| 4054 | Expired card | Use a non-expired card |
| 4055 | Incorrect PIN | Wrong PIN entered |
| 4057 | Not permitted to cardholder | Card restricted — DO NOT RETRY |
| 4059 | Suspected fraud | Bank fraud detection triggered |
| 4061 | Exceeds withdrawal limit | Try smaller amount or contact bank |
| 4062 | Restricted card | Card has restrictions |
| 4065 | Exceeds frequency limit | Too many transactions — wait |
| 4080 | User cancelled (closed browser) | Customer closed payment page |
| 4081 | Unable to authenticate cardholder | 3DS authentication failed |
| 4091 | Issuer/switch inoperative | Bank system down — retry later |
| 4094 | Duplicate transmission | Already submitted — check status first |
| 4096 | System malfunction | Retry after delay |
| 4099 | Unable to complete payment | Generic failure — retry or different card |

### Settlement & Refund (41xx-41xx)

| Code | Description | Action |
|---|---|---|
| 4110 | Settled | Payment settled to merchant |
| 4120 | Refunded | Refund completed |
| 4121 | Refund rejected | Check refund eligibility |
| 4122 | Refund failed | Retry or contact 2C2P |
| 4130 | Chargeback | Dispute filed — respond via portal |

### Tokenization (42xx)

| Code | Description | Action |
|---|---|---|
| 4200 | Tokenization successful | Card token stored |
| 4201 | Tokenization failed | Retry or check card eligibility |
| 4202 | Invalid card/customer token | Token expired or invalid |

### Alternative Payment Errors (5xxx)

| Code | Description | Action |
|---|---|---|
| 5002 | Timeout | Payment timed out — retry |
| 5003 | Invalid message | Check request format |
| 5004 | Invalid merchant ID | Verify credentials |
| 5005 | Duplicate invoice | Use unique invoice number |
| 5006 | Invalid amount | Check amount format |
| 5007 | Insufficient balance | Customer needs more funds |
| 5008 | Invalid currency code | Use ISO 4217 |
| 5009 | Payment expired | Link/session expired — generate new one |
| 5014 | Authentication failed | Check credentials/signature |

### Payment Token & API Validation (6xxx, 9xxx)

| Code | Description | Action |
|---|---|---|
| 6101 | Invalid request message | Check JSON/JWT format |
| 6102 | Required payload | Send `payload` field in request body |
| 6103 | Invalid JWT data | Check JWT signing (HS256, correct secret) |
| 6104 | Required merchantId | Add merchantID to payload |
| 6107 | Invalid merchantId | Merchant ID doesn't match credentials |
| 9004 | Parameter value not valid | Check specific field format |
| 9005 | Mandatory fields missing | Include all required fields |
| 9006 | Field exceeded length | Shorten the value |
| 9007 | Invalid merchant | Check merchant ID and secret |
| 9008 | Invalid payment expiry | Check date format |
| 9009 | Amount is invalid | Use decimal format (e.g., 100.00) |
| 9010 | Invalid currency code | Use ISO 4217 (SGD, THB, etc.) |
| 9015 | Existing invoice number | Use unique invoiceNo |
| 9020 | Payment expired | Token expired — request new one |
| 9035 | Payment failed | Generic — check all parameters |
| 9038 | Failed to generate token | Check merchant config |
| 9040 | Token is invalid | Token expired or malformed |
| 9041 | Payment token already used | Request a new token |
| 9042 | Hash value mismatch | Fix JWT signature — wrong secret key? |
| 9057 | Payment options invalid | Check paymentChannel values |
| 9900 | Unable to decrypt payload | Wrong secret key or encoding issue |

### Recurring Payment Errors (99xx)

| Code | Description | Action |
|---|---|---|
| 9901 | Invalid invoicePrefix | Check format |
| 9902 | allowAccumulate required | Set when recurring enabled |
| 9903 | maxAccumulateAmount required | Set when allowAccumulate = Y |
| 9904 | recurringInterval or chargeOnDate required | Set one |
| 9905 | recurringCount required | Set number of charges |
| 9907 | Invalid chargeNextDate | Format: ddMMyyyy |
| 9908 | Invalid chargeOnDate | Format: ddMM |

### System/Infrastructure (999x)

| Code | Description | Action |
|---|---|---|
| 9990 | Request to merchant frontend failed | Check your resultUrl1 is accessible |
| 9991 | Request merchant secure failed | Internal — contact 2C2P |
| 9992 | Request payment secure failed | Internal — contact 2C2P |
| 9993 | Unknown error | Retry. If persistent, contact 2C2P |
| 9994 | DB service failed | 2C2P internal — retry later |
| 9995 | Payment service failed | 2C2P internal — retry later |
| 9996 | Qwik service failed | QuickPay backend issue — retry |
| 9999 | Request to merchant backend failed | Check your resultUrl2 is accessible |

---

## Group 3: Payout Response Codes (8xxx)

| Code | Description | Action |
|---|---|---|
| 8100 | Payout disbursement success | Done |
| 8101 | Payout request accepted | Processing — wait for notification |
| 8102 | Rejected from bank | Check beneficiary details |
| 8103 | Invalid merchant | Check merchant ID |
| 8104 | Invalid request ID | Check format |
| 8105 | Duplicate request ID | Use unique ID |
| 8106 | Invalid UTR | Check transaction reference |
| 8108 | Invalid amount | Check format |
| 8109 | Invalid beneficiary name | Check name field |
| 8110 | Invalid beneficiary account | Check account number |
| 8111 | Invalid beneficiary bank code | Check bank code |
| 8114 | Cannot find payout provider | Contact 2C2P |
| 8115 | Payout not enabled | Contact account manager |
| 8116 | Insufficient balance | Top up merchant balance |
| 8126 | Rejected (refunded) | Payout failed, funds returned |
| 8197 | Payout malfunction | Retry later |
| 8198 | Payout timeout | Retry later |
| 8199 | Internal server error | Retry later |

---

## Group 4: Card ISO 8583 Response Codes (raw bank codes)

These are the underlying bank response codes. They map to the 4xxx codes above but may appear in raw transaction logs.

### Hard Declines (DO NOT RETRY)

| Code | Description |
|---|---|
| 04 | Pick Up Card (No Fraud) |
| 07 | Pick Up Card (Fraud) |
| 12 | Invalid Transaction |
| 14 | Invalid Card Number |
| 15 | No Such Issuer |
| 41 | Lost Card |
| 43 | Stolen Card |
| 57 | Not Permitted to Cardholder |
| R0 | Stop Payment Order |
| R1 | Revocation of Authorization |
| R3 | Revocation of All Authorizations |

### Soft Declines (can retry)

| Code | Description |
|---|---|
| 01 | Refer to Card Issuer |
| 05 | Do Not Honor |
| 51 | Insufficient Funds |
| 54 | Expired Card |
| 61 | Exceeds Withdrawal Limit |
| 65 | Exceeds Frequency Limit |
| 91 | Issuer/Switch Inoperative |

### Success

| Code | Description |
|---|---|
| 00 | Approved |
| 10 | Partial Amount Approved |
| 11 | Approved VIP |

---

## Troubleshooting by Situation

### "My API call returns nothing / connection error"
1. Check you're hitting the correct URL (sandbox vs production)
2. Verify HTTPS is working (no SSL/TLS issues)
3. Check firewall isn't blocking outbound HTTPS
4. For QuickPay: Content-Type must be `text/plain`
5. For Payment API: Content-Type must be `application/json`

### "Customer says payment failed but I don't know why"
1. Call Payment Inquiry API with the invoice number
2. Check `respCode` in the response
3. Look up the code in Group 2 above
4. For QuickPay: use Query API with `qpID`, check `currentApproved`

### "Hash/signature keeps failing"
**For QuickPay (HMAC-SHA1):**
- Concatenate ALL fields in exact documented order
- Empty fields = empty string (not null, not skipped)
- Use HMAC-SHA1 with your Secret Key
- Output: lowercase hex string

**For Payment API (JWT):**
- Sign with HMAC SHA-256 (HS256)
- Use your Secret Key (not merchant ID)
- Payload must be valid JSON
- Check for extra whitespace or encoding issues

### "Payment succeeds in sandbox but fails in production"
1. Verify you switched to production credentials (merchant ID + secret key)
2. Verify you switched to production URL
3. Check your merchant account is activated for the payment method
4. Verify 3DS is configured correctly for production
5. Check currency is enabled for your merchant account

### "Backend notification (webhook) not received"
1. Verify `resultUrl2` is publicly accessible (not localhost)
2. Check firewall allows inbound POST from 2C2P IPs
3. Endpoint must return HTTP 200
4. Verify your endpoint handles the correct content type
5. For QuickPay: notification format differs from Payment API

### "Customer paid but my system shows unpaid"
1. Check if webhook endpoint is working (see above)
2. Call Query API (QuickPay) or Payment Inquiry API to verify
3. Check `currentApproved` > 0 (QuickPay) or `respCode` = 0000
4. Verify you're checking the correct invoice/order ID

### "Duplicate invoice error"
- Each `invoiceNo` (Payment API) or `orderIdPrefix` (QuickPay) must be unique per merchant
- Use timestamp, UUID, or sequential ID as part of the identifier
- If testing repeatedly, append timestamp: `ORDER-{timestamp}`

### "3DS authentication fails"
1. Ensure browser allows redirects/popups
2. Check return URLs are accessible
3. In sandbox: use OTP `123456`
4. In production: customer enters real OTP from their bank
5. If using `request3DS: "F"` (force), only ECI 02/05 accepted

### "Token expired"
- Payment tokens have a limited lifetime
- Request a new token if the old one expired
- Don't cache tokens for extended periods
- QuickPay links have their own `expiry` field — check it hasn't passed


---

## Group 5: Payment Flow Codes (Direct Integration)

These codes indicate what action the merchant's frontend should take after a Do Payment call. Returned in Direct API integration.

| Code | Platform | Flow | Action Required |
|---|---|---|---|
| 1000 | Web/Mobile | Load redirect URL in iframe/webview | Close iframe when result URL loads, read body message |
| 1001 | Web/Mobile | Full page redirect | Redirect browser to 3rd party page |
| 1002 | Web/Mobile | Deep link + poll status | Mobile: open app via scheme URL, poll Transaction Status API. Web: open in new tab, loop query |
| 1003 | Web/Mobile | Display payslip, wait for payment | Show payslip info, set status PENDING |
| 1004 | Mobile | App-to-app with callback | Redirect to app scheme, receive callback from 3rd party app |
| 1005 | Web/Mobile | Display QR, poll status | Show QR code, loop Transaction Status Inquiry API |
| 2000 | Web/Mobile | Payment complete | Check backend notification or call Payment Inquiry, display result |
| Other | Web/Mobile | Failed/rejected | Call Payment Inquiry for status, display result to customer |

---

## Group 6: Payment Maintenance Result Codes (Refund/Void/Settle)

These codes are returned when performing refunds, voids, settlements, or stored card operations.

### Success
| Code | Description |
|---|---|
| 00 | Success |

### Validation Errors
| Code | Description | Action |
|---|---|---|
| 01 | Stored card ID not found | Check card token |
| 02 | Invalid request | Check request format |
| 03 | Invalid merchant ID | Verify credentials |
| 04 | Invalid stored card unique ID | Check token value |
| 05 | Invalid customer email | Fix email format |
| 10 | Missing compulsory values | Include all required fields |
| 11 | Request validation failed | Check all field formats |
| 13 | Invalid hash value | Fix signature computation |
| 14 | Invalid merchant ID | Verify merchant ID |
| 15 | Invalid invoice number | Check invoice format |
| 16 | Transaction doesn't exist | Verify invoice/transaction ID |
| 17 | Invalid request type | Check action type |
| 18 | Invalid action amount | Check amount format |

### Void Errors
| Code | Description | Action |
|---|---|---|
| 12 | Transaction status not valid for action | Transaction already settled/refunded |
| 21 | Void not allowed | Check if void window has passed |
| 22 | Sub transaction cannot be voided individually | Void parent transaction |
| 25 | Void failed | Retry or contact 2C2P |
| 29 | Already voided | No action needed |

### Settlement Errors
| Code | Description | Action |
|---|---|---|
| 30 | Cannot refund/settle more than transaction amount | Reduce amount |
| 31 | Settlement not allowed | Check merchant config |
| 32 | Settlement not required | Auto-settle may be enabled |
| 33 | Partial settlement not allowed | Must settle full amount |
| 34 | Settlement rejected (duplicate capture) | Check if already captured |
| 35 | Settlement failed | Retry |
| 36 | Settlement not allowed beyond deadline | Too late — contact 2C2P |
| 39 | Already settled | No action needed |

### Refund Errors
| Code | Description | Action |
|---|---|---|
| 40 | Refund amount exceeds transaction | Reduce refund amount |
| 41 | Refund not allowed | Check merchant config or payment method |
| 42 | Refund pending | Wait for processing |
| 43 | Partial refund not allowed | Must refund full amount |
| 44 | Refund rejected | Check eligibility |
| 45 | Refund failed | Retry |
| 46 | Insufficient funds for refund | Top up merchant balance |
| 49 | Already fully refunded | No action needed |
| 54 | Refund exceeded allowable timeframe | Too late to refund |

### System Errors
| Code | Description | Action |
|---|---|---|
| 95 | Request timed out | Retry |
| 96 | Unable to decrypt | Check secret key |
| 97 | Process not supported | Check if feature is enabled |
| 99 | Unable to complete request | Retry or contact 2C2P |

---

## Group 7: Payment Maintenance Status Codes

These indicate the current status of a transaction (returned in inquiry responses).

| Status | Description | Meaning |
|---|---|---|
| A | Approved | Payment successful |
| AP | Approval Pending | Waiting for bank confirmation |
| AE | Approved after Expired (APM) | Late approval from alternative payment |
| AL | Approved with less amount | Customer paid less (APM) |
| AM | Approved with more amount | Customer paid more (APM) |
| PF | Payment Failed | Payment did not succeed |
| AR | Authentication Rejected (MPI) | 3DS authentication failed |
| FF | Fraud Rule Rejected | Blocked by fraud rules |
| IP | Rejected (Invalid Promotion) | Promo code invalid |
| ROE | Rejected (Routing Rejected) | Payment routing failed |
| RP | Refund Pending | Refund processing |
| RF | Refund Confirmed | Refund completed |
| RFF | Refund Failed | Refund did not succeed |
| RR | Refund Rejected | Refund denied |
| RR1 | Refund Rejected – insufficient balance | Merchant balance too low |
| RR2 | Refund Rejected – invalid bank info | Check beneficiary details |
| RR3 | Refund Rejected – bank account mismatch | Account details wrong |
| RS | Ready for Settlement | Awaiting capture/settlement |
| S | Settled | Funds captured |
| V | Voided/Canceled | Transaction voided |
| VP | Void Pending | Void processing |
| EX | Payment Expired | Payment window expired |
| CTS | Tokenization Success | Card token stored |
| CTF | Tokenization Failed | Card token not stored |

---

## Additional Reference: Payment Channels by Country

For detailed payment channel codes, bank codes, and supported methods per country, fetch:
- [Payment Channels](https://developer.2c2p.com/docs/reference-payment-channels.md)
- [Payment Channels Cut-Off Time](https://developer.2c2p.com/docs/reference-payment-channels-cut-off-time.md)


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Payment Response Codes](https://developer.2c2p.com/docs/response-code-payment.md)
- [Payment Flow Response Codes](https://developer.2c2p.com/docs/response-code-payment-flow.md)
- [Payment Maintenance Result Codes](https://developer.2c2p.com/docs/response-code-payment-maintenance-result-code.md)
- [Payment Maintenance Status Codes](https://developer.2c2p.com/docs/response-code-payment-maintenance-status-code.md)
- [Card ISO 8583 Response Codes](https://developer.2c2p.com/docs/response-code-card-iso-8583.md)
- [QuickPay Response Codes](https://developer.2c2p.com/docs/response-code-quickpay.md)
- [Payout Response Codes](https://developer.2c2p.com/docs/response-code-payout.md)
- [Payment Channels](https://developer.2c2p.com/docs/reference-payment-channels.md)
- [Payment Channels Cut-Off Time](https://developer.2c2p.com/docs/reference-payment-channels-cut-off-time.md)
