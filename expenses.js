// expenses.js - Expense Tracking Management

class ExpensesManager {
    constructor() {
        this.expenses = [];
        this.currentEditId = null;
    }

    async init() {
        await this.loadExpenses();
        this.render();
        await this.calculateMonthlyExpenses();
    }

    async loadExpenses() {
        try {
            this.expenses = await storage.getExpenses();
        } catch (error) {
            console.error('Error loading expenses:', error);
            this.expenses = [];
        }
    }

    render() {
        this.renderExpensesTable();
    }

    renderExpensesTable() {
        const tbody = document.getElementById('expenses-table-body');
        if (!tbody) return;

        if (this.expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #6c757d;">
                        <i class="ph ph-receipt" style="font-size: 3rem; display: block; margin-bottom: 0.5rem;"></i>
                        ${fr.expenses.noExpenses}
                    </td>
                </tr>
            `;
            return;
        }

        // Sort by date (newest first)
        const sortedExpenses = [...this.expenses].sort((a, b) => b.date - a.date);

        tbody.innerHTML = sortedExpenses.map(expense => {
            const dateStr = new Date(expense.date).toLocaleDateString('fr-FR');
            const categoryLabel = this.getCategoryLabel(expense.category);
            
            return `
                <tr data-id="${expense.id}">
                    <td>${dateStr}</td>
                    <td><span class="badge status-inProgress">${categoryLabel}</span></td>
                    <td><strong>${expense.amount.toFixed(2)} DH</strong></td>
                    <td>${expense.description || '-'}</td>
                    <td class="table-actions">
                        <button class="btn-icon btn-icon-secondary" onclick="expensesManager.editExpense('${expense.id}')" title="${fr.expenses.edit}">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn-icon btn-icon-danger" onclick="expensesManager.deleteExpense('${expense.id}')" title="${fr.expenses.delete}">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getCategoryLabel(category) {
        const labels = {
            'rent': fr.expenses.categoryRent,
            'water': fr.expenses.categoryWater,
            'electricity': fr.expenses.categoryElectricity,
            'internet': fr.expenses.categoryInternet,
            'salaries': fr.expenses.categorySalaries,
            'supplies': fr.expenses.categorySupplies,
            'other': fr.expenses.categoryOther
        };
        return labels[category] || category;
    }

    async calculateMonthlyExpenses() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTotal = this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

        const totalElement = document.getElementById('total-expenses-month');
        if (totalElement) {
            totalElement.textContent = `${monthlyTotal.toFixed(2)} DH`;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        const dateInput = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const description = document.getElementById('expense-description').value.trim();

        if (!dateInput || !category || isNaN(amount) || amount <= 0) {
            alert('Veuillez remplir tous les champs requis correctement');
            return;
        }

        try {
            const date = new Date(dateInput).getTime();

            if (this.currentEditId) {
                // Update existing expense
                const index = this.expenses.findIndex(e => e.id === this.currentEditId);
                if (index !== -1) {
                    this.expenses[index] = {
                        ...this.expenses[index],
                        date,
                        category,
                        amount,
                        description
                    };
                    await storage.saveExpense(this.expenses[index]);
                    this.showNotification(fr.expenses.updateSuccess);
                }
            } else {
                // Add new expense
                const newExpense = {
                    id: crypto.randomUUID(),
                    date,
                    category,
                    amount,
                    description,
                    createdAt: Date.now()
                };
                this.expenses.push(newExpense);
                await storage.saveExpense(newExpense);
                this.showNotification(fr.expenses.addSuccess);
            }

            this.resetForm();
            this.render();
            await this.calculateMonthlyExpenses();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Erreur: ' + error.message);
        }
    }

    async editExpense(id) {
        const expense = this.expenses.find(e => e.id === id);
        if (!expense) return;

        this.currentEditId = id;

        document.getElementById('expense-date').value = new Date(expense.date).toISOString().split('T')[0];
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-description').value = expense.description || '';

        // Update form title
        const formTitle = document.querySelector('#expense-form-title');
        if (formTitle) {
            formTitle.textContent = fr.expenses.editExpense;
        }

        // Show cancel button
        const cancelBtn = document.getElementById('cancel-expense-btn');
        if (cancelBtn) {
            cancelBtn.style.display = 'inline-block';
        }

        // Scroll to form
        document.getElementById('add-expense-form').scrollIntoView({ behavior: 'smooth' });
    }

    async deleteExpense(id) {
        if (!confirm(fr.expenses.deleteConfirm)) return;

        try {
            await storage.deleteExpense(id);
            this.expenses = this.expenses.filter(e => e.id !== id);
            this.showNotification(fr.expenses.deleteSuccess);
            this.render();
            await this.calculateMonthlyExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Erreur: ' + error.message);
        }
    }

    resetForm() {
        document.getElementById('add-expense-form').reset();
        this.currentEditId = null;

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;

        const formTitle = document.querySelector('#expense-form-title');
        if (formTitle) {
            formTitle.textContent = fr.expenses.addExpense;
        }

        const cancelBtn = document.getElementById('cancel-expense-btn');
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
const expensesManager = new ExpensesManager();

// Global init function for app.js
function initExpensesPage() {
    expensesManager.init();
}

