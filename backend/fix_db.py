import sqlite3

conn = sqlite3.connect('app.db')
conn.execute('ALTER TABLE documents ADD COLUMN status TEXT NOT NULL DEFAULT "ready"')
conn.commit()
conn.close()
print('done')