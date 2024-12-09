import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price REAL
    )
  `);
});

app.post('/orders', (req, res) => {
  const { userId, items, total } = req.body;
  db.run('INSERT INTO orders (user_id, total) VALUES (?, ?)', 
    [userId, total], 
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Failed to create order' });
        return;
      }
      const orderId = this.lastID;
      
      const stmt = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );
      
      items.forEach(item => {
        stmt.run(orderId, item.productId, item.quantity, item.price);
      });
      stmt.finalize();
      
      res.status(201).json({ orderId });
    }
  );
});

app.get('/orders/:userId', (req, res) => {
  const userId = req.params.userId;
  db.all(
    `SELECT o.*, oi.product_id, oi.quantity, oi.price
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
        return;
      }
      
      const orders = rows.reduce((acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            userId: row.user_id,
            total: row.total,
            status: row.status,
            createdAt: row.created_at,
            items: []
          };
        }
        if (row.product_id) {
          acc[row.id].items.push({
            productId: row.product_id,
            quantity: row.quantity,
            price: row.price
          });
        }
        return acc;
      }, {});
      
      res.json(Object.values(orders));
    }
  );
});

app.listen(3004, () => console.log('Orders service running on port 3004'));
