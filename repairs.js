// repairs.js - Repairs CRUD operations

class RepairsManager {
  constructor() {
    this.repairs = [];
    this.currentEditId = null;
  }

  async init() {
    await this.loadRepairs();
    this.render();
    this.attachEventListeners();
  }

  async loadRepairs() {
    this.repairs = await storage.getRepairs();
  }

  async saveRepairs() {
    await storage.setRepairs(this.repairs);
  }

  render() {
    const container = document.getElementById('repairs-list');
    if (!container) return;

    if (this.repairs.length === 0) {
      container.innerHTML = `<p class="no-data">${fr.repairs.noRepairs}</p>`;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${fr.repairs.customerName}</th>
            <th>${fr.repairs.device}</th>
            <th>${fr.repairs.issue}</th>
            <th>${fr.repairs.status}</th>
            <th>${fr.repairs.cost}</th>
            <th>${fr.repairs.createdAt}</th>
            <th>${fr.repairs.actions}</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Sort repairs by date (newest first)
    const sortedRepairs = [...this.repairs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sortedRepairs.forEach(repair => {
      const createdDate = new Date(repair.created_at).toLocaleDateString('fr-FR');
      const statusLabel = this.getStatusLabel(repair.status);
      const statusClass = `status-${repair.status}`;

      html += `
        <tr>
          <td>${this.escapeHtml(repair.customer_name)}</td>
          <td>${this.escapeHtml(repair.device)}</td>
          <td>${this.escapeHtml(repair.issue)}</td>
          <td><span class="badge ${statusClass}">${statusLabel}</span></td>
          <td>${repair.cost.toFixed(2)} DH</td>
          <td>${createdDate}</td>
          <td>
            <button class="btn btn-sm btn-edit" onclick="repairsManager.editRepair('${repair.id}')">${fr.repairs.edit}</button>
            <button class="btn btn-sm btn-delete" onclick="repairsManager.deleteRepair('${repair.id}')">${fr.repairs.delete}</button>
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
    
    const cancelBtn = document.getElementById('cancel-repair-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resetForm());
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const customer_name = document.getElementById('repair-customer').value.trim();
    const device = document.getElementById('repair-device').value.trim();
    const issue = document.getElementById('repair-issue').value.trim();
    const status = document.getElementById('repair-status').value;
    const cost = parseFloat(document.getElementById('repair-cost').value);

    if (!customer_name || !device || !issue || !status || isNaN(cost)) {
      alert('Veuillez remplir tous les champs correctement');
      return;
    }

    if (this.currentEditId) {
      // Update existing repair
      const index = this.repairs.findIndex(r => r.id === this.currentEditId);
      if (index !== -1) {
        this.repairs[index] = {
          ...this.repairs[index],
          customer_name,
          device,
          issue,
          status,
          cost,
          updated_at: new Date().toISOString()
        };
        await this.saveRepairs();
        this.showNotification(fr.repairs.updateSuccess);
      }
    } else {
      // Add new repair
      const newRepair = {
        id: crypto.randomUUID(),
        customer_name,
        device,
        issue,
        status,
        cost,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.repairs.push(newRepair);
      await this.saveRepairs();
      this.showNotification(fr.repairs.addSuccess);
    }

    this.resetForm();
    this.render();
  }

  editRepair(id) {
    const repair = this.repairs.find(r => r.id === id);
    if (!repair) return;

    this.currentEditId = id;

    document.getElementById('repair-customer').value = repair.customer_name;
    document.getElementById('repair-device').value = repair.device;
    document.getElementById('repair-issue').value = repair.issue;
    document.getElementById('repair-status').value = repair.status;
    document.getElementById('repair-cost').value = repair.cost;

    const formTitle = document.getElementById('repair-form-title');
    if (formTitle) {
      formTitle.textContent = fr.repairs.editRepair;
    }
    document.getElementById('cancel-repair-btn').style.display = 'inline-block';

    // Scroll to form
    document.getElementById('repair-form').scrollIntoView({ behavior: 'smooth' });
  }

  async deleteRepair(id) {
    if (!confirm(fr.repairs.deleteConfirm)) return;

    try {
      // Delete from Firebase
      await storage.deleteRepair(id);
      
      // Reload data from Firebase
      await this.loadRepairs();
      
      // Re-render the table
      this.render();
      
      this.showNotification(fr.repairs.deleteSuccess);
    } catch (error) {
      console.error('Error deleting repair:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  }

  resetForm() {
    document.getElementById('repair-form').reset();
    this.currentEditId = null;
    const formTitle = document.getElementById('repair-form-title');
    if (formTitle) {
      formTitle.textContent = fr.repairs.addRepair;
    }
    document.getElementById('cancel-repair-btn').style.display = 'none';
  }

  getStatusLabel(status) {
    const labels = {
      'pending': fr.repairs.pending,
      'in_progress': fr.repairs.inProgress,
      'completed': fr.repairs.completed
    };
    return labels[status] || status;
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
const repairsManager = new RepairsManager();

// Global init function for app.js
function initRepairsPage() {
  repairsManager.init();
}

