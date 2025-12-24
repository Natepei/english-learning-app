# API Configuration Guide

## Tổng Quan

Ứng dụng đã được cấu hình để hoạt động trong cả môi trường development và production mà không cần thay đổi code.

## Cách API URL được xác định

### 1. Environment Variables (Ưu tiên cao nhất)
Trong `.env` hoặc `.env.production`:
```env
VITE_API_URL=https://your-api-url.com/api
```

### 2. Dynamic Detection (Tự động cho Production)
Nếu không có `VITE_API_URL`, app sẽ tự động detect:
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-frontend-domain.com/api`

### 3. Sử dụng API Helper Functions

#### Cách 1: Dùng `api` axios instance (Khuyên dùng)
```javascript
import api from '../../utils/api';

// Tự động thêm baseURL
const response = await api.get('/courses');
const response = await api.post('/auth/login', data);
```

#### Cách 2: Dùng `getApiUrl()` helper
```javascript
import { getApiUrl } from '../../utils/api';
import axios from 'axios';

const response = await axios.get(getApiUrl('/courses'));
const response = await fetch(getApiUrl('/transcribe'), { method: 'POST' });
```

## Files Chính

### `.env` (Development)
```
VITE_API_URL=http://localhost:5000/api
VITE_YOUTUBE_API_KEY=...
VITE_ASSEMBLYAI_API_KEY=...
```

### `.env.production` (Production/Render)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_YOUTUBE_API_KEY=...
VITE_ASSEMBLYAI_API_KEY=...
```

### `src/utils/api.js`
Centralized API configuration:
```javascript
export const getApiBaseUrl = () => { /* ... */ }
export const getApiUrl = (endpoint) => { /* ... */ }
export default api; // axios instance
```

## Migration từ Hardcoded URLs

### Trước (❌ Sai)
```javascript
const response = await axios.post('http://localhost:5000/api/auth/login', data);
const audioUrl = `http://localhost:5000${book.imageUrl}`;
```

### Sau (✅ Đúng)
```javascript
import api from '../../utils/api';
const response = await api.post('/auth/login', data);

import { getApiUrl } from '../../utils/api';
const audioUrl = getApiUrl(book.imageUrl);
```

## Development vs Production

### Development (Local)
```bash
npm run dev
# Chạy trên http://localhost:5173
# API calls tới http://localhost:5000/api
```

### Production (Render)
```bash
npm run build
# Chạy trên https://your-app.onrender.com
# API calls tới https://your-backend.onrender.com/api (từ .env.production)
```

## Common Issues & Solutions

### ❌ Lỗi 1: ERR_CONNECTION_REFUSED
**Nguyên nhân**: Frontend không tìm được backend
**Giải pháp**:
1. Check `.env.production` có `VITE_API_URL` không
2. Đảm bảo backend URL đúng
3. Đợi Render rebuild

### ❌ Lỗi 2: CORS Error
**Nguyên nhân**: Backend không allow frontend domain
**Giải pháp**: Update CORS ở `server/server.js`:
```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-frontend.onrender.com'
    ]
}));
```

### ❌ Lỗi 3: 404 Not Found
**Nguyên nhân**: API endpoint không tồn tại
**Giải pháp**: Check backend route đúng không

## Kiểm tra API Connection

### Browser Console
```javascript
// Kiểm tra API URL
import { getApiBaseUrl } from './utils/api';
console.log(getApiBaseUrl());

// Test fetch
fetch(getApiBaseUrl()).then(r => r.json());
```

### Network Tab
- Mở DevTools (F12) → Network tab
- Thực hiện action (login, fetch data)
- Kiểm tra Request URL có đúng không

## Next Steps

1. ✅ Thêm `VITE_API_URL` vào `.env` (done)
2. ✅ Tạo `src/utils/api.js` helper (done)
3. ✅ Update Login, Register, TedVideosPage (done)
4. ⏳ Update các files còn lại (admin, pages)
5. ⏳ Deploy lên Render.com
6. ⏳ Test trên production

## Files cần update (tùy chọn):
- `src/components/admin/*.jsx` - Admin pages
- `src/pages/*.jsx` - User pages
- `src/components/*.jsx` - Other components

Thay `http://localhost:5000` bằng `getApiUrl()` hoặc dùng `api` axios instance.

