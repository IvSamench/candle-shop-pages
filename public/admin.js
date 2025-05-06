// filepath: d:\shop\public\admin.js

/**
 * Административная панель интернет-магазина свечей
 * Administration panel for candle online shop
 * 
 * Файл содержит функционал для управления товарами и заказами:
 * - Авторизация администратора
 * - Управление товарами (добавление, редактирование, удаление)
 * - Просмотр и управление заказами
 * 
 * The file contains functionality for managing products and orders:
 * - Administrator authentication
 * - Product management (adding, editing, deleting)
 * - Viewing and managing orders
 */

/**
 * Учетные данные администратора (для демонстрационных целей)
 * Administrator credentials (for demonstration purposes)
 */
const adminCredentials = {
    username: "admin",
    password: "admin"
};

/**
 * Объект с переводами для админ-панели
 * Object with translations for admin panel
 */
const adminTranslations = {
    'ru': {
        'productSaved': 'Товар сохранен. Изменения сохраняются до сброса данных.',
        'productNotFound': 'Товар не найден',
        'deleteConfirm': 'Вы уверены, что хотите удалить этот товар?',
        'resetConfirm': 'Вы действительно хотите сбросить все изменения? Все внесенные изменения будут утеряны.',
        'resetSuccess': 'Данные успешно сброшены до оригинальных значений из products.json',
        'resetError': 'Произошла ошибка при сбросе данных. Пожалуйста, попробуйте еще раз.',
        'orderNotFound': 'Заказ не найден',
        'statusUpdated': 'Статус заказа обновлен'
    },
    'en': {
        'productSaved': 'Product saved. Changes are stored until data reset.',
        'productNotFound': 'Product not found',
        'deleteConfirm': 'Are you sure you want to delete this product?',
        'resetConfirm': 'Do you really want to reset all changes? All modifications will be lost.',
        'resetSuccess': 'Data successfully reset to original values from products.json',
        'resetError': 'An error occurred while resetting the data. Please try again.',
        'orderNotFound': 'Order not found',
        'statusUpdated': 'Order status updated'
    },
    'lt': {
        'productSaved': 'Produktas išsaugotas. Pakeitimai saugomi iki duomenų atstatymo.',
        'productNotFound': 'Produktas nerastas',
        'deleteConfirm': 'Ar tikrai norite ištrinti šį produktą?',
        'resetConfirm': 'Ar tikrai norite atstatyti visus pakeitimus? Visi padaryti pakeitimai bus prarasti.',
        'resetSuccess': 'Duomenys sėkmingai atstatyti į originalias reikšmes iš products.json',
        'resetError': 'Įvyko klaida atkuriant duomenis. Bandykite dar kartą.',
        'orderNotFound': 'Užsakymas nerastas',
        'statusUpdated': 'Užsakymo būsena atnaujinta'
    }
};

/**
 * Функция для получения текущего языка
 * Function to get the current language
 */
function getCurrentLanguage() {
    // Пытаемся получить язык из localStorage, если его нет - используем русский
    return localStorage.getItem('currentLanguage') || 'ru';
}

/**
 * Функция для получения перевода сообщения
 * Function to get the translation of a message
 */
function getTranslation(key) {
    const lang = getCurrentLanguage();
    return adminTranslations[lang][key] || adminTranslations['ru'][key]; // Если перевод не найден, используем русский
}

/**
 * Функция для отображения уведомления с учетом языка
 * Function to display a notification considering the language
 */
function showNotification(key) {
    alert(getTranslation(key));
}

