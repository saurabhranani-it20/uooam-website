const WHATSAPP_NUMBER = "918619512140";
let products = [];
let categories = [];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function productUrl(product) {
  return `${location.origin}${location.pathname.replace("index.html", "")}product.html?product=${slugify(product.name)}`;
}
function whatsappUrl(product) {
  const message = product
    ? `Hello,\n\nI am interested in this product.\n\nProduct: ${product.name}\nProduct Link: ${productUrl(product)}\n\nCould you please share the price and availability?`
    : "Hello, I would like to know more about the UOOAM collection.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function card(product, index) {
  const url = `product.html?product=${slugify(product.name)}`;
  const img = product.photos && product.photos[0]
    ? `<div class="product-photo"><img src="${product.photos[0]}" alt="${product.name}" loading="lazy" /></div>`
    : `<div class="product-image" style="--tone1:${product.tones[0]};--tone2:${product.tones[1]}"><i>${product.category}</i><span>${product.imageLabel}</span></div>`;
  return `<article class="product-card" style="animation-delay:${Math.min(index * 35, 350)}ms"><a class="product-link" href="${url}" aria-label="View ${product.name}">${img}<div class="product-meta"><h3>${product.name}</h3><p>${product.code} · ${product.color}</p></div></a></article>`;
}

function categoryCard(cat, count, index) {
  const url = `category.html?category=${slugify(cat.name)}`;
  const cover = cat.coverImage
    ? `<div class="category-photo"><img src="${cat.coverImage}" alt="${cat.name} category" loading="lazy" /></div>`
    : `<div class="category-art" style="--tone1:${cat.tone || "#a5543e"};--tone2:${cat.tone2 || "#e7ddd0"}"><span>${cat.name}</span></div>`;
  return `<a class="category-card" href="${url}" style="animation-delay:${Math.min(index * 45, 300)}ms" aria-label="Browse ${cat.name}">${cover}<div class="category-meta"><h3>${cat.name}</h3><p>${count} piece${count === 1 ? "" : "s"}</p><span class="category-tagline">${cat.tagline || ""}</span></div></a>`;
}

function renderCategories() {
  const grid = $("#category-grid");
  if (!grid) return;
  const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  grid.innerHTML = sorted
    .map((cat, i) => {
      const count = products.filter((p) => p.category === cat.name).length;
      return categoryCard(cat, count, i);
    })
    .join("");
}

function renderNewArrivals() {
  const section = $("#new-arrivals");
  const grid = $("#new-arrivals-grid");
  if (!section || !grid) return;
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  if (newArrivals.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  grid.innerHTML = newArrivals.map((p, i) => card(p, i)).join("");
}

async function start() {
  const [productsRes, categoriesRes] = await Promise.all([
    fetch("data/products.json"),
    fetch("data/categories.json"),
  ]);
  products = await productsRes.json();
  categories = await categoriesRes.json();
  renderCategories();
  renderNewArrivals();
  $$("[data-whatsapp-general]").forEach((a) => (a.href = whatsappUrl()));
}

$("#year").textContent = new Date().getFullYear();
start().catch(() => {
  const grid = $("#category-grid");
  if (grid) grid.innerHTML = "<p>We could not load the collection. Please refresh the page.</p>";
});
