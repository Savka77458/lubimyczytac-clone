// Sprawdzenie czy plik działa poprawnie (Etap 4)
console.log("Skrypt app.js został pomyślnie załadowany. (Etap 4)");

// URL do Firebase Realtime Database
const FIREBASE_URL = "https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books.json";

const bookForm = document.getElementById("bookForm");
const booksContainer = document.getElementById("booksContainer");

// Elementy formularza i edycji
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");
let currentEditId = null; 

// Elementy Modala
const modal = document.getElementById("bookModal");
const closeBtn = document.querySelector(".close-btn");
const modalTitle = document.getElementById("modalTitle");
const modalAuthor = document.getElementById("modalAuthor");
const modalCategory = document.getElementById("modalCategory"); 
const modalDesc = document.getElementById("modalDesc");
const modalRating = document.getElementById("modalRating"); 

// Pobieranie i renderowanie książek z bazy danych
async function fetchBooks() {
    try {
        const response = await fetch(FIREBASE_URL);
        const data = await response.json();
        
        // Aktualizacja panelu statystyk
        updateStatistics(data);
        
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
            
            // Atrybuty danych do sortowania
            bookCard.setAttribute("data-rating", book.rating || 0);
            bookCard.setAttribute("data-title", book.title || "");

            // Sprawdzamy czy jest kategoria i okładka
            const catText = book.category ? book.category : "Brak kategorii";
            const coverImg = book.coverUrl ? book.coverUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80";
            
            // Formatowanie oceny na gwiazdki wizualne
            const ratingText = book.rating ? generateStars(book.rating) : "Brak oceny";

            bookCard.innerHTML = `
                <img src="${coverImg}" class="book-cover" alt="Okładka">
                <span class="category-badge">${catText}</span>
                <div class="rating-badge">${ratingText}</div>
                <h3 class="book-title">${book.title}</h3>
                <div class="author book-author">Autor: ${book.author}</div>
            `;
            
            // Kontener na przyciski
            const btnContainer = document.createElement("div");
            btnContainer.className = "card-buttons";

            // Przycisk "Szczegóły"
            const detailsBtn = document.createElement("button");
            detailsBtn.className = "details-btn";
            detailsBtn.innerText = "Szczegóły";
            
            detailsBtn.addEventListener("click", () => {
                modalTitle.innerText = book.title;
                modalAuthor.innerText = book.author;
                modalCategory.innerText = catText; 
                modalRating.innerText = ratingText;
                modalDesc.innerText = book.description || "Brak opisu.";
                modal.style.display = "block";
            });

            // Przycisk "Edytuj"
            const editBtn = document.createElement("button");
            editBtn.className = "edit-btn";
            editBtn.innerText = "Edytuj";
            editBtn.addEventListener("click", () => {
                startEditing(key, book);
            });

            // Przycisk "Usuń"
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerText = "Usuń";

            deleteBtn.addEventListener("click", async () => {
                if (confirm(`Usunąć książkę "${book.title}"?`)) {
                    await deleteBook(key);
                }
            });

            btnContainer.appendChild(detailsBtn);
            btnContainer.appendChild(editBtn); 
            btnContainer.appendChild(deleteBtn);
            bookCard.appendChild(btnContainer);
            
            booksContainer.appendChild(bookCard);
        });
        
        // Wywołanie po załadowaniu, by zaaplikować filtry i sortowanie
        updateBooksDisplay();
        
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        booksContainer.innerHTML = "<p class='loading'>Wystąpił błąd podczas ładowania danych.</p>";
    }
}