/**
 * Инициализация панели администратора при загрузке страницы
 * Initialize administrator panel when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем статус авторизации
    // Check authorization status
    checkAuth();
    
    /**
     * Обработчик формы входа в админ-панель
     * Login form handler for admin panel
     */
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Проверяем введенные учетные данные
        // Check entered credentials
        if (username === adminCredentials.username && password === adminCredentials.password) {
            // Успешный вход - сохраняем статус в localStorage
            // Successful login - save status in localStorage
            localStorage.setItem('isAdmin', 'true');
            showAdminPanel();
        } else {
            // Ошибка входа - показываем сообщение об ошибке
            // Login error - show error message
            document.getElementById('error-message').style.display = 'block';
            setTimeout(function() {
                document.getElementById('error-message').style.display = 'none';
            }, 3000);
        }
    });
    
    /**
     * Обработчики для навигации по админ-панели
     * Handlers for admin panel navigation
     */
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-product-btn').addEventListener('click', showAddForm);
    document.getElementById('back-to-list-btn').addEventListener('click', showProductsList);
    document.getElementById('cancel-edit-btn').addEventListener('click', showProductsList);
    document.getElementById('reset-data-btn').addEventListener('click', resetProductsData);
    
    // Обработчик формы добавления/редактирования товара
    // Handler for product add/edit form
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    
    // Обработчик загрузки изображения товара
    // Handler for product image upload
    document.getElementById('productImage').addEventListener('change', handleImageUpload);

    /**
     * Обработчики для работы с заказами
     * Handlers for working with orders
     */
    // Переход к списку заказов
    // Go to orders list
    document.getElementById('order-btn').addEventListener('click', function() {
        // Скрываем секцию товаров и показываем секцию заказов
        // Hide products section and show orders section
        document.getElementById('admin-container').style.display = 'none';
        document.getElementById('orders-container').style.display = 'block';
        
        // Загружаем список заказов
        // Load orders list
        loadOrders();
    });

    // Возврат к списку товаров
    // Return to products list
    document.getElementById('back-to-products-btn').addEventListener('click', function() {
        document.getElementById('orders-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
    });

    // Фильтрация заказов по статусу
    // Filter orders by status
    document.getElementById('status-filter').addEventListener('change', function() {
        loadOrders();
    });

    // Сортировка заказов по дате
    // Sort orders by date
    document.getElementById('date-sort').addEventListener('change', function() {
        loadOrders();
    });

    // Возврат к списку заказов из детализации
    // Return to orders list from order details
    document.getElementById('back-to-orders-btn').addEventListener('click', function() {
        document.getElementById('order-details-container').style.display = 'none';
        document.getElementById('orders-container').style.display = 'block';
    });

    // Обновление статуса заказа
    // Update order status
    document.getElementById('update-status-btn').addEventListener('click', updateOrderStatus);

    /**
     * Обработчики для языковых вкладок в форме
     * Handlers for language tabs in form
     */
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем активный класс со всех вкладок
            // Remove active class from all tabs
            document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
            
            // Скрываем все языковые секции
            // Hide all language sections
            document.querySelectorAll('.form-lang-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Делаем текущую вкладку активной
            // Make current tab active
            this.classList.add('active');
            
            // Показываем соответствующую языковую секцию
            // Show corresponding language section
            const lang = this.getAttribute('data-lang');
            document.getElementById('lang-' + lang).style.display = 'block';
        });
    });
});

/**
 * Обрабатывает выбор изображения для товара и показывает предпросмотр
 * Handles image selection for product and shows preview
 * 
 * @param {Event} e - Событие изменения input[type="file"]
 */
function handleImageUpload(e) {
    const fileInput = e.target;
    const imagePreview = document.getElementById('imagePreview');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        
        // Конвертируем изображение в формат base64 для хранения
        // Convert image to base64 format for storage
        reader.readAsDataURL(fileInput.files[0]);
    }
}

/**
 * Проверяет авторизацию пользователя и показывает соответствующий интерфейс
 * Checks user authorization and shows appropriate interface
 */
function checkAuth() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isAdmin) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

/**
 * Отображает панель администратора со списком товаров
 * Displays administrator panel with product list
 */
function showAdminPanel() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    document.getElementById('edit-container').style.display = 'none';
    
    // Загружаем данные о товарах
    // Load product data
    loadTempProducts();
}

