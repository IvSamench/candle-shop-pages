// filepath: d:\shop\public\script.js
// Получаем данные о продуктах из localStorage или из файла products.json
// Get product data from localStorage or from products.json file
let products = [];

// Функция для загрузки продуктов
// Function for loading products
async function loadProductData() {
    try {
        // Проверяем, есть ли сохраненные данные в localStorage
        // Check if there is saved data in localStorage
        const savedProducts = localStorage.getItem('productsData');

        if (savedProducts) {
            products = JSON.parse(savedProducts);
            renderProductCard(products);
            return;
        }

        // Если нет данных в localStorage, загружаем из products.json напрямую
        // If there is no data in localStorage, load directly from products.json
        try {
            // Используем проверенный рабочий путь
            // Use verified working path
            const response = await fetch('./products.json');
            if (response.ok) {
                const originalData = await response.json();
                products = originalData;
                localStorage.setItem('productsData', JSON.stringify(originalData));
                renderProductCard(products);
                return;
            }
        } catch (error) {
            // Удалено логирование
            // Logging removed
        }

    } catch (error) {
        // Удалено логирование
        // Logging removed
    }
}
// Язык браузера 
// Browser language
const userLang = (navigator.language || navigator.userLanguage).slice(0, 2)
let supportLanguage = ['en', 'ru', 'lt']

let translations;
async function loadTranslate() {
    try {
        const response = await fetch('./translate.json')
        if (response.ok) {
            translations = await response.json();
            
            // Сразу применяем переводы после загрузки
            // Apply translations immediately after loading
            const savedLang = localStorage.getItem('lang');
            currentLang = savedLang && supportLanguage.includes(savedLang) ? savedLang : 
                          supportLanguage.includes(userLang) ? userLang : 'en';
            updateTexts(currentLang);
            
            return translations;
        }
    } catch (error) {
        // Удалено логирование
        // Logging removed
    }
}
loadTranslate()
// Запускаем загрузку товаров при загрузке страницы
// Start loading products when the page loads
document.addEventListener('DOMContentLoaded', loadProductData);

// Язык браузера или установлен пользователем
// Browser language or set by user
let currentLang = supportLanguage.includes(userLang) ? userLang : 'en';

let langButtons = document.querySelectorAll('.language')
langButtons.forEach(function (langButton) {
    langButton.addEventListener('click', function (e) {
        e.preventDefault()
        const selectedLang = langButton.dataset.lang;
        currentLang = selectedLang;
        localStorage.setItem('lang', currentLang)
        updateTexts(currentLang);
    })
})
function updateTexts(currentLang){
    // Перевод стандартных текстовых элементов
    // Translation of standard text elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Пробуем точное совпадение ключа
        // Try exact key match
        let translation = translations[currentLang]?.[key];
        
        // Если точного совпадения нет, пробуем разные форматы ключа
        // If there is no exact match, try different key formats
        if (!translation) {
            // Преобразовываем ключи с точками в формат с точками и наоборот
            // Convert keys with dots to format with dots and vice versa
            const dotKey = key.replace(/\./g, '_').replace(/-/g, '_');
            const dashKey = key.replace(/\./g, '-').replace(/_/g, '-');
            
            // Пробуем различные варианты формата ключа
            // Try various key format options
            translation = translations[currentLang]?.[dotKey] || 
                         translations[currentLang]?.[dashKey] || 
                         translations[currentLang]?.[`${key.split('.')[0]}.${key.split('.')[1]}`] ||
                         translations[currentLang]?.[key.replace('.', '')];
        }
        
        if(translation){
            element.textContent = translation;
        }
    });
    
    // Перевод атрибутов (placeholder, alt, title и т.д.)
    // Translation of attributes (placeholder, alt, title, etc.)
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
        const attributesData = element.getAttribute('data-i18n-attr');
        try {
            const attrObj = JSON.parse(attributesData);
            for (let attr in attrObj) {
                const key = attrObj[attr];
                
                // Аналогичная логика поиска перевода для атрибутов
                // Similar logic for finding translation for attributes
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
                }
            }
        } catch (e) {
            // Удалено логирование
            // Logging removed
        }
    });
    
    // Обновляем карточки товаров при смене языка
    // Update product cards when language changes
    renderProductCard(products, catalogProduct.classList.contains("active") ? products.length : 3);
    
    // Обновляем тексты в динамических элементах (корзина)
    // Update texts in dynamic elements (cart)
    if (cart && cart.length > 0) {
        updateCartDisplay();
    }
    
    // Применяем перевод к уведомлениям и другим динамическим элементам
    // Apply translation to notifications and other dynamic elements
    translateStaticElements();
    
    localStorage.setItem('lang', currentLang);
}

