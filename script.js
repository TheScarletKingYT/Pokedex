const pokedex = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const toggleModeBtn = document.getElementById("toggleMode");
const modal = document.getElementById("modal");
const typeFilter = document.getElementById("typeFilter");
let typeList = [];
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const loadMoreBtn = document.getElementById("loadMore");

let allPokemonList = [];
let loadedPokemon = [];
const batchSize = 50;
let currentIndex = 0;

async function getFullPokemonList() {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=100000`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

async function getPokemonData(url) {
  const res = await fetch(url);
  return await res.json();
}

async function loadNextBatch() {
  const nextBatch = allPokemonList.slice(currentIndex, currentIndex + batchSize);
  const promises = nextBatch.map(p => getPokemonData(p.url));
  const newPokemon = await Promise.all(promises);
  loadedPokemon = [...loadedPokemon, ...newPokemon];
  displayPokemon(searchInput.value);
  currentIndex += batchSize;

  if (currentIndex >= allPokemonList.length) {
    loadMoreBtn.style.display = "none";
  }
}

function createCard(pokemon) {
  const card = document.createElement("div");
  card.classList.add("pokemon-card");

  const img = document.createElement("img");
  img.src = pokemon.sprites.other["official-artwork"].front_default;
  img.alt = pokemon.name;

  const label = document.createElement("p");
  label.textContent = capitalize(pokemon.name);

  card.appendChild(img);
  card.appendChild(label);

  card.addEventListener("click", () => showDetails(pokemon));

  return card;
}

function displayPokemon(filter = "") {
  pokedex.innerHTML = "";
  loadedPokemon
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(pokemon => {
      pokedex.appendChild(createCard(pokemon));
    });
}

function showDetails(pokemon) {
  const types = pokemon.types.map(t => capitalize(t.type.name)).join(", ");
  const abilities = pokemon.abilities.map(a => capitalize(a.ability.name)).join(", ");
  const stats = pokemon.stats.map(s => `${capitalize(s.stat.name)}: ${s.base_stat}`).join("<br>");
  const moves = pokemon.moves.slice(0, 10).map(m => capitalize(m.move.name)).join(", ");

  modalBody.innerHTML = `
    <h2>${capitalize(pokemon.name)} (ID: ${pokemon.id})</h2>
    <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}" style="width:150px;"/>
    <p><strong>Type:</strong> ${types}</p>
    <p><strong>Abilities:</strong> ${abilities}</p>
    <p><strong>Base Stats:</strong><br>${stats}</p>
    <p><strong>Moves:</strong> ${moves}...</p>
  `;
  modal.classList.remove("hidden");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

searchInput.addEventListener("input", () => {
  displayPokemon(searchInput.value);
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

window.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add("hidden");
});

loadMoreBtn.addEventListener("click", () => {
  loadNextBatch();
});

async function init() {
  allPokemonList = await getFullPokemonList();
  await loadNextBatch();
}

init();
