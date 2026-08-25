const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const dummyProducts = [
    {
        name: "Aethelgard Chronograph",
        price: 450,
        originalPrice: 520,
        category: "timepieces",
        tag: "Exclusive",
        image: "image/products/watch-2.jpg",
        description: "Precision engineered automatic timepiece encased in sapphire crystal with matte obsidian finish.",
        rating: 4.9,
        stock: 12,
        featured: true
    },
    {
        name: "Midnight Bespoke Tuxedo",
        price: 620,
        originalPrice: 700,
        category: "apparel",
        tag: "Bespoke",
        image: "image/products/suite-1.jpg",
        description: "Handcrafted Italian wool tuxedo tailored for timeless modern aesthetics and supreme comfort.",
        rating: 5.0,
        stock: 8,
        featured: true
    },
    {
        name: "Artisanal Heritage Belt",
        price: 120,
        originalPrice: 150,
        category: "leather",
        tag: "Handmade",
        image: "image/products/belt-1.jpg",
        description: "Full-grain Tuscan leather belt with brushed brass buckle designed for daily luxury.",
        rating: 4.8,
        stock: 15,
        featured: true
    },
    {
        name: "Celeste Diamond Edition",
        price: 380,
        originalPrice: 420,
        category: "timepieces",
        tag: "New",
        image: "image/products/watch-female-2.jpg",
        description: "Refined elegance with subtle diamond accents and mother-of-pearl dial.",
        rating: 4.7,
        stock: 20,
        featured: false
    },
    {
        name: "Heritage Tailored Suit",
        price: 540,
        originalPrice: 600,
        category: "apparel",
        tag: "Classic",
        image: "image/products/suite-2.jpg",
        description: "Timeless check pattern bespoke suit constructed from premium breathable fabric.",
        rating: 4.9,
        stock: 10,
        featured: false
    },
    {
        name: "Vintage Minimalist Wallet",
        price: 85,
        originalPrice: 100,
        category: "leather",
        tag: "Compact",
        image: "image/products/wallet-1.jpg",
        description: "Ultra-slim vintage cardholder crafted from premium vegetable-tanned leather.",
        rating: 4.6,
        stock: 25,
        featured: false
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        await Product.deleteMany({});
        await Product.insertMany(dummyProducts);
        console.log('Dummy Products Seeded Successfully with Correct Images!');
        process.exit();
    })
    .catch(err => {
        console.error('Seeding Error:', err);
        process.exit(1);
    });