# Minna no Nihongo - Ứng dụng học tiếng Nhật

Ứng dụng Next.js với TypeScript để học từ vựng Minna no Nihongo với các tính năng:
- Liệt kê từ vựng kèm nghĩa
- Flashcard để ôn tập
- Bài tập (điền từ, dịch, kanji)
- Giải thích cách dùng các từ

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:3000

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

