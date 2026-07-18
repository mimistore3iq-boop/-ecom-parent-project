import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Check for coupon tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%coupon%'")
coupon_tables = cursor.fetchall()
print("Coupon tables:", coupon_tables)

# Check all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
all_tables = cursor.fetchall()
print("\nAll tables:", [t[0] for t in all_tables])

conn.close()