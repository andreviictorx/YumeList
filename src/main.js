let searchInput = document.getElementById('searchInput');
const buttonSearch = document.getElementById('searchBtn');
const result = document.getElementById('result');
const favoriteList = document.getElementById('favoriteList');
const favoritesBtn = document.getElementById('favoritesBtn');
const toast = document.getElementById('toast');
const loadingIndicator = document.getElementById('loadingIndicator'); // Pega o novo elemento de loading

let animesFavorits = JSON.parse(localStorage.getItem('favorites')) ?? [];
let animeCurrent = null;

buttonSearch.addEventListener('click', searchAnime);
favoritesBtn.addEventListener('click', showFavoritsList);

async function searchAnime() {
    let query = searchInput.value.trim();
    if (!query) {
        showToast('Por favor, digite o nome de um anime.', 'bg-secondary-accent');
        return;
    }

    result.innerHTML = ''; // Limpa os resultados anteriores
    favoriteList.style.display = 'none'; // Esconde a lista de favoritos
    favoriteList.innerHTML = '';

    loadingIndicator.classList.remove('hidden'); // MOSTRA o loading
    loadingIndicator.classList.add('flex'); // Garante que o flex seja aplicado

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            animeCurrent = data.data[0];
            showAnimeCard(animeCurrent);
        } else {
            result.innerHTML = '<p class="text-center text-muted-text text-lg italic mt-8">Nenhum anime encontrado para essa busca. Tente outro nome!</p>';
            animeCurrent = null;
        }
    } catch (error) {
        console.error('Erro ao buscar anime:', error);
        result.innerHTML = '<p class="text-center text-secondary-accent text-lg italic mt-8">Ocorreu um erro ao buscar o anime. Tente novamente mais tarde.</p>';
        animeCurrent = null;
    } finally {
        loadingIndicator.classList.add('hidden'); // ESCONDE o loading, sempre ao final
        loadingIndicator.classList.remove('flex');
    }
}

function showAnimeCard(anime) {
    result.innerHTML = '';

    const divContainer = document.createElement('div');
    divContainer.className = `
        bg-card-bg rounded-xl shadow-bold-dark overflow-hidden
        p-6 sm:p-8
        flex flex-col md:flex-row items-center md:items-start gap-8
        transform transition-transform duration-300 hover:scale-[1.01] border border-accent-vibrant/30
    `;

    const imgAnime = document.createElement('img');
    imgAnime.src = anime.images.jpg.image_url;
    imgAnime.alt = anime.title;
    imgAnime.className = `
        w-48 h-64 sm:w-64 sm:h-80 object-cover rounded-lg shadow-md
        flex-shrink-0 border border-accent-vibrant/20
    `;

    const divInfo = document.createElement('div');
    divInfo.className = `
        flex-1 flex flex-col justify-center
        text-center md:text-left
    `;

    const tituloAnime = document.createElement('h1');
    tituloAnime.textContent = anime.title;
    tituloAnime.className = `
        font-heading text-3xl sm:text-4xl font-bold text-accent-vibrant mb-3
    `;

    const buttonFav = document.createElement('button');
    buttonFav.textContent = '♥';
    buttonFav.className = `
        heart-btn text-4xl cursor-pointer select-none transition-colors duration-500 ease-out
        ${animesFavorits.some(fav => fav.mal_id === anime.mal_id) ? 'text-secondary-accent' : 'text-muted-text hover:text-secondary-accent'}
        bg-transparent border-none p-0 ml-3 focus:outline-none
    `;
    buttonFav.addEventListener('click', () => toggleFavorite(anime));

    const titleContainer = document.createElement('div');
    titleContainer.className = `
        flex items-center justify-center md:justify-start mb-3
    `;
    titleContainer.append(tituloAnime, buttonFav);

    const anoLancamento = document.createElement('p');
    anoLancamento.textContent = "Ano: " + (anime.year ?? "N/A");
    anoLancamento.className = `
        font-body text-light-text text-base sm:text-lg font-semibold mb-1
    `;

    const score = document.createElement('p');
    score.textContent = "Nota: " + (anime.score ?? "N/A");
    score.className = `
        font-body text-light-text text-base sm:text-lg font-semibold mb-3
    `;

    const paragrafoAnime = document.createElement('p');
    paragrafoAnime.textContent = anime.synopsis ?? 'Sinopse não disponível.';
    paragrafoAnime.className = `
        font-body text-light-text text-sm sm:text-base leading-relaxed text-justify
        max-h-48 overflow-y-auto pr-2
    `;

    divInfo.append(titleContainer, anoLancamento, score, paragrafoAnime);
    divContainer.append(imgAnime, divInfo);
    result.appendChild(divContainer);

    animeCurrent = anime;
}

