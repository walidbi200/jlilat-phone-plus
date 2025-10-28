// Get a reference to the Firebase services
const rtdb = firebase.database();
const auth = firebase.auth();

// Storage object using Firebase Realtime Database
const storage = {
    // ===== PRODUCTS FUNCTIONS =====
    getProducts: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/products`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    },

    saveProduct: async (product) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/products/${product.id}`).set(product);
    },

    deleteProduct: async (productId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/products/${productId}`).remove();
    },

    // ===== SALES FUNCTIONS =====
    getSales: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/sales`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting sales:', error);
            return [];
        }
    },

    saveSale: async (sale) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/sales/${sale.id}`).set(sale);
    },

    deleteSale: async (saleId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/sales/${saleId}`).remove();
    },

    // ===== PHONES FUNCTIONS =====
    getPhones: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/phones`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting phones:', error);
            return [];
        }
    },

    savePhone: async (phone) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/phones/${phone.id}`).set(phone);
    },

    deletePhone: async (phoneId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/phones/${phoneId}`).remove();
    },

    // ===== REPAIRS FUNCTIONS =====
    getRepairs: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/repairs`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting repairs:', error);
            return [];
        }
    },

    saveRepair: async (repair) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/repairs/${repair.id}`).set(repair);
    },

    deleteRepair: async (repairId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/repairs/${repairId}`).remove();
    },

    // ===== CLIENTS FUNCTIONS (Credits) =====
    getClients: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/clients`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting clients:', error);
            return [];
        }
    },

    saveClient: async (client) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/clients/${client.id}`).set(client);
    },

    deleteClient: async (clientId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        // Delete client and all their payment history
        return rtdb.ref(`users/${userId}/clients/${clientId}`).remove();
    },

    // Get payment history for a client with pagination
    getPaymentHistory: async (clientId, lastVisiblePaymentDate = null) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return { payments: [], lastDate: null };
        try {
            const paymentsRef = rtdb.ref(`users/${userId}/clients/${clientId}/payments`);
            
            // Query payments ordered by date (descending)
            let query = paymentsRef.orderByChild('date');
            
            const snapshot = await query.once('value');
            const data = snapshot.val();
            
            if (!data) {
                return { payments: [], lastDate: null };
            }

            // Convert to array and sort by date descending
            let payments = Object.values(data).sort((a, b) => b.date - a.date);

            // Implement pagination logic
            if (lastVisiblePaymentDate) {
                // Find the index of the last visible payment
                const lastIndex = payments.findIndex(p => p.date === lastVisiblePaymentDate);
                // Get payments after the last visible one
                payments = payments.slice(lastIndex + 1);
            }

            // Limit to 15 payments per batch
            const batchSize = 15;
            const paginatedPayments = payments.slice(0, batchSize);
            
            // Get the date of the last payment in this batch for next query
            const lastDate = paginatedPayments.length === batchSize && payments.length > batchSize
                ? paginatedPayments[paginatedPayments.length - 1].date
                : null;

            return { payments: paginatedPayments, lastDate: lastDate };
        } catch (error) {
            console.error('Error getting payment history:', error);
            return { payments: [], lastDate: null };
        }
    },

    // Add payment to client (atomic operation using multi-path update)
    addPaymentToClient: async (clientId, paymentAmount, paymentNotes = '') => {
        const userId = auth.currentUser.uid;
        const clientRef = rtdb.ref(`users/${userId}/clients/${clientId}`);

        try {
            // First, get the current client data
            const clientSnapshot = await clientRef.once('value');
            if (!clientSnapshot.exists()) {
                throw new Error("Client not found!");
            }

            const clientData = clientSnapshot.val();
            
            // Calculate new totals
            const newAmountPaid = (clientData.amountPaid || 0) + paymentAmount;
            const newRemainingBalance = clientData.totalDebt - newAmountPaid;

            // Create payment ID
            const paymentId = rtdb.ref(`users/${userId}/clients/${clientId}/payments`).push().key;
            
            // Create the new payment object
            const newPayment = {
                id: paymentId,
                date: Date.now(),
                amount: paymentAmount,
                notes: paymentNotes
            };

            // Perform multi-path update (atomic operation)
            const updates = {};
            updates[`users/${userId}/clients/${clientId}/amountPaid`] = newAmountPaid;
            updates[`users/${userId}/clients/${clientId}/remainingBalance`] = newRemainingBalance;
            updates[`users/${userId}/clients/${clientId}/payments/${paymentId}`] = newPayment;

            await rtdb.ref().update(updates);
            
            return newPayment;
        } catch (error) {
            console.error('Error adding payment:', error);
            throw error;
        }
    },

    // Find product by barcode
    findProductByBarcode: async (barcode) => {
        const userId = auth.currentUser?.uid;
        if (!userId || !barcode) return null;

        try {
            const snapshot = await rtdb.ref(`users/${userId}/products`)
                .orderByChild('barcode')
                .equalTo(barcode)
                .limitToFirst(1)
                .once('value');
            
            const data = snapshot.val();
            if (!data) return null;
            
            // Return the first (and only) product found
            return Object.values(data)[0];
        } catch (error) {
            console.error('Error finding product by barcode:', error);
            return null;
        }
    },

    // Get single client by ID
    getClientById: async (clientId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return null;
        try {
            const snapshot = await rtdb.ref(`users/${userId}/clients/${clientId}`).once('value');
            return snapshot.exists() ? snapshot.val() : null;
        } catch (error) {
            console.error('Error getting client by ID:', error);
            return null;
        }
    },

    // ===== SUPPLIERS FUNCTIONS =====
    getSuppliers: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/suppliers`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting suppliers:', error);
            return [];
        }
    },
    
    saveSupplier: async (supplier) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/suppliers/${supplier.id}`).set(supplier);
    },
    
    deleteSupplier: async (supplierId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/suppliers/${supplierId}`).remove();
    },
    
    markSupplierPaid: async (supplierId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const updates = {};
        updates[`users/${userId}/suppliers/${supplierId}/isPaid`] = true;
        updates[`users/${userId}/suppliers/${supplierId}/paidAt`] = Date.now();
        return rtdb.ref().update(updates);
    },

    // ===== EXPENSES FUNCTIONS =====
    getExpenses: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await rtdb.ref(`users/${userId}/expenses`).once('value');
            const data = snapshot.val();
            return data ? Object.values(data) : [];
        } catch (error) {
            console.error('Error getting expenses:', error);
            return [];
        }
    },
    
    saveExpense: async (expense) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/expenses/${expense.id}`).set(expense);
    },
    
    deleteExpense: async (expenseId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return rtdb.ref(`users/${userId}/expenses/${expenseId}`).remove();
    },

    // ===== IMPORT/EXPORT FUNCTIONS =====
    exportData: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            alert("Vous devez être connecté pour exporter les données.");
            return;
        }

        try {
            // Get all user data
            const snapshot = await rtdb.ref(`users/${userId}`).once('value');
            const data = snapshot.val();

            if (!data) {
                alert("Aucune donnée à exporter.");
                return;
            }

            // Create JSON file
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `jlilat-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert("Données exportées avec succès!");
        } catch (error) {
            console.error('Error exporting data:', error);
            alert("Erreur lors de l'export: " + error.message);
        }
    },

    importData: async (file) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            alert("Vous devez être connecté pour importer les données.");
            return;
        }

        try {
            const text = await file.text();
            const importedData = JSON.parse(text);

            // Confirm before overwriting
            if (!confirm("⚠️ Attention: Cette opération va remplacer toutes vos données actuelles. Continuer?")) {
                return;
            }

            // Write all data at once
            await rtdb.ref(`users/${userId}`).set(importedData);

            alert("✅ Données importées avec succès! La page va se recharger.");
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error importing data:', error);
            alert("Erreur lors de l'import: " + error.message);
        }
    }
};
