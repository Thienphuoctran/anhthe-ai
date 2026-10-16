"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  Sun,
  UserCheck,
  Smile,
  Smartphone,
  ShieldCheck,
  Camera,
  Upload,
  Sparkles,
  Info,
} from "lucide-react";

export interface PhotoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCamera?: () => void;
  onPickFile?: () => void;
}

interface GuideRule {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  correct: string;
  wrong: string;
  tip: string;
}

const GUIDE_RULES: GuideRule[] = [
  {
    id: "lighting",
    icon: Sun,
    title: "1. Ánh Sáng & Chiếu Rọi",
    correct: "Đứng quay mặt về phía cửa sổ hoặc ánh đèn trần; ánh sáng đều hai bên gò má, không bị bóng đen hốc mắt.",
    wrong: "Đứng ngược sáng (lưng quay ra cửa sổ), hoặc đèn chiếu lệch một bên khiến nửa mặt bị tối đen.",
    tip: "Mẹo: Bật đèn phòng và đứng cách tường trắng/trơn khoảng 0.5m để tránh bóng đổ của đầu lên tường.",
  },
  {
    id: "hair_face",
    icon: UserCheck,
    title: "2. Khuôn Mặt & Kiểu Tóc",
    correct: "Vén tóc gọn gàng ra sau vành tai, lộ rõ trán và hai lông mày; tháo kính cận nếu bị lóa đèn flash.",
    wrong: "Tóc mái che lông mày/mắt, tóc phủ kín vành tai, đeo kính râm hoặc kính có gọng quá dày che mắt.",
    tip: "Quy chuẩn ICAO 9303 bắt buộc nhận diện rõ sinh trắc học 2 mắt, 2 tai và sống mũi.",
  },
  {
    id: "pose",
    icon: Smile,
    title: "3. Tư Thế & Biểu Cảm",
    correct: "Mắt nhìn thẳng ống kính, biểu cảm nghiêm túc lịch sự, ngậm miệng tự nhiên, thả lỏng 2 vai cân bằng.",
    wrong: "Cười hở răng, nháy mắt, nghiêng đầu sang một bên, ngửa cằm quá cao hoặc cúi gằm mặt xuống.",
    tip: "Tưởng tượng có sợi dây kéo thẳng đỉnh đầu lên trần nhà để cổ và lưng thẳng tự nhiên.",
  },
  {
    id: "distance",
    icon: Smartphone,
    title: "4. Khoảng Cách Chụp Điện Thoại",
    correct: "Giữ điện thoại ngang tầm mắt, cách mặt từ 1.0m – 1.5m (lấy từ đỉnh đầu xuống ngang ngực).",
    wrong: "Cầm máy chụp dí sát mặt (gây méo góc rộng mũi to), hoặc góc chụp từ dưới hất lên / từ trên dốc xuống.",
    tip: "Nên nhờ người thân cầm máy chụp hoặc đặt điện thoại lên giá đỡ/kệ ngang tầm mắt và bật hẹn giờ 3 giây.",
  },
];

export default function PhotoGuideModal({
  isOpen,
  onClose,
  onOpenCamera,
  onPickFile,
}: PhotoGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* ================= HEADER ================= */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                <span>Cẩm Nang Chụp Ảnh Thẻ Chuẩn 10/10</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Quy chuẩn Cổng Dịch Vụ Công Quốc Gia & Hộ chiếu ICAO Doc 9303
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= NỘI DUNG CUỘN ================= */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Hộp tóm tắt tiêu chuẩn nhanh */}
          <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">
                Quy tắc vàng 3 giây để ảnh nộp 1 lần là duyệt ngay:
              </span>
              <p className="text-blue-800 leading-relaxed">
                Đứng dựa tường bất kỳ • Vén gọn tóc lộ 2 tai và trán • Giữ điện thoại ngang tầm mắt cách 1.2m và mắt nhìn thẳng vào ống kính.
              </p>
            </div>
          </div>

          {/* Danh sách 4 Tiêu chuẩn trực quan ĐÚNG vs SAI */}
          <div className="space-y-3.5">
            {GUIDE_RULES.map((rule) => {
              const IconComp = rule.icon;
              return (
                <div
                  key={rule.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {rule.title}
                    </h3>
                  </div>

                  {/* Cặp so sánh ĐÚNG vs SAI */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Cột ĐÚNG */}
                    <div className="rounded-xl p-3 bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider mb-0.5">
                          ✓ NÊN LÀM (CHUẨN)
                        </div>
                        <div className="leading-relaxed">{rule.correct}</div>
                      </div>
                    </div>

                    {/* Cột SAI */}
                    <div className="rounded-xl p-3 bg-red-50/80 border border-red-200 text-red-950 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-red-700 uppercase text-[10px] tracking-wider mb-0.5">
                          ✗ KHÔNG NÊN (DỄ BỊ LOẠI)
                        </div>
                        <div className="leading-relaxed">{rule.wrong}</div>
                      </div>
                    </div>
                  </div>

                  {/* Lời khuyên phụ */}
                  <div className="text-[11px] text-slate-500 italic pl-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{rule.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= FOOTER HÀNH ĐỘNG ================= */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            AI sẽ tự động tách nền và làm đẹp da ngay sau khi bạn chụp xong.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onPickFile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPickFile();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Chọn ảnh từ máy</span>
              </button>
            )}

            {onOpenCamera && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCamera();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>Mở Camera Chụp Ngay →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
