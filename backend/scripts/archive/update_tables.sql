-- تحديث جداول المستخدمين لإضافة الأعمدة المفقودة
ALTER TABLE users_user ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
ALTER TABLE users_user ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE users_customuser ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
ALTER TABLE users_customuser ADD COLUMN IF NOT EXISTS address TEXT;
