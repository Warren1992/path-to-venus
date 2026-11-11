/* Path to Venus - Fourthwall Storefront API configuration.
 * In your Fourthwall dashboard: Settings > For developers > Storefront API > Create token.
 * IMPORTANT: Only use the ptkn_ STOREFRONT token, never an Open API password, admin token,
 * billing information, or private key. This file is PUBLIC on GitHub Pages.
 * Copy the shop's hostname (for example my-shop.fourthwall.com) from your Fourthwall dashboard.
 */
window.PTV_FOURTHWALL = {
  shopDomain: '',              // e.g. 'path-to-venus-shop.fourthwall.com'
  storefrontToken: '',         // ptkn_...; public Storefront API token only
  currency: 'USD'
};
