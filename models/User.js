const mongoose = require('mongoose');

// Tworzymy schemat użytkownika
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, //Login
    password: { type: String, required: true }                //Hasło
});

module.exports = mongoose.model('User', userSchema);