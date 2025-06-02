const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // <-- Zaktualizowany sposób inicjalizacji

const mongoose = require('mongoose');

const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const User = require('./models/User')
const Message = require('./models/Message')

const mongoURI = 'mongodb+srv://mkolos979:AWpDMSE6rlcy2eVY@cluster0.vwgjinv.mongodb.net/chatApp?retryWrites=true&w=majority';

mongoose.connect(mongoURI).then(() => {
    console.log('Połączono z MongoDB');
}).catch((err) => {
    console.error('Błąd połączenia z MongoDB:', err);
});


app.use(bodyParser.urlencoded({ extended: true })); //Middleware

// -------
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
        res.send('Użytkownik już istnieje')
    }
});

// Logowanie użytkownika
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Błędne dane logowania');
    }

    req.session.user = {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
    };

    res.redirect('/chat');
});

// tylko zalogowani użytkownicy
app.get('/chat', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.redirect('/logowanie.html');
    }
});

app.use(express.static(__dirname)); // ----

//wylogowanie
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/logowanie.html');
    })
})

app.get('/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Nie zalogowany' });
    }
});


// Midleware sprawdzający czy użytkownik jest adminem
function isAdmin(req, res, next) {
    console.log('Права admin:', req.session.user && req.session.user.isAdmin);
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).send("Dostęp zabroniony: wymaga rola admina")
    }
}

// Usuwanie wiadomości po ID (tylko dla admina)
app.delete('/message/:id', isAdmin, async (req, res) => {
    try {
        const messageId = req.params.id;
        console.log('видалення повідомлення з id: ', messageId);

        const deleted = await Message.findByIdAndDelete(messageId);
        console.log('Результат видалення:', deleted);

        if (deleted) {
            io.emit('message deleted', messageId); // повідомити всіх
            res.status(200).send('Wiadomość usunięta');
        } else {
            res.status(404).send('Повідомлення не знайдено');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąд padczas usuwania wiadomości');
    }
});

// Obsługa połączenia Socket.IO
io.on('connection', async (socket) => {
    console.log('Użytkownik połączony');

    // Wysłanie historii wiadomości przy połączeniu
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    socket.emit('chat history', messages.reverse());

    // Obsługa nowej wiadomości
    socket.on('chat message', async (data) => {
        console.log('📥 Otrzymano wiadomość od klienta:', data);

        const msg = new Message(data);
        await msg.save();
        io.emit('chat message', msg); // wysyłamy do wszystkich
    });

    socket.on('connect', () => {
        console.log('socket.io підключено: ');
    });
});

// Uruchomienie serwera
server.listen(3000, () => {
    console.log('Serwer działa na porcie 3000');
});
