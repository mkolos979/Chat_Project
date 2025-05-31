const mongoose = require('mongoose');

// Schemat wiadomości
const messageSchema = new mongoose.Schema({
    name: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Messages', messageSchema)