# SNAP API (Indonesia)

## What is SNAP?

SNAP (Standar Nasional Open API Pembayaran / National Standard Open API for Payments) is an Indonesian standard for payment API integration. 2C2P's SNAP API provides a compliant set of APIs for secure integration using `POST` HTTPS requests.

## Integration Steps

### Step 1: Generate RSA Keys and Exchange

1. Download the **2C2P Public Key** from the Merchant Portal: **Account > Options > 2C2P Public Keys**
2. Generate your own RSA key pair (public key must be in **x509** format)
3. Upload your **public key** to the Merchant Portal: **Account > Options > Merchant Public Keys**
4. Set the key ID to `snap`

### Step 2: Message Structure

**Method:** `POST`

**Required Headers:**

| Header | Description |
|--------|-------------|
| X-TIMESTAMP | Request timestamp: `YYYY-MM-DDThh:mm:ss±HH:MM` |
| X-CLIENT-KEY | Your Merchant ID (OAuth API only) |
| X-SIGNATURE | Base64-encoded SHA256withRSA signature |
| X-PARTNER-ID | Your Merchant ID (all APIs except OAuth) |
| Authorization | `Bearer {access_token}` (after OAuth) |
| Content-Type | `application/json` |

### Step 3: Signature Generation

**Formula:**
```
signature = base64Encode(sha256withRSA({content}, {YOUR_PRIVATE_KEY}))
```

**Content to sign:**
- For OAuth: `{YOUR_MERCHANT_ID}|{X-TIMESTAMP}`
- For other APIs: the request body

**C# Example:**
```csharp
using System;
using System.Security.Cryptography;
using System.Text;

public static string Sign(string merchantId, string xtimestamp, string merchantPrivateKey)
{
    string content = $"{merchantId}|{xtimestamp}";

    using RSA rsa = RSA.Create();
    rsa.ImportFromPem(merchantPrivateKey);

    byte[] dataBytes = Encoding.UTF8.GetBytes(content);
    byte[] signedBytes = rsa.SignData(dataBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

    return Convert.ToBase64String(signedBytes);
}
```

**Node.js Example:**
```javascript
const crypto = require("crypto");

function sign(merchantId, xtimestamp, merchantPrivateKey) {
    const content = `${merchantId}|${xtimestamp}`;

    const signature = crypto.sign("sha256", Buffer.from(content, "utf8"), {
        key: merchantPrivateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    });

    return signature.toString("base64");
}
```

**Java Example:**
```java
public static String sign(String merchantId, String xtimestamp, String merchantPrivateKey) {
    String content = merchantId + "|" + xtimestamp;

    java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
    PrivateKey priKey = KeyFactory.getInstance("RSA").generatePrivate(
        new PKCS8EncodedKeySpec(Base64.getDecoder().decode(merchantPrivateKey.getBytes(StandardCharsets.UTF_8))));

    signature.initSign(priKey);
    signature.update(content.getBytes(StandardCharsets.UTF_8));
    byte[] signed = signature.sign();

    return new String(Base64.getEncoder().encode(signed), StandardCharsets.UTF_8);
}
```

### Step 3: Environments

| Environment | Base URL |
|-------------|----------|
| Sandbox | `https://sandbox-pgw.2c2p.com` |
| Production | `https://pgw.2c2p.com` |

## Full Detail

`raw/docs_content/12-snap/overview.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [SNAP Overview](https://developer.2c2p.com/docs/snap-overview.md)
