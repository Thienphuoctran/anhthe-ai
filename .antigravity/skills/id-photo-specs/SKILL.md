---
name: id-photo-specs
description: Tiêu chuẩn kỹ thuật ảnh thẻ quốc tế và Việt Nam (kích thước chuẩn mm, pixel 300 DPI, tỷ lệ khuôn mặt ICAO 9303, màu nền, bố cục in ấn khổ 10x15cm và A4).
---

# ID Photo Specifications & Standards (Tiêu Chuẩn Kỹ Thuật Ảnh Thẻ)

Tài liệu kỹ thuật định nghĩa các thông số chuẩn phục vụ cắt ảnh, tách nền, thay màu nền và dàn trang in cho dự án **ANhthe (AI ID Photo Studio)**.

---

## 1. Bảng Quy Chuẩn Kích Thước Ảnh Thẻ

| Loại ảnh thẻ | Kích thước (mm) | Tỉ lệ | Pixel @ 300 DPI | Ứng dụng phổ biến |
| :--- | :--- | :--- | :--- | :--- |
| **Ảnh 3x4 cm** | 30 x 40 mm | 3:4 | 354 x 472 px | Thẻ học sinh, sinh viên, bằng lái xe, hồ sơ xin việc |
| **Ảnh 4x6 cm** | 40 x 60 mm | 2:3 | 472 x 709 px | Hộ chiếu Việt Nam, CCCD, hồ sơ công chứng |
| **Ảnh 2x3 cm** | 20 x 30 mm | 2:3 | 236 x 354 px | Bằng lái xe cũ, thẻ đoàn, bảo hiểm y tế |
| **Visa Schengen / Châu Âu** | 35 x 45 mm | 7:9 | 413 x 531 px | Visa Pháp, Đức, Ý, Hàn Quốc, Nhật Bản |
| **Visa Hoa Kỳ (US Passport)**| 50.8 x 50.8 mm (2x2") | 1:1 | 600 x 600 px | Visa Mỹ, DS-160, Thẻ xanh định cư |
| **Ảnh 9x12 cm** | 90 x 120 mm | 3:4 | 1063 x 1417 px | Hồ sơ cán bộ, chân dung kỷ niệm |

---

## 2. Tiêu Chuẩn Sinh Trắc Học Khuôn Mặt (ICAO Doc 9303 & ISO/IEC 19794-5)

1. **Chiều cao khuôn mặt (Chin to Crown)**:
   - Khoảng cách từ đáy cằm đến đỉnh đầu (không tính tóc dựng cao) chiếm **70% - 80%** tổng chiều cao ảnh thẻ.
   - Với ảnh 4x6 cm: Chiều cao khuôn mặt đạt từ 32mm đến 36mm.
   - Với ảnh 3x4 cm: Chiều cao khuôn mặt đạt từ 22mm đến 28mm.
2. **Đường định vị Mắt (Eye Level Line)**:
   - Cách mép dưới ảnh khoảng **50% - 60%** chiều cao.
   - Hai mắt nằm ngang, không nghiêng đầu quá 5 độ.
3. **Khoảng cách mép trên (Top Margin)**:
   - Từ đỉnh đầu đến mép trên ảnh tối thiểu 8% - 10% (khoảng 3-5 mm).

---

## 3. Bảng Màu Phông Nền Chuẩn (Standard Background Colors)

| Tên màu nền | Mã Hex | RGB | Gợi ý sử dụng |
| :--- | :--- | :--- | :--- |
| **Trắng chuẩn quốc tế** | `#FFFFFF` | 255, 255, 255 | Hộ chiếu, Visa các nước (Mỹ, Schengen, Nhật), CCCD |
| **Xanh hồ sơ Việt Nam** | `#0072C6` | 0, 114, 198 | Hồ sơ xin việc, bằng lái xe, học bạ, hồ sơ hành chính VN |
| **Xanh thẫm (Deep Royal Blue)** | `#1A4480` | 26, 68, 128 | Bằng tốt nghiệp, chứng chỉ nghề nghiệp |
| **Đỏ kỷ yếu** | `#DC2626` | 220, 38, 38 | Huy hiệu, thẻ đảng viên, bằng khen |
| **Xám trung tính (Light Gray)** | `#E5E7EB` | 229, 231, 235 | Ảnh profile doanh nghiệp, portfolio hiện đại |

---

## 4. Quy Cách Dàn Khổ In (Print Sheet Standards)

### Khổ In Tiệm Lab: 10 x 15 cm (4R - 102 x 152 mm @ 300 DPI = 1205 x 1795 px)
- **Tùy chọn 8 ảnh 3x4 cm**: Bố cục 2 hàng x 4 cột. Khoảng cách (gap) giữa các ảnh 2 mm kèm đường kẻ cắt xám mảnh (#CCCCCC, nét đứt hoặc solid 1px).
- **Tùy chọn 4 ảnh 4x6 cm**: Bố cục 2 hàng x 2 cột, lề ngoài (margin) an toàn 5 mm.
- **Tùy chọn phối hợp linh hoạt**: 4 ảnh 3x4 cm + 2 ảnh 4x6 cm trên cùng 1 tấm giấy 10x15 cm (được người dùng ưa chuộng nhất).

### Khổ In Văn Phòng: A4 (210 x 297 mm @ 300 DPI = 2480 x 3508 px)
- Bố cục lên đến 24 ảnh 3x4 cm hoặc 16 ảnh 4x6 cm trên một trang.
