import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Get table schema
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders_order'")
result = cursor.fetchone()
if result:
    print("Table schema:")
    print(result[0])
else:
    print("Table not found")

conn.close()