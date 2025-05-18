document.addEventListener("DOMContentLoaded", showFavorites);

function showFavorites() {
  const container = document.getElementById("favorites");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  document.getElementById("favorites-count").textContent = `You have ${favorites.length} favorite Pokémon.`;

  if (favorites.length === 0) {
    container.innerHTML = `<p class="no-results">You have no favorite Pokémon.</p>`;
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.minHeight = "200px";
    return;
  }

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

function removeFromFavorites(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const removed=favorites.find(p=> p.id===id);
  favorites = favorites.filter(p => p.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  if (removed){
    alert(`${removed.name} has been removed from your favorites.`)
  }
  showFavorites(); // refresh
}

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

function sortFavorites(by) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (by === "name") {
    favorites.sort((a, b) => a.name.localeCompare(b.name));
  } else if (by === "id") {
    favorites.sort((a, b) => a.id.localeCompare(b.id));
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showFavorites();
}

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
        <button onclick="document.querySelector('.popup-overlay').remove()">Close</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", extraInfo);
}
