# 2C2P Web SDK (Drop-In UI) Integration Guide

## Overview

The 2C2P PGW Web SDK provides a **Drop-In V4 UI** that lets merchants accept payments on their website without building a custom payment form. The SDK renders a pre-built, PCI-compliant payment interface directly on your page.

**SDK Resources:**
```
JS:  https://pgw-ui.2c2p.com/sdk/js/pgw-sdk-4.2.1.js
CSS: https://pgw-ui.2c2p.com/sdk/css/pgw-sdk-style-4.2.1.css
```

---

## How It Works

1. Your server calls the **Payment Token API** to get a payment URL
2. You pass that URL to the Web SDK's `PGWSDK.paymentUI()` method
3. The SDK renders the payment form in your chosen display mode
4. Customer completes payment within the embedded UI
5. The SDK calls your callback with the transaction result
6. You verify the result via Transaction Status Inquiry API

---

## Quick Start

### Step 1: Include SDK Assets

Add the JS and CSS to your HTML `<head>`:

```html
<script src="https://pgw-ui.2c2p.com/sdk/js/pgw-sdk-4.2.1.js"></script>
<link rel="stylesheet" href="https://pgw-ui.2c2p.com/sdk/css/pgw-sdk-style-4.2.1.css">
```

### Step 2: Add Container Element

For `DropIn` and `Dialog` modes, add a container div:

```html
<div id="pgw-ui-container"></div>
```

### Step 3: Call Payment UI

```javascript
const uiRequest = {
    url: "https://sandbox-pgw-ui.2c2p.com/payment/4.1/#/token/YOUR_PAYMENT_TOKEN_HERE",
    mode: "DropIn",
    appBar: true,
    cancelConfirmation: true
};

PGWSDK.paymentUI(uiRequest, function(response) {

    if (response.responseCode == "0003") {
        // User canceled the transaction
    } else if (response.responseCode == "2000") {
        let transactionStatusInquiry = response.transactionStatusInquiry;

        if (transactionStatusInquiry) {
            // Handle transaction status inquiry response
        } else {
            // Call Payment Inquiry API with response.paymentToken
        }
    } else {
        console.log("Error: " + response.responseCode + " - " + response.responseDescription);
    }
});
```

---

## Configuration Options

### UI Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | String (255) | **Yes** | V4 UI payment URL generated from Payment Token API |
| `templateId` | String (50) | No | Custom template ID for branded UI |
| `mode` | String (20) | No | Display mode (default: `Fullscreen`) |
| `appBar` | Boolean | No | Show app bar header. Only for `Dialog` and `DropIn` modes. Default: `false` |
| `cancelConfirmation` | Boolean | No | Show cancel confirmation dialog. Only for `Dialog` and `DropIn` modes. Default: `false` |

### Display Modes

| Mode | Behavior |
|------|----------|
| `Fullscreen` | Loads payment UI in the same tab, full screen (default) |
| `DropIn` | Loads payment UI within a specified area on the page |
| `Dialog` | Loads payment UI as a popup dialog in the same tab |
| `Tab` | Opens payment UI in a new browser tab |

> `DropIn` and `Dialog` modes require the `<div id="pgw-ui-container"></div>` element on the page.

---

## UI Response Parameters

The callback receives a response object with:

| Parameter | Type | Description |
|-----------|------|-------------|
| `paymentToken` | String | Payment token for Transaction Status Inquiry or Payment Inquiry API |
| `transactionStatusInquiry` | Object | Transaction status inquiry response (only when responseCode is `2000`) |
| `responseCode` | String | Payment response code |
| `responseDescription` | String | Payment response description |

### Key Response Codes

| Code | Meaning |
|------|---------|
| `0003` | User canceled the transaction |
| `2000` | Transaction completed successfully |
| Other | Error — check `responseDescription` for details |

---

## Programmatic Payment Submit

Use `PGWSDK.submitPayment()` to trigger payment submission programmatically (only for `Dialog` and `DropIn` modes):

```javascript
PGWSDK.submitPayment("submit_gcard");
```

### Submit Types

| Submit Type | Payment Method |
|-------------|---------------|
| `submit_gcard` | Global Credit Card |
| `submit_lcard` | Local Credit Card |
| `submit_dpay` | Digital Payment (wallets) |
| `submit_qr` | QR Payment |
| `submit_counter` | Counter Payment |
| `submit_ssm` | Self Service Machine |
| `submit_webpay` | Web Payment / Direct Debit |
| `submit_imbank` | iBanking / mBanking |
| `submit_gbnpl` | Global Buy Now Pay Later |
| `submit_cancel` | Cancel Payment |

---

## Full Working Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>2C2P Payment</title>

    <script src="https://pgw-ui.2c2p.com/sdk/js/pgw-sdk-4.2.1.js"></script>
    <link rel="stylesheet" href="https://pgw-ui.2c2p.com/sdk/css/pgw-sdk-style-4.2.1.css">

    <script>
        window.onload = function() {

            document.getElementById("btn-pay").onclick = function() {

                const uiRequest = {
                    url: "https://sandbox-pgw-ui.2c2p.com/payment/4.1/#/token/YOUR_TOKEN",
                    mode: "DropIn",
                    appBar: true,
                    cancelConfirmation: true
                };

                PGWSDK.paymentUI(uiRequest, function(response) {

                    if (response.responseCode == "0003") {
                        alert("Payment canceled by user");
                    } else if (response.responseCode == "2000") {
                        if (response.transactionStatusInquiry) {
                            // Payment successful - show result
                            alert("Payment successful!");
                        } else {
                            // Call your server to verify via Payment Inquiry API
                            verifyPayment(response.paymentToken);
                        }
                    } else {
                        alert("Payment failed: " + response.responseDescription);
                    }
                });
            };

            // Optional: programmatic submit button
            document.getElementById("btn-submit").onclick = function() {
                PGWSDK.submitPayment("submit_gcard");
            };
        }
    </script>
</head>
<body>

    <button id="btn-pay">Pay Now</button>
    <button id="btn-submit">Submit Card Payment</button>

    <div style="height: 800px;">
        <div id="pgw-ui-container"></div>
    </div>

</body>
</html>
```

---

## Custom Styling

- Download the CSS file and customize styles for `DropIn` and `Dialog` modes
- Self-host the custom CSS file on your server
- Use the `templateId` parameter if you have a registered custom template

---

## Integration Checklist

1. **Generate payment token** — Call Payment Token API from your server to get the payment URL
2. **Include SDK assets** — Add JS and CSS to your page
3. **Add container div** — Required for DropIn/Dialog modes
4. **Call `PGWSDK.paymentUI()`** — Pass the payment URL and configuration
5. **Handle the callback** — Check response codes and verify payment status
6. **Verify server-side** — Always confirm payment via Transaction Status Inquiry or Payment Inquiry API

---

## Important Notes

- The `url` parameter must be generated server-side via the Payment Token API — never expose your merchant secret key in client-side code
- Always verify payment results server-side; do not rely solely on the client callback
- For sandbox testing, use `https://sandbox-pgw-ui.2c2p.com/` URLs
- For production, use `https://pgw-ui.2c2p.com/` URLs
- The `pgw-ui-container` div ID is mandatory and must not be changed


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Web SDK Drop-In UI](https://developer.2c2p.com/docs/web-sdk-drop-in-ui.md)
