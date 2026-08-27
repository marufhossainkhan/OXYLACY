const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Product API Routes
app.use('/api/products', productRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(' Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// Test Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Oxylacy backend server is running!' });
});

// Order Schema & Model
const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        email: String,
        phone: String,
        country: String,
        address: String,
        city: String,
        postal: String
    },
    items: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    totalAmount: Number,
    paymentMethod: { type: String, default: 'Cash On Delivery' },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// API: Place an Order
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, message: 'Order created successfully', order: savedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to place order', error: err.message });
    }
});

// API: Get All Orders (For Admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
    }
});

// API: Update Order Status
app.put('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.status(200).json({ success: true, order: updatedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update order', error: err.message });
    }
});

// API: Delete an Order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete order', error: err.message });
    }
});

// Contact Message Schema & Model
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API: Send Contact Message
app.post('/api/contact', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();
        res.status(201).json({ success: true, message: 'Inquiry sent successfully', data: savedMessage });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to send message', error: err.message });
    }
});

// API: Get All Messages (For Admin)
app.get('/api/contact', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: messages.length, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages', error: err.message });
    }
});

// API: Delete a Contact Message
app.delete('/api/contact/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete message', error: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});