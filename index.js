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

const mongoURI = 'mongodb+srv://mkolos979:AWpDMSE6rlcy2eVY@cluster0.vwgjinv.mongodb.net/chatApp?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
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

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/index.html');
    } else {
        res.send('Nieprawidłowy login lub hasło')
    }
});

// tylko zalogowani użytkownicy
app.get('/', (req, res) => {
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


});

// Uruchomienie serwera
server.listen(3000, () => {
    console.log('Serwer działa na porcie 3000');
});
