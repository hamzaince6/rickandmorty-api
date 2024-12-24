// DOM Elements
const charactersContainer = document.getElementById('characters');
const loadingElement = document.getElementById('loading');
const paginationContainer = document.getElementById('pagination');
const carouselWrapper = document.getElementById('carousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotButtons = document.querySelectorAll('.carousel-container button[data-index]');

// State
let currentPage = 1;
let totalPages = 1;

// Utility Functions
const showLoading = () => {
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.classList.add('active');
    }
};

const hideLoading = () => {
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.classList.remove('active');
    }
};

const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'alive': return 'status-alive';
        case 'dead': return 'status-dead';
        default: return 'status-unknown';
    }
};

// Render Functions
const createCharacterCard = (character) => {
    const card = document.createElement('div');
    card.className = 'character-card';
    
    // Kartı görünmez yap
    gsap.set(card, {
        opacity: 0,
        y: 100
    });

    card.innerHTML = `
        <div class="card-image">
            <img src="${character.image}" alt="${character.name}">
            <div class="card-overlay">
                <div class="card-content">
                    <h3>${character.name}</h3>
                    <div class="card-status">
                        <span class="status-indicator ${character.status.toLowerCase()}"></span>
                        <span>${character.status} - ${character.species}</span>
                    </div>
                    <div class="card-info">
                        <div class="info-item">
                            <span class="info-label">Last known location:</span>
                            <span class="info-value">${character.location.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Origin:</span>
                            <span class="info-value">${character.origin.name}</span>
                        </div>
                    </div>
                    <button class="view-details-btn">View Full Details</button>
                </div>
            </div>
        </div>
    `;

    // Card click listener for mobile
    card.addEventListener('click', (e) => {
        // If the click was on the view details button, open popup
        if (e.target.classList.contains('view-details-btn')) {
            e.stopPropagation();
            openCharacterPopup(character);
            return;
        }

        // Toggle active class for overlay
        const overlay = card.querySelector('.card-overlay');
        
        // Remove active class from all other cards
        document.querySelectorAll('.character-card .card-overlay.active').forEach(el => {
            if (el !== overlay) {
                el.classList.remove('active');
            }
        });

        // Toggle current card's overlay
        overlay.classList.toggle('active');
    });

    // Kartı grid'e ekle
    document.querySelector('.bento-grid').appendChild(card);

    // Kartı animate et
    gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 1, // Animasyon süresi 1 saniye
        delay: document.querySelectorAll('.character-card').length * 0.2, // Kartlar arası gecikme 0.2 saniye
        ease: "power2.out"
    });

    return card;
};

// GSAP Animations
function animateCards() {
    const cards = document.querySelectorAll('.character-card');
    if (cards.length === 0) return;

    // Önce tüm kartları gizle ve opacity'yi 0 yap
    gsap.set(cards, { 
        opacity: 0,
        y: 100
    });

    // Kartları sırayla animate et
    gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: {
            each: 0.2,
            from: "start"
        },
        ease: "power2.out"
    });
}

// Main Functions
const fetchAndRenderCharacters = async () => {
    try {
        showLoading();
        const data = await RickAndMortyAPI.getCharacters(currentPage);
        totalPages = data.info.pages;
        renderCharacters(data.results);
        renderPagination();
    } catch (error) {
        console.error('Error:', error);
        charactersContainer.innerHTML = '<p class="text-red-500">Error loading characters. Please try again later.</p>';
    } finally {
        hideLoading();
    }
};

// Initialize Swiper
async function initSwiper() {
    try {
        // Bu alan random yapılmadı ilk 5 karakter çekildi
        const response = await fetch('https://rickandmortyapi.com/api/character/1,2,3,4,5');
        const characters = await response.json();

        // Get swiper wrapper
        const swiperWrapper = document.querySelector('.swiper-wrapper');

        // Create slides
        characters.forEach(character => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <img src="${character.image}" alt="${character.name}">
                <div class="slide-content">
                    <h3 class="text-3xl font-bold mb-3">${character.name}</h3>
                    <p class="text-lg">Status: ${character.status}</p>
                    <p class="text-lg">Species: ${character.species}</p>
                    <p class="text-lg">Location: ${character.location.name}</p>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });

        // Initialize Swiper
        new Swiper('.swiper-container', {
            loop: true,
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                renderBullet: function (index, className) {
                    return '<span class="' + className + '"></span>';
                }
            }
        });

    } catch (error) {
        console.error('Error initializing swiper:', error);
    }
}

// Portal Animation
const initPortalAnimation = () => {
    const portalHover = gsap.timeline({ paused: true });
    portalHover.to(".portal-outer", { duration: 0.3, fill: "#2ecc71", ease: "power1.inOut" })
               .to(".portal-inner", { duration: 0.3, fill: "#3498db", ease: "power1.inOut" }, 0)
               .to(".portal-swirl", { duration: 0.3, fill: "#e74c3c", rotation: 180, transformOrigin: "center", ease: "power1.inOut" }, 0);

    document.getElementById("portal-icon").addEventListener("mouseenter", () => portalHover.play());
    document.getElementById("portal-icon").addEventListener("mouseleave", () => portalHover.reverse());
};

