// storage.js - Data persistence wrapper using localForage

// Initialize localForage
localforage.config({
  name: 'JlilatLite',
  version: 1.0,
  storeName: 'jlilat_store',
  description: 'Local storage for Jlilat Lite app'
});

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'products',
  SALES: 'sales',
  REPAIRS: 'repairs',
  PHONES: 'phones'
};

// Storage wrapper class
class Storage {
  constructor() {
    this.keys = STORAGE_KEYS;
  }

  // Generic get method
  async get(key) {
    try {
      const data = await localforage.getItem(key);
      return data || [];
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return [];
    }
  }

  // Generic set method
  async set(key, value) {
    try {
      await localforage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  // Products
  async getProducts() {
    return await this.get(this.keys.PRODUCTS);
  }

  async setProducts(products) {
    return await this.set(this.keys.PRODUCTS, products);
  }

  // Sales
  async getSales() {
    return await this.get(this.keys.SALES);
  }

  async setSales(sales) {
    return await this.set(this.keys.SALES, sales);
  }

  // Repairs
  async getRepairs() {
    return await this.get(this.keys.REPAIRS);
  }

  async setRepairs(repairs) {
    return await this.set(this.keys.REPAIRS, repairs);
  }

  // Phones
  async getPhones() {
    return await this.get(this.keys.PHONES);
  }

  async setPhones(phones) {
    return await this.set(this.keys.PHONES, phones);
  }

  // Export all data
  async exportData() {
    try {
      const products = await this.getProducts();
      const sales = await this.getSales();
      const repairs = await this.getRepairs();
      const phones = await this.getPhones();

      const exportData = {
        version: '1.3',
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
  }

  // Import data (replaces existing data)
  async importData(data) {
    try {
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }

      // Import products
      if (Array.isArray(data.products)) {
        await this.setProducts(data.products);
      }

      // Import sales
      if (Array.isArray(data.sales)) {
        await this.setSales(data.sales);
      }

      // Import repairs
      if (Array.isArray(data.repairs)) {
        await this.setRepairs(data.repairs);
      }

      // Import phones
      if (Array.isArray(data.phones)) {
        await this.setPhones(data.phones);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAll() {
    try {
      await localforage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

// Create and export storage instance
const storage = new Storage();

