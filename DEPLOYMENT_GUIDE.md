# Hướng Dẫn Deploy English Learning App trên Render.com

## Cấu trúc dự án
```
english-learning-app/
├── src/                 # Frontend (React + Vite)
├── server/             # Backend (Express.js)
├── package.json        # Frontend dependencies
├── .env                # Local development
├── .env.production     # Production (frontend)
└── vite.config.js      # Vite config
```

## Các bước deploy:

### 1. Tạo Server Backend trên Render

#### 1.1 Tạo Web Service mới
- Vào https://dashboard.render.com
- Chọn "New +" → "Web Service"
- Connect GitHub repository
- Build command: `npm install`
- Start command: `node server/server.js`

#### 1.2 Cấu hình Environment Variables (Backend)
Trong Render Dashboard, vào "Environment":
```
MONGODB_URI=mongodb+srv://phamviethuu1_db_user:b88QzXyMNYye3S8Y@websitelearning.8ls6j66.mongodb.net/
PORT=5000
NODE_ENV=production
JWT_SECRET=your_secret_key
VITE_ASSEMBLYAI_API_KEY=bfaefebd3e4b47aea07d98c420d27f8c
```

#### 1.3 Ghi nhớ Server URL
Ví dụ: `https://english-learning-app-server.onrender.com`

---

### 2. Deploy Frontend trên Render

#### 2.1 Tạo Static Site mới
- Chọn "New +" → "Static Site"
- Connect GitHub repository (nhánh chứa frontend)
- Build command: `npm install && npm run build`
- Publish directory: `dist`

#### 2.2 Cấu hình Environment Variables (Frontend)
Thêm vào "Environment":
```
VITE_API_URL=https://english-learning-app-server.onrender.com/api
VITE_YOUTUBE_API_KEY=AIzaSyBxS7lNJsU4TLjusdxI75eQYl35wkK8_pw
VITE_ASSEMBLYAI_API_KEY=bfaefebd3e4b47aea07d98c420d27f8c
VITE_APP_API_URL=https://english-learning-app-w7lk.onrender.com
```

---

### 3. CORS Configuration (Backend)

Trong `server/server.js`, đảm bảo CORS cho phép frontend:

```javascript
const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://english-learning-app-w7lk.onrender.com',
        'https://your-frontend-url.onrender.com'
    ],
    credentials: true
}));
```

---

### 4. Proxy Setup (Tùy chọn - nếu frontend và backend cùng domain)

Nếu muốn host frontend và backend cùng Render, thêm vào `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

---

### 5. Kiểm tra API Connection

Sau khi deploy:

1. Vào https://english-learning-app-w7lk.onrender.com
2. Kiểm tra Browser Console (F12)
3. Dùng lệnh: `fetch('https://english-learning-app-server.onrender.com/api/auth/login')`
4. Nếu không lỗi CORS → Connection OK ✅

---

### 6. Troubleshooting

#### Lỗi: `ERR_CONNECTION_REFUSED`
- **Nguyên nhân**: Frontend không tìm được backend URL
- **Giải pháp**: 
  - Kiểm tra `.env.production` có `VITE_API_URL` không
  - Check backend URL đúng chưa
  - Đợi Render build xong (5-10 phút)

#### Lỗi: `CORS error`
- **Nguyên nhân**: Backend không cho phép request từ frontend
- **Giải pháp**: Update CORS config ở backend, redeploy

#### Backend hay shutdown
- **Nguyên nhân**: Free tier Render tự động shutdown sau 15 phút không dùng
- **Giải pháp**: Upgrade lên Paid tier hoặc dùng render.com keep-alive service

---

### 7. Cập nhật Code

Sau khi code mới:

```bash
# 1. Push code lên GitHub
git add .
git commit -m "Update deployment"
git push origin main

# 2. Render tự động rebuild (có thể tự động hoặc manual)
```

---

## Các URL của bạn sau deploy:

| Service | URL |
|---------|-----|
| Frontend | https://english-learning-app-w7lk.onrender.com |
| Backend API | https://english-learning-app-server.onrender.com/api |
| Login | https://english-learning-app-w7lk.onrender.com/login |

---

## Notes

- Frontend sử dụng `getApiUrl()` function tự động detect API URL
- Backend dùng environment variables từ Render Dashboard
- `.env.production` là backup nếu cần
- Render.com free tier có giới hạn, nên upgrade nếu app bị slow

