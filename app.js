// Sprawdzenie czy plik działa poprawnie
console.log("Skrypt app.js został pomyślnie załadowany. (Etap 3)");

// URL do Firebase Realtime Database
const FIREBASE_URL = "https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books.json";

const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");

// Elementy formularza i edycji (ETAP 3)
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");
let currentEditId = null; // Zmienna przechowująca ID aktualnie edytowanej książki

// Elementy Modala
const modal = document.getElementById("bookModal");
const closeBtn = document.querySelector(".close-btn");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalCategory = document.getElementById("modalCategory"); 
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
            
            // Sprawdzamy czy jest kategoria i okładka (zabezpieczenie)
            const catText = book.category ? book.category : "Brak kategorii";
            // Używamy niezawodnego linku z Unsplash jako domyślnej okładki
            const coverImg = book.coverUrl ? book.coverUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80";

            // Dodano klasy book-title i book-author dla wyszukiwarki
            bookCard.innerHTML = `
                <img src="${coverImg}" class="book-cover" alt="Okładka">
                <span class="category-badge">${catText}</span>
                <h3 class="book-title">${book.title}</h3>
                <div class="author book-author">Autor: ${book.author}</div>
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
                modalCategory.innerText = catText; 
                modalDesc.innerText = book.description || "Brak opisu.";
                modal.style.display = "block";
            });

            // NOWE (ETAP 3): Przycisk "Edytuj"
            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.innerText = "Edytuj";
            editBtn.addEventListener("click", () => {
                startEditing(key, book);
            });

            // Tworzenie przycisku "Usuń"
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerText = "Usuń";

            deleteBtn.addEventListener("click", async () => {
                if (confirm(`Usunąć książkę "${book.title}"?`)) {
                    await deleteBook(key);
                }
            });

            btnContainer.appendChild(detailsBtn);
            btnContainer.appendChild(editBtn); // Dodano przycisk edycji
            btnContainer.appendChild(deleteBtn);
            bookCard.appendChild(btnContainer);
            
            booksContainer.appendChild(bookCard);
        });
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        booksContainer.innerHTML = "<p class='loading'>Wystąpił błąd podczas ładowania danych.</p>";
    }
}

// NOWE (ETAP 3): Funkcja Wyszukiwania na żywo
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.book-card');

    cards.forEach(card => {
        const title = card.querySelector('.book-title').innerText.toLowerCase();
        const author = card.querySelector('.book-author').innerText.toLowerCase();
        
        if(title.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// NOWE (ETAP 3): Funkcja przygotowująca formularz do edycji
function startEditing(id, book) {
    currentEditId = id; 
    
    // Wypełnianie formularza danymi wybranej książki
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("category").value = book.category || "Inne";
    document.getElementById("coverUrl").value = book.coverUrl || "";
    document.getElementById("description").value = book.description || "";

    // Zmiana wyglądu formularza
    formTitle.innerText = `Edytujesz: ${book.title}`;
    submitBtn.innerText = "Zapisz zmiany";
    submitBtn.style.backgroundColor = "#f39c12"; 
    cancelEditBtn.style.display = "block";

    // Przewinięcie strony do góry
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// NOWE (ETAP 3): Funkcja anulowania edycji
cancelEditBtn.addEventListener("click", () => {
    resetFormState();
});

function resetFormState() {
    bookForm.reset();
    currentEditId = null;
    formTitle.innerText = "Dodaj nową książkę";
    submitBtn.innerText = "Dodaj do bazy";
    submitBtn.style.backgroundColor = ""; // Wracamy do domyślnego koloru z CSS
    cancelEditBtn.style.display = "none";
}

// Funkcja do usuwania (DELETE)
async function deleteBook(id) {
    const deleteUrl = `https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books/${id}.json`;
    try {
        const response = await fetch(deleteUrl, { method: "DELETE" });
        if (response.ok) {
            fetchBooks(); 
        }
    } catch (error) {
        console.error("Błąd podczas usuwania:", error);
    }
}

// Obsługa formularza: Dodawanie (POST) lub Edycja (PUT)
bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const category = document.getElementById("category").value; 
    const coverUrl = document.getElementById("coverUrl").value; 
    const description = document.getElementById("description").value;

    const bookData = { title, author, category, coverUrl, description };

    try {
        // Domyślnie ustawiamy dodawanie nowej książki
        let url = FIREBASE_URL;
        let method = "POST";

        // Jeśli jesteśmy w trybie edycji, zmieniamy URL i metodę na PUT
        if (currentEditId) {
            url = `https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books/${currentEditId}.json`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            resetFormState(); // Czyszczenie i powrót do trybu dodawania
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
