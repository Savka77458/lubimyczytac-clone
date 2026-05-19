// Sprawdzenie czy plik działa poprawnie
console.log("Skrypt app.js został pomyślnie załadowany.");

// URL do Firebase Realtime Database
const FIREBASE_URL = "https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books.json";

const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");

// Elementy Modala
const modal = document.getElementById("bookModal");
const closeBtn = document.querySelector(".close-btn");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalDesc = document.getElementById("modalDesc");

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

        // Iteracja po obiektach Firebase
        Object.keys(data).forEach(key => {
            const book = data[key];
            const bookCard = document.createElement("div");
            bookCard.className = "book-card";
            
            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <div class="author">Autor: ${book.author}</div>
            `;
            
            // Tworzenie przycisku "Szczegóły"
            const detailsBtn = document.createElement("button");
            detailsBtn.className = "details-btn";
            detailsBtn.innerText = "Szczegóły";
            
            // Logika kliknięcia w przycisk
            detailsBtn.addEventListener("click", () => {
                modalTitle.innerText = book.title;
                modalAuthor.innerText = book.author;
                modalDesc.innerText = book.description || "Brak opisu.";
                modal.style.display = "block";
            });

            bookCard.appendChild(detailsBtn);
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

// --- Logika zamykania modala ---

// Kliknięcie w (X)
closeBtn.onclick = () => {
    modal.style.display = "none";
};

// Kliknięcie w ciemne tło poza oknem
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Wywołanie funkcji przy załadowaniu strony
fetchBooks();