/**
 * Отображает форму редактирования товара
 * Displays product editing form
 * 
 * @param {boolean} isNewProduct - Флаг, указывающий на создание нового товара
 */
function showEditPanel(isNewProduct = false) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('edit-container').style.display = 'block';
    
    // Устанавливаем заголовок в зависимости от режима (добавление/редактирование)
    // Set title depending on mode (add/edit)
    document.getElementById('edit-title').textContent = isNewProduct ? 'Добавить товар' : 'Редактировать товар';
}

/**
 * Возвращает к списку товаров из формы редактирования
 * Returns to product list from edit form
 */
function showProductsList() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    document.getElementById('edit-container').style.display = 'none';
}

/**
 * Загружает данные о товарах из localStorage или из JSON файла
 * Loads product data from localStorage or from JSON file
 */
async function loadTempProducts() {
    try {
        // Проверяем наличие данных в localStorage
        // Check for data in localStorage
        let tempProducts = JSON.parse(localStorage.getItem('productsData'));
        
        // Если данных нет, загружаем из файла products.json
        // If no data, load from products.json file
        if (!tempProducts) {
            const response = await fetch('../products.json');
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            
            const originalData = await response.json();
            tempProducts = originalData;
            localStorage.setItem('productsData', JSON.stringify(tempProducts));
        }
        
        // Отображаем список товаров
        // Display product list
        loadProducts();
    } catch (error) {
        // Обработка ошибок загрузки данных
        // Handle data loading errors
    }
}

/**
 * Отображает форму входа в админ-панель
 * Displays admin panel login form
 */
function showLoginForm() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('edit-container').style.display = 'none';
}

/**
 * Выполняет выход из админ-панели
 * Logs out from admin panel
 */
function logout() {
    localStorage.removeItem('isAdmin');
    showLoginForm();
}

/**
 * Загружает и отображает список товаров в админ-панели
 * Loads and displays product list in admin panel
 */
function loadProducts() {
    // Получаем временную копию данных из localStorage
    // Get temporary data copy from localStorage
    let tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
    
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = '';
    
    tempProducts.forEach(product => {
        const row = document.createElement('tr');
        
        // Используем изображение из продукта или пустую строку
        // Use product image or empty string
        let imagePath = product.image || '';
        
        // Если путь относительный и не начинается с "/", добавляем слэш
        // If path is relative and doesn't start with "/", add slash
        if (imagePath.startsWith('img/')) {
            imagePath = '../' + imagePath; // перейти на уровень выше для доступа к папке img
        }
        
        // Проверяем, есть ли объект с многоязычными названиями
        // Check if object with multilingual names exists
        const productName = typeof product.name === 'object' ? 
            product.name.ru || product.name.en || product.name.lt || 'Название отсутствует' : 
            product.name || 'Название отсутствует';
        
        row.innerHTML = `
            <td data-label="ID">${product.id}</td>
            <td data-label="Изображение"><img src="${imagePath}" alt="${productName}" style="max-width: 50px; max-height: 50px;"></td>
            <td data-label="Название">${productName}</td>
            <td data-label="Цена">${product.price} €</td>
            <td data-label="В наличии">${product.inStock ? '<i class="fas fa-check-circle" style="color: #81c784;"></i>' : '<i class="fas fa-times-circle" style="color: #e57373;"></i>'}</td>
            <td data-label="Действия">
                <button class="edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i> Редактировать</button>
                <button class="delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i> Удалить</button>
            </td>
        `;
        
        productTable.appendChild(row);
    });
    
    // Добавляем обработчики для кнопок редактирования и удаления
    // Add handlers for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            editProduct(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            deleteProduct(this.getAttribute('data-id'));
        });
    });
    
    // Проверяем, существует ли уже уведомление
    // Check if notification already exists
    const existingNotice = document.querySelector('.temp-notice-warning');
    
    // Если уведомление не существует, добавляем его
    // If notification doesn't exist, add it
    if (!existingNotice) {
        const noticeContainer = document.createElement('div');
        noticeContainer.className = 'temp-notice-warning'; // Добавляем класс для идентификации
        noticeContainer.style.margin = '10px 0';
        noticeContainer.style.padding = '10px';
        noticeContainer.style.backgroundColor = '#4a4a4a';
        noticeContainer.style.borderRadius = '5px';
        noticeContainer.style.color = '#fcf4d0d4';
        noticeContainer.style.textAlign = 'center';
        noticeContainer.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Внимание: Изменения временные и будут сброшены при перезагрузке страницы магазина';
        
        const tableParent = document.querySelector('.products-table');
        tableParent.insertBefore(noticeContainer, tableParent.firstChild);
    }
}

