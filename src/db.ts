import Database from 'better-sqlite3';

// Initialize database
export const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    manufacturer TEXT,
    referenceNumber TEXT,
    unit TEXT,
    suppliers TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT,
    email TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    orderDate TEXT NOT NULL,
    deliveryDate TEXT NOT NULL,
    supplierId INTEGER NOT NULL,
    supplierPrice REAL NOT NULL,
    referenceNumber TEXT,
    unit TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id),
    FOREIGN KEY (supplierId) REFERENCES suppliers(id)
  );
`);

// Insert sample data
db.exec(`
  INSERT INTO suppliers (name) VALUES 
    ('Supplier A'),
    ('Supplier B'),
    ('Supplier C');

  INSERT INTO products (name, category, manufacturer, referenceNumber, unit, suppliers)
  VALUES 
    ('Composite Resin', 'Restorative', '3M', 'CR-001', 'syringe', '[{"id":1,"price":1149.75},{"id":2,"price":1062.50}]'),
    ('Dental Cement', 'Adhesives', 'GC', 'DC-002', 'kit', '[{"id":1,"price":2249.75},{"id":3,"price":2125.00}]');

  INSERT INTO users (name, department, email)
  VALUES 
    ('Dr. John Smith', 'General Dentistry', 'john.smith@dental.com'),
    ('Dr. Sarah Johnson', 'Orthodontics', 'sarah.j@dental.com');

  INSERT INTO orders (userId, productId, quantity, orderDate, deliveryDate, supplierId, supplierPrice, referenceNumber, unit)
  VALUES 
    (1, 1, 2, '2024-03-01', '2024-03-05', 2, 1062.50, 'CR-001', 'syringe'),
    (2, 2, 1, '2024-03-02', '2024-03-07', 3, 2125.00, 'DC-002', 'kit');
`);