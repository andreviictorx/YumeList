let searchInput = document.getElementById('searchInput');
const buttonSearch = document.getElementById('searchBtn');
const result = document.getElementById('result');
const favoriteList = document.getElementById('favoriteList');
const favoritesBtn = document.getElementById('favoritesBtn');

let animesFavorits = JSON.parse(localStorage.getItem('favorites') ) ?? [];
let animeCurrent = null;
const visibleAnime = false;


buttonSearch.addEventListener('click', searchAnime)
favoritesBtn.addEventListener('click',showFavoritsList)

async function searchAnime(anime){
let query = searchInput.value.trim().toLowerCase();
if(!query){
    alert('Digite um anime')
    return
};

result.innerHTML = 'Carregando...';
favoriteList.style.display = 'none';
const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`)
const dados = await response.json();
if(dados.data && dados.data.length > 0){
    animeCurrent = dados.data[0]
    showAnimeCard(dados.data[0])
}else{
    result.innerHTML = 'Nenhum anime encontrado para essa busca'
}
}


function showAnimeCard(anime) {
result.innerHTML = '';
const imgAnime = document.createElement('img');
imgAnime.src = anime.images.jpg.image_url;
const tituloAnime = document.createElement('h1');
tituloAnime.textContent = anime.title;
const paragrafoAnime = document.createElement('p');
paragrafoAnime.textContent = anime.synopsis;
const anoLancamento = document.createElement('strong');
anoLancamento.textContent = "Ano: " + (anime.year ?? "Desconhecido");

const score = document.createElement('p');
score.textContent = "Nota: " + (anime.score ?? "N/A");

const buttonFav = document.createElement('button');
buttonFav.textContent = '♥';
buttonFav.classList.add('heart-btn');
buttonFav.addEventListener('click', () => toggleFavorite(anime)); 


const titleContainer = document.createElement('div');
titleContainer.classList.add('title-row');
titleContainer.append(tituloAnime, buttonFav);


const divInfo = document.createElement('div');
divInfo.classList.add('anime-info');
divInfo.append(titleContainer, anoLancamento, score, paragrafoAnime);

const divContainer = document.createElement('div');
divContainer.classList.add('anime-card');
divContainer.append(imgAnime, divInfo);


result.appendChild(divContainer);

animeCurrent = anime; 
updateHeartBtn();
}

function toggleFavorite(anime){
const isFavorite = animesFavorits.some(fav => fav.mal_id === anime.mal_id)
if(isFavorite){
    const index = animesFavorits.findIndex(fav => fav.mal_id === anime.mal_id);
    animesFavorits.splice(index,1);
    showToast(`"${anime.title}" removido dos favoritos`);
}else{
    animesFavorits.push(anime);
    showToast(`"${anime.title}" adicionado aos favoritos`);
}
localStorage.setItem('favorites', JSON.stringify(animesFavorits));
updateHeartBtn();
}

function updateHeartBtn(){
const button = document.querySelector('.heart-btn');
if(!button || !animeCurrent) return;
const isFavorite = animesFavorits.some(fav => animeCurrent.mal_id === fav.mal_id)
if(isFavorite){
    button.classList.add('favorited')
}else{
        button.classList.remove('favorited')
}
}


function showFavoritsList() {
const favoritesContainer = document.getElementById('favoriteList');
favoritesContainer.innerHTML = '';
result.innerHTML = '';
favoritesContainer.style.display = 'block';

if (animesFavorits.length === 0) {
favoritesContainer.textContent = 'Você ainda não favoritou nenhum anime.';
return;
}

const cardsHTML = animesFavorits.map(anime => `
<div class="anime-card">
<img src="${anime.images.jpg.image_url}" alt="${anime.title}">
<div class="anime-info">
    <div class="title-remove-row">
    <h2>${anime.title}</h2>
    <button class="remove-fav-btn" data-id="${anime.mal_id}">❌</button>
    </div>
    <p><strong>Ano:</strong> ${anime.year ?? 'Desconhecido'}</p>
    <p><strong>Nota:</strong> ${anime.score ?? 'N/A'}</p>
    <p>${anime.synopsis}</p>
</div>
</div>
`).join('');


favoritesContainer.innerHTML = cardsHTML;

const removeButtons = favoritesContainer.querySelectorAll('.remove-fav-btn');
removeButtons.forEach(button => {
button.addEventListener('click', () => {
    const malId = parseInt(button.getAttribute('data-id'));
    removeFromFavorites(malId);
});
});
}

function removeFromFavorites(malId) {
const index = animesFavorits.findIndex(anime => anime.mal_id === malId);
if (index !== -1) {
const removedAnime = animesFavorits[index];
animesFavorits.splice(index, 1);
localStorage.setItem('favorites', JSON.stringify(animesFavorits));
showFavoritsList();
showToast(`"${removedAnime.title}" removido dos favoritos`);
}
}



function showToast(message) {
const toast = document.getElementById('toast');
toast.textContent = message;
toast.classList.add('show');

setTimeout(() => {
toast.classList.remove('show');
}, 3000); 
}
