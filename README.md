# Minna no Nihongo - Ứng dụng học tiếng Nhật

Ứng dụng Next.js với TypeScript để học từ vựng Minna no Nihongo với các tính năng:
- Liệt kê từ vựng kèm nghĩa
- Flashcard để ôn tập
- Bài tập (điền từ, dịch, kanji)
- Giải thích cách dùng các từ

🌐 **Live Demo:** [https://zhenguet.github.io/JL/](https://zhenguet.github.io/JL/)

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:3000/JL

## Cấu trúc project

- `app/` - Next.js App Router (pages và layouts)
- `app/page.tsx` - Trang chủ với danh sách bài 1-50
- `app/lesson/[lessonNumber]/` - Trang bài học với các mục con
- `data/vocabulary.ts` - Dữ liệu từ vựng cho các bài học
- `types/vocabulary.ts` - TypeScript types cho vocabulary

## Thêm từ vựng

Chỉnh sửa file `data/vocabulary.ts` để thêm từ vựng cho các bài học.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React 18

## Deploy lên GitHub Pages

Sau khi setup code xong, thực hiện các bước sau để deploy lên GitHub Pages:

### Bước 1: Commit và Push code lên GitHub

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin master
```

### Bước 2: Bật GitHub Pages trong Settings

1. Vào repository trên GitHub: `https://github.com/zhenguet/JL`
2. Vào **Settings** → **Pages**
3. Trong phần **Source**, chọn:
   - **Source**: `GitHub Actions`
4. Lưu lại

### Bước 3: Kiểm tra Workflow

1. Vào tab **Actions** trên GitHub
2. Kiểm tra workflow **Build and Publish to GitHub Pages** đang chạy
3. Đợi workflow hoàn thành (thường mất 2-5 phút)
4. Nếu thành công, bạn sẽ thấy dấu tích xanh ✅

### Bước 4: Truy cập website

Sau khi workflow chạy thành công, website sẽ có sẵn tại:
**https://zhenguet.github.io/JL/**

### Lưu ý

- Mỗi lần push code lên branch `master`, GitHub Actions sẽ tự động build và deploy
- Nếu workflow bị lỗi, kiểm tra log trong tab **Actions** để xem chi tiết
- Lần đầu tiên deploy có thể mất vài phút để GitHub Pages kích hoạt

