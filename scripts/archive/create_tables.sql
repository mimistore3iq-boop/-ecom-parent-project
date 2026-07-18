-- Create products_coupon table
CREATE TABLE IF NOT EXISTS "products_coupon" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" varchar(50) NOT NULL UNIQUE,
    "description" text NULL,
    "discount_type" varchar(20) NOT NULL,
    "discount_value" decimal NOT NULL,
    "minimum_amount" decimal DEFAULT 0,
    "is_active" bool NOT NULL,
    "usage_limit" integer NULL,
    "used_count" integer DEFAULT 0,
    "valid_from" datetime NULL,
    "valid_until" datetime NULL,
    "created_at" datetime NOT NULL,
    "updated_at" datetime NOT NULL
);

-- Create products_coupon_excluded_products table
CREATE TABLE IF NOT EXISTS "products_coupon_excluded_products" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coupon_id" integer NOT NULL,
    "product_id" integer NOT NULL,
    UNIQUE ("coupon_id", "product_id")
);

-- Create products_coupon_excluded_categories table
CREATE TABLE IF NOT EXISTS "products_coupon_excluded_categories" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "coupon_id" integer NOT NULL,
    "category_id" integer NOT NULL,
    UNIQUE ("coupon_id", "category_id")
);

-- Create products_couponusage table
CREATE TABLE IF NOT EXISTS "products_couponusage" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" integer NOT NULL,
    "coupon_id" integer NOT NULL,
    "order_id" integer NULL,
    "used_at" datetime NOT NULL
);
