// products.js - Products CRUD operations and low-stock logic

class ProductsManager {
  constructor() {
    this.products = [];
    this.currentEditId = null;
  }

  async init() {
    await this.loadProducts();
    this.render();
    this.attachEventListeners();
  }

  async loadProducts() {
    this.products = await storage.getProducts();
  }

  async saveProducts() {
    await storage.setProducts(this.products);
  }

  render() {
    const container = document.getElementById('products-list');
    if (!container) return;

    if (this.products.length === 0) {
      container.innerHTML = `<p class="no-data">${fr.products.noProducts}</p>`;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${fr.products.name}</th>
            <th>${fr.products.category}</th>
            <th>${fr.products.buyingPrice}</th>
            <th>${fr.products.sellingPrice}</th>
            <th>${fr.products.stock}</th>
            <th>${fr.products.lowStockThreshold}</th>
            <th>${fr.products.actions}</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.products.forEach(product => {
      const isLowStock = product.stock <= product.low_stock_threshold;
      const lowStockClass = isLowStock ? 'low-stock' : '';
      const lowStockBadge = isLowStock ? `<span class="badge badge-warning">${fr.products.lowStockAlert}</span>` : '';

      const buyingPrice = product.buyingPrice || 0;
      const sellingPrice = product.price || product.sellingPrice || 0;
      
      html += `
        <tr class="${lowStockClass}">
          <td>${this.escapeHtml(product.name)}</td>
          <td>${this.escapeHtml(product.category)}</td>
          <td>${buyingPrice.toFixed(2)} DH</td>
          <td>${sellingPrice.toFixed(2)} DH</td>
          <td>${product.stock} ${lowStockBadge}</td>
          <td>${product.low_stock_threshold}</td>
          <td>
            <button class="btn btn-sm btn-edit" onclick="productsManager.editProduct('${product.id}')">${fr.products.edit}</button>
            <button class="btn btn-sm btn-delete" onclick="productsManager.deleteProduct('${product.id}')">${fr.products.delete}</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  attachEventListeners() {
    // Form submit listener is now in app.js to prevent duplicates
    // Only attach listeners for elements that are re-created on render
    
    const cancelBtn = document.getElementById('cancel-product-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resetForm());
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const buyingPrice = parseFloat(document.getElementById('product-buying-price').value);
    const sellingPrice = parseFloat(document.getElementById('product-selling-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const low_stock_threshold = parseInt(document.getElementById('product-threshold').value);
    const barcode = document.getElementById('product-barcode').value.trim();

    if (!name || !category || isNaN(buyingPrice) || isNaN(sellingPrice) || isNaN(stock) || isNaN(low_stock_threshold)) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    if (this.currentEditId) {
      // Update existing product
      const index = this.products.findIndex(p => p.id === this.currentEditId);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          name,
          category,
          buyingPrice,
          sellingPrice,
          price: sellingPrice, // Keep for backward compatibility
          stock,
          low_stock_threshold,
          barcode: barcode || ''
        };
        await this.saveProducts();
        this.showNotification(fr.products.updateSuccess);
      }
    } else {
      // Add new product
      const newProduct = {
        id: crypto.randomUUID(),
        name,
        category,
        buyingPrice,
        sellingPrice,
        price: sellingPrice, // Keep for backward compatibility
        stock,
        low_stock_threshold,
        barcode: barcode || ''
      };
      this.products.push(newProduct);
      await this.saveProducts();
      this.showNotification(fr.products.addSuccess);
    }

    this.resetForm();
    this.render();
  }

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    this.currentEditId = id;

    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-buying-price').value = product.buyingPrice || 0;
    document.getElementById('product-selling-price').value = product.sellingPrice || product.price || 0;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-threshold').value = product.low_stock_threshold;
    document.getElementById('product-barcode').value = product.barcode || '';

    const formTitle = document.getElementById('product-form-title');
    if (formTitle) {
      formTitle.textContent = fr.products.editProduct;
    }
    document.getElementById('cancel-product-btn').style.display = 'inline-block';
  }

  async deleteProduct(id) {
    if (!confirm(fr.products.deleteConfirm)) return;

    try {
      // Delete from Firebase
      await storage.deleteProduct(id);
      
      // Reload data from Firebase
      await this.loadProducts();
      
      // Re-render the table
      this.render();
      
      this.showNotification(fr.products.deleteSuccess);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  }

  resetForm() {
    document.getElementById('product-form').reset();
    this.currentEditId = null;
    const formTitle = document.getElementById('product-form-title');
    if (formTitle) {
      formTitle.textContent = fr.products.addProduct;
    }
    document.getElementById('cancel-product-btn').style.display = 'none';
  }

  async updateProductStock(productId, quantitySold) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.stock -= quantitySold;
      await this.saveProducts();
    }
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
const productsManager = new ProductsManager();

// Global init function for app.js
function initProductsPage() {
  productsManager.init();
}

