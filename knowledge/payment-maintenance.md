# Payment Maintenance API

The 2C2P Payment Maintenance API (also called Payment Action API) allows merchants to manage transactions after payment — including inquiry, void, refund, settle, recurring plan management, token maintenance, and more.

## Authentication & Encryption

All Payment Maintenance APIs use **JWE + JWS with exchange keys**:
- JWE algorithm: RSA-OAEP + A256GCM
- Signature: JWS PS256
- Requests are sent as encrypted JWT in the HTTP POST body (`Content-Type: text/plain`)
- Responses are returned as encrypted JWT and must be decrypted

Exception: Balance Inquiry and Withdrawal APIs use **JWS PS256 only** (signed, not encrypted with JWE).

## Base URLs

| Environment | URL |
|---|---|
| Sandbox | `https://demo2.2c2p.com/2C2PFrontend/PaymentAction/2.0/action` |
| Production | `https://t.2c2p.com/PaymentAction/2.0/action` |
| Production (Indonesia) | `https://pgwcore.dp.alipay.com/PaymentAction/2.0/action` |

> Some APIs (Customer Token, Agent Status, Balance Inquiry, Withdrawal) use different endpoint paths — see individual sections.

---

## 1. How Payment Maintenance Works (Overview)

The Payment Action API enables merchants to:
- **Payment Process**: Inquiry, Void/Cancel, Settle/Capture, Refund, Refund Status
- **Card Tokenization**: Add, check, update, or delete tokenized card data
- **RPP Maintenance**: Check, update, cancel recurring payment plans
- **IPP Options Inquiry**: Retrieve available installment plans
- **FX Rate Inquiry**: Retrieve foreign exchange rates
- **Balance Inquiry**: Check available merchant balance
- **Withdrawal**: Withdraw funds from merchant account
- **Agent Status Inquiry**: Check payment agent availability (FPX Malaysia)

---

## 2. Refund

**Purpose**: Refund a settled transaction. Multiple partial refunds allowed up to the original settled amount.

**Endpoint**: `POST /PaymentAction/2.0/action`

**Key Parameters** (`processType = "R"`):

| Parameter | Description |
|---|---|
| `version` | `4.3` |
| `merchantID` | Merchant identifier |
| `invoiceNo` | Original transaction invoice number |
| `actionAmount` | Amount to refund |
| `processType` | `R` (Refund) |
| `notifyURL` | (Optional) URL for async refund notification |

**Request Example**:
```xml
<PaymentProcessRequest>
  <version>4.3</version>
  <merchantID>JT07</merchantID>
  <invoiceNo>260121085327</invoiceNo>
  <actionAmount>25.00</actionAmount>
  <processType>R</processType>
</PaymentProcessRequest>
```

**Response Example**:
```xml
<PaymentProcessResponse>
  <version>4.3</version>
  <timeStamp>250221155131</timeStamp>
  <respCode>00</respCode>
  <respDesc>Success</respDesc>
  <processType>R</processType>
  <invoiceNo>260121085327</invoiceNo>
  <amount>25.00</amount>
  <status>RF</status>
  <approvalCode>2508513089</approvalCode>
  <referenceNo>3528643</referenceNo>
  <refundReferenceNo>3598743</refundReferenceNo>
  <transactionDateTime>20210126085854</transactionDateTime>
  <maskedPan>411111XXXXXX1111</maskedPan>
  <eci>05</eci>
  <paymentScheme>VI</paymentScheme>
  <processBy>VI</processBy>
</PaymentProcessResponse>
```

**Important Notes**:
- Refunds can only be requested for **settled** transactions
- For alternative payment methods, refunds are asynchronous — initial response may be `REFUND_PENDING`
- Use `notifyURL` or poll Refund Status Inquiry for async refund results
- Async notification is sent as HTTP POST body: `notifyResponse={encrypted_jwt}`

---

## 3. Void / Cancel

**Purpose**: Stop an existing transaction from being settled (credit cards) or cancel payment collection (alternative payments).

**Endpoint**: `POST /PaymentAction/2.0/action`

**Key Parameters** (`processType = "V"`):

| Parameter | Description |
|---|---|
| `version` | `4.3` |
| `timestamp` | Format: `ddmmyyhhmmss` |
| `merchantID` | Merchant identifier |
| `invoiceNo` | Transaction invoice number |
| `actionAmount` | Transaction amount |
| `processType` | `V` (Void) |

