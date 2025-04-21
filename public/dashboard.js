// Показать форму добавления товара
function showAddProductForm() {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Добавить товар';
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productInStock').checked = false;
}

// Скрыть форму
function hideProductForm() {
    document.getElementById('product-form').style.display = 'none';
}

// Удалить товар (локально)
function deleteProduct(id) {
    products = products.filter(product => product.id !== id);
    alert('Продукт удалён');
    renderProductCard(products);
}

// Редактировать товар (локально)
function editProduct(id, name, price, description, inStock) {
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('form-title').textContent = 'Редактировать товар';
    document.getElementById('productId').value = id;
    document.getElementById('productName').value = name;
    document.getElementById('productPrice').value = price;
    document.getElementById('productDescription').value = description;
    document.getElementById('productInStock').checked = inStock;
}

// Обработчик отправки формы (локально)
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const inStock = document.getElementById('productInStock').checked;

    if (id) {
        // Редактирование существующего товара
        const product = products.find(product => product.id === parseInt(id));
        if (product) {
            product.name = name;
            product.price = parseFloat(price);
            product.description = description;
            product.inStock = inStock;
        }
    } else {
        // Добавление нового товара
        const newProduct = {
            id: Date.now(),
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