/**
 * Показывает форму для добавления нового товара
 * Shows form for adding new product
 */
function showAddForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName_ru').value = '';
    document.getElementById('productName_en').value = '';
    document.getElementById('productName_lt').value = '';
    document.getElementById('productDescription_ru').value = '';
    document.getElementById('productDescription_en').value = '';
    document.getElementById('productDescription_lt').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productInStock').checked = false;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '#';
    
    // Сбрасываем вкладки на русский язык
    // Reset tabs to Russian language
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-lang') === 'ru') {
            tab.classList.add('active');
        }
    });
    
    // Скрываем все языковые секции кроме русской
    // Hide all language sections except Russian
    document.querySelectorAll('.form-lang-section').forEach(section => {
        section.style.display = 'none';
        if (section.id === 'lang-ru') {
            section.style.display = 'block';
        }
    });
    
    // Показываем панель редактирования (режим добавления)
    // Show edit panel (add mode)
    showEditPanel(true);
}

/**
 * Скрывает форму редактирования товара
 * Hides product edit form
 */
function hideForm() {
    showProductsList();
}

/**
 * Загружает данные товара в форму редактирования
 * Loads product data into edit form
 * 
 * @param {number|string} id - ID товара для редактирования
 */
function editProduct(id) {
    // Получаем временную копию данных
    // Get temporary data copy
    const tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
    const product = tempProducts.find(p => p.id == id);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        
        // Заполняем поля для разных языков
        // Fill fields for different languages
        if (typeof product.name === 'object') {
            document.getElementById('productName_ru').value = product.name.ru || '';
            document.getElementById('productName_en').value = product.name.en || '';
            document.getElementById('productName_lt').value = product.name.lt || '';
        } else {
            // Если имя не объект, заполняем только русское название
            // If name is not an object, fill only Russian name
            document.getElementById('productName_ru').value = product.name || '';
        }
        
        if (typeof product.description === 'object') {
            document.getElementById('productDescription_ru').value = product.description.ru || '';
            document.getElementById('productDescription_en').value = product.description.en || '';
            document.getElementById('productDescription_lt').value = product.description.lt || '';
        } else {
            // Если описание не объект, заполняем только русское описание
            // If description is not an object, fill only Russian description
            document.getElementById('productDescription_ru').value = product.description || '';
        }
        
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productInStock').checked = product.inStock;
        
        // Отображаем текущее изображение товара
        // Display current product image
        if (product.image) {
            const imagePreview = document.getElementById('imagePreview');
            
            // Если путь к изображению относительный, добавляем префикс
            // If image path is relative, add prefix
            if (product.image.startsWith('img/')) {
                imagePreview.src = '../' + product.image;
            } else {
                imagePreview.src = product.image;
            }
            
            imagePreview.style.display = 'block';
        } else {
            document.getElementById('imagePreview').style.display = 'none';
        }
        
        // Активируем русскую вкладку по умолчанию
        // Activate Russian tab by default
        document.querySelectorAll('.form-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-lang') === 'ru') {
                tab.classList.add('active');
            }
        });
        
        // Показываем только русскую языковую секцию
        // Show only Russian language section
        document.querySelectorAll('.form-lang-section').forEach(section => {
            section.style.display = 'none';
            if (section.id === 'lang-ru') {
                section.style.display = 'block';
            }
        });
        
        // Показываем панель редактирования (режим редактирования)
        // Show edit panel (edit mode)
        showEditPanel(false);
    } else {
        showNotification('productNotFound');
    }
}

