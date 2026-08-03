"""Build the public UOOAM catalogue from a Google Sheet and Google Drive photos.

Required environment variables:
  GOOGLE_SHEET_ID          The ID in the Google Sheet URL.
  GOOGLE_DRIVE_FOLDER_ID   The ID of the top-level "Website" Drive folder.
  GOOGLE_SERVICE_ACCOUNT_JSON  The complete service-account JSON (not a file path).
"""

import io
import json
import os
import re
import shutil
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_JSON = ROOT / "data" / "products.json"
OUTPUT_IMAGES = ROOT / "images" / "products"
FOLDER_MIME = "application/vnd.google-apps.folder"
SCOPES = ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/spreadsheets.readonly"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def load_local_env():
    """Allow a local .env file without adding another runtime dependency."""
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        if not line or line.lstrip().startswith("#") or "=" not in line:
            continue
        key, raw_value = line.split("=", 1)
        key = key.strip()
        if key.startswith("GOOGLE_") and not os.environ.get(key):
            os.environ[key] = raw_value.strip().strip("'\"")


def required(name):
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", str(value).strip().lower()).strip("-")


def truthy(value):
    return str(value or "").strip().lower() in {"1", "true", "yes", "y", "new"}


def value(row, *names):
    normalized = {slug(key): cell for key, cell in row.items()}
    for name in names:
        candidate = normalized.get(slug(name))
        if candidate not in (None, ""):
            return candidate
    return ""


def category_name(raw):
    aliases = {"saree": "Sarees", "sarees": "Sarees", "lehenga": "Lehengas", "lehengas": "Lehengas", "suit": "Suits", "suits": "Suits", "dress": "Dresses", "dresses": "Dresses", "accessory": "Accessories", "accessories": "Accessories"}
    clean = str(raw).strip()
    return aliases.get(clean.lower(), clean)


def list_children(drive, folder_id):
    page_token = None
    results = []
    while True:
        response = drive.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="nextPageToken, files(id,name,mimeType,modifiedTime)",
            orderBy="name",
            pageToken=page_token,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        ).execute()
        results.extend(response.get("files", []))
        page_token = response.get("nextPageToken")
        if not page_token:
            return results


def find_category_folders(drive, root_id):
    return {slug(item["name"]): item["id"] for item in list_children(drive, root_id) if item["mimeType"] == FOLDER_MIME}


def images_in_folder(drive, folder_id, relative=""):
    images = []
    for item in list_children(drive, folder_id):
        item_path = f"{relative}/{item['name']}".strip("/")
        if item["mimeType"] == FOLDER_MIME:
            images.extend(images_in_folder(drive, item["id"], item_path))
        elif Path(item["name"]).suffix.lower() in IMAGE_EXTENSIONS:
            item["relative_path"] = item_path
            images.append(item)
    return images


def matching_images(images, code, photo_group=""):
    code_lower = code.lower()
    by_code = [image for image in images if code_lower in image["relative_path"].lower()]
    if by_code or not str(photo_group).strip():
        return by_code

    # Some catalogues use a simple Photo Group (for example, 1 or 2) as the
    # Drive sub-folder / filename. Match whole path segments only: group "1"
    # must not accidentally select an image from a folder named "10".
    group = slug(photo_group)
    matches = []
    for image in images:
        path = Path(image["relative_path"])
        folder_names = [slug(part) for part in path.parts[:-1]]
        file_stem = slug(path.stem)
        if group in folder_names or file_stem == group or file_stem.startswith(f"{group}-"):
            matches.append(image)
    return matches


def download(drive, file_id, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = drive.files().get_media(fileId=file_id, supportsAllDrives=True)
    with destination.open("wb") as stream:
        downloader = MediaIoBaseDownload(stream, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()


def sheet_rows(sheets, sheet_id):
    metadata = sheets.spreadsheets().get(spreadsheetId=sheet_id, fields="sheets.properties.title").execute()
    for sheet in metadata.get("sheets", []):
        title = sheet["properties"]["title"]
        response = sheets.spreadsheets().values().get(spreadsheetId=sheet_id, range=f"'{title}'!A:Z").execute()
        rows = response.get("values", [])
        if not rows:
            continue
        headers = rows[0]
        for cells in rows[1:]:
            padded = cells + [""] * (len(headers) - len(cells))
            record = dict(zip(headers, padded))
            if value(record, "Product Code", "Code", "SKU"):
                yield title, record


def main():
    load_local_env()
    credentials_info = json.loads(required("GOOGLE_SERVICE_ACCOUNT_JSON"))
    credentials = service_account.Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
    drive = build("drive", "v3", credentials=credentials, cache_discovery=False)
    sheets = build("sheets", "v4", credentials=credentials, cache_discovery=False)
    drive_root = required("GOOGLE_DRIVE_FOLDER_ID")
    category_folders = find_category_folders(drive, drive_root)
    images_by_category = {}
    products = []
    missing_photos = []

    shutil.rmtree(OUTPUT_IMAGES, ignore_errors=True)
    for tab_name, row in sheet_rows(sheets, required("GOOGLE_SHEET_ID")):
        code = str(value(row, "Product Code", "Code", "SKU")).strip()
        category = category_name(value(row, "Category") or tab_name)
        folder_id = category_folders.get(slug(category)) or category_folders.get(slug(tab_name))
        if not folder_id:
            raise SystemExit(f"No Google Drive category folder found for '{category}' (sheet tab '{tab_name}').")
        if folder_id not in images_by_category:
            images_by_category[folder_id] = images_in_folder(drive, folder_id)
        photo_group = value(row, "Photo Group", "PhotoGroup", "Image Group")
        remote_images = matching_images(images_by_category[folder_id], code, photo_group)
        if not remote_images:
            missing_photos.append(code)
        local_photos = []
        for index, remote in enumerate(remote_images, start=1):
            extension = Path(remote["name"]).suffix.lower()
            local = OUTPUT_IMAGES / slug(category) / code / f"{index}{extension}"
            download(drive, remote["id"], local)
            local_photos.append(local.relative_to(ROOT).as_posix())
        name = str(value(row, "Product Name", "Name")).strip()
        notes = str(value(row, "Description", "Notes")).strip()
        product = {
            "code": code,
            "name": name,
            "category": category,
            "fabric": str(value(row, "Fabric")).strip(),
            "color": str(value(row, "Colour", "Color")).strip(),
            "sizes": str(value(row, "Sizes", "Size")).strip() or "One size",
            "availability": str(value(row, "Availability")).strip() or "Available",
            "description": notes or name,
            "imageLabel": name,
            "images": ["Product view"],
            "tones": ["#a5543e", "#e7ddd0"],
            "isNew": truthy(value(row, "New", "Is New", "New Arrival")),
            "photos": local_photos,
        }
        price = value(row, "Price", "MRP")
        if price:
            product["price"] = float(str(price).replace(",", "").replace("₹", ""))
        products.append(product)
    products.sort(key=lambda product: (product["category"].lower(), product["code"].lower()))
    OUTPUT_JSON.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Synced {len(products)} products.")
    if missing_photos:
        print("No matching Drive photo found for: " + ", ".join(missing_photos), file=sys.stderr)


if __name__ == "__main__":
    main()
