# Payout

## How It Works

The Payout API enables merchants to disburse funds to beneficiaries through 2C2P.

**Flow:**
```
1. Merchant sends payout request to 2C2P
2. 2C2P verifies and forwards request to Bank
3. Bank sends payout response to 2C2P
4. 2C2P sends payout response to Merchant
5. Bank processes fund disbursement
6. Bank sends final payout status to 2C2P
7. 2C2P sends payout notification to Merchant
```

## Response Codes

### Success Codes

| Code | Description |
|------|-------------|
| 8100 | Payout disbursement success |
| 8101 | Payout request accepted |
| 8180 | Payout beneficiary registration success |
| 8181 | Payout beneficiary registration accepted |

### Rejection / Validation Errors

| Code | Description |
|------|-------------|
| 8102 | Payout request rejected from Bank |
| 8103 | Invalid Merchant |
| 8104 | Invalid Request ID |
| 8105 | Duplicate Request ID |
| 8106 | Invalid UTR |
| 8107 | Invalid Payout Date |
| 8108 | Invalid Amount |
| 8109 | Invalid Beneficiary Name |
| 8110 | Invalid Beneficiary Account No |
| 8111 | Invalid Beneficiary Bank Code |
| 8112 | Invalid Beneficiary Mobile No |
| 8113 | Invalid User Defined Property |
| 8114 | Cannot find payout provider |
| 8115 | Payout feature not enabled (contact account manager) |
| 8116 | Insufficient Balance |
| 8117 | Invalid Request |
| 8118 | Invalid ID Card |
| 8119 | Invalid SoF |
| 8120 | Invalid Beneficiary Id |
| 8121 | Invalid Registered Beneficiary Status |
| 8122 | Invalid Company Id |
| 8123 | Invalid Regency Code |
| 8124 | Invalid Beneficiary Email Address |
| 8125 | Invalid Notification URL |
| 8126 | Rejected (Refunded) |
| 8127 | Duplicate UTR |
| 8128 | Invalid Passport Number |
| 8129 | Invalid Army/Police Number |
| 8130 | Duplicate Beneficiary Entry |
| 8131 | Invalid Preferred Provider |
| 8132 | Invalid Account Status |
| 8133 | Invalid Account Type |
| 8134 | Invalid Beneficiary Type |
| 8135 | Invalid Use of Preferred Provider |
| 8136 | Invalid Currency Code |
| 8182 | Duplicate beneficiary registration |
| 8183 | Payout beneficiary registration rejected |

### System Errors

| Code | Description |
|------|-------------|
| 8197 | Payout malfunction |
| 8198 | Payout timeout error |
| 8199 | Internal Server Error |
| 8200 | Interface Error |
| 8201 | Bank Timeout Error |

### Lookup / File Errors

| Code | Description |
|------|-------------|
| 8401 | Customer Payout Not Found |
| 8402 | Payout Not Found |
| 8403 | Merchant Not Found |
| 8404 | Batch File Content Incorrect |
| 8405 | Cannot Read File |
| 8406 | File Has No Content |
| 8407 | File Has Missing Fields or Wrong Content |
| 8408 | Incorrect File Name |
| 8409 | Incorrect File Size |
| 8410 | Duplicate Transaction Id |
| 8411 | Bank Codes Not Exist |
| 8412 | Incorrect File Extension |

### KYC/CDD Codes

| Code | Description |
|------|-------------|
| 8500 | CDD checking pass |
| 8501 | CDD checking fail |
| 8502 | KYC Manual Process Pending |

## Full Detail

- `raw/docs_content/11-payout/how-it-works.md`
- `raw/docs_content/11-payout/response-code.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Payout How It Works](https://developer.2c2p.com/docs/payout-how-it-works.md)
- [Payout Response Codes](https://developer.2c2p.com/docs/payout-response-code.md)
