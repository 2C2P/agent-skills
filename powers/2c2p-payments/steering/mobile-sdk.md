# 2C2P Mobile SDK Integration Guide

## Overview

The 2C2P Payment Gateway (PGW) SDK enables native mobile payment acceptance within iOS and Android apps. It provides PCI-DSS compliant card handling, so merchants never touch raw card data directly.

**Supported platforms:** Android (API 19+ / OS 4.4+), iOS (12.0+), Flutter, React Native

**Current version:** 4.7.1

**Supported payment methods:**
- Credit/debit cards (global and local)
- Digital wallets (Apple Pay, Google Pay, GrabPay, LINE Pay, TrueMoney, etc.)
- QR payments
- Internet/mobile banking
- Pay at counter
- Buy Now Pay Later
- Crypto (TripleA)

---

## How It Works

The payment flow follows this sequence:

1. Customer checks out in the merchant app
2. Merchant app sends checkout info to merchant server
3. Merchant server requests a **payment token** from 2C2P Payment Token API
4. Merchant server passes the payment token to the mobile app
5. Mobile app constructs a payment request and calls `proceedTransaction`
6. 2C2P processes the payment (may redirect for 3DS authentication)
7. 2C2P sends backend notification to merchant server
8. App receives transaction result and displays to customer

---

## Android Integration

### Step 1: Add Dependency

In your `build.gradle` or `build.gradle.kts`:

```gradle
dependencies {
    implementation("com.2c2p:pgw-sdk:4.7.1")
}
```

### Step 2: Initialize SDK

Initialize in your `Application` class:

```kotlin
import com.ccpp.pgw.sdk.android.builder.PGWSDKParamsBuilder
import com.ccpp.pgw.sdk.android.core.PGWSDK
import com.ccpp.pgw.sdk.android.enums.APIEnvironment

class CustomApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        val pgwsdkParams = PGWSDKParamsBuilder(this, APIEnvironment.Production)
                           .build()

        PGWSDK.initialize(pgwsdkParams)
    }
}
```

> Use `APIEnvironment.Sandbox` for testing.

### Step 3: Make a Payment

```kotlin
// 1. Receive payment token from your server
val paymentToken = "token_from_your_server"

// 2. Construct payment request
val paymentCode = PaymentCode("CC")

val paymentRequest = CardPaymentBuilder(paymentCode, "4111111111111111").apply {
    expiryMonth(12)
    expiryYear(2026)
    securityCode("123")
}.build()

// 3. Construct transaction request
val transactionResultRequest = TransactionResultRequestBuilder(paymentToken).apply {
    with(paymentRequest)
}.build()

// 4. Execute payment
PGWSDK.getInstance().proceedTransaction(transactionResultRequest, object : APIResponseCallback<TransactionResultResponse> {

    override fun onResponse(response: TransactionResultResponse) {
        if (response.responseCode == APIResponseCode.TransactionAuthenticateRedirect ||
            response.responseCode == APIResponseCode.TransactionAuthenticateFullRedirect) {
            val redirectUrl = response.data // Open WebView for 3DS
        } else if (response.responseCode == APIResponseCode.TransactionCompleted) {
            // Payment complete - inquiry result
        } else {
            // Handle error
        }
    }

    override fun onFailure(error: Throwable) {
        // Handle error
    }
})
```

### Step 4: Handle 3DS Authentication (WebView)

When the response code is `TransactionAuthenticateRedirect`, open a WebView:

```kotlin
class PGWWebViewFragment private constructor() : Fragment() {

    private lateinit var redirectUrl: String

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {

        val webview = WebView(requireActivity()).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = PGWWebViewClient(transactionStatusCallback, webViewClientCallback)
        }

        webview.loadUrl(this.redirectUrl)
        return webview
    }

    private val transactionStatusCallback = object : PGWWebViewTransactionStatusCallback {
        override fun onInquiry(paymentToken: String) {
            // Do Transaction Status Inquiry API and close WebView
        }
    }
}
```

---

