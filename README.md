# UOOAM website

Static UOOAM artisan-apparel catalogue, deployed from the `main` branch. The site is plain HTML, CSS, and JavaScript; products and images are generated from Google Sheets and Google Drive by GitHub Actions.

## Daily product management

Use one Google Sheet tab per category. The required columns are:

- `Product Code`
- `Category`
- `Product Name`

Optional fields used by the site: `Fabric`, `Colour` or `Color`, `Sizes` or `Size`, `Availability`, `Description` or `Notes`, `Price`, `New`, `Publish`, `Sort Order`, and `Position`.

- Use `New` as `Yes` to include a product in New Arrivals.
- Use `Publish` as `No` to hide a product.
- Use `Sort Order` to control category product order and fallback banner order.
- Use `Position` values `Left`, `Center`, and `Right` to select the three product images for that category's homepage banner. If any position is missing, the first three products by `Sort Order` are used instead.

After updating the sheet or Drive, run **Actions → Sync Google catalogue → Run workflow** in GitHub. The workflow also runs every day at 5:00 AM IST.

## Google Drive layout

Inside the top-level Website Drive folder, keep one folder per category, a `Category Covers` folder, and one subfolder per product code. Files are downloaded and converted to optimized WebP images during sync.

```text
Website/
  Category Covers/
    sarees.jpg
  Sarees/
    UOO-SAR-001/
      01.jpg
      02.jpg
```

## Site assets and pages

- `images/category-covers/` — homepage category cover images.
- `images/brand/` — UOOAM logo, brand imagery, and the WhatsApp icon.
- `data/products.json` and `data/categories.json` — generated catalogue data; do not manually edit these when using the sync workflow.
- `index.html` — homepage.
- `category.html` / `product.html` — collection and product detail pages.
- `refund-policy.html`, `return-exchange-policy.html`, `shipping-policy.html` — policy pages.

## Local preview

From the project folder, run:

```cmd
C:\Users\Saurabh\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 4173
```

Open `http://localhost:4173`. Do not open the HTML files directly with `file:///`, because category and product data are loaded using browser requests.

## Security notes

- Never commit `.env` or Google service-account credentials. `.env` is ignored by Git.
- Keep GitHub credentials in repository secrets only: `GOOGLE_SHEET_ID`, `GOOGLE_DRIVE_FOLDER_ID`, and `GOOGLE_SERVICE_ACCOUNT_JSON`.
- The sync workflow has read-only Google API access and only writes generated catalogue files back to this repository.
