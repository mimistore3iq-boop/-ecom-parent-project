# Archived one-off scripts (backend)

Historical, single-use developer scripts (`fix_*`, `check_*`, `verify_*`, `create_*_tables`, `test_*`, image/session/coupon repair, migration helpers, and two stale root-level `firebase_*` copies) that used to sit at `backend/` root.

They are **not** imported by any app package and **not** on the active deploy path. Kept for reference only.

The live Firebase module is `backend/notifications/firebase_service.py` (not the archived `firebase_service.py`/`firebase_utils.py` here). Deploy-referenced scripts that stay in `backend/`: `manage.py`, `create_superuser.py`, `create_coupons.py`, `collect_static.py`, `create_sample_data.py`, `build.sh`, `install.sh`, `create_tables.{sh,sql}`.
