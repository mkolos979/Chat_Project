Projekt: Czat w czasie rzeczywistym

Aplikacja umożliwiająca komunikację w czasie rzeczywistym za pomocą WebSocketów oraz przechowywanie historii wiadomości w bazie danych MongoDB.

---

Wymagania systemowe

Aby uruchomić projekt, należy mieć zainstalowane:

1. **Node.js + npm**  
   (https://nodejs.org/) – zalecana wersja LTS  
   (npm instaluje się automatycznie z Node.js)

2. **Dostęp do internetu**  
   (używana jest zewnętrzna baza danych MongoDB Atlas)



---

Instalacja i uruchomienie

1. Instalacja zależności

W terminalu (w folderze projektu):

npm install


2. Uruchomienie aplikacji

node index

Po uruchomieniu przejdź do przeglądarki i wpisz:

http://localhost:3000


Testowanie

- Wpisz swoje imię i wiadomość, kliknij „Wyślij”.
- Wiadomości są widoczne natychmiast dla wszystkich użytkowników.
- Dane są zapisywane w chmurze MongoDB (Atlas).


Baza danych

Projekt korzysta z MongoDB Atlas. Dane są automatycznie zapisywane w kolekcji `messages` w bazie `chatApp`.  
Nie trzeba instalować MongoDB lokalnie.
