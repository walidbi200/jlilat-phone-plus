// sales.js - Sales CRUD operations and automatic stock updates

class SalesManager {
  constructor() {
    this.sales = [];
    this.currentSaleItems = [];
  }

  async init() {
    await this.loadSales();
    this.render();
    this.attachEventListeners();
    this.populateProductSelect();
  }

  async loadSales() {
    this.sales = await storage.getSales();
  }

  async saveSales() {
    await storage.setSales(this.sales);
  }

  render() {
    this.renderSalesList();
    this.renderCurrentSaleItems();
  }

  renderSalesList() {
    const container = document.getElementById('sales-list');
    if (!container) return;

    if (this.sales.length === 0) {
      container.innerHTML = `<p class="no-data">${FR.sales.noSales}</p>`;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${FR.sales.date}</th>
            <th>${FR.sales.items}</th>
            <th>${FR.sales.totalAmount}</th>
            <th>${FR.sales.paymentMethod}</th>
            <th>${FR.sales.actions}</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Sort sales by date (newest first)
    const sortedSales = [...this.sales].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedSales.forEach(sale => {
      const date = new Date(sale.date).toLocaleString('fr-FR');
      const itemCount = sale.items.length;
      const paymentMethod = this.getPaymentMethodLabel(sale.payment_method);

      html += `
        <tr>
          <td>${date}</td>
          <td>${itemCount} article(s)</td>
          <td>${sale.total.toFixed(2)} DH</td>
          <td>${paymentMethod}</td>
          <td>
            <button class="btn btn-sm btn-view" onclick="salesManager.viewSale('${sale.id}')">${FR.sales.view}</button>
            <button class="btn btn-sm btn-delete" onclick="salesManager.deleteSale('${sale.id}')">${FR.sales.delete}</button>
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

  renderCurrentSaleItems() {
    const container = document.getElementById('current-sale-items');
    if (!container) return;

    if (this.currentSaleItems.length === 0) {
      container.innerHTML = '<p class="no-data">Aucun article ajouté</p>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${FR.sales.product}</th>
            <th>${FR.sales.quantity}</th>
            <th>${FR.sales.unitPrice}</th>
            <th>${FR.sales.total}</th>
            <th>${FR.sales.actions}</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.currentSaleItems.forEach((item, index) => {
      html += `
        <tr>
          <td>${this.escapeHtml(item.productName)}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice.toFixed(2)} DH</td>
          <td>${(item.quantity * item.unitPrice).toFixed(2)} DH</td>
          <td>
            <button class="btn btn-sm btn-delete" onclick="salesManager.removeItem(${index})">${FR.sales.delete}</button>
          </td>
        </tr>
      `;
    });

    const total = this.currentSaleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    html += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align: right;"><strong>${FR.sales.total}:</strong></td>
            <td colspan="2"><strong>${total.toFixed(2)} DH</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    container.innerHTML = html;
  }

  attachEventListeners() {
    const addItemBtn = document.getElementById('add-sale-item-btn');
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => this.addItem());
    }

    const completeSaleBtn = document.getElementById('complete-sale-btn');
    if (completeSaleBtn) {
      completeSaleBtn.addEventListener('click', () => this.completeSale());
    }

    const cancelSaleBtn = document.getElementById('cancel-sale-btn');
    if (cancelSaleBtn) {
      cancelSaleBtn.addEventListener('click', () => this.cancelSale());
    }

    const productSelect = document.getElementById('sale-product');
    if (productSelect) {
      productSelect.addEventListener('change', () => this.updateProductInfo());
    }
  }

  populateProductSelect() {
    const select = document.getElementById('sale-product');
    if (!select) return;

    select.innerHTML = `<option value="">${FR.sales.selectProduct}</option>`;
    
    productsManager.products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} (Stock: ${product.stock})`;
      option.dataset.price = product.price;
      option.dataset.stock = product.stock;
      select.appendChild(option);
    });
  }

