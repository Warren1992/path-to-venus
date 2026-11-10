# Path to Venus — Game Hide + Installable App + On-Site Store

## What's in this package

**Replace in the repository root** (where `index.html` and `CNAME` already live):
- `index.html` — Game links removed; install button added.
- `store.html` — Full new storefront design and store/cart integration UI.
- `contact.html`, `thank-you.html` — nav Game links removed, installation enabled.
- `styles.css` — existing CSS retained plus store and PWA enhancements.
- `nimbivale.html` — temporary *noindex* holding page, **not** the actual game. The old game can be restored from Git commit history.
- `sitemap.xml` — Game URL removed; existing pages and Venus articles retained.
- `manifest.webmanifest` — installable site metadata.
- `service-worker.js` — offline support for site pages. No customer payments/API requests are cached.
- `offline.html` — offline landing screen.

**Upload INTO `blog/`**:
- `blog/index.html` and the six `blog/*.html` article files — Game link removed, app installation added.
- `blog/feed.xml` doesn't need to change (not included in the minimal upload ZIP).

**Upload INTO `assets/`** (create folder if needed):
- `assets/app-icon-192.png`, `assets/app-icon-512.png` — app icons derived from existing Path to Venus logo.
- `assets/install-app.js` — install prompt/instructions for Android and iPhone.
- `assets/storefront.js` — optional real Shopify catalog, variants, shopping bag and secure checkout.

**Upload INTO `merchant/`** (create folder if needed):
- `merchant/shopify-config.js` — empty config until a real Shopify store is connected.

Keep everything else in GitHub exactly as-is, especially `public/`, `src/`, `.gitignore`, `CNAME`, and the Google ownership verification HTML file.

## Uploading from an Android phone (GitHub website)

1. Download the **MASTER ZIP** and extract it in the Files app.
2. In GitHub's `path-to-venus` repository on branch `main`, upload the ROOT files **to repository root** and commit.
3. Open the existing `blog` folder in GitHub, upload **only the updated HTML files from the extracted `blog` folder**, and commit.
4. Open or create `assets` folder in GitHub, upload the app icons and two JS files from extracted `assets`, and commit.
5. Open or create `merchant` folder in GitHub, upload its one config JS file, and commit.
6. Watch GitHub **Actions** for the latest **pages build and deployment** run to succeed; open `https://pathtovenus.com/`, `/store.html`, `/blog/`, `/manifest.webmanifest` and `/assets/app-icon-192.png` to test.
7. On Android Chrome/Samsung Internet, use **Install App** (or browser menu > Install app / Add to Home screen). On iOS, use **Safari > Share > Add to Home Screen**. HTTPS is required. Browser installation behavior may differ.

**Do not upload the ZIP itself**, and don't upload the full set into `blog` as that would duplicate the homepage. GitHub web upload from mobile may not preserve folder paths; always open the destination folder first.

## Merchant setup — IMPORTANT

### Current state
The full store layout and integration code are prepared, **but direct purchasing on `pathtovenus.com` is not active yet**. Until you configure Shopify, shoppers see an honest "on-site catalog is being prepared" note and can visit your current Printify Pop-Up Store at `https://path-to-venus.printify.me/` to purchase whatever is currently available there. Do not claim payments are accepted on your site before a merchant has been connected.

### Best path for real on-site browsing and cart
1. Create a Shopify store (Shopify typically has subscription/transaction costs).
2. Connect Printify as a fulfillment/print-on-demand app to your Shopify store. Publish **actual** shirts, mugs and other items with their genuine images, prices, variant sizes/colors and shipping settings. Products in your old Printify Pop-Up Store won't necessarily appear automatically in Shopify; publish or migrate them explicitly.
3. Enable sales via the Shopify Storefront API (or Headless sales channel). Get the shop's `*.myshopify.com` domain and a **public** Storefront access token if required.
4. Edit `merchant/shopify-config.js` in GitHub. Set `domain` to your **real** `your-store.myshopify.com` domain and `publicStorefrontToken` to the **PUBLIC** storefront token if the store requires one. **Never put Shopify Admin credentials, private API tokens, payment processor keys or passwords in this file**. It's visible to every visitor.
5. Commit the config, wait for Pages deployment, refresh `/store.html`. Real products automatically load. Visitors can select actual variants, add items to an on-site shopping bag, and click **Secure Checkout**. Final payment occurs at Shopify's hosted secure checkout (not on the static GitHub Pages server). Printify fulfills orders if the Shopify integration is set up.
6. Test a small purchase yourself before advertising the store. Check prices, tax, shipping, product availability, Shopify Payments/payment gateways, and Printify order processing.

**Why a separate payment service?** GitHub Pages is static hosting. It doesn't provide a secure card-processing backend or native Printify Pop-Up checkout integration. This package **does not handle or collect customer card details**.

### Lower-cost alternative
Keep Printify Pop-Up Store for fulfillment/payment and connect a custom subdomain such as `shop.pathtovenus.com` to Printify if their current plan/account supports it. That preserves Path to Venus branding in the address, but checkout still happens on Printify's hosted storefront, not within the `/store.html` page.

## Game visibility
The Game navigation link and homepage button are removed throughout the public site, and `nimbivale.html` becomes a `noindex` holding page. The prior game content is recoverable from the GitHub commit history. Any uploaded game images and code in `public` may still be publicly addressable by someone who knows their exact URLs; GitHub Pages is not a private file store.

## Notes
- Service worker caches only same-origin public static resources and never Shopify API calls or payment forms. The shop itself remains usable online when the merchant connection is configured.
- `sitemap.xml` omits the hidden Game URL but keeps the blog articles, Store, Contact, and homepage.
- To restore the old game later, restore `nimbivale.html` from a commit prior to this change and re-add its navigation links/sitemap URL.
- Search indexing and installation depend on browsers/crawlers. Test on an actual phone after Pages deploys.
