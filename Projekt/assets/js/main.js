const API_URL = "https://www.themealdb.com/api/json/v1/1/";

const mainView = document.getElementById("main-view");
const detailView = document.getElementById("detail-view");
const recipesGrid = document.getElementById("recipes-grid");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const randomBtn = document.getElementById("random-btn");
const backBtn = document.getElementById("back-btn");
const loadingDiv = document.getElementById("loading");
const recipeDetailContent = document.getElementById("recipe-detail-content");
const categoryButtons = document.querySelectorAll(".category-chip");

const eigeneErsatzGerichte = [
    {
        idMeal: "custom1",
        strMeal: "Adana Kebap",
        strCategory: "Turkish",
        strArea: "Turkish",
        strMealThumb: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWK2_xrjC9b96HsIDI7IONCc5fJGOS-aZq5IUEvWtpnw&s=10",
        strIngredient1: "Lammhackfleisch", strMeasure1: "500g",
        strIngredient2: "Paprika", strMeasure2: "1 Stück",
        strIngredient3: "Chiliflocken", strMeasure3: "1 TL",
        strIngredient4: "Salz & Pfeffer", strMeasure4: "nach Geschmack"
    }
];

window.addEventListener("DOMContentLoaded", function () {
    holeRezepte("");

    searchBtn.addEventListener("click", function () {
        const suchBegriff = searchInput.value.trim();
        holeRezepte(suchBegriff);
    });

    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            holeRezepte(searchInput.value.trim());
        }
    });

    randomBtn.addEventListener("click", holeZufallsRezept);
    backBtn.addEventListener("click", zeigeHauptansicht);

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const kategorie = button.innerText;
            if (kategorie === "Alle") {
                holeRezepte("");
            } else if (kategorie === "Turkish") {
                zeigeRezepteKarten(eigeneErsatzGerichte);
            } else {
                filtereNachKategorie(kategorie);
            }
        });
    });
});

function holeRezepte(suchbegriff) {
    zeigeLadeanzeige(true);

    fetch(API_URL + "search.php?s=" + suchbegriff)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            zeigeLadeanzeige(false);
            
            let ergebnisse = data.meals;
        
            if (!ergebnisse && suchbegriff.toLowerCase().includes("kebap")) {
                ergebnisse = eigeneErsatzGerichte;
            }

            zeigeRezepteKarten(ergebnisse);
        })
        .catch(function (error) {
            zeigeLadeanzeige(false);
            console.log("Fehler beim Laden:", error);
            recipesGrid.innerHTML = '<div class="message">Fehler beim Laden der Daten. Bitte versuche es später noch einmal.</div>';
        });
}

function filtereNachKategorie(kategorie) {
    zeigeLadeanzeige(true);

    fetch(API_URL + "filter.php?c=" + kategorie)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            zeigeLadeanzeige(false);
            zeigeRezepteKarten(data.meals);
        })
        .catch(function (error) {
            zeigeLadeanzeige(false);
            console.log("Fehler beim Filtern:", error);
        });
}

function holeZufallsRezept() {
    zeigeLadeanzeige(true);

    fetch(API_URL + "random.php")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            zeigeLadeanzeige(false);
            if (data.meals && data.meals.length > 0) {
                holeRezeptDetails(data.meals[0].idMeal);
            }
        })
        .catch(function (error) {
            zeigeLadeanzeige(false);
            console.log("Fehler beim Zufallsrezept:", error);
        });
}

function holeRezeptDetails(id) {
    if (id === "custom1") {
        zeigeRezeptDetails(eigeneErsatzGerichte[0]);
        return;
    }

    zeigeLadeanzeige(true);

    fetch(API_URL + "lookup.php?i=" + id)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            zeigeLadeanzeige(false);
            if (data.meals && data.meals.length > 0) {
                zeigeRezeptDetails(data.meals[0]);
            }
        })
        .catch(function (error) {
            zeigeLadeanzeige(false);
            console.log("Fehler beim Laden der Details:", error);
        });
}

function zeigeRezepteKarten(gerichte) {
    recipesGrid.innerHTML = "";

    if (!gerichte || gerichte.length === 0) {
        recipesGrid.innerHTML = '<div class="message">Keine Gerichte gefunden. Versuche einen anderen Begriff!</div>';
        return;
    }

    gerichte.forEach(function (gericht) {
        const karte = document.createElement("div");
        karte.className = "recipe-card";

        karte.addEventListener("click", function () {
            holeRezeptDetails(gericht.idMeal);
        });

        karte.innerHTML = `
            <img src="${gericht.strMealThumb}" alt="${gericht.strMeal}">
            <div class="recipe-card-content">
                <div class="tags">
                    ${gericht.strCategory ? `<span class="tag">${gericht.strCategory}</span>` : ''}
                    ${gericht.strArea ? `<span class="tag">${gericht.strArea}</span>` : ''}
                </div>
                <h3>${gericht.strMeal}</h3>
            </div>
        `;

        recipesGrid.appendChild(karte);
    });
}

function zeigeRezeptDetails(gericht) {
    let zutatenListeHTML = "";

    for (let i = 1; i <= 20; i++) {
        const zutat = gericht["strIngredient" + i];
        const menge = gericht["strMeasure" + i];

        if (zutat && zutat.trim() !== "") {
            zutatenListeHTML += `
                <li>
                    <span>${zutat}</span>
                    <strong>${menge ? menge : ''}</strong>
                </li>
            `;
        }
    }

    let videoButtonHTML = "";
    if (gericht.strYoutube) {
        videoButtonHTML = `<a href="${gericht.strYoutube}" target="_blank" class="btn-secondary" style="display:inline-block; margin-top:10px; text-decoration:none;">► Video ansehen</a>`;
    }

    recipeDetailContent.innerHTML = `
        <div class="detail-header">
            <div class="tags">
                ${gericht.strCategory ? `<span class="tag">${gericht.strCategory}</span>` : ''}
                ${gericht.strArea ? `<span class="tag">${gericht.strArea}</span>` : ''}
            </div>
            <h2>${gericht.strMeal}</h2>
            ${videoButtonHTML}
            <img src="${gericht.strMealThumb}" alt="${gericht.strMeal}">
        </div>

        <h3>Zutaten</h3>
        <ul class="ingredients-list">
            ${zutatenListeHTML}
        </ul>

        <h3 style="margin-top: 20px;">Zubereitung</h3>
        <p class="instructions">${gericht.strInstructions}</p>
    `;

    mainView.classList.add("hidden");
    detailView.classList.remove("hidden");
    window.scrollTo(0, 0);
}

function zeigeHauptansicht() {
    detailView.classList.add("hidden");
    mainView.classList.remove("hidden");
}

function zeigeLadeanzeige(anzeigen) {
    if (anzeigen) {
        loadingDiv.classList.remove("hidden");
        recipesGrid.classList.add("hidden");
    } else {
        loadingDiv.classList.add("hidden");
        recipesGrid.classList.remove("hidden");
    }
}