// Функция для перевода статических элементов интерфейса
// Function for translating static interface elements
function translateStaticElements() {
    // Переводим элементы, которые могут быть созданы скриптом
    // Translate elements that can be created by script
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
    // Apply translation to buttons
    for (const selector in translateButtons) {
        const elements = document.querySelectorAll(selector);
        const translationKey = translateButtons[selector];
        
        elements.forEach(element => {
            // Пробуем точное совпадение ключа
            // Try exact key match
            let translation = translations[currentLang]?.[translationKey];
            
            // Если точного совпадения нет, пробуем разные форматы ключа
            // If there is no exact match, try different key formats
            if (!translation) {
                // Пробуем ключ без точки
                // Try key without dot
                translation = translations[currentLang]?.[translationKey.replace('.', '')];
            }
            
            if (translation) {
                element.textContent = translation;
            }
        });
    }
    
    // Переводим заголовки модальных окон
    // Translate modal window titles
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
            // Try exact key match
            let translation = translations[currentLang]?.[modalTitles[selector]];
            
            // Если точного совпадения нет, пробуем разные форматы ключа
            // If there is no exact match, try different key formats
            if (!translation) {
                // Пробуем ключ без точки
                // Try key without dot
                translation = translations[currentLang]?.[modalTitles[selector].replace('.', '')];
            }
            
            if (translation) {
                element.textContent = translation;
            }
        }
    }
    
    // Переводим текст уведомлений
    // Translate notification texts
    const notificationMessages = {
        'Товар добавлен в корзину': 'notification.added',
        'Товар уже в корзине': 'notification.already',
        'Корзина пуста': 'notification.empty',
        'Заказ успешно оформлен': 'notification.orderPlaced',
        'Заказ успешно сохранен': 'notification.orderSaved'
    };
    
    // Обновляем переменную с сообщением в функции showNotification
    // Update message variable in showNotification function
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
// Cart
let cart = [];

