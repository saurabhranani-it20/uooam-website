const WHATSAPP_NUMBER = "918619512140"; // Replace this with the shop's WhatsApp number before launch.
let products = [];
const $ = (selector) => document.querySelector(selector);
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function productUrl(product) { return `${location.origin}${location.pathname}product.html?product=${slugify(product.name)}`; }
function whatsappUrl(product) {
  const message = product ? `Hello,\n\nI am interested in this product.\n\nProduct: ${product.name}\nProduct Link: ${productUrl(product)}\n\nCould you please share the price and availability?` : "Hello, I would like to know more about the UOOAM collection.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function card(product, index) {
  const url = `product.html?product=${slugify(product.name)}`;
  return `<article class="product-card" style="animation-delay:${Math.min(index * 35, 350)}ms"><a class="product-link" href="${url}" aria-label="View ${product.name}"><div class="product-image" style="--tone1:${product.tones[0]};--tone2:${product.tones[1]}"><i>${product.category}</i><span>${product.imageLabel}</span></div><div class="product-meta"><h3>${product.name}</h3><p>${product.code} · ${product.color}</p></div></a></article>`;
}
function render() {
  const query = $("#search").value.trim().toLowerCase(); const category = $("#category").value; const sort = $("#sort").value;
  let shown = products.filter(p => (category === "all" || p.category === category) && `${p.name} ${p.code} ${p.color} ${p.fabric}`.toLowerCase().includes(query));
  if (sort === "alphabetical") shown = [...shown].sort((a,b) => a.name.localeCompare(b.name));
  $("#product-grid").innerHTML = shown.map(card).join(""); $("#product-count").textContent = `${shown.length} piece${shown.length === 1 ? "" : "s"}`; $("#empty-state").hidden = shown.length !== 0;
}
async function start() {
  const response = await fetch("data/products.json"); products = await response.json();
  ["#search", "#category", "#sort"].forEach(id => $(id).addEventListener(id === "#search" ? "input" : "change", render));
  document.querySelectorAll("[data-whatsapp-general]").forEach(a => a.href = whatsappUrl()); render();
}
$("#year").textContent = new Date().getFullYear(); start().catch(() => { $("#product-grid").innerHTML = "<p>We could not load the collection. Please refresh the page.</p>"; });
