# Production Deployment - GitHub Pages

## ⚠️ Lưu ý quan trọng về AI Features

Dự án này sử dụng `output: 'export'` trong `next.config.js` để deploy lên **GitHub Pages** (static hosting).

### Hạn chế:
- **API Routes KHÔNG hoạt động** trên GitHub Pages
- Endpoint `/api/ai/check` sẽ trả về 404 trên production
- Tính năng AI checking chỉ hoạt động khi chạy `yarn dev` ở local

### Giải pháp đã triển khai:
Code đã có sẵn **automatic fallback** mechanism:
1. Thử gọi AI API trước
2. Nếu AI lỗi (404/Network Error), tự động chuyển sang **local check**
3. Local check so sánh chuỗi đơn giản nhưng vẫn hoạt động tốt

### Trên Production (GitHub Pages):
- ✅ Tất cả bài tập vẫn hoạt động bình thường
- ✅ Local check tự động được sử dụng
- ✅ Badge hiển thị "💻 Local" thay vì "🤖 AI"
- ⚠️ Không có AI explanation chi tiết

### Để có AI trên Production:
Nếu muốn AI hoạt động trên production, cần deploy lên:
- **Vercel** (recommended - miễn phí, hỗ trợ API Routes)
- **Netlify** (miễn phí, hỗ trợ serverless functions)
- **Railway/Render** (cho backend riêng)

## Cấu hình hiện tại

### Environment Variables
- `GEMINI_API_KEY`: Chỉ cần thiết cho local development
- Không cần config gì thêm cho GitHub Pages

### GitHub Actions Workflow
File `.github/workflows/deploy-pages.yml` đã OK, không cần sửa gì.

## Test Local
```bash
yarn dev
# AI sẽ hoạt động nếu có GEMINI_API_KEY trong .env.local
```

## Test Production Behavior
```bash
yarn build
yarn start
# Hoặc test trực tiếp trên GitHub Pages sau khi deploy
```
