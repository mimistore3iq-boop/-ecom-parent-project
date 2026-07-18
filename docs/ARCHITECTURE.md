# voro — Architecture & Project Reference

An Arabic (RTL), IQD-currency e-commerce store for Iraq. Django REST backend + React storefront, deployed on Render, images on Cloudflare R2.

- **Repo:** `mimistore3iq-boop/-ecom-parent-project` (branch `main`)
- **Backend (API + admin):** https://ecom-parent-project.onrender.com
- **Frontend (store):** https://ecom-parent-project-1.onrender.com

---

## 1. Stack

| Layer | Tech |
|---|---|
| Backend | Django 5.2 · Django REST Framework · SimpleJWT · Jazzmin admin |
| DB | SQLite (local, `DEBUG=True`) / PostgreSQL (production, via `DATABASE_URL`) |
| Media storage | Cloudflare R2 (S3-compatible) via `django-storages` + `boto3` → `media.voroiq.com` |
| Static | WhiteNoise (`CompressedStaticFilesStorage`) |
| Push | Firebase Cloud Messaging (FCM) + Telegram order alerts |
| Frontend | React 18 · Create React App + react-app-rewired · Tailwind CSS · axios · firebase |
| Hosting | Render (both services, Python native env) |

---

## 2. Repository layout (after cleanup)

```
ecom-parent-project/
├── backend/                    # Django project (Render deploys from here: `cd backend`)
│   ├── manage.py
│   ├── requirements.txt, runtime.txt (py 3.11.9)
│   ├── ecom_project/           # settings, urls, wsgi, custom admin site
│   ├── users/  products/  orders/  notifications/  test_app/   # apps
│   ├── utils/                  # telegram_service, etc.
│   ├── create_superuser.py, create_coupons.py, collect_static.py,
│   │   create_sample_data.py, build.sh, install.sh, create_tables.{sh,sql}  # deploy-referenced
│   ├── scripts/archive/        # 53 one-off dev/fix/check scripts (not used by app or deploy)
│   └── backups/                # gitignored — local DB backups & data dumps (real data)
├── frontend/                   # React storefront (dev port 3002)
│   └── src/ (pages, components, utils, api.js, firebase.js)
├── scripts/archive/            # 35 one-off root dev scripts (archived)
├── docs/ARCHITECTURE.md        # this file
├── render.yaml                 # ACTIVE Render blueprint (root)
├── production_fix.py, create_sample_data.py     # deploy-referenced (kept)
└── (stale/duplicate deploy configs left in place: render_new.yaml,
     backend/render.yaml, Procfile*, wsgi_new.py, settings_old.py — see §7)
```

---

## 3. Backend apps

### users — custom auth
- **`User(AbstractUser)`**: login field is **`phone`** (`USERNAME_FIELD='phone'`, unique). Extra fields: `email`, `address`, `governorate`, `is_customer`, `is_staff_member`.
- **`PhoneBackend`** authenticates by phone-or-username. ⚠️ Side effect: auto-creates a hardcoded superuser **`01234567890` / `admin123`** if missing (also done by a `post_migrate` signal and the deploy build).
- Endpoints (`/api/users/`): `POST login`, `POST logout` (JWT blacklist), `GET profile`, `PUT/PATCH update_profile`, registration via `UserRegistrationSerializer`.
- Auth = SimpleJWT (HS256 signed with `SECRET_KEY`; access 1d, refresh 7d, rotate + blacklist).

### products — catalog + coupons (largest app)
- **`Category`**: name, image/image_url (R2), self-FK `parent`, `display_order`, props `products_count`/`children_count`.
- **`Product`**: `price`, `discount_price`/`discount_amount`/`discount_start`/`discount_end`, `stock_quantity`, `main_image`+`image_2..8` (R2 URLs), `slug` (auto), self-M2M `similar_products`. Key props: **`is_on_sale`**, `discounted_price`, `discount_percentage`, `time_left`, `stock_status`, `all_images`.
- **`Banner`**, **`ProductReview`**, **`ProductView`**.
- **Coupon system** (`models_coupons.py`, `serializers_coupons.py`, `views_coupons.py`, `admin_coupons.py`): `Coupon` (percentage/fixed, min order, max cap, validity window, usage limit) + `CouponUsage`.
  - **`POST /api/products/coupons/apply/`** — core logic; excludes on-sale products:
    1. no discounted items → normal application;
    2. all discounted → rejected (400 + red notice);
    3. mixed → applies only to the non-discounted subtotal + warning.
- Catalog endpoints (`/api/products/`): list, detail, `search/?q=`, `categories/`, `categories/<id>/products/`, `banners/`, admin CRUD (`/products/admin/...`, `IsAdminUser`).

### orders
- **`Order`** (UUID): customer snapshot, `payment_method` (cash/bank), `status` (pending→confirmed→preparing→shipped→delivered/cancelled), `subtotal`/`delivery_fee`/`coupon_code`/`coupon_discount`/`total`.
- **`OrderItem`**: snapshots product name/price/qty; **decrements stock** on order creation.
- Proxy models `NewOrder`/`ProcessedOrder` split the admin by status.
- `POST /api/orders/` creates an order → fans out admin `Notification` rows + FCM topic push + **Telegram** alert.

### notifications
- **`Notification`** (types: new_order / order_status_changed / low_stock / system) + **`DeviceToken`** (FCM tokens).
- `firebase_service.py` initializes FCM at app startup. Notifications are **event-driven from order code** (no Django signals).