**Request Example**:
```xml
<PaymentProcessRequest>
  <version>4.3</version>
  <timestamp>{ddmmyyhhmmss}</timestamp>
  <merchantID>JT07</merchantID>
  <invoiceNo>250221094450</invoiceNo>
  <actionAmount>105.00</actionAmount>
  <processType>V</processType>
</PaymentProcessRequest>
```

**Response Example**:
```xml
<PaymentProcessResponse>
  <version>4.3</version>
  <timeStamp>250221153713</timeStamp>
  <respCode>00</respCode>
  <respDesc>Success</respDesc>
  <processType>V</processType>
  <invoiceNo>250221094450</invoiceNo>
  <amount>105.00</amount>
  <status>V</status>
  <approvalCode>295068</approvalCode>
  <referenceNo>3596581</referenceNo>
  <transactionDateTime>20210225094710</transactionDateTime>
  <maskedPan>411111XXXXXX1111</maskedPan>
  <eci>05</eci>
  <paymentScheme>VI</paymentScheme>
  <processBy>VI</processBy>
</PaymentProcessResponse>
```

**Important Notes**:
- Void must be sent **same day** as authorization, before acquirer cut-off time
- Cut-off time varies by acquirer

---

## 4. Settle Payment

**Purpose**: Capture/settle a pre-authorized transaction.

**Endpoint**: `POST /PaymentAction/2.0/action`

**Key Parameters** (`processType = "S"`):

| Parameter | Description |
|---|---|
| `version` | `4.3` |
| `merchantID` | Merchant identifier |
| `processType` | `S` (Settle) |
| `invoiceNo` | Pre-authorized transaction invoice number |

**Request Example**:
```xml
<PaymentProcessRequest>
  <version>4.3</version>
  <merchantID>JT07</merchantID>
  <processType>S</processType>
  <invoiceNo>INV14235354</invoiceNo>
</PaymentProcessRequest>
```

**Response Example**:
```xml
<PaymentProcessResponse>
  <version>4.3</version>
  <timeStamp>080221085851</timeStamp>
  <respCode>00</respCode>
  <respDesc>Success</respDesc>
  <processType>S</processType>
  <invoiceNo>INV14235354</invoiceNo>
  <amount>25.00</amount>
  <status>RS</status>
  <approvalCode>12345</approvalCode>
  <referenceNo>2475643463</referenceNo>
  <transactionDateTime>20211211111934</transactionDateTime>
  <maskedPan>41111XXXXXX1111</maskedPan>
  <eci>00</eci>
  <paymentScheme>VI</paymentScheme>
  <processBy>VI</processBy>
</PaymentProcessResponse>
```

**Important Notes**:
- Pre-authorized transactions not settled within ~7 days are automatically voided by the acquirer
- Settlement period varies by acquirer

---

## 5. Refund Status Inquiry

**Purpose**: Retrieve refund record(s) for a particular transaction.

**Endpoint**: `POST /PaymentAction/2.0/action`

**Key Parameters** (`processType = "RS"`):

| Parameter | Description |
|---|---|
| `version` | `4.3` |
| `merchantID` | Merchant identifier |
| `invoiceNo` | Original transaction invoice number |
| `actionAmount` | Original transaction amount |
| `processType` | `RS` (Refund Status) |

**Request Example**:
```xml
<PaymentProcessRequest>
  <version>4.3</version>
  <merchantID>JT07</merchantID>
  <invoiceNo>260121085327</invoiceNo>
  <actionAmount>25.00</actionAmount>
  <processType>RS</processType>
</PaymentProcessRequest>
```

**Response Example**:
```xml
<PaymentProcessResponse>
  <version>4.3</version>
  <timeStamp>250221160113</timeStamp>
  <respCode>00</respCode>
  <respDesc>Success</respDesc>
  <processType>RS</processType>
  <invoiceNo>260121085327</invoiceNo>
  <amount>25.00</amount>
  <status>S</status>
  <approvalCode>621529</approvalCode>
  <referenceNo>3528643</referenceNo>
  <transactionDateTime>20210126085854</transactionDateTime>
  <maskedPan>411111XXXXXX1111</maskedPan>
  <eci>05</eci>
  <refundList>
    <refund amount="25.00" status="RF" referenceNo="3598743" dateTime="20210225155130" />
  </refundList>
  <paymentScheme>VI</paymentScheme>
  <processBy>VI</processBy>
</PaymentProcessResponse>
```

