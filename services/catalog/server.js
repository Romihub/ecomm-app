import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  // Create products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0
    )
  `);

  // Check if products exist, if not add sample data
  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    if (err || row.count === 0) {
      const sampleProducts = [
        {
          name: 'Laptop',
          price: 999.99,
          description: 'High-performance laptop',
          category: 'Electronics',
          stock: 10
        },
        {
          name: 'Smartphone',
          price: 699.99,
          description: 'Latest smartphone',
          category: 'Electronics',
          stock: 15
        },
        {
          name: 'Headphones',
          price: 199.99,
          description: 'Wireless headphones',
          category: 'Electronics',
          stock: 20
        },
        {
          name: 'Running Shoes',
          price: 89.99,
          description: 'Comfortable running shoes',
          category: 'Sports',
          stock: 30
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO products (name, price, description, category, stock)
        VALUES (?, ?, ?, ?, ?)
      `);

      sampleProducts.forEach(product => {
        stmt.run(
          product.name,
          product.price,
          product.description,
          product.category,
          product.stock
        );
      });

      stmt.finalize();
      console.log('Sample products added to database');
    }
  });
});

// Get all products
app.get('/products', (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (minPrice) {
    query += ' AND price >= ?';
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(parseFloat(maxPrice));
  }

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(products || []); // Ensure we always return an array
  });
});

// Get single product
app.get('/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Add new product
app.post('/products', (req, res) => {
  const { name, price, description, category, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const query = `
    INSERT INTO products (name, price, description, category, stock)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [name, price, description, category, stock || 0], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create product' });
    }

    res.status(201).json({
      id: this.lastID,
      name,
      price,
      description,
      category,
      stock
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    details: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Catalog service running on port ${PORT}`);
});