### test_app
- Empty scaffold (`TestModel`), in `INSTALLED_APPS` but not wired to any URL — inert.

---

## 4. Frontend

- **Routes** (`src/App.js`): `/` Home · `/product/:id` · `/offers` · `/categories[/:id]` · `/login` · `/admin` (protected `adminOnly`). Wrapped in an `ErrorBoundary` that auto-reloads once/60s.
- **API** (`src/api.js`): one axios instance, `baseURL = REACT_APP_API_URL || <prod>/api`; request interceptor adds `Bearer` token; 401 → clear session → `/login`.
- **State (no global store):** cart, coupon, user in **localStorage** + window events (`cart-updated`, `voro:open-cart`) + an in-memory `homeCache`. Custom **scroll/carousel restoration** (`utils/scrollRestore.js`).
- **Coupon flow:** `CartNew` → `POST /coupons/apply/`; result + warning stored; `CheckoutNew` sends `coupon_code`/`coupon_discount` in the order.
- **Pages:** Home (storefront + search + carousels), ProductDetail (gallery, countdown, similar), SpecialOffers, Categories, Login (phone+password / register with governorate), AdminPanel (4 tabs: products / categories / orders / notifications; image upload to ImgBB).
- **Firebase:** `firebase.js` guarded (init only if env keys present → prevents crash in unsupported/in-app browsers, e.g. Instagram). `public/firebase-messaging-sw.js` handles background push.
- **iOS fix:** global CSS forces inputs to 16px on touch devices (`@media (hover:none) and (pointer:coarse)`) to stop auto-zoom on focus.

---

## 5. Deployment (active path)

Render reads the **root `render.yaml`** blueprint. Single web service `mimi-store-backend` (Python env):

- **Build:** `cd backend` → clean pycache → `pip install -r requirements.txt` → `makemigrations` → `migrate --run-syncdb` → `create_superuser.py` → `create_coupons.py` → `collectstatic`.
- **Start:** `cd backend && gunicorn ecom_project.wsgi:application`.
- Frontend is a separate Render service serving the CRA build; it calls the backend API and is deployed on push to `main` (bundle content-hash changes signal a completed deploy).

---

## 6. Environment variables

| Var | Where | Notes |
|---|---|---|
| `DEBUG` | render.yaml=False / local .env=True | Controls SQLite-vs-Postgres branch |
| `DATABASE_URL` | render.yaml (hardcoded) | Render Postgres; **secret committed — should be rotated** |
| `SECRET_KEY` | render (`generateValue`) | Also the JWT signing key |
| `ALLOWED_HOSTS`, `CORS_*` | render.yaml | |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | **required, no default** | Must be set in the Render dashboard or the app crashes on import (R2) |
| `AWS_S3_*` | defaults in settings | bucket `voro-media`, domain `media.voroiq.com`, region `eeur` |
| `FIREBASE_CREDENTIALS_JSON` / `_PATH`, `_PROJECT_ID` | optional | Firebase init is try/except-guarded |
| Frontend `REACT_APP_API_URL`, `REACT_APP_FIREBASE_*`, `REACT_APP_WHATSAPP_PHONE`, currency/shipping | `.env.production` / `.env.local` | |

---

## 7. Known risks / tech debt (not yet addressed)

1. **Committed secrets:** Postgres password in `render.yaml` + `backend/render.yaml`; ImgBB key in `AdminPanel.jsx` and `.env.production`. → rotate + move to env-only.
2. **Hardcoded admin** `01234567890` / `admin123` seeded on every deploy.
3. **DRF default permission is `AllowAny`** — several sensitive endpoints are open (`orders` CRUD, `coupons/apply`, and a `run-migration-secret-123` GET that runs migrations).
4. **Deploy-config sprawl:** only root `render.yaml` is active. Stale duplicates left in place (`render_new.yaml`, `backend/render.yaml`, `Procfile`, `Procfile.prod`, `wsgi_new.py`, `settings_old.py`, `settings_firebase.py`, `.render-build-id*`). **Verify the Render dashboard's Build/Start commands before deleting any of these.**
5. **Start command** in `render.yaml` lacks `--bind 0.0.0.0:$PORT` — confirm the live service overrides this in the dashboard.
6. **Migration history was patched** (`--run-syncdb`, dozens of archived `fix_*`/`create_tables*` scripts) — schema drift risk between environments.
7. **Frontend duplication:** product-normalization + add-to-cart logic re-implemented across 4 pages; applied-coupon localStorage keys aren't cleared after checkout.

---

## 8. Local development

```bash
# Backend
cd backend
python -m venv venv && ./venv/Scripts/pip install -r requirements.txt
# backend/.env (gitignored): DEBUG=True, SECRET_KEY=..., ALLOWED_HOSTS=localhost,127.0.0.1,
#                            AWS_ACCESS_KEY_ID=local-dummy, AWS_SECRET_ACCESS_KEY=local-dummy
./venv/Scripts/python manage.py migrate
./venv/Scripts/python manage.py runserver 127.0.0.1:8000

# Frontend (dev server on :3002)
cd frontend
npm install
# frontend/.env.local: REACT_APP_API_URL=http://127.0.0.1:8000/api  (or the prod API)
npm start
```

- Archived one-off scripts live in `scripts/archive/` and `backend/scripts/archive/` — kept for reference, not part of the running app or deploy.
- Local DB backups / data dumps live in `backend/backups/` (gitignored — they contain real data; never commit).
