// dashboard.js - Revenue and Profit Dashboard with Charts
// Reads from both general sales AND phone sales

// We need to keep chart instances in memory to destroy them before redrawing
let dailyChartInstance = null;
let monthlyChartInstance = null;

async function initDashboardPage() {
    // 1. FETCH ALL DATA SOURCES (Products, Sales, Phones)
    const [allProducts, generalSales, phoneSales] = await Promise.all([
        storage.getProducts(),
        storage.getSales(),
        storage.getPhones()
    ]);

    // 2. CALCULATE TOTAL INVENTORY VALUE
    let totalInventoryValue = 0;
    allProducts.forEach(product => {
        const value = (product.buyingPrice || 0) * (product.stock || 0);
        totalInventoryValue += value;
    });

    // Display the inventory value in the stat card
    const inventoryValueEl = document.getElementById('total-inventory-value');
    if (inventoryValueEl) {
        inventoryValueEl.textContent = `${totalInventoryValue.toFixed(2)} DH`;
    }

    // 3. MERGE SALES INTO ONE STANDARDIZED LIST
    const allTransactions = [];

    // Process general sales (multi-item sales)
    generalSales.forEach(sale => {
        let saleRevenue = 0;
        let saleProfit = 0;
        
        sale.items.forEach(item => {
            const itemRevenue = (item.sellingPrice || item.unitPrice || 0) * (item.quantity || 1);
            const itemProfit = (itemRevenue - ((item.buyingPrice || 0) * (item.quantity || 1)));
            saleRevenue += itemRevenue;
            saleProfit += itemProfit;
        });

        allTransactions.push({
            date: sale.date, // Assumes 'date' field exists
            revenue: saleRevenue,
            profit: saleProfit
        });
    });

    // Process phone sales (single-item sales)
    phoneSales.forEach(phone => {
        const revenue = phone.selling_price || 0;
        const profit = revenue - (phone.buyingPrice || 0); // Uses new field
        
        allTransactions.push({
            date: phone.sale_date, // Assumes 'sale_date' field exists
            revenue: revenue,
            profit: profit
        });
    });

    // 4. CALCULATE TOTAL STATS (Revenue & Profit)
    calculateTotalStats(allTransactions);

    // 5. RENDER CHARTS WITH THE COMBINED DATA
    renderDailyChart(allTransactions);
    renderMonthlyChart(allTransactions);

    // 6. RENDER PAYMENT ALERTS
    await renderPaymentAlerts();
}

// --- HELPER FUNCTION TO CALCULATE TOTALS ---

function calculateTotalStats(transactions) {
    let totalRevenue = 0;
    let totalProfit = 0;

    transactions.forEach(transaction => {
        totalRevenue += transaction.revenue;
        totalProfit += transaction.profit;
    });

    // Update UI
    const revenueElement = document.getElementById('total-revenue');
    const profitElement = document.getElementById('total-profit');
    
    if (revenueElement) {
        revenueElement.textContent = `${totalRevenue.toFixed(2)} DH`;
    }
    if (profitElement) {
        profitElement.textContent = `${totalProfit.toFixed(2)} DH`;
    }
}

// --- HELPER FUNCTIONS FOR CHARTS ---

function processDailyData(transactions) {
    const dailyData = {};
    const labels = [];
    
    // Get last 7 days including today
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        labels.push(dateString);
        dailyData[dateString] = { revenue: 0, profit: 0 };
    }

    transactions.forEach(sale => {
        const saleDate = sale.date.split('T')[0]; // Handle ISO timestamps
        if (dailyData[saleDate] !== undefined) {
            dailyData[saleDate].revenue += sale.revenue;
            dailyData[saleDate].profit += sale.profit;
        }
    });

    // Format labels to French date format
    const formattedLabels = labels.map(dateString => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    });

    return {
        labels: formattedLabels,
        revenue: labels.map(date => dailyData[date].revenue),
        profit: labels.map(date => dailyData[date].profit)
    };
}

function processMonthlyData(transactions) {
    const monthlyData = {};
    const labels = [];
    
    // Get last 12 months including this month
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthString = d.toISOString().substring(0, 7); // "YYYY-MM"
        labels.push(monthString);
        monthlyData[monthString] = { revenue: 0, profit: 0 };
    }

    transactions.forEach(sale => {
        const monthString = sale.date.substring(0, 7); // "YYYY-MM"
        if (monthlyData[monthString] !== undefined) {
            monthlyData[monthString].revenue += sale.revenue;
            monthlyData[monthString].profit += sale.profit;
        }
    });

    // Format labels to French date format
    const formattedLabels = labels.map(monthString => {
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1, 1);
        return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });

    return {
        labels: formattedLabels,
        revenue: labels.map(month => monthlyData[month].revenue),
        profit: labels.map(month => monthlyData[month].profit)
    };
}

// --- CHART RENDERING FUNCTIONS ---

function renderDailyChart(transactions) {
    const ctx = document.getElementById('dailyChart')?.getContext('2d');
    if (!ctx) return;

    const data = processDailyData(transactions);
    
    if (dailyChartInstance) {
        dailyChartInstance.destroy(); // Destroy old chart before drawing new one
    }

    dailyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Chiffre d\'Affaires (DH)',
                    data: data.revenue,
                    backgroundColor: 'rgba(0, 86, 179, 0.7)',
                    borderColor: 'rgba(0, 86, 179, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Bénéfice (DH)',
                    data: data.profit,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' DH';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + ' DH';
                        }
                    }
                }
            }
        }
    });
}

