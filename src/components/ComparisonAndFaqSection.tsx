"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Camera,
  Upload,
  ArrowRight,
} from "lucide-react";

interface ComparisonAndFaqSectionProps {
  onStartNow: () => void;
  onOpenCamera: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "Ảnh tạo từ website có nộp được Cổng Dịch Vụ Công Quốc Gia và làm Hộ chiếu không?",
    a: "Chắc chắn được 100%! ẢnhThẻ.AI tuân thủ chính xác Quyết định số 225/QĐ-BCA của Bộ Công An và tiêu chuẩn sinh trắc học quốc tế ICAO Doc 9303. Hệ thống tự động căn chỉnh khoảng cách từ cằm đến đỉnh đầu chiếm đúng 70% - 80% chiều cao ảnh, 2 mắt nhìn thẳng, phông trắng/xanh đồng nhất không bóng đổ.",
  },
  {
    q: "Ảnh của tôi có bị tải lên máy chủ hoặc bị người khác xem không?",
    a: "Hoàn toàn KHÔNG! ẢnhThẻ.AI xây dựng theo nguyên tắc bảo mật tối thượng 'Zero-Data-Retention'. Quá trình bóc tách từng sợi tóc và xử lý ánh sáng chạy trực tiếp bằng WebAssembly trên CPU/GPU của chính thiết bị bạn đang dùng. Ảnh không bao giờ bị gửi lên máy chủ của chúng tôi hay bất kỳ bên thứ ba nào.",
  },
  {
    q: "Làm sao để in ảnh ra giấy với chi phí rẻ nhất (chỉ 2.000đ)?",
    a: "Sau khi tạo ảnh thẻ, hãy chọn chức năng 'Dàn trang in 10x15cm (4R)'. Hệ thống sẽ tự động xếp 4 ảnh 4x6 hoặc 8 ảnh 3x4 có sẵn vạch cắt xén chữ thập. Bạn chỉ cần gửi file này qua Zalo/USB cho tiệm in ảnh hoặc photocopy gần nhà, yêu cầu in khổ 10x15cm giấy bóng (Glossy Photo Paper) với giá chỉ từ 2.000đ - 3.000đ/tờ.",
  },
  {
    q: "Tôi có thể tự chụp ảnh bằng camera điện thoại tại nhà được không?",
    a: "Hoàn toàn được! Bạn hãy bấm nút 'Chụp trực tiếp bằng Camera', hệ thống sẽ bật khung căn chuẩn sinh trắc học thời gian thực (định vị đỉnh đầu, trục mắt, cằm) kèm tính năng Đếm ngược 3 giây để bạn giữ thẳng lưng và thả lỏng nét mặt tự nhiên.",
  },
  {
    q: "Tôi đang mặc áo thun ở nhà, có ghép được áo vest hay sơ mi công sở không?",
    a: "Có sẵn trong Tab 'Trang phục AI'! Bạn có thể 1-chạm ghép ngay các mẫu áo sơ mi trắng cổ bẻ, áo vest đen/xanh navy cao cấp cho cả Nam và Nữ, tự động căn khớp với cổ và vai vô cùng chân thực và lịch sự.",
  },
];

export default function ComparisonAndFaqSection({
  onStartNow,
  onOpenCamera,
}: ComparisonAndFaqSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* ================= BẢNG SO SÁNH GIÁ TRỊ ================= */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Tại sao hàng triệu người chọn ẢnhThẻ.AI
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              So Sánh Với Tiệm Chụp Ảnh Thẻ Truyền Thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tiết kiệm thời gian, tiền bạc và trao toàn quyền chủ động bức ảnh đẹp nhất cho bạn.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-md">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-700 w-1/3">Tiêu chí so sánh</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400 w-1/3">
                    Tiệm ảnh truyền thống
                  </th>
                  <th className="p-4 sm:p-5 font-extrabold text-blue-700 bg-blue-50/50 w-1/3 border-l border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>ẢnhThẻ.AI Studio</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Chi phí */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Chi phí làm ảnh</td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    <span className="text-red-600 font-bold">60.000đ - 80.000đ</span> (chỉ được 4 ảnh)
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/30 border-l border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Miễn phí xem trước / In vỉ 8 ảnh chỉ 2.000đ</span>
                    </div>
                  </td>
                </tr>

                {/* 2. Thời gian hoàn thành */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Thời gian nhận ảnh</td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Chờ 1 - 2 tiếng hoặc hôm sau mới có
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-blue-700 bg-blue-50/30 border-l border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Lấy ngay trong 30 giây tại nhà</span>
                    </div>
                  </td>
                </tr>

                {/* 3. Bảo mật thông tin */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Bảo mật ảnh khuôn mặt</td>
                  <td className="p-4 sm:p-5 text-slate-600 flex items-start gap-1.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>Lưu trên máy tính tiệm ảnh, dễ rò rỉ dữ liệu</span>
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/30 border-l border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Client-side WebAssembly, không lưu server</span>
                    </div>
                  </td>
                </tr>

                {/* 4. Trang phục & Làm đẹp */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Trang phục & Da mặt</td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Áo vest tiệm dùng chung, da cà búp bê nhựa mất vân
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-blue-700 bg-blue-50/30 border-l border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ghép vest AI sạch sẽ, giữ nguyên vân da chân thực</span>
                    </div>
                  </td>
                </tr>

                {/* 5. Vỉ in ấn Lab */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Xuất file in ấn</td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    Muốn xin file mềm phải trả thêm 20k - 30k
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/30 border-l border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Tải trọn bộ file HD + Vỉ in 10x15cm (4R) 300 DPI</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= CÂU HỎI THƯỜNG GẶP (FAQ) ================= */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Giải Đáp Thắc Mắc</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Những Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= BANNER KÊU GỌI HÀNH ĐỘNG CUỐI TRANG ================= */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cam kết chuẩn 100% Cổng Dịch Vụ Công</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Sẵn Sàng Tạo Ảnh Thẻ Chuẩn Quốc Tế Ngay Bây Giờ?
            </h2>

            <p className="text-xs sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
              Không cần ra tiệm, không lo lộ ảnh cá nhân. Chỉ mất 30 giây để có tấm ảnh thẻ đẹp nhất theo ý bạn.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenCamera}
              className="w-full sm:w-auto min-w-[210px] py-3.5 px-6 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm sm:text-base shadow-lg transition flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Chụp ảnh bằng Camera</span>
            </button>

            <button
              type="button"
              onClick={onStartNow}
              className="w-full sm:w-auto min-w-[200px] py-3.5 px-6 rounded-2xl bg-blue-800/80 hover:bg-blue-900 text-white font-extrabold text-sm sm:text-base border border-blue-400/40 shadow-sm transition flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5 text-blue-200" />
              <span>Tải ảnh từ máy tính</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
