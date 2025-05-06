// Получаем данные о продуктах из localStorage или из файла products.json
let products = [];

// Функция для загрузки продуктов
async function loadProductData() {
    try {
        // Проверяем, есть ли сохраненные данные в localStorage
        const savedProducts = localStorage.getItem('productsData');

        if (savedProducts) {
            console.log('Загружаем товары из localStorage (с изменениями из админ-панели)');
            products = JSON.parse(savedProducts);
            renderProductCard(products);
            return;
        }

        // Если нет данных в localStorage, загружаем из products.json напрямую
        console.log('Загружаем товары из файла products.json');

        try {
            // Используем проверенный рабочий путь
            const response = await fetch('./products.json');
            if (response.ok) {
                const originalData = await response.json();
                products = originalData;
                localStorage.setItem('productsData', JSON.stringify(originalData));
                renderProductCard(products);
                console.log('Успешно загружено из: ./products.json');
                return;
            }
        } catch (error) {
            console.error('Ошибка при загрузке products.json:', error);
        }

    } catch (error) {
        console.error('Критическая ошибка при загрузке продуктов:', error);
    }
}
// Язык браузера 
const userLang = (navigator.language || navigator.userLanguage).slice(0, 2)
console.log(userLang)
let supportLanguage = ['en', 'ru', 'lt']

let translations;
async function loadTranslate() {
    try {
        const response = await fetch('./translate.json')
        if (response.ok) {
            translations = await response.json();
            console.log("Файл переводов загружен")
            
            // Сразу применяем переводы после загрузки
            const savedLang = localStorage.getItem('lang');
            currentLang = savedLang && supportLanguage.includes(savedLang) ? savedLang : 
                          supportLanguage.includes(userLang) ? userLang : 'en';
            updateTexts(currentLang);
            
            return translations;
        }
    } catch (error) {
        console.error('Ошибка при загрузке translate.json:', error);
    }
}
loadTranslate()
// Запускаем загрузку товаров при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProductData);

// Язык браузера или установлен пользователем
let currentLang = supportLanguage.includes(userLang) ? userLang : 'en';
console.log(currentLang)

let langButtons = document.querySelectorAll('.language')
langButtons.forEach(function (langButton) {
    langButton.addEventListener('click', function (e) {
        e.preventDefault()
        const selectedLang = langButton.dataset.lang;
        currentLang = selectedLang;
        localStorage.setItem('lang', currentLang)
        updateTexts(currentLang);
        console.log(currentLang)
    })
})
function updateTexts(currentLang){
    // Перевод стандартных текстовых элементов
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Пробуем точное совпадение ключа
        let translation = translations[currentLang]?.[key];
        
        // Если точного совпадения нет, пробуем разные форматы ключа
        if (!translation) {
            // Преобразовываем ключи с точками в формат с точками и наоборот
            const dotKey = key.replace(/\./g, '_').replace(/-/g, '_');
            const dashKey = key.replace(/\./g, '-').replace(/_/g, '-');
            
            // Пробуем различные варианты формата ключа
            translation = translations[currentLang]?.[dotKey] || 
                         translations[currentLang]?.[dashKey] || 
                         translations[currentLang]?.[`${key.split('.')[0]}.${key.split('.')[1]}`] ||
                         translations[currentLang]?.[key.replace('.', '')];
        }
        
        if(translation){
            element.textContent = translation;
        } else {
            console.log(`Отсутствует перевод для ключа: ${key} в языке: ${currentLang}`);
        }
    });
    
    // Перевод атрибутов (placeholder, alt, title и т.д.)
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        const attributesData = element.getAttribute('data-i18n-attr');
        try {
            const attrObj = JSON.parse(attributesData);
            for (let attr in attrObj) {
                const key = attrObj[attr];
                
                // Аналогичная логика поиска перевода для атрибутов
                let translation = translations[currentLang]?.[key];
                
                if (!translation) {
                    const dotKey = key.replace(/\./g, '_').replace(/-/g, '_');
                    const dashKey = key.replace(/\./g, '-').replace(/_/g, '-');
                    
                    translation = translations[currentLang]?.[dotKey] || 
                                 translations[currentLang]?.[dashKey] || 
                                 translations[currentLang]?.[`${key.split('.')[0]}.${key.split('.')[1]}`] ||
                                 translations[currentLang]?.[key.replace('.', '')];
                }
                
                if (translation) {
                    element.setAttribute(attr, translation);
                } else {
                    console.log(`Отсутствует перевод для атрибута: ${attr} с ключом: ${key} в языке: ${currentLang}`);
                }
            }
        } catch (e) {
            console.error('Ошибка в формате data-i18n-attr:', attributesData, e);
        }
    });
    
    // Обновляем карточки товаров при смене языка
    renderProductCard(products, catalogProduct.classList.contains("active") ? products.length : 3);
    
    // Обновляем тексты в динамических элементах (корзина)
    if (cart && cart.length > 0) {
        updateCartDisplay();
    }
    
    // Применяем перевод к уведомлениям и другим динамическим элементам
    translateStaticElements();
    
    localStorage.setItem('lang', currentLang);
}

