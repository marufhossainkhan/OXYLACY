const { Sequelize, DataTypes } = require('sequelize');

// MySQL Connection via Sequelize
const sequelize = new Sequelize('oxylacy_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

// Product Model
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  originalPrice: { type: DataTypes.FLOAT, allowNull: true },
  tag: { type: DataTypes.STRING, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

const initialProducts = [
  // --- TIMEPIECES ---
  {
    name: "Classic Chronograph Gold",
    category: "Classic Leather",
    price: 249.99,
    originalPrice: 299.99,
    tag: "Sale",
    image: "image/products/p1.jpeg",
    description: "A timeless masterpiece with a genuine leather strap, sapphire crystal glass, and water resistance up to 50m."
  },
  {
    name: "Minimalist Silver Mesh",
    category: "Modern Minimalist",
    price: 189.99,
    originalPrice: null,
    tag: "New",
    image: "image/products/p2.jpeg",
    description: "Ultra-thin stainless steel case paired with an elegant silver mesh band, perfect for both formal and casual wear."
  },
  {
    name: "Apex Smartwatch Pro",
    category: "Smart Wear",
    price: 329.99,
    originalPrice: 399.99,
    tag: "Hot",
    image: "image/products/p3.jpeg",
    description: "Advanced fitness tracking, AMOLED display, 7-day battery life, and seamless smartphone notifications."
  },
  {
    name: "Rose Gold Elegance",
    category: "Modern Minimalist",
    price: 219.99,
    originalPrice: 259.99,
    tag: null,
    image: "image/products/p4.jpeg",
    description: "Crafted for sophistication with a rose gold-plated bezel, mother-of-pearl dial, and Japanese quartz movement."
  },
  {
    name: "Aviator Dark Edition",
    category: "Sport & Diver",
    price: 279.99,
    originalPrice: null,
    tag: "New",
    image: "image/products/p5.jpeg",
    description: "Tactical matte black finish with luminous hands, rotating bezel, and reinforced mineral glass."
  },
  {
    name: "Oceanic Diver 300M",
    category: "Sport & Diver",
    price: 349.99,
    originalPrice: 420.00,
    tag: "Sale",
    image: "image/products/watch-1.jpg",
    description: "Professional dive watch certified to 300 meters, featuring helium escape valve and ceramic bezel."
  },
  {
    name: "Heritage Automatic",
    category: "Classic Leather",
    price: 499.99,
    originalPrice: null,
    tag: "Limited",
    image: "image/products/watch-2.jpg",
    description: "Self-winding mechanical movement visible through the exhibition case back, paired with Italian leather."
  },

  // --- APPAREL ---
  {
    name: "Midnight Bespoke Tuxedo",
    category: "Apparel",
    price: 620.00,
    originalPrice: 750.00,
    tag: "Exclusive",
    image: "image/products/suite-1.jpg",
    description: "Hand-tailored wool-silk blend tuxedo crafted for gala evenings and red-carpet sophistication."
  },
  {
    name: "Heritage Tailored Suit",
    category: "Apparel",
    price: 540.00,
    originalPrice: null,
    tag: "New",
    image: "image/products/suite-2.jpg",
    description: "Bespoke double-breasted check suit tailored with premium breathable Italian virgin wool."
  },

  // --- LEATHER GOODS ---
  {
    name: "Artisanal Heritage Belt",
    category: "Leather Goods",
    price: 120.00,
    originalPrice: 150.00,
    tag: "Handmade",
    image: "image/products/belt-1.jpg",
    description: "Full-grain vegetable-tanned leather belt with a brushed brass monogram buckle."
  },
  {
    name: "Vintage Minimalist Wallet",
    category: "Leather Goods",
    price: 85.00,
    originalPrice: 110.00,
    tag: "Sale",
    image: "image/products/wallet-1.jpg",
    description: "Handcrafted pure leather bifold wallet with RFID blocking and slim profile design."
  }
];

async function seedDB() {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL Database via Sequelize!");

    await sequelize.sync({ force: true });
    console.log("Products table synchronized successfully.");

    await Product.bulkCreate(initialProducts);
    console.log("All 11 products (Watches, Suits, Belts, Wallets) seeded successfully!");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedDB();