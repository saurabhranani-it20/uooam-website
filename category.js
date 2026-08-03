const WHATSAPP_NUMBER = "918619512140";
let products = [];
let categories = [];
const $ = (selector) => document.querySelector(selector);
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const categorySlug = (text) => String(text).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const categoryName = new URLSearchParams(location.search).get("category") || "";
const collectionName = new URLSearchParams(location.search).get("collection") || "";

function productUrl(product) {
  return new URL(`product.html?product=${slugify(product.name)}`, location.href).href;
}

function getCategoryCoverImage(categoryName) {
  const name = (categoryName || "").trim().toLowerCase();
  const imageName = {
    sarees: "sarees",
    suits: "suits",
    lehengas: "lehengas",
    dresses: "dresses",
    "women's shirts": "womens-shirts",
    "women’s shirts": "womens-shirts",
    "men's shirts": "mens-shirts",
    "men’s shirts": "mens-shirts",
    accessories: "accessories",
  }[name] || slugify(categoryName);

  const candidates = [`images/category-covers/${imageName}.webp`, `images/category-covers/${imageName}.png`, `images/category-covers/${imageName}.jpg`, `images/category-covers/${imageName}.jpeg`];

  return candidates.find((path) => path) || "";
}

function whatsappUrl(product) {
  const message = product
    ? `Hello,\n\nI am interested in this product.\n\nProduct: ${product.name}\nProduct Link: ${productUrl(product)}\n\nCould you please share the price and availability?`
    : "Hello, I would like to know more about the UOOAM collection.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function availabilityBadge(product) {
  const label = (product.availability || "").trim();
  return label ? `<span class="availability-badge availability-${slugify(label)}">${label}</span>` : "";
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
  const price = product.price ? `<p class="product-price">₹${Number(product.price).toLocaleString("en-IN")}</p>` : `<p class="product-price">Price on request</p>`;
  return `<article class="product-card" style="animation-delay:${Math.min(index * 35, 350)}ms"><a class="product-link" href="${url}" aria-label="View ${product.name}">${img}${availabilityBadge(product)}<div class="product-meta"><h3>${product.name}</h3>${price}</div></a></article>`;
}

function render() {
  const sort = $("#cat-sort").value;
  let shown = [...products];
  if (sort === "collection") shown = [...shown].sort((a, b) => (a.sortOrder ?? Number.POSITIVE_INFINITY) - (b.sortOrder ?? Number.POSITIVE_INFINITY) || a.code.localeCompare(b.code));
  if (sort === "price-low") shown = [...shown].sort((a, b) => (Number(a.price) || Number.POSITIVE_INFINITY) - (Number(b.price) || Number.POSITIVE_INFINITY) || a.code.localeCompare(b.code));
  if (sort === "price-high") shown = [...shown].sort((a, b) => (Number(b.price) || Number.NEGATIVE_INFINITY) - (Number(a.price) || Number.NEGATIVE_INFINITY) || a.code.localeCompare(b.code));
  $("#cat-grid").innerHTML = shown.map(card).join("");
  $("#cat-count").textContent = `${shown.length} piece${shown.length === 1 ? "" : "s"}`;
  $("#cat-empty").hidden = shown.length !== 0;
}

async function start() {
  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch(`data/products.json?updated=${Date.now()}`, { cache: "no-store" }),
    fetch(`data/categories.json?updated=${Date.now()}`, { cache: "no-store" }),
  ]);
  products = await productsResponse.json();
  categories = await categoriesResponse.json();
  const isNewArrivals = collectionName === "new-arrivals";
  const categoryProducts = isNewArrivals ? products.filter((p) => p.isNew) : products.filter((p) => categorySlug(p.category) === categorySlug(categoryName));
  if (categoryProducts.length === 0) {
    location.href = "index.html#collection";
    return;
  }
  products = categoryProducts;
  const displayCategory = isNewArrivals ? "New arrivals" : categoryProducts[0].category;
  document.title = `${displayCategory} | UOOAM`;
  const canonicalQuery = isNewArrivals ? "collection=new-arrivals" : `category=${categorySlug(displayCategory)}`;
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", new URL(`category.html?${canonicalQuery}`, location.href).href);
  document.querySelector("meta[name=description]").content = `Explore our ${displayCategory} collection at UOOAM. Enquire directly on WhatsApp.`;
  const category = categories.find((item) => categorySlug(item.name) === categorySlug(displayCategory));
  const coverImage = isNewArrivals ? "" : category?.coverImage || getCategoryCoverImage(displayCategory);
  const categoryHero = coverImage
    ? `<div class="category-hero-photo"><img src="${coverImage}" alt="${displayCategory} collection" loading="eager" /></div>`
    : "";
  $("#category-view").innerHTML = `
    <div class="category-hero">
      ${categoryHero}
      <div class="category-header">
        <p class="eyebrow">THE COLLECTION</p>
        <h1>${displayCategory}</h1>
      </div>
    </div>
    <div class="catalogue-controls">
      <div class="filter-wrap"><label for="cat-sort" class="sr-only">Sort</label><select id="cat-sort"><option value="collection">Collection order</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
    </div>
    <p id="cat-count" class="product-count" aria-live="polite"></p>
    <div class="product-grid" id="cat-grid"></div>
    <p class="empty-state" id="cat-empty" hidden>No pieces are available in this collection right now.</p>
  `;
  $("#cat-sort").addEventListener("change", render);
  document.querySelectorAll("[data-whatsapp-general]").forEach((a) => (a.href = whatsappUrl()));
  render();
}

$("#year").textContent = new Date().getFullYear();
start().catch(() => {
  $("#category-view").innerHTML = "<p>We could not load this category. Please return to the collection.</p>";
});
