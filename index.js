const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mongoose = require('mongoose');

const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Message = require('./models/Message');

const mongoURI = 'mongodb+srv://mkolos979:AWpDMSE6rlcy2eVY@cluster0.vwgjinv.mongodb.net/chatApp?retryWrites=true&w=majority';

// Połączenie z MongoDB
mongoose.connect(mongoURI).then(() => {
    console.log('Połączono z MongoDB');
}).catch((err) => {
    console.error('Błąd połączenia z MongoDB:', err);
});

app.use(bodyParser.urlencoded({ extended: true })); // Middleware do obsługi formularzy

// Konfiguracja sesji
app.use(session({
    secret: 'sekretne_haslo',
    resave: false,
    saveUninitialized: true
}));

// Rejestracja użytkownika
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);

    try {
        const user = new User({ username, password: hashedPass });
        await user.save();
        res.redirect('/logowanie.html');
    } catch (e) {
        res.send('Użytkownik już istnieje');
    }
});

// Logowanie użytkownika
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Błędne dane logowania');
    }

    // Zapisanie danych użytkownika do sesji
    req.session.user = {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
    };

    res.redirect('/chat');
});

// Strona czatu - dostęp tylko dla zalogowanych
app.get('/chat', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.redirect('/logowanie.html');
    }
});

app.use(express.static(__dirname)); // Ustawienie folderu statycznego

// Wylogowanie użytkownika
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/logowanie.html');
    });
});

// Zwracanie danych sesji
app.get('/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Nie zalogowany' });
    }
});

// Middleware sprawdzający czy użytkownik jest administratorem
function isAdmin(req, res, next) {
    console.log('Uprawnienia admina:', req.session.user && req.session.user.isAdmin);
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).send("Dostęp zabroniony: wymagana rola administratora");
    }
}

// Usuwanie wiadomości po ID (tylko dla administratora)
app.delete('/message/:id', isAdmin, async (req, res) => {
    try {
        const messageId = req.params.id;
        console.log('Usuwanie wiadomości o ID:', messageId);

        const deleted = await Message.findByIdAndDelete(messageId);
        console.log('Wynik usunięcia:', deleted);

        if (deleted) {
            io.emit('message deleted', messageId); // Powiadomienie wszystkich klientów
            res.status(200).send('Wiadomość usunięta');
        } else {
            res.status(404).send('Wiadomość nie znaleziona');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd podczas usuwania wiadomości');
    }
});

// Obsługa połączeń Socket.IO
io.on('connection', async (socket) => {
    console.log('Użytkownik połączony');

    // Wysłanie historii wiadomości po połączeniu
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit('chat history', messages);

    // Obsługa nowej wiadomości
    socket.on('chat message', async (data) => {
        console.log('Otrzymano wiadomość od klienta:', data);

        const msg = new Message(data);
        await msg.save();
        io.emit('chat message', msg); // Wysłanie wiadomości do wszystkich klientów
    });

    // Informacja o połączeniu
    socket.on('connect', () => {
        console.log('socket.io połączono');
    });
});

// Uruchomienie serwera
server.listen(3000, () => {
    console.log('Serwer działa na porcie 3000');
});
