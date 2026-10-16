"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Printer,
  User,
  Download,
  CheckCircle2,
  Scissors,
  ShieldCheck,
  Sparkles,
  Ruler,
  RotateCcw,
} from "lucide-react";
import { PhotoSizeKey, PHOTO_DIMENSIONS } from "@/lib/canvasUtils";

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  singlePhotoDataUrl: string;
  sheetPhotoDataUrl: string;
  size: PhotoSizeKey;
  onDownloadBundle: () => void;
  isExporting?: boolean;
}

type PreviewViewMode = "single" | "sheet";

export default function PrintPreviewModal({
  isOpen,
  onClose,
  singlePhotoDataUrl,
  sheetPhotoDataUrl,
  size,
  onDownloadBundle,
  isExporting = false,
}: PrintPreviewModalProps) {
  const [viewMode, setViewMode] = useState<PreviewViewMode>("sheet");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset zoom khi chuyển tab hoặc mở modal
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
    }
  }, [isOpen, viewMode]);

  if (!isOpen) return null;

  const spec = PHOTO_DIMENSIONS[size] || PHOTO_DIMENSIONS["4x6"];

  // Tính toán kích thước mm thực tế cho thước đo chuẩn
  let widthMm = 40;
  let heightMm = 60;
  if (size === "2x3") {
    widthMm = 20;
    heightMm = 30;
  } else if (size === "3x4") {
    widthMm = 30;
    heightMm = 40;
  } else if (size === "3.5x4.5") {
    widthMm = 35;
    heightMm = 45;
  } else if (size === "4x6") {
    widthMm = 40;
    heightMm = 60;
  } else if (size === "visa") {
    widthMm = 50;
    heightMm = 50;
  }

  // Tạo các vạch chia mm trên thước đo (mỗi 5mm có vạch trung bình, mỗi 10mm có vạch dài và số)
  const topTickMarks = Array.from({ length: widthMm + 1 }, (_, i) => i);
  const leftTickMarks = Array.from({ length: heightMm + 1 }, (_, i) => i);

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.6 : 1));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/92 backdrop-blur-md text-white animate-in fade-in duration-200 select-none overflow-hidden"
    >
      {/* ================= 1. HEADER MODAL ================= */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Tiêu đề & Thông số */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                Xem Trước Bản In Hoàn Chỉnh
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Chuẩn 300 DPI Lab
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {viewMode === "single"
                ? `Ảnh thẻ ${spec.label} (${spec.dimensionsCm})`
                : `Giả lập khổ in tiệm ảnh 10x15cm (${spec.sheetCount} ảnh)`}
            </p>
          </div>
        </div>

        {/* Thanh chuyển đổi 2 chế độ xem Segmented Control */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode("single")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "single"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ảnh thẻ đơn</span>
            <span className="sm:hidden">Ảnh đơn</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("sheet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "sheet"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vỉ in 10x15cm ({spec.sheetCount} ảnh)</span>
            <span className="sm:hidden">Vỉ 10x15 ({spec.sheetCount})</span>
          </button>
        </div>

        {/* Nút đóng X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ xem trước"
          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* ================= 2. KHU VỰC HIỂN THỊ CHÍNH (VIEWPORT) ================= */}
      <main
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] bg-slate-950/70"
      >
        {/* ---------------- CHẾ ĐỘ 1: ẢNH THẺ ĐƠN CÓ THƯỚC ĐO MM CHUẨN ---------------- */}
        {viewMode === "single" && (
          <div
            className="flex flex-col items-center transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Hộp thước đo bao quanh viền ảnh */}
            <div className="relative p-7 sm:p-9 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
              {/* Thước đo ngang ở mép trên (Top Ruler) */}
              <div className="absolute top-1 left-7 sm:left-9 right-7 sm:right-9 h-6 flex justify-between items-end border-b border-blue-400/50 pb-0.5 text-[9px] text-blue-300 font-mono">
                {topTickMarks.map((mm) => {
                  const isMajor = mm % 10 === 0;
                  const isMid = mm % 5 === 0;
                  return (
                    <div
                      key={`top-${mm}`}
                      className="flex flex-col items-center"
                      style={{
                        position: "absolute",
                        left: `${(mm / widthMm) * 100}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      {isMajor && (
                        <span className="text-[9px] font-bold text-blue-200 mb-0.5">
                          {mm}
                        </span>
                      )}
                      <div
                        className={`w-[1px] ${
                          isMajor
                            ? "h-2.5 bg-blue-300"
                            : isMid
                            ? "h-1.5 bg-blue-400/70"
                            : "h-1 bg-blue-500/40"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Thước đo dọc ở mép trái (Left Ruler) */}
              <div className="absolute left-1 top-7 sm:top-9 bottom-7 sm:bottom-9 w-6 flex flex-col justify-between items-end border-r border-blue-400/50 pr-0.5 text-[9px] text-blue-300 font-mono">
                {leftTickMarks.map((mm) => {
                  const isMajor = mm % 10 === 0;
                  const isMid = mm % 5 === 0;
                  return (
                    <div
                      key={`left-${mm}`}
                      className="flex items-center"
                      style={{
                        position: "absolute",
                        top: `${(mm / heightMm) * 100}%`,
                        transform: "translateY(-50%)",
                      }}
                    >
                      {isMajor && (
                        <span className="text-[9px] font-bold text-blue-200 mr-1">
                          {mm}
                        </span>
                      )}
                      <div
                        className={`h-[1px] ${
                          isMajor
                            ? "w-2.5 bg-blue-300"
                            : isMid
                            ? "w-1.5 bg-blue-400/70"
                            : "w-1 bg-blue-500/40"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Khung ảnh thẻ đơn hiển thị sắc nét */}
              <div className="relative rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900">
                <img
                  src={singlePhotoDataUrl}
                  alt="Ảnh thẻ đơn chuẩn"
                  className="max-h-[60vh] max-w-[85vw] object-contain block"
                />

                {/* Tag định danh kích thước thực tế */}
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5">
                  <Ruler className="w-3 h-3 text-blue-400" />
                  <span>
                    {widthMm} × {heightMm} mm ({spec.dimensionsCm})
                  </span>
                </div>
              </div>

              {/* Thông số góc dưới */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đúng chuẩn kích thước Dịch vụ công & ICAO
                </span>
                <span className="font-mono text-slate-400">
                  {spec.width} × {spec.height} px
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CHẾ ĐỘ 2: GIẢ LẬP TỜ GIẤY IN 10x15cm (STUDIO MOCKUP) ---------------- */}
        {viewMode === "sheet" && (
          <div
            className="flex flex-col items-center transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Tờ giấy in ảnh bóng 10x15cm (Glossy Photo Paper Mockup) */}
            <div className="relative bg-white rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-2 sm:p-3 border border-slate-300/40 max-w-[92vw]">
              {/* Lớp ánh bóng Glossy nhẹ đặc trưng của giấy ảnh in tiệm */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />

              {/* Vạch cắt viền và biểu tượng cây kéo ở 4 góc */}
              <div className="absolute -top-3 -left-3 text-slate-400 flex items-center gap-0.5 text-[10px] font-mono pointer-events-none">
                <Scissors className="w-3.5 h-3.5" />
                <span>✂</span>
              </div>
              <div className="absolute -top-3 -right-3 text-slate-400 flex items-center gap-0.5 text-[10px] font-mono pointer-events-none">
                <span>✂</span>
              </div>

              {/* Ảnh bản in vỉ 10x15cm hoàn chỉnh */}
              <div className="rounded-lg overflow-hidden bg-white shadow-inner">
                <img
                  src={sheetPhotoDataUrl}
                  alt="Vỉ in ảnh 10x15cm"
                  className="max-h-[62vh] max-w-[88vw] object-contain block"
                />
              </div>

              {/* Huy hiệu ghi chú kích cỡ tờ giấy in */}
              <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 px-1">
                <span className="font-medium flex items-center gap-1 text-slate-700">
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  Khổ in Lab: <strong>10 × 15 cm (4R)</strong> • Đủ{" "}
                  <strong>{spec.sheetCount} ảnh thẻ</strong>
                </span>
                <span className="font-mono text-slate-500">
                  {size === "4x6" || size === "visa" ? "1200 × 1800" : "1800 × 1200"} px @ 300 DPI
                </span>
              </div>
            </div>

            {/* Khung gợi ý tiết kiệm chi phí in ấn */}
            <div className="mt-4 px-4 py-2 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                💡 <strong>Mẹo tiết kiệm:</strong> Chỉ cần lưu file này vào điện
                thoại rồi mang ra tiệm ảnh in, giá chỉ <strong>2.000đ - 3.000đ</strong>{" "}
                là có trọn bộ {spec.sheetCount} ảnh!
              </span>
            </div>
          </div>
        )}
      </main>

      {/* ================= 3. THANH CÔNG CỤ PHÍA DƯỚI (BOTTOM BAR) ================= */}
      <footer className="h-18 px-4 sm:px-6 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 py-2.5">
        {/* Nút Phóng to / Thu nhỏ soi chi tiết mắt, da, tóc */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleZoom}
            className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              zoomLevel > 1
                ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title="Phóng to 160% để soi nét mắt, da, tóc trước khi in"
          >
            {zoomLevel > 1 ? (
              <>
                <ZoomOut className="w-4 h-4" />
                <span>Thu vừa màn hình</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-4 h-4" />
                <span>Phóng to 160% (Soi độ nét)</span>
              </>
            )}
          </button>

          {zoomLevel > 1 && (
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition"
              title="Đặt lại mức zoom ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nút Đóng & Nút chính: Tải File Bản In Này */}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition"
          >
            Quay lại chỉnh sửa
          </button>

          <button
            type="button"
            onClick={() => {
              onDownloadBundle();
              onClose();
            }}
            disabled={isExporting}
            className="min-h-[44px] px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Tải File Bản In Này (Vỉ 10x15cm)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
