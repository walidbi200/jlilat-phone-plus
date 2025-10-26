// ===============================================
// AUTHENTICATION CHECK
// ===============================================
// Redirect to login if user is not authenticated
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('Welcome!', user.email);
        
        // Add logout button functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await firebase.auth().signOut();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }
    } else {
        // User is signed out - redirect to login
        console.log('No user authenticated, redirecting to login...');
        window.location.href = "login.html";
    }
});

// ===============================================
// MAIN APPLICATION
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
  // Set initial page on load
  showPage('produits');
  // We must call the init function for the default page
  if (typeof initProductsPage === 'function') {
      initProductsPage();
  } else {
      console.error("initProductsPage function not found. Did you include products.js?");
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
        await storage.importData(data);
        
        // Reload all data
        await productsManager.loadProducts();
        await salesManager.loadSales();
        await phonesManager.loadPhones();
        await repairsManager.loadRepairs();
        
        // Refresh displays
        productsManager.render();
        salesManager.render();
        salesManager.populateProductSelect();
        phonesManager.render();
        repairsManager.render();
        
        // Reset file input
        importInput.value = '';
        restoreBtn.disabled = true;
        
        showToast(fr.dataManagement.importSuccess || 'Données restaurées avec succès');
      } catch (error) {
        console.error('Import error:', error);
        showToast(fr.dataManagement.importError || 'Erreur lors de l\'importation', true);
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