---

## 6. Payment Inquiry

**Purpose**: Check the current status of a transaction.

**Endpoint**: `POST /PaymentAction/2.0/action`

**Key Parameters** (`processType = "I"`):

| Parameter | Description |
|---|---|
| `version` | `4.3` |
| `merchantID` | Merchant identifier |
| `invoiceNo` | Transaction invoice number |
| `actionAmount` | Transaction amount |
| `processType` | `I` (Inquiry) |

**Request Example**:
```xml
<PaymentProcessRequest>
  <version>4.3</version>
  <merchantID>JT07</merchantID>
  <invoiceNo>250221094450</invoiceNo>
  <actionAmount>105.00</actionAmount>
  <processType>I</processType>
</PaymentProcessRequest>
```

**Response Example**:
```xml
<PaymentProcessResponse>
  <version>4.3</version>
  <timeStamp>250221100508</timeStamp>
  <respCode>00</respCode>
  <respDesc>Success</respDesc>
  <processType>I</processType>
  <invoiceNo>250221094450</invoiceNo>
  <amount>105.00</amount>
  <status>A</status>
  <approvalCode>295068</approvalCode>
  <referenceNo>3596581</referenceNo>
  <transactionDateTime>20210225094710</transactionDateTime>
  <maskedPan>411111XXXXXX1111</maskedPan>
  <eci>05</eci>
  <paymentScheme>VI</paymentScheme>
  <processBy>VI</processBy>
</PaymentProcessResponse>
```

---

## 7. Recurring Payment Maintenance

**Purpose**: Check, update, or cancel recurring payment plans (RPP).

**Endpoint**: `POST /PaymentAction/2.0/action`

### 7.1 Recurring Payment Inquiry (`processType = "I"`)

**Request Example**:
```xml
<RecurringMaintenanceRequest>
  <version>2.4</version>
  <timeStamp>030321155002</timeStamp>
  <merchantID>JT01</merchantID>
  <recurringUniqueID>156142</recurringUniqueID>
  <processType>I</processType>
  <recurringStatus>Y</recurringStatus>
  <amount>99.90</amount>
  <recurringInterval>30</recurringInterval>
  <recurringCount>12</recurringCount>
</RecurringMaintenanceRequest>
```

**Response Example**:
```xml
<RecurringMaintenanceResponse>
  <version>2.1</version>
  <timeStamp>030321155002</timeStamp>
  <merchantID>JT01</merchantID>
  <recurringUniqueID>156142</recurringUniqueID>
  <respCode>00</respCode>
  <respReason>Inquiry Successful</respReason>
  <recurringStatus>Y</recurringStatus>
  <invoicePrefix>030321135205</invoicePrefix>
  <currency>702</currency>
  <amount>000000009990</amount>
  <maskedCardNo>XXXXXXXXXXXX1111</maskedCardNo>
  <allowAccumulate>N</allowAccumulate>
  <maxAccumulateAmount>000000001000</maxAccumulateAmount>
  <recurringInterval>30</recurringInterval>
  <recurringCount>12</recurringCount>
  <chargeNextDate>20210307</chargeNextDate>
</RecurringMaintenanceResponse>
```

### 7.2 Update Recurring Payment (`processType = "U"`)

**Key Parameters**:

| Parameter | Description |
|---|---|
| `recurringUniqueID` | Unique ID of the recurring plan |
| `processType` | `U` (Update) |
| `amount` | New amount (12-digit format) |
| `recurringInterval` | Days between charges |
| `recurringCount` | Total number of charges |
| `allowAccumulate` | `Y` or `N` |

**Request Example**:
```xml
<RecurringMaintenanceRequest>
  <version>2.4</version>
  <timeStamp>050321091314</timeStamp>
  <merchantID>JT01</merchantID>
  <recurringUniqueID>156142</recurringUniqueID>
  <processType>U</processType>
  <recurringStatus>Y</recurringStatus>
  <amount>000000009990</amount>
  <allowAccumulate>N</allowAccumulate>
  <recurringInterval>30</recurringInterval>
  <recurringCount>24</recurringCount>
</RecurringMaintenanceRequest>
```

