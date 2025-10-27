// credits.js - Client Credits Management

class CreditsManager {
    constructor() {
        this.clients = [];
        this.currentEditId = null;
        this.currentPaymentClientId = null;
    }

    async init() {
        await this.loadClients();
        this.render();
        this.calculateTotalCredit();
    }

    async loadClients() {
        try {
            this.clients = await storage.getClients();
        } catch (error) {
            console.error('Error loading clients:', error);
            this.clients = [];
        }
    }

    async saveClients() {
        // Not used - we save individual clients
    }

    render() {
        this.renderClientsTable();
    }

    renderClientsTable() {
        const tbody = document.getElementById('clients-table-body');
        if (!tbody) return;

        if (this.clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #6c757d;">
                        <i class="ph ph-users-three" style="font-size: 3rem; display: block; margin-bottom: 0.5rem;"></i>
                        ${fr.credits.noClients}
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by remaining balance (highest first)
        const sortedClients = [...this.clients].sort((a, b) => b.remainingBalance - a.remainingBalance);

        tbody.innerHTML = sortedClients.map(client => `
            <tr>
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${client.totalDebt.toFixed(2)} DH</td>
                <td>${client.amountPaid.toFixed(2)} DH</td>
                <td><strong style="color: ${client.remainingBalance > 0 ? '#ef4444' : '#10b981'};">${client.remainingBalance.toFixed(2)} DH</strong></td>
                <td class="table-actions">
                    <button class="btn-icon btn-icon-primary" onclick="creditsManager.openPaymentModal('${client.id}')" title="Ajouter un paiement">
                        <i class="ph ph-currency-circle-dollar"></i>
                    </button>
                    <button class="btn-icon btn-icon-secondary" onclick="creditsManager.editClient('${client.id}')" title="Modifier">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                    <button class="btn-icon btn-icon-danger" onclick="creditsManager.deleteClient('${client.id}')" title="Supprimer">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async calculateTotalCredit() {
        const total = this.clients.reduce((sum, client) => sum + client.remainingBalance, 0);
        const totalElement = document.getElementById('total-credit-value');
        if (totalElement) {
            totalElement.textContent = `${total.toFixed(2)} DH`;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const totalDebt = parseFloat(document.getElementById('client-debt').value);

        if (!name || !phone || isNaN(totalDebt)) {
            alert('Veuillez remplir tous les champs correctement');
            return;
        }

        try {
            if (this.currentEditId) {
                // Update existing client
                const index = this.clients.findIndex(c => c.id === this.currentEditId);
                if (index !== -1) {
                    const currentClient = this.clients[index];
                    this.clients[index] = {
                        ...currentClient,
                        name,
                        phone,
                        totalDebt,
                        remainingBalance: totalDebt - currentClient.amountPaid
                    };
                    await storage.saveClient(this.clients[index]);
                    this.showNotification(fr.credits.updateSuccess);
                }
            } else {
                // Add new client
                const newClient = {
                    id: crypto.randomUUID(),
                    name,
                    phone,
                    totalDebt,
                    amountPaid: 0,
                    remainingBalance: totalDebt
                };
                this.clients.push(newClient);
                await storage.saveClient(newClient);
                this.showNotification(fr.credits.addSuccess);
            }

            this.resetForm();
            await this.loadClients();
            this.render();
            this.calculateTotalCredit();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Erreur lors de l\'enregistrement: ' + error.message);
        }
    }

    editClient(id) {
        const client = this.clients.find(c => c.id === id);
        if (!client) return;

        this.currentEditId = id;

        document.getElementById('client-name').value = client.name;
        document.getElementById('client-phone').value = client.phone;
        document.getElementById('client-debt').value = client.totalDebt;

        const formTitle = document.querySelector('#client-form-title span');
        if (formTitle) {
            formTitle.textContent = fr.credits.editClient;
        }

        const cancelBtn = document.getElementById('cancel-client-btn');
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }

        // Scroll to form
        document.getElementById('add-client-form').scrollIntoView({ behavior: 'smooth' });
    }

    async deleteClient(id) {
        if (!confirm(fr.credits.deleteConfirm)) return;

        try {
            await storage.deleteClient(id);
            await this.loadClients();
            this.render();
            this.calculateTotalCredit();
            this.showNotification(fr.credits.deleteSuccess);
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Erreur lors de la suppression: ' + error.message);
        }
    }

    openPaymentModal(clientId) {
        this.currentPaymentClientId = clientId;
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('payment-amount').value = '';
            document.getElementById('payment-amount').focus();
        }
    }

    closePaymentModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentPaymentClientId = null;
    }

    async handlePaymentSubmit(e) {
        e.preventDefault();

        const amount = parseFloat(document.getElementById('payment-amount').value);

        if (isNaN(amount) || amount <= 0) {
            alert(fr.credits.invalidAmount);
            return;
        }

        if (!this.currentPaymentClientId) {
            alert('Erreur: Aucun client sélectionné');
            return;
        }

        try {
            await storage.addPaymentToClient(this.currentPaymentClientId, amount);
            
            this.showNotification(fr.credits.paymentSuccess);
            this.closePaymentModal();
            
            await this.loadClients();
            this.render();
            this.calculateTotalCredit();
        } catch (error) {
            console.error('Error adding payment:', error);
            alert('Erreur lors de l\'ajout du paiement: ' + error.message);
        }
    }

    resetForm() {
        document.getElementById('add-client-form').reset();
        this.currentEditId = null;

        const formTitle = document.querySelector('#client-form-title span');
        if (formTitle) {
            formTitle.textContent = fr.credits.addClient;
        }

        const cancelBtn = document.getElementById('cancel-client-btn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
    }

    showNotification(message) {
        if (typeof showToast === 'function') {
            showToast(message);
        } else {
            console.log('Notification:', message);
        }
    }
}

// Create global instance
const creditsManager = new CreditsManager();

// Initialize function for navigation
function initCreditsPage() {
    creditsManager.init();
}

