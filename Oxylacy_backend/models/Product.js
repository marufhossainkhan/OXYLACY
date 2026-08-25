const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product must have a name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'A product must have a price']
    },
    originalPrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        required: true,
        enum: ['apparel', 'timepieces', 'leather', 'accessories']
    },
    tag: {
        type: String,
        default: 'Craftsmanship'
    },
    image: {
        type: String,
        required: [true, 'A product must have an image URL']
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 5.0
    },
    stock: {
        type: Number,
        default: 10
    },
    featured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);