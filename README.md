# 🏆 MiQ Football Store

Nền tảng thương mại điện tử bán giày đá bóng và đồ thể thao cao cấp với tích hợp AI Recommendation.

## 🛠️ Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, Zustand, React Router v6
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Stripe
- **AI:** Apriori Algorithm + K-Means Clustering (RFM)

## 📦 Cấu trúc
MiQ-Sport/
├── miq-football-backend/    # Express API server
└── miq-football-frontend/   # React + Vite client
## 🚀 Cách chạy local

### 1. Clone & cài dependencies

```bash
git clone https://github.com/LeThanhMinh0208/MiQ_Shop.git
cd MiQ_Shop

# Backend
cd miq-football-backend
npm install

# Frontend
cd ../miq-football-frontend
npm install
```

### 2. Tạo file `.env` ở `miq-football-backend/`
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
STRIPE_SECRET_KEY=sk_test_xxx
CLIENT_URL=http://localhost:5173
### 3. Seed data

```bash
cd miq-football-backend
npm run seed
```

Admin account: `admin@miq.com` / `admin123`

### 4. Chạy 2 server

```bash
# Terminal 1
cd miq-football-backend && npm run dev

# Terminal 2
cd miq-football-frontend && npm run dev
```

Mở: http://localhost:5173

## ✨ Tính năng

- 🛒 E-commerce đầy đủ
- 🤖 AI: Apriori "Thường mua cùng"
- 📊 K-Means phân cụm KH theo RFM
- 💳 Stripe thanh toán test mode
- ☁️ Upload ảnh Cloudinary
- 🎨 UI "Daylight Stadium" với Framer Motion
- 👨‍💼 Admin Dashboard