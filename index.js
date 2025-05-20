const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // <-- Zaktualizowany sposób inicjalizacji

const mongoose = require('mongoose');

// Zamień na swój prawdziwy adres URI MongoDB
const mongoURI = 'mongodb+srv://mkolos979:AWpDMSE6rlcy2eVY@cluster0.vwgjinv.mongodb.net/chatApp?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Połączono z MongoDB');
}).catch((err) => {
    console.error('❌ Błąd połączenia z MongoDB:', err);
});

// Odpowiedź na żądanie GET
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Schemat wiadomości
const messageSchema = new mongoose.Schema({
    name: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Obsługa połączenia Socket.IO
io.on('connection', async (socket) => {
    console.log('Użytkownik połączony');

    // Wysłanie historii wiadomości przy połączeniu
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit('chat history', messages);

    // Obsługa nowej wiadomości
    socket.on('chat message', async (data) => {
        const msg = new Message(data);
        await msg.save();
        io.emit('chat message', data); // wysyłamy do wszystkich
    });

    socket.on('disconnect', () => {
        console.log('Użytkownik rozłączony');
    });

    // Obsługa historii czatu (ta część kodu wygląda na błędną — dotyczy klienta, nie serwera)
    socket.on('chat history', (messages) => {
        messages.forEach((data) => {
            const div = document.createElement('div');
            div.classList.add('alert', 'alert-light', 'mt-1');
            div.innerHTML = `<strong>${data.name}:</strong> ${data.message}`;
            allMessages.appendChild(div);
        });
    });
});

// Uruchomienie serwera
server.listen(3000, () => {
    console.log('Serwer działa na porcie 3000');
});
