"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Crown,
  Users,
  Zap,
  QrCode,
  Image as ImageIcon,
} from "lucide-react";
import { UserPlan } from "@/lib/subscriptionStore";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedPlan: UserPlan) => void;
  initialSelectedPlanId?: "single" | "family" | "pro";
}

interface PricingTier {
  id: "single" | "family" | "pro";
  name: string;
  priceLabel: string;
  amount: number;
  unitLabel: string;
  oldPrice: string;
  badge?: string;
  popular?: boolean;
  icon: React.ReactNode;
  description: string;
  features: { text: string; highlight?: boolean }[];
  buttonText: string;
  planType: "credits" | "vip";
  creditsToAdd?: number;
  vipDays?: number;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "single",
    name: "Gói Lẻ 1 Ảnh",
    priceLabel: "15.000đ",
    amount: 15000,
    unitLabel: "/ 1 lượt tải",
    oldPrice: "Ra tiệm: 60.000đ",
    icon: <Zap className="w-5 h-5 text-blue-600" />,
    description: "Phù hợp người cần làm gấp 1 bộ hồ sơ cá nhân.",
    features: [
      { text: "Tải ngay 1 ảnh gốc Ultra HD (300 DPI)", highlight: true },
      { text: "Tặng kèm 1 file vỉ in 10x15cm (8 ảnh 3x4 hoặc 4 ảnh 4x6)" },
      { text: "Xóa hoàn toàn logo chìm (Watermark)" },
      { text: "Đầy đủ nền Xanh Dịch vụ công & Trắng ICAO" },
    ],
    buttonText: "Chọn Gói 1 Ảnh (15K)",
    planType: "credits",
    creditsToAdd: 1,
  },
  {
    id: "family",
    name: "Gói Gia Đình - 10 Ảnh",
    priceLabel: "49.000đ",
    amount: 49000,
    unitLabel: "/ 10 lượt tải",
    oldPrice: "Ra tiệm: 600.000đ",
    badge: "TIẾT KIỆM NHẤT - CHỈ 4.9K/ẢNH",
    popular: true,
    icon: <Users className="w-5 h-5 text-emerald-600" />,
    description: "Dùng cho cả gia đình, đổi nhiều cỡ ảnh và phông nền khác nhau.",
    features: [
      { text: "10 lượt tải ảnh Ultra HD + 10 Vỉ in 10x15cm", highlight: true },
      { text: "Lượt dùng vĩnh viễn không bao giờ hết hạn", highlight: true },
      { text: "Mở khóa làm đẹp Sáng rõ chuẩn hồ sơ" },
      { text: "Tự động khử sạch viền bẩn quanh cổ & tai" },
      { text: "Xóa hoàn toàn logo chìm (Watermark)" },
    ],
    buttonText: "Chọn Gói Gia Đình (49K)",
    planType: "credits",
    creditsToAdd: 10,
  },
  {
    id: "pro",
    name: "Gói Pro Studio",
    priceLabel: "79.000đ",
    amount: 79000,
    unitLabel: "/ 30 ngày",
    oldPrice: "Giá gốc: 199.000đ",
    badge: "KHÔNG GIỚI HẠN",
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    description: "Dành cho văn phòng, tiệm in ảnh, nhân sự hoặc làm hồ sơ số lượng lớn.",
    features: [
      { text: "Tải KHÔNG GIỚI HẠN ảnh đơn & vỉ in 10x15cm", highlight: true },
      { text: "Mở khóa AI Làm đẹp Rạng rỡ (Mịn da & Sáng hồng)", highlight: true },
      { text: "Công nghệ Đánh sáng Studio & Giảm bóng dầu" },
      { text: "Đầy đủ kích thước 3x4, 4x6 & Visa Quốc tế (Mỹ, Nhật, Hàn)" },
      { text: "Ưu tiên tốc độ xử lý AI cao nhất" },
    ],
    buttonText: "Kích Hoạt Pro 30 Ngày (79K)",
    planType: "vip",
    vipDays: 30,
  },
];

