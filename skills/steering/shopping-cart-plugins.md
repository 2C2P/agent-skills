# Shopping Cart Plugins

2C2P provides pre-built plugins for major e-commerce platforms. Each plugin uses the Redirect API integration — no custom API code is needed.

## Common Configuration

All plugins share the same configuration parameters:

| Parameter | Description |
|-----------|-------------|
| Merchant ID | Provided by 2C2P (found in my2C2P portal) |
| Secret Key | Authentication key (found in my2C2P portal) |
| Mode | Sandbox (testing) or Production (live) |
| Stored Card Payment | Enable/disable card tokenization for repeat customers |
| 123 Payment Expiry | Payment slip validity in hours (8–720) |
| Language | Payment page language (default: English) |

---

## WooCommerce

**Supported versions:** 2.x, 3.x, 4.x, 5.x

**Setup:**
1. Download plugin from [2C2P](https://2c2p-cloudfront.s3.ap-southeast-1.amazonaws.com/devPortal/plugin/code/2c2p+woocommerce-build20241008.zip)
2. Upload to `/wp-content/plugins/plugin-name`
3. Activate via WordPress **Plugins** screen
4. Configure at **Plugins > 2C2P Redirect API for WooCommerce > Settings**

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/woocommerce.md`

---

## Magento 2

**Supported versions:** 2.2.x, 2.3.x, 2.4.x

**Setup:**
1. Download module from [2C2P](https://d27uu9vmlo4gwh.cloudfront.net/plugin/code/magento-2c2p-api_v4-build20260427.zip)
2. Unzip and copy files to your Magento application directory
3. Run: `php bin/magento setup:upgrade`
4. Flush cache: **System > Cache Management > Flush Magento Cache > Flush Cache Storage**
5. Configure at **Stores > Configuration > Sales > Payment Methods**

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/magento2.md`

---

## Shopify

**Supported versions:** Basic plan and above

**Setup:**
1. Log in to **Shopify Admin**
2. Go to **Settings > Payments > Additional Payment Methods > Add payment method**
3. Search for **2C2P** and select it
4. Click **Install**, then **Activate 2C2P**

**Key notes:**
- No API integration required — managed entirely by Shopify and 2C2P
- During onboarding, provide your **Shopify Shop ID** (your `your-store-name.myshopify.com` domain) to the 2C2P team
- Find Shop ID at **Shopify Admin > Settings > Store details > Store URL**

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/shopify.md`

---

## OpenCart 1

**Supported versions:** OpenCart 1.x

**Setup:**
1. Download plugin from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/opencart_1_v7.0.0.zip)
2. Unzip and copy files to your OpenCart folder
3. Admin panel: **Extension > Payment** → Install 2C2P → Edit to configure

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/opencart-1.md`

---

## OpenCart 2

**Supported versions:** OpenCart 2.x

**Setup:**
1. Download plugin from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/opencart_2_v7.0.0.zip)
2. Unzip and copy files to your OpenCart folder
3. Admin panel: **Extensions** → find 2C2P in Payments list → click **+** to install → Edit to configure

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/opencart-2.md`

---

## OpenCart 3

**Supported versions:** OpenCart 3.x

**Setup:**
1. Download plugin from [2C2P](https://2c2p-cloudfront.s3-ap-southeast-1.amazonaws.com/devPortal/plugin/code/opencart_3_v7.0.1.ocmod.zip)
2. Unzip and copy files to your OpenCart folder
3. Admin panel: **Extensions** → find 2C2P in Payments list → click **+** to install → Edit to configure

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/opencart-3.md`

---

## PrestaShop 1.6

**Supported versions:** PrestaShop 1.6

**Setup:**
1. Download module from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/prestashop_1.6_v7.0.1.zip)
2. Admin panel: **Modules and Services > Add a new module** → upload the zip
3. Find 2C2P in Installed modules → **Proceed with the installation**
4. Configure the module attributes

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/prestashop-1.6.md`

---

## PrestaShop 1.7

**Supported versions:** PrestaShop 1.7

**Setup:**
1. Download module from [2C2P](https://2c2p-cloudfront.s3-ap-southeast-1.amazonaws.com/devPortal/plugin/code/prestashop_1.7_v7.0.2.zip)
2. Admin panel: **Modules and Services > Upload a module** → upload the zip
3. Find 2C2P in Installed modules → **Configure**
4. Set module attributes

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/prestashop-1.7.md`

---

## osCommerce

**Supported versions:** osCommerce 2.3.4.1

**Setup:**
1. Download module from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/oscommerce_2.3_v7.0.0.zip)
2. Unzip and copy files to your osCommerce folder
3. Admin panel: **Modules > Payment > Install Module**
4. Select **Credit / Debit Card and Cash Payment (2C2P)** → **+ Install Module**
5. Configure attributes

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/oscommerce-2.3.4.1.md`

---

## VirtueMart

**Supported versions:** Joomla 3.7.5 + VirtueMart 3.2.4

**Setup:**
1. Download plugin from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/virtuemart_3.2_v7.0.0.zip)
2. Joomla admin: **Extension > Manage > Install** → upload the zip
3. Go to **Components > VirtueMart > Payment Methods > New**
4. Select **2C2P**, fill in details, then go to **Configuration** tab to set attributes
5. Click **Save & Close**

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/virtuemart-3.2.4.md`

---

## Ubercart

**Supported versions:** Ubercart 7 (Drupal)

**Setup:**
1. Download plugin from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/ubercart_7_v7.0.0.zip)
2. Drupal admin: **Module > Install new module** → upload the zip
3. Go to **Modules > UberCart - Payment** → tick checkbox → **Save Configuration**
4. Go to **Store > Payment Methods > Settings** to configure

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/ubercart-7.md`

---

## X-Cart 5

**Supported versions:** X-Cart 5

**Setup:**
1. Download module from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/x-cart5_v7.0.0.zip)
2. Unzip and copy files to your X-Cart application directory
3. Admin panel: **System tools > Cache management > Re-deploy the store**
4. Go to **My addons > Installed addons** → toggle **2C2P Payment** to On → **Save Changes**
5. Go to **Store Setup > Payment methods > Online methods > Add payment method** → search for 2C2P → **Add**
6. Configure attributes on the settings page

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/x-cart-5.md`

---

## ZenCart

**Supported versions:** ZenCart 1.5.5

**Setup:**
1. Download module from [2C2P](https://s.2c2p.com/Manuals/Plugins/plugins/downloads/zencart_1.5_v7.0.0.zip)
2. Unzip and copy files to your ZenCart folder
3. Admin panel: **Modules > Payment**
4. Select **Credit / Debit Card and Cash Payment (2C2P)** → **+ Install Module**
5. Configure attributes

**Full detail:** `raw/docs_content/06-shopping-cart-plugins/zencart-1.5.5.md`


---

## References

If the information above is insufficient, fetch these source documents for full detail:

- [WooCommerce](https://developer.2c2p.com/docs/shopping-cart-woocommerce.md)
- [Magento 2](https://developer.2c2p.com/docs/shopping-cart-magento2.md)
- [Shopify](https://developer.2c2p.com/docs/shopping-cart-shopify.md)
- [OpenCart 3](https://developer.2c2p.com/docs/shopping-cart-opencart-3.md)
- [PrestaShop 1.7](https://developer.2c2p.com/docs/shopping-cart-prestashop-1-7.md)
