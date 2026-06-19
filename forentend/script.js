const API_URL = "";
let allProducts = []; // Keep a copy of all loaded products for client-side search/filtering

// Show visual toast notifications
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    const toastIcon = document.getElementById("toast-icon");
    
    // Set icon based on type
    if (type === "success") {
        toast.className = "toast success show";
        toastIcon.className = "fa-solid fa-circle-check";
    } else {
        toast.className = "toast error show";
        toastIcon.className = "fa-solid fa-circle-xmark";
    }
    
    toastMessage.textContent = message;
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Fetch products from backend and calculate metrics
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch products from backend.");
        
        allProducts = await response.json();
        calculateMetrics(allProducts);
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error loading products:", error);
        showToast("Error connecting to backend database server.", "error");
    }
}

// Render products table
function renderProducts(productsList) {
    const tableBody = document.getElementById("product-table-body");
    const emptyState = document.getElementById("empty-state");
    
    tableBody.innerHTML = "";
    
    if (productsList.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    } else {
        emptyState.classList.add("hidden");
    }
    
    productsList.forEach(product => {
        // Stock status formatting
        let stockClass = "in-stock";
        let stockText = `${product.quantity} units`;
        
        if (product.quantity === 0) {
            stockClass = "out-of-stock";
            stockText = "Out of Stock";
        } else if (product.quantity <= 10) {
            stockClass = "low-stock";
            stockText = `${product.quantity} Low Stock`;
        }
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><span class="product-id-badge">#${product.id}</span></td>
            <td>
                <div class="product-info-cell">
                    <span class="product-name-txt">${escapeHTML(product.name)}</span>
                    <span class="product-desc-txt">${escapeHTML(product.description)}</span>
                </div>
            </td>
            <td><span class="product-price-txt">$${product.price.toFixed(2)}</span></td>
            <td><span class="stock-badge ${stockClass}">${stockText}</span></td>
            <td>
                <div class="actions-cell">
                    <button type="button" class="btn-icon edit" id="btn-edit-${product.id}" title="Edit Product">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn-icon delete" id="btn-delete-${product.id}" title="Delete Product">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
        
        // Attach event listeners dynamically to avoid JSON string escape bugs in inline attributes
        document.getElementById(`btn-edit-${product.id}`).addEventListener("click", () => startEditMode(product));
        document.getElementById(`btn-delete-${product.id}`).addEventListener("click", () => deleteProduct(product.id));
    });
}

// Calculate dashboard stats
function calculateMetrics(products) {
    const totalProducts = products.length;
    let totalValue = 0;
    let outOfStock = 0;
    
    products.forEach(p => {
        totalValue += (p.price * p.quantity);
        if (p.quantity === 0) {
            outOfStock++;
        }
    });
    
    document.getElementById("val-total-products").textContent = totalProducts;
    document.getElementById("val-total-value").textContent = `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("val-out-of-stock").textContent = outOfStock;
}

// Add or Edit form submit handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById("product-id").value);
    const name = document.getElementById("product-name").value.trim();
    const description = document.getElementById("product-description").value.trim();
    const price = parseFloat(document.getElementById("product-price").value);
    const quantity = parseInt(document.getElementById("product-quantity").value);
    const isEditMode = document.getElementById("edit-mode-active").value === "true";
    
    if (isNaN(id) || !name || !description || isNaN(price) || isNaN(quantity)) {
        showToast("Please fill all fields with valid data.", "error");
        return;
    }
    
    const productData = { id, name, description, price, quantity };
    
    try {
        if (isEditMode) {
            // Edit Mode: PUT /product?id=X
            const response = await fetch(`${API_URL}/product?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) throw new Error("Failed to update product.");
            showToast("Product updated successfully!", "success");
            cancelEditMode();
        } else {
            // Add Mode: POST /product
            // First check for ID uniqueness locally to avoid duplicate DB constraints
            const exists = allProducts.some(p => p.id === id);
            if (exists) {
                showToast(`Product ID #${id} already exists!`, "error");
                return;
            }
            
            const response = await fetch(`${API_URL}/product`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) throw new Error("Failed to add product.");
            showToast("Product added successfully!", "success");
            resetForm();
        }
        
        loadProducts();
    } catch (error) {
        console.error("Error saving product:", error);
        showToast("Error saving product to database.", "error");
    }
}

// Start Edit Mode
function startEditMode(product) {
    document.getElementById("edit-mode-active").value = "true";
    
    // Populate form
    const idInput = document.getElementById("product-id");
    idInput.value = product.id;
    idInput.disabled = true; // Disable modifying the primary key (ID)
    
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-description").value = product.description;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-quantity").value = product.quantity;
    
    // UI updates
    document.getElementById("form-action-text").textContent = "Edit Product Details";
    document.getElementById("form-icon").className = "fa-solid fa-pen-to-square header-icon";
    document.getElementById("btn-cancel-edit").classList.remove("hidden");
    
    // Scroll form into view for mobile devices
    document.getElementById("product-form").scrollIntoView({ behavior: 'smooth' });
}

// Cancel Edit Mode
function cancelEditMode() {
    document.getElementById("edit-mode-active").value = "false";
    
    const idInput = document.getElementById("product-id");
    idInput.disabled = false;
    
    resetForm();
    
    // UI resets
    document.getElementById("form-action-text").textContent = "Add New Product";
    document.getElementById("form-icon").className = "fa-solid fa-circle-plus header-icon";
    document.getElementById("btn-cancel-edit").classList.add("hidden");
}

// Reset Form fields
function resetForm() {
    document.getElementById("product-form").reset();
}

// Delete product
async function deleteProduct(id) {
    if (!confirm(`Are you sure you want to delete Product #${id}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/product?id=${id}`, {
            method: "DELETE"
        });
        
        if (!response.ok) throw new Error("Failed to delete product.");
        showToast("Product deleted successfully!", "success");
        
        // If the product deleted is currently being edited, cancel edit mode
        const isEditing = document.getElementById("edit-mode-active").value === "true";
        const editingId = parseInt(document.getElementById("product-id").value);
        if (isEditing && editingId === id) {
            cancelEditMode();
        }
        
        loadProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        showToast("Error deleting product from database.", "error");
    }
}

// Client-side search functionality
function handleSearch() {
    const query = document.getElementById("search-input").value.toLowerCase().trim();
    if (!query) {
        renderProducts(allProducts);
        return;
    }
    
    const filtered = allProducts.filter(product => {
        return product.id.toString().includes(query) ||
               product.name.toLowerCase().includes(query) ||
               product.description.toLowerCase().includes(query);
    });
    
    renderProducts(filtered);
    
    // Update empty state messaging dynamically
    const emptyText = document.getElementById("empty-state-text");
    if (filtered.length === 0) {
        emptyText.textContent = `No items matching "${query}"`;
    } else {
        emptyText.textContent = "No products inside stock";
    }
}

// Helper to escape HTML and prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Initial load on page load
loadProducts();