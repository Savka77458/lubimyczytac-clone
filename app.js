// Sprawdzenie czy plik działa poprawnie
console.log("Skrypt app.js został pomyślnie załadowany. (Etap 2)");

// URL do Firebase Realtime Database
const FIREBASE_URL = "https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books.json";

const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");

// Elementy Modala
const modal = document.getElementById("bookModal");
const closeBtn = document.querySelector(".close-btn");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalCategory = document.getElementById("modalCategory"); // Nowe
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
            
            // NOWE: Sprawdzamy czy jest kategoria i okładka (dla starych książek w bazie)
            const catText = book.category ? book.category : "Brak kategorii";
            const coverImg = book.coverUrl ? book.coverUrl : "https://via.placeholder.com/250x350?text=Brak+Okładki";

            bookCard.innerHTML = `
                <img src="${coverImg}" class="book-cover" alt="Okładka">
                <span class="category-badge">${catText}</span>
                <h3>${book.title}</h3>
                <div class="author">Autor: ${book.author}</div>
            `;
            
            // Kontener na przyciski
            const btnContainer = document.createElement("div");
            btnContainer.className = "card-buttons";

            // Tworzenie przycisku "Szczegóły"
            const detailsBtn = document.createElement("button");
            detailsBtn.className = "details-btn";
            detailsBtn.innerText = "Szczegóły";
            
            detailsBtn.addEventListener("click", () => {
                modalTitle.innerText = book.title;
                modalAuthor.innerText = book.author;
                modalCategory.innerText = catText; // Nowe
                modalDesc.innerText = book.description || "Brak opisu.";
                modal.style.display = "block";
            });

            // NOWE: Tworzenie przycisku "Usuń"
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerText = "Usuń";

            deleteBtn.addEventListener("click", async () => {
                if (confirm(`Usunąć książkę "${book.title}"?`)) {
                    await deleteBook(key);
                }
            });

            btnContainer.appendChild(detailsBtn);
            btnContainer.appendChild(deleteBtn);
            bookCard.appendChild(btnContainer);
            
            booksContainer.appendChild(bookCard);
        });
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        booksContainer.innerHTML = "<p class='loading'>Wystąpił błąd podczas ładowania danych.</p>";
    }
}

// NOWE: Funkcja do usuwania
async function deleteBook(id) {
    const deleteUrl = `https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books/${id}.json`;
    try {
        const response = await fetch(deleteUrl, { method: "DELETE" });
        if (response.ok) {
            fetchBooks(); // Odśwież listę po usunięciu
        }
    } catch (error) {
        console.error("Błąd podczas usuwania:", error);
    }
}

// Obsługa formularza i wysyłanie danych (POST)
bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const category = document.getElementById("category").value; // Nowe
    const coverUrl = document.getElementById("coverUrl").value; // Nowe
    const description = document.getElementById("description").value;

    const newBook = { title, author, category, coverUrl, description };

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
closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = (event) => {
    if (event.target === modal) { modal.style.display = "none"; }
};

// Wywołanie funkcji przy załadowaniu strony
fetchBooks();