/**
 * Удаляет товар из списка
 * Deletes product from list
 * 
 * @param {number|string} id - ID товара для удаления
 */
function deleteProduct(id) {
    if (confirm(getTranslation('deleteConfirm'))) {
        let tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
        tempProducts = tempProducts.filter(p => p.id != id);
        
        // Обновляем временные данные
        // Update temporary data
        localStorage.setItem('productsData', JSON.stringify(tempProducts));
        
        // Обновляем список товаров в админ-панели
        // Update product list in admin panel
        loadProducts();
    }
}

/**
 * Сохраняет данные товара (новые или отредактированные)
 * Saves product data (new or edited)
 * 
 * @param {Event} e - Событие отправки формы
 */
async function saveProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    
    // Собираем названия для всех языков
    // Collect names for all languages
    const name = {
        ru: document.getElementById('productName_ru').value,
        en: document.getElementById('productName_en').value,
        lt: document.getElementById('productName_lt').value
    };
    
    // Собираем описания для всех языков
    // Collect descriptions for all languages
    const description = {
        ru: document.getElementById('productDescription_ru').value,
        en: document.getElementById('productDescription_en').value,
        lt: document.getElementById('productDescription_lt').value
    };
    
    const price = parseFloat(document.getElementById('productPrice').value);
    const inStock = document.getElementById('productInStock').checked;
    const imagePreview = document.getElementById('imagePreview');
    
    // Получаем изображение - либо новое загруженное, либо существующее
    // Get image - either new uploaded or existing
    let imageBase64 = imagePreview.style.display !== 'none' ? imagePreview.src : null;
    
    // Получаем временную копию данных
    // Get temporary data copy
    let tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
    
    if (id) {
        // Редактирование существующего товара
        // Editing existing product
        const index = tempProducts.findIndex(p => p.id == id);
        if (index !== -1) {
            tempProducts[index] = {
                ...tempProducts[index],
                name,
                price,
                description,
                inStock,
                // Сохраняем текущее изображение, если новое не выбрано
                // Keep current image if new one is not selected
                image: imageBase64 || tempProducts[index].image
            };
        }
    } else {
        // Добавление нового товара
        // Adding new product
        const newId = tempProducts.length > 0 ? Math.max(...tempProducts.map(p => parseInt(p.id || 0))) + 1 : 1;
        tempProducts.push({
            id: newId,
            name,
            price,
            description,
            inStock,
            // Используем только загруженное изображение без дефолтных значений
            // Use only uploaded image without default values
            image: imageBase64
        });
    }
    
    // Обновляем временные данные
    // Update temporary data
    localStorage.setItem('productsData', JSON.stringify(tempProducts));
    
    // Скрываем форму и обновляем список товаров
    // Hide form and update product list
    hideForm();
    loadProducts();
    
    // Показываем уведомление о временном характере изменений
    // Show notification about temporary nature of changes
    showNotification('productSaved');
}

/**
 * Сбрасывает все изменения товаров и восстанавливает оригинальные данные
 * Resets all product changes and restores original data
 */
async function resetProductsData() {
    if (confirm(getTranslation('resetConfirm'))) {
        try {
            // Загружаем оригинальные данные из products.json
            // Load original data from products.json
            const response = await fetch('../products.json');
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            
            const originalData = await response.json();
            
            // Обновляем данные в localStorage
            // Update data in localStorage
            localStorage.setItem('productsData', JSON.stringify(originalData));
            
            // Обновляем список товаров в админ-панели
            // Update product list in admin panel
            loadProducts();
            
            // Показываем уведомление об успешном сбросе
            // Show notification about successful reset
            showNotification('resetSuccess');
        } catch (error) {
            showNotification('resetError');
        }
    }
}

