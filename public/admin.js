// filepath: d:\shop\public\admin.js

// Конфигурация для входа
const adminCredentials = {
    username: "admin",
    password: "admin"
};

// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Обработчик формы входа
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Проверяем учетные данные
        if (username === adminCredentials.username && password === adminCredentials.password) {
            // Успешный вход
            localStorage.setItem('isAdmin', 'true');
            showAdminPanel();
        } else {
            // Ошибка входа
            document.getElementById('error-message').style.display = 'block';
            setTimeout(function() {
                document.getElementById('error-message').style.display = 'none';
            }, 3000);
        }
    });
    
    // Обработчики для навигации между разделами админ-панели
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-product-btn').addEventListener('click', showAddForm);
    document.getElementById('back-to-list-btn').addEventListener('click', showProductsList);
    document.getElementById('cancel-edit-btn').addEventListener('click', showProductsList);
    document.getElementById('reset-data-btn').addEventListener('click', resetProductsData);
    
    // Обработчик формы добавления/редактирования товара
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    
    // Добавляем обработчик события изменения файла изображения
    document.getElementById('productImage').addEventListener('change', handleImageUpload);

    // Обработка нажатия на кнопку "Заказы"
    document.getElementById('order-btn').addEventListener('click', function() {
        // Скрыть секцию товаров и показать секцию заказов
        document.getElementById('admin-container').style.display = 'none';
        document.getElementById('orders-container').style.display = 'block';
        
        // Загрузить и отобразить заказы
        loadOrders();
    });

    // Возврат к списку товаров из списка заказов
    document.getElementById('back-to-products-btn').addEventListener('click', function() {
        document.getElementById('orders-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
    });

    // Обработка фильтрации заказов по статусу
    document.getElementById('status-filter').addEventListener('change', function() {
        loadOrders();
    });

    // Обработка сортировки заказов по дате
    document.getElementById('date-sort').addEventListener('change', function() {
        loadOrders();
    });

    // Возврат к списку заказов из детализации заказа
    document.getElementById('back-to-orders-btn').addEventListener('click', function() {
        document.getElementById('order-details-container').style.display = 'none';
        document.getElementById('orders-container').style.display = 'block';
    });

    // Обработка нажатия кнопки обновления статуса заказа
    document.getElementById('update-status-btn').addEventListener('click', updateOrderStatus);
});

// Функция для предварительного просмотра изображения
function handleImageUpload(e) {
    const fileInput = e.target;
    const imagePreview = document.getElementById('imagePreview');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        
        reader.readAsDataURL(fileInput.files[0]); // Преобразует изображение в base64
    }
}

// Проверка авторизации
function checkAuth() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isAdmin) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// Показать админ-панель (список товаров)
function showAdminPanel() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    document.getElementById('edit-container').style.display = 'none';
    
    // При открытии админ-панели проверяем наличие временной копии данных
    loadTempProducts();
}

// Показать форму редактирования товара
function showEditPanel(isNewProduct = false) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('edit-container').style.display = 'block';
    
    document.getElementById('edit-title').textContent = isNewProduct ? 'Добавить товар' : 'Редактировать товар';
}

// Вернуться к списку товаров
function showProductsList() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    document.getElementById('edit-container').style.display = 'none';
}

// Загрузка временной копии данных
async function loadTempProducts() {
    try {
        let tempProducts = JSON.parse(localStorage.getItem('productsData'));
        
        // Если нет данных в localStorage, загружаем из products.json
        if (!tempProducts) {
            console.log('Загружаем оригинальные данные из products.json в админ-панель');
            const response = await fetch('../products.json');
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            
            const originalData = await response.json();
            tempProducts = originalData;
            localStorage.setItem('productsData', JSON.stringify(tempProducts));
        } else {
            console.log('Используем временную копию из localStorage для админ-панели');
        }
        
        // Отображаем товары в админ-панели
        loadProducts();
    } catch (error) {
        console.error('Ошибка при загрузке временных данных:', error);
    }
}

// Показать форму входа
function showLoginForm() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('edit-container').style.display = 'none';
}

// Выход из админ-панели
function logout() {
    localStorage.removeItem('isAdmin');
    showLoginForm();
}

