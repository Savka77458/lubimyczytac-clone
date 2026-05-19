// Sprawdzenie czy plik działa poprawnie
console.log("Skrypt app.js został pomyślnie załadowany.");

// URL do Firebase Realtime Database
const FIREBASE_URL = "https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books.json";

const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");

// Pobieranie i renderowanie książek z bazy danych
async function fetchBooks() {
    try {
        const response = await fetch(FIREBASE_URL);
        const data = await response.json();
        
        booksContainer.innerHTML = "";

        if (!data) {
            booksContainer.innerHTML = "<p class='loading'>Brak książek w bazie. Dodaj swoją pierwszą książkę!</p>";
            return;
        }

        // Iteracja po obiektach Firebase i tworzenie kart HTML
        Object.keys(data).forEach(key => {
            const book = data[key];
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";
            
            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <div class="author">Autor: ${book.author}</div>
                <div class="desc">${book.description}</div>
            `;
            
            booksContainer.appendChild(bookCard);
        });
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        booksContainer.innerHTML = "<p class='loading'>Wystąpił błąd podczas ładowania danych.</p>";
    }
}

// Obsługa formularza i wysyłanie danych (POST)
bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const description = document.getElementById("description").value;

    const newBook = { title, author, description };

    try {
        const response = await fetch(FIREBASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBook)
        });

        if (response.ok) {
            bookForm.reset();
            fetchBooks();
        } else {
            console.error("Błąd zapisu w bazie danych.");
        }
    } catch (error) {
        console.error("Błąd sieci:", error);
    }
});

// Wywołanie funkcji przy załadowaniu strony
fetchBooks();
