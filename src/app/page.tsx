"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef } from "react";
import {
  Camera,
  Sparkles,
  Crown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  LogOut,
} from "lucide-react";
import StudioWorkspace from "@/components/StudioWorkspace";
import PricingModal from "@/components/PricingModal";
import CameraCaptureModal from "@/components/CameraCaptureModal";
import PhotoGuideModal from "@/components/PhotoGuideModal";
import HeroInteractiveSection from "@/components/HeroInteractiveSection";
import TrustMetricsStrip from "@/components/TrustMetricsStrip";
import PhotoSpecsShowcase from "@/components/PhotoSpecsShowcase";
import ComparisonAndFaqSection from "@/components/ComparisonAndFaqSection";
import { removePhotoBackground } from "@/lib/backgroundRemover";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

/**
 * Tạo ảnh chân dung mẫu đã tách nền trong suốt (SVG Data URL chất lượng cao)
 * giúp người dùng bấm "Dùng thử bằng ảnh mẫu" là trải nghiệm được ngay lập tức
 * tính năng đổi phông nền, thay áo vest và làm đẹp 1 chạm.
 */
function createSamplePortraitDataUrl(includeRoomBg = false): string {
  const roomBgSvg = includeRoomBg
    ? `
    <!-- Phông nền tường phòng tại nhà trước khi tách nền -->
    <rect width="600" height="760" fill="#cbd5e1"/>
    <polygon points="0,0 165,0 110,760 0,760" fill="#334155" opacity="0.55"/>
    <line x1="165" y1="0" x2="110" y2="760" stroke="#1e293b" stroke-width="3" opacity="0.4"/>
    `
    : "";

  const sampleSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
    <defs>
      <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fde2c8"/>
        <stop offset="55%" stop-color="#f7cba4"/>
        <stop offset="100%" stop-color="#eab68d"/>
      </linearGradient>
      <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="casualShirt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <filter id="headShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
      </filter>
    </defs>

    ${roomBgSvg}

    <!-- Phần vai và áo thun mặc định ban đầu -->
    <path d="M 45,760 L 45,565 Q 155,465 250,468 L 350,468 Q 445,465 555,565 L 555,760 Z" fill="url(#casualShirt)"/>
    
    <!-- Cổ -->
    <path d="M 244,375 L 356,375 L 366,515 Q 300,555 234,515 Z" fill="url(#skinGrad)"/>
    <path d="M 248,405 Q 300,450 352,405 L 356,445 Q 300,485 244,445 Z" fill="#d99f72" opacity="0.35"/>

    <!-- Tai trái & phải -->
    <ellipse cx="174" cy="285" rx="22" ry="42" fill="url(#skinGrad)"/>
    <ellipse cx="426" cy="285" rx="22" ry="42" fill="url(#skinGrad)"/>

    <!-- Khuôn mặt chuẩn sinh trắc học -->
    <path d="M 182,215 Q 182,115 300,115 Q 418,115 418,215 L 414,295 Q 408,425 300,435 Q 192,425 186,295 Z"
          fill="url(#skinGrad)" filter="url(#headShadow)"/>

    <!-- Má hồng nhẹ -->
    <ellipse cx="230" cy="312" rx="26" ry="14" fill="#f43f5e" opacity="0.12"/>
    <ellipse cx="370" cy="312" rx="26" ry="14" fill="#f43f5e" opacity="0.12"/>

    <!-- Lông mày -->
    <path d="M 218,236 Q 248,224 274,234" fill="none" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
    <path d="M 326,234 Q 352,224 382,236" fill="none" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>

    <!-- Mắt nhìn thẳng chuẩn ICAO -->
    <ellipse cx="248" cy="264" rx="18" ry="11" fill="#ffffff"/>
    <circle cx="248" cy="264" r="8.5" fill="#1e293b"/>
    <circle cx="245" cy="261" r="3" fill="#ffffff"/>

    <ellipse cx="352" cy="264" rx="18" ry="11" fill="#ffffff"/>
    <circle cx="352" cy="264" r="8.5" fill="#1e293b"/>
    <circle cx="349" cy="261" r="3" fill="#ffffff"/>

    <!-- Sống mũi -->
    <path d="M 300,262 L 296,318 Q 300,326 310,322" fill="none" stroke="#c88a5e" stroke-width="4" stroke-linecap="round"/>

    <!-- Miệng cười mỉm lịch sự -->
    <path d="M 266,360 Q 300,378 334,360" fill="none" stroke="#be123c" stroke-width="6" stroke-linecap="round"/>
    <path d="M 274,363 Q 300,374 326,363" fill="none" stroke="#fda4af" stroke-width="3" stroke-linecap="round"/>

    <!-- Mái tóc gọn gàng không che trán/tai -->
    <path d="M 176,245 Q 165,140 225,95 Q 300,62 380,98 Q 435,135 424,245 Q 415,175 375,145 Q 310,165 235,148 Q 190,175 176,245 Z"
          fill="url(#hairGrad)"/>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;
}