// Загрузить продукты 
function loadProducts() {
    // Получаем временную копию данных из localStorage
    let tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
    
    const productTable = document.getElementById('productTable');
    productTable.innerHTML = '';
    
    tempProducts.forEach(product => {
        const row = document.createElement('tr');
        
        // Используем изображение из продукта или пустую строку
        let imagePath = product.image || '';
        
        // Если путь относительный и не начинается с "/", добавляем слэш
        if (imagePath.startsWith('img/')) {
            imagePath = '../' + imagePath; // перейти на уровень выше для доступа к папке img
        }
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${imagePath}" alt="${product.name}" style="max-width: 50px; max-height: 50px;"></td>
            <td>${product.name}</td>
            <td>${product.price} €</td>
            <td>${product.inStock ? 'Да' : 'Нет'}</td>
            <td>
                <button class="edit-btn" data-id="${product.id}">Редактировать</button>
                <button class="delete-btn" data-id="${product.id}">Удалить</button>
            </td>
        `;
        
        productTable.appendChild(row);
    });
    
    // Добавляем обработчики для кнопок редактирования и удаления
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
    const existingNotice = document.querySelector('.temp-notice-warning');
    
    // Если уведомление не существует, добавляем его
    if (!existingNotice) {
        const noticeContainer = document.createElement('div');
        noticeContainer.className = 'temp-notice-warning'; // Добавляем класс для идентификации
        noticeContainer.style.margin = '10px 0';
        noticeContainer.style.padding = '10px';
        noticeContainer.style.backgroundColor = '#4a4a4a';
        noticeContainer.style.borderRadius = '5px';
        noticeContainer.style.color = '#fcf4d0d4';
        noticeContainer.style.textAlign = 'center';
        noticeContainer.textContent = 'Внимание: Изменения временные и будут сброшены при перезагрузке страницы магазина';
        
        const tableParent = document.querySelector('.products-table');
        tableParent.insertBefore(noticeContainer, tableParent.firstChild);
    }
}

// Показать форму добавления товара
function showAddForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productInStock').checked = false;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '#';
    
    // Показываем панель редактирования (режим добавления)
    showEditPanel(true);
}

// Скрыть форму и вернуться к списку
function hideForm() {
    showProductsList();
}

// Редактировать товар
function editProduct(id) {
    // Получаем временную копию данных
    const tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
    const product = tempProducts.find(p => p.id == id);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productInStock').checked = product.inStock;
        
        // Отображаем текущее изображение товара
        if (product.image) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = product.image;
            imagePreview.style.display = 'block';
        } else {
            document.getElementById('imagePreview').style.display = 'none';
        }
        
        // Показываем панель редактирования (режим редактирования)
        showEditPanel(false);
    } else {
        alert('Товар не найден');
    }
}

// Удалить товар
function deleteProduct(id) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        let tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
        tempProducts = tempProducts.filter(p => p.id != id);
        
        // Обновляем временные данные
        localStorage.setItem('productsData', JSON.stringify(tempProducts));
        
        // Обновляем список товаров в админ-панели
        loadProducts();
    }
}

// Сохранить товар
async function saveProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const inStock = document.getElementById('productInStock').checked;
    const imagePreview = document.getElementById('imagePreview');
    
    // Получаем изображение - либо новое загруженное, либо существующее
    let imageBase64 = imagePreview.style.display !== 'none' ? imagePreview.src : null;
    
    // Получаем временную копию данных
    let tempProducts = JSON.parse(localStorage.getItem('productsData')) || [];
    
    if (id) {
        // Редактирование существующего товара
        const index = tempProducts.findIndex(p => p.id == id);
        if (index !== -1) {
            tempProducts[index] = {
                ...tempProducts[index],
                name,
                price,
                description,
                inStock,
                // Сохраняем текущее изображение, если новое не выбрано
                image: imageBase64 || tempProducts[index].image
            };
        }
    } else {
        // Добавление нового товара
        const newId = tempProducts.length > 0 ? Math.max(...tempProducts.map(p => parseInt(p.id || 0))) + 1 : 1;
        tempProducts.push({
            id: newId,
            name,
            price,
            description,
            inStock,
            // Используем только загруженное изображение без дефолтных значений
            image: imageBase64
        });
    }
    
    // Обновляем временные данные
    localStorage.setItem('productsData', JSON.stringify(tempProducts));
    
    // Скрываем форму и обновляем список товаров
    hideForm();
    loadProducts();
    
    // Показываем уведомление о временном характере изменений
    alert('Товар сохранен. Изменения сохраняются до сброса данных.');
}

// Сбросить изменения и вернуть оригинальные данные из products.json
async function resetProductsData() {
    if (confirm('Вы действительно хотите сбросить все изменения? Все внесенные изменения будут утеряны.')) {
        try {
            // Загружаем оригинальные данные из products.json
            console.log('Сбрасываем изменения к оригинальным данным из products.json');
            const response = await fetch('../products.json');
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }
            
            const originalData = await response.json();
            
            // Обновляем данные в localStorage
            localStorage.setItem('productsData', JSON.stringify(originalData));
            
            // Обновляем список товаров в админ-панели
            loadProducts();
            
            // Показываем уведомление об успешном сбросе
            alert('Данные успешно сброшены до оригинальных значений из products.json');
        } catch (error) {
            console.error('Ошибка при сбросе данных:', error);
            alert('Произошла ошибка при сбросе данных. Пожалуйста, попробуйте еще раз.');
        }
    }
}

// Функция загрузки заказов из localStorage
function loadOrders() {
    // Получаем заказы из localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Получаем выбранные фильтры
    const statusFilter = document.getElementById('status-filter').value;
    const dateSort = document.getElementById('date-sort').value;
    
    // Фильтруем заказы по статусу (если выбран конкретный статус)
    let filteredOrders = orders;
    if (statusFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === statusFilter);
    }
    
    // Сортируем заказы по дате
    filteredOrders.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    // Обновляем информацию на дашборде
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('new-orders').textContent = orders.filter(order => order.status === 'new').length;
    
    // Рассчитываем общую сумму заказов
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    document.getElementById('total-revenue').textContent = `${totalRevenue.toFixed(2)} €`;
    
    // Отображаем заказы в таблице
    renderOrdersTable(filteredOrders);
}

// Функция для отображения списка заказов в таблице
function renderOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTable');
    tableBody.innerHTML = '';
    
    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Заказы отсутствуют</td></tr>`;
        return;
    }
    
    orders.forEach(order => {
        // Форматируем дату
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Создаем строку для заказа
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${formattedDate}</td>
            <td>${order.customer.name}</td>
            <td>${order.totalPrice.toFixed(2)} €</td>
            <td class="order-status ${order.status}">${getStatusName(order.status)}</td>
            <td>
                <button onclick="viewOrderDetails(${order.id})">Детали</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Функция для получения названия статуса заказа на русском
function getStatusName(status) {
    const statuses = {
        'new': 'Новый',
        'processing': 'В обработке',
        'completed': 'Выполнен',
        'cancelled': 'Отменён'
    };
    return statuses[status] || 'Неизвестно';
}

// Функция для просмотра деталей заказа
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Заказ не найден');
        return;
    }
    
    // Скрыть список заказов и показать детали заказа
    document.getElementById('orders-container').style.display = 'none';
    document.getElementById('order-details-container').style.display = 'block';
    
    // Установить ID заказа в заголовок
    document.getElementById('order-id-display').textContent = `#${order.id}`;
    
    // Заполнить информацию о клиенте
    const customerInfo = document.getElementById('customer-info');
    customerInfo.innerHTML = `
        <p><strong>Имя:</strong> ${order.customer.name}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Телефон:</strong> ${order.customer.phone}</p>
        <p><strong>Адрес доставки:</strong> ${order.customer.address}</p>
    `;
    
    // Заполнить метаданные заказа
    const orderMeta = document.getElementById('order-meta');
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    orderMeta.innerHTML = `
        <p><strong>Номер заказа:</strong> #${order.id}</p>
        <p><strong>Дата оформления:</strong> ${formattedDate}</p>
        <p><strong>Количество товаров:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p><strong>Статус:</strong> ${getStatusName(order.status)}</p>
    `;
    
    // Установить текущий статус в выпадающем списке
    document.getElementById('order-status-select').value = order.status;
    
    // Отобразить товары в заказе
    const orderProducts = document.getElementById('order-products');
    orderProducts.innerHTML = '';
    
    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const productElem = document.createElement('div');
        productElem.className = 'order-product-item';
        
        // Корректируем путь к изображению
        let imagePath = item.image || '';
        
        // Если путь относительный и начинается с "img/", добавляем "../" для правильного пути в админ-панели
        if (imagePath.startsWith('img/')) {
            imagePath = '../' + imagePath;
        }
        
        productElem.innerHTML = `
            <img src="${imagePath}" alt="${item.name}">
            <div class="order-product-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} € × ${item.quantity} шт.</p>
            </div>
            <div class="order-product-price">${itemTotal.toFixed(2)} €</div>
        `;
        orderProducts.appendChild(productElem);
    });
    
    // Обновить итоговую сумму
    document.getElementById('order-total-price').textContent = `${order.totalPrice.toFixed(2)} €`;
}

// Функция для обновления статуса заказа
function updateOrderStatus() {
    // Получить ID заказа из заголовка
    const orderId = parseInt(document.getElementById('order-id-display').textContent.replace('#', ''));
    const newStatus = document.getElementById('order-status-select').value;
    
    // Получить заказы из localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        alert('Заказ не найден');
        return;
    }
    
    // Обновить статус заказа
    orders[orderIndex].status = newStatus;
    
    // Сохранить обновленные заказы
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Обновить отображение
    viewOrderDetails(orderId);
    
    // Показать уведомление
    alert('Статус заказа обновлен');
}

let order=document.getElementById('order-btn')
order.addEventListener('click',function(){
    console.log('click')
})