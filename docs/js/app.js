const SHOP_URL = 'https://artcuadros.com';
const PRODUCTS_API = `${SHOP_URL}/collections/all/products.json`;
const DISCOUNT_CODE = '5%-art';
const DISCOUNT_RATE = 0.05;

const grid = document.getElementById('products-grid');
const loading = document.getElementById('loading');
const errorEl = document.getElementById('error');
const countEl = document.getElementById('product-count');
const retryBtn = document.getElementById('retry-btn');
const installBtn = document.getElementById('install-btn');
const appCatalog = document.getElementById('app-catalog');
const appLocked = document.getElementById('app-locked');
const installLockedBtn = document.getElementById('install-locked-btn');

const sheetBackdrop = document.getElementById('sheet-backdrop');
const variantSheet = document.getElementById('variant-sheet');
const sheetImage = document.getElementById('sheet-image');
const sheetTitle = document.getElementById('sheet-title');
const sheetPrice = document.getElementById('sheet-price');
const sheetOptions = document.getElementById('sheet-options');
const sheetBuy = document.getElementById('sheet-buy');
const sheetClose = document.getElementById('sheet-close');
const checkoutOverlay = document.getElementById('checkout-overlay');
const installBanner = document.getElementById('install-banner');
const installBannerBtn = document.getElementById('install-banner-btn');
const installBannerSkip = document.getElementById('install-banner-skip');
const installIosHelp = document.getElementById('install-ios-help');
const appSplash = document.getElementById('app-splash');

const urlParams = new URLSearchParams(window.location.search);
const wantsInstall = urlParams.get('install') === '1';
const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
let deferredPrompt = null;
let activeProduct = null;
let activeSelections = {};

function formatPrice(price) {
  return `${parseFloat(price).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
}

function getDiscountedPrice(price) {
  return parseFloat(price) * (1 - DISCOUNT_RATE);
}

function appendDiscountedPrice(container, originalPrice) {
  const original = parseFloat(originalPrice);
  const discounted = getDiscountedPrice(original);
  container.textContent = formatPrice(discounted);

  const compareSpan = document.createElement('span');
  compareSpan.className = 'compare';
  compareSpan.textContent = formatPrice(original);
  container.appendChild(compareSpan);
}

async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;

  while (true) {
    const res = await fetch(`${PRODUCTS_API}?limit=250&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const products = data.products || [];
    if (products.length === 0) break;

    allProducts.push(...products);
    if (products.length < 250) break;
    page++;
  }

  return allProducts;
}

function getAvailableVariants(product) {
  return product.variants.filter((v) => v.available);
}

function getLowestPrice(product) {
  const available = getAvailableVariants(product);
  const variants = available.length ? available : product.variants;
  const prices = variants.map((v) => parseFloat(v.price));
  return Math.min(...prices);
}

function isSoldOut(product) {
  return product.variants.every((v) => !v.available);
}

function isNew(product) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(product.published_at).getTime() > thirtyDaysAgo;
}

function getVariantOptions(variant) {
  return [variant.option1, variant.option2, variant.option3].filter(Boolean);
}

function variantMatchesSelections(variant, product, selections, upToIndex = Infinity) {
  const opts = getVariantOptions(variant);
  return product.options.every((option, index) => {
    if (index >= upToIndex) return true;
    return selections[option.name] === opts[index];
  });
}

function findVariantBySelections(product, selections) {
  return product.variants.find(
    (v) => v.available && variantMatchesSelections(v, product, selections)
  );
}

function getOptionValues(product, optionIndex, selections) {
  const values = new Set();

  product.variants.forEach((variant) => {
    if (!variant.available) return;
    if (!variantMatchesSelections(variant, product, selections, optionIndex)) return;
    const value = [variant.option1, variant.option2, variant.option3][optionIndex];
    if (value) values.add(value);
  });

  return [...values];
}

function goToCheckout(variantId) {
  checkoutOverlay.classList.remove('hidden');
  closeVariantSheet();

  const code = encodeURIComponent(DISCOUNT_CODE);
  const redirect = encodeURIComponent(`/cart/${variantId}:1?checkout`);
  window.location.assign(`${SHOP_URL}/discount/${code}?redirect=${redirect}`);
}

function handleProductTap(product) {
  if (isSoldOut(product)) return;

  const available = getAvailableVariants(product);
  if (available.length === 0) return;

  // Siempre compra la primera variante disponible (sin selector)
  goToCheckout(available[0].id);
}

function openVariantSheet(product) {
  activeProduct = product;
  activeSelections = {};

  product.options.forEach((option, index) => {
    const values = getOptionValues(product, index, activeSelections);
    if (values.length) activeSelections[option.name] = values[0];
  });

  sheetImage.src = product.images[0]?.src || '';
  sheetImage.alt = product.title;
  sheetTitle.textContent = product.title;

  renderSheetOptions();
  updateSheetPrice();

  sheetBackdrop.classList.remove('hidden');
  variantSheet.classList.remove('hidden');
  requestAnimationFrame(() => {
    sheetBackdrop.classList.add('visible');
    variantSheet.classList.add('visible');
  });

  document.body.style.overflow = 'hidden';
}

function closeVariantSheet() {
  sheetBackdrop.classList.remove('visible');
  variantSheet.classList.remove('visible');
  document.body.style.overflow = '';

  setTimeout(() => {
    sheetBackdrop.classList.add('hidden');
    variantSheet.classList.add('hidden');
    activeProduct = null;
    activeSelections = {};
  }, 280);
}

