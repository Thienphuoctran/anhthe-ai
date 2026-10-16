---
name: design-dna
description: Spatial Bento Grid, Glassmorphism, and Semantic MOS Color Tokens for MOS Master Studio.
---

# Design DNA: Spatial Bento Grid & Semantic Tokens

## 1. Hệ thống Bảng màu Ngữ nghĩa 3 Môn thi MOS
Đồng bộ trực tiếp với CSS Variables trong `globals.css`:
- **MOS Excel (MO-200 / MO-201):** `--mos-excel: 152 77% 27%` (`#107C41`)
- **MOS Word (MO-100 / MO-101):** `--mos-word: 216 78% 42%` (`#185ABD`)
- **MOS PowerPoint (MO-300):** `--mos-ppt: 12 70% 49%` (`#D24726`)

## 2. Spatial Bento Grid & Glassmorphism
- **Kính mờ đa tầng:** `backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-zinc-800`
- **Viền phản quang cao cấp 1px:** `shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]`
- **Góc bo chuẩn:** `rounded-2xl` (`--radius: 0.85rem`)

## 3. Quy chuẩn Responsive & Mobile-First
- Tối ưu hiển thị đa kích thước: Từ điện thoại học sinh đến màn hình thực hành máy tính chuẩn phòng thi Certiport (1920x1080 / 1366x768).
