import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount REAL NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Seed data if empty
const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
if (customerCount.count === 0) {
  const insertCustomer = db.prepare('INSERT INTO customers (name, email, city) VALUES (?, ?, ?)');
  insertCustomer.run('Alice Johnson', 'alice@example.com', 'New York');
  insertCustomer.run('Bob Smith', 'bob@example.com', 'San Francisco');
  insertCustomer.run('Charlie Brown', 'charlie@example.com', 'Chicago');

  const insertProduct = db.prepare('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)');
  insertProduct.run('Laptop', 'Electronics', 1200.00, 10);
  insertProduct.run('Smartphone', 'Electronics', 800.00, 20);
  insertProduct.run('Headphones', 'Electronics', 150.00, 50);
  insertProduct.run('Coffee Maker', 'Appliances', 100.00, 15);

  const insertOrder = db.prepare('INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)');
  insertOrder.run(1, 1350.00);
  insertOrder.run(2, 800.00);

  const insertOrderItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
  insertOrderItem.run(1, 1, 1, 1200.00);
  insertOrderItem.run(1, 3, 1, 150.00);
  insertOrderItem.run(2, 2, 1, 800.00);
}

export default db;

export function getSchema() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
  let schema = "";
  for (const table of tables) {
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all() as { name: string, type: string }[];
    schema += `Table: ${table.name}\nColumns:\n`;
    columns.forEach(col => {
      schema += `- ${col.name} (${col.type})\n`;
    });
    schema += "\n";
  }
  return schema;
}
