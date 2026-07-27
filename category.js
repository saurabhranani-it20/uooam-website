const WHATSAPP_NUMBER = "918619512140";
let products = [];
const $ = (selector) => document.querySelector(selector);
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const categoryName = new URLSearchParams(location.search).get("category") || "";

function productUrl(product) {
  return `${location.origin}${location.pathname.replace("category.html", "")}product.html?product=${slugify(product.name)}`;
}
function whatsappUrl(product) {
  const message = product
    ? `Hello,\n\nI am interested in this product.\n\nProduct: ${product.name}\nProduct Link: ${productUrl(product)}\n\nCould you please share the price and availability?`
    : "Hello, I would like to know more about the UOOAM collection.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function imageHtml(product, i) {
  if (product.photos && product.photos[i]) {
    return `<img src="${product.photos[i]}" alt="${product.name} — view ${i + 1}" loading="lazy" />`;
  }
  return `<div class="product-image" style="--tone1:${product.tones[0]};--tone2:${product.tones[1]}"><span>${product.imageLabel}</span></div>`;
}

function card(product, index) {
  const url = `product.html?product=${slugify(product.name)}`;
  const img = product.photos && product.photos[0]
    ? `<div class="product-photo"><img src="${product.photos[0]}" alt="${product.name}" loading="lazy" /></div>`
    : `<div class="product-image" style="--tone1:${product.tones[0]};--tone2:${product.tones[1]}"><i>${product.category}</i><span>${product.imageLabel}</span></div>`;
  return `<article class="product-card" style="animation-delay:${Math.min(index * 35, 350)}ms"><a class="product-link" href="${url}" aria-label="View ${product.name}">${img}<div class="product-meta"><h3>${product.name}</h3><p>${product.code} · ${product.color}</p></div></a></article>`;
}

function render() {
  const query = $("#cat-search").value.trim().toLowerCase();
  const sort = $("#cat-sort").value;
  let shown = products.filter((p) => `${p.name} ${p.code} ${p.color} ${p.fabric}`.toLowerCase().includes(query));
  if (sort === "alphabetical") shown = [...shown].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "newest") shown = [...shown].reverse();
  $("#cat-grid").innerHTML = shown.map(card).join("");
  $("#cat-count").textContent = `${shown.length} piece${shown.length === 1 ? "" : "s"}`;
  $("#cat-empty").hidden = shown.length !== 0;
}

async function start() {
  const response = await fetch("data/products.json");
  products = await response.json();
  const categoryProducts = products.filter((p) => slugify(p.category) === slugify(categoryName));
  if (categoryProducts.length === 0) {
    location.href = "index.html#collection";
    return;
  }
  products = categoryProducts;
  const displayCategory = categoryProducts[0].category;
  document.title = `${displayCategory} | UOOAM`;
  document.querySelector("meta[name=description]").content = `Explore our ${displayCategory} collection at UOOAM. Enquire directly on WhatsApp.`;
  $("#category-view").innerHTML = `
    <div class="category-header">
      <p class="eyebrow">THE COLLECTION</p>
      <h1>${displayCategory}</h1>
    </div>
    <div class="catalogue-controls">
      <label class="search"><span class="sr-only">Search</span><input id="cat-search" type="search" placeholder="Search ${displayCategory.toLowerCase()}" /><span aria-hidden="true">⌕</span></label>
      <div class="filter-wrap"><label for="cat-sort" class="sr-only">Sort</label><select id="cat-sort"><option value="newest">Newest first</option><option value="alphabetical">Alphabetical</option></select></div>
    </div>
    <p id="cat-count" class="product-count" aria-live="polite"></p>
    <div class="product-grid" id="cat-grid"></div>
    <p class="empty-state" id="cat-empty" hidden>Nothing matched that search. Try another word.</p>
  `;
  $("#cat-search").addEventListener("input", render);
  $("#cat-sort").addEventListener("change", render);
  document.querySelectorAll("[data-whatsapp-general]").forEach((a) => (a.href = whatsappUrl()));
  render();
}

$("#year").textContent = new Date().getFullYear();
start().catch(() => {
  $("#category-view").innerHTML = "<p>We could not load this category. Please return to the collection.</p>";
});