// Rastgele 12 karakter çekme ve grid oluşturma
async function fetchRandomCharacters() {
    try {
        const totalCharacters = 826; // Rick and Morty API'deki toplam karakter sayısı
        const randomIds = new Set();
        
        // 12 benzersiz rastgele ID oluştur
        while(randomIds.size < 12) {
            randomIds.add(Math.floor(Math.random() * totalCharacters) + 1);
        }

        const response = await fetch(`https://rickandmortyapi.com/api/character/${Array.from(randomIds)}`);
        const characters = await response.json();

        const bentoGrid = document.querySelector('.bento-grid');
        bentoGrid.innerHTML = ''; // Grid'i temizle

        characters.forEach(character => {
            const card = createCharacterCard(character);
            // bentoGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
}

// Karakter kartı oluşturma
function createCharacterCardForGrid(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${character.image}" alt="${character.name}">
        </div>
        <div class="card-content">
            <h3>${character.name}</h3>
            <div class="card-info">
                <p>${character.status} - ${character.species}</p>
                <p>Location: ${character.location.name}</p>
            </div>
        </div>
    `;

    // Karta tıklandığında popup'ı aç
    card.addEventListener('click', () => openCharacterPopup(character));
    
    return card;
}

// Popup işlemleri
let characterSlider;

const closePopup = () => {
    const popup = document.getElementById('characterPopup');
    if (popup) {
        popup.classList.remove('active');
        
        // Tüm kartların overlay'lerini kapat
        document.querySelectorAll('.character-card .card-overlay.active').forEach(overlay => {
            overlay.classList.remove('active');
        });

        // Slider'ı temizle
        if (characterSlider) {
            characterSlider.destroy();
            characterSlider = null;
        }
    }
};

const openCharacterPopup = async (character) => {
    const popup = document.getElementById('characterPopup');
    if (!popup) return;

    const popupContent = popup.querySelector('.popup-content');
    if (!popupContent) return;

    try {
        // Popup'ı göster
        popup.classList.add('active');

        // Loading state
        const episodesGrid = popupContent.querySelector('.episodes-grid');
        if (episodesGrid) {
            episodesGrid.innerHTML = '<div class="loading-text">Loading episodes...</div>';
        }

        // Karakter bilgilerini güncelle
        const nameElement = popupContent.querySelector('.character-name');
        if (nameElement) nameElement.textContent = character.name;

        const statusElement = popupContent.querySelector('.status-species');
        if (statusElement) {
            statusElement.innerHTML = `
                <span class="status-indicator ${character.status.toLowerCase()}"></span>
                <span>${character.status} - ${character.species}</span>
            `;
        }

        const locationElement = popupContent.querySelector('.location');
        if (locationElement) locationElement.textContent = character.location.name;

        const originElement = popupContent.querySelector('.origin');
        if (originElement) originElement.textContent = character.origin.name;

        // İlk bölüm bilgisini al
        if (character.episode && character.episode.length > 0) {
            const firstEpisodeResponse = await fetch(character.episode[0]);
            const firstEpisodeData = await firstEpisodeResponse.json();
            const firstSeenElement = popupContent.querySelector('.first-seen');
            if (firstSeenElement) {
                firstSeenElement.textContent = firstEpisodeData.name;
            }
        }

        // Episodes Grid
        if (episodesGrid && character.episode) {
            try {
                const episodePromises = character.episode.map(url => fetch(url).then(res => res.json()));
                const episodes = await Promise.all(episodePromises);

                // Clear loading text
                episodesGrid.innerHTML = '';

                episodes.forEach((episode, index) => {
                    const episodeElement = document.createElement('div');
                    episodeElement.className = 'episode-item';
                    episodeElement.innerHTML = `
                        <div class="episode-name">${episode.name}</div>
                        <div class="episode-code">${episode.episode}</div>
                    `;
                    episodesGrid.appendChild(episodeElement);

                    // Fade-in animasyonu
                    gsap.from(episodeElement, {
                        opacity: 0,
                        y: 20,
                        duration: 0.5,
                        delay: index * 0.1
                    });
                });
            } catch (error) {
                console.error('Error fetching episodes:', error);
                episodesGrid.innerHTML = '<div class="error-message">Failed to load episodes</div>';
            }
        }

        // Slider işlemleri
        const sliderList = popup.querySelector('.splide__list');
        if (sliderList) {
            sliderList.innerHTML = '';
            
            // Ana görsel
            const mainSlide = document.createElement('li');
            mainSlide.className = 'splide__slide';
            mainSlide.innerHTML = `<img src="${character.image}" alt="${character.name}">`;
            sliderList.appendChild(mainSlide);
            
            // Diğer görseller için herhangi bir sınır koyulmadı kaç adet görsel varsa alıyoruz
            try {
                const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${character.name.split(' ')[0]}`);
                const data = await response.json();
                
                data.results.forEach(similarChar => {
                    if (similarChar.id !== character.id) {
                        const slide = document.createElement('li');
                        slide.className = 'splide__slide';
                        slide.innerHTML = `<img src="${similarChar.image}" alt="${similarChar.name}">`;
                        sliderList.appendChild(slide);
                    }
                });
            } catch (error) {
                console.error('Error fetching similar characters:', error);
            }
        }

        // Slider'ı başlat veya yenile
        if (characterSlider) {
            characterSlider.destroy();
        }
        
        characterSlider = new Splide('.character-slider', {
            type: 'fade',
            rewind: true,
            arrows: false,
            pagination: true,
            autoplay: true,
            interval: 3000,
            pauseOnHover: true,
            classes: {
                pagination: 'splide__pagination character-pagination',
            }
        }).mount();

    } catch (error) {
        console.error('Error in openCharacterPopup:', error);
    }
};

// Popup Kapatma İşlevleri
document.addEventListener('DOMContentLoaded', () => {
    // Popup kapatma olayları
    const popup = document.getElementById('characterPopup');
    const closeBtn = document.querySelector('.close-popup');

    // X butonuna tıklama
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closePopup();
        });
    }

    // Popup dışına tıklama
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target.id === 'characterPopup') {
                closePopup();
            }
        });
    }

    // ESC tuşu ile kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePopup();
        }
    });


    initSwiper();
    initPortalAnimation();
    fetchAndRenderCharacters();
    fetchRandomCharacters();
    animateCards();
});
