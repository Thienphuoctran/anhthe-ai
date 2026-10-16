"use client";

import React, { useState } from "react";
import {
  Printer,
  Scissors,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";

interface PhotoSpecsShowcaseProps {
  onSelectSpecAction: () => void;
}

interface SpecItem {
  id: string;
  name: string;
  dimensionsMm: string;
  resolution300Dpi: string;
  popularUses: string[];
  compliance: string;
  badgeColor: string;
  bgStandard: string;
  aspectRatio: string; // for visual representation
}

const photoSpecs: SpecItem[] = [
  {
    id: "4x6",
    name: "Ảnh 4x6 cm",
    dimensionsMm: "40 x 60 mm",
    resolution300Dpi: "472 x 709 px",
    popularUses: [
      "Hộ chiếu phổ thông Việt Nam",
      "Bằng lái xe PET & Quốc tế",
      "Cổng Dịch Vụ Công Quốc Gia",
      "Chứng chỉ quốc tế (IELTS, TOEIC)",
    ],
    compliance: "ICAO Doc 9303",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    bgStandard: "Phông Trắng / Phông Xanh",
    aspectRatio: "aspect-[2/3]",
  },
  {
    id: "3x4",
    name: "Ảnh 3x4 cm",
    dimensionsMm: "30 x 40 mm",
    resolution300Dpi: "354 x 472 px",
    popularUses: [
      "Học bạ, hồ sơ nhập học sinh viên",
      "Thẻ nhân viên, thẻ sinh viên",
      "Hồ sơ xin việc, CV công chứng",
      "Đăng ký thủ tục tại địa phương",
    ],
    compliance: "Tiêu chuẩn Hành chính VN",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bgStandard: "Phông Xanh / Phông Trắng",
    aspectRatio: "aspect-[3/4]",
  },
  {
    id: "3.5x4.5",
    name: "Ảnh 3.5x4.5 cm",
    dimensionsMm: "35 x 45 mm",
    resolution300Dpi: "413 x 531 px",
    popularUses: [
      "Visa Schengen (27 nước Châu Âu)",
      "Visa Hàn Quốc, Nhật Bản, Đài Loan",
      "Visa Vương Quốc Anh, Canada, Úc",
      "Hồ sơ định cư quốc tế",
    ],
    compliance: "Tiêu chuẩn Visa Châu Âu",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bgStandard: "Phông Trắng sáng tuyệt đối",
    aspectRatio: "aspect-[7/9]",
  },
  {
    id: "5x5",
    name: "Ảnh 5x5 cm (2x2 inch)",
    dimensionsMm: "50 x 50 mm",
    resolution300Dpi: "591 x 591 px",
    popularUses: [
      "Visa Mỹ (Mẫu đơn điện tử DS-160)",
      "Visa Ấn Độ (E-Visa)",
      "Thẻ xanh định cư Mỹ (Green Card)",
      "Hồ sơ nhập cảnh một số nước Nam Mỹ",
    ],
    compliance: "US Dept of State Standard",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    bgStandard: "Phông Trắng ngà / Trắng sáng",
    aspectRatio: "aspect-square",
  },
  {
    id: "2x3",
    name: "Ảnh 2x3 cm",
    dimensionsMm: "20 x 30 mm",
    resolution300Dpi: "236 x 354 px",
    popularUses: [
      "Thẻ Bảo hiểm y tế (BHYT)",
      "Sổ khám bệnh viện, y bạ",
      "Thẻ học sinh mầm non & tiểu học",
      "Thẻ thành viên, thẻ CLB",
    ],
    compliance: "Quy chuẩn Y tế & Giáo dục",
    badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
    bgStandard: "Phông Xanh dương / Trắng",
    aspectRatio: "aspect-[2/3]",
  },
];

export default function PhotoSpecsShowcase({ onSelectSpecAction }: PhotoSpecsShowcaseProps) {
  const [selectedSpecId, setSelectedSpecId] = useState<string>("4x6");
  const [sheetLayout, setSheetLayout] = useState<"4x6" | "3x4">("4x6");

  const activeSpec = photoSpecs.find((s) => s.id === selectedSpecId) || photoSpecs[0];

  return (
    <section className="py-12 sm:py-16 bg-slate-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Tiêu đề mục */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Đầy Đủ 5 Kích Thước Tiêu Chuẩn Toàn Cầu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Đáp Ứng Mọi Nhu Cầu Làm Hồ Sơ & Visa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Hệ thống tự động căn tỷ lệ khuôn mặt theo đúng thông tư của Bộ Công An và tiêu chuẩn sinh trắc học ICAO Doc 9303.
          </p>
        </div>

        {/* ================= BENTO GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CỘT TRÁI: DANH SÁCH 5 KÍCH THƯỚC CHUẨN (7 CỘT) */}
          <div className="lg:col-span-7 space-y-3">
            {photoSpecs.map((spec) => {
              const isSelected = spec.id === selectedSpecId;
              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecId(spec.id)}
                  className={`cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-200 border-2 ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
                      : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          {spec.name}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${spec.badgeColor}`}
                        >
                          {spec.compliance}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-medium text-blue-700 flex items-center gap-2">
                        <span>Kích thước: {spec.dimensionsMm}</span>
                        <span>•</span>
                        <span>{spec.resolution300Dpi} @ 300 DPI</span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Danh sách mục đích sử dụng */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phù hợp cho hồ sơ:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {spec.popularUses.map((use, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg font-medium"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Nút hành động nhanh */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onSelectSpecAction}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tạo ảnh {activeSpec.name} ngay bây giờ →</span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: MÔ PHỎNG VỈ IN 10X15CM (4R) SIÊU TIẾT KIỆM (5 CỘT) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xl shadow-slate-200/50 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Mô phỏng Vỉ in 10x15cm (4R)
                  </h3>
                  <p className="text-[11px] text-slate-500">Chuẩn giấy in ảnh bóng Lab Studio</p>
                </div>
              </div>

              {/* Nút chuyển đổi cỡ vỉ */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSheetLayout("4x6")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    sheetLayout === "4x6"
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  4 ảnh 4x6
                </button>
                <button
                  type="button"
                  onClick={() => setSheetLayout("3x4")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    sheetLayout === "3x4"
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  8 ảnh 3x4
                </button>
              </div>
            </div>

            {/* Khung mô phỏng tờ giấy in 10x15cm với vạch xén chữ thập */}
            <div className="relative aspect-[3/2] w-full bg-slate-100 rounded-2xl border-2 border-slate-300/80 p-3 sm:p-4 shadow-inner flex flex-col justify-between overflow-hidden">
              {/* Header tờ giấy */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>KHỔ GIẤY 10x15 CM (1800 x 1200 px @ 300 DPI)</span>
                <span className="text-emerald-600 font-bold">CHI PHÍ: 2.000Đ</span>
              </div>

              {/* Bố cục ảnh xếp ngay ngắn trên tờ giấy */}
              {sheetLayout === "4x6" ? (
                /* 4 Ảnh 4x6 cm thẳng đứng */
                <div className="grid grid-cols-4 gap-2 sm:gap-3 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="relative aspect-[2/3] bg-gradient-to-b from-[#2589f5] to-[#083884] rounded-sm border border-slate-400 shadow-xs flex flex-col items-center justify-end p-1 overflow-hidden"
                    >
                      {/* Vạch cắt góc */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/60 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/60 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/60 pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/60 pointer-events-none" />

                      {/* Icon người nhỏ */}
                      <div className="w-5 h-5 rounded-full bg-amber-100/90 mb-1" />
                      <div className="w-8 h-4 rounded-t-full bg-slate-900/80" />
                      <span className="text-[8px] font-mono font-bold text-white mt-0.5">4x6</span>
                    </div>
                  ))}
                </div>
              ) : (
                /* 8 Ảnh 3x4 cm xếp 2 hàng x 4 cột */
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 py-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="relative aspect-[3/4] bg-gradient-to-b from-[#2589f5] to-[#083884] rounded-sm border border-slate-400 shadow-xs flex flex-col items-center justify-end p-0.5 overflow-hidden"
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-100/90 mb-0.5" />
                      <div className="w-6 h-3 rounded-t-full bg-slate-900/80" />
                      <span className="text-[7px] font-mono font-bold text-white">3x4</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer tờ giấy: Có vạch cắt viền xén */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Scissors className="w-3 h-3 text-slate-400" />
                  Có vạch cắt chữ thập Crop Marks
                </span>
                <span className="font-bold text-blue-600">Đầu thẳng đứng 100%</span>
              </div>
            </div>

            {/* Lợi thế khi in vỉ ảnh */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Đầu người luôn hướng lên trên</strong>, không bao giờ bị xoay ngang làm mất công cắt sửa.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chỉ cần gửi 1 file này</strong> qua Zalo/USB cho tiệm in là lấy ngay 4 đến 8 ảnh thẻ bóng loáng.
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
