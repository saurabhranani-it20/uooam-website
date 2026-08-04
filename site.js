const SITE_WHATSAPP_NUMBER = "918619512140";
function generalWhatsAppUrl() { return `https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I would like to know more about the UOOAM collection.")}`; }
function setupSite() {
  const announcement = document.querySelector(".announcement");
  if (announcement) announcement.textContent = "Hand-painted artisan apparel · Worldwide shipping";
  const footer = document.querySelector("footer");
  if (footer) footer.innerHTML = `<section><img class="footer-logo" src="images/brand/uooam-logo.png" alt="Uooam" /><p>&copy; <span id="year"></span> UOOAM.<br />Timeless art. Handcrafted elegance.</p></section><section><p class="footer-title">CUSTOMER CARE</p><a href="refund-policy.html">Refund Policy</a><a href="return-exchange-policy.html">Return &amp; Exchange Policy</a><a href="shipping-policy.html">Shipping Policy</a></section><section><p class="footer-title">CONNECT</p><a href="https://www.instagram.com/uooambyurvashiranani/" target="_blank" rel="noreferrer">Instagram</a><a data-whatsapp-general href="#">WhatsApp</a></section>`;
  const toggle = document.querySelector(".menu-toggle"), menu = document.querySelector(".site-menu"), overlay = document.querySelector(".menu-overlay"), close = document.querySelector(".menu-close");
  const setOpen = (open) => { document.body.classList.toggle("menu-open", open); toggle?.setAttribute("aria-expanded", open); menu?.setAttribute("aria-hidden", !open); };
  toggle?.addEventListener("click", () => setOpen(!document.body.classList.contains("menu-open")));
  close?.addEventListener("click", () => setOpen(false)); overlay?.addEventListener("click", () => setOpen(false));
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.querySelectorAll("[data-whatsapp-general]").forEach((link) => link.href = generalWhatsAppUrl());
  document.querySelectorAll(".whatsapp-icon").forEach((link) => link.innerHTML = '<img src="images/brand/whatsapp-logo.webp" alt="" />');
  const year = document.querySelector("#year"); if (year) year.textContent = new Date().getFullYear();
  const header = document.querySelector(".editorial-header");
  let previousScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    header?.classList.toggle("header-hidden", currentScrollY > previousScrollY && currentScrollY > 110);
    previousScrollY = currentScrollY;
  }, { passive: true });
}
setupSite();
