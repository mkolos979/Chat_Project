**Projekt: Czat w czasie rzeczywistym**

Aplikacja umożliwiająca komunikację w czasie rzeczywistym za pomocą WebSocketów oraz przechowywanie historii wiadomości w bazie danych MongoDB.

---

**Wymagania systemowe**

Aby uruchomić projekt, należy mieć zainstalowane:

1. Node.js + npm 
   (https://nodejs.org/) – zalecana wersja LTS  
   (npm instaluje się automatycznie z Node.js)

2. Dostęp do internetu 
   (używana jest zewnętrzna baza danych MongoDB Atlas)



**Instalacja i uruchomienie**

1. Instalacja zależności

W terminalu (w folderze projektu):

npm install

2. Skonfiguruj bazę danych MongoDB:

W pliku server.js, podmień URI:

const mongoURI = 'mongodb+srv://<LOGIN>:<HASŁO>@<CLUSTER>.mongodb.net/chatApp?...';
Zmień na swoje dane dostępu z MongoDB Atlas lub lokalnego MongoDB.


3. Uruchomienie aplikacji

node index

Po uruchomieniu przejdź do przeglądarki i wpisz:

http://localhost:3000


4. Testowanie

- Wpisz swoje imię i wiadomość, kliknij „Wyślij”.
- Wiadomości są widoczne natychmiast dla wszystkich użytkowników.
- Dane są zapisywane w chmurze MongoDB (Atlas).

5. Uprawnienia Admina
Jeśli chcesz mieć użytkownika z uprawnieniami admina, możesz w MongoDB ręcznie ustawić pole isAdmin: true dla danego użytkownika w kolekcji users. 


6. Baza danych

Projekt korzysta z MongoDB Atlas. Dane są automatycznie zapisywane w kolekcji `messages` w bazie `chatApp`.  
Nie trzeba instalować MongoDB lokalnie.

7. Bezpieczeństwo

Hasła są hashowane przy użyciu bcryptjs.

Sesje przechowywane w pamięci serwera (dla produkcji zaleca się connect-mongo).

Middleware sprawdza, czy użytkownik jest adminem, zanim pozwoli usunąć wiadomości.


**Autor**

Projekt stworzony przez **Maksym Kolos**