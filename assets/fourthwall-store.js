/* Path to Venus / Fourthwall Storefront API integration.
 * Official endpoints: https://docs.fourthwall.com/storefront/
 * No real checkout occurs until a public Fourthwall token and shop domain are configured.
 */
(() => {
  'use strict';
  const cfg = window.PTV_FOURTHWALL || {};
  const token = String(cfg.storefrontToken || '').trim();
  const domain = String(cfg.shopDomain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const currency = /^[A-Z]{3}$/.test(cfg.currency || '') ? cfg.currency : 'USD';
  const enabled = /^ptkn_[a-z0-9_-]+$/i.test(token) && /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(domain);
  const apiBase = 'https://storefront-api.fourthwall.com/v1';
  const $ = id => document.getElementById(id);
  const grid=$('shop-products'), msg=$('shop-live-message'), toolbar=$('shop-toolbar');
  const search=$('shop-search'), moreBtn=$('load-more-products');
  const bagPanel=$('shop-cart'), bagItems=$('cart-items'), checkout=$('shop-checkout');
  const bagCount=$('shop-cart-count'), bagTotal=$('cart-subtotal');
  let products=[], page=0, more=false, filter='all', busy=false;
  const bag=new Map();
  const escapeURL = value => encodeURIComponent(String(value));
  const money = amount => {
    try {return new Intl.NumberFormat('en-US',{style:'currency',currency}).format(Number(amount)||0)}
    catch{return '$'+Number(amount || 0).toFixed(2)}
  };
  function el(tag,className,text) {
    const n=document.createElement(tag);if(className)n.className=className;
    if(text!==undefined)n.textContent=String(text);return n;
  }
  function show(message){msg.textContent=message || ''}
  async function api(path, options={}) {
    const u=new URL(apiBase+'/'+path.replace(/^\//,''));
    u.searchParams.set('storefront_token',token);
    const response=await fetch(u.href,{...options,headers:{'Content-Type':'application/json',...(options.headers || {})}});
    if(!response.ok)throw new Error('Fourthwall returned HTTP '+response.status+'.');
    return response.json();
  }
  function categoryOf(p) {
    const s=(p.name+' '+(p.description||'')).toLowerCase();
    if(/mug|cup|drink|tumbler|bottle|glass/.test(s))return 'drinkware';
    if(/shirt|tee\b|hoodie|sweat|apparel|wear|hat|cap|beanie|sock/.test(s))return 'apparel';
    return 'gifts';
  }
  function available(variant,p) {
    const state=String(p?.state?.type||'AVAILABLE').toUpperCase();
    const stock=String(variant?.stock?.type || '').toUpperCase();
    return !!variant && state==='AVAILABLE' && !['SOLD_OUT','OUT_OF_STOCK','UNAVAILABLE'].includes(stock) && !(variant.stock?.quantity===0);
  }
  async function loadProducts() {
    if(busy)return;
    busy=true;moreBtn.disabled=true;
    show(products.length ? 'Loading more merchandise…' : 'Loading the official collection…');
    try {
      const result=await api('collections/all/products?page='+page+'&size=40&currency='+currency);
      if(!Array.isArray(result.results))throw new Error('Unexpected product data.');
      for(const p of result.results)if(p.type!=='BUNDLE' && Array.isArray(p.variants)) products.push(p);
      more=Boolean(result.paging?.hasNextPage);page++;
      moreBtn.hidden=!more;
      if(!products.length)show('No public products are available yet. Set your Fourthwall products to Public.');
      else show('');
      renderProducts();
    }catch(e){
      show('The live product catalog could not load: '+e.message);
      if(!products.length)fallback('The Fourthwall connection is not available yet.');
    }finally{busy=false;moreBtn.disabled=false}
  }
  function fallback(detail) {
    grid.replaceChildren();
    const box=el('div','shop-setup');
    box.append(el('div','shop-setup-mark','✦'),el('h3','', 'Shop Path to Venus'),el('p','',detail));
    const link=el('a','store-btn','Shop our available merchandise ↗');
    link.href='https://path-to-venus.printify.me/';link.target='_blank';link.rel='noopener noreferrer';
    box.append(link);grid.append(box);
  }
  function card(p) {
    const card=el('article','shop-product');
    const picture=el('div','shop-product-photo');
    const source=p.images?.[0]?.url;
    if(typeof source==='string' && /^https:\/\//i.test(source)) {
      const img=el('img');img.src=source;img.alt=p.name || 'Path to Venus product';img.loading='lazy';
      picture.append(img);
    }else picture.append(el('span','shop-no-photo','PATH TO VENUS'));
    card.append(picture);
    const body=el('div','shop-product-body');
    const c=categoryOf(p);
    body.append(el('span','shop-product-category',c==='apparel'?'APPAREL':c==='drinkware'?'MUGS & DRINKWARE':'GIFTS & MORE'));
    body.append(el('h3','',p.name || 'Official merchandise'));
    if(p.description){const d=document.createElement('p');d.className='shop-product-description';
      // Fourthwall product descriptions can contain markup; display as plain text to avoid XSS.
      const stripped=String(p.description).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
      d.textContent=stripped.slice(0,210);body.append(d);
    }
    const variants=p.variants||[];
    let selected=variants.find(v=>available(v,p))||variants[0];
    const price=el('div','shop-product-price',selected?.unitPrice ? money(selected.unitPrice.value):'See pricing');
    body.append(price);
    if(variants.length>1) {
      const select=el('select','shop-product-select');select.setAttribute('aria-label','Choose size or color for '+p.name);
      for(const v of variants) {
        const label=v.attributes?.description || v.name || [v.attributes?.color?.name,v.attributes?.size?.name].filter(Boolean).join(' / ') || 'One size';
        const opt=el('option','',label+(v.unitPrice?' · '+money(v.unitPrice.value):'')+(available(v,p)?'':' · unavailable'));
        opt.value=v.id;opt.disabled=!available(v,p);if(v.id===selected?.id)opt.selected=true;select.append(opt);
      }
      select.addEventListener('change',()=>{selected=variants.find(v=>v.id===select.value);
        price.textContent=selected?.unitPrice?money(selected.unitPrice.value):'See pricing';
        add.disabled=!available(selected,p);add.textContent=add.disabled?'Unavailable':'Add to bag +';
      });body.append(select);
    }
    const add=el('button','shop-add',available(selected,p)?'Add to bag +':'Unavailable');
    add.type='button';add.disabled=!available(selected,p);
    add.addEventListener('click',()=>{
      if(!available(selected,p))return;
      const old=bag.get(selected.id);
      bag.set(selected.id,{p,v:selected,qty:(old?.qty||0)+1});
      renderBag();show((p.name||'Product')+' added to your bag.');
    });body.append(add);
    if(/^[a-z0-9-]+$/.test(p.slug||'')) {
      const a=el('a','shop-quick-link','View product details');
      a.href='https://'+domain+'/products/'+encodeURIComponent(p.slug);
      a.target='_blank';a.rel='noopener noreferrer';body.append(a);
    }
    card.append(body);return card;
  }
  function renderProducts() {
    const term=search.value.trim().toLowerCase();
    const visible=products.filter(p=>(filter==='all'||categoryOf(p)===filter)
      &&(p.name+' '+(p.description||'')).toLowerCase().includes(term));
    grid.replaceChildren();
    if(!visible.length){grid.append(el('p','shop-empty',products.length?'No matching products. Try a different search or category.':'Your first public product will appear here.'));return}
    const frag=document.createDocumentFragment();for(const p of visible)frag.append(card(p));grid.append(frag);
  }
  function renderBag() {
    const entries=[...bag.values()];
    bagCount.textContent=String(entries.reduce((n,x)=>n+x.qty,0));
    checkout.disabled=!entries.length;
    bagItems.replaceChildren();
    let total=0;
    if(!entries.length)bagItems.append(el('p','shop-empty','Your bag is empty.'));
    entries.forEach(item=>{
      total += Number(item.v.unitPrice?.value||0)*item.qty;
      const row=el('div','shop-cart-item');
      row.append(el('strong','',item.p.name),el('span','',item.v.attributes?.description||item.v.name||'Standard'));
      row.append(el('span','',money(item.v.unitPrice?.value)));
      const control=el('div','shop-cart-controls');const minus=el('button','','−');
      minus.type='button';minus.setAttribute('aria-label','Remove one '+item.p.name);
      const qty=el('span','',item.qty);const plus=el('button','','+');plus.type='button';
      plus.setAttribute('aria-label','Add one '+item.p.name);
      minus.addEventListener('click',()=>{item.qty--;if(!item.qty)bag.delete(item.v.id);renderBag()});
      plus.addEventListener('click',()=>{if(item.qty<50)item.qty++;renderBag()});
      control.append(minus,qty,plus);row.append(control);bagItems.append(row);
    });bagTotal.textContent=money(total);
  }
  function setBagOpen(open) {
    bagPanel.hidden=!open;document.body.classList.toggle('shop-cart-open',open);
    if(open)$('close-cart').focus();else $('open-cart').focus();
  }
  $('open-cart').addEventListener('click',()=>setBagOpen(true));
  $('close-cart').addEventListener('click',()=>setBagOpen(false));
  bagPanel.querySelector('[data-close-cart]').addEventListener('click',()=>setBagOpen(false));
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!bagPanel.hidden)setBagOpen(false)});
  checkout.addEventListener('click',async()=>{
    if(!bag.size || busy)return;
    checkout.disabled=true;checkout.textContent='Opening secure checkout…';
    try {
      const data=await api('carts',{method:'POST',body:JSON.stringify({currency})});
      if(!data.id || !/^[0-9a-f-]{36}$/i.test(data.id))throw new Error('Could not create the shopping cart.');
      await api('carts/'+encodeURIComponent(data.id)+'/add',{method:'POST',body:JSON.stringify({items:[...bag.values()].map(x=>({variantId:x.v.id,quantity:x.qty}))})});
      const url=new URL('https://'+domain+'/checkout/');
      url.search=new URLSearchParams({cartCurrency:currency,cartId:data.id});
      window.location.assign(url.href);
    }catch(e){show('Checkout could not start: '+e.message);setBagOpen(false)}
    finally{checkout.disabled=!bag.size;checkout.textContent='Secure checkout →'}
  });
  document.querySelectorAll('.shop-filter-buttons button').forEach(b=>b.addEventListener('click',()=>{
    filter=b.dataset.filter;
    document.querySelectorAll('.shop-filter-buttons button').forEach(btn=>{
      const on=btn===b;btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on))
    });renderProducts();
  }));
  document.querySelectorAll('[data-category-link]').forEach(a=>a.addEventListener('click',()=>{
    const b=document.querySelector('.shop-filter-buttons button[data-filter="'+a.dataset.categoryLink+'"]');
    if(b && enabled)b.click();
  }));
  search.addEventListener('input',renderProducts);
  moreBtn.addEventListener('click',loadProducts);
  if(enabled) {toolbar.hidden=false;loadProducts()}
  // Otherwise retain the transparent, working Printify fallback present in the HTML.
})();
