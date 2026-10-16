# Danh Mục Các Kho Mã Nguồn & Dự Án Antigravity Đã Kết Nối (REPOS & PROJECTS)

Tài liệu này tổng hợp các kho mã nguồn, dự án và tài nguyên đã có trên máy tính để các Agent trong dự án **ANhthe (AI ID Photo Studio)** tra cứu và kế thừa:

---

## 1. Dự án Hiện Tại
- **Đường dẫn:** `d:\google antigravity\ANhthe`
- **Mục tiêu:** Nền tảng Studio Tạo Ảnh Thẻ Thông Minh (3x4, 4x6, 2x3, Visa, Passport, CCCD) chạy WebAssembly AI Client-Side 100% riêng tư.
- **Kiến trúc cốt lõi:**
  - **Framework:** Next.js 14+ (App Router, TypeScript).
  - **Styling & UI:** Tailwind CSS, Shadcn UI (`components.json`), Lucide React.
  - **AI Engine:** `@imgly/background-removal` (WASM + ONNX chạy trực tiếp trên browser, không gửi dữ liệu ra ngoài).
  - **Canvas Processing:** HTML5 Canvas 2D Engine, xuất ảnh chuẩn 300 DPI, hỗ trợ Guide Lines sinh trắc học ICAO 9303.
  - **Print Layout:** Thuật toán tự động dàn trang ảnh thẻ lên khổ 10x15cm (4R) và A4 kèm vạch cắt viền (crop marks).
  - **Hiệu ứng:** `canvas-confetti` chúc mừng khi hoàn thành và tải ảnh.

---

## 2. Dự án MOS Master Studio (Kế thừa Cấu trúc Studio & Design System)
- **Đường dẫn:** `d:\google antigravity\mos-master-studio`
- **Tài nguyên kế thừa:**
  - Cấu trúc hệ thống Agent chuyên sâu (`.agents/`, `.antigravity/`, `AGENTS.md`, `GEMINI.md`).
  - Thiết kế Bento Grid, kính mờ Glassmorphism, Semantic Color Tokens từ `design-dna`.
  - Bộ tích hợp component `shadcn` và hoạt ảnh `gsap-skills`.
  - Quy trình 4-Agent Loop chuẩn mực: `[ARCHITECT]` -> `[CODER]` -> `[REVIEWER]` -> `[TESTER]`.

---

## 3. Hệ Sinh Thái Agency Agents & Global Plugins
- **Đường dẫn:** `C:\Users\phuoc\.gemini\config\plugins\agency-agents`
- **Tài nguyên kết nối:**
  - 15 Core Project Agents (`01-orchestrator` đến `15-prompt-architect`).
  - Bộ Playbooks giai đoạn phát triển: Khảo sát (Phase 0), Kiến trúc (Phase 1), Xây dựng (Phase 3), Hoàn thiện (Phase 4).
  - Thư viện Kỹ năng toàn cục tại `C:\Users\phuoc\.agents\skills` (`shadcn`, `design-dna`, `gsap-core`, `agent-reach`).

---

## 4. Dự án Video Studio (`video-studio`)
- **Đường dẫn:** `c:\AI-Projects\video-studio`
- **Tài nguyên kế thừa:**
  - Kỹ thuật tối ưu bộ nhớ khi xử lý hình ảnh, canvas render và export độ phân giải cao.
  - Cấu trúc file cấu hình Next.js với WebAssembly và SharedArrayBuffer.

---

## 5. Dự án Ứng Dụng Học Toán (`ứng dụng học toán`)
- **Đường dẫn:** `d:\google antigravity\ứng dụng học toán`
- **Tài nguyên tham khảo:**
  - Cấu hình chuẩn Next.js, TypeScript và xử lý state tương tác mượt mà trên browser.
