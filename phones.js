// phones.js - Phone sales management

class PhonesManager {
  constructor() {
    this.phones = [];
    this.currentEditId = null;
  }

  async init() {
    await this.loadPhones();
    this.render();
    this.attachEventListeners();
    this.setDefaultDate();
  }

  async loadPhones() {
    this.phones = await storage.getPhones();
  }

  async savePhones() {
    await storage.setPhones(this.phones);
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const saleDateInput = document.getElementById('phone-sale-date');
    if (saleDateInput && !saleDateInput.value) {
      saleDateInput.value = today;
    }
  }

  render() {
    const tableBody = document.getElementById('phones-table-body');
    if (!tableBody) return;

    if (this.phones.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" class="no-data">${fr.phones.noPhones}</td></tr>`;
      return;
    }

    // Sort by sale date (newest first)
    const sortedPhones = [...this.phones].sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));

    let html = '';
    sortedPhones.forEach(phone => {
      const saleDate = new Date(phone.sale_date).toLocaleDateString('fr-FR');

      html += `
        <tr>
          <td>${this.escapeHtml(phone.name || 'N/A')}</td>
          <td>${this.escapeHtml(phone.brand || 'N/A')}</td>
          <td>${saleDate}</td>
          <td>${this.escapeHtml(phone.customer_name)}</td>
          <td>${this.escapeHtml(phone.imei || 'N/A')}</td>
          <td>${phone.battery_health ? phone.battery_health + '%' : 'N/A'}</td>
          <td>${phone.charge_cycle || 'N/A'}</td>
          <td>${phone.selling_price.toFixed(2)} ${fr.common.currency}</td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="phonesManager.printPhone('${phone.id}')">${fr.phones.printWarranty}</button>
            <button class="btn btn-sm btn-edit" onclick="phonesManager.editPhone('${phone.id}')">${fr.phones.edit}</button>
            <button class="btn btn-sm btn-delete" onclick="phonesManager.deletePhone('${phone.id}')">${fr.phones.delete}</button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }

  attachEventListeners() {
    // Form submit listener is now in app.js to prevent duplicates
    // Only attach listeners for elements that are re-created on render
    
    const cancelBtn = document.getElementById('cancel-phone-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resetForm());
    }

    // Keep conditional logic listeners (these need to be re-attached)
    const brandSelect = document.getElementById('phone-brand');
    const conditionSelect = document.getElementById('phone-condition');
    const nameInput = document.getElementById('phone-name');

    if (brandSelect) {
      brandSelect.removeEventListener('change', this.boundUpdateFormLogic);
      this.boundUpdateFormLogic = () => this.updateFormLogic();
      brandSelect.addEventListener('change', this.boundUpdateFormLogic);
    }
    if (conditionSelect) {
      conditionSelect.removeEventListener('change', this.boundUpdateFormLogic);
      conditionSelect.addEventListener('change', this.boundUpdateFormLogic);
    }
    if (nameInput) {
      nameInput.removeEventListener('input', this.boundUpdateFormLogic);
      nameInput.addEventListener('input', this.boundUpdateFormLogic);
    }
  }

  updateFormLogic() {
    const brand = document.getElementById('phone-brand').value;
    const condition = document.getElementById('phone-condition').value;
    const name = document.getElementById('phone-name').value.toLowerCase();

    const conditionGroup = document.getElementById('phone-condition-group');
    const batteryGroup = document.getElementById('phone-battery-health-group');
    const cycleGroup = document.getElementById('phone-charge-cycle-group');

    // Default: hide all conditional fields
    conditionGroup.style.display = 'none';
    batteryGroup.style.display = 'none';
    cycleGroup.style.display = 'none';

    if (brand === 'Apple') {
      // Show condition field for Apple phones
      conditionGroup.style.display = 'block';

      // Show battery health for used Apple phones
      if (condition === 'Occasion') {
        batteryGroup.style.display = 'block';
      }

      // Show charge cycle for iPhone 15 and newer (15, 16, 17, 18, 19, 20+)
      if (/(15|16|17|18|19|2\d)/.test(name)) {
        cycleGroup.style.display = 'block';
      }
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('phone-name').value.trim();
    const brand = document.getElementById('phone-brand').value;
    const condition = document.getElementById('phone-condition').value;
    const battery_health = document.getElementById('phone-battery-health').value;
    const charge_cycle = document.getElementById('phone-charge-cycle').value;
    const sale_date = document.getElementById('phone-sale-date').value;
    const customer_name = document.getElementById('phone-customer-name').value.trim();
    const sn = document.getElementById('phone-sn').value.trim();
    const imei = document.getElementById('phone-imei').value.trim();
    const selling_price = parseFloat(document.getElementById('phone-selling-price').value);
    const buying_price = parseFloat(document.getElementById('phone-buying-price').value) || 0;
    const warranty_date = document.getElementById('phone-warranty-date').value;

    if (!name || !brand || !sale_date || !customer_name || isNaN(selling_price)) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const phoneData = {
      id: this.currentEditId || crypto.randomUUID(),
      name,
      brand,
      condition: brand === 'Apple' ? condition : null,
      battery_health: (brand === 'Apple' && condition === 'Occasion' && battery_health) ? parseInt(battery_health) : null,
      charge_cycle: charge_cycle ? parseInt(charge_cycle) : null,
      sale_date,
      customer_name,
      sn,
      imei,
      selling_price,
      buyingPrice: buying_price,
      warranty_date
    };

    if (this.currentEditId) {
      // Update existing phone
      const index = this.phones.findIndex(p => p.id === this.currentEditId);
      if (index !== -1) {
        this.phones[index] = phoneData;
        await this.savePhones();
        this.showNotification(fr.phones.updateSuccess);
      }
    } else {
      // Add new phone
      this.phones.push(phoneData);
      await this.savePhones();
      this.showNotification(fr.phones.addSuccess);
    }

    this.resetForm();
    this.render();
  }

  editPhone(id) {
    const phone = this.phones.find(p => p.id === id);
    if (!phone) return;

    this.currentEditId = id;

    document.getElementById('phone-name').value = phone.name || '';
    document.getElementById('phone-brand').value = phone.brand || '';
    document.getElementById('phone-condition').value = phone.condition || 'Neuf';
    document.getElementById('phone-battery-health').value = phone.battery_health || '';
    document.getElementById('phone-charge-cycle').value = phone.charge_cycle || '';
    document.getElementById('phone-sale-date').value = phone.sale_date;
    document.getElementById('phone-customer-name').value = phone.customer_name;
    document.getElementById('phone-sn').value = phone.sn || '';
    document.getElementById('phone-imei').value = phone.imei || '';
    document.getElementById('phone-selling-price').value = phone.selling_price;
    document.getElementById('phone-buying-price').value = phone.buyingPrice || 0;
    document.getElementById('phone-warranty-date').value = phone.warranty_date || '';

    const formTitle = document.getElementById('phone-form-title');
    if (formTitle) {
      formTitle.textContent = fr.phones.editPhoneSale;
    }
    
    document.getElementById('cancel-phone-edit-btn').style.display = 'inline-block';
    document.getElementById('add-phone-form').scrollIntoView({ behavior: 'smooth' });

    // Trigger conditional logic to show/hide fields
    this.updateFormLogic();
  }

  async deletePhone(id) {
    if (!confirm(fr.phones.deleteConfirm)) return;

    this.phones = this.phones.filter(p => p.id !== id);
    await this.savePhones();
    this.showNotification(fr.phones.deleteSuccess);
    this.render();
  }

  resetForm() {
    document.getElementById('add-phone-form').reset();
    this.currentEditId = null;
    
    const formTitle = document.getElementById('phone-form-title');
    if (formTitle) {
      formTitle.textContent = fr.phones.addPhoneSale;
    }
    
    document.getElementById('cancel-phone-edit-btn').style.display = 'none';
    this.setDefaultDate();
    
    // Hide all conditional fields
    this.updateFormLogic();
  }

  printPhone(id) {
    const phone = this.phones.find(p => p.id === id);
    if (!phone) return;

    // Store phone data in localStorage for the print template
    localStorage.setItem('printPhoneData', JSON.stringify(phone));

    // Open print template in new window
    const printWindow = window.open('print-template.html', '_blank', 'width=800,height=600');
    
    // Trigger print when window loads
    if (printWindow) {
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    }
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create global instance
const phonesManager = new PhonesManager();

// Global init function for app.js
function initPhonesPage() {
  phonesManager.init();
}

