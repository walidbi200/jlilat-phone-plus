// Get a reference to the Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// This is the new storage object
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
    
    // --- DATA MIGRATION ---
    exportData: async () => {
        alert("Export must be updated for Firebase.");
    },
    importData: async (file) => {
        alert("Import must be updated for Firebase.");
    }
};