### 7.3 Cancel Recurring Payment (`processType = "C"`)

**Request Example**:
```xml
<RecurringMaintenanceRequest>
  <version>2.4</version>
  <timeStamp>050321095210</timeStamp>
  <merchantID>JT01</merchantID>
  <recurringUniqueID>156142</recurringUniqueID>
  <processType>C</processType>
  <recurringStatus>Y</recurringStatus>
  <amount>000000009990</amount>
  <allowAccumulate>N</allowAccumulate>
</RecurringMaintenanceRequest>
```

**Response** (Cancel):
```xml
<RecurringMaintenanceResponse>
  <version>2.4</version>
  <timeStamp>050321095210</timeStamp>
  <respCode>00</respCode>
  <respReason>Cancel Successful</respReason>
  <recurringUniqueID>156142</recurringUniqueID>
</RecurringMaintenanceResponse>
```

---

## 8. Customer Token Maintenance

**Purpose**: Add, update, inquiry, or delete tokenized customer payment data.

### Endpoints

| Operation | Sandbox URL | Production URL |
|---|---|---|
| Add | `POST /customertoken/3.0/CustomerToken/add` | `https://pgw.2c2p.com/customertoken/3.0/CustomerToken/add` |
| Update | `POST /customertoken/3.0/CustomerToken/update` | `https://pgw.2c2p.com/customertoken/3.0/CustomerToken/update` |
| Inquiry | `POST /customertoken/3.0/CustomerToken/get` | `https://pgw.2c2p.com/customertoken/3.0/CustomerToken/get` |
| Delete | `POST /customertoken/3.0/CustomerToken/delete` | `https://pgw.2c2p.com/customertoken/3.0/CustomerToken/delete` |

Sandbox base: `https://sandbox-pgw.2c2p.com`

### 8.1 Add Customer Token

**Request Example**:
```json
{
  "merchantID": "458458000000000",
  "accountNo": "4111111111111111",
  "name": "Terrance",
  "email": "terrance.tay@2c2p.com",
  "expiry": "2024-02-01",
  "accountIssuer": "UOB Bank",
  "accountIssuerCountry": "SG",
  "accountCurrency": "SGD",
  "tokenProvider": "CC"
}
```

**Response Example**:
```json
{
  "merchantID": "458458000000000",
  "token": "261020155003189559",
  "accountNo": "411111XXXXXX1111",
  "name": "Terrance",
  "email": "terrance.tay@2c2p.com",
  "expiry": "2024-02-01",
  "accountIssuer": "UOB Bank",
  "accountIssuerCountry": "SG",
  "accountCurrency": "SGD",
  "responseCode": "0000",
  "responseDesc": "Success"
}
```

### 8.2 Update Customer Token

**Request Example**:
```json
{
  "merchantID": "458458000000000",
  "token": "261020155003189559",
  "name": "Terrance",
  "email": "terrance.tay@2c2p.com",
  "expiry": "2024-09-30",
  "accountIssuer": "HSBC Bank",
  "accountIssuerCountry": "MY",
  "accountCurrency": "MYR",
  "tokenProvider": "CC"
}
```

### 8.3 Inquiry Customer Token

**Request Example**:
```json
{
  "merchantID": "458458000000000",
  "token": "261020155003189559"
}
```

### 8.4 Delete Customer Token

**Request Example**:
```json
{
  "merchantID": "458458000000000",
  "token": "261020155003189559"
}
```

**Response Example**:
```json
{
  "merchantID": "458458000000000",
  "token": "261020155003189559",
  "responseCode": "0000",
  "responseDesc": "Success"
}
```

---

## 9. Balance Inquiry

**Purpose**: Check available merchant balance.

**Endpoints**:

| Environment | URL |
|---|---|
| Sandbox | `POST https://demo2.2c2p.com/2c2pfrontend/paymentaction/2.0/balanceInquiry` |
| Production | `POST https://t.2c2p.com/paymentaction/2.0/balanceInquiry` |

**Encryption**: JWS PS256 only (signed with merchant private key, verified with 2C2P public key).

**Request Example**:
```json
{
  "merchantID": "702702000000000",
  "version": "1.0"
}
```