// Funkcja Wyszukiwania, Filtrowania i Sortowania
function updateBooksDisplay() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value.toLowerCase();
    const sortValue = document.getElementById('sortFilter').value;
    const container = document.getElementById('booksContainer');
    const cards = Array.from(container.querySelectorAll('.book-card'));

    cards.sort((a, b) => {
        if (sortValue === 'ratingDesc') {
            return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        } else if (sortValue === 'ratingAsc') {
            return parseFloat(a.dataset.rating) - parseFloat(b.dataset.rating);
        } else if (sortValue === 'titleAsc') {
            return a.dataset.title.localeCompare(b.dataset.title);
        }
        return 0; // domyślnie
    });

    cards.forEach(card => {
        container.appendChild(card); 

        const title = card.querySelector('.book-title').innerText.toLowerCase();
        const author = card.querySelector('.book-author').innerText.toLowerCase();
        const category = card.querySelector('.category-badge').innerText.toLowerCase();
        
        const matchesSearch = title.includes(searchTerm) || author.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

        if(matchesSearch && matchesCategory) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

document.getElementById('searchInput').addEventListener('input', updateBooksDisplay);
document.getElementById('categoryFilter').addEventListener('change', updateBooksDisplay);
document.getElementById('sortFilter').addEventListener('change', updateBooksDisplay);


// Funkcja przygotowująca formularz do edycji
function startEditing(id, book) {
    currentEditId = id; 
    
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("category").value = book.category || "Inne";
    document.getElementById("coverUrl").value = book.coverUrl || "";
    document.getElementById("description").value = book.description || "";
    document.getElementById("rating").value = book.rating || 5; 

    formTitle.innerText = `Edytujesz: ${book.title}`;
    submitBtn.innerText = "Zapisz zmiany";
    submitBtn.style.backgroundColor = "#f39c12"; 
    cancelEditBtn.style.display = "block";

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelEditBtn.addEventListener("click", () => {
    resetFormState();
});

function resetFormState() {
    bookForm.reset();
    currentEditId = null;
    formTitle.innerText = "Dodaj nową książkę";
    submitBtn.innerText = "Dodaj do bazy";
    submitBtn.style.backgroundColor = ""; 
    cancelEditBtn.style.display = "none";
}

// Funkcja do usuwania (DELETE)
async function deleteBook(id) {
    const deleteUrl = `https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books/${id}.json`;
    try {
        const response = await fetch(deleteUrl, { method: "DELETE" });
        if (response.ok) {
            fetchBooks(); 
            showToast("Książka została pomyślnie usunięta!", "success"); 
        }
    } catch (error) {
        console.error("Błąd podczas usuwania:", error);
        showToast("Błąd podczas usuwania książki.", "error"); 
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
    const rating = document.getElementById("rating").value; 

    const bookData = { title, author, category, coverUrl, description, rating };

    try {
        let url = FIREBASE_URL;
        let method = "POST";
        let isEditing = false; 

        if (currentEditId) {
            url = `https://lubimyczytac-projekt-default-rtdb.europe-west1.firebasedatabase.app/books/${currentEditId}.json`;
            method = "PUT";
            isEditing = true;
        }

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            resetFormState(); 
            fetchBooks();
            
            if (isEditing) {
                showToast("Zmiany zostały zapisane pomyślnie!", "success");
            } else {
                showToast("Nowa książka została dodana do bazy!", "success");
            }
        } else {
            console.error("Błąd zapisu w bazie danych.");
            showToast("Wystąpił błąd podczas zapisu.", "error"); 
        }
    } catch (error) {
        console.error("Błąd sieci:", error);
        showToast("Błąd sieci. Sprawdź połączenie.", "error"); 
    }
});

// --- Logika zamykania modala ---
closeBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = (event) => {
    if (event.target === modal) { modal.style.display = "none"; }
};

// Funkcja do wizualnego generowania gwiazdek
function generateStars(rating) {
    const maxStars = 5;
    const fullStar = '★';
    const emptyStar = '☆';
    
    let parsedRating = parseInt(rating) || 0;
    if (parsedRating > maxStars) parsedRating = maxStars;
    if (parsedRating < 0) parsedRating = 0;
    
    return fullStar.repeat(parsedRating) + emptyStar.repeat(maxStars - parsedRating);
}

// Algorytm do obliczania statystyk
function updateStatistics(data) {
    const totalBooksElement = document.getElementById("totalBooks");
    const avgRatingElement = document.getElementById("avgRating");

    if (!data) {
        totalBooksElement.innerText = "0";
        avgRatingElement.innerText = "0.0";
        return;
    }

    const books = Object.values(data);
    const totalBooks = books.length;
    
    let totalRating = 0;
    let ratedBooksCount = 0;

    books.forEach(book => {
        const rating = parseFloat(book.rating);
        if (!isNaN(rating) && rating > 0) {
            totalRating += rating;
            ratedBooksCount++;
        }
    });

    const avgRating = ratedBooksCount > 0 ? (totalRating / ratedBooksCount).toFixed(1) : "0.0";

    totalBooksElement.innerText = totalBooks;
    avgRatingElement.innerText = avgRating;
}

// Funkcja wyświetlająca powiadomienie (Toast)
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// NOWE (ETAP 4): Logika Dark Mode
const themeToggleBtn = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme');

// Sprawdź przy ładowaniu, czy włączono ciemny motyw
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerText = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    let theme = 'light';
    if (document.body.classList.contains('dark-theme')) {
        theme = 'dark';
        themeToggleBtn.innerText = '☀️';
    } else {
        themeToggleBtn.innerText = '🌙';
    }
    
    // Zapisz wybór użytkownika w localStorage
    localStorage.setItem('theme', theme);
});

// Wywołanie funkcji przy załadowaniu strony
fetchBooks();