// Функция для перевода статических элементов интерфейса
function translateStaticElements() {
    // Переводим элементы, которые могут быть созданы скриптом
    const translateButtons = {
        '.to_cart': 'product.addToCart',
        '.remove-product': 'cart.itemRemove',
        '#openCheckoutBtn': 'checkout',
        '.close': 'close',
        '.closeDelivery': 'close',
        '.closeCheckout': 'close',
        '.closeContacts': 'close',
        '.closeReviews': 'close'
    };
    
    // Применяем перевод к кнопкам
    for (const selector in translateButtons) {
        const elements = document.querySelectorAll(selector);
        const translationKey = translateButtons[selector];
        
        elements.forEach(element => {
            // Пробуем точное совпадение ключа
            let translation = translations[currentLang]?.[translationKey];
            
            // Если точного совпадения нет, пробуем разные форматы ключа
            if (!translation) {
                // Пробуем ключ без точки
                translation = translations[currentLang]?.[translationKey.replace('.', '')];
            }
            
            if (translation) {
                element.textContent = translation;
            }
        });
    }
    
    // Переводим заголовки модальных окон
    const modalTitles = {
        '#cartModalTitle': 'cart',
        '#deliveryModalTitle': 'delivery.title',
        '#contactsModalTitle': 'contacts.title',
        '#reviewsModalTitle': 'reviews',
        '#checkoutModalTitle': 'checkout.title'
    };
    
    for (const selector in modalTitles) {
        const element = document.querySelector(selector);
        if (element) {
            // Пробуем точное совпадение ключа
            let translation = translations[currentLang]?.[modalTitles[selector]];
            
            // Если точного совпадения нет, пробуем разные форматы ключа
            if (!translation) {
                // Пробуем ключ без точки
                translation = translations[currentLang]?.[modalTitles[selector].replace('.', '')];
            }
            
            if (translation) {
                element.textContent = translation;
            }
        }
    }
    
    // Переводим текст уведомлений
    const notificationMessages = {
        'Товар добавлен в корзину': 'notification.added',
        'Товар уже в корзине': 'notification.already',
        'Корзина пуста': 'notification.empty',
        'Заказ успешно оформлен': 'notification.orderPlaced',
        'Заказ успешно сохранен': 'notification.orderSaved'
    };
    
    // Обновляем переменную с сообщением в функции showNotification
    if (message && notificationMessages[message]) {
        const translationKey = notificationMessages[message];
        const translation = translations[currentLang]?.[translationKey] || 
                           translations[currentLang]?.[translationKey.replace('.', '')];
        
        if (translation) {
            message = translation;
        }
    }
}

// Корзина
let cart = [];