## iOS Integration

### Step 1: Add Swift Package

1. Open project in Xcode
2. Go to Package Dependencies → click **+**
3. Add package collection: `https://swiftpackageindex.com/2C2P/collection.json`
4. Select the PGW package and add to your target

Add to Build Phases → Run Script:
```bash
bash "${BUILT_PRODUCTS_DIR}/PGW.framework/integrate-dynamic-framework.sh"
```

### Step 2: Initialize SDK

Initialize in `AppDelegate`:

```swift
import PGW

class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        let pgwsdkParams = PGWSDKParamsBuilder(apiEnvironment: APIEnvironment.Production)
                          .build()

        PGWSDK.initialize(params: pgwsdkParams)

        return true
    }
}
```

### Step 3: Make a Payment

```swift
// 1. Receive payment token from your server
let paymentToken = "token_from_your_server"

// 2. Construct payment request
let paymentCode = PaymentCode(channelCode: "CC")

let paymentRequest = CardPaymentBuilder(paymentCode: paymentCode, "4111111111111111")
                     .expiryMonth(12)
                     .expiryYear(2026)
                     .securityCode("123")
                     .build()

// 3. Construct transaction request
let transactionResultRequest = TransactionResultRequestBuilder(paymentToken: paymentToken)
                               .with(paymentRequest)
                               .build()

// 4. Execute payment
PGWSDK.shared.proceedTransaction(transactionResultRequest: transactionResultRequest, { (response: TransactionResultResponse) in

    if response.responseCode == APIResponseCode.TransactionAuthenticateRedirect ||
       response.responseCode == APIResponseCode.TransactionAuthenticateFullRedirect {
        let redirectUrl = response.data // Open WKWebView for 3DS
    } else if response.responseCode == APIResponseCode.TransactionCompleted {
        // Payment complete - inquiry result
    } else {
        // Handle error
    }
}) { (error: NSError) in
    // Handle error
}
```

### Step 4: Handle 3DS Authentication (WKWebView)

```swift
import WebKit
import PGW

class PGWWebViewController: UIViewController {

    var webView: WKWebView!
    var pgwWebViewNavigationDelegate: PGWWebViewNavigationDelegate!
    var redirectUrl: String?

    override func viewDidLoad() {
        super.viewDidLoad()

        let requestUrl = URL(string: self.redirectUrl!)!
        let request = URLRequest(url: requestUrl)

        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true

        let webConfiguration = WKWebViewConfiguration()
        webConfiguration.preferences = preferences

        self.webView = WKWebView(frame: UIScreen.main.bounds, configuration: webConfiguration)
        self.webView.navigationDelegate = self.pgwTransactionResultCallback()
        self.webView.load(request)

        self.view.addSubview(self.webView)
    }

    private func pgwTransactionResultCallback() -> PGWWebViewNavigationDelegate {
        self.pgwWebViewNavigationDelegate = PGWWebViewNavigationDelegate({ (paymentToken: String) in
            // Do Transaction Status Inquiry API and close WebView
        })
        return self.pgwWebViewNavigationDelegate
    }
}
```

---

## Flutter Integration

### Setup

