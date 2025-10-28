// credits.js - Client Credits Management

// Pagination state for payment history
let currentHistoryClientId = null;
let lastFetchedPaymentDate = null;

// PERFORMANCE FIX: Selected client ID for action buttons
let selectedClientId = null;

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
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #6c757d;">
                        <i class="ph ph-users-three" style="font-size: 3rem; display: block; margin-bottom: 0.5rem;"></i>
                        ${fr.credits.noClients}
                    </td>
                </tr>
            `;
            this.disableActionButtons();
            return;
        }

        // Sort by remaining balance (highest first)
        const sortedClients = [...this.clients].sort((a, b) => b.remainingBalance - a.remainingBalance);

        // PERFORMANCE FIX: No action buttons in rows, just selectable rows
        tbody.innerHTML = sortedClients.map(client => `
            <tr class="client-row" data-id="${client.id}">
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${client.totalDebt.toFixed(2)} DH</td>
                <td>${client.amountPaid.toFixed(2)} DH</td>
                <td><strong style="color: ${client.remainingBalance > 0 ? '#ef4444' : '#10b981'};">${client.remainingBalance.toFixed(2)} DH</strong></td>
            </tr>
        `).join('');

        // PERFORMANCE FIX: Single event listener using event delegation
        // Only attach if not already attached (check for flag)
        if (!tbody.hasAttribute('data-click-handler-attached')) {
            tbody.setAttribute('data-click-handler-attached', 'true');
            tbody.addEventListener('click', (e) => {
                const row = e.target.closest('tr.client-row');
                if (!row) return;

                const clientId = row.dataset.id;
                
                // Remove 'selected' class from all rows
                tbody.querySelectorAll('tr.selected').forEach(tr => tr.classList.remove('selected'));
                
                // Add 'selected' class to clicked row
                row.classList.add('selected');
                
                // Store selected client ID
                selectedClientId = clientId;
                
                // Enable action buttons
                this.enableActionButtons();
            });
        }
    }

    enableActionButtons() {
        document.getElementById('view-history-action-btn').disabled = false;
        document.getElementById('edit-client-action-btn').disabled = false;
        document.getElementById('delete-client-action-btn').disabled = false;
    }

    disableActionButtons() {
        document.getElementById('view-history-action-btn').disabled = true;
        document.getElementById('edit-client-action-btn').disabled = true;
        document.getElementById('delete-client-action-btn').disabled = true;
        selectedClientId = null;
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
        const dueDateInput = document.getElementById('client-due-date').value;

        if (!name || !phone || isNaN(totalDebt)) {
            alert('Veuillez remplir tous les champs correctement');
            return;
        }

        try {
            const paymentDueDate = dueDateInput ? new Date(dueDateInput).getTime() : null;

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
                        paymentDueDate,
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
                    remainingBalance: totalDebt,
                    paymentDueDate
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

    editClient(id = null) {
        // Use selectedClientId if no ID provided
        const clientId = id || selectedClientId;
        if (!clientId) return;
        
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;

        this.currentEditId = clientId;

        document.getElementById('client-name').value = client.name;
        document.getElementById('client-phone').value = client.phone;
        document.getElementById('client-debt').value = client.totalDebt;
        document.getElementById('client-due-date').value = client.paymentDueDate 
            ? new Date(client.paymentDueDate).toISOString().split('T')[0] 
            : '';

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

    async deleteClient(id = null) {
        // Use selectedClientId if no ID provided
        const clientId = id || selectedClientId;
        if (!clientId) return;
        
        if (!confirm(fr.credits.deleteConfirm)) return;

        try {
            await storage.deleteClient(clientId);
            await this.loadClients();
            this.disableActionButtons(); // Reset selection
            this.render();
            this.calculateTotalCredit();
            this.showNotification(fr.credits.deleteSuccess);
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Erreur lors de la suppression: ' + error.message);
        }
    }

    // NEW: Open payment history modal with history list and form
    // PERFORMANCE FIX: Accept clientName as parameter to avoid searching this.clients array
    async openPaymentHistoryModal(clientId, clientName) {
        // Set modal title and hidden ID
        document.getElementById('history-client-name').textContent = clientName;
        document.getElementById('payment-client-id').value = clientId; // Store ID for the form

        // Reset pagination state for new client
        currentHistoryClientId = clientId;
        lastFetchedPaymentDate = null;
        document.getElementById('payment-history-list').innerHTML = '<tr><td colspan="3">Chargement...</td></tr>';
        document.getElementById('load-more-payments-container').style.display = 'none';

        // Show the modal
        document.getElementById('payment-history-modal').classList.add('active');
        
        // Load the first batch of payments
        await loadMorePayments();

        // Clear and focus the payment amount input
        document.getElementById('payment-amount').value = '';
        document.getElementById('payment-notes').value = '';
    }


    // UPDATED: Handle payment form submit (from the modal)
    async handlePaymentSubmit(e) {
        e.preventDefault();
        
        const clientId = document.getElementById('payment-client-id').value;
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const notes = document.getElementById('payment-notes').value.trim();

        if (!clientId || !amount || amount <= 0) {
            this.showNotification('Veuillez entrer un montant valide.', true);
            return;
        }

        try {
            await storage.addPaymentToClient(clientId, amount, notes);
            this.showNotification('Paiement ajouté avec succès!');
            
            // Reset the form
            document.getElementById('payment-amount').value = '';
            document.getElementById('payment-notes').value = '';
            
            // PAGINATION FIX: Reset pagination and reload payment history
            lastFetchedPaymentDate = null;
            document.getElementById('payment-history-list').innerHTML = '<tr><td colspan="3">Chargement...</td></tr>';
            document.getElementById('load-more-payments-container').style.display = 'none';
            await loadMorePayments();
            
            // Refresh the main clients table (to show updated balances)
            await this.loadClients();
            this.render();
            await this.calculateTotalCredit();

        } catch (error) {
            console.error("Error adding payment:", error);
            this.showNotification('Erreur: ' + error.message, true);
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
        
        // Reset selection
        this.disableActionButtons();
        const tbody = document.getElementById('clients-table-body');
        if (tbody) {
            tbody.querySelectorAll('tr.selected').forEach(tr => tr.classList.remove('selected'));
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

// NEW: Load more payments function (for pagination)
async function loadMorePayments() {
    if (!currentHistoryClientId) return;

    const loadMoreBtn = document.getElementById('load-more-payments-btn');
    const loadMoreContainer = document.getElementById('load-more-payments-container');
    const historyList = document.getElementById('payment-history-list');

    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Chargement...';
    }

    try {
        // Fetch the next batch using the stored last date
        const { payments, lastDate } = await storage.getPaymentHistory(
            currentHistoryClientId, 
            lastFetchedPaymentDate
        );

        if (payments.length === 0 && lastFetchedPaymentDate === null) {
            // If first load is empty
            historyList.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: #6b7280;">Aucun paiement trouvé.</td></tr>';
        } else {
            // Clear "loading" message on first load
            if (lastFetchedPaymentDate === null && historyList.querySelector('td[colspan="3"]')) {
                historyList.innerHTML = '';
            }

            // Append new rows to the table
            payments.forEach(payment => {
                const tr = document.createElement('tr');
                const paymentDate = new Date(payment.date).toLocaleDateString('fr-FR');
                tr.innerHTML = `
                    <td>${paymentDate}</td>
                    <td><strong>${payment.amount.toFixed(2)} DH</strong></td>
                    <td>${payment.notes || '-'}</td>
                `;
                historyList.appendChild(tr);
            });
        }

        // Update the state for the next fetch
        lastFetchedPaymentDate = lastDate;

        // Show or hide the "Load More" button
        if (lastDate) {
            // If there might be more payments
            loadMoreContainer.style.display = 'block';
            if (loadMoreBtn) {
                loadMoreBtn.disabled = false;
                loadMoreBtn.innerHTML = '<i class="ph ph-arrows-down-up"></i> Charger Plus';
            }
        } else {
            // No more payments to load
            loadMoreContainer.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading more payments:', error);
        if (typeof showToast === 'function') {
            showToast('Erreur lors du chargement des paiements.', true);
        }
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="ph ph-arrows-down-up"></i> Charger Plus';
        }
    }
}

// Create global instance
const creditsManager = new CreditsManager();

// Initialize function for navigation
function initCreditsPage() {
    creditsManager.init();
}

