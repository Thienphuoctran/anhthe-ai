"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Upload,
  UserCheck,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Printer,
  Sliders,
  ChevronRight,
  Award,
} from "lucide-react";

interface HeroInteractiveSectionProps {
  onPickFile: () => void;
  onOpenCamera: () => void;
  onTrySample: () => void;
  onOpenGuide: () => void;
  onDropFile: (file: File) => void;
}

export default function HeroInteractiveSection({
  onPickFile,
  onOpenCamera,
  onTrySample,
  onOpenGuide,
  onDropFile,
}: HeroInteractiveSectionProps) {
  const [sliderPos, setSliderPos] = useState<number>(50); // % từ 0 đến 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      updatePosition(e.touches[0].clientX);
    };
    const handleStop = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleStop);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleStop);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleStop);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleStop);
    };
  }, [isDragging, updatePosition]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onDropFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
      {/* Nền hiệu ứng ánh sáng Studio Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-400/10 via-indigo-400/10 to-teal-400/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Thanh thông báo huy hiệu uy tín */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đạt chuẩn ICAO 9303 & Cổng Dịch Vụ Công Quốc Gia</span>
          </div>

          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition shadow-2xs"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
            <span>💡 Cẩm nang chụp chuẩn 10/10</span>
          </button>
        </div>

        {/* Tiêu đề chính & Giới thiệu */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
            Tạo Ảnh Thẻ Chuẩn Sinh Trắc Học{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
              Ngay Tại Nhà
            </span>{" "}
            Trong 30 Giây
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Công nghệ AI WebAssembly tự động tách nền từng sợi tóc, làm đẹp da chuẩn Studio, thay áo sơ mi & vest lịch thiệp, xuất vỉ 8 ảnh khổ 10x15cm sẵn sàng đi in chỉ 2.000đ.
          </p>
        </div>

        {/* Bố cục chính 2 cột: Interactive Slider bên trái, Hộp hành động bên phải */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ================= CỘT TRÁI: SLIDER TRƯỚC / SAU ================= */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-md" style={{ maxWidth: "440px" }}>
              <div
                ref={containerRef}
                className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-white ring-1 ring-slate-200/80 cursor-ew-resize select-none bg-slate-900"
                style={{ aspectRatio: "3/4" }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                {/* 1. LỚP PHÍA SAU (BÊN PHẢI): ẢNH THẺ STUDIO HOÀN HẢO */}
                <div className="absolute inset-0 w-full h-full">
                  {/* SVG Chân dung Studio cao cấp */}
                  <svg
                    viewBox="0 0 600 800"
                    className="w-full h-full object-cover"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <radialGradient id="studioBg" cx="50%" cy="40%" r="65%">
                        <stop offset="0%" stopColor="#2589f5" />
                        <stop offset="45%" stopColor="#0d62d9" />
                        <stop offset="100%" stopColor="#083884" />
                      </radialGradient>
                      <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="skinGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#feddc1" />
                        <stop offset="60%" stopColor="#f8cda9" />
                        <stop offset="100%" stopColor="#eab58d" />
                      </linearGradient>
                      <filter id="shadowStudio" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    {/* Phông xanh Studio có radial glow */}
                    <rect width="600" height="800" fill="url(#studioBg)" />

                    {/* Áo Vest Xanh Navy + Sơ mi trắng cổ đứng lịch lãm */}
                    <g transform="translate(0, 10)">
                      {/* Áo vest đen/navy */}
                      <path
                        d="M 40,800 L 40,580 Q 150,470 250,470 L 350,470 Q 450,470 560,580 L 560,800 Z"
                        fill="url(#suitGrad)"
                      />
                      {/* Cổ áo sơ mi trắng tinh */}
                      <polygon points="250,470 300,580 350,470 330,460 300,500 270,460" fill="#ffffff" />
                      {/* Vạt áo vest xẻ chữ V */}
                      <polygon points="230,475 285,670 250,800 200,800" fill="#0f172a" opacity="0.8" />
                      <polygon points="370,475 315,670 350,800 400,800" fill="#0f172a" opacity="0.8" />
                      {/* Cà vạt xanh đậm cao cấp */}
                      <polygon points="292,490 308,490 312,650 300,670 288,650" fill="#1e3a8a" />
                      <polygon points="290,490 310,490 306,515 294,515" fill="#172554" />
                    </g>

                    {/* Cổ người */}
                    <path d="M 242,390 L 358,390 L 368,510 Q 300,545 232,510 Z" fill="url(#skinGlow)" />

                    {/* Tai trái & phải */}
                    <ellipse cx="172" cy="305" rx="22" ry="42" fill="url(#skinGlow)" />
                    <ellipse cx="428" cy="305" rx="22" ry="42" fill="url(#skinGlow)" />

                    {/* Khuôn mặt chuẩn sinh trắc học */}
                    <path
                      d="M 180,230 Q 180,125 300,125 Q 420,125 420,230 L 416,310 Q 410,440 300,450 Q 190,440 184,310 Z"
                      fill="url(#skinGlow)"
                      filter="url(#shadowStudio)"
                    />

                    {/* Má hồng hào tươi tắn */}
                    <ellipse cx="230" cy="325" rx="28" ry="16" fill="#f43f5e" opacity="0.14" />
                    <ellipse cx="370" cy="325" rx="28" ry="16" fill="#f43f5e" opacity="0.14" />

                    {/* Lông mày gọn gàng */}
                    <path d="M 216,252 Q 248,240 276,250" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
                    <path d="M 324,250 Q 352,240 384,252" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />

                    {/* Mắt sáng có catchlight studio */}
                    <ellipse cx="248" cy="280" rx="18" ry="11" fill="#ffffff" />
                    <circle cx="248" cy="280" r="9" fill="#1e293b" />
                    <circle cx="245" cy="277" r="3.5" fill="#ffffff" />
                    <circle cx="251" cy="282" r="1.5" fill="#ffffff" opacity="0.8" />

                    <ellipse cx="352" cy="280" rx="18" ry="11" fill="#ffffff" />
                    <circle cx="352" cy="280" r="9" fill="#1e293b" />
                    <circle cx="349" cy="277" r="3.5" fill="#ffffff" />
                    <circle cx="355" cy="282" r="1.5" fill="#ffffff" opacity="0.8" />

                    {/* Sống mũi cao thanh thoát */}
                    <path d="M 300,280 L 296,336 Q 300,344 310,340" fill="none" stroke="#c88a5e" strokeWidth="4" strokeLinecap="round" />

                    {/* Miệng cười mỉm nhẹ nhàng lịch thiệp */}
                    <path d="M 264,378 Q 300,396 336,378" fill="none" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 272,381 Q 300,392 328,381" fill="none" stroke="#fda4af" strokeWidth="3" strokeLinecap="round" />

                    {/* Tóc đen mượt, lộ trán & tai */}
                    <path
                      d="M 174,260 Q 162,150 225,100 Q 300,68 375,104 Q 438,142 426,260 Q 416,188 372,155 Q 306,176 230,158 Q 188,188 174,260 Z"
                      fill="#090d16"
                    />

                    {/* Đường căn sinh trắc học ICAO tinh tế */}
                    <line x1="60" y1="90" x2="540" y2="90" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
                    <line x1="60" y1="280" x2="540" y2="280" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
                    <line x1="60" y1="450" x2="540" y2="450" stroke="#34d399" strokeWidth="2" strokeDasharray="6 4" opacity="0.8" />
                    <ellipse cx="300" cy="290" rx="150" ry="210" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                  </svg>

                  {/* Nhãn góc phải: CHUẨN STUDIO */}
                  <div className="absolute top-3 right-3 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-emerald-400/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Sau: Chuẩn Studio</span>
                  </div>

                  {/* Nhãn thông số ICAO ở đáy */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-700/60">
                    ICAO 9303 • 300 DPI
                  </div>
                </div>

                {/* 2. LỚP PHÍA TRƯỚC (BÊN TRÁI): ẢNH TỰ CHỤP TẠI NHÀ (CLIPPED) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                  }}
                >
                  <div className="relative w-full h-full">
                    <svg
                      viewBox="0 0 600 800"
                      className="w-full h-full object-cover"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      <defs>
                        <linearGradient id="wallBg" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#94a3b8" />
                          <stop offset="60%" stopColor="#64748b" />
                          <stop offset="100%" stopColor="#475569" />
                        </linearGradient>
                        <linearGradient id="casualTee" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#64748b" />
                          <stop offset="100%" stopColor="#334155" />
                        </linearGradient>
                        <linearGradient id="dimSkin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e2b896" />
                          <stop offset="100%" stopColor="#c5926b" />
                        </linearGradient>
                      </defs>

                      {/* Phông nền phòng nhà hơi tối & có ranh giới cửa/tường */}
                      <rect width="600" height="800" fill="url(#wallBg)" />
                      <line x1="160" y1="0" x2="120" y2="800" stroke="#334155" strokeWidth="4" opacity="0.4" />
                      <rect x="0" y="0" width="140" height="800" fill="#1e293b" opacity="0.25" />

                      {/* Áo phông thường mặc ở nhà */}
                      <path
                        d="M 40,800 L 40,580 Q 150,470 250,470 L 350,470 Q 450,470 560,580 L 560,800 Z"
                        fill="url(#casualTee)"
                      />
                      {/* Cổ áo tròn thường */}
                      <ellipse cx="300" cy="505" rx="55" ry="32" fill="url(#dimSkin)" />

                      {/* Cổ người hơi tối */}
                      <path d="M 242,390 L 358,390 L 368,510 Q 300,545 232,510 Z" fill="url(#dimSkin)" />

                      {/* Tai */}
                      <ellipse cx="172" cy="305" rx="22" ry="42" fill="url(#dimSkin)" />
                      <ellipse cx="428" cy="305" rx="22" ry="42" fill="url(#dimSkin)" />

                      {/* Khuôn mặt chụp bằng điện thoại */}
                      <path
                        d="M 180,230 Q 180,125 300,125 Q 420,125 420,230 L 416,310 Q 410,440 300,450 Q 190,440 184,310 Z"
                        fill="url(#dimSkin)"
                      />

                      {/* Lông mày */}
                      <path d="M 216,252 Q 248,240 276,250" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 324,250 Q 352,240 384,252" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

                      {/* Mắt bình thường (thiếu catchlight) */}
                      <ellipse cx="248" cy="280" rx="17" ry="10" fill="#ffffff" opacity="0.9" />
                      <circle cx="248" cy="280" r="8" fill="#1e293b" />
                      <ellipse cx="352" cy="280" rx="17" ry="10" fill="#ffffff" opacity="0.9" />
                      <circle cx="352" cy="280" r="8" fill="#1e293b" />

                      {/* Mũi & Miệng bình thường */}
                      <path d="M 300,280 L 296,336 Q 300,344 310,340" fill="none" stroke="#a76e47" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 266,380 Q 300,394 334,380" fill="none" stroke="#9f1239" strokeWidth="5" strokeLinecap="round" />

                      {/* Tóc */}
                      <path
                        d="M 174,260 Q 162,150 225,100 Q 300,68 375,104 Q 438,142 426,260 Q 416,188 372,155 Q 306,176 230,158 Q 188,188 174,260 Z"
                        fill="#1e293b"
                      />
                    </svg>

                    {/* Nhãn góc trái: ẢNH TỰ CHỤP */}
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-slate-700/60">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Trước: Tự chụp tại nhà</span>
                    </div>
                  </div>
                </div>

                {/* 3. THANH KÉO TRỤC DỌC (DIVIDER SLIDER) */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-blue-700 shadow-xl border-2 border-blue-600 flex items-center justify-center pointer-events-auto">
                    <Sliders className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Dòng hướng dẫn kéo */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 font-medium px-2">
                <span>◂ Ảnh gốc tại nhà</span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  Kéo sang 2 bên để so sánh
                </span>
                <span>Ảnh Studio ▸</span>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: KHUNG HÀNH ĐỘNG CHÍNH ================= */}
          <div className="lg:col-span-6 space-y-5">
            {/* Hộp thả tệp / chọn thao tác */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-200 border-2 ${
                isDragOver
                  ? "border-blue-600 bg-blue-50/80 shadow-xl scale-[1.01]"
                  : "border-dashed border-blue-300 hover:border-blue-500 bg-white shadow-xl shadow-blue-500/5"
              }`}
            >
              {/* Tiêu đề hộp */}
              <div className="text-center sm:text-left space-y-1.5 mb-6">
                <div className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bắt đầu ngay miễn phí</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Tải ảnh chân dung hoặc chụp trực tiếp
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh được xử lý 100% trên thiết bị của bạn.
                </p>
              </div>

              {/* Nhóm 2 nút hành động lớn */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={onOpenCamera}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-3 group active:scale-[0.99]"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span>Chụp trực tiếp bằng Camera</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-blue-200 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={onPickFile}
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-sm sm:text-base border-2 border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>Chọn ảnh từ điện thoại / máy tính</span>
                </button>
              </div>

              {/* Vạch phân cách & Nút Dùng thử nhanh */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onTrySample}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Dùng thử bằng ảnh mẫu 1-chạm →</span>
                </button>

                <span className="text-xs text-slate-400">hoặc Kéo thả file ảnh vào đây</span>
              </div>
            </div>

            {/* 3 Lợi thế bảo chứng uy tín */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Bảo mật 100%</div>
                  <div className="text-[11px] text-slate-500">Không lưu ảnh lên server</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Chuẩn ICAO 9303</div>
                  <div className="text-[11px] text-slate-500">Tỷ lệ mắt, cằm & đỉnh đầu</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Vỉ in 10x15cm (4R)</div>
                  <div className="text-[11px] text-slate-500">Chỉ 2.000đ tại mọi tiệm in</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
