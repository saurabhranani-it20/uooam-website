# UOOAM catalogue

A fast, no-checkout product catalogue built as plain HTML, CSS and JavaScript. This keeps the site easy to maintain and free to host.

## Before publishing (important)

1. Open `app.js` and `product.js` in a code editor.
2. Replace `919999999999` with the shop WhatsApp number in international format, with no `+`, spaces, or dashes. Example: an Indian number `98765 43210` becomes `919876543210`.
3. Update the Instagram link in `index.html` if the account handle differs.

## Adding or changing a product

Open only `data/products.json`. Each `{ ... }` block is one product. Copy an existing block, update its text, give it a new unique `code`, and save. The product appears automatically in search, filters and its detail page.

The current artwork is intentional, polished placeholder artwork. When you have photos, replace the placeholder gallery system with real image paths in this same JSON file; this is the only content file you will need to update.

## Preview on your computer

Install [Node.js LTS](https://nodejs.org/) once, then open PowerShell in this project folder and run:

```powershell
npx serve .
```

Open the local address shown in PowerShell (usually `http://localhost:3000`). Press `Ctrl + C` in PowerShell to stop it.

## Publish free with Cloudflare Pages

1. Create a free account at [Cloudflare](https://dash.cloudflare.com/sign-up).
2. Create a new GitHub repository, upload this folder, then in Cloudflare choose **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository**.
3. Select your repository. For this plain website, leave **Build command** empty and set **Build output directory** to `/`.
4. Click **Save and Deploy**. Cloudflare gives you a free temporary website address.
5. In Cloudflare, open the Pages project → **Custom domains** → **Set up a custom domain**, type `uooam.com`, and follow the displayed DNS instructions. If Cloudflare asks to manage your DNS, update the nameservers in Hostinger: **Domains** → **uooam.com** → **DNS / Nameservers**.
6. Wait for the domain to become active. Cloudflare turns on HTTPS automatically. Visit `https://uooam.com` on your phone and test a product’s WhatsApp button.

Cloudflare Pages is a strong free choice because it is fast worldwide, includes HTTPS, and needs no server maintenance for this kind of catalogue.
