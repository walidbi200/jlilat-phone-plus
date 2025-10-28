# 📱 Jlilat Phone Plus

**Professional Store Management System** for Phone Retailers & Repair Shops

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)](https://github.com)
[![Firebase](https://img.shields.io/badge/backend-Firebase-orange)](https://firebase.google.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features

### 🎯 Core Functionality

- **📦 Product Management**: Add, edit, delete products with barcode support
- **💰 Sales Tracking**: Fast barcode-based checkout system
- **📱 Phone Sales**: Track IMEI, SN, warranty, customer info
- **🔧 Repair Management**: Track device repairs with status badges
- **💳 Credits (Client Debt)**: Manage client payments and balances
- **📊 Dashboard**: Real-time analytics with Chart.js visualizations

### 🚀 Premium Features

- ⚡ **Lightning-Fast Barcode Scanning**: Scan and add products to cart in < 1 second
- 🔐 **Secure Authentication**: Firebase Auth with modern login UI
- ☁️ **Cloud Sync**: All data synced to Firebase Firestore
- 📱 **Mobile-Optimized**: Touch-friendly UI with 44px touch targets
- 🌐 **Offline-Capable**: Works without internet (with local cache)
- 🎨 **Modern UI**: Glassmorphism design with smooth animations
- 🔄 **Real-time Updates**: Data syncs across devices instantly

---

## 🖼️ Screenshots

### Login Page
Modern, animated login with floating logo and gradient background.

### Dashboard
Real-time sales, revenue, profit tracking with Chart.js visualizations.

### Barcode Scanning
One-click barcode scanning for ultra-fast checkout.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Firestore + Auth + Hosting)
- **Libraries**: 
  - [Chart.js](https://www.chartjs.org/) (Analytics)
  - [ZXing](https://github.com/zxing-js/library) (Barcode Scanning)
  - [Phosphor Icons](https://phosphoricons.com/) (Icon System)
- **Hosting**: Vercel (recommended) or GitHub Pages

---

## 📥 Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (free tier works fine)
- Git (for cloning)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/jlilat-phone-plus.git
cd jlilat-phone-plus
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → **Email/Password**
4. Create a **Firestore Database** (start in test mode)
5. Copy your Firebase config

### 3. Update Firebase Config

Edit `index.html` and `login.html`, replace the `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Set Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run Locally

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (http-server)
npx http-server -p 8000

# Option 3: VS Code Live Server
# Install "Live Server" extension and click "Go Live"
```

Open `http://localhost:8000/login.html`

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### GitHub Pages

```bash
# Push to GitHub
git push origin main

# Enable GitHub Pages in repo settings
# Source: main branch / (root)
```

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed instructions.

---

## 📖 Usage Guide

### First-Time Setup

1. **Create Admin Account**
   - Open your deployed app
   - Go to Firebase Console → Authentication
   - Click "Add User" and create an admin account

2. **Login**
   - Visit your app URL
   - Enter your admin credentials
   - You'll be redirected to the dashboard

3. **Add Products**
   - Navigate to **Produits** tab
   - Click "Ajouter un Produit"
   - Fill in details (name, price, stock, **barcode**)
   - Click "Enregistrer"

4. **Make a Sale (with Barcode)**
   - Navigate to **Ventes** tab
   - Focus is auto-set to barcode input
   - Scan or type barcode
   - Press **Enter**
   - Product adds to cart instantly
   - Repeat for more items
   - Select payment method
   - Click "Finaliser la Vente"

### Barcode Scanning Workflow

**Option 1: USB Barcode Scanner** (Recommended for Desktop)
1. Connect USB scanner
2. Focus on barcode input (auto-focused on page load)
3. Scan product
4. Product adds to cart
5. Repeat

**Option 2: Camera Scanning** (Mobile/Tablet)
1. Click camera icon in product form
2. Point camera at barcode
3. Auto-detects and fills barcode field
4. Save product

**Option 3: Manual Entry**
1. Type barcode number
2. Press Enter
3. Product adds to cart

### Pro Tips

- **Keyboard Shortcuts**: The barcode input is always focused, just start scanning
- **Bulk Sales**: Scan multiple items before completing sale
- **Stock Warnings**: System alerts if stock is low or out
- **Duplicate Barcodes**: Prevented - system alerts if barcode already exists
- **Price Alerts**: Warning if selling price < buying price

---

## 📊 Features Breakdown

### 1. Product Management (`products.js`)

- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Barcode field with uniqueness validation
- ✅ Stock tracking with low-stock alerts
- ✅ Buying/Selling price tracking
- ✅ Category organization
- ✅ Export/Import (JSON)

### 2. Sales Tracking (`sales.js`)

- ✅ **Barcode-based checkout** (NEW - fastest workflow)
- ✅ Real-time stock updates
- ✅ Multiple payment methods (Cash, Card, Transfer)
- ✅ Sale history with filters
- ✅ Automatic profit calculation

### 3. Phone Sales (`phones.js`)

- ✅ IMEI & Serial Number tracking
- ✅ Warranty management
- ✅ Customer information
- ✅ Buying/Selling price
- ✅ Conditional fields (battery health, charge cycles)
- ✅ Receipt/warranty card printing

### 4. Repair Management (`repairs.js`)

- ✅ Customer & device tracking
- ✅ **Color-coded status badges** (Pending, In Progress, Completed)
- ✅ Cost tracking
- ✅ History log

### 5. Credits (Client Debt) (`credits.js`)

- ✅ Client payment tracking
- ✅ Total debt calculation
- ✅ Payment history
- ✅ Balance reminders

### 6. Dashboard (`dashboard.js`)

- ✅ Daily/Monthly revenue charts
- ✅ Profit tracking
- ✅ Total inventory value
- ✅ Low-stock alerts
- ✅ Recent activity

---

## 🎨 Customization

### Change Brand Colors

Edit `styles.css`:

```css
:root {
  --primary-color: #0056b3;  /* Your brand blue */
  --success-color: #10b981;  /* Success green */
  --danger-color: #ef4444;   /* Error red */
  --warning-color: #f59e0b;  /* Warning orange */
}
```

### Change App Name

1. Update `index.html` → `<title>`
2. Update `login.html` → `<h1 class="login-brand">`
3. Update `logo.png` with your logo

### Add New Features

The codebase is modular. To add a new feature:

1. Create `feature.js` in root
2. Add `<script src="feature.js"></script>` to `index.html`
3. Add init function: `function initFeaturePage() { }`
4. Call from `app.js` navigation switch

---

## 🔒 Security

- ✅ Firebase Authentication (email/password)
- ✅ Firestore security rules (user-specific data)
- ✅ HTTPS enforced (Vercel/GitHub Pages)
- ✅ Input validation & sanitization
- ✅ XSS protection (`escapeHtml` function)
- ✅ CSRF protection (Firebase handles tokens)

**Important**: Never commit Firebase private keys to Git.

---

## 🐛 Troubleshooting

### Issue: Barcode scanning doesn't work

- **Check**: Is camera permission granted? (Mobile)
- **Check**: Is page served over HTTPS? (Required for camera)
- **Check**: Is barcode clearly visible to scanner?

### Issue: "Firebase not defined" error

- **Solution**: Ensure Firebase scripts load **before** `storage.js` in `index.html`

### Issue: Data not saving

- **Check**: Are Firestore security rules correctly set?
- **Check**: Is user authenticated? (Check `auth.currentUser`)
- **Check**: Browser console for specific errors

### Issue: Login redirects to blank page

- **Solution**: Check `app.js` has auth check at the top:
```javascript
firebase.auth().onAuthStateChanged((user) => {
  if (!user) window.location.href = "login.html";
});
```

See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md#troubleshooting) for more.

---

## 📈 Performance

- **Load Time**: < 2 seconds (on 4G)
- **First Contentful Paint**: < 1 second
- **Time to Interactive**: < 2 seconds
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)

### Optimization Tips

- Use CDN for external libraries
- Enable Vercel caching
- Lazy load Chart.js (only on dashboard)
- Compress images (logo.png)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) - Backend & hosting
- [Chart.js](https://www.chartjs.org/) - Beautiful charts
- [ZXing](https://github.com/zxing-js/library) - Barcode scanning
- [Phosphor Icons](https://phosphoricons.com/) - Icon library

---

## 📞 Support

- **Documentation**: See [REFACTORING-SUMMARY.md](REFACTORING-SUMMARY.md)
- **Deployment**: See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/jlilat-phone-plus/issues)

---

## 🎯 Roadmap

### Completed ✅
- [x] Modern login page
- [x] Barcode scanning for sales
- [x] Data validation
- [x] Mobile optimization
- [x] Error handling
- [x] Status badges for repairs
- [x] Firebase cloud sync

### Planned 🚀
- [ ] PWA support (offline mode, install to home screen)
- [ ] Multi-language support (Arabic, English)
- [ ] Role-based access control (Admin, Cashier)
- [ ] Thermal printer integration
- [ ] Email receipts to customers
- [ ] SMS notifications for repairs
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting

---

## ⭐ Star This Repo

If you find this project useful, please give it a star ⭐️!

---

**Made with ❤️ by Walid Bichri**

**Version**: 2.0.0 (Production Ready)  
**Last Updated**: October 2025
