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
        
        // Массив путей к файлу products.json для попытки загрузки
        const paths = [
            '../products.json',     // Относительный путь (работает локально)
            './products.json',      // В том же каталоге
            '/products.json',       // От корня сайта
            'products.json'         // Просто имя файла
        ];
        
        let loaded = false;
        
        // Пробуем загрузить файл из разных путей
        for (const path of paths) {
            try {
                console.log(`Пробуем загрузить из: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    const originalData = await response.json();
                    products = originalData;
                    localStorage.setItem('productsData', JSON.stringify(originalData));
                    renderProductCard(products);
                    console.log(`Успешно загружено из: ${path}`);
                    loaded = true;
                    break;
                }
            } catch (error) {
                console.log(`Не удалось загрузить из: ${path}`);
            }
        }
        
        if (!loaded) {
            console.error('Не удалось загрузить файл products.json ни по одному из путей');
        }
        
    } catch (error) {
        console.error('Критическая ошибка при загрузке продуктов:', error);
    }
}

async function LoadTranslete() {
    try {
        // Проверяем, есть ли сохраненные переводы в localStorage
        const savedTranslations = localStorage.getItem('translations');
        
        if (savedTranslations) {
            translations = JSON.parse(savedTranslations);
            return translations;
        }
        
        // Пробуем загрузить из файла
        try {
            const response = await fetch('public/translete.json');
            if (response.ok) {
                const translationsData = await response.json();
                translations = translationsData;
                localStorage.setItem('translations', JSON.stringify(translationsData));
                return translations;
            }
        } catch (error) {
            // Ошибка загрузки, но не логируем
        }
        
        // Если не удалось загрузить, используем резервную загрузку из относительного пути
        try {
            const response = await fetch('./translete.json');
            if (response.ok) {
                const translationsData = await response.json();
                translations = translationsData;
                localStorage.setItem('translations', JSON.stringify(translationsData));
                return translations;
            }
        } catch (error) {
            // Ошибка загрузки, но не логируем
        }
        
        // Если всё еще не удалось, устанавливаем значения по умолчанию
        const defaultTranslations = {
            ru: {
                "product.outOfStock": "Нет в наличии",
                "product.addToCart": "В корзину"
            },
            en: {
                "product.outOfStock": "Out of stock",
                "product.addToCart": "Add to cart"
            },
            lt: {
                "product.outOfStock": "Nėra sandėlyje",
                "product.addToCart": "Į krepšelį"
            }
        };
        
        translations = defaultTranslations;
        localStorage.setItem('translations', JSON.stringify(defaultTranslations));
        return translations;
    } catch (error) {
        return null;
    }
}

// Запускаем загрузку товаров при загрузке страницы
document.addEventListener('DOMContentLoaded', loadProductData);

// Корзина
let cart = [];
let  currentLang='en'

function translete(key){
    return tratranslations[currentLang][key]||key
}
// Функция для создания карточки товара
function createProductCard(product) {
    // Проверка товара в наличии
    const isOutOfStoke = product.inStock === false;
    
    // Используем только то изображение, которое есть у продукта
    const imagePath = product.image || '';
    
    return `
    <div class="product ${isOutOfStoke ? 'out-of-stock' : ''}">
     <div class="product-image">
     <img src="${imagePath}" alt="${product.name}"
     class="${isOutOfStoke ? 'black-and-white' : ''}">
     <div class="product-overlay">
     ${!isOutOfStoke ? `<button class="to_cart"
        onclick="addToCart(${product.id})">В корзину</button>` : ''}
        </div>
     </div>
     <div class="product-info">
     <h2 class="product_title">${product.name}</h2>
     <p class="about_product">${!isOutOfStoke ? product.description : 'Нет в наличии'}</p>
     <p class="product_price">${product.price} €</p>
     </div>
    
    
    </div>`
    
}


// Функция для отображения товаров
let catalogProduct=document.querySelector('.catalog_product')
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


function loadProducts() {
    // Имитируем задержку сети
    setTimeout(() => {
        renderProductCard();
    }, 500);
}
loadProducts()
// Функция добавления в корзину

function addToCart(productId){
    
    let product=products.find(p=>p.id===productId)
     if(!product) return;
    let cartProduct =cart.find(item=>item.id===productId)

    if(cartProduct){
        showNotification(message='Товар уже в корзине')
        console.log('+1')
        cartProduct.quantity+=1;
        

    }else {
        showNotification(message='Товар добавлен в корзину')
        cart.push({
            ...product,
            quantity: 1
        })
    }
    console.log(cart)
    updateCartDisplay();
   
}

// Функция обновления корзины
function updateCartDisplay(){
    let cartItems=document.querySelector('.cart-items')
    let cartTotalPrice=document.getElementById('cartTotalPrice')

    if(!cartItems || !cartTotalPrice) return

    cartItems.innerHTML='';

    let total=0; // общая сумма покупки 




     // Добавляем товары в корзину
     cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        
        // Карточка корзины
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-price">${item.price} €</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-product" onclick="removeProduct(${item.id})">Удалить товар</button>
                </div>
            </div>
        `;
    });

    // Обновляем общую сумму
    cartTotalPrice.textContent = total.toFixed(2);

 
}
// удаление товара
function removeProduct(productId){

    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay()
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
let message='';

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
function openCart(){
    let modal=document.getElementById('cartModal')
    modal.classList.add('active')
}

// Закрыть корзину
function closeCart(){
    let modal=document.getElementById('cartModal')
    modal.classList.remove('active')
}

let buttonCart=document.querySelector('.cart')
buttonCart.addEventListener('click', function(e){
    e.preventDefault();

    openCart();
    console.log('Корзина')
    
})

// Событие для корзины
document.querySelector('.close').addEventListener('click', closeCart)

document.addEventListener('click', function(e) {
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

catalog.addEventListener('click', function() {
    catalogProduct.classList.add("active")
    loadProducts()
    // Переключаем видимость меню сортировки
    if (sortContainer.style.display === 'none' || sortContainer.style.display === '') {
        sortContainer.style.display = 'flex';
    } else {
        sortContainer.style.display = 'none';
    }
    
    
});
let buttonDelivery=document.querySelector('.delivery')
buttonDelivery.addEventListener('click',(e)=>{
    e.preventDefault();
    openDelivery();

})
//Откритие модального окна доставки
function openDelivery(){
    let modal=document.getElementById('deliveryModal');
    modal.classList.add("active")

}
let buttonDeliveryClose=document.querySelector('.closeDelivery')
    buttonDeliveryClose.addEventListener('click',(e)=>{
        e.preventDefault();
        closeDelivery()
        console.log('closeDelivery')
    })

function closeDelivery(){
    let modal=document.getElementById('deliveryModal');
    modal.classList.remove("active")
}

// Исправляем ошибочный вызов closeDelivery() на правильное добавление обработчика
document.querySelector('.closeDelivery').addEventListener('click', closeDelivery);

document.addEventListener('click', function(e) {
    const modal = document.getElementById('deliveryModal');
    const modalContent = modal.querySelector('.modal-content');
    buttonDelivery=document.querySelector('.delivery')

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

document.getElementById('sortOptions').addEventListener('change', function(event){
    let sortOption=event.target.value;
    let sortedProducts=[...products]
    switch(sortOption){
        case 'priceAsc':
            sortedProducts.sort((a,b)=> a.price-b.price);
            break;
        case 'priceDesc':
            sortedProducts.sort((a,b)=> b.price-a.price);
            break;
        case 'nameAsc' :
            sortedProducts.sort((a,b)=>a.name.localeCompare(b.name));
            break;
        case 'nameDesc':
        sortedProducts.sort((a,b)=>b.name.localeCompare(a.name))
            break;
        default: sortedProducts = [...products];
        break;   
    }
    renderProductCard(sortedProducts)
});

renderProductCard(products);


// Функции для работы с модальным окном оформления заказа
function openCheckout() {
    console.log('Запуск функции openCheckout()');
    
    // Закрываем окно корзины
    closeCart();
    console.log('Корзина закрыта');
    
    // Проверяем существование модального окна
    let modal = document.getElementById('checkoutModal');
    if (!modal) {
        console.error('Ошибка: модальное окно #checkoutModal не найдено в DOM');
        return;
    }
    
    // Важно! Используем setTimeout, чтобы избежать конфликта с обработчиками кликов
    setTimeout(() => {
        // Открываем модальное окно оформления заказа
        modal.classList.add('active');
        modal.style.display = 'block';
        console.log('Модальное окно оформления заказа активировано (добавлен класс active)');
        console.log('Видимость модального окна:', getComputedStyle(modal).display);
        console.log('Классы модального окна:', modal.className);
    }, 50);
}

function closeCheckout() {
    console.log('Закрытие модального окна оформления заказа');
    let modal = document.getElementById('checkoutModal');
    if (!modal) {
        console.error('Ошибка: модальное окно #checkoutModal не найдено в DOM');
        return;
    }
    modal.classList.remove('active');
    modal.style.display = 'none';
    console.log('Класс active удален с модального окна оформления заказа');
}

// Обработчик для кнопки "Оформить заказ" в корзине
document.getElementById('openCheckoutBtn').addEventListener('click', function(e) {
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
document.querySelector('.closeCheckout').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    closeCheckout();
});

// Обработчик для клика вне модального окна оформления заказа
// Удаляем старый обработчик и добавляем новый, более специфичный
// Этот код должен быть в конце документа, чтобы переопределить другие обработчики
window.addEventListener('click', function(e) {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    const openCheckoutBtn = document.getElementById('openCheckoutBtn');
    
    // Открываем консоль и смотрим, что именно вызывает закрытие
    console.log('Клик на:', e.target);
    
    // Проверяем, был ли клик вне модального содержимого и видимо ли окно
    if (
        modal && 
        modal.classList.contains('active') && 
        !modalContent.contains(e.target) && 
        !openCheckoutBtn.contains(e.target) &&
        e.target !== modal
    ) {
        console.log('Клик вне модального окна, закрываем');
        closeCheckout();
    }
}, true); // true означает, что обработчик будет вызван в фазе захвата события

// Обработка отправки формы оформления заказа
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
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
    
    console.log('Заказ сохранен в localStorage:', order);
    
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
    console.log('Открыто модальное окно Контакты');
});

// Обработчик клика по кнопке закрытия модального окна контактов
document.querySelector('.closeContacts').addEventListener('click', (e) => {
    e.preventDefault();
    closeContacts();
    console.log('Закрыто модальное окно Контакты');
});

// Обработчик клика вне модального окна контактов для его закрытия
document.addEventListener('click', function(e) {
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
    console.log('Открыто модальное окно Отзывы');
});

// Обработчик клика по кнопке закрытия модального окна отзывов
document.querySelector('.closeReviews').addEventListener('click', (e) => {
    e.preventDefault();
    closeReviews();
    console.log('Закрыто модальное окно Отзывы');
});

// Обработчик клика вне модального окна отзывов для его закрытия
document.addEventListener('click', function(e) {
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