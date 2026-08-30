const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'oxylacy_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const sequelize = new Sequelize('oxylacy_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// --- MODELS ---

// 1. Admin User Model
const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

// 2. Category Model
const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { timestamps: true });

// 3. Product Model
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  originalPrice: { type: DataTypes.FLOAT, allowNull: true },
  tag: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

// 4. Order Model
const Order = sequelize.define('Order', {
  orderId: { type: DataTypes.STRING, allowNull: false, unique: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'Cash on Delivery' },
  items: { type: DataTypes.JSON, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }
}, { timestamps: true });

// 5. Message Model
const Message = sequelize.define('Message', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false }
}, { timestamps: true });

// --- API ROUTES ---

// Admin Authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const admin = await Admin.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, admin: { username: admin.username, email: admin.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
});

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const category = await Category.create({ name: name.trim(), slug });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ error: 'Category already exists' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Products Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['id', 'DESC']] });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add product' });
  }
});

// Update Product Route (Edit)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, category, price, originalPrice, tag, image, description } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update({
      name,
      category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      tag,
      image,
      description
    });

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Orders Routes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['id', 'DESC']] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

const handleStatusUpdate = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

app.put('/api/orders/:id', handleStatusUpdate);
app.put('/api/orders/:id/status', handleStatusUpdate);

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Contact Messages Routes
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await Message.findAll({ order: [['id', 'DESC']] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json({ success: true, message: 'Message sent successfully', data: message });
  } catch (err) {
    res.status(400).json({ error: 'Failed to send message' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Start Server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database successfully!');
    await sequelize.sync();
    console.log('✅ Tables synchronized successfully.');

    const catCount = await Category.count();
    if (catCount === 0) {
      await Category.bulkCreate([
        { name: 'Timepieces', slug: 'timepieces' },
        { name: 'Apparel', slug: 'apparel' },
        { name: 'Leather Goods', slug: 'leather' }
      ]);
    }

    const adminCount = await Admin.count();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'Master Atelier',
        email: 'admin@oxylacy.com',
        password: hashedPassword
      });
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running smoothly on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
  }
}

startServer();