// Функция для создания карточки товара с поддержкой перевода
function createProductCard(product) {
    // Проверка товара в наличии
    const isOutOfStoke = product.inStock === false;

    // Используем только то изображение, которое есть у продукта
    const imagePath = product.image || '';
    
    // Получаем локализованные строки для динамического контента
    // Используем язык из currentLang
    const productName = product.name[currentLang] || product.name['ru'] || product.name; // Если нет перевода, используем русский или оригинал
    const productDescription = product.description[currentLang] || product.description['ru'] || product.description;
    
    let toCartText = translations?.[currentLang]?.['product.addToCart'] || 
                    translations?.[currentLang]?.['productaddToCart'] || 
                    'В корзину';
                    
    let outOfStockText = translations?.[currentLang]?.['product.outOfStock'] || 
                         translations?.[currentLang]?.['productoutOfStock'] || 
                         'Нет в наличии';
    
    return `
    <div class="product ${isOutOfStoke ? 'out-of-stock' : ''}">
     <div class="product-image">
     <img src="${imagePath}" alt="${productName}"
     class="${isOutOfStoke ? 'black-and-white' : ''}">
     <div class="product-overlay">
     ${!isOutOfStoke ? `<button class="to_cart"
        onclick="addToCart(${product.id})">${toCartText}</button>` : ''}
        </div>
     </div>
     <div class="product-info">
     <h2 class="product_title">${productName}</h2>
     <p class="about_product">${!isOutOfStoke ? productDescription : outOfStockText}</p>
     <p class="product_price">${product.price} €</p>
     </div>
    </div>`
}

// Функция для отображения товаров
let catalogProduct = document.querySelector('.catalog_product');
function renderProductCard(productsToRender = products, limit = 3) {
    let galary = document.querySelector('.galary');
    if (!galary) return;
    galary.innerHTML = '';
    if (catalogProduct.classList.contains("active")) {
        productsToRender.forEach(product =>
            galary.innerHTML += createProductCard(product));
    } else {
        productsToRender.slice(0, limit).forEach(product =>
            galary.innerHTML += createProductCard(product));
    }
}

// Отрисовываем карточки товаров
renderProductCard(products);

// Функция добавления в корзину
function addToCart(productId) {
    let product = products.find(p => p.id === productId);
    if (!product) return;
    let cartProduct = cart.find(item => item.id === productId);

    if (cartProduct) {
        showNotification(message = 'Товар уже в корзине');
        cartProduct.quantity += 1;
    } else {
        showNotification(message = 'Товар добавлен в корзину');
        cart.push({
            ...product,
            quantity: 1
        });
    }
    updateCartDisplay();
}