function toggleFavorite(anime) {
    const isFavorite = animesFavorits.some(fav => fav.mal_id === anime.mal_id);
    if (isFavorite) {
        const index = animesFavorits.findIndex(fav => fav.mal_id === anime.mal_id);
        animesFavorits.splice(index, 1);
        showToast(`"${anime.title}" removido dos favoritos.`, 'bg-secondary-accent');
    } else {
        animesFavorits.push(anime);
        showToast(`"${anime.title}" adicionado aos favoritos!`, 'bg-accent-vibrant');
    }
    localStorage.setItem('favorites', JSON.stringify(animesFavorits));

    if (animeCurrent && animeCurrent.mal_id === anime.mal_id) {
        updateHeartBtn();
    }
    if (favoriteList.style.display !== 'none') {
        showFavoritsList();
    }
}

function updateHeartBtn() {
    const button = document.querySelector('.heart-btn');
    if (!button || !animeCurrent) return;

    const isFavorite = animesFavorits.some(fav => animeCurrent.mal_id === fav.mal_id);
    if (isFavorite) {
        button.classList.add('text-secondary-accent');
        button.classList.remove('text-muted-text', 'hover:text-secondary-accent');
    } else {
        button.classList.remove('text-secondary-accent');
        button.classList.add('text-muted-text', 'hover:text-secondary-accent');
    }
}

function showFavoritsList() {
    const favoritesContainer = document.getElementById('favoriteList');
    favoritesContainer.innerHTML = '';
    result.innerHTML = '';
    favoritesContainer.style.display = 'grid';

    // Esconde o loading caso esteja visível de uma busca anterior
    loadingIndicator.classList.add('hidden');
    loadingIndicator.classList.remove('flex');


    if (animesFavorits.length === 0) {
        favoritesContainer.innerHTML = `
            <p class="text-center text-muted-text text-lg italic mt-8">
                Você ainda não favoritou nenhum anime.
            </p>
        `;
        return;
    }

    const cardsHTML = animesFavorits.map(anime => `
        <div class="
            bg-dark-primary rounded-lg shadow-bold-dark p-4 sm:p-6
            flex flex-col sm:flex-row items-center sm:items-start gap-4
            transition-all duration-300 hover:shadow-bold-light hover:scale-[1.02]
            border border-accent-vibrant/20
        ">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}"
                 class="w-28 h-40 sm:w-24 sm:h-36 object-cover rounded-md shadow-sm flex-shrink-0 border border-accent-vibrant/10">
            
            <div class="flex-1 flex flex-col justify-center text-center sm:text-left">
                <div class="flex items-center justify-between sm:justify-start sm:gap-4 mb-2">
                    <h2 class="font-heading text-xl sm:text-2xl font-bold text-accent-vibrant">${anime.title}</h2>
                    <button class="remove-fav-btn text-secondary-accent text-2xl cursor-pointer transition-transform duration-500 ease-out hover:scale-110 focus:outline-none"
                            data-id="${anime.mal_id}">
                        ❌
                    </button>
                </div>
                
                <div class="flex flex-wrap justify-center sm:justify-start gap-2 mb-2 text-sm text-light-text font-body">
                    <span class="bg-card-bg px-3 py-1 rounded-full text-light-text border border-accent-vibrant/10">Ano: ${anime.year ?? 'N/A'}</span>
                    <span class="bg-card-bg px-3 py-1 rounded-full text-light-text border border-accent-vibrant/10">Nota: ${anime.score ?? 'N/A'}</span>
                </div>
                
                <p class="font-body text-light-text text-sm leading-relaxed
                          max-h-20 sm:max-h-24 overflow-hidden text-ellipsis
                          hidden sm:block">
                    ${anime.synopsis ?? 'Sinopse não disponível.'}
                </p>
            </div>
        </div>
    `).join('');

    favoritesContainer.innerHTML = cardsHTML;

    const removeButtons = favoritesContainer.querySelectorAll('.remove-fav-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
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
        showToast(`"${removedAnime.title}" removido dos favoritos.`, 'bg-secondary-accent');
        showFavoritsList();
    }
}

function showToast(message, bgColor = 'bg-accent-vibrant') {
    toast.className = `fixed bottom-8 right-8 text-white px-6 py-3 rounded-lg shadow-bold-light opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out font-semibold z-50 ${bgColor}`;
    toast.textContent = message;

    toast.classList.add('opacity-100', 'pointer-events-auto');

    setTimeout(() => {
        toast.classList.remove('opacity-100', 'pointer-events-auto');
    }, 3000);
}