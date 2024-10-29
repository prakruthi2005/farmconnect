const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmfreshmarketplace', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Mongoose Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const cartSchema = new mongoose.Schema({
    username: { type: String, required: true },
    items: [{ name: String, price: Number }],
});

const orderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    items: [{ name: String, price: Number }],
    total: Number,
    paymentMethod: String,
    location: String,
    status: { type: String, default: 'Confirmed' },
});

// Create Mongoose Models
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

// User Registration Endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error registering user', error });
    }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Add to Cart Endpoint
app.post('/cart', async (req, res) => {
    const { username, items } = req.body;
    try {
        let cart = await Cart.findOne({ username });
        if (cart) {
            cart.items.push(...items);
            await cart.save();
        } else {
            cart = new Cart({ username, items });
            await cart.save();
        }
        res.status(200).json({ message: 'Items added to cart', cart });
    } catch (error) {
        res.status(400).json({ message: 'Error adding items to cart', error });
    }
});

// Get Cart Items
app.get('/cart/:username', async (req, res) => {
    const { username } = req.params;
    const cart = await Cart.findOne({ username });
    if (cart) {
        res.status(200).json({ cart });
    } else {
        res.status(404).json({ message: 'Cart not found' });
    }
});

// Confirm Payment Endpoint
app.post('/payment', async (req, res) => {
    const { username, paymentMethod, location } = req.body;
    const cart = await Cart.findOne({ username });
    if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
    }

    const total = cart.items.reduce((sum, item) => sum + item.price, 0);
    const order = new Order({ username, items: cart.items, total, paymentMethod, location });
    await order.save();

    // Clear the cart after payment
    await Cart.deleteOne({ username });

    res.status(200).json({ message: 'Payment successful', order });
});

// Get Orders
app.get('/orders/:username', async (req, res) => {
    const { username } = req.params;
    const orders = await Order.find({ username });
    res.status(200).json({ orders });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
