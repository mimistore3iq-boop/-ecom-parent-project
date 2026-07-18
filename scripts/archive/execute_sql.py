#!/usr/bin/env python
"""
Execute SQL script to create missing tables
"""
import os
import sqlite3

def execute_sql_script():
    """
    Execute SQL script to create missing tables
    """
    print("Executing SQL script to create missing tables...")

    # Path to database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'db.sqlite3')

    # Path to SQL script
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'create_tables.sql')

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False

    if not os.path.exists(sql_path):
        print(f"SQL script not found at {sql_path}")
        return False

    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Read SQL script
        with open(sql_path, 'r') as f:
            sql_script = f.read()

        # Execute SQL script
        cursor.executescript(sql_script)

        # Commit changes
        conn.commit()
        conn.close()

        print("SQL script executed successfully!")
        return True

    except Exception as e:
        print(f"Error executing SQL script: {e}")
        return False

if __name__ == '__main__':
    execute_sql_script()