export default function HomePage() {
  const { user, userPlan, signOut, refreshProfile } = useAuth();
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quản lý Modal bảng giá
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [initialPlanId, setInitialPlanId] = useState<
    "single" | "family" | "pro" | undefined
  >(undefined);

  // Quản lý Modal Camera & Cẩm nang chụp ảnh thẻ & Đăng nhập
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenPricing = (planId?: "single" | "family" | "pro") => {
    setInitialPlanId(planId);
    setIsPricingOpen(true);
  };

  // Xử lý khi người dùng chọn file ảnh từ điện thoại / máy tính
  const handleFileSelected = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).");
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setProgress(8);

    const rawPreviewUrl = URL.createObjectURL(file);
    setOriginalUrl(rawPreviewUrl);

    try {
      const resultObjectUrl = await removePhotoBackground(file, (pct) => {
        setProgress(pct);
      });
      setCutoutUrl(resultObjectUrl);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Không thể xử lý bức ảnh này. Bạn hãy thử lại hoặc bấm 'Dùng thử bằng ảnh mẫu'."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    e.target.value = "";
  };

  // Nút Dùng thử bằng ảnh mẫu ngay lập tức
  const handleTrySamplePhoto = () => {
    setErrorMsg(null);
    setOriginalUrl(createSamplePortraitDataUrl(true));
    setCutoutUrl(createSamplePortraitDataUrl(false));
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        style={{ display: "none" }}
      />

      {/* ================= HEADER GỌN GÀNG ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo ẢnhThẻ.AI */}
          <button
            type="button"
            onClick={() => {
              setCutoutUrl(null);
              setOriginalUrl(null);
            }}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                ẢnhThẻ<span className="text-blue-600">.AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Chuẩn Dịch Vụ Công
              </span>
            </div>
          </button>

          {/* Huy hiệu số lượt tải & Nút Bảng giá ưu đãi & Google Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {userPlan.isVip ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Tài khoản VIP</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Lượt tải: {userPlan.credits}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleOpenPricing()}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 hidden sm:inline" />
              <span>Nạp lượt</span>
            </button>

            {/* Trạng thái tài khoản Google Auth Supabase */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5 bg-slate-100/90 px-2 py-1 rounded-full border border-slate-200 max-w-[140px] sm:max-w-[180px]">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.email || "User"}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(user.email?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Đăng xuất khỏi Supabase"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex items-center gap-1.5 sm:gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Đăng nhập</span>
                <span className="sm:hidden">Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================= NỘI DUNG CHÍNH ================= */}
      <main className="flex-1 flex flex-col">
        {/* Trạng thái đang tách nền AI */}
        {isProcessing ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  AI Đang Tự Động Tách Nền & Căn Chỉnh...
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Xử lý 100% trực tiếp trên trình duyệt của bạn — An toàn & Bảo mật tuyệt đối
                </p>
              </div>

              {/* Thanh tiến trình */}
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs font-bold text-blue-600">
                  Hoàn thành {progress}%
                </div>
              </div>
            </div>
          </div>
        ) : cutoutUrl ? (
          /* MÀN HÌNH STUDIO WORKSPACE KHI ĐÃ CÓ ẢNH */
          <StudioWorkspace
            cutoutImageUrl={cutoutUrl}
            originalImageUrl={originalUrl || cutoutUrl}
            userPlan={userPlan}
            onOpenPricing={handleOpenPricing}
            onChangePhoto={triggerFilePicker}
            onOpenCamera={() => setIsCameraOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        ) : (
          /* MÀN HÌNH BẮT ĐẦU (KHI CHƯA CHỌN ẢNH) */
          <div className="w-full">
            {/* Thông báo lỗi nếu có */}
            {errorMsg && (
              <div className="max-w-2xl mx-auto mt-4 px-4">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <div className="font-bold">Không thể xử lý ảnh</div>
                    <div>{errorMsg}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 1. HERO SECTION TƯƠNG TÁC CAO: SLIDER TRƯỚC/SAU + ACTION CARD */}
            <HeroInteractiveSection
              onPickFile={triggerFilePicker}
              onOpenCamera={() => setIsCameraOpen(true)}
              onTrySample={handleTrySamplePhoto}
              onOpenGuide={() => setIsGuideOpen(true)}
              onDropFile={handleFileSelected}
            />

            {/* 2. CHỈ SỐ UY TÍN & BẢO CHỨNG TIÊU CHUẨN */}
            <TrustMetricsStrip />

            {/* 3. SHOWCASE 5 KÍCH THƯỚC CHUẨN & MÔ PHỎNG VỈ IN 10X15CM (4R) */}
            <PhotoSpecsShowcase
              onSelectSpecAction={triggerFilePicker}
            />

            {/* 4. SO SÁNH GIÁ TRỊ VỚI TIỆM ẢNH & FAQ ACCORDION */}
            <ComparisonAndFaqSection
              onStartNow={triggerFilePicker}
              onOpenCamera={() => setIsCameraOpen(true)}
            />
          </div>
        )}
      </main>

      {/* ================= FOOTER CHUYÊN NGHIỆP & BẢO CHỨNG PHÁP LÝ ================= */}
      <footer className="border-t border-slate-200 bg-white pt-10 pb-8 px-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Cột 1: Thông tin thương hiệu */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-blue-200">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900">
                  ẢnhThẻ<span className="text-blue-600">.AI</span> Studio
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Client-Side Privacy
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                Nền tảng ứng dụng AI WebAssembly hỗ trợ người dân tự tạo ảnh thẻ chuẩn sinh trắc học tại nhà, phục vụ làm Hộ chiếu online, Căn cước công dân và Visa quốc tế nhanh chóng, tiết kiệm 95% chi phí.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Tuân thủ ICAO 9303</span>
                <span>•</span>
                <span>QĐ 225/QĐ-BCA</span>
                <span>•</span>
                <span>ISO/IEC 19794-5</span>
              </div>
            </div>

            {/* Cột 2: Tiện ích & Hỗ trợ */}
            <div className="md:col-span-3 space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Tiện ích & Hướng dẫn
              </div>
              <ul className="space-y-1.5">
                <li>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="hover:text-blue-600 transition"
                  >
                    💡 Cẩm nang chụp ảnh thẻ 10/10
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="hover:text-blue-600 transition"
                  >
                    📸 Chụp bằng Camera có thước căn
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenPricing()}
                    className="hover:text-blue-600 transition"
                  >
                    💳 Bảng giá & Lượt tải HD
                  </button>
                </li>
              </ul>
            </div>

            {/* Cột 3: Cam kết bảo mật */}
            <div className="md:col-span-3 space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Cam kết An ninh
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero-Server-Retention</span>
                </div>
                <p className="text-[11px]">
                  Ảnh chân dung của bạn được xử lý trực tiếp trên trình duyệt, không bao giờ gửi về máy chủ.
                </p>
              </div>
            </div>
          </div>

          {/* Dòng bản quyền dưới cùng */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
            <div>© {new Date().getFullYear()} ẢnhThẻ.AI — Chuẩn Dịch Vụ Công & Quốc Tế. Mọi quyền được bảo lưu.</div>
            <div className="flex items-center gap-3">
              <span>Độ phân giải in Lab: 300 DPI</span>
              <span>•</span>
              <span>Khổ in tiêu chuẩn: 10x15cm (4R)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MODAL BẢNG GIÁ & THANH TOÁN VIETQR ================= */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        initialSelectedPlanId={initialPlanId}
        onSuccess={() => refreshProfile()}
      />

      {/* ================= MODAL CHỤP ẢNH BẰNG CAMERA TRỰC TIẾP ================= */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          handleFileSelected(file);
        }}
      />

      {/* ================= MODAL CẨM NANG CHỤP ẢNH THẺ CHUẨN ================= */}
      <PhotoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenCamera={() => setIsCameraOpen(true)}
        onPickFile={triggerFilePicker}
      />

      {/* ================= MODAL ĐĂNG NHẬP CLOUD DB ================= */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => refreshProfile()}
      />
    </div>
  );
}
