// scanner.js - Barcode Scanner using ZXing Library

// Global variable to hold the scanner instance
let codeReader = null;

/**
 * Initializes the barcode scanner.
 * Attaches listeners to the scan button and close button.
 */
function initBarcodeScanner() {
    const scanButton = document.getElementById('scan-barcode-btn');
    const closeButton = document.getElementById('scanner-close-btn');

    if (scanButton) {
        scanButton.addEventListener('click', startScanner);
        console.log('Barcode scanner initialized');
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', stopScanner);
    }
}

/**
 * Starts the camera and begins scanning for barcodes.
 */
async function startScanner() {
    const modal = document.getElementById('scanner-modal');
    const videoElement = document.getElementById('scanner-video');
    const outputField = document.getElementById('product-barcode');
    
    if (!modal || !videoElement || !outputField) {
        console.error('Scanner elements not found.');
        return;
    }
    
    // Show the modal
    modal.classList.add('active');

    try {
        // Initialize the code reader
        codeReader = new ZXing.BrowserMultiFormatReader();
        
        // Get list of video input devices (cameras)
        const devices = await codeReader.listVideoInputDevices();
        
        if (devices.length === 0) {
            alert('Aucune caméra trouvée. Veuillez vérifier les permissions.');
            stopScanner();
            return;
        }

        console.log('Cameras found:', devices.length);
        
        // Try to find the back camera (environment) or use the first one
        let selectedDeviceId = devices[0].deviceId;
        
        // On mobile, prefer the back camera
        const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
            selectedDeviceId = backCamera.deviceId;
            console.log('Using back camera:', backCamera.label);
        } else {
            console.log('Using first available camera:', devices[0].label);
        }
        
        // Start decoding from the selected camera
        codeReader.decodeFromVideoDevice(selectedDeviceId, 'scanner-video', (result, err) => {
            if (result) {
                // Barcode found!
                console.log('Barcode detected:', result.text);
                
                // Put the barcode text in the input field
                outputField.value = result.text;
                
                // Show success feedback
                showToast('Code-barres scanné: ' + result.text);
                
                // Close the scanner
                stopScanner();
            }
            
            if (err && !(err instanceof ZXing.NotFoundException)) {
                // Log errors that are not "not found" errors
                console.error('Scanner error:', err);
            }
        });

    } catch (err) {
        console.error('Error initializing scanner:', err);
        alert('Erreur de caméra: ' + err.message + '\n\nAssurez-vous d\'autoriser l\'accès à la caméra.');
        stopScanner();
    }
}

/**
 * Stops the scanner and hides the modal.
 */
function stopScanner() {
    if (codeReader) {
        codeReader.reset(); // Stop the camera stream
        console.log('Scanner stopped');
    }
    
    const modal = document.getElementById('scanner-modal');
    if (modal) {
        modal.classList.remove('active'); // Hide the modal
    }
}

/**
 * Helper function to show toast notifications
 * Falls back to console.log if showToast is not available
 */
function showToast(message) {
    if (typeof window.showToast === 'function') {
        window.showToast(message);
    } else {
        console.log('Toast:', message);
    }
}

/**
 * NEW: Starts the camera scanner specifically for the Sales page
 * Automatically finds product and adds to current sale
 */
async function startSalesScanner() {
    const modal = document.getElementById('scanner-modal');
    const videoElement = document.getElementById('scanner-video');
    
    if (!modal || !videoElement) {
        console.error('Scanner elements not found.');
        return;
    }
    
    // Check if salesManager is available
    if (typeof salesManager === 'undefined') {
        alert('Sales manager not initialized');
        return;
    }
    
    // Show the modal
    modal.classList.add('active');

    try {
        // Initialize the code reader
        codeReader = new ZXing.BrowserMultiFormatReader();
        
        // Get list of video input devices (cameras)
        const devices = await codeReader.listVideoInputDevices();
        
        if (devices.length === 0) {
            alert('Aucune caméra trouvée. Veuillez vérifier les permissions.');
            stopScanner();
            return;
        }

        console.log('Cameras found for sales scanner:', devices.length);
        
        // Try to find the back camera (environment) or use the first one
        let selectedDeviceId = devices[0].deviceId;
        
        // On mobile, prefer the back camera
        const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
            selectedDeviceId = backCamera.deviceId;
            console.log('Using back camera for sales:', backCamera.label);
        }
        
        // Start decoding from the selected camera
        codeReader.decodeFromVideoDevice(selectedDeviceId, 'scanner-video', async (result, err) => {
            if (result) {
                // Barcode found!
                console.log('Sales barcode detected:', result.text);
                
                // Stop scanner first
                stopScanner();
                
                // Find product by barcode
                try {
                    const product = await storage.findProductByBarcode(result.text);
                    
                    if (!product) {
                        // Product not found
                        salesManager.showBarcodeResult(`❌ Produit non trouvé pour le code: ${result.text}`, 'error');
                        return;
                    }
                    
                    // Check stock
                    if (product.stock <= 0) {
                        salesManager.showBarcodeResult(`⚠️ "${product.name}" est en rupture de stock`, 'warning');
                        return;
                    }
                    
                    // Show success and add to sale
                    const price = product.sellingPrice || product.price || 0;
                    salesManager.showBarcodeResult(
                        `✅ ${product.name} - ${price.toFixed(2)} DH (Stock: ${product.stock})`, 
                        'success'
                    );
                    
                    // Add product to sale
                    await salesManager.addProductByBarcode(product);
                    
                } catch (error) {
                    console.error('Error processing scanned barcode:', error);
                    salesManager.showBarcodeResult('❌ Erreur lors du traitement du code-barres', 'error');
                }
            }
            
            if (err && !(err instanceof ZXing.NotFoundException)) {
                console.error('Sales scanner error:', err);
            }
        });

    } catch (err) {
        console.error('Error initializing sales scanner:', err);
        alert('Erreur de caméra: ' + err.message + '\n\nAssurez-vous d\'autoriser l\'accès à la caméra.');
        stopScanner();
    }
}

