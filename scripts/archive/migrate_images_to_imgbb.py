#!/usr/bin/env python
"""
Migrate existing image URLs (e.g., Cloudinary) to ImgBB and save direct URLs in DB.

Usage examples:
  - Default (migrate only Cloudinary links):
      python migrate_images_to_imgbb.py

  - Force re-upload for any non-ImgBB link:
      python migrate_images_to_imgbb.py --force

  - Dry run (no DB writes):
      python migrate_images_to_imgbb.py --dry-run

Notes:
  - Requires settings.IMGBB_API_KEY to be set.
  - Works with URLField-based models (Category.image, Product.main_image, image_2..4)
"""
import os
import sys
import io
import argparse
import traceback

import django
from django.conf import settings
from django.db import transaction

# Ensure project settings are loaded
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecom_project.settings")
django.setup()

import requests
from products.models import Category, Product
from products.imgbb import upload_image_file, ImgBBError


IMGBB_HOST_HINTS = ("imgbb.com", "ibb.co", "i.ibb.co")
CLOUDINARY_HINTS = ("res.cloudinary.com", "cloudinary")

# Global flag to skip actual uploads during dry-run if API key missing
DRY_RUN_SKIP_UPLOADS = False


def is_imgbb_url(url: str) -> bool:
    url = (url or "").lower()
    return any(host in url for host in IMGBB_HOST_HINTS)


def is_cloudinary_url(url: str) -> bool:
    url = (url or "").lower()
    return any(host in url for host in CLOUDINARY_HINTS)


def download_bytes(url: str) -> bytes:
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.content


def migrate_field(instance, field_name: str, *, force: bool, dry_run: bool) -> tuple[bool, str | None, str | None]:
    """
    Try to migrate a single image field.
    Returns: (changed, old_url, new_url)
    """
    old_url = getattr(instance, field_name, None)
    if not old_url:
        return (False, None, None)

    if is_imgbb_url(old_url) and not force:
        # Already an ImgBB link
        return (False, old_url, None)

    if not (is_cloudinary_url(old_url) or force):
        # Skip non-Cloudinary unless forcing
        return (False, old_url, None)

    try:
        content = download_bytes(old_url)
        file_like = io.BytesIO(content)
        name_prefix = f"{instance.__class__.__name__.lower()}_{instance.pk}_{field_name}"
        if dry_run and DRY_RUN_SKIP_UPLOADS:
            # Simulate new URL without uploading
            new_url = f"https://i.ibb.co/simulated/{name_prefix}.jpg"
        else:
            new_url = upload_image_file(file_like, name_prefix=name_prefix)
        if not new_url:
            raise ImgBBError("ImgBB returned empty URL")

        if not dry_run:
            setattr(instance, field_name, new_url)
            instance.save(update_fields=[field_name])
        return (True, old_url, new_url)
    except Exception as e:
        print(f"[ERROR] {instance} | field={field_name}: {e}")
        traceback.print_exc()
        return (False, old_url, None)


def process_queryset(qs, field_names: list[str], *, force: bool, dry_run: bool) -> dict:
    total = qs.count()
    migrated = 0
    skipped = 0
    errors = 0

    print(f"Processing {total} objects from {qs.model.__name__}...")
    for obj in qs.iterator():
        for fname in field_names:
            changed, old_url, new_url = migrate_field(obj, fname, force=force, dry_run=dry_run)
            if changed:
                migrated += 1
                print(f"[OK] {qs.model.__name__}#{obj.pk}.{fname}:\n     {old_url}\n  -> {new_url}")
            else:
                # Distinguish explicit skip vs error by checking if old_url exists and new_url is None
                if old_url and not is_cloudinary_url(old_url) and not force and not is_imgbb_url(old_url):
                    print(f"[SKIP] {qs.model.__name__}#{obj.pk}.{fname}: non-Cloudinary URL (use --force to re-upload)")
                    skipped += 1
                elif old_url and is_imgbb_url(old_url) and not force:
                    skipped += 1
                elif old_url is None:
                    skipped += 1
                else:
                    # Likely an error occurred (already logged in migrate_field)
                    errors += 1
    return {"total": total, "migrated": migrated, "skipped": skipped, "errors": errors}


def main():
    parser = argparse.ArgumentParser(description="Migrate image URLs to ImgBB and store direct links.")
    parser.add_argument("--force", action="store_true", help="Re-upload any non-ImgBB URL, not only Cloudinary")
    parser.add_argument("--dry-run", action="store_true", help="Do not write to DB; just report what would change")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of objects per model (0 = no limit)")
    args = parser.parse_args()

    global DRY_RUN_SKIP_UPLOADS
    if not getattr(settings, "IMGBB_API_KEY", None):
        if args.dry_run:
            print("WARNING: IMGBB_API_KEY is not set; running dry-run without actual uploads (simulated URLs).")
            DRY_RUN_SKIP_UPLOADS = True
        else:
            print("ERROR: IMGBB_API_KEY is not set in settings or environment.")
            sys.exit(1)

    # Build querysets with optional limits
    cat_qs = Category.objects.all().order_by("pk")
    prod_qs = Product.objects.all().order_by("pk")
    if args.limit and args.limit > 0:
        cat_qs = cat_qs[: args.limit]
        prod_qs = prod_qs[: args.limit]

    summary = {}
    with transaction.atomic():
        # Note: wrapping in a transaction allows easy rollback if interrupted; use --dry-run to avoid writes.
        summary["Category"] = process_queryset(
            cat_qs, ["image"], force=args.force, dry_run=args.dry_run
        )
        summary["Product"] = process_queryset(
            prod_qs, ["main_image", "image_2", "image_3", "image_4"],
            force=args.force,
            dry_run=args.dry_run,
        )
        if args.dry_run:
            print("Dry run enabled: rolling back transaction (no changes saved).")
            raise SystemExit(0)

    print("\n=== Migration Summary ===")
    for model, stats in summary.items():
        print(f"{model}: total={stats['total']} migrated={stats['migrated']} skipped={stats['skipped']} errors={stats['errors']}")


if __name__ == "__main__":
    main()