function renderSheetOptions() {
  sheetOptions.innerHTML = '';

  activeProduct.options.forEach((option, index) => {
    const values = getOptionValues(activeProduct, index, activeSelections);
    if (values.length <= 1) return;

    const group = document.createElement('div');
    group.className = 'option-group';

    const label = document.createElement('label');
    label.textContent = option.name;
    label.setAttribute('for', `option-${index}`);

    const select = document.createElement('select');
    select.id = `option-${index}`;

    values.forEach((value) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      opt.selected = activeSelections[option.name] === value;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      activeSelections[option.name] = select.value;
      renderSheetOptions();
      updateSheetPrice();
    });

    group.appendChild(label);
    group.appendChild(select);
    sheetOptions.appendChild(group);
  });
}

function updateSheetPrice() {
  const variant = findVariantBySelections(activeProduct, activeSelections);
  sheetPrice.innerHTML = '';
  if (variant) appendDiscountedPrice(sheetPrice, variant.price);
  else sheetPrice.textContent = '—';
  sheetBuy.disabled = !variant;
}

function createProductCard(product) {
  const soldOut = isSoldOut(product);
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `product-card${soldOut ? ' disabled' : ''}`;
  card.setAttribute('aria-label', soldOut ? `${product.title} - Agotado` : `Comprar ${product.title}`);

  card.addEventListener('click', () => handleProductTap(product));

  const imageWrap = document.createElement('div');
  imageWrap.className = 'product-image-wrap';

  const img = document.createElement('img');
  img.className = 'product-image';
  img.alt = product.title;
  img.loading = 'lazy';
  img.src = product.images[0]?.src || '';
  img.srcset = product.images[0]
    ? `${product.images[0].src}&width=300 300w, ${product.images[0].src}&width=600 600w`
    : '';
  img.sizes = '(max-width: 480px) 45vw, 300px';

  imageWrap.appendChild(img);

  if (soldOut) {
    const badge = document.createElement('span');
    badge.className = 'product-badge sold';
    badge.textContent = 'Agotado';
    imageWrap.appendChild(badge);
  } else if (isNew(product)) {
    const badge = document.createElement('span');
    badge.className = 'product-badge new';
    badge.textContent = 'Nuevo';
    imageWrap.appendChild(badge);
  }

  const discountBadge = document.createElement('span');
  discountBadge.className = 'product-badge new';
  discountBadge.textContent = '-5%';
  discountBadge.style.top = 'auto';
  discountBadge.style.bottom = '8px';
  discountBadge.style.left = '8px';
  if (!soldOut) imageWrap.appendChild(discountBadge);

  const info = document.createElement('div');
  info.className = 'product-info';

  const title = document.createElement('p');
  title.className = 'product-title';
  title.textContent = product.title;

  const price = document.createElement('p');
  price.className = 'product-price';
  appendDiscountedPrice(price, getLowestPrice(product));

  info.appendChild(title);
  info.appendChild(price);
  card.appendChild(imageWrap);
  card.appendChild(info);

  return card;
}

function renderProducts(products) {
  grid.innerHTML = '';
  products.forEach((product) => {
    grid.appendChild(createProductCard(product));
  });

  countEl.textContent = `${products.length} cuadros · -5% app`;
  countEl.classList.remove('hidden');
}

async function loadProducts() {
  loading.classList.remove('hidden');
  errorEl.classList.add('hidden');
  grid.innerHTML = '';
  countEl.classList.add('hidden');

  try {
    const products = await fetchAllProducts();
    renderProducts(products);
  } catch (err) {
    console.error(err);
    errorEl.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
    hideAppSplash();
  }
}

function hideAppSplash() {
  if (!appSplash || appSplash.classList.contains('is-hidden')) return;
  appSplash.classList.add('is-hidden');
  appSplash.setAttribute('aria-hidden', 'true');
  setTimeout(() => appSplash.remove(), 500);
}

function showLockedView() {
  document.body.classList.add('app-locked');
  appLocked?.classList.remove('hidden');
}

function unlockApp() {
  document.body.classList.remove('app-locked');
  appLocked?.classList.add('hidden');
  loadProducts();
}

function showInstallBanner() {
  if (isStandalone) return;
  installBanner.classList.remove('hidden');
  if (isIos) installIosHelp.classList.remove('hidden');
}

function hideInstallBanner() {
  installBanner.classList.add('hidden');
}

async function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.classList.add('hidden');
    hideInstallBanner();
    if (result.outcome === 'accepted') unlockApp();
    return;
  }

  showInstallBanner();
}

sheetBuy.addEventListener('click', () => {
  if (!activeProduct) return;
  const variant = findVariantBySelections(activeProduct, activeSelections);
  if (variant) goToCheckout(variant.id);
});

sheetClose.addEventListener('click', closeVariantSheet);
sheetBackdrop.addEventListener('click', closeVariantSheet);

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove('hidden');
  if (wantsInstall) {
    showInstallBanner();
    setTimeout(triggerInstall, 600);
  }
});

installBtn.addEventListener('click', triggerInstall);
installBannerBtn.addEventListener('click', triggerInstall);
installLockedBtn?.addEventListener('click', triggerInstall);
installBannerSkip.addEventListener('click', hideInstallBanner);

window.addEventListener('appinstalled', () => {
  installBtn.classList.add('hidden');
  deferredPrompt = null;
  hideInstallBanner();
  unlockApp();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

if (isStandalone) {
  unlockApp();
} else {
  showLockedView();
  hideAppSplash();
  if (wantsInstall) showInstallBanner();
}

retryBtn.addEventListener('click', loadProducts);
setTimeout(hideAppSplash, 2500);
