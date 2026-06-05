# Batch Services

## Overview

Batch authorization services allow merchants to authorize a batch of payments via SFTP connection. Files are uploaded encrypted and processed on a schedule.

## SFTP Connection

| Parameter | Value |
|-----------|-------|
| IP Address | `52.76.184.174` |
| Port | `22` |
| Request Path | `/input` (file pickup) |
| Response Path | `/output` (file drop) |

**Account setup:** Fill in the [SFTP Setup Form](https://2c2p-cloudfront.s3.ap-southeast-1.amazonaws.com/devPortal/setupForm/SFTP+Setup+Form+Nov+2025.pdf) and send to the 2C2P support team.

## Schedule

| Operation | Pickup Time | Drop Time |
|-----------|-------------|-----------|
| SimpleAuthorization | 5:00 AM GMT+7 | Before 6:00 AM GMT+7 |
| OfflineAuthorization | 2:00 PM GMT+7 | Before 6:00 AM GMT+7 (next day) |
| Tokenization/Refund | 2:00 AM GMT+7 | Before 3:00 AM GMT+7 |
| Quickpay/Promocode | Every hour | Within the next hour |
| Reconciliation report | — | Before 4:00 AM GMT+7 |

## File Format

- **File name:** `auth_YYYYMMDD_fileName.csv`
- **Delimiter:** semicolon `;`
- **Record delimiter:** line break
- **Encryption:** GPG ([download PGP Public Key](https://2c2p-cloudfront.s3.ap-southeast-1.amazonaws.com/devPortal/certs/PGP+Public+Key.zip))

## Integration Flow

1. Prepare the authorization request file (CSV)
2. Encrypt with GPG
3. Upload encrypted file to SFTP `/input`
4. 2C2P picks up and processes the file
5. 2C2P drops encrypted response file in SFTP `/output`
6. Download the encrypted response file
7. Decrypt with GPG
8. Read response data as payment acknowledgement

## Request File Format

### Header Record

```text
H;1.4;0000001;2015-01-01 00:00:01;2015-01-01 00:00:02;2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| recordType | C 1 | M | `H` (Header) |
| version | C 5 | M | Current: `1.4` |
| merchantID | C 15 | M | Merchant ID from 2C2P |
| createDateTime | C 19 | M | `yyyy-MM-dd HH:mm:ss` |
| processDateTime | C 19 | M | `yyyy-MM-dd HH:mm:ss` (merchant local time) |
| totalRecord | N 5 | M | Total number of transactions |

### Detail Record

```text
D;1;Invoice00001;1 night hotel in bali;300.00;840;4111111111111111;12;2020;;123;Joppie tjoa;support@2c2p.com;data1;data2;data3;data4;data5;;;;;;;;;;;
```

**Key fields:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| recordType | C 1 | M | `D` (Detail) |
| recordNo | N 5 | M | Running number 1–99999 |
| uniqueTransactionCode | C 20 | M | Unique invoice number |
| desc | C 50 | M | Payment description |
| amount | D 12,2 | M | e.g. `300.00` |
| currencyCode | N 3 | M | ISO-4217 numeric code |
| pan | N 16 | M | Card number (optional if using stored card token) |
| expiryMonth | N 2 | M | Card expiry month |
| expiryYear | N 4 | M | Card expiry year |
| storeCardUniqueID | C 20 | O | Stored card token |
| securityCode | N 4 | O | CVV2/CVC2/CID |
| cardholderName | C 50 | M | Cardholder name |
| cardholderEmail | C 50 | O | Cardholder email |
| userDefined1–5 | C 150 | O | Merchant-defined fields |
| ippTransaction | C 1 | O | `Y` for IPP, `N` or empty for non-IPP |
| installmentPeriod | N 2 | C | Required if IPP enabled |
| interestType | C 1 | C | `C` (customer) or `M` (merchant) |
| recurring | C 1 | O | `Y` to enable RPP |
| recurringPrefix | C 15 | C | Invoice prefix for RPP |
| recurringAmount | D 12,2 | C | Recurring amount |
| recurringInterval | N 2 | C | Frequency in days (1–365) |
| recurringCount | N 5 | C | Number of charges (`0` = indefinite) |
| recurringChargeNextDate | N 8 | C | Next charge date `ddMMyyyy` |
| recurringChargeOnDate | N 4 | C | Monthly charge date `ddMM` |

## Response File Format

### Header Record

```text
H;1.0;0000001;2015-01-02 00:00:02;4
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| recordType | C 1 | M | `H` (Header) |
| version | C 5 | M | `1.4` |
| merchantID | C 15 | M | Merchant ID |
| completeDateTime | C 19 | M | `YYYY-MM-DD hh:mm:ss` |
| totalRecords | N 5 | M | Total transactions |

### Detail Record

```text
D;1;Invoice00001;ABC123456;111222;0123456789;300.00;840;411111XXXXXX1111;;user1;user2;user3;;;;;00;approved
```

**Key fields:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| recordType | C 1 | M | `D` (Detail) |
| recordNo | N 5 | M | Running number |
| uniqueTransactionCode | C 20 | M | Invoice number |
| tranRef | C 28 | M | Routing trace reference |
| approvalCode | C 6 | M | Bank approval code |
| refNumber | C 15 | M | Bank reference number |
| amt | D 12,2 | M | Transaction amount |
| currencyCode | N 3 | M | ISO-4217 code |
| pan | N 16 | M | Masked card number |
| respCode | C 2 | M | Card response code |
| respDesc | C 100 | M | Response description |

## Full Detail

`raw/docs_content/13-batch-services/authorization.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Batch Services Authorization](https://developer.2c2p.com/docs/batch-services-authorization.md)
- [Batch Services Card Tokenization](https://developer.2c2p.com/docs/batch-services-card-tokenization.md)
- [Batch Services Refund](https://developer.2c2p.com/docs/batch-services-refund.md)
- [Batch Services QuickPay](https://developer.2c2p.com/docs/batch-services-quickpay.md)
