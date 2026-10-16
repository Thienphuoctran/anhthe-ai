"use client";

import React from "react";
import { CheckCircle2, Zap, Image as ImageIcon, PiggyBank } from "lucide-react";

interface MetricCardProps {
  number: string;
  unit?: string;
  label: string;
  description: string;
  highlightText: string;
  icon: React.ReactNode;
  iconBg: string;
}

const metrics: MetricCardProps[] = [
  {
    number: "99.8%",
    label: "Tỷ lệ hồ sơ được duyệt",
    description: "Được công nhận tại Cổng Dịch Vụ Công, Hộ chiếu điện tử, CCCD và Visa 190+ quốc gia.",
    highlightText: "Chuẩn ICAO Doc 9303",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-50 border-emerald-200/60",
  },
  {
    number: "3 Giây",
    label: "Tách nền & Căn chỉnh AI",
    description: "Công nghệ WebAssembly AI xử lý trực tiếp trên thiết bị của bạn, bảo mật tuyệt đối 100%.",
    highlightText: "Zero-Latency On-Device",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    iconBg: "bg-amber-50 border-amber-200/60",
  },
  {
    number: "300",
    unit: "DPI",
    label: "Độ phân giải Lab in ấn",
    description: "Mật độ điểm ảnh siêu sắc nét, đảm bảo hạt in mịn màng, không bị vỡ ảnh khi in trên giấy bóng 4R.",
    highlightText: "Chuẩn in Lab Studio",
    icon: <ImageIcon className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-50 border-blue-200/60",
  },
  {
    number: "2.000đ",
    label: "Chi phí in cả vỉ 8 ảnh",
    description: "Mang file vỉ 10x15cm ra bất kỳ tiệm in/photocopy nào cũng in được ngay với giá rẻ không tưởng.",
    highlightText: "Tiết kiệm 95% chi phí",
    icon: <PiggyBank className="w-5 h-5 text-indigo-600" />,
    iconBg: "bg-indigo-50 border-indigo-200/60",
  },
];

export default function TrustMetricsStrip() {
  return (
    <section className="py-8 sm:py-12 bg-white border-y border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-blue-300 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 group flex flex-col justify-between"
            >
              <div>
                {/* Header card: Icon + Badge nổi bật */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-md bg-white border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600 transition">
                    {item.highlightText}
                  </span>
                </div>

                {/* Số liệu lớn ấn tượng */}
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {item.number}
                  </span>
                  {item.unit && (
                    <span className="text-base font-bold text-blue-600">{item.unit}</span>
                  )}
                </div>

                {/* Tiêu đề ngắn */}
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {item.label}
                </div>

                {/* Mô tả chi tiết */}
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Đường kẻ chân card phản chiếu ánh sáng */}
              <div className="w-full h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-500 rounded-full mt-4 transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
