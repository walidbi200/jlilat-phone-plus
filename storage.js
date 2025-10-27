// Get a reference to the Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

const storage = {
    // --- PRODUCTS ---
    getProducts: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const snapshot = await db.collection('users').doc(userId).collection('products').get();
        return snapshot.docs.map(doc => doc.data());
    },
    saveProduct: async (product) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('products').doc(product.id).set(product);
    },
    deleteProduct: async (productId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('products').doc(productId).delete();
    },

    // --- SALES ---
    getSales: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const snapshot = await db.collection('users').doc(userId).collection('sales').get();
        return snapshot.docs.map(doc => doc.data());
    },
    saveSale: async (sale) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('sales').doc(sale.id).set(sale);
    },
    deleteSale: async (saleId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('sales').doc(saleId).delete();
    },

    // --- PHONES ---
    getPhones: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const snapshot = await db.collection('users').doc(userId).collection('phones').get();
        return snapshot.docs.map(doc => doc.data());
    },
    savePhone: async (phone) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('phones').doc(phone.id).set(phone);
    },
    deletePhone: async (phoneId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('phones').doc(phoneId).delete();
    },

    // --- REPAIRS ---
    getRepairs: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const snapshot = await db.collection('users').doc(userId).collection('repairs').get();
        return snapshot.docs.map(doc => doc.data());
    },
    saveRepair: async (repair) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('repairs').doc(repair.id).set(repair);
    },
    deleteRepair: async (repairId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('repairs').doc(repairId).delete();
    },

    // --- CLIENTS (CREDITS) ---
    getClients: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        const snapshot = await db.collection('users').doc(userId).collection('clients').get();
        return snapshot.docs.map(doc => doc.data());
    },
    saveClient: async (client) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('clients').doc(client.id).set(client);
    },
    deleteClient: async (clientId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        return db.collection('users').doc(userId).collection('clients').doc(clientId).delete();
    },
    addPaymentToClient: async (clientId, paymentAmount) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        const clientRef = db.collection('users').doc(userId).collection('clients').doc(clientId);
        const clientDoc = await clientRef.get();
        
        if (!clientDoc.exists) {
            throw new Error('Client not found');
        }
        
        const client = clientDoc.data();
        const newAmountPaid = (client.amountPaid || 0) + paymentAmount;
        const newRemainingBalance = client.totalDebt - newAmountPaid;
        
        return clientRef.update({
            amountPaid: newAmountPaid,
            remainingBalance: newRemainingBalance
        });
    },
    
    // --- DATA MIGRATION ---
    exportData: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            alert("Vous devez être connecté pour exporter.");
            return;
        }

        try {
            const [products, sales, phones, repairs, clients] = await Promise.all([
                storage.getProducts(),
                storage.getSales(),
                storage.getPhones(),
                storage.getRepairs(),
                storage.getClients()
            ]);

            const data = { products, sales, phones, repairs, clients };
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `jlilat-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export: ' + error.message);
        }
    },

    importData: async (file) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            alert("Vous devez être connecté pour importer.");
            return;
        }

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            const batch = db.batch();
            
            // Import products
            if (data.products && Array.isArray(data.products)) {
                data.products.forEach(product => {
                    const docRef = db.collection('users').doc(userId).collection('products').doc(product.id);
                    batch.set(docRef, product);
                });
            }
            
            // Import sales
            if (data.sales && Array.isArray(data.sales)) {
                data.sales.forEach(sale => {
                    const docRef = db.collection('users').doc(userId).collection('sales').doc(sale.id);
                    batch.set(docRef, sale);
                });
            }
            
            // Import phones
            if (data.phones && Array.isArray(data.phones)) {
                data.phones.forEach(phone => {
                    const docRef = db.collection('users').doc(userId).collection('phones').doc(phone.id);
                    batch.set(docRef, phone);
                });
            }
            
            // Import repairs
            if (data.repairs && Array.isArray(data.repairs)) {
                data.repairs.forEach(repair => {
                    const docRef = db.collection('users').doc(userId).collection('repairs').doc(repair.id);
                    batch.set(docRef, repair);
                });
            }
            
            // Import clients
            if (data.clients && Array.isArray(data.clients)) {
                data.clients.forEach(client => {
                    const docRef = db.collection('users').doc(userId).collection('clients').doc(client.id);
                    batch.set(docRef, client);
                });
            }
            
            await batch.commit();
            alert('Données importées avec succès!');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            console.error('Import error:', error);
            alert('Erreur lors de l\'import: ' + error.message);
        }
    }
};
