# Path to Venus - Fourthwall Store Integration

This package replaces the old Shopify placeholder on your GitHub Pages Store page with a Fourthwall catalog, cart and hosted checkout.

## Step 1 - Make your product public

In admin.fourthwall.com choose Products, select **Occupy Venus - Planet Graphic T-Shirt**, tap the **Hidden** status, change it to **Public**, and Save. (A Hidden item will not appear in the public Storefront API collection.)

## Step 2 - Get your Fourthwall shop domain and Storefront token

- Copy your shop URL from the Fourthwall dashboard (typically `your-shop.fourthwall.com`).
- Open Settings > For developers > Storefront API > Create token.
- Confirm the one-time email code if Fourthwall asks.
- Copy the **Storefront API token** beginning with `ptkn_`.

**Only the public `ptkn_` Storefront token belongs in the website. Never insert an Open API username/password, administrative credential, private token, Stripe key or customer information in GitHub.**

## Step 3 - Configure the local copy

Open `merchant/fourthwall-config.js` from this package in a text editor. Fill the two empty strings: `shopDomain` (hostname only, no https://) and `storefrontToken` (ptkn_...). Save.

## Step 4 - Upload 3 files into GitHub

Extract the ZIP, **don't upload the ZIP itself**. Upload:

- `store.html` to the root of your `Warren1992/path-to-venus` GitHub repository, replacing the existing `store.html`.
- `assets/fourthwall-store.js` into the existing `assets` folder.
- `merchant/fourthwall-config.js` into the existing `merchant` folder.

Commit uploads to `main`. You do not have to delete your old `assets/storefront.js` or `merchant/shopify-config.js`: they become unused. The homepage, Blog, Store navigation and your Google verification file are unchanged.

## Step 5 - Verify

Wait for GitHub Pages Actions status Success, then visit https://pathtovenus.com/store.html. Check that your public Fourthwall items show real images and prices and can be added to the shopping bag. Run a test checkout up to the payment screen before advertising. Fourthwall handles payment and fulfillment. No payment card data touches your GitHub Pages website.

## Troubleshooting

- If you still see the Printify button: ensure both config values are entered and uploaded in the correct folder.
- If it shows zero products: change your Fourthwall product from Hidden to Public.
- If it reports HTTP 401/403: check that you generated a **Storefront API** `ptkn_` token, not Open API credentials.
- If checkout fails: ensure you copied the correct Fourthwall shop hostname and that your shop accepts orders.
- You may need to finish Fourthwall payout setup and activate product/shop sales before launch.

Official documentation:
- https://docs.fourthwall.com/storefront/overview
- https://docs.fourthwall.com/storefront/cart-checkout-tutorial
