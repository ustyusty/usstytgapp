// Telegram Web App API
const tg = window.Telegram.WebApp;

// Коллекция картинок - локальные и онлайн
const images = [
    // Локальные фото (добавь свои файлы в папку images/)
    {
        url: "images/photo1.png",
        type: "local"
    },
    {
        url: "images/photo2.png", 
        type: "local"
    },
    {
        url: "images/photo3.png",
        type: "local"
    },
    {
        url: "images/photo4.png",
        type: "local"
    }
];

// Глобальные переменные
let currentIndex = 0;
let isLoading = false;

// DOM элементы
const galleryImage = document.getElementById('galleryImage');
const imageTitle = document.getElementById('imageTitle');
const currentCounter = document.getElementById('current');
const totalCounter = document.getElementById('total');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sourceIndicator = document.getElementById('sourceIndicator');

// Инициализация Telegram Web App
function initTelegram() {
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Кнопка "Поделиться"
    tg.MainButton.setText("📤 Поделиться").show();
    tg.MainButton.onClick(shareCurrentImage);
    
    // Адаптация под тему
    if (tg.colorScheme === 'dark') {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1c1c1c');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    }
}

// Инициализация галереи
function initGallery() {
    totalCounter.textContent = images.length;
    
    // Назначаем обработчики кнопок
    prevBtn.addEventListener('click', previousImage);
    nextBtn.addEventListener('click', nextImage);
    
    // Загружаем первую картинку
    updateImage();
    updateButtons();
    
    // Инициализируем свайпы и клавиатуру
    initSwipe();
    initKeyboard();
}

// Обновление отображаемой картинки
function updateImage() {
    if (isLoading) return;
    
    const image = images[currentIndex];
    isLoading = true;
    
    // Показываем индикатор загрузки
    showLoader();
    
    // Обновляем информацию
    imageTitle.textContent = image.title;
    currentCounter.textContent = currentIndex + 1;
    updateSourceIndicator(image.type);
    
    // Предзагрузка картинки
    const img = new Image();
    img.onload = function() {
        // Анимация смены картинки
        galleryImage.style.opacity = '0';
        
        setTimeout(() => {
            galleryImage.src = image.url;
            galleryImage.alt = image.title;
            
            // Скрываем loader и показываем картинку
            hideLoader();
            galleryImage.style.opacity = '1';
            galleryImage.classList.add('slide-in');
            
            setTimeout(() => {
                galleryImage.classList.remove('slide-in');
                isLoading = false;
            }, 300);
        }, 150);
    };
    
    img.onerror = function() {
        // Если картинка не загрузилась
        hideLoader();
        imageTitle.textContent = '❌ Ошибка загрузки';
        galleryImage.src = '';
        isLoading = false;
        
        // Показываем сообщение об ошибке для локальных файлов
        if (image.type === 'local') {
            tg.showPopup({
                title: "Файл не найден",
                message: `Добавь файл ${image.url} в папку images/`,
                buttons: [{ type: "ok" }]
            });
        }
    };
    
    img.src = image.url;
}

// Показать индикатор загрузки
function showLoader() {
    if (!document.querySelector('.loader')) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        document.querySelector('.image-wrapper').appendChild(loader);
    }
    galleryImage.classList.add('loading');
}

// Скрыть индикатор загрузки
function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
    galleryImage.classList.remove('loading');
}

// Обновление индикатора источника
function updateSourceIndicator(type) {
    if (type === 'local') {
        sourceIndicator.textContent = '📁 Локальный файл';
        sourceIndicator.style.background = '#e3f2fd';
    } else {
        sourceIndicator.textContent = '🌐 Онлайн фото';
        sourceIndicator.style.background = '#f3e5f5';
    }
}

// Обновление состояния кнопок
function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === images.length - 1;
}

// Следующая картинка
function nextImage() {
    if (currentIndex < images.length - 1 && !isLoading) {
        currentIndex++;
        updateImage();
        updateButtons();
    }
}

// Предыдущая картинка
function previousImage() {
    if (currentIndex > 0 && !isLoading) {
        currentIndex--;
        updateImage();
        updateButtons();
    }
}

// Инициализация свайпов
function initSwipe() {
    let startX = 0;
    let endX = 0;

    galleryImage.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    galleryImage.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        if (isLoading) return;
        
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextImage();
            } else {
                previousImage();
            }
        }
    }
}

// Инициализация клавиатуры
function initKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (isLoading) return;
        
        if (e.key === 'ArrowLeft') {
            previousImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    });
}

// Поделиться картинкой
function shareCurrentImage() {
    const currentImage = images[currentIndex];
    tg.showPopup({
        title: "Поделиться",
        message: `Поделиться "${currentImage.title}"?`,
        buttons: [
            { type: "default", text: "Отмена" },
            { 
                type: "ok", 
                text: "Поделиться",
                onClick: () => {
                    tg.sendData(JSON.stringify({
                        action: "share_image",
                        image_url: currentImage.url,
                        image_title: currentImage.title,
                        image_type: currentImage.type
                    }));
                }
            }
        ]
    });
}

// Загрузка пользовательских фото
function loadCustomImages() {
    // Здесь можно добавить логику загрузки фото от пользователя
    console.log("Функция загрузки пользовательских фото");
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    initTelegram();
    initGallery();
    loadCustomImages();
});