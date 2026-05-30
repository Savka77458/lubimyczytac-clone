# 📚 Klon LubimyCzytać – Projekt Semestralny

Projekt zaliczeniowy stworzony w ramach przedmiotu **"Wprowadzenie do technologii internetowych"**. Jest to w pełni funkcjonalna, interaktywna aplikacja webowa inspirowana popularnym portalem czytelniczym, służąca do zarządzania domową biblioteczką.

🌍 **Live Demo:** [Zobacz aplikację na żywo](https://savka77458.github.io/lubimyczytac-clone/)

## 👨‍💻 Autorzy
Projekt został zrealizowany w zespole 2-osobowym:
* **Vladyslav Savka** (PL77458)
* **Dmytro Datsenko** (PL77384)

## ✨ Główne funkcjonalności
Aplikacja została zbudowana od podstaw i realizuje wszystkie założenia projektu, wychodząc znacznie poza wymagane minimum:

* 🗄️ **Pełen CRUD:** Dodawanie, wyświetlanie, edytowanie i usuwanie książek z bazy w czasie rzeczywistym.
* ☁️ **Backend as a Service:** Dane przechowywane są w chmurze przy użyciu **Firebase Realtime Database**.
* 🔍 **Live Search i Filtrowanie:** Dynamiczne wyszukiwanie po tytule/autorze oraz filtrowanie książek po kategoriach (Fantasy, Sci-Fi, Kryminał itp.).
* 📊 **Dynamiczne statystyki:** Górny panel automatycznie oblicza i wyświetla łączną liczbę książek oraz średnią ocenę wszystkich dodanych pozycji.
* ⭐ **System ocen:** Oceny książek (w skali 1-5) reprezentowane za pomocą wizualnych gwiazdek.
* 🌓 **Dark Mode:** Możliwość przełączania między jasnym a ciemnym motywem. Wybór użytkownika jest trwale zapisywany w `localStorage`.
* 🔔 **Powiadomienia Toast:** Interaktywne, animowane powiadomienia wyskakujące po wykonaniu akcji (np. dodaniu, zapisaniu zmian lub usunięciu książki).
* 📱 **Responsywność (RWD):** Nowoczesny interfejs oparty na CSS Grid i Flexbox.

## 🛠️ Wykorzystane technologie
Projekt to czysty front-end oparty na standardach webowych, bez użycia ciężkich frameworków (tzw. Vanilla Web Development):
* **HTML5** (Semantyczna struktura)
* **CSS3** (Zmienne CSS, Grid, Flexbox, animacje keyframes)
* **JavaScript (ES6+)** (Asynchroniczność `async/await`, Fetch API, manipulacja DOM)
* **Firebase Realtime Database** (Baza danych NoSQL i REST API)
* **GitHub Pages** (Darmowy hosting statyczny)

## 🚀 Jak uruchomić projekt lokalnie?
Ponieważ aplikacja używa zewnętrznego API (Firebase), do jej uruchomienia nie jest wymagana instalacja serwera lokalnego.

1. Sklonuj repozytorium:
```bash
   git clone [https://github.com/savka77458/lubimyczytac-clone.git](https://github.com/savka77458/lubimyczytac-clone.git)