// Thông tin tài khoản ngân hàng chính chủ từ mã QR của chủ sở hữu
const BANK_CONFIG = {
  bankId: "TCB",
  bankName: "Techcombank (Ngân hàng Kỹ thương VN)",
  accountNo: "19036796247016",
  accountNoFormatted: "1903 6796 2470 16",
  accountName: "TRAN QUOC THIEN PHUOC",
  staticQrPath: "/qr-techcombank.png",
};

export default function PricingModal({
  isOpen,
  onClose,
  onSuccess,
  initialSelectedPlanId,
}: PricingModalProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [orderCode, setOrderCode] = useState<string>("ANHTHE 6868");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [useStaticQrImage, setUseStaticQrImage] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const {
    user,
    addCredits: addCloudCredits,
    activateVip: activateCloudVip,
  } = useAuth();

  // Khởi tạo mã đơn hàng ngẫu nhiên mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setOrderCode(`ANHTHE ${randomNum}`);
      setIsVerifying(false);
      setIsSuccess(false);
      setUseStaticQrImage(false);

      if (initialSelectedPlanId) {
        const found = PRICING_TIERS.find((t) => t.id === initialSelectedPlanId);
        setSelectedTier(found || null);
      } else {
        setSelectedTier(null);
      }
    }
  }, [isOpen, initialSelectedPlanId]);

  if (!isOpen) return null;

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback nếu clipboard bị chặn
    }
  };

  const triggerFireworks = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedTier || isVerifying) return;
    setIsVerifying(true);

    setTimeout(async () => {
      let updatedPlan: UserPlan;
      if (selectedTier.planType === "vip") {
        updatedPlan = await activateCloudVip(selectedTier.vipDays || 30);
      } else {
        updatedPlan = await addCloudCredits(selectedTier.creditsToAdd || 1);
      }

      setIsVerifying(false);
      setIsSuccess(true);
      triggerFireworks();

      setTimeout(() => {
        onSuccess?.(updatedPlan);
        onClose();
      }, 1100);
    }, 2000);
  };

  const vietQrUrl = selectedTier
    ? `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${selectedTier.amount}&addInfo=${encodeURIComponent(
        orderCode
      )}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50">
          <div className="flex items-center gap-2.5">
            {selectedTier && !isSuccess && (
              <button
                type="button"
                onClick={() => setSelectedTier(null)}
                disabled={isVerifying}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
                title="Quay lại chọn gói"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                {selectedTier
                  ? `Thanh Toán VietQR — ${selectedTier.name}`
                  : "Mở Khóa Tải Ảnh Thẻ Ultra HD (Không Logo Chìm)"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {selectedTier
                  ? "Quét mã QR bằng bất kỳ ứng dụng Ngân hàng hoặc MoMo/ZaloPay nào để kích hoạt tự động"
                  : "Tiết kiệm 90% so với ra tiệm chụp (60.000đ/lần) — Nhận ngay file ảnh gốc + vỉ in 10x15cm"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {!selectedTier ? (
            /* BƯỚC 1: BẢNG CHỌN GÓI CƯỚC */
            <div className="space-y-6">
              {/* Thanh so sánh chi phí */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs sm:text-sm text-blue-950">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    Ra tiệm chụp: <strong className="line-through text-slate-500">60.000đ - 80.000đ</strong> & mất 30 phút đi lại.
                  </span>
                </div>
                <div className="font-semibold text-blue-700">
                  Tại AI Photo Studio: Chỉ từ 4.900đ/ảnh — Có ngay sau 5 giây!
                </div>
              </div>

              {/* 3 cột gói cước */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
                {PRICING_TIERS.map((tier) => {
                  const isPopular = tier.popular;
                  return (
                    <div
                      key={tier.id}
                      className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all ${
                        isPopular
                          ? "border-2 border-blue-600 bg-gradient-to-b from-blue-50/50 via-white to-white shadow-lg md:-translate-y-1"
                          : "border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      {tier.badge && (
                        <div
                          className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase shadow-sm ${
                            isPopular
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {tier.badge}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="inline-flex items-center gap-2 font-bold text-base text-slate-900">
                            {tier.icon}
                            {tier.name}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 min-h-[32px]">
                          {tier.description}
                        </p>

                        <div className="mt-4 pb-4 border-b border-slate-100">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-slate-900">
                              {tier.priceLabel}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {tier.unitLabel}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 line-through mt-0.5">
                            {tier.oldPrice}
                          </div>
                        </div>

                        <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
                          {tier.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <Check
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  feat.highlight ? "text-blue-600 stroke-[2.5]" : "text-emerald-600"
                                }`}
                              />
                              <span
                                className={
                                  feat.highlight
                                    ? "font-semibold text-slate-900"
                                    : "text-slate-600"
                                }
                              >
                                {feat.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`mt-6 w-full py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                          isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                            : tier.id === "pro"
                            ? "bg-slate-900 hover:bg-slate-800 text-white"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {tier.buttonText}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* BƯỚC 2: QUÉT MÃ VIETQR */
            <div className="space-y-4">
              {!user && (
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>
                      <strong>Mẹo:</strong> Đăng nhập Google để lượt tải được lưu vĩnh viễn trên Supabase Cloud!
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 transition shrink-0 shadow-2xs"
                  >
                    Đăng nhập tài khoản
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Cột Trái: Ảnh QR */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between w-full mb-2 px-1">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    Mã VietQR Napas 247
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseStaticQrImage(!useStaticQrImage)}
                    className="text-[11px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {useStaticQrImage ? "Dùng QR tự điền tiền" : "Xem ảnh QR gốc"}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200/80">
                  <img
                    src={useStaticQrImage ? BANK_CONFIG.staticQrPath : vietQrUrl}
                    alt="Mã thanh toán VietQR Techcombank"
                    onError={() => setUseStaticQrImage(true)}
                    className="w-60 h-auto sm:w-64 object-contain mx-auto rounded-lg"
                  />
                </div>

                <p className="text-[11px] text-center text-slate-500 mt-2.5">
                  Mở App Ngân hàng bất kỳ để quét mã — Tự động điền đúng số tiền & nội dung
                </p>
              </div>

              {/* Cột Phải: Thông tin chuyển khoản & Nút xác nhận */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-blue-800">
                      Gói đang chọn:
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-900">
                      {selectedTier.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Tổng thanh toán</div>
                    <div className="text-2xl font-extrabold text-blue-600">
                      {selectedTier.priceLabel}
                    </div>
                  </div>
                </div>

                {/* Chi tiết tài khoản */}
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white text-sm">
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-xs sm:text-sm">Ngân hàng</span>
                    <span className="font-bold text-slate-900 text-right">
                      {BANK_CONFIG.bankName}
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-xs sm:text-sm">Chủ tài khoản</span>
                    <span className="font-bold text-slate-900">
                      {BANK_CONFIG.accountName}
                    </span>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-slate-500 text-xs">Số tài khoản</div>
                      <div className="font-mono font-bold text-slate-900 text-sm sm:text-base">
                        {BANK_CONFIG.accountNoFormatted}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(BANK_CONFIG.accountNo, "account")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition"
                    >
                      {copiedField === "account" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-slate-500 text-xs">Số tiền chuyển khoản</div>
                      <div className="font-mono font-extrabold text-blue-600 text-base">
                        {selectedTier.amount.toLocaleString("vi-VN")} đ
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(String(selectedTier.amount), "amount")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition"
                    >
                      {copiedField === "amount" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 flex items-center justify-between gap-2 bg-amber-50/60">
                    <div>
                      <div className="text-amber-800 text-xs font-medium">
                        Nội dung chuyển khoản
                      </div>
                      <div className="font-mono font-extrabold text-amber-900 text-base">
                        {orderCode}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(orderCode, "content")}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center gap-1.5 transition"
                    >
                      {copiedField === "content" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-emerald-800">Đã chép nhanh</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép nhanh</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Nút xác nhận đã chuyển khoản */}
                {isSuccess ? (
                  <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Kích hoạt thành công! Đang mở khóa tải ảnh...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isVerifying}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-75 text-white font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang kiểm tra giao dịch (Tự động mở khóa sau 2s)...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Xác nhận đã chuyển khoản (Tự động mở khóa sau 2s)</span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedTier(null)}
                    disabled={isVerifying}
                    className="hover:text-slate-800 underline"
                  >
                    ← Đổi sang gói khác
                  </button>
                  <span>Bảo mật thanh toán 100% qua VietQR Napas247</span>
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal đăng nhập tài khoản */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
