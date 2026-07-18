# Archived one-off scripts (repo root)

These are **historical, single-use developer scripts** (DB fixes, table creation, admin/coupon/data seeding, checks, and tests) that were previously scattered at the repository root. They are **not** imported by the application and **not** referenced by the active Render deploy (`render.yaml`, which runs from `backend/`).

They are kept for reference only. To run one, review it first — most add `backend/` to `sys.path` or expect `DJANGO_SETTINGS_MODULE=ecom_project.settings` and were meant to run from the project root at a specific point in the project's history.

Deploy-referenced scripts (e.g. `create_superuser.py`, `create_coupons.py`, `production_fix.py`) intentionally remain outside this archive.
