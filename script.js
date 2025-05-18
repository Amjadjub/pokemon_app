// API key to access the Pokémon TCG API
const apiKey = "32b82991-f96a-4ddf-8c3b-1c7db538c4d4";

// Input fields and elements
const idInput = document.getElementById("idInput");
const typeInput = document.getElementById("typeInput");
const abilityInput = document.getElementById("abilityInput");
const loader = document.getElementById("loader");
const results = document.getElementById("results");

// Load last search from URL or localStorage when page is ready
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("name") || "";
  const type = urlParams.get("type") || "";
  const ability = urlParams.get("ability") || "";

  idInput.value = id;
  typeInput.value = type;
  abilityInput.value = ability;

  if (id || type || ability) {
    searchPokemon(); // Automatically perform search
  }
});

// Perform search request to Pokémon TCG API
function searchPokemon() {
  const id = idInput.value.trim();
  const type = typeInput.value.trim().toLowerCase();
  const ability = abilityInput.value.trim().toLowerCase();

  // Update URL parameters based on search
  const searchParams = new URLSearchParams();
  if (id) searchParams.set("name", id);
  if (type) searchParams.set("type", type);
  if (ability) searchParams.set("ability", ability);
  history.replaceState(null, "", "?" + searchParams.toString());

  // Save search to localStorage
  localStorage.setItem("lastSearch", JSON.stringify({ id, type, ability }));

  // Build API query string
  let queryParts = [];
  if (id) queryParts.push(`name:${id}`);
  if (type) queryParts.push(`types:${type}`);
  if (ability) queryParts.push(`abilities.name:${ability}`);
  const query = queryParts.join(" ");

  // Show loader and fetch data
  loader.style.display = "block";
  results.innerHTML = "";

  fetch(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`, {
    headers: { "X-Api-Key": apiKey }
  })
    .then(res => res.json())
    .then(json => {
      displayResults(json.data); // Show results
    })
    .catch(err => {
      results.innerHTML = "<p>Error loading Pokémon data.</p>";
      console.error(err);
    })
    .finally(() => {
      loader.style.display = "none"; // Hide loader
    });
}

// Display search results as cards
function displayResults(cards) {
  if (!cards.length) {
    results.innerHTML = `<p class="no-results">No Pokémon found matching your search.</p>`;
    return;
  }

  results.innerHTML = cards.map(card => `
    <div class="pokemon-card">
      <img src="${card.images.small}" alt="${card.name}">
      <h3>${card.name}</h3>
      <p><strong>Type:</strong> ${card.types?.join(", ") || "N/A"}</p>
      <p><strong>Ability:</strong> ${card.abilities?.map(a => a.name).join(", ") || "None"}</p>
      <p><strong>ID:</strong> ${card.id}</p>
      <button class="add-fav-btn" onclick='addToFavorites(${JSON.stringify(card).replace(/'/g, "&apos;")})'>Add to Favorites</button>
    </div>
  `).join("");
}

// Save selected Pokémon card to localStorage favorites
function addToFavorites(card) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.find(p => p.id === card.id)) {
    alert(`${card.name} is already in your favorites.`);
    return;
  }

  favorites.push(card);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`${card.name} has been added to your favorites.`);
}

// Show favorite cards (optional preview function - unused here)
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  results.innerHTML = "";

  if (!favorites.length) {
    results.innerHTML = "<p>You have no favorite Pokémon yet.</p>";
    return;
  }

  results.innerHTML = favorites.map(card => `
    <div class="pokemon-card">
      <img src="${card.images.small}" alt="${card.name}">
      <h3>${card.name}</h3>
      <p><strong>Type:</strong> ${card.types?.join(", ") || "N/A"}</p>
      <p><strong>Attacks:</strong> ${card.attacks?.map(a => a.name).join(", ") || "None"}</p>
      <p><strong>ID:</strong> ${card.id}</p>
    </div>
  `).join("");
}

// Event listener for the "Surprise Me!" button
document.getElementById("surpriseBtn").addEventListener("click", getRandomPokemon);

// Fetch a random Pokémon card from the API
function getRandomPokemon() {
  loader.style.display = "block"; // Show loader

  const randomOffset = Math.floor(Math.random() * 1000);
  fetch(`https://api.pokemontcg.io/v2/cards?page=${Math.floor(randomOffset / 250) + 1}&pageSize=250`, {
    headers: { "X-Api-Key": apiKey }
  })
  .then(res => res.json())
  .then(json => {
    const cards = json.data;
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    showSurprisePopup(randomCard);
  })
  .catch(err => {
    alert("Could not fetch a random Pokémon. Try again.");
    console.error(err);
  })
  .finally(() => {
    loader.style.display = "none"; // Hide loader
  });
}

// Show popup with random card info
function showSurprisePopup(card) {
  const popup = `
    <div class="popup-overlay" onclick="this.remove()">
      <div class="popup" onclick="event.stopPropagation()">
        <h2>${card.name}</h2>
        <img src="${card.images.large || card.images.small}" alt="${card.name}">
        <p><strong>Type:</strong> ${card.types?.join(", ") || "N/A"}</p>
        <p><strong>Ability:</strong> ${card.abilities?.map(a => a.name).join(", ") || "None"}</p>
        <p><strong>Rarity:</strong> ${card.rarity || "Unknown"}</p>
        <p><strong>Set:</strong> ${card.set?.name || "Unknown"}</p>
        <button onclick="document.querySelector('.popup-overlay').remove()">Close</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", popup);
}
