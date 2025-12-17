document.addEventListener('DOMContentLoaded', () => {
    // DATOS INICIALES (Simulando una base de datos)
    let products = [
        { id: 1, name: 'Leche entera 1100 ml – Bolsa', category: 'Lacteos', price: 29500, oldPrice: 36900, stock: 150, description: 'Leche entera de alta calidad en presentación de 1100ml', isOffer: true },
        { id: 2, name: 'Aceite Gourmet Familia Multiusos 1,8 Lt X2', category: 'Abarrotes', price: 45900, oldPrice: 52900, stock: 75, description: 'Pack de 2 aceites multiusos de 1.8 litros cada uno', isOffer: true },
        { id: 3, name: 'Arroz Premium 1kg', category: 'Abarrotes', price: 15000, oldPrice: null, stock: 200, description: 'Arroz de grano largo premium', isOffer: false },
        { id: 4, name: 'Yogurt Natural 1L', category: 'Lacteos', price: 8500, oldPrice: null, stock: 120, description: 'Yogurt natural sin azúcar', isOffer: false },
        { id: 5, name: 'Manzanas Rojas 1kg', category: 'Verduras y frutas', price: 12000, oldPrice: null, stock: 80, description: 'Manzanas rojas frescas', isOffer: false },
    ];

    // ELEMENTOS DEL DOM
    const tableBody = document.getElementById('product-table-body');
    const productCount = document.getElementById('product-count');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    const productModal = document.getElementById('product-modal');
    const deleteModal = document.getElementById('delete-modal');
    const productForm = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    const formSubmitBtn = document.getElementById('form-submit-btn');

    // === USUARIO SIMULADO (Para mostrar perfil de administrador) ===
    // Cambia esto según la sesión real; solamente para demo/local
    const currentUser = { name: 'Administrador', role: 'admin' };

    const renderUserProfile = () => {
        const headerProfile = document.getElementById('header-profile');
        if (!headerProfile) return;

        // Mostrar sólo para administradores
        if (currentUser.role !== 'admin') {
            headerProfile.style.display = 'none';
            return;
        }

        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-role').textContent = 'Administrador';
        headerProfile.style.display = 'flex';

        const toggle = document.getElementById('profile-toggle');
        const dropdown = document.getElementById('profile-dropdown');

        // Alternar dropdown
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            headerProfile.classList.toggle('open');
            dropdown.setAttribute('aria-hidden', headerProfile.classList.contains('open') ? 'false' : 'true');
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!headerProfile.contains(e.target)) {
                headerProfile.classList.remove('open');
                dropdown.setAttribute('aria-hidden', 'true');
            }
        });

        // Acción de cerrar sesión (simulada)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Aquí podría ir la llamada real para cerrar sesión o redirección
                alert('Cerrando sesión (simulado)');
                // window.location.href = '/login.html';
            });
        }
    };

    // FUNCIÓN PARA RENDERIZAR LA TABLA
    const renderTable = () => {
        tableBody.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        filteredProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${product.name}
                    ${product.isOffer ? '<span class="tag tag-offer">Oferta</span>' : ''}
                </td>
                <td>${product.category}</td>
                <td>
                    <span class="price-current">$${product.price.toLocaleString('es-CO')}</span>
                    ${product.oldPrice ? `<span class="price-old">$${product.oldPrice.toLocaleString('es-CO')}</span>` : ''}
                </td>
                <td><span class="tag tag-stock">${product.stock} unidades</span></td>
                <td>${product.description}</td>
                <td class="actions-cell">
                    <button class="edit-btn" data-id="${product.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="delete-btn delete-icon" data-id="${product.id}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        productCount.textContent = `Mostrando ${filteredProducts.length} de ${products.length} productos`;
    };

    // MANEJO DE MODALES
    const openModal = (modal) => modal.classList.add('visible');
    const closeModal = (modal) => modal.classList.remove('visible');

    // ABRIR MODAL DE AÑADIR PRODUCTO
    document.getElementById('add-product-btn').addEventListener('click', () => {
        productForm.reset();
        modalTitle.textContent = 'Nuevo Producto';
        formSubmitBtn.textContent = 'Crear';
        document.getElementById('product-id').value = '';
        openModal(productModal);
    });

    // CERRAR MODALES
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(productModal));
    });
    document.getElementById('cancel-delete-btn').addEventListener('click', () => closeModal(deleteModal));

    // MANEJO DEL FORMULARIO (AÑADIR Y EDITAR)
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const formData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            oldPrice: document.getElementById('product-old-price').value ? parseFloat(document.getElementById('product-old-price').value) : null,
            stock: parseInt(document.getElementById('product-stock').value),
            description: document.getElementById('product-description').value,
            isOffer: !!document.getElementById('product-old-price').value
        };

        if (id) { // Editar producto
            const index = products.findIndex(p => p.id == id);
            products[index] = { ...products[index], ...formData };
        } else { // Crear producto
            formData.id = Date.now(); // ID único simple
            products.push(formData);
        }

        renderTable();
        closeModal(productModal);
    });

    // MANEJO DE ACCIONES EN LA TABLA (EDITAR Y ELIMINAR)
    tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const id = editBtn.dataset.id;
            const product = products.find(p => p.id == id);
            
            modalTitle.textContent = 'Editar Producto';
            formSubmitBtn.textContent = 'Actualizar';
            
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-old-price').value = product.oldPrice || '';
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-description').value = product.description;

            openModal(productModal);
        }

        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            openModal(deleteModal);
            
            const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
            // Usamos .cloneNode para evitar múltiples event listeners
            const newConfirmBtn = confirmDeleteBtn.cloneNode(true);
            confirmDeleteBtn.parentNode.replaceChild(newConfirmBtn, confirmDeleteBtn);

            newConfirmBtn.addEventListener('click', () => {
                products = products.filter(p => p.id != id);
                renderTable();
                closeModal(deleteModal);
            });
        }
    });

    // FILTROS EN TIEMPO REAL
    searchInput.addEventListener('input', renderTable);
    categoryFilter.addEventListener('change', renderTable);

    // RENDERIZADO INICIAL
    // Renderizar perfil (si aplica) y tabla
    renderUserProfile();
    renderTable();
});