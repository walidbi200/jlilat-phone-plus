// suppliers.js - Suppliers/Payables Management

class SuppliersManager {
    constructor() {
        this.suppliers = [];
        this.currentEditId = null;
    }

    async init() {
        await this.loadSuppliers();
        this.render();
        this.calculateTotalOwed();
    }

    async loadSuppliers() {
        try {
            this.suppliers = await storage.getSuppliers();
        } catch (error) {
            console.error('Error loading suppliers:', error);
            this.suppliers = [];
        }
    }

    render() {
        this.renderSuppliersTable();
    }

    renderSuppliersTable() {
        const tbody = document.getElementById('suppliers-table-body');
        if (!tbody) return;

        if (this.suppliers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #6c757d;">
                        <i class="ph ph-truck" style="font-size: 3rem; display: block; margin-bottom: 0.5rem;"></i>
                        ${fr.suppliers.noSuppliers}
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by isPaid (unpaid first), then by due date
        const sortedSuppliers = [...this.suppliers].sort((a, b) => {
            if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate - b.dueDate;
        });

        tbody.innerHTML = sortedSuppliers.map(supplier => {
            const dueDateStr = supplier.dueDate 
                ? new Date(supplier.dueDate).toLocaleDateString('fr-FR') 
                : '-';
            const statusBadge = supplier.isPaid 
                ? `<span class="badge status-completed">${fr.suppliers.statusPaid}</span>`
                : `<span class="badge status-pending">${fr.suppliers.statusUnpaid}</span>`;
            
            return `
                <tr data-id="${supplier.id}">
                    <td>${supplier.name}</td>
                    <td><strong>${supplier.amountOwed.toFixed(2)} DH</strong></td>
                    <td>${dueDateStr}</td>
                    <td>${statusBadge}</td>
                    <td class="table-actions">
                        ${!supplier.isPaid ? `
                            <button class="btn-icon btn-icon-success" onclick="suppliersManager.markAsPaid('${supplier.id}')" title="${fr.suppliers.markAsPaid}">
                                <i class="ph ph-check-circle"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon btn-icon-secondary" onclick="suppliersManager.editSupplier('${supplier.id}')" title="${fr.suppliers.edit}">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon btn-icon-danger" onclick="suppliersManager.deleteSupplier('${supplier.id}')" title="${fr.suppliers.delete}">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async calculateTotalOwed() {
        const total = this.suppliers
            .filter(s => !s.isPaid)
            .reduce((sum, supplier) => sum + supplier.amountOwed, 0);
        const totalElement = document.getElementById('total-suppliers-owed');
        if (totalElement) {
            totalElement.textContent = `${total.toFixed(2)} DH`;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('supplier-name').value.trim();
        const amountOwed = parseFloat(document.getElementById('supplier-amount').value);
        const dueDateInput = document.getElementById('supplier-due-date').value;

        if (!name || isNaN(amountOwed) || amountOwed <= 0) {
            alert('Veuillez remplir tous les champs requis correctement');
            return;
        }

        try {
            const dueDate = dueDateInput ? new Date(dueDateInput).getTime() : null;

            if (this.currentEditId) {
                // Update existing supplier
                const index = this.suppliers.findIndex(s => s.id === this.currentEditId);
                if (index !== -1) {
                    this.suppliers[index] = {
                        ...this.suppliers[index],
                        name,
                        amountOwed,
                        dueDate
                    };
                    await storage.saveSupplier(this.suppliers[index]);
                    this.showNotification(fr.suppliers.updateSuccess);
                }
            } else {
                // Add new supplier
                const newSupplier = {
                    id: crypto.randomUUID(),
                    name,
                    amountOwed,
                    dueDate,
                    isPaid: false,
                    createdAt: Date.now()
                };
                this.suppliers.push(newSupplier);
                await storage.saveSupplier(newSupplier);
                this.showNotification(fr.suppliers.addSuccess);
            }

            this.resetForm();
            this.render();
            await this.calculateTotalOwed();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Erreur: ' + error.message);
        }
    }

    async editSupplier(id) {
        const supplier = this.suppliers.find(s => s.id === id);
        if (!supplier) return;

        this.currentEditId = id;

        document.getElementById('supplier-name').value = supplier.name;
        document.getElementById('supplier-amount').value = supplier.amountOwed;
        document.getElementById('supplier-due-date').value = supplier.dueDate 
            ? new Date(supplier.dueDate).toISOString().split('T')[0] 
            : '';

        // Update form title
        const formTitle = document.querySelector('#supplier-form-title');
        if (formTitle) {
            formTitle.textContent = fr.suppliers.editSupplier;
        }

        // Show cancel button
        const cancelBtn = document.getElementById('cancel-supplier-btn');
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }

        // Scroll to form
        document.getElementById('add-supplier-form').scrollIntoView({ behavior: 'smooth' });
    }

    async deleteSupplier(id) {
        if (!confirm(fr.suppliers.deleteConfirm)) return;

        try {
            await storage.deleteSupplier(id);
            this.suppliers = this.suppliers.filter(s => s.id !== id);
            this.showNotification(fr.suppliers.deleteSuccess);
            this.render();
            await this.calculateTotalOwed();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Erreur: ' + error.message);
        }
    }

    async markAsPaid(id) {
        try {
            // PERFORMANCE FIX: Update local state first to avoid search, then save
            const supplier = this.suppliers.find(s => s.id === id);
            if (supplier) {
                supplier.isPaid = true;
                supplier.paidAt = Date.now();
            }
            
            // Update in Firebase
            await storage.markSupplierPaid(id);
            
            this.showNotification(fr.suppliers.paidSuccess);
            this.render();
            await this.calculateTotalOwed();
        } catch (error) {
            console.error('Error marking supplier as paid:', error);
            // Revert on error
            if (supplier) {
                supplier.isPaid = false;
                delete supplier.paidAt;
            }
            alert('Erreur: ' + error.message);
        }
    }

    resetForm() {
        document.getElementById('add-supplier-form').reset();
        this.currentEditId = null;

        const formTitle = document.querySelector('#supplier-form-title');
        if (formTitle) {
            formTitle.textContent = fr.suppliers.addSupplier;
        }

        const cancelBtn = document.getElementById('cancel-supplier-btn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Create global instance
const suppliersManager = new SuppliersManager();

// Global init function for app.js
function initSuppliersPage() {
    suppliersManager.init();
}