**Response Example**:
```json
{
  "version": "1.0",
  "respCode": "00",
  "respDesc": "Success",
  "availableBalance": "795904449.7206",
  "currency": "SGD"
}
```

---

## 10. FX Rate Inquiry

**Purpose**: Retrieve foreign exchange rates for supported currencies.

**Endpoint**: `POST /PaymentAction/2.0/action`

### 10.1 Single Currency Rate

**Request Example**:
```xml
<FxRateRequest>
  <version>2.1</version>
  <timeStamp>180321162445</timeStamp>
  <merchantID>JT</merchantID>
  <currency>702</currency>
</FxRateRequest>
```

**Response Example**:
```xml
<FxRateResponse>
  <version>2.1</version>
  <timeStamp>180321162445</timeStamp>
  <merchantID>JT</merchantID>
  <currency>702</currency>
  <fxRate>1.0000</fxRate>
  <baseCurrency>702</baseCurrency>
  <responseCode>00</responseCode>
  <respReason>Success</respReason>
</FxRateResponse>
```

### 10.2 FX Rate List (All Currencies)

**Request Example**:
```xml
<FxRateListRequest>
  <version>2.1</version>
  <timeStamp>070222084005</timeStamp>
  <merchantID>JT</merchantID>
  <hashValue>22B47EA9A54A6BE7D4243C993F84EBBA55CC5AD8</hashValue>
</FxRateListRequest>
```

**Response** returns a `<currencyList>` with all supported currency codes and their FX rates relative to the base currency.

---

## 11. IPP Options Inquiry

**Purpose**: Retrieve available installment payment plan (IPP) options for a merchant.

**Endpoint**: `POST /PaymentAction/2.0/action`

**Request Example**:
```xml
<IppOptionRequest>
  <version>2.2</version>
  <timeStamp>131221155503</timeStamp>
  <merchantID>JT01</merchantID>
</IppOptionRequest>
```

**Response** includes per-bank IPP options:
```xml
<IppOptionResponse>
  <version>2.2</version>
  <timeStamp>131221155503</timeStamp>
  <respCode>00</respCode>
  <respReason>Success</respReason>
  <ippBanks>
    <ippBank>
      <bankName>HSBC</bankName>
      <bankShortName>HSBC</bankShortName>
      <bankLogoUrl>https://d11fwxgc8zkidi.cloudfront.net/images/ippbanklogo/27.png</bankLogoUrl>
      <bins>
        <bin>424625</bin>
        <bin>448521</bin>
      </bins>
      <installmentOptions>
        <option id="1" installmentPeriod="6" merInterestRate="1.0000" cusInterestRate="1.0000" minAmount="1.00" currencyCode="SGD" validFrom="2018-02-06" validUntil="2023-02-01" />
        <option id="2" installmentPeriod="3" merInterestRate="1.0000" cusInterestRate="1.0000" minAmount="1.00" currencyCode="SGD" validFrom="2018-02-06" validUntil="2023-02-01" />
      </installmentOptions>
    </ippBank>
  </ippBanks>
</IppOptionResponse>
```

**Key response fields per option**: `installmentPeriod`, `merInterestRate`, `cusInterestRate`, `minAmount`, `currencyCode`, `validFrom`, `validUntil`.

---

## 12. Agent Status Inquiry

**Purpose**: Check if payment agents (banks) are online or down. Currently only supports **FPX in Malaysia**.

### Endpoints

| Operation | Sandbox URL | Production URL |
|---|---|---|
| By agent codes | `POST https://sandbox-pgw.2c2p.com/AgentStatus/v1/Inquiry` | `https://pgw.2c2p.com/AgentStatus/v1/Inquiry` |
| All agents | `POST https://sandbox-pgw.2c2p.com/AgentStatus/v1/InquiryEnabledAgents` | `https://pgw.2c2p.com/AgentStatus/v1/InquiryEnabledAgents` |

### By Agent Codes

**Request Example**:
```json
{
  "merchantID": "458458000000000",
  "agentCodes": ["MYMBB", "MYABB"]
}
```

### All Agents

**Request Example**:
```json
{
  "merchantID": "458458000000000"
}
```

**Response Example**:
```json
{
  "agents": [
    { "agentCode": "MYMBB", "isDown": true },
    { "agentCode": "MYABB", "isDown": true }
  ],
  "merchantID": "458458000000000",
  "respCode": "0000",
  "respDesc": "Success"
}
```