Add the PGW SDK Flutter package to `pubspec.yaml` (see [Flutter SDK download](https://developer.2c2p.com/docs/sdk-download-sdk-flutter)).

### Initialize

```dart
import 'package:pgw_sdk/core/pgw_sdk_delegate.dart';
import 'package:pgw_sdk/enum/api_environment.dart';

void main() async {
  Map<String, dynamic> pgwsdkParams = {
    'apiEnvironment': APIEnvironment.production
  };

  await PGWSDK().initialize(pgwsdkParams, (error) {
    // Handle error
  }).whenComplete(() {
    runApp(const MyApp());
  });
}
```

### Make a Payment

```dart
// 1. Payment token from server
String paymentToken = 'token_from_your_server';

// 2. Construct payment request
Map<String, dynamic> paymentCode = {'channelCode': 'CC'};

Map<String, dynamic> paymentRequest = {
  'cardNo': '4111111111111111',
  'expiryMonth': 12,
  'expiryYear': 2026,
  'securityCode': '123'
};

// 3. Construct transaction request
Map<String, dynamic> transactionResultRequest = {
  'paymentToken': paymentToken,
  'payment': {
    'code': {...paymentCode},
    'data': {...paymentRequest}
  }
};

// 4. Execute payment
PGWSDK().proceedTransaction(transactionResultRequest, (response) {
  if (response['responseCode'] == APIResponseCode.transactionAuthenticateRedirect ||
      response['responseCode'] == APIResponseCode.transactionAuthenticateFullRedirect) {
    String redirectUrl = response['data']; // Open WebView
  } else if (response['responseCode'] == APIResponseCode.transactionCompleted) {
    // Inquiry payment result
  } else {
    // Handle error
  }
}, (error) {
  // Handle error
});
```

---

## React Native Integration

### Setup

Add `@2c2p/pgw-sdk-react-native` to your `package.json` (see [React Native SDK download](https://developer.2c2p.com/docs/sdk-download-sdk-react-native)).

### Initialize

```typescript
import RTNPGW, { APIEnvironment } from '@2c2p/pgw-sdk-react-native';

let pgwsdkParams = {
  'apiEnvironment': APIEnvironment.production
};

RTNPGW.initialize(JSON.stringify(pgwsdkParams)).then((response: string) => {
  // SDK ready
}).catch((error: Error) => {
  // Handle error
});
```

### Make a Payment

```typescript
let paymentToken = 'token_from_your_server';

let paymentCode = {'channelCode': 'CC'};

let paymentRequest = {
  'cardNo': '4111111111111111',
  'expiryMonth': 12,
  'expiryYear': 2026,
  'securityCode': '123'
};

let transactionResultRequest = {
  'paymentToken': paymentToken,
  'payment': {
    'code': {...paymentCode},
    'data': {...paymentRequest}
  }
};

await RTNPGW.proceedTransaction(JSON.stringify(transactionResultRequest)).then((response: string) => {
  let result = JSON.parse(response);

  if (result?.responseCode == APIResponseCode.transactionAuthenticateRedirect ||
      result?.responseCode == APIResponseCode.transactionAuthenticateFullRedirect) {
    let redirectUrl = result?.data; // Open WebView
  } else if (result?.responseCode == APIResponseCode.transactionCompleted) {
    // Inquiry payment result
  } else {
    // Handle error
  }
}).catch((error: Error) => {
  // Handle error
});
```

---

## Payment Features

### Customer Tokenization (Stored Cards)

Tokenization stores card details as a token for future payments. The customer doesn't need to re-enter card info on subsequent purchases.

**Payment Token API request** — same as standard card payment.

**Key difference in payment request** — set `tokenize` to `true`:

```kotlin
val customerTokenization = true

val paymentRequest = CardPaymentBuilder(paymentCode, "4111111111111111").apply {
    expiryMonth(12)
    expiryYear(2026)
    securityCode("123")
    tokenize(customerTokenization)
}.build()
```

```swift
let paymentRequest = CardPaymentBuilder(paymentCode: paymentCode, "4111111111111111")
                     .expiryMonth(12)
                     .expiryYear(2026)
                     .securityCode("123")
                     .tokenize(true)
                     .build()
```

After successful payment, 2C2P returns a card token that can be stored for future use.

### Customer Token Payments (Pay with Stored Card)

Use a previously stored token instead of full card details. The customer still needs to enter CVV.

### Tokenization Without Authorization

Same as tokenization but without processing a payment. Useful for saving cards during account setup. Requires customer consent.

### Installment Payment Plan (IPP)

Offer installment options from multiple banks. The payment token request includes IPP-specific parameters. Retrieve available plans via the Payment Option Details API.

**Payment Token API request for IPP:**

```json
{
    "merchantID": "JT04",
    "invoiceNo": "1595219400",
    "description": "2 days 1 night hotel room",
    "amount": 10.0,
    "currencyCode": "THB",
    "paymentChannel": ["GCARD"],
    "request3DS": "Y"
}
```

Use the Payment Option Details API to retrieve available installment plans, then include the selected plan in the payment request.

### Recurring Payment Plan (RPP)

Set up automatic recurring charges. The first payment captures card details, then 2C2P automatically charges at specified intervals.

**Payment Token API request with recurring parameters:**

```json
{
    "merchantID": "JT04",
    "invoiceNo": "1595219400",
    "description": "Monthly subscription",
    "amount": 10.0,
    "currencyCode": "THB",
    "paymentChannel": ["GCARD"],
    "request3DS": "Y",
    "recurring": true,
    "invoicePrefix": "demo1596431482",
    "recurringAmount": 1.0,
    "recurringInterval": 5,
    "recurringCount": 3,
    "allowAccumulate": true,
    "maxAccumulateAmount": 10.0,
    "chargeNextDate": "04122020"
}
```

| Parameter | Description |
|-----------|-------------|
| `recurring` | Enable recurring (true) |
| `invoicePrefix` | Prefix for auto-generated invoice numbers |
| `recurringAmount` | Amount for each recurring charge |
| `recurringInterval` | Days between charges |
| `recurringCount` | Total number of recurring charges |
| `allowAccumulate` | Allow accumulation if charge fails |
| `maxAccumulateAmount` | Maximum accumulated amount |
| `chargeNextDate` | Date of first recurring charge (DDMMYYYY) |

The card payment request itself is the same as a standard card payment. The recurring logic is controlled by the payment token parameters.

### User Address for Payment

Pre-fill billing address during checkout for customers whose address is already on file.

---

## SDK APIs Reference

| API | Purpose |
|-----|---------|
| `systemInitialization` | Retrieve locales, icons, and resources |
| `paymentOption` | Get merchant details and enabled payment options |
| `paymentOptionDetails` | Get bank bins and installment plan options |
| `proceedTransaction` | Execute a payment request |
| `transactionStatusInquiry` | Check payment result by transaction ID |
| `cancelTransaction` | Cancel a pending transaction |
| `exchangeRate` | Get exchange rate information |
| `customerTokenInformation` | Get stored token details |
| `loyaltyPointInformation` | Get loyalty point balance |
| `paymentNotification` | Send payment notification to customer |
| `userPreference` | Get/set user preferences |

---

## Response Code Handling

After calling `proceedTransaction`, handle these key response codes:

| Response Code | Action |
|---------------|--------|
| `TransactionAuthenticateRedirect` | Open WebView with `response.data` URL |
| `TransactionAuthenticateFullRedirect` | Open WebView with `response.data` URL |
| `TransactionCompleted` | Payment done — call Transaction Status Inquiry |
| Other codes | Display error to user |

---

## Important Notes

- Always initialize the SDK in `Application` (Android) or `AppDelegate` (iOS) before any payment calls
- Payment tokens are generated server-side via the Payment Token API — never expose your secret key in the mobile app
- For 3DS authentication, use the SDK-provided `PGWWebViewClient` (Android) or `PGWWebViewNavigationDelegate` (iOS) to handle callbacks
- After 3DS completes, the WebView callback returns a payment token for Transaction Status Inquiry
- Backend payment notifications are sent to your server's registered return URL


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [Mobile SDK How It Works](https://developer.2c2p.com/docs/mobile-sdk-how-it-works.md)
- [Android Integration](https://developer.2c2p.com/docs/sdk-how-to-integrate-android.md)
- [iOS Integration](https://developer.2c2p.com/docs/sdk-how-to-integrate-ios.md)
- [Flutter Integration](https://developer.2c2p.com/docs/sdk-how-to-integrate-flutter.md)
- [React Native Integration](https://developer.2c2p.com/docs/sdk-how-to-integrate-react-native.md)
- [Payment Features](https://developer.2c2p.com/docs/mobile-sdk-payment-features.md)
