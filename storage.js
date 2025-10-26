// storage.js - Firebase Firestore Data Persistence

// Get references to Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Storage object with Firestore methods
const storage = {

    // --- PRODUCTS ---
    getProducts: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await db.collection('users').doc(userId).collection('products').get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting products:', error);
            return [];
        }
    },

    setProducts: async (products) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return false;
        try {
            const batch = db.batch();
            products.forEach(product => {
                const docRef = db.collection('users').doc(userId).collection('products').doc(product.id);
                batch.set(docRef, product);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error setting products:', error);
            return false;
        }
    },

    saveProduct: async (product) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('products').doc(product.id).set(product);
        } catch (error) {
            console.error('Error saving product:', error);
            throw error;
        }
    },

    deleteProduct: async (productId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('products').doc(productId).delete();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // --- SALES ---
    getSales: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await db.collection('users').doc(userId).collection('sales').get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting sales:', error);
            return [];
        }
    },

    setSales: async (sales) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return false;
        try {
            const batch = db.batch();
            sales.forEach(sale => {
                const docRef = db.collection('users').doc(userId).collection('sales').doc(sale.id);
                batch.set(docRef, sale);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error setting sales:', error);
            return false;
        }
    },

    saveSale: async (sale) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('sales').doc(sale.id).set(sale);
        } catch (error) {
            console.error('Error saving sale:', error);
            throw error;
        }
    },

    deleteSale: async (saleId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('sales').doc(saleId).delete();
        } catch (error) {
            console.error('Error deleting sale:', error);
            throw error;
        }
    },

    // --- PHONES ---
    getPhones: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await db.collection('users').doc(userId).collection('phones').get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting phones:', error);
            return [];
        }
    },

    setPhones: async (phones) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return false;
        try {
            const batch = db.batch();
            phones.forEach(phone => {
                const docRef = db.collection('users').doc(userId).collection('phones').doc(phone.id);
                batch.set(docRef, phone);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error setting phones:', error);
            return false;
        }
    },

    savePhone: async (phone) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('phones').doc(phone.id).set(phone);
        } catch (error) {
            console.error('Error saving phone:', error);
            throw error;
        }
    },

    deletePhone: async (phoneId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('phones').doc(phoneId).delete();
        } catch (error) {
            console.error('Error deleting phone:', error);
            throw error;
        }
    },

    // --- REPAIRS ---
    getRepairs: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return [];
        try {
            const snapshot = await db.collection('users').doc(userId).collection('repairs').get();
            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting repairs:', error);
            return [];
        }
    },

    setRepairs: async (repairs) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return false;
        try {
            const batch = db.batch();
            repairs.forEach(repair => {
                const docRef = db.collection('users').doc(userId).collection('repairs').doc(repair.id);
                batch.set(docRef, repair);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error setting repairs:', error);
            return false;
        }
    },

    saveRepair: async (repair) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('repairs').doc(repair.id).set(repair);
        } catch (error) {
            console.error('Error saving repair:', error);
            throw error;
        }
    },

    deleteRepair: async (repairId) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        try {
            return await db.collection('users').doc(userId).collection('repairs').doc(repairId).delete();
        } catch (error) {
            console.error('Error deleting repair:', error);
            throw error;
        }
    },

    // --- DATA MIGRATION (Export/Import) ---
    exportData: async () => {
        try {
            const products = await storage.getProducts();
            const sales = await storage.getSales();
            const repairs = await storage.getRepairs();
            const phones = await storage.getPhones();

            const exportData = {
                version: '1.4',
                exportDate: new Date().toISOString(),
                products: products,
                sales: sales,
                repairs: repairs,
                phones: phones
            };

            return exportData;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    },

    importData: async (data) => {
        try {
            // Validate data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }

            // Import products
            if (Array.isArray(data.products)) {
                await storage.setProducts(data.products);
            }

            // Import sales
            if (Array.isArray(data.sales)) {
                await storage.setSales(data.sales);
            }

            // Import repairs
            if (Array.isArray(data.repairs)) {
                await storage.setRepairs(data.repairs);
            }

            // Import phones
            if (Array.isArray(data.phones)) {
                await storage.setPhones(data.phones);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
};
