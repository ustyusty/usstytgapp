// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Расширяем на весь экран
tg.expand();

// Включаем основную кнопку
tg.MainButton.setText("Сохранить").show();

// Функции приложения
function showUserInfo() {
    const user = tg.initDataUnsafe.user;
    const output = document.getElementById('output');
    
    output.innerHTML = `
        <h3>Информация о пользователе:</h3>
        <p>ID: ${user?.id || 'Неизвестно'}</p>
        <p>Имя: ${user?.first_name || 'Неизвестно'}</p>
        <p>Фамилия: ${user?.last_name || ''}</p>
        <p>Username: @${user?.username || 'Неизвестно'}</p>
    `;
}

function sendData() {
    tg.showPopup({
        title: "Отправка",
        message: "Данные отправлены боту!",
        buttons: [{ type: "ok" }]
    });
}

// Обработчик основной кнопки
tg.MainButton.onClick(() => {
    tg.sendData(JSON.stringify({
        action: "save",
        timestamp: new Date().toISOString(),
        user_id: tg.initDataUnsafe.user?.id
    }));
});

// Адаптация под тему Telegram
document.body.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.body.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
