/*
 * Path to Venus shop. A lightweight public Shopify Storefront API integration.
 * Product titles, photos, variant options and prices come ONLY from the merchant.
 * Checkout takes place on Shopify's encrypted hosted checkout.
 * The store is explicitly in setup mode until merchant/shopify-config.js is filled.
 */
(() => {
  'use strict';
  const cfg = window.PTV_SHOPIFY || {};
  const domain = String(cfg.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const token = String(cfg.publicStorefrontToken || '').trim();
  const grid = document.getElementById('shop-products');
  const toolbar = document.getElementById('shop-toolbar');
  const search = document.getElementById('shop-search');
  const message = document.getElementById('shop-live-message');
  const loadMore = document.getElementById('load-more-products');
  const cartDialog = document.getElementById('shop-cart');
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('shop-cart-count');
  const subtotal = document.getElementById('cart-subtotal');
  const checkout = document.getElementById('shop-checkout');
  const allProducts = [];
  const bag = new Map();
  let category = 'all';
  let cursor = null;
  let more = false;
  const enabled = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain);

  function setMessage(value) { message.textContent = value || ''; }
  function money(amount, currency) {
    try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(Number(amount) || 0); }
    catch { return `${Number(amount).toFixed(2)} ${currency || 'USD'}`; }
  }
  function node(tag, className, value) {
    const x = document.createElement(tag);
    if (className) x.className = className;
    if (value != null) x.textContent = String(value);
    return x;
  }
  function classify(product) {
    const text = `${product.productType || ''} ${product.title || ''}`.toLowerCase();
    if (/mug|drinkware|cup|tumbler|bottle|glass|flask|ceramic/.test(text)) return 'drinkware';
    if (/t-shirt|tee\b|shirt|hoodie|sweat|top\b|apparel|cloth|socks|jacket|hat|cap\b|beanie/.test(text)) return 'apparel';
    return 'gifts';
  }
  async function query(graphql, variables) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['X-Shopify-Storefront-Access-Token'] = token; // Public storefront token only.
    const response = await fetch(`https://${domain}/api/2026-10/graphql.json`, {
      method: 'POST', headers, body: JSON.stringify({query:graphql, variables})
    });
    if (!response.ok) throw new Error(`Store unavailable (HTTP ${response.status}).`);
    const data = await response.json();
    if (data.errors?.length) throw new Error(data.errors[0].message || 'The merchandise catalog could not be loaded.');
    if (!data.data) throw new Error('The merchandise catalog could not be loaded.');
    return data.data;
  }
  const PRODUCTS_QUERY = `query ShopProducts($cursor: String) {
    products(first: 30, after: $cursor, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges { node { id title description productType
        featuredImage { url altText }
        variants(first: 100) { edges { node { id title availableForSale
          price { amount currencyCode } } } }
      } }
    }
  }`;
  async function loadProducts() {
    loadMore.disabled = true;
    setMessage(allProducts.length ? 'Loading more merchandise…' : 'Loading the collection…');
    try {
      const data = await query(PRODUCTS_QUERY, { cursor });
      const page = data.products;
      if (!page) throw new Error('Product data is missing.');
      for (const { node: item } of page.edges) {
        const variants = item.variants?.edges?.map(e => e.node) || [];
        allProducts.push({ ...item, variants, category:classify(item) });
      }
      cursor = page.pageInfo.endCursor;
      more = page.pageInfo.hasNextPage;
      loadMore.hidden = !more;
      loadMore.disabled = false;
      setMessage(allProducts.length ? '' : 'No published products yet. Add merchandise in Shopify to display it here.');
      renderProducts();
    } catch (error) {
      loadMore.disabled = false;
      setMessage(`The on-site catalog could not load: ${error.message} You can still shop our Printify collection below.`);
      if (!allProducts.length) {
        grid.replaceChildren();
        const fallback = node('div','shop-setup');
        fallback.append(node('h3','', 'Shop our current merchandise'));
        fallback.append(node('p','', 'The integrated store is temporarily unavailable. Our existing Printify storefront remains open.'));
        const a = node('a','store-btn','Shop on Printify ↗');
        a.href = 'https://path-to-venus.printify.me/'; a.target='_blank'; a.rel='noopener noreferrer';
        fallback.append(a); grid.append(fallback);
      }
    }
  }
  function renderProducts() {
    grid.replaceChildren();
    const term = search.value.trim().toLowerCase();
    const selected = allProducts.filter(p =>
      (category === 'all' || p.category === category) &&
      `${p.title} ${p.description} ${p.productType}`.toLowerCase().includes(term)
    );
    if (!selected.length) {
      grid.append(node('p','shop-empty',allProducts.length ? 'No products match that filter. Try another search or category.' : 'No published products yet.'));
      return;
    }
    for (const product of selected) grid.append(productCard(product));
  }
  function productCard(product) {
    const card = node('article','shop-product');
    const photo = node('div','shop-product-photo');
    if (product.featuredImage?.url && /^https:\/\//i.test(product.featuredImage.url)) {
      const img = document.createElement('img');
      img.src = product.featuredImage.url;
      img.alt = product.featuredImage.altText || product.title;
      img.loading = 'lazy';
      photo.append(img);
    } else photo.append(node('span','shop-no-photo','PATH TO VENUS'));
    card.append(photo);
    const content = node('div','shop-product-body');
    content.append(node('span','shop-product-category', product.category === 'drinkware' ? 'MUGS & DRINKWARE' : product.category === 'apparel' ? 'APPAREL' : 'GIFTS & MORE'));
    content.append(node('h3','', product.title));
    if (product.description) content.append(node('p','shop-product-description', product.description));
    const variants = product.variants || [];
    let selected = variants.find(v => v.availableForSale) || variants[0];
    const price = node('div','shop-product-price',selected ? money(selected.price.amount, selected.price.currencyCode) : 'See details');
    content.append(price);
    const select = node('select','shop-product-select');
    select.setAttribute('aria-label',`Choose style for ${product.title}`);
    variants.forEach(v => {
      const opt = node('option','',`${v.title} · ${money(v.price.amount,v.price.currencyCode)}${v.availableForSale ? '' : ' · Sold out'}`);
      opt.value = v.id;
      opt.disabled = !v.availableForSale;
      if (v.id === selected?.id) opt.selected=true;
      select.append(opt);
    });
    if (variants.length > 1) {
      select.addEventListener('change', () => {
        selected = variants.find(v => v.id === select.value);
        if (selected) price.textContent = money(selected.price.amount,selected.price.currencyCode);
      });
      content.append(select);
    }
    const add = node('button','shop-add',selected?.availableForSale ? 'Add to Bag +' : 'Sold out');
    add.type='button'; add.disabled=!selected?.availableForSale;
    add.addEventListener('click', () => {
      if (!selected?.availableForSale) return;
      const old = bag.get(selected.id);
      bag.set(selected.id,{variant:selected,product,quantity:(old?.quantity || 0)+1});
      renderCart();
      setMessage(`${product.title} added to your bag.`);
    });
    content.append(add); card.append(content);
    return card;
  }
  function renderCart() {
    const entries = [...bag.values()];
    const count = entries.reduce((sum,x) => sum + x.quantity,0);
    cartCount.textContent = String(count);
    checkout.disabled = count === 0;
    cartItems.replaceChildren();
    if (!count) cartItems.append(node('p','shop-empty','Your bag is empty.'));
    let total=0, currency='USD';
    entries.forEach(item => {
      const row = node('div','shop-cart-item');
      row.append(node('strong','',item.product.title));
      row.append(node('span','',item.variant.title));
      row.append(node('span','',money(item.variant.price.amount,item.variant.price.currencyCode)));
      const actions = node('div','shop-cart-controls');
      const minus=node('button','','−');minus.type='button';minus.setAttribute('aria-label',`Remove one ${item.product.title}`);
      const qty=node('span','',item.quantity);
      const plus=node('button','','+');plus.type='button';plus.setAttribute('aria-label',`Add one ${item.product.title}`);
      minus.addEventListener('click',() => {item.quantity--;if(item.quantity<1)bag.delete(item.variant.id);renderCart();});
      plus.addEventListener('click',() => {item.quantity++;renderCart();});
      actions.append(minus,qty,plus);row.append(actions);cartItems.append(row);
      currency=item.variant.price.currencyCode;
      total += Number(item.variant.price.amount)*item.quantity;
    });
    subtotal.textContent = money(total,currency);
  }
  function openCart() {
    cartDialog.hidden=false;
    document.body.classList.add('shop-cart-open');
    document.getElementById('close-cart').focus();
  }
  function closeCart() {
    cartDialog.hidden=true;
    document.body.classList.remove('shop-cart-open');
    document.getElementById('open-cart').focus();
  }
  document.getElementById('open-cart').addEventListener('click',openCart);
  document.getElementById('close-cart').addEventListener('click',closeCart);
  cartDialog.querySelector('[data-close-cart]').addEventListener('click',closeCart);
  document.addEventListener('keydown', e => {if(e.key==='Escape' && !cartDialog.hidden) closeCart();});
  checkout.addEventListener('click', async () => {
    if (!bag.size) return;
    checkout.disabled = true; checkout.textContent='Opening secure checkout…';
    try {
      const input = {lines:[...bag.values()].map(x=>({quantity:x.quantity,merchandiseId:x.variant.id}))};
      const data = await query(`mutation CreateCart($input:CartInput!){cartCreate(input:$input){cart{checkoutUrl}userErrors{message}}}`,{input});
      const out = data.cartCreate;
      if (out?.userErrors?.length) throw new Error(out.userErrors.map(e=>e.message).join('; '));
      const url = out?.cart?.checkoutUrl;
      if (!url || !/^https:\/\//.test(url)) throw new Error('Checkout is unavailable for this order.');
      window.location.assign(url);
    } catch (err) {
      setMessage('Checkout could not start: '+err.message);
      checkout.disabled=false;checkout.textContent='Secure checkout →';
      closeCart();
    }
  });
  for (const button of document.querySelectorAll('.shop-filter-buttons button')) {
    button.addEventListener('click',() => {
      category=button.dataset.filter;
      document.querySelectorAll('.shop-filter-buttons button').forEach(b => {
        const on=b===button;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));
      });
      renderProducts();
    });
  }
  document.querySelectorAll('[data-category-link]').forEach(a => a.addEventListener('click',() => {
    const target=document.querySelector(`.shop-filter-buttons button[data-filter="${a.dataset.categoryLink}"]`);
    if(target && enabled) target.click();
  }));
  search.addEventListener('input',renderProducts);
  loadMore.addEventListener('click',loadProducts);
  if (enabled) {toolbar.hidden=false; loadProducts();}
})();
