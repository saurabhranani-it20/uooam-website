const WHATSAPP_NUMBER = "918619512140";
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const query = new URLSearchParams(location.search).get("product");
const productUrl = (p) => `${location.origin}${location.pathname.replace("product.html", "")}product.html?product=${slugify(p.name)}`;
const messageUrl = (p) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello,\n\nI am interested in this product.\n\nProduct: ${p.name}\nProduct Link: ${productUrl(p)}\n\nCould you please share the price and availability?`)}`;

fetch(`data/products.json?updated=${Date.now()}`, { cache: "no-store" })
  .then((r) => r.json())
  .then((products) => {
    const p = products.find((item) => slugify(item.name) === query);
    if (!p) { location.href = "index.html#collection"; return; }
    document.title = `${p.name} | UOOAM`;
    document.querySelector("meta[name=description]").content = `${p.name}, ${p.color} ${p.fabric}. Enquire with UOOAM on WhatsApp.`;
    document.querySelector("#header-chat").href = messageUrl(p);
    const gallery = p.photos?.length
      ? p.photos.map((src, i) => `<div class="detail-photo image-${i}"><img src="${src}" alt="${p.name} — view ${i + 1}" loading="lazy" /></div>`).join("")
      : p.images.map((label, i) => `<div class="detail-image image-${i}" style="--tone1:${p.tones[i % 2]};--tone2:${p.tones[(i + 1) % 2]}"><span>${label}</span></div>`).join("");
    const price = p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Price on request";
    document.querySelector("#product-detail").innerHTML = `<section class="product-detail"><div class="detail-gallery">${gallery}</div><div class="detail-copy"><p class="eyebrow">${p.category}</p><h1>${p.name}</h1><p class="detail-price">${price}</p><p class="detail-description">${p.description}</p><dl><div><dt>Fabric</dt><dd>${p.fabric}</dd></div><div><dt>Colour</dt><dd>${p.color}</dd></div><div><dt>${p.sizes === "One size" ? "Size" : "Sizes"}</dt><dd>${p.sizes}</dd></div><div><dt>Availability</dt><dd>${p.availability}</dd></div></dl><a class="button button-dark order-button" href="${messageUrl(p)}" target="_blank" rel="noreferrer">Enquire on WhatsApp <span>↗</span></a><p class="order-note">We’ll confirm availability and styling guidance directly on WhatsApp.</p></div></section>`;
  })
  .catch(() => { document.querySelector("#product-detail").textContent = "This product could not be loaded. Please return to the collection."; });

document.querySelector("#year").textContent = new Date().getFullYear();