**Supported agent codes**: `MYMBB`, `MYPBB`, `MYAMB`, etc. See Payment Channels - WebPay reference for full list.

---

## 13. Withdrawal

**Purpose**: Withdraw funds from merchant account. Includes retrieving withdrawal options and performing the withdrawal.

**Encryption**: JWS PS256 only (not JWE).

### Endpoints

| Operation | Sandbox URL | Production URL |
|---|---|---|
| Withdraw Options | `POST https://demo2.2c2p.com/2c2pfrontend/paymentaction/2.0/withdrawOption` | `https://t.2c2p.com/paymentaction/2.0/withdrawOption` |
| Withdraw | `POST https://demo2.2c2p.com/2c2pfrontend/paymentaction/2.0/withdraw` | `https://t.2c2p.com/paymentaction/2.0/withdraw` |

### 13.1 Withdraw Options

**Request Example**:
```json
{
  "version": "1.0",
  "merchantID": "702702000000000"
}
```

**Response Example**:
```json
{
  "version": "1.0",
  "respCode": "00",
  "respDesc": "Success",
  "withdrawOption": [
    {
      "merchantId": "702702000000000",
      "withdrawOptionId": 3,
      "name": "Withdraw fund",
      "processingTime": "5 days",
      "feeMargin": 1000.0,
      "feeLower": 0.5,
      "feeLowerIsPercentage": "1",
      "feeUpper": 0.7,
      "feeUpperIsPercentage": "1"
    }
  ]
}
```

### 13.2 Withdraw

**Request Example**:
```json
{
  "version": "1.0",
  "merchantID": "702702000000000",
  "withdrawOptionID": 3,
  "amount": 100
}
```

**Response Example**:
```json
{
  "version": "1.0",
  "respCode": "00",
  "respDesc": "Success",
  "withdrawRefNo": 691012,
  "withdrawOptionId": 3,
  "amount": 100.0,
  "currency": "SGD",
  "fee": 0.5,
  "netAmount": 99.5
}
```

---

## Process Type Quick Reference

| Code | Operation |
|---|---|
| `I` | Payment Inquiry |
| `V` | Void / Cancel |
| `S` | Settle / Capture |
| `R` | Refund |
| `RS` | Refund Status Inquiry |

## Transaction Status Codes

| Status | Meaning |
|---|---|
| `A` | Authorized |
| `S` | Settled |
| `V` | Voided |
| `RF` | Refunded |
| `RS` | Request Settle (pending) |

## cURL Template

```bash
curl --location --request POST '{endpoint_url}' \
--header 'Content-Type: text/plain' \
--data-raw '{encrypted_jwt_payload}'
```

---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Payment Maintenance How It Works](https://developer.2c2p.com/docs/payment-maintenance-how-it-works.md)
- [Refund](https://developer.2c2p.com/docs/payment-maintenance-refund.md)
- [Void/Cancel](https://developer.2c2p.com/docs/payment-maintenance-void-cancel.md)
- [Settle Payment](https://developer.2c2p.com/docs/payment-maintenance-settle-payment.md)
- [Payment Inquiry](https://developer.2c2p.com/docs/payment-maintenance-payment-inquiry.md)
- [Refund Status Inquiry](https://developer.2c2p.com/docs/payment-maintenance-refund-status-inquiry.md)
- [Recurring Payment Maintenance](https://developer.2c2p.com/docs/payment-maintenance-recurring-payment-maintenance.md)
- [Customer Token Maintenance](https://developer.2c2p.com/docs/payment-maintenance-customer-token-maintenance.md)
- [Balance Inquiry](https://developer.2c2p.com/docs/payment-maintenance-balance-inquiry.md)
- [FX Rate Inquiry](https://developer.2c2p.com/docs/payment-maintenance-fx-rate-inquiry.md)
- [IPP Options Inquiry](https://developer.2c2p.com/docs/payment-maintenance-ipp-options-inquiry.md)
- [Agent Status Inquiry](https://developer.2c2p.com/docs/payment-maintenance-agent-status-inquiry.md)
- [Withdrawal](https://developer.2c2p.com/docs/payment-maintenance-withdrawal.md)