/**
 * Загружает и отображает список заказов с учетом фильтров
 * Loads and displays orders list considering filters
 */
function loadOrders() {
    // Получаем заказы из localStorage
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Получаем выбранные фильтры
    // Get selected filters
    const statusFilter = document.getElementById('status-filter').value;
    const dateSort = document.getElementById('date-sort').value;
    
    // Фильтруем заказы по статусу (если выбран конкретный статус)
    // Filter orders by status (if specific status is selected)
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === statusFilter);
    }
    
    // Сортируем заказы по дате
    // Sort orders by date
    filteredOrders.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    // Обновляем информацию на дашборде
    // Update information on dashboard
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('new-orders').textContent = orders.filter(order => order.status === 'new').length;
    
    // Рассчитываем общую сумму заказов
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    document.getElementById('total-revenue').textContent = `${totalRevenue.toFixed(2)} €`;
    
    // Отображаем заказы в таблице
    // Display orders in table
    renderOrdersTable(filteredOrders);
}

/**
 * Отображает список заказов в таблице
 * Displays orders list in table
 * 
 * @param {Array} orders - Массив заказов для отображения
 */
function renderOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTable');
    tableBody.innerHTML = '';
    
    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;"><i class="fas fa-exclamation-circle"></i> Заказы отсутствуют</td></tr>`;
        return;
    }
    
    orders.forEach(order => {
        // Форматируем дату
        // Format date
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Выбираем иконку в зависимости от статуса заказа
        // Select icon depending on order status
        let statusIcon = '';
        switch(order.status) {
            case 'new':
                statusIcon = '<i class="fas fa-star"></i> ';
                break;
            case 'processing':
                statusIcon = '<i class="fas fa-cog fa-spin"></i> ';
                break;
            case 'completed':
                statusIcon = '<i class="fas fa-check-circle"></i> ';
                break;
            case 'cancelled':
                statusIcon = '<i class="fas fa-ban"></i> ';
                break;
            default:
                statusIcon = '<i class="fas fa-question-circle"></i> ';
        }
        
        // Создаем строку для заказа
        // Create row for order
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="ID заказа">#${order.id}</td>
            <td data-label="Дата"><i class="far fa-calendar-alt"></i> ${formattedDate}</td>
            <td data-label="Клиент"><i class="fas fa-user"></i> ${order.customer.name}</td>
            <td data-label="Сумма"><i class="fas fa-euro-sign"></i> ${order.totalPrice.toFixed(2)} €</td>
            <td data-label="Статус" class="order-status ${order.status}">${statusIcon}${getStatusName(order.status)}</td>
            <td data-label="Действия">
                <button onclick="viewOrderDetails(${order.id})"><i class="fas fa-info-circle"></i> Детали</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Возвращает локализованное название статуса заказа
 * Returns localized order status name
 * 
 * @param {string} status - Код статуса заказа ('new', 'processing', 'completed', 'cancelled')
 * @returns {string} Локализованное название статуса
 */
function getStatusName(status) {
    const statuses = {
        'new': 'Новый',
        'processing': 'В обработке',
        'completed': 'Выполнен',
        'cancelled': 'Отменён'
    };
    return statuses[status] || 'Неизвестно';
}

/**
 * Отображает подробную информацию о заказе
 * Displays detailed order information
 * 
 * @param {number} orderId - ID заказа для просмотра
 */
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('orderNotFound');
        return;
    }
    
    // Скрыть список заказов и показать детали заказа
    // Hide orders list and show order details
    document.getElementById('orders-container').style.display = 'none';
    document.getElementById('order-details-container').style.display = 'block';
    
    // Установить ID заказа в заголовок
    // Set order ID in header
    document.getElementById('order-id-display').textContent = `#${order.id}`;
    
    // Заполнить информацию о клиенте
    // Fill customer information
    const customerInfo = document.getElementById('customer-info');
    customerInfo.innerHTML = `
        <p><i class="fas fa-user"></i> <strong>Имя:</strong> ${order.customer.name}</p>
        <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${order.customer.email}</p>
        <p><i class="fas fa-phone"></i> <strong>Телефон:</strong> ${order.customer.phone}</p>
        <p><i class="fas fa-map-marker-alt"></i> <strong>Адрес доставки:</strong> ${order.customer.address}</p>
    `;
    
    // Заполнить метаданные заказа
    // Fill order metadata
    const orderMeta = document.getElementById('order-meta');
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Выбираем иконку в зависимости от статуса заказа
    // Select icon depending on order status
    let statusIcon = '';
    switch(order.status) {
        case 'new':
            statusIcon = '<i class="fas fa-star"></i> ';
            break;
        case 'processing':
            statusIcon = '<i class="fas fa-cog"></i> ';
            break;
        case 'completed':
            statusIcon = '<i class="fas fa-check-circle"></i> ';
            break;
        case 'cancelled':
            statusIcon = '<i class="fas fa-ban"></i> ';
            break;
        default:
            statusIcon = '<i class="fas fa-question-circle"></i> ';
    }
    
    orderMeta.innerHTML = `
        <p><i class="fas fa-hashtag"></i> <strong>Номер заказа:</strong> #${order.id}</p>
        <p><i class="far fa-calendar-alt"></i> <strong>Дата оформления:</strong> ${formattedDate}</p>
        <p><i class="fas fa-shopping-basket"></i> <strong>Количество товаров:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p>${statusIcon}<strong>Статус:</strong> ${getStatusName(order.status)}</p>
    `;
    
    // Установить текущий статус в выпадающем списке
    // Set current status in dropdown
    document.getElementById('order-status-select').value = order.status;
    
    // Отобразить товары в заказе
    // Display products in order
    const orderProducts = document.getElementById('order-products');
    orderProducts.innerHTML = '';
    
    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const productElem = document.createElement('div');
        productElem.className = 'order-product-item';
        
        // Корректируем путь к изображению
        // Adjust image path
        let imagePath = item.image || '';
        
        // Если путь относительный и начинается с "img/", добавляем "../" для правильного пути в админ-панели
        // If path is relative and starts with "img/", add "../" for correct path in admin panel
        if (imagePath.startsWith('img/')) {
            imagePath = '../' + imagePath;
        }
        
        productElem.innerHTML = `
            <img src="${imagePath}" alt="${item.name}">
            <div class="order-product-info">
                <h4>${item.name}</h4>
                <p><i class="fas fa-tag"></i> ${item.price.toFixed(2)} € × ${item.quantity} шт.</p>
            </div>
            <div class="order-product-price">${itemTotal.toFixed(2)} €</div>
        `;
        orderProducts.appendChild(productElem);
    });
    
    // Обновить итоговую сумму
    // Update total price
    document.getElementById('order-total-price').textContent = `${order.totalPrice.toFixed(2)} €`;
}

/**
 * Обновляет статус заказа
 * Updates order status
 */
function updateOrderStatus() {
    // Получить ID заказа из заголовка
    // Get order ID from header
    const orderId = parseInt(document.getElementById('order-id-display').textContent.replace('#', ''));
    const newStatus = document.getElementById('order-status-select').value;
    
    // Получить заказы из localStorage
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        showNotification('orderNotFound');
        return;
    }
    
    // Обновить статус заказа
    // Update order status
    orders[orderIndex].status = newStatus;
    
    // Сохранить обновленные заказы
    // Save updated orders
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Обновить отображение
    // Update display
    viewOrderDetails(orderId);
    
    // Показать уведомление
    // Show notification
    showNotification('statusUpdated');
}

/**
 * Обработчик нажатия на кнопку "Заказы"
 * Handler for "Orders" button click
 */
let order=document.getElementById('order-btn')
order.addEventListener('click',function(){
    // Переход к управлению заказами
    // Switch to order management
});