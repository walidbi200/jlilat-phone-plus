// Authentication Check
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in. Allow app to run.
        console.log("Welcome!", user.email);
    } else {
        // User is signed out. Redirect to login.
        window.location.href = "login.html";
    }
});

// ===============================================
// MAIN APPLICATION
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  // Logout button handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
      });
    });
  }

  // Set initial page on load
  showPage('produits');
  // We must call the init function for the default page
  if (typeof initProductsPage === 'function') {
      initProductsPage();
  } else {
      console.error("initProductsPage function not found. Did you include products.js?");
  }

  // --- INITIALIZE BARCODE SCANNER ---
  if (typeof initBarcodeScanner === 'function') {
      initBarcodeScanner();
      console.log('Barcode scanner module loaded');
  }

  // --- ADD FORM LISTENERS ONCE (Fixed: Prevents duplicate submissions) ---
  const productForm = document.getElementById('product-form');
  if (productForm) {
      productForm.addEventListener('submit', (e) => {
          if (typeof productsManager !== 'undefined') {
              productsManager.handleSubmit(e);
          }
      });
  }

  const phoneForm = document.getElementById('add-phone-form');
  if (phoneForm) {
      phoneForm.addEventListener('submit', (e) => {
          if (typeof phonesManager !== 'undefined') {
              phonesManager.handleSubmit(e);
          }
      });
  }

  const repairForm = document.getElementById('repair-form');
  if (repairForm) {
      repairForm.addEventListener('submit', (e) => {
          if (typeof repairsManager !== 'undefined') {
              repairsManager.handleSubmit(e);
          }
      });
  }

  // Sales module button listeners (Fixed: Prevents duplicate submissions)
  const addSaleItemBtn = document.getElementById('add-sale-item-btn');
  if (addSaleItemBtn) {
      addSaleItemBtn.addEventListener('click', () => {
          if (typeof salesManager !== 'undefined') {
              salesManager.addItem();
          }
      });
  }

  const completeSaleBtn = document.getElementById('complete-sale-btn');
  if (completeSaleBtn) {
      completeSaleBtn.addEventListener('click', () => {
          if (typeof salesManager !== 'undefined') {
              salesManager.completeSale();
          }
      });
  }

  const cancelSaleBtn = document.getElementById('cancel-sale-btn');
  if (cancelSaleBtn) {
      cancelSaleBtn.addEventListener('click', () => {
          if (typeof salesManager !== 'undefined') {
              salesManager.cancelSale();
          }
      });
  }
  // --- END FORM LISTENERS ---

  // Navigation tabs listener
  document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
          const pageId = tab.getAttribute('data-page');
          
          // Remove 'active' class from all tabs
          document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
          // Add 'active' class to the clicked tab
          tab.classList.add('active');
          
          // Show the corresponding page
          showPage(pageId);

          // Call the init function to *render* data (not to attach listeners)
          switch (pageId) {
              case 'dashboard':
                  if (typeof initDashboardPage === 'function') initDashboardPage();
                  break;
              case 'produits':
                  if (typeof initProductsPage === 'function') initProductsPage();
                  break;
              case 'ventes':
                  if (typeof initSalesPage === 'function') initSalesPage();
                  break;
              case 'telephones':
                  if (typeof initPhonesPage === 'function') initPhonesPage();
                  break;
              case 'reparations':
                  if (typeof initRepairsPage === 'function') initRepairsPage();
                  break;
              case 'data':
                  if (typeof initDataManagementPage === 'function') initDataManagementPage();
                  break;
          }
      });
  });
});

/**
* Hides all pages and shows the one with the matching pageId.
* @param {string} pageId - The ID of the page to show (e.g., 'produits', 'ventes')
*/
function showPage(pageId) {
  document.querySelectorAll('.page-content').forEach(page => {
      page.style.display = 'none';
  });
  
  const activePage = document.getElementById(pageId);
  if (activePage) {
      activePage.style.display = 'block';
  } else {
      console.error(`Page not found: ${pageId}. Check data-page attributes and page IDs.`);
  }
}

/**
* Shows a temporary notification at the bottom of the screen.
* @param {string} message - The text to display.
* @param {boolean} [isError=false] - If true, formats the toast as an error.
*/
function showToast(message, isError = false) {
  const toast = document.getElementById('toast-notification');
  if (!toast) {
      console.error('Toast notification element not found.');
      return;
  }
  
  toast.textContent = message;
  toast.className = 'toast show'; // Reset classes
  
  if (isError) {
      toast.classList.add('error');
  }

  // Show for 3 seconds
  setTimeout(() => {
      toast.className = toast.className.replace('show', '');
  }, 3000);
}

// Initialize Data Management Page
function initDataManagementPage() {
  // Set up export button
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.onclick = async function() {
      try {
        const data = await storage.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jlilat-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(fr.dataManagement.exportSuccess || 'Données exportées avec succès');
      } catch (error) {
        console.error('Export error:', error);
        showToast('Erreur lors de l\'exportation', true);
      }
    };
  }

  // Set up import file input
  const importInput = document.getElementById('import-file-input');
  if (importInput) {
    importInput.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        document.getElementById('restore-data-btn').disabled = false;
      }
    };
  }

  // Set up restore button
  const restoreBtn = document.getElementById('restore-data-btn');
  if (restoreBtn) {
    restoreBtn.onclick = async function() {
      const importInput = document.getElementById('import-file-input');
      const file = importInput.files[0];
      
      if (!file) {
        showToast('Veuillez sélectionner un fichier', true);
        return;
      }

      if (!confirm(fr.dataManagement.confirmRestore || 'ATTENTION : Cette action remplacera toutes vos données actuelles. Continuer ?')) {
        return;
      }

      try {
        const fileContent = await readFile(file);
        const data = JSON.parse(fileContent);
        
        // Use Firebase Batch Write for speed and safety
        const batch = db.batch();
        const userId = auth.currentUser.uid;

        // Import products
        if (data.products && Array.isArray(data.products)) {
          data.products.forEach(product => {
            const docRef = db.collection('users').doc(userId).collection('products').doc(product.id);
            batch.set(docRef, product); // .set() will overwrite or create
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
        
        // Commit all changes to Firestore at once
        await batch.commit();
        
        showToast(fr.dataManagement.importSuccess || 'Données restaurées avec succès');
        
        // Reload the entire page to force all scripts to re-fetch from Firebase
        setTimeout(() => {
          location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Import error:', error);
        showToast(fr.dataManagement.importError || 'Erreur lors de l\'importation: ' + error.message, true);
      }
    };
  }
}

// Helper function to read file
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}