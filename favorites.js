// When the page loads, display the favorite cards
document.addEventListener("DOMContentLoaded", showFavorites);

// Render the favorite Pokémon cards from localStorage
function showFavorites() {
  const container = document.getElementById("favorites");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Update the count of favorites on the page
  document.getElementById("favorites-count").textContent = `You have ${favorites.length} favorite Pokémon.`;

  // If there are no favorites, show a message
  if (favorites.length === 0) {
    container.innerHTML = `<p class="no-results">You have no favorite Pokémon.</p>`;
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.minHeight = "200px";
    return;
  }

  // Display all favorite Pokémon as cards
  container.innerHTML = favorites.map(card => `
    <div class="pokemon-card">
      <img src="${card.images.small}" alt="${card.name}" />
      <h3>${card.name}</h3>
      <p><strong>Type:</strong> ${card.types?.join(", ") || "N/A"}</p>
      <p><strong>Ability:</strong> ${card.abilities?.map(a => a.name).join(", ") || "None"}</p>
      <p><strong>ID:</strong> ${card.id}</p>
      <button class="remove" onclick='removeFromFavorites("${card.id}")'>Remove from Favorites</button>
      <button class="info-btn" onclick='showMoreInfo(${JSON.stringify(card).replace(/'/g, "&apos;")})'>More Info</button>
    </div>
  `).join("");
}

// Remove a Pokémon from the favorites list
function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Find the removed card (for alert)
  const removed = favorites.find(p => p.id === id);

  // Filter out the removed card
  favorites = favorites.filter(p => p.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));

  if (removed) {
    alert(`${removed.name} has been removed from your favorites.`);
  }

  showFavorites(); // Refresh the display
}

// Navigate back to search page and restore previous search parameters
function goBack() {
  const lastSearch = JSON.parse(localStorage.getItem("lastSearch"));
  if (lastSearch) {
    const params = new URLSearchParams();
    if (lastSearch.id) params.set("name", lastSearch.id);
    if (lastSearch.type) params.set("type", lastSearch.type);
    if (lastSearch.ability) params.set("ability", lastSearch.ability);
    window.location.href = `index.html?${params.toString()}`;
  } else {
    window.location.href = "index.html";
  }
}

// Download the current favorites list as a JSON file
function downloadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "favorites.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Sort the favorites list based on user selection (name or ID)
function sortFavorites(by) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (by === "name") {
    favorites.sort((a, b) => a.name.localeCompare(b.name));
  } else if (by === "id") {
    favorites.sort((a, b) => a.id.localeCompare(b.id));
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavorites(); // Refresh with sorted list
}

// Show detailed info about a specific card in a popup window
function showMoreInfo(card) {
  const extraInfo = `
    <div class="popup-overlay" onclick="this.remove()">
      <div class="popup" onclick="event.stopPropagation()">
        <h2>${card.name}</h2>
        <img src="${card.images.large || card.images.small}" alt="${card.name}" />
        <p><strong>Rarity:</strong> ${card.rarity || "Unknown"}</p>
        <p><strong>Set:</strong> ${card.set?.name || "Unknown"}</p>
        <p><strong>Flavor Text:</strong> ${card.flavorText || "N/A"}</p>
        <p><strong>Evolves To:</strong> ${card.evolvesTo?.join(", ") || "N/A"}</p>
        <button class="popup-close-btn" onclick="document.querySelector('.popup-overlay').remove()">Close</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", extraInfo);
}