  updateProductInfo() {
    const select = document.getElementById('sale-product');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
      const price = selectedOption.dataset.price;
      document.getElementById('sale-unit-price').value = price;
    } else {
      document.getElementById('sale-unit-price').value = '';
    }
  }

  addItem() {
    const productId = document.getElementById('sale-product').value;
    const quantity = parseInt(document.getElementById('sale-quantity').value);

    if (!productId) {
      alert(FR.sales.selectProductFirst);
      return;
    }

    if (!quantity || quantity <= 0) {
      alert(FR.sales.enterQuantity);
      return;
    }

    const product = productsManager.getProductById(productId);
    if (!product) return;

    if (product.stock < quantity) {
      alert(FR.sales.insufficientStock);
      return;
    }

    this.currentSaleItems.push({
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.price
    });

    // Reset form
    document.getElementById('sale-product').value = '';
    document.getElementById('sale-quantity').value = '1';
    document.getElementById('sale-unit-price').value = '';

    this.renderCurrentSaleItems();
  }

  removeItem(index) {
    this.currentSaleItems.splice(index, 1);
    this.renderCurrentSaleItems();
  }

  async completeSale() {
    if (this.currentSaleItems.length === 0) {
      alert(FR.sales.addAtLeastOneItem);
      return;
    }

    const paymentMethod = document.getElementById('sale-payment-method').value;
    const total = this.currentSaleItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const newSale = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: this.currentSaleItems,
      total: total,
      payment_method: paymentMethod
    };

    // Update product stocks
    for (const item of this.currentSaleItems) {
      await productsManager.updateProductStock(item.productId, item.quantity);
    }

    // Save sale
    this.sales.push(newSale);
    await this.saveSales();

    // Refresh products display
    productsManager.render();

    // Reset
    this.currentSaleItems = [];
    this.showNotification(FR.sales.saleSuccess);
    this.render();
    this.populateProductSelect();
  }

  cancelSale() {
    if (this.currentSaleItems.length > 0) {
      if (!confirm('Annuler cette vente ?')) return;
    }
    this.currentSaleItems = [];
    this.renderCurrentSaleItems();
  }

  viewSale(id) {
    const sale = this.sales.find(s => s.id === id);
    if (!sale) return;

    const date = new Date(sale.date).toLocaleString('fr-FR');
    const paymentMethod = this.getPaymentMethodLabel(sale.payment_method);

    let itemsHtml = '<ul>';
    sale.items.forEach(item => {
      itemsHtml += `<li>${this.escapeHtml(item.productName)} - ${item.quantity} x ${item.unitPrice.toFixed(2)} DH = ${(item.quantity * item.unitPrice).toFixed(2)} DH</li>`;
    });
    itemsHtml += '</ul>';

    const message = `
      <div class="sale-details">
        <p><strong>${FR.sales.date}:</strong> ${date}</p>
        <p><strong>${FR.sales.paymentMethod}:</strong> ${paymentMethod}</p>
        <p><strong>${FR.sales.items}:</strong></p>
        ${itemsHtml}
        <p><strong>${FR.sales.total}:</strong> ${sale.total.toFixed(2)} DH</p>
      </div>
    `;

    this.showModal(FR.sales.saleDetails, message);
  }

  async deleteSale(id) {
    if (!confirm(FR.sales.deleteConfirm)) return;

    this.sales = this.sales.filter(s => s.id !== id);
    await this.saveSales();
    this.showNotification(FR.sales.deleteSuccess);
    this.render();
  }

  getPaymentMethodLabel(method) {
    const labels = {
      'cash': FR.sales.cash,
      'card': FR.sales.card,
      'transfer': FR.sales.transfer
    };
    return labels[method] || method;
  }

  showNotification(message) {
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

  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
const salesManager = new SalesManager();

// Global init function for app.js
function initSalesPage() {
  salesManager.init();
}