// Функция для создания карточки товара с поддержкой перевода
// Function for creating a product card with translation support
function createProductCard(product) {
    // Проверка товара в наличии
    // Check product availability
    const isOutOfStoke = product.inStock === false;

    // Используем только то изображение, которое есть у продукта
    // Use only the image that the product has
    const imagePath = product.image || '';
    
    // Получаем локализованные строки для динамического контента
    // Get localized strings for dynamic content
    // Используем язык из currentLang
    // Use language from currentLang
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
// Function for displaying products
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
// Render product cards
renderProductCard(products);

// Функция добавления в корзину
// Function for adding to cart
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
// Function for updating the cart
function updateCartDisplay() {
    let cartItems = document.querySelector('.cart-items');
    let cartTotalPrice = document.getElementById('cartTotalPrice');

    if (!cartItems || !cartTotalPrice) return;

    cartItems.innerHTML = '';

    let total = 0; // общая сумма покупки 
    // total purchase amount

    // Добавляем товары в корзину
    // Add products to the cart
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        // Получаем локализованное название и описание товара
        // Get localized product name and description
        const itemName = item.name[currentLang] || item.name['ru'] || item.name;
        
        // Получаем локализованный текст кнопки удаления
        // Get localized text for the remove button
        const removeText = translations?.[currentLang]?.['cart.itemRemove'] || 
                          translations?.[currentLang]?.['cartitemRemove'] || 
                          'Удалить товар';

        // Карточка корзины
        // Cart card
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
    // Update total amount
    cartTotalPrice.textContent = total.toFixed(2);
}

// удаление товара
// remove product
function removeProduct(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

// Обновление счетчиков
// Update counters
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
// Variable for notification
let message = '';

// Функция для показа уведомления
// Function to show notification
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
//Open cart
function openCart() {
    let modal = document.getElementById('cartModal');
    modal.classList.add('active');
}

// Закрыть корзину
// Close cart
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
// Event for cart
document.querySelector('.close').addEventListener('click', closeCart);

document.addEventListener('click', function (e) {
    const modal = document.getElementById('cartModal');
    const modalContent = modal.querySelector('.modal-content');
    const buttonCart = document.querySelector('.cart');

    // Проверяем, был ли клик вне модального содержимого
    // Check if the click was outside the modal content
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
    // Toggle visibility of the sort menu
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
//Open delivery modal window
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
// Fix incorrect call to closeDelivery() to correct event handler addition
document.querySelector('.closeDelivery').addEventListener('click', closeDelivery);

document.addEventListener('click', function (e) {
    const modal = document.getElementById('deliveryModal');
    const modalContent = modal.querySelector('.modal-content');
    buttonDelivery = document.querySelector('.delivery');

    // Проверяем, был ли клик вне модального содержимого
    // Check if the click was outside the modal content
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
// product sorting
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
// Functions for working with the checkout modal window
function openCheckout() {
    // Закрываем окно корзины
    // Close the cart window
    closeCart();

    // Проверяем существование модального окна
    // Check for the existence of the modal window
    let modal = document.getElementById('checkoutModal');
    if (!modal) {
        return;
    }

    // Важно! Используем setTimeout, чтобы избежать конфликта с обработчиками кликов
    // Important! Use setTimeout to avoid conflict with click handlers
    setTimeout(() => {
        // Открываем модальное окно оформления заказа
        // Open the checkout modal window
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
// Handler for the "Checkout" button in the cart
document.getElementById('openCheckoutBtn').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    // Prevent event propagation

    // Проверяем, есть ли товары в корзине
    // Check if there are items in the cart
    if (cart.length === 0) {
        showNotification(message = 'Корзина пуста');
        return;
    }
    openCheckout();
});

// Обработчик для кнопки закрытия модального окна оформления заказа
// Handler for the close button of the checkout modal window
document.querySelector('.closeCheckout').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    // Prevent event propagation
    closeCheckout();
});

// Обработчик для клика вне модального окна оформления заказа
// Handler for clicking outside the checkout modal window
window.addEventListener('click', function (e) {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');

    // Проверяем, был ли клик вне модального содержимого и видимо ли окно
    // Check if the click was outside the modal content and if the window is visible
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
// true means the handler will be called in the capture phase

// Обработка отправки формы оформления заказа
// Processing the checkout form submission
document.getElementById('checkoutForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Получаем данные формы
    // Get form data
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;

    // Создаем объект заказа
    // Create an order object
    const order = {
        id: Date.now(), // Уникальный ID заказа на основе временной метки
        // Unique order ID based on timestamp
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
        // Order status (new)
    };

    // Сохраняем заказ в localStorage
    // Save the order in localStorage
    saveOrderToLocalStorage(order);

    // Очищаем корзину
    // Clear the cart
    cart = [];
    updateCartDisplay();

    // Закрываем модальное окно
    // Close the modal window
    closeCheckout();

    // Показываем уведомление об успешном оформлении заказа
    // Show notification of successful order placement
    showNotification(message = 'Заказ успешно оформлен');

    // Очищаем форму
    // Clear the form
    this.reset();
});

// Функция для сохранения заказа в localStorage
// Function to save the order in localStorage
function saveOrderToLocalStorage(order) {
    // Получаем существующие заказы или создаем пустой массив
    // Get existing orders or create an empty array
    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Добавляем новый заказ
    // Add a new order
    orders.push(order);

    // Сохраняем обновленный массив заказов
    // Save the updated array of orders
    localStorage.setItem('orders', JSON.stringify(orders));

    // Показываем уведомление о сохранении заказа
    // Show notification of order saving
    showNotification(message = 'Заказ успешно сохранен');
}

// Функции открытия и закрытия модального окна контактов
// Functions for opening and closing the contacts modal window
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
// Handler for clicking the "Contacts" link
let buttonContacts = document.querySelector('.contacts');
buttonContacts.addEventListener('click', (e) => {
    e.preventDefault();
    openContacts();
});

// Обработчик клика по кнопке закрытия модального окна контактов
// Handler for clicking the close button of the contacts modal window
document.querySelector('.closeContacts').addEventListener('click', (e) => {
    e.preventDefault();
    closeContacts();
});

// Обработчик клика вне модального окна контактов для его закрытия
// Handler for clicking outside the contacts modal window to close it
document.addEventListener('click', function (e) {
    const modal = document.getElementById('contactsModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const buttonContacts = document.querySelector('.contacts');

    // Проверяем, был ли клик вне модального содержимого
    // Check if the click was outside the modal content
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
// Functions for opening and closing the reviews modal window
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
// Handler for clicking the "Reviews" link
let buttonReviews = document.querySelector('.reviews');
buttonReviews.addEventListener('click', (e) => {
    e.preventDefault();
    openReviews();
});

// Обработчик клика по кнопке закрытия модального окна отзывов
// Handler for clicking the close button of the reviews modal window
document.querySelector('.closeReviews').addEventListener('click', (e) => {
    e.preventDefault();
    closeReviews();
});

// Обработчик клика вне модального окна отзывов для его закрытия
// Handler for clicking outside the reviews modal window to close it
document.addEventListener('click', function (e) {
    const modal = document.getElementById('reviewsModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const buttonReviews = document.querySelector('.reviews');

    // Проверяем, был ли клик вне модального содержимого
    // Check if the click was outside the modal content
    if (
        modal &&
        modal.classList.contains('active') &&
        !modalContent.contains(e.target) &&
        !buttonReviews.contains(e.target)
    ) {
        closeReviews();
    }
});