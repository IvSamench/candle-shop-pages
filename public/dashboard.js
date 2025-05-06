/**
 * Дополнительные функции управления товарами для дашборда
 * Additional product management functions for dashboard
 * 
 * Файл содержит вспомогательные функции для локального управления товарами
 * The file contains helper functions for local product management
 */

/**
 * Отображает форму добавления нового товара
 * Displays form for adding a new product
 */
function showAddProductForm() {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Добавить товар';
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productInStock').checked = false;
}

/**
 * Скрывает форму добавления/редактирования товара
 * Hides product add/edit form
 */
function hideProductForm() {
    document.getElementById('product-form').style.display = 'none';
}

/**
 * Удаляет товар из списка (работает только локально, без сохранения)
 * Removes product from list (works only locally, without saving)
 * 
 * @param {number} id - ID товара для удаления
 */
function deleteProduct(id) {
    products = products.filter(product => product.id !== id);
    alert('Продукт удалён');
    renderProductCard(products);
}

/**
 * Загружает данные товара в форму для редактирования
 * Loads product data into form for editing
 * 
 * @param {number} id - ID товара
 * @param {string} name - Название товара
 * @param {number} price - Цена товара
 * @param {string} description - Описание товара
 * @param {boolean} inStock - Наличие товара на складе
 */
function editProduct(id, name, price, description, inStock) {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Редактировать товар';
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = name;
    document.getElementById('productPrice').value = price;
    document.getElementById('productDescription').value = description;
    document.getElementById('productInStock').checked = inStock;
}

/**
 * Обработчик отправки формы добавления/редактирования товара
 * Handler for product add/edit form submission
 * 
 * Примечание: Изменения сохраняются только в памяти и будут потеряны при перезагрузке страницы
 * Note: Changes are stored only in memory and will be lost when page is reloaded
 */
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const inStock = document.getElementById('productInStock').checked;

    if (id) {
        // Редактирование существующего товара
        // Edit existing product
        const product = products.find(product => product.id === parseInt(id));
        if (product) {
            product.name = name;
            product.price = parseFloat(price);
            product.description = description;
            product.inStock = inStock;
        }
    } else {
        // Добавление нового товара
        // Add new product
        const newProduct = {
            id: Date.now(), // Используем текущую метку времени как уникальный ID
            name,
            price: parseFloat(price),
            description,
            inStock
        };
        products.push(newProduct);
    }

    alert('Продукт сохранён');
    renderProductCard(products);
    hideProductForm();
});