// --- PAYMENT ALERTS FUNCTION ---

async function renderPaymentAlerts() {
    try {
        const clients = await storage.getClients();
        const alertsList = document.getElementById('payment-alerts-list');
        
        if (!alertsList) return;

        const today = Date.now();
        const sevenDaysFromNow = today + (7 * 24 * 60 * 60 * 1000);

        // Filter clients with payment alerts
        const alerts = clients.filter(client => {
            if (client.remainingBalance <= 0 || !client.paymentDueDate) return false;
            return client.paymentDueDate <= sevenDaysFromNow;
        });

        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <p style="text-align: center; padding: 2rem; color: #10b981;">
                    <i class="ph ph-check-circle" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                    Aucune alerte de paiement.
                </p>
            `;
            return;
        }

        // Sort: overdue first, then by due date
        alerts.sort((a, b) => a.paymentDueDate - b.paymentDueDate);

        let html = '<div class="table-responsive"><table class="data-table"><thead><tr>';
        html += '<th>Client</th><th>Solde Restant</th><th>Date d\'échéance</th><th>Statut</th>';
        html += '</tr></thead><tbody>';

        alerts.forEach(client => {
            const daysUntilDue = Math.floor((client.paymentDueDate - today) / (24 * 60 * 60 * 1000));
            const isOverdue = daysUntilDue < 0;
            
            let statusHtml = '';
            if (isOverdue) {
                const daysOverdue = Math.abs(daysUntilDue);
                statusHtml = `<span class="badge status-cancelled">En Retard (${daysOverdue} jours)</span>`;
            } else {
                statusHtml = `<span class="badge status-pending">Échéance Proche (${daysUntilDue} jours)</span>`;
            }

            const dueDateStr = new Date(client.paymentDueDate).toLocaleDateString('fr-FR');

            html += `
                <tr style="${isOverdue ? 'background-color: #fee2e2;' : ''}">
                    <td><strong>${client.name}</strong><br><small>${client.phone}</small></td>
                    <td><strong style="color: #ef4444;">${client.remainingBalance.toFixed(2)} DH</strong></td>
                    <td>${dueDateStr}</td>
                    <td>${statusHtml}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        alertsList.innerHTML = html;

    } catch (error) {
        console.error('Error rendering payment alerts:', error);
    }
}

function renderMonthlyChart(transactions) {
    const ctx = document.getElementById('monthlyChart')?.getContext('2d');
    if (!ctx) return;
    
    const data = processMonthlyData(transactions);

    if (monthlyChartInstance) {
        monthlyChartInstance.destroy(); // Destroy old chart
    }

    monthlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Chiffre d\'Affaires (DH)',
                    data: data.revenue,
                    backgroundColor: 'rgba(0, 86, 179, 0.1)',
                    borderColor: 'rgba(0, 86, 179, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Bénéfice (DH)',
                    data: data.profit,
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' DH';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0) + ' DH';
                        }
                    }
                }
            }
        }
    });
}

// --- PAYMENT ALERTS FUNCTION ---

async function renderPaymentAlerts() {
    try {
        const clients = await storage.getClients();
        const alertsList = document.getElementById('payment-alerts-list');
        
        if (!alertsList) return;

        const today = Date.now();
        const sevenDaysFromNow = today + (7 * 24 * 60 * 60 * 1000);

        // Filter clients with payment alerts
        const alerts = clients.filter(client => {
            if (client.remainingBalance <= 0 || !client.paymentDueDate) return false;
            return client.paymentDueDate <= sevenDaysFromNow;
        });

        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <p style="text-align: center; padding: 2rem; color: #10b981;">
                    <i class="ph ph-check-circle" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;"></i>
                    Aucune alerte de paiement.
                </p>
            `;
            return;
        }

        // Sort: overdue first, then by due date
        alerts.sort((a, b) => a.paymentDueDate - b.paymentDueDate);

        let html = '<div class="table-responsive"><table class="data-table"><thead><tr>';
        html += '<th>Client</th><th>Solde Restant</th><th>Date d\'échéance</th><th>Statut</th>';
        html += '</tr></thead><tbody>';

        alerts.forEach(client => {
            const daysUntilDue = Math.floor((client.paymentDueDate - today) / (24 * 60 * 60 * 1000));
            const isOverdue = daysUntilDue < 0;
            
            let statusHtml = '';
            if (isOverdue) {
                const daysOverdue = Math.abs(daysUntilDue);
                statusHtml = `<span class="badge status-cancelled">En Retard (${daysOverdue} jours)</span>`;
            } else {
                statusHtml = `<span class="badge status-pending">Échéance Proche (${daysUntilDue} jours)</span>`;
            }

            const dueDateStr = new Date(client.paymentDueDate).toLocaleDateString('fr-FR');

            html += `
                <tr style="${isOverdue ? 'background-color: #fee2e2;' : ''}">
                    <td><strong>${client.name}</strong><br><small>${client.phone}</small></td>
                    <td><strong style="color: #ef4444;">${client.remainingBalance.toFixed(2)} DH</strong></td>
                    <td>${dueDateStr}</td>
                    <td>${statusHtml}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        alertsList.innerHTML = html;

    } catch (error) {
        console.error('Error rendering payment alerts:', error);
    }
}
