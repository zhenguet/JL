# Minna no Nihongo - Ứng dụng học tiếng Nhật

Ứng dụng Next.js với TypeScript để học từ vựng Minna no Nihongo với các tính năng:
- 📚 Liệt kê từ vựng kèm nghĩa
- 🎴 Flashcard để ôn tập
- ✍️ Bài tập đa dạng (điền từ, dịch, kanji, multiple choice, reading)
- 📖 Giải thích ngữ pháp và cách dùng từ
- 🌙 Dark/Light mode (Dark mode mặc định)
- 🌍 Đa ngôn ngữ (Tiếng Việt, English, 日本語)

🌐 **Live Demo:** [https://zhenguet.github.io/JL/](https://zhenguet.github.io/JL/)

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:5000/JL

## Cấu trúc project

```
app/                    # Next.js App Router
├── api/                # API routes (AI generation, checking)
├── lesson/             # Lesson pages
│   └── [lessonNumber]/ # Dynamic lesson routes
│       ├── vocabulary/ # Vocabulary list
│       ├── flashcard/  # Flashcard practice
│       ├── exercise/   # Exercise pages
│       ├── grammar/   # Grammar explanations
│       ├── usage/      # Usage examples
│       └── quiz/       # Quiz pages
├── quiz/               # Global quiz page
├── layout.tsx          # Root layout
└── page.tsx            # Home page

lib/                    # Shared libraries
├── styles/             # Global styles & theme
│   ├── colors.css      # CSS variables for colors
│   ├── colors.ts       # TypeScript color constants
│   ├── globals.css     # Global CSS styles
│   └── theme/          # Theme management
│       ├── context.tsx # Theme context (dark/light)
│       ├── init-theme.ts # Theme initialization script
│       └── ThemeRegistry.tsx # MUI theme registry
└── utils/              # Utility functions
    └── exerciseRoute.ts # Exercise routing utilities

components/             # React components
├── exercises/          # Exercise components
├── AlphabetButton/     # Alphabet button
├── AlphabetModal/      # Alphabet modal
├── LanguageSwitcher/   # Language & theme switcher
├── PageTitle/          # Page title component
├── ProgressBar/        # Progress bar component
└── VocabularyTable/    # Vocabulary table component

data/                   # Data files
├── lesson/             # Lesson JSON files
├── quiz/               # Quiz JSON files
├── grammar/            # Grammar JSON files
├── vocabulary.ts       # Vocabulary data
├── quizData.ts         # Quiz data
└── grammar.ts          # Grammar data

types/                  # TypeScript type definitions
├── vocabulary.ts
├── quiz.ts
├── grammar.ts
└── exercise.ts

i18n/                   # Internationalization
├── context.tsx         # i18n context
├── types.ts            # Translation types
└── locales/            # Translation files
    ├── vi.json
    ├── en.json
    └── ja.json

scripts/                # Utility scripts for data management
```

## Tính năng chính

### 1. Học từ vựng
- Danh sách từ vựng theo bài học
- Hiển thị kanji, hiragana, nghĩa
- Bảng từ vựng với tìm kiếm

### 2. Flashcard
- Ôn tập từ vựng với flashcard
- Lật thẻ để xem nghĩa
- Theo dõi tiến độ

### 3. Bài tập
- **Điền từ**: Điền từ còn thiếu vào câu
- **Điền Kanji/Hiragana**: Chuyển đổi giữa kanji và hiragana
- **Dịch**: Dịch câu giữa tiếng Nhật và tiếng Việt
- **Kanji**: Luyện viết và nhận diện kanji
- **Multiple Choice**: Câu hỏi trắc nghiệm
- **Reading**: Đọc hiểu đoạn văn

### 4. Ngữ pháp
- Giải thích ngữ pháp theo bài học
- Ví dụ minh họa
- Bài tập ngữ pháp

### 5. Theme & Ngôn ngữ
- **Dark/Light mode**: Chuyển đổi theme (Dark mode mặc định)
- **Đa ngôn ngữ**: Hỗ trợ Tiếng Việt, English, 日本語
- Theme được lưu trong localStorage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: 
  - CSS Variables (theme system)
  - Tailwind CSS
  - Material-UI (MUI)
- **State Management**: React Context API
- **Internationalization**: Custom i18n solution
- **AI Integration**: Google Generative AI (Gemini)

## Development

### Thêm từ vựng

Chỉnh sửa file `data/vocabulary.ts` để thêm từ vựng cho các bài học.

### Thêm bài tập

- Quiz: Thêm file JSON vào `data/quiz/`
- Grammar: Thêm file JSON vào `data/grammar/`
- Exercises: Sử dụng API hoặc thêm vào `data/` tương ứng

### Cấu hình Theme

- Colors: Chỉnh sửa `lib/styles/colors.css` và `lib/styles/colors.ts`
- Theme context: `lib/styles/theme/context.tsx`
- Default theme: `lib/styles/theme/init-theme.ts`

### Thêm ngôn ngữ

1. Thêm file translation vào `i18n/locales/`
2. Cập nhật `i18n/types.ts` với các key mới
3. Thêm locale vào `i18n/index.ts`

## Deploy lên GitHub Pages

Sau khi setup code xong, thực hiện các bước sau để deploy lên GitHub Pages:

### Bước 1: Commit và Push code lên GitHub

```bash
git add .
git commit -m "Your commit message"
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
- Đảm bảo `basePath: '/JL'` trong `next.config.js` đúng với repository name
- Đảm bảo `basePath: '/JL'` trong `next.config.js` đúng với repository name

