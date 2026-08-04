const WHATSAPP_NUMBER = "918619512140";
const instagramUrl = "https://www.instagram.com/uooambyurvashiranani/";
const $ = (selector) => document.querySelector(selector);
const slugify = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const categorySlug = (text) => String(text).toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const whatsappUrl = () => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I would like to know more about the UOOAM collection.")}`;
const announcement = $(".announcement");
if (announcement) announcement.textContent = "Hand-painted artisan apparel · Worldwide shipping";

function setupMenu() {
  const toggle = $(".menu-toggle"), menu = $(".site-menu"), overlay = $(".menu-overlay"), close = $(".menu-close");
  if (!toggle || !menu) return;
  const setOpen = (open) => { document.body.classList.toggle("menu-open", open); toggle.setAttribute("aria-expanded", open); menu.setAttribute("aria-hidden", !open); };
  toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
  [close, overlay].forEach((item) => item?.addEventListener("click", () => setOpen(false)));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
}

function categoryCard(cat) {
  return `<a class="category-card" href="category.html?category=${categorySlug(cat.name)}"><div class="category-photo"><img src="${cat.coverImage}" alt="${cat.name}" loading="lazy" /><h3>${cat.name}</h3></div></a>`;
}

function renderSlides(categories, products) {
  const slides = $("#hero-slides"), dots = $("#slide-dots");
  if (!slides || !categories.length) return;
  slides.innerHTML = categories.map((cat, index) => {
    const categoryProducts = products.filter((p) => p.category === cat.name && p.photos?.[0]);
    const orderedProducts = [...categoryProducts].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.code.localeCompare(b.code));
    const positioned = {
      left: categoryProducts.find((p) => p.homepageBannerLeft),
      centre: categoryProducts.find((p) => p.homepageBannerCentre),
      right: categoryProducts.find((p) => p.homepageBannerRight),
    };
    const bannerProducts = positioned.left && positioned.centre && positioned.right
      ? [positioned.left, positioned.centre, positioned.right]
      : [orderedProducts[0], orderedProducts[1] || orderedProducts[0], orderedProducts[2] || orderedProducts[0]];
    const leftPhoto = bannerProducts[0]?.photos[0] || cat.coverImage;
    const centrePhoto = bannerProducts[1]?.photos[0] || cat.coverImage;
    const rightPhoto = bannerProducts[2]?.photos[0] || cat.coverImage;
    return `<article class="hero-slide ${index === 0 ? "is-active" : ""}" data-category-url="category.html?category=${categorySlug(cat.name)}" style="--hero-image:url('${centrePhoto}')"><img class="slide-product left" src="${leftPhoto}" alt="" /><div class="slide-copy"><p>HAND-PAINTED ARTISAN APPAREL</p><h2>${cat.name}</h2><span>${cat.tagline || "Timeless art. Handcrafted elegance."}</span><a href="category.html?category=${categorySlug(cat.name)}">Explore collection</a></div><img class="slide-product right" src="${rightPhoto}" alt="" /></article>`;
  }).join("");
  dots.innerHTML = categories.map((cat, index) => `<button class="${index === 0 ? "is-active" : ""}" aria-label="Show ${cat.name}"></button>`).join("");
  let current = 0;
  const show = (next) => { current = (next + categories.length) % categories.length; slides.querySelectorAll(".hero-slide").forEach((slide, i) => slide.classList.toggle("is-active", i === current)); dots.querySelectorAll("button").forEach((dot, i) => dot.classList.toggle("is-active", i === current)); };
  $(".slide-arrow.previous")?.addEventListener("click", () => show(current - 1));
  $(".slide-arrow.next")?.addEventListener("click", () => show(current + 1));
  dots.querySelectorAll("button").forEach((dot, i) => dot.addEventListener("click", () => show(i)));
  slides.querySelectorAll(".hero-slide").forEach((slide) => slide.addEventListener("click", (event) => {
    if (!event.target.closest("a, button")) location.href = slide.dataset.categoryUrl;
  }));
  let touchStartX = 0;
  let touchStartY = 0;
  slides.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, { passive: true });
  slides.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].screenX - touchStartX;
    const deltaY = event.changedTouches[0].screenY - touchStartY;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) show(current + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
  setInterval(() => show(current + 1), 6000);
}

async function start() {
  const [productsResponse, categoriesResponse] = await Promise.all([fetch("data/products.json"), fetch("data/categories.json")]);
  const [products, categories] = await Promise.all([productsResponse.json(), categoriesResponse.json()]);
  const ordered = categories.sort((a, b) => a.order - b.order);
  $("#category-grid").innerHTML = ordered.map((category) => categoryCard(category)).join("");
  renderSlides(ordered, products);
  document.querySelectorAll("[data-whatsapp-general]").forEach((link) => link.href = whatsappUrl());
  document.querySelectorAll(".whatsapp-icon").forEach((link) => link.innerHTML = '<img src="images/brand/whatsapp-logo.webp" alt="" />');
}
$("#year").textContent = new Date().getFullYear();
setupMenu();
start().catch(() => { $("#category-grid").textContent = "We could not load the collection. Please refresh the page."; });
