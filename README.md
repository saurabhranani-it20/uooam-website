# UOOAM catalogue

A fast, no-checkout product catalogue built as plain HTML, CSS and JavaScript. Free to host on Cloudflare Pages.

## Managing products (no code editing)

All product information lives in **`data/products.json`**. Each `{ ... }` block is one product. Copy an existing block, update the text, give it a new unique `code`, and save. The product appears automatically in search, filters, category pages and its detail page.

To mark a product as a "New arrival" on the homepage, add `"isNew": true` to its block.

To use real photos instead of placeholder artwork, add a `"photos"` array of image paths, for example:

```json
"photos": ["images/products/sarees/UOO-SAR-001/1.jpg", "images/products/sarees/UOO-SAR-001/2.jpg"]
```

When `photos` is present, the website shows your real images. When it is absent, it falls back to the elegant placeholder artwork. This makes it easy to add products before photos are ready.

## Google Drive catalogue sync (recommended)

The site remains a fast static Cloudflare site, but its product data and product photos can now be generated from your Google Sheet and Google Drive once a day. The generated files are `data/products.json` and `images/products/`; Cloudflare deploys them automatically when GitHub Actions commits a change.

### Drive layout

Inside your top-level **Website** Drive folder, create one folder per category (for example `Sarees` and `Lehengas`) plus a `Category Covers` folder. Each product's photos belong in a folder named with its product code. Image extensions can be `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif`; use `01`, `02`, `03` to control display order.

```text
Website/
  Category Covers/
    sarees.webp
    lehengas.webp
  Sarees/
    UOO-SAR-001/
      01.jpg
      02.png
```

### Sheet layout

Use one tab per category. The required columns are `Product Code`, `Category`, and `Product Name`; the script also reads `Fabric`, `Colour`, `Sizes`, `Availability`, `Description` (or `Notes`), `Price`, `New`, `Publish`, `Sort Order`, and `Position` when available. Use `Left`, `Center`, or `Right` in `Position` to choose the three product images displayed in that category's homepage banner. `New` accepts `yes`, `true`, or `1`. Set `Publish` to `No` or `False` to keep a product off the public website; blank/Yes/True keeps it visible. Sort Order `1`, `2`, `3` controls the displayed order within a category. The old `Photo Group` column is no longer used.

### One-time setup

1. In Google Cloud, create a service account, enable the **Google Drive API** and **Google Sheets API**, and create a JSON key.
2. Share both the Website Drive folder and the Google Sheet with the service-account email as a **Viewer**. Folder permissions apply to child content. [Google's Drive sharing guide](https://developers.google.com/workspace/drive/api/guides/manage-sharing) explains the permission model.
3. Add these GitHub repository secrets under **Settings → Secrets and variables → Actions**:
   - `GOOGLE_SHEET_ID` — the ID in the Google Sheet URL.
   - `GOOGLE_DRIVE_FOLDER_ID` — the ID in the Website folder URL.
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — the entire downloaded JSON key, pasted as one secret.
4. In GitHub, open **Actions → Sync Google catalogue → Run workflow** once to verify it. Thereafter it runs daily at **9:00 AM IST** and only commits when something changed. GitHub Actions supports scheduled workflows using POSIX cron. [GitHub documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)

For an immediate manual sync on your computer, create a `.env` based on `.env.example`, set the same values as environment variables, install `scripts/requirements.txt`, and run `python scripts/sync_google_catalogue.py`.

## Managing categories (no code editing)

All category information lives in **`data/categories.json`**. Each entry controls the category name, tagline, cover image and display order on the homepage.

To change a category's homepage image, update its `"coverImage"` path. To reorder categories, change the `"order"` number.

To add a new category, add a new block to `categories.json` and start adding products with that category name in `products.json`. No other files need to change.

## File overview

| File | Purpose |
|------|---------|
| `data/products.json` | All product data (the only file for adding products) |
| `data/categories.json` | Category names, taglines, cover images, order |
| `index.html` | Homepage (hero, category grid, new arrivals, contact) |
| `category.html` + `category.js` | Category browsing page |
| `product.html` + `product.js` | Individual product detail page |
| `app.js` | Homepage logic (renders categories and new arrivals) |
| `styles.css` | All styling |
| `robots.txt` | Search engine rules |
| `sitemap.xml` | Sitemap for search engines |

## Before publishing

1. Open `app.js`, `product.js`, and `category.js`.
2. Replace the WhatsApp number `918619512140` with your shop number if different (international format, no `+`, spaces or dashes).
3. Update the Instagram link in `index.html` if the handle differs.

## Preview on your computer

Install [Node.js LTS](https://nodejs.org/) once, then open PowerShell in this project folder and run:

```powershell
npx serve .
```

Open the local address shown (usually `http://localhost:3000`). Press `Ctrl + C` to stop.

## Publish free with Cloudflare Pages

1. Create a free account at [Cloudflare](https://dash.cloudflare.com/sign-up).
2. Push this folder to a GitHub repository, then in Cloudflare choose **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository**.
3. Select your repository. Leave **Build command** empty and set **Build output directory** to `/`.
4. Click **Save and Deploy**. Cloudflare gives you a free temporary address.
5. To connect `uooam.com`: open the Pages project → **Custom domains** → **Set up a custom domain**, type `uooam.com`, and follow the DNS instructions. If Cloudflare asks to manage DNS, update the nameservers in Hostinger under **Domains** → **uooam.com** → **DNS / Nameservers**.
6. Wait for the domain to become active. Cloudflare enables HTTPS automatically.
