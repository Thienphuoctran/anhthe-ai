---
name: openxml-grader
description: OpenXML ECMA-376 AST parsing, formula normalization, and zip-bomb guard for automated grading of Word, Excel, and PowerPoint files.
---

# OpenXML Auto-Grader Engine Guidelines

## 1. Kiến trúc Động cơ Chấm Điểm
Động cơ chấm điểm nằm tại `src/lib/openxml-grader/` với các module chuyên trách:
- `excel-evaluator.ts`: Chấm bảng tính `.xlsx` (phân tích `xl/worksheets/sheet*.xml`, `xl/tables/`, `xl/charts/`).
- `word-evaluator.ts`: Chấm tài liệu `.docx` (phân tích `word/document.xml`, `word/styles.xml`, `word/header*.xml`).
- `ppt-evaluator.ts`: Chấm bài trình chiếu `.pptx` (phân tích `ppt/slides/slide*.xml`, `ppt/slideMasters/`).
- `formula-normalizer.ts`: Chuẩn hóa cú pháp công thức tính toán.
- `zip-bomb-guard.ts`: Phòng vệ an ninh bộ nhớ khi giải nén file.

## 2. Tiêu chuẩn Formula Normalizer
1. **Dấu phân cách hàm:** Thay thế dấu `;` của vùng Việt Nam thành dấu `,` chuẩn quốc tế.
2. **Tiền tố phiên bản:** Xóa bỏ hoặc cho phép tùy chọn `_xlfn.` và `_xlws.`.
3. **Kiểm chứng kép (Double Verification):** Đồng thời kiểm tra:
   - Thẻ công thức `<f>`: Phù hợp Regex hoặc AST.
   - Thẻ kết quả `<v>`: Giá trị số tính toán nằm trong biên độ dung sai sai số cho phép (`tolerance: 0.01`).

## 3. Zip Bomb & XXE Guard
- Dung lượng giải nén tối đa: `<= 50MB` (`maxZipUncompressedBytes = 52428800`).
- Trình phân tích XML (`fast-xml-parser`): BẮT BUỘC đặt `processEntities: false` để vô hiệu hóa hoàn toàn nguy cơ tấn công XXE (XML External Entity).