// Функция обновления корзины
function updateCartDisplay() {
    let cartItems = document.querySelector('.cart-items');
    let cartTotalPrice = document.getElementById('cartTotalPrice');

    if (!cartItems || !cartTotalPrice) return;

    cartItems.innerHTML = '';

    let total = 0; // общая сумма покупки 

    // Добавляем товары в корзину
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        // Получаем локализованное название и описание товара
        const itemName = item.name[currentLang] || item.name['ru'] || item.name;
        
        // Получаем локализованный текст кнопки удаления
        const removeText = translations?.[currentLang]?.['cart.itemRemove'] || 
                          translations?.[currentLang]?.['cartitemRemove'] || 
                          'Удалить товар';

        // Карточка корзины
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${itemName}">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${itemName}</h3>
                    <p class="cart-item-price">${item.price} €</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-product" onclick="removeProduct(${item.id})">${removeText}</button>
                </div>
            </div>
        `;
    });

    // Обновляем общую сумму
    cartTotalPrice.textContent = total.toFixed(2);
}

// удаление товара
function removeProduct(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

// Обновление счетчиков
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    updateCartDisplay();
}

// Переменная для уведломления
let message = '';

// Функция для показа уведомления
function showNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

//Открыть корзину 
function openCart() {
    let modal = document.getElementById('cartModal');
    modal.classList.add('active');
}

// Закрыть корзину
function closeCart() {
    let modal = document.getElementById('cartModal');
    modal.classList.remove('active');
}

let buttonCart = document.querySelector('.cart');
buttonCart.addEventListener('click', function (e) {
    e.preventDefault();

    openCart();
});

// Событие для корзины
document.querySelector('.close').addEventListener('click', closeCart);

document.addEventListener('click', function (e) {
    const modal = document.getElementById('cartModal');
    const modalContent = modal.querySelector('.modal-content');
    const buttonCart = document.querySelector('.cart');

    // Проверяем, был ли клик вне модального содержимого
    if (
        modal &&
        modal.classList.contains('active') &&
        !modalContent.contains(e.target) &&
        !buttonCart.contains(e.target) &&
        !e.target.closest('.cart-item')
    ) {
        closeCart();
    }
});

let catalog = document.querySelector('.catalog');
let sortContainer = document.querySelector('.sort-container');

catalog.addEventListener('click', function () {
    catalogProduct.classList.add("active");
    renderProductCard();
    // Переключаем видимость меню сортировки
    if (sortContainer.style.display === 'none' || sortContainer.style.display === '') {
        sortContainer.style.display = 'flex';
    } else {
        sortContainer.style.display = 'none';
    }
});

let buttonDelivery = document.querySelector('.delivery');
buttonDelivery.addEventListener('click', (e) => {
    e.preventDefault();
    openDelivery();
});

//Откритие модального окна доставки
function openDelivery() {
    let modal = document.getElementById('deliveryModal');
    modal.classList.add("active");
}

let buttonDeliveryClose = document.querySelector('.closeDelivery');
buttonDeliveryClose.addEventListener('click', (e) => {
    e.preventDefault();
    closeDelivery();
});

function closeDelivery() {
    let modal = document.getElementById('deliveryModal');
    modal.classList.remove("active");
}

// Исправляем ошибочный вызов closeDelivery() на правильное добавление обработчика
document.querySelector('.closeDelivery').addEventListener('click', closeDelivery);

document.addEventListener('click', function (e) {
    const modal = document.getElementById('deliveryModal');
    const modalContent = modal.querySelector('.modal-content');
    buttonDelivery = document.querySelector('.delivery');

    // Проверяем, был ли клик вне модального содержимого
    if (
        modal &&
        modal.classList.contains('active') &&
        !modalContent.contains(e.target) &&
        !buttonDelivery.contains(e.target) &&
        !e.target.closest('.modal-body')
    ) {
        closeDelivery();
    }
});

// сортировка товаров
document.getElementById('sortOptions').addEventListener('change', function (event) {
    let sortOption = event.target.value;
    let sortedProducts = [...products];
    switch (sortOption) {
        case 'priceAsc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'priceDesc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'nameAsc':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'nameDesc':
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            sortedProducts = [...products];
            break;
    }
    renderProductCard(sortedProducts);
});

renderProductCard(products);

// Функции для работы с модальным окном оформления заказа
function openCheckout() {
    // Закрываем окно корзины
    closeCart();

    // Проверяем существование модального окна
    let modal = document.getElementById('checkoutModal');
    if (!modal) {
        return;
    }

    // Важно! Используем setTimeout, чтобы избежать конфликта с обработчиками кликов
    setTimeout(() => {
        // Открываем модальное окно оформления заказа
        modal.classList.add('active');
        modal.style.display = 'block';
    }, 50);
}

function closeCheckout() {
    let modal = document.getElementById('checkoutModal');
    if (!modal) {
        return;
    }
    modal.classList.remove('active');
    modal.style.display = 'none';
}

// Обработчик для кнопки "Оформить заказ" в корзине
document.getElementById('openCheckoutBtn').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события

    // Проверяем, есть ли товары в корзине
    if (cart.length === 0) {
        showNotification(message = 'Корзина пуста');
        return;
    }
    openCheckout();
});

// Обработчик для кнопки закрытия модального окна оформления заказа
document.querySelector('.closeCheckout').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    closeCheckout();
});

// Обработчик для клика вне модального окна оформления заказа
window.addEventListener('click', function (e) {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');

    // Проверяем, был ли клик вне модального содержимого и видимо ли окно
    if (
        modal &&
        modal.classList.contains('active') &&
        !modalContent.contains(e.target) &&
        !openCheckoutBtn.contains(e.target) &&
        e.target !== modal
    ) {
        closeCheckout();
    }
}, true); // true означает, что обработчик будет вызван в фазе захвата события

// Обработка отправки формы оформления заказа
document.getElementById('checkoutForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Получаем данные формы
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;

    // Создаем объект заказа
    const order = {
        id: Date.now(), // Уникальный ID заказа на основе временной метки
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: deliveryAddress
        },
        items: cart,
        totalPrice: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        date: new Date().toISOString(),
        status: 'new' // Статус заказа (новый)
    };

    // Сохраняем заказ в localStorage
    saveOrderToLocalStorage(order);

    // Очищаем корзину
    cart = [];
    updateCartDisplay();

    // Закрываем модальное окно
    closeCheckout();

    // Показываем уведомление об успешном оформлении заказа
    showNotification(message = 'Заказ успешно оформлен');

    // Очищаем форму
    this.reset();
});

// Функция для сохранения заказа в localStorage
function saveOrderToLocalStorage(order) {
    // Получаем существующие заказы или создаем пустой массив
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Добавляем новый заказ
    orders.push(order);

    // Сохраняем обновленный массив заказов
    localStorage.setItem('orders', JSON.stringify(orders));

    // Показываем уведомление о сохранении заказа
    showNotification(message = 'Заказ успешно сохранен');
}

// Функции открытия и закрытия модального окна контактов
function openContacts() {
    let modal = document.getElementById('contactsModal');
    modal.classList.add("active");
    modal.style.display = 'block';
}

function closeContacts() {
    let modal = document.getElementById('contactsModal');
    modal.classList.remove("active");
    modal.style.display = 'none';
}

// Обработчик клика по ссылке "Контакты"
let buttonContacts = document.querySelector('.contacts');
buttonContacts.addEventListener('click', (e) => {
    e.preventDefault();
    openContacts();
});

// Обработчик клика по кнопке закрытия модального окна контактов
document.querySelector('.closeContacts').addEventListener('click', (e) => {
    e.preventDefault();
    closeContacts();
});

// Обработчик клика вне модального окна контактов для его закрытия
document.addEventListener('click', function (e) {
    const modal = document.getElementById('contactsModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const buttonContacts = document.querySelector('.contacts');

    // Проверяем, был ли клик вне модального содержимого
    if (
        modal &&
        modal.classList.contains('active') &&
        !modalContent.contains(e.target) &&
        !buttonContacts.contains(e.target)
    ) {
        closeContacts();
    }
});

// Функции открытия и закрытия модального окна отзывов
function openReviews() {
    let modal = document.getElementById('reviewsModal');
    modal.classList.add("active");
    modal.style.display = 'block';
}

function closeReviews() {
    let modal = document.getElementById('reviewsModal');
    modal.classList.remove("active");
    modal.style.display = 'none';
}

// Обработчик клика по ссылке "Отзывы"
let buttonReviews = document.querySelector('.reviews');
buttonReviews.addEventListener('click', (e) => {
    e.preventDefault();
    openReviews();
});

// Обработчик клика по кнопке закрытия модального окна отзывов
document.querySelector('.closeReviews').addEventListener('click', (e) => {
    e.preventDefault();
    closeReviews();
});

// Обработчик клика вне модального окна отзывов для его закрытия
document.addEventListener('click', function (e) {
    const modal = document.getElementById('reviewsModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const buttonReviews = document.querySelector('.reviews');

    // Проверяем, был ли клик вне модального содержимого
    if (
        modal &&
        modal.classList.contains('active') &&
        !modalContent.contains(e.target) &&
        !buttonReviews.contains(e.target)
    ) {
        closeReviews();
    }
});