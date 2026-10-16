"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Sparkles,
  Check,
  Printer,
  User,
  Sliders,
  FileCheck2,
  Upload,
  Lock,
  Crown,
  ChevronRight,
  Eye,
  Grid,
  Move,
  SplitSquareVertical,
  ShieldCheck,
  Camera,
  Wand2,
  Loader2,
  Sun,
  Heart,
  Minus,
  Plus,
} from "lucide-react";
import {
  PhotoSizeKey,
  BeautyPreset,
  PhotoRenderConfig,
  PHOTO_DIMENSIONS,
  renderSinglePhoto,
  generatePrintSheet,
  loadImage,
  getBiometricStandardPreset,
} from "@/lib/canvasUtils";
import { UserPlan } from "@/lib/subscriptionStore";
import { useAuth } from "@/context/AuthContext";
import { removePhotoBackground } from "@/lib/backgroundRemover";
import PrintPreviewModal from "@/components/PrintPreviewModal";

export interface StudioWorkspaceProps {
  cutoutImageUrl: string;
  originalImageUrl?: string;
  userPlan: UserPlan;
  onOpenPricing: (initialPlanId?: "single" | "family" | "pro") => void;
  onChangePhoto: () => void;
  onOpenCamera?: () => void;
  onOpenGuide?: () => void;
}

type ActiveTab = "size_bg" | "beauty_cloth" | "export";
type PreviewMode = "single" | "sheet";

const SIZE_CARDS: {
  id: PhotoSizeKey;
  title: string;
  badge: string;
  purpose: string;
  pixelText: string;
}[] = [
  {
    id: "3x4",
    title: "3x4 cm — Chuẩn Học sinh, Sinh viên, Xin việc",
    badge: "8 ảnh / vỉ 10x15",
    purpose:
      "Sơ yếu lý lịch, Hồ sơ xin việc, Thẻ học sinh - sinh viên, Thẻ thư viện",
    pixelText: "354 x 472 px (300 DPI)",
  },
  {
    id: "4x6",
    title: "4x6 cm — Chuẩn CCCD, Hộ chiếu, Dịch vụ công",
    badge: "4 ảnh / vỉ 10x15",
    purpose:
      "Hộ chiếu (Passport VN), Cổng Dịch vụ công Quốc gia, Bằng lái xe, Công chứng",
    pixelText: "472 x 709 px (300 DPI)",
  },
  {
    id: "3.5x4.5",
    title: "3.5x4.5 cm — Chuẩn Visa Châu Âu (Schengen), Hàn, Nhật",
    badge: "6 ảnh / vỉ 10x15",
    purpose:
      "Visa Schengen Châu Âu (Pháp, Đức, Ý...), Visa Hàn Quốc, Nhật Bản, Đài Loan, Úc",
    pixelText: "413 x 531 px (300 DPI)",
  },
  {
    id: "visa",
    title: "5x5 cm — Chuẩn Visa Mỹ (Hoa Kỳ DS-160)",
    badge: "4 ảnh / vỉ 10x15",
    purpose:
      "Bắt buộc cho đơn xin Visa Hoa Kỳ (Mỹ 2x2 inch), Hộ chiếu Mỹ, Visa Ấn Độ",
    pixelText: "600 x 600 px (300 DPI)",
  },
  {
    id: "2x3",
    title: "2x3 cm — Chuẩn Thẻ BHYT, Thư viện, Hồ sơ nhỏ",
    badge: "12 ảnh / vỉ 10x15",
    purpose:
      "Bảo hiểm y tế, Thẻ bạn đọc thư viện, Hồ sơ công đoàn lưu trữ",
    pixelText: "236 x 354 px (300 DPI)",
  },
];

const BG_COLOR_SWATCHES: {
  id: string;
  label: string;
  sub: string;
  hex: string;
}[] = [
  {
    id: "studio_blue",
    label: "Xanh Dịch Vụ Công",
    sub: "Chuẩn Tiệm Ảnh & Dịch vụ công",
    hex: "#0098ff",
  },
  {
    id: "white",
    label: "Trắng Hộ chiếu",
    sub: "Chuẩn ICAO / Visa",
    hex: "#ffffff",
  },
  {
    id: "deep_blue",
    label: "Xanh đậm",
    sub: "Học bạ / Bằng cấp",
    hex: "#0B69B7",
  },
  {
    id: "red",
    label: "Đỏ",
    sub: "Thẻ đoàn / Kỷ yếu",
    hex: "#d9251d",
  },
];

const BEAUTY_BUTTONS: {
  id: BeautyPreset;
  label: string;
  desc: string;
}[] = [
  {
    id: "natural",
    label: "Tự nhiên",
    desc: "Giữ 100% vân da và ánh sáng gốc chân thực (Chuẩn CCCD & Quốc tế)",
  },
  {
    id: "bright",
    label: "Sáng rõ",
    desc: "Nâng sáng Gamma 0.86 vùng tối & khử ám vàng đèn phòng",
  },
  {
    id: "glow",
    label: "AI Rạng rỡ ✨",
    desc: "High-Pass Retouch: Xóa thâm/bóng dầu nhưng giữ 100% vân da thật + Đèn mắt Catchlight",
  },
];

export default function StudioWorkspace({
  cutoutImageUrl,
  originalImageUrl,
  userPlan,
  onOpenPricing,
  onChangePhoto,
  onOpenCamera,
  onOpenGuide,
}: StudioWorkspaceProps) {
  const { consumeCredit } = useAuth();
  // 1. State cấu hình ảnh thẻ (Mặc định cỡ 4x6, nền Xanh Dịch vụ công #0098ff)
  const initialPreset = getBiometricStandardPreset("4x6");
  const [size, setSize] = useState<PhotoSizeKey>("4x6");
  const [bgColor, setBgColor] = useState<string>("#0098ff");
  const [beautyPreset, setBeautyPreset] = useState<BeautyPreset>("glow");

  // State tinh chỉnh làm đẹp da thủ công (Zero Latency Slider)
  const [brightnessAdjust, setBrightnessAdjust] = useState<number>(12);
  const [smoothness, setSmoothness] = useState<number>(75);
  const [rosyTone, setRosyTone] = useState<number>(35);
  const [eyeBrightening, setEyeBrightening] = useState<number>(60);

  // Xử lý khi chọn 1 trong 3 chế độ làm đẹp 1 chạm
  const handleSelectBeautyPreset = (preset: BeautyPreset) => {
    setBeautyPreset(preset);
    if (preset === "natural") {
      setBrightnessAdjust(0);
      setSmoothness(15);
      setRosyTone(0);
      setEyeBrightening(0);
    } else if (preset === "bright") {
      setBrightnessAdjust(8);
      setSmoothness(50);
      setRosyTone(25);
      setEyeBrightening(40);
    } else if (preset === "glow") {
      setBrightnessAdjust(12);
      setSmoothness(75);
      setRosyTone(35);
      setEyeBrightening(60);
    }
  };

  // Đặt lại các thanh trượt về giá trị mặc định của preset hiện tại
  const handleResetBeautySliders = () => {
    if (beautyPreset === "natural") {
      setBrightnessAdjust(0);
      setSmoothness(15);
      setRosyTone(0);
      setEyeBrightening(0);
    } else if (beautyPreset === "bright") {
      setBrightnessAdjust(8);
      setSmoothness(50);
      setRosyTone(25);
      setEyeBrightening(40);
    } else {
      setBrightnessAdjust(12);
      setSmoothness(75);
      setRosyTone(35);
      setEyeBrightening(60);
    }
  };

  // Transform cho người (Căn chuẩn sinh trắc học chống cụt đỉnh đầu)
  const [scale, setScale] = useState<number>(initialPreset.scale);
  const [offsetX, setOffsetX] = useState<number>(initialPreset.offsetX);
  const [offsetY, setOffsetY] = useState<number>(initialPreset.offsetY);

  // State AI Studio Agent (CodeFormer 4K)
  const [isEnhancingAI, setIsEnhancingAI] = useState<boolean>(false);
  const [aiEnhanceMessage, setAiEnhanceMessage] = useState<string | null>(null);

  // State giao diện Studio
  const [activeTab, setActiveTab] = useState<ActiveTab>("size_bg");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("single");
  const [showBiometricGrid, setShowBiometricGrid] = useState<boolean>(true);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // State Modal xem trước bản in hoàn chỉnh
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [previewSingleDataUrl, setPreviewSingleDataUrl] = useState<string>("");
  const [previewSheetDataUrl, setPreviewSheetDataUrl] = useState<string>("");

  // State kéo thả trực tiếp trên Canvas
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  // Refs lưu ảnh đã nạp & canvas hiển thị
  const personImgRef = useRef<HTMLImageElement | null>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const hasPaidAccess = userPlan.isVip || userPlan.credits > 0;

  // RAF ref để đảm bảo kéo thả đạt chuẩn 60 FPS mượt mà không lag
  const rafRef = useRef<number | null>(null);

  // Vẽ lại cả ảnh đơn và vỉ in mỗi khi cấu hình thay đổi
  const redrawAll = useCallback(
    async (isQuickDrag = false) => {
      const personImg = personImgRef.current;
      const singleCanvas = singleCanvasRef.current;
      const sheetCanvas = sheetCanvasRef.current;
      if (!personImg || !singleCanvas || !sheetCanvas) return;

      const config: PhotoRenderConfig = {
        size,
        bgColor,
        beautyPreset,
        brightnessAdjust,
        smoothness,
        rosyTone,
        eyeBrightening,
        scale,
        offsetX,
        offsetY,
        showWatermark: !hasPaidAccess,
        quickPreview: isQuickDrag,
      };

      try {
        await renderSinglePhoto(singleCanvas, personImg, config);

        // CHỈ tạo và vẽ vỉ in khi người dùng đang ở chế độ xem vỉ in (previewMode === 'sheet')
        // giúp loại bỏ hoàn toàn giật lag khi kéo thả ảnh đơn!
        if (previewMode === "sheet") {
          const generatedSheet = await generatePrintSheet(
            singleCanvas,
            size,
            !hasPaidAccess
          );

          sheetCanvas.width = generatedSheet.width;
          sheetCanvas.height = generatedSheet.height;
          const sCtx = sheetCanvas.getContext("2d");
          if (sCtx) {
            sCtx.drawImage(generatedSheet, 0, 0);
          }
        }
      } catch (err) {
        console.error("Lỗi khi vẽ preview:", err);
      }
    },
    [
      size,
      bgColor,
      beautyPreset,
      brightnessAdjust,
      smoothness,
      rosyTone,
      eyeBrightening,
      scale,
      offsetX,
      offsetY,
      hasPaidAccess,
      previewMode,
    ]
  );

  // Nạp ảnh chân dung đã tách nền khi URL thay đổi
  useEffect(() => {
    let active = true;
    loadImage(cutoutImageUrl)
      .then((img) => {
        if (!active) return;
        personImgRef.current = img;
        const preset = getBiometricStandardPreset(size);
        setScale(preset.scale);
        setOffsetX(preset.offsetX);
        setOffsetY(preset.offsetY);
        redrawAll(false);
      })
      .catch((err) => {
        console.error("Không thể tải ảnh đã tách nền:", err);
      });
    return () => {
      active = false;
    };
  }, [cutoutImageUrl, size]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vẽ lại khi các tùy chọn thay đổi
  useEffect(() => {
    if (personImgRef.current) {
      redrawAll(isDragging);
    }
  }, [redrawAll, isDragging]);

  // Xử lý Kéo - Thả trực tiếp trên khung Preview (Chuột & Cảm ứng đạt 60 FPS)
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (previewMode !== "single") return;
    setIsDragging(true);
    dragStartRef.current = {
      clientX,
      clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = clientX - dragStartRef.current.clientX;
    const dy = clientY - dragStartRef.current.clientY;
    const nextX = Math.round(dragStartRef.current.startOffsetX + dx * 1.15);
    const nextY = Math.round(dragStartRef.current.startOffsetY + dy * 1.15);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOffsetX(nextX);
      setOffsetY(nextY);
    });
  };

  const handlePointerUp = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      // Nhả chuột -> gọi redrawAll hoàn chỉnh (quickPreview = false) để áp dụng đầy đủ bộ lọc
      setTimeout(() => {
        redrawAll(false);
      }, 10);
    }
  };

  // Xử lý lăn chuột (Mouse Wheel) để phóng to/thu nhỏ trực tiếp
  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (previewMode !== "single") return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.03 : -0.03;
    setScale((prev) =>
      Math.min(1.8, Math.max(0.5, Number((prev + delta).toFixed(2))))
    );
  };

  // Các nút căn chỉnh nhanh
  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, Number((prev - 0.04).toFixed(2))));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(1.8, Number((prev + 0.04).toFixed(2))));
  };

  const handleResetTransform = () => {
    const preset = getBiometricStandardPreset(size);
    setScale(preset.scale);
    setOffsetX(preset.offsetX);
    setOffsetY(preset.offsetY);
  };

  /**
   * Tự động nén ảnh hiện tại về kích thước tối đa 1200px (JPEG 0.85, < 500KB)
   * Đệm nền trắng chuẩn trước khi nén để ảnh trong suốt không bị biến thành màu đen kịt.
   */
  const compressImageForAiEnhance = async (url: string): Promise<string> => {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    let w = img.naturalWidth || img.width || 800;
    let h = img.naturalHeight || img.height || 1000;
    const maxDim = 1200;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context không khả dụng");

    // Đệm nền trắng trước khi nén JPEG để tránh biến các điểm ảnh trong suốt thành nền đen
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  // Gọi AI Studio Agent (CodeFormer 4K) qua /api/ai-enhance
  const handleRunAiEnhance = async () => {
    setIsEnhancingAI(true);
    setAiEnhanceMessage("Đang nén chuẩn 1200px & gửi tới AI Studio Agent...");
    try {
      const sourceUrl = originalImageUrl || cutoutImageUrl;
      const base64DataUri = await compressImageForAiEnhance(sourceUrl);

      setAiEnhanceMessage(
        "AI Scanner đang quét & phục hồi chi tiết khuôn mặt 4K..."
      );
      const res = await fetch("/api/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64DataUri,
          fidelity: 0.78,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.enhancedImageUrl) {
        setAiEnhanceMessage("Đang đồng bộ nền Studio & tái tạo chân dung 4K...");

        let finalCutoutUrl: string = data.enhancedImageUrl;
        if (originalImageUrl) {
          try {
            const resp = await fetch(data.enhancedImageUrl);
            const blob = await resp.blob();
            finalCutoutUrl = await removePhotoBackground(blob);
          } catch (bgErr) {
            console.warn(
              "Không thể tự động tách nền ảnh phục hồi, sử dụng ảnh trực tiếp:",
              bgErr
            );
          }
        }

        const newImg = await loadImage(finalCutoutUrl);
        personImgRef.current = newImg;
        redrawAll();

        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setAiEnhanceMessage(
          "✓ Đã phục hồi & làm đẹp 4K thành công bằng AI Studio Agent!"
        );
      } else if (data.fallback) {
        // Kích hoạt bộ lọc High-Pass Studio nội bộ khi fallback
        handleSelectBeautyPreset("glow");
        redrawAll();
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        setAiEnhanceMessage(
          `✓ ${data.message || "Đã kích hoạt bộ lọc High-Pass Studio nội bộ"}`
        );
      } else {
        setAiEnhanceMessage(
          data.error || "Không thể xử lý ảnh qua AI Cloud lúc này."
        );
      }
    } catch (err) {
      console.error("AI enhance error:", err);
      handleSelectBeautyPreset("glow");
      redrawAll();
      setAiEnhanceMessage("✓ Đã kích hoạt bộ lọc High-Pass Studio nội bộ");
    } finally {
      setIsEnhancingAI(false);
    }
  };

  // Hàm phụ trợ tải Canvas xuống thành file PNG
  const triggerCanvasDownload = (
    canvas: HTMLCanvasElement,
    filename: string
  ) => {
    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Xử lý tải riêng 1 file Ảnh thẻ đơn HD (Nộp online) - Tránh lỗi chặn tải nhiều file trên Mobile
  const handleDownloadSingleHd = async () => {
    const personImg = personImgRef.current;
    if (!personImg) return;

    const allowed = await consumeCredit();
    if (!allowed) {
      onOpenPricing("family");
      return;
    }

    setIsExporting(true);
    try {
      const cleanSingleCanvas = document.createElement("canvas");
      const cleanConfig: PhotoRenderConfig = {
        size,
        bgColor,
        beautyPreset,
        brightnessAdjust,
        smoothness,
        rosyTone,
        eyeBrightening,
        scale,
        offsetX,
        offsetY,
        showWatermark: false,
      };

      await renderSinglePhoto(cleanSingleCanvas, personImg, cleanConfig);
      triggerCanvasDownload(cleanSingleCanvas, `anh-the-${size}-hd.png`);

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setDownloadToast(`Đã tải xuống Ảnh thẻ đơn ${size.toUpperCase()} Ultra HD!`);
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (err) {
      console.error("Lỗi khi tải ảnh đơn HD:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Xử lý tải riêng 1 file Vỉ in 10x15cm (Mang ra tiệm in) - Tiện lợi cho tiệm in & người dùng mobile
  const handleDownloadSheetHd = async () => {
    const personImg = personImgRef.current;
    if (!personImg) return;

    const allowed = await consumeCredit();
    if (!allowed) {
      onOpenPricing("family");
      return;
    }

    setIsExporting(true);
    try {
      const cleanSingleCanvas = document.createElement("canvas");
      const cleanConfig: PhotoRenderConfig = {
        size,
        bgColor,
        beautyPreset,
        brightnessAdjust,
        smoothness,
        rosyTone,
        eyeBrightening,
        scale,
        offsetX,
        offsetY,
        showWatermark: false,
      };

      await renderSinglePhoto(cleanSingleCanvas, personImg, cleanConfig);
      const cleanSheetCanvas = await generatePrintSheet(
        cleanSingleCanvas,
        size,
        false
      );
      triggerCanvasDownload(cleanSheetCanvas, `vi-in-10x15cm-${size}.png`);

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setDownloadToast("Đã tải xuống Vỉ in ảnh 10x15cm (300 DPI) sẵn sàng đi in!");
      setTimeout(() => setDownloadToast(null), 3500);
    } catch (err) {
      console.error("Lỗi khi tải vỉ in 10x15cm:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Xử lý tải trọn bộ cả 2 file: Ảnh HD & Vỉ in 10x15cm (Không watermark)
  const handleDownloadHdBundle = async () => {
    const personImg = personImgRef.current;
    if (!personImg) return;

    const allowed = await consumeCredit();
    if (!allowed) {
      onOpenPricing("family");
      return;
    }

    setIsExporting(true);
    try {
      const cleanSingleCanvas = document.createElement("canvas");
      const cleanConfig: PhotoRenderConfig = {
        size,
        bgColor,
        beautyPreset,
        brightnessAdjust,
        smoothness,
        rosyTone,
        eyeBrightening,
        scale,
        offsetX,
        offsetY,
        showWatermark: false,
      };

      await renderSinglePhoto(cleanSingleCanvas, personImg, cleanConfig);
      const cleanSheetCanvas = await generatePrintSheet(
        cleanSingleCanvas,
        size,
        false
      );

      triggerCanvasDownload(cleanSingleCanvas, "anh-the-hd.png");
      setTimeout(() => {
        triggerCanvasDownload(cleanSheetCanvas, "vi-in-10x15cm.png");
      }, 350);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Bỏ qua nếu confetti lỗi
      }

      setDownloadToast("Đã tải xuống trọn bộ Ảnh thẻ HD & Vỉ in 10x15cm!");
      setTimeout(() => setDownloadToast(null), 4000);
    } catch (err) {
      console.error("Lỗi khi xuất ảnh HD:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Xử lý tải ảnh xem trước miễn phí (Có nhãn chìm)
  const handleDownloadFreePreview = async () => {
    const personImg = personImgRef.current;
    if (!personImg) return;

    setIsExporting(true);
    try {
      const previewSingleCanvas = document.createElement("canvas");
      const previewConfig: PhotoRenderConfig = {
        size,
        bgColor,
        beautyPreset,
        brightnessAdjust,
        smoothness,
        rosyTone,
        eyeBrightening,
        scale,
        offsetX,
        offsetY,
        showWatermark: true,
      };

      await renderSinglePhoto(previewSingleCanvas, personImg, previewConfig);
      if (previewMode === "sheet") {
        const previewSheet = await generatePrintSheet(
          previewSingleCanvas,
          size,
          true
        );
        triggerCanvasDownload(previewSheet, "vi-in-xem-truoc.png");
      } else {
        triggerCanvasDownload(previewSingleCanvas, "anh-the-xem-truoc.png");
      }

      setDownloadToast("Đã tải ảnh xem trước miễn phí (Có nhãn chìm).");
      setTimeout(() => setDownloadToast(null), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  // Mở Popup xem trước bản in hoàn chỉnh (Full Preview)
  const handleOpenPrintPreview = async () => {
    const personImg = personImgRef.current;
    if (!personImg) return;

    try {
      const cleanSingleCanvas = document.createElement("canvas");
      const cleanConfig: PhotoRenderConfig = {
        size,
        bgColor,
        beautyPreset,
        brightnessAdjust,
        smoothness,
        rosyTone,
        eyeBrightening,
        scale,
        offsetX,
        offsetY,
        showWatermark: false,
      };

      await renderSinglePhoto(cleanSingleCanvas, personImg, cleanConfig);
      const cleanSheetCanvas = await generatePrintSheet(
        cleanSingleCanvas,
        size,
        false
      );

      setPreviewSingleDataUrl(cleanSingleCanvas.toDataURL("image/png", 1.0));
      setPreviewSheetDataUrl(cleanSheetCanvas.toDataURL("image/png", 1.0));
      setIsPrintPreviewOpen(true);
    } catch (err) {
      console.error("Lỗi khi tạo bản xem trước hoàn chỉnh:", err);
    }
  };

  const currentDim = PHOTO_DIMENSIONS[size];
  const currentBgObj =
    BG_COLOR_SWATCHES.find(
      (b) => b.hex.toLowerCase() === bgColor.toLowerCase()
    ) || BG_COLOR_SWATCHES[0];
  const currentBeautyObj =
    BEAUTY_BUTTONS.find((b) => b.id === beautyPreset) || BEAUTY_BUTTONS[2];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
      {/* Thông báo tải thành công */}
      {downloadToast && (
        <div className="fixed bottom-5 right-5 z-40 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-5 h-5 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-7 items-start">
        {/* ================= CỘT TRÁI: KHUNG PREVIEW STUDIO CHUYÊN NGHIỆP ================= */}
        <div className="lg:col-span-5 sticky top-14 z-20 bg-white/95 backdrop-blur-md lg:bg-white rounded-2xl border border-slate-200 shadow-md p-3.5 sm:p-5">
          {/* Thanh Segmented Control chuyển đổi 2 chế độ xem */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
            <button
              type="button"
              onClick={() => setPreviewMode("single")}
              className={`min-h-[44px] py-2 px-2.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                previewMode === "single"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">👤 Ảnh thẻ đơn</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode("sheet")}
              className={`min-h-[44px] py-2 px-2.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                previewMode === "sheet"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="truncate">
                🖨️ Vỉ 10x15 ({size === "3x4" ? "8 ảnh" : "4 ảnh"})
              </span>
            </button>
          </div>

          {/* Vùng hiển thị Canvas Preview với nền caro mờ chuẩn Studio */}
          <div
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              const t = e.touches[0];
              if (t) handlePointerDown(t.clientX, t.clientY);
            }}
            onTouchMove={(e) => {
              const t = e.touches[0];
              if (t) handlePointerMove(t.clientX, t.clientY);
            }}
            onTouchEnd={handlePointerUp}
            onWheel={handleWheelZoom}
            style={{
              backgroundImage:
                "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              backgroundColor: "#f8fafc",
            }}
            className={`relative flex items-center justify-center border border-slate-300/90 rounded-xl p-4 sm:p-6 min-h-[250px] sm:min-h-[380px] overflow-hidden select-none ${
              previewMode === "single"
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-default"
            }`}
          >
            {/* Khung bọc Canvas Ảnh đơn + Lớp phủ Lưới Căn Chuẩn Sinh Trắc Học */}
            <div
              className={`relative inline-flex items-center justify-center ${
                previewMode === "single" ? "block" : "hidden"
              }`}
            >
              {isComparingOriginal ? (
                <div className="relative">
                  <img
                    src={originalImageUrl || cutoutImageUrl}
                    alt="Ảnh gốc trước khi xử lý"
                    className="max-h-[225px] sm:max-h-[340px] w-auto max-w-full rounded-lg shadow-2xl border-2 border-amber-400 object-contain bg-slate-900"
                  />
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                    ẢNH GỐC BAN ĐẦU (TRƯỚC XỬ LÝ)
                  </div>
                </div>
              ) : (
                <>
                  <canvas
                    ref={singleCanvasRef}
                    className="max-h-[225px] sm:max-h-[340px] w-auto max-w-full rounded-lg shadow-2xl ring-2 ring-white/90 transition-shadow"
                  />

                  {/* Hiệu ứng tia quét sáng AI Scanner chạy dọc trên bức ảnh khi đang xử lý */}
                  {isEnhancingAI && (
                    <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none z-20 bg-indigo-950/35 backdrop-blur-[1px] flex flex-col items-center justify-center">
                      <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_4px_rgba(34,211,238,0.9)] animate-bounce" />
                      <div className="mt-3 px-3 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400/50 text-cyan-200 text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>AI Scanner 4K đang quét...</span>
                      </div>
                    </div>
                  )}

                  {/* Lớp SVG Overlay Lưới Căn Chuẩn Sinh Trắc Học (ICAO & Dịch vụ công) */}
                  {showBiometricGrid && !isEnhancingAI && (
                    <svg
                      viewBox={`0 0 ${currentDim.width} ${currentDim.height}`}
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none rounded-lg overflow-hidden"
                    >
                      {/* Trục dọc đối xứng giữa khuôn mặt */}
                      <line
                        x1={currentDim.width * 0.5}
                        y1="0"
                        x2={currentDim.width * 0.5}
                        y2={currentDim.height}
                        stroke="rgba(255, 255, 255, 0.55)"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                      />

                      {/* 1. Đường kẻ ngang giới hạn Đỉnh đầu (Top margin 10% - 12%) */}
                      <line
                        x1={currentDim.width * 0.06}
                        y1={currentDim.height * 0.1}
                        x2={currentDim.width * 0.94}
                        y2={currentDim.height * 0.1}
                        stroke="#fde047"
                        strokeWidth="1.5"
                        strokeDasharray="5 4"
                      />
                      <rect
                        x={currentDim.width * 0.5 - 55}
                        y={Math.max(4, currentDim.height * 0.1 - 20)}
                        width="110"
                        height="16"
                        rx="4"
                        fill="rgba(15, 23, 42, 0.75)"
                      />
                      <text
                        x={currentDim.width * 0.5}
                        y={Math.max(15, currentDim.height * 0.1 - 8)}
                        textAnchor="middle"
                        fill="#fde047"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        ĐỈNH TÓC (CÁCH LỀ 10%)
                      </text>

                      {/* 2. Khung bầu dục định vị Khuôn mặt chính giữa */}
                      <ellipse
                        cx={currentDim.width * 0.5}
                        cy={currentDim.height * 0.44}
                        rx={currentDim.width * 0.23}
                        ry={currentDim.height * 0.23}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.75)"
                        strokeWidth="1.6"
                        strokeDasharray="6 4"
                      />

                      {/* 3. Đường kẻ ngang vị trí Hai Mắt */}
                      <line
                        x1={currentDim.width * 0.15}
                        y1={currentDim.height * 0.4}
                        x2={currentDim.width * 0.85}
                        y2={currentDim.height * 0.4}
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <rect
                        x={currentDim.width * 0.5 - 45}
                        y={currentDim.height * 0.4 - 18}
                        width="90"
                        height="15"
                        rx="4"
                        fill="rgba(15, 23, 42, 0.75)"
                      />
                      <text
                        x={currentDim.width * 0.5}
                        y={Math.max(12, currentDim.height * 0.4 - 7)}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        VỊ TRÍ HAI MẮT
                      </text>

                      {/* 4. Đường giới hạn Cằm */}
                      <line
                        x1={currentDim.width * 0.3}
                        y1={currentDim.height * 0.67}
                        x2={currentDim.width * 0.7}
                        y2={currentDim.height * 0.67}
                        stroke="#fde047"
                        strokeWidth="1.4"
                        strokeDasharray="4 3"
                      />

                      {/* 5. Đường cong định vị Vai & Cổ áo */}
                      <path
                        d={`M ${currentDim.width * 0.04},${currentDim.height * 0.94} Q ${currentDim.width * 0.27},${currentDim.height * 0.74} ${currentDim.width * 0.41},${currentDim.height * 0.74} Q ${currentDim.width * 0.5},${currentDim.height * 0.82} ${currentDim.width * 0.59},${currentDim.height * 0.74} Q ${currentDim.width * 0.73},${currentDim.height * 0.74} ${currentDim.width * 0.96},${currentDim.height * 0.94}`}
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <rect
                        x={currentDim.width * 0.5 - 48}
                        y={currentDim.height * 0.7 - 5}
                        width="96"
                        height="15"
                        rx="4"
                        fill="rgba(15, 23, 42, 0.75)"
                      />
                      <text
                        x={currentDim.width * 0.5}
                        y={currentDim.height * 0.7 + 6}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        KHỚP CỔ & VAI ÁO
                      </text>
                    </svg>
                  )}
                </>
              )}
            </div>

            {/* Canvas Vỉ in 10x15cm */}
            <canvas
              ref={sheetCanvasRef}
              className={`${
                previewMode === "sheet" ? "block" : "hidden"
              } max-h-[225px] sm:max-h-[340px] w-auto max-w-full rounded-lg shadow-2xl border border-slate-300 transition-all`}
            />

            {/* Nút Bật/Tắt Lưới căn chuẩn sinh trắc học ở góc trên trái */}
            {previewMode === "single" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBiometricGrid((prev) => !prev);
                }}
                className={`absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 transition border ${
                  showBiometricGrid
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white/95 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>
                  Lưới căn chuẩn sinh trắc học: {showBiometricGrid ? "Bật" : "Tắt"}
                </span>
              </button>
            )}

            {/* Nút đổi ảnh / chụp lại ảnh ở góc phải */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
              {onOpenCamera && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCamera();
                  }}
                  className="bg-white/95 hover:bg-white text-slate-800 border border-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition"
                  title="Chụp lại ảnh bằng Camera"
                >
                  <Camera className="w-3 h-3 text-blue-600" />
                  <span className="hidden sm:inline">Chụp lại</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChangePhoto();
                }}
                className="bg-white/95 hover:bg-white text-slate-800 border border-slate-200 text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 transition"
                title="Chọn ảnh khác từ máy"
              >
                <Upload className="w-3 h-3 text-slate-600" />
                <span>Đổi ảnh</span>
              </button>
            </div>

            {/* Gợi ý kéo thả trực tiếp */}
            {previewMode === "single" && !isComparingOriginal && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-none whitespace-nowrap">
                <Move className="w-3 h-3 text-blue-300" />
                <span>Kéo ảnh để chỉnh vị trí • Lăn chuột thu phóng</span>
              </div>
            )}
          </div>

          {/* Hàng nút căn chỉnh nhanh + Nút Nhấn giữ xem Ảnh gốc (Before/After) */}
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition"
                  title="Thu nhỏ người"
                >
                  <ZoomOut className="w-4 h-4 shrink-0" />
                  <span>Thu nhỏ (-)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTransform}
                  className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1 transition"
                  title="Căn chuẩn tự động"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>Căn chuẩn</span>
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition"
                  title="Phóng to người"
                >
                  <ZoomIn className="w-4 h-4 shrink-0" />
                  <span>Phóng to (+)</span>
                </button>
              </div>
            </div>

            {/* Hàng 2 nút tiện ích: So sánh Ảnh gốc & Xem ảnh hoàn chỉnh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsComparingOriginal((prev) => !prev)}
                className={`w-full min-h-[42px] py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition select-none ${
                  isComparingOriginal
                    ? "bg-amber-500 text-slate-950 border-amber-600 shadow-inner"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
                title="Bấm để bật/tắt xem lại ảnh gốc ban đầu"
              >
                <SplitSquareVertical className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {isComparingOriginal
                    ? "✓ Đang xem Ảnh gốc (Bấm để quay lại)"
                    : "So sánh Ảnh gốc (Before/After)"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenPrintPreview}
                className="w-full min-h-[42px] py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                title="Mở xem trước bản in khổ lớn sắc nét có thước đo mm"
              >
                <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Xem ảnh hoàn chỉnh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: BẢNG ĐIỀU KHIỂN 3 TAB ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Thanh điều hướng 3 Tab tuần tự */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/70">
            <button
              type="button"
              onClick={() => setActiveTab("size_bg")}
              className={`min-h-[48px] py-3 px-1.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === "size_bg"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>1. Cỡ & Nền</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("beauty_cloth")}
              className={`min-h-[48px] py-3 px-1.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === "beauty_cloth"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>2. Làm đẹp da AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("export")}
              className={`min-h-[48px] py-3 px-1.5 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                activeTab === "export"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>3. Xuất & In</span>
            </button>
          </div>

          {/* Nội dung từng Tab */}
          <div className="p-4 sm:p-6">
            {/* ---------------- TAB 1: CỠ ẢNH & PHÔNG NỀN ---------------- */}
            {activeTab === "size_bg" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Chọn cỡ ảnh */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
                    <span>Chọn kích thước ảnh thẻ chuẩn</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Chuẩn 300 DPI
                    </span>
                  </h3>

                  <div className="space-y-2.5">
                    {SIZE_CARDS.map((item) => {
                      const selected = size === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSize(item.id);
                            const preset = getBiometricStandardPreset(item.id);
                            setScale(preset.scale);
                            setOffsetX(preset.offsetX);
                            setOffsetY(preset.offsetY);
                          }}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition flex items-start justify-between gap-3 ${
                            selected
                              ? "border-blue-600 bg-blue-50/50 shadow-sm"
                              : "border-slate-200 hover:border-blue-300 bg-white"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm sm:text-base text-slate-900">
                                {item.title}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {item.purpose}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "border border-slate-300"
                            }`}
                          >
                            {selected && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chọn màu phông nền */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
                    Chọn màu phông nền chuẩn
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BG_COLOR_SWATCHES.map((swatch) => {
                      const isSelected =
                        bgColor.toLowerCase() === swatch.hex.toLowerCase();
                      return (
                        <button
                          key={swatch.id}
                          type="button"
                          onClick={() => setBgColor(swatch.hex)}
                          className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between gap-2 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="w-8 h-8 rounded-full border border-slate-300 shadow-inner"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-slate-900">
                              {swatch.label}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {swatch.sub}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Nút bật/tắt Lưới căn chuẩn sinh trắc học trong Tab 1 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Grid className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        Lưới căn chuẩn sinh trắc học (ICAO 9303)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Hiển thị vạch căn đỉnh tóc (10% - 12%), vị trí mắt và vai áo
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBiometricGrid((prev) => !prev)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      showBiometricGrid
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {showBiometricGrid ? "Đang Bật" : "Đang Tắt"}
                  </button>
                </div>

                {/* Nút xem cẩm nang quy chuẩn ICAO */}
                {onOpenGuide && (
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Xem Cẩm nang quy chuẩn ảnh thẻ ICAO 9303 (ĐÚNG vs SAI)
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-700 underline font-semibold">
                      Xem ngay →
                    </span>
                  </button>
                )}

                {/* Nút chuyển nhanh sang Tab 2 */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("beauty_cloth")}
                    className="w-full sm:w-auto min-h-[46px] px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <span>Tiếp theo: Làm đẹp da AI</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- TAB 2: LÀM ĐẸP DA AI ---------------- */}
            {activeTab === "beauty_cloth" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* KHỐI 1 (TRÊN CÙNG): AI STUDIO AGENT (CODEFORMER 4K) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white border border-indigo-500/40 shadow-lg space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                        <Wand2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-xs sm:text-sm flex flex-wrap items-center gap-2">
                          <span>AI Studio Agent (CodeFormer 4K)</span>
                          <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                            Replicate Cloud AI
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-indigo-200/90 mt-0.5">
                          Tái tạo nét mặt chuẩn 4K: Làm rõ từng sợi tóc, lông mi, đồng tử mắt và mịn da tự nhiên
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isEnhancingAI}
                    onClick={handleRunAiEnhance}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 hover:from-indigo-400 hover:via-blue-400 hover:to-purple-500 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {isEnhancingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                        <span>AI Scanner Đang Quét & Phục Hồi 4K...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>✨ Phục hồi & Làm đẹp 4K bằng AI Studio Agent</span>
                      </>
                    )}
                  </button>

                  {aiEnhanceMessage && (
                    <div className="text-xs text-indigo-100 bg-indigo-950/90 p-3 rounded-xl border border-indigo-400/30 flex items-center gap-2 animate-in fade-in">
                      <span className="text-emerald-400 font-bold">●</span>
                      <span>{aiEnhanceMessage}</span>
                    </div>
                  )}
                </div>

                {/* KHỐI 2 (Ở GIỮA): 3 NÚT CHỌN NHANH CHẾ ĐỘ 1 CHẠM */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Chế độ Làm đẹp 1 chạm (Presets)</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Giữ nét mắt & tóc 100%
                    </span>
                  </h3>

                  <div className="space-y-2.5">
                    {BEAUTY_BUTTONS.map((btn) => {
                      const active = beautyPreset === btn.id;
                      return (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => handleSelectBeautyPreset(btn.id)}
                          className={`w-full p-3.5 sm:p-4 rounded-xl border-2 text-left transition flex items-start justify-between gap-3 ${
                            active
                              ? "border-blue-600 bg-blue-50/60 shadow-sm"
                              : "border-slate-200 hover:border-blue-300 bg-white"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm sm:text-base text-slate-900">
                                {btn.label}
                              </span>
                              {btn.id === "glow" && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                  Khuyên dùng • Chuẩn Studio
                                </span>
                              )}
                              {btn.id === "bright" && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                                  Chuẩn Dịch vụ công
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">{btn.desc}</p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              active
                                ? "bg-blue-600 text-white"
                                : "border border-slate-300"
                            }`}
                          >
                            {active && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* KHỐI 3 (BÊN DƯỚI): BẢNG TINH CHỈNH CHI TIẾT THEO Ý MUỐN */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        🎨 Tinh chỉnh chi tiết theo ý muốn
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetBeautySliders}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                      title="Đưa các thanh trượt về lại vị trí mặc định"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>↺ Đặt lại mặc định</span>
                    </button>
                  </div>

                  <div className="space-y-4 pt-0.5">
                    {/* 1. Độ sáng khuôn mặt (-25 đến +25) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>💡 Độ sáng khuôn mặt</span>
                        </span>
                        <span className="font-mono font-bold text-blue-700 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200/80 text-[11px]">
                          {brightnessAdjust > 0
                            ? `+${brightnessAdjust}%`
                            : `${brightnessAdjust}%`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setBrightnessAdjust((prev) => Math.max(-25, prev - 1))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Giảm độ sáng 1%"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min={-25}
                          max={25}
                          step={1}
                          value={brightnessAdjust}
                          onChange={(e) =>
                            setBrightnessAdjust(Number(e.target.value))
                          }
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setBrightnessAdjust((prev) => Math.min(25, prev + 1))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Tăng độ sáng 1%"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Độ mịn da & Xóa mụn (0% đến 100%) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>🧼 Độ mịn da & Xóa mụn</span>
                        </span>
                        <span className="font-mono font-bold text-indigo-700 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-[11px]">
                          {smoothness}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSmoothness((prev) => Math.max(0, prev - 5))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Giảm độ mịn 5%"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={smoothness}
                          onChange={(e) =>
                            setSmoothness(Number(e.target.value))
                          }
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSmoothness((prev) => Math.min(100, prev + 5))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Tăng độ mịn 5%"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 3. Nâng tông da trắng hồng (0% đến 100%) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>🌸 Nâng tông da trắng hồng</span>
                        </span>
                        <span className="font-mono font-bold text-rose-700 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200/80 text-[11px]">
                          {rosyTone}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setRosyTone((prev) => Math.max(0, prev - 5))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Giảm sắc hồng 5%"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={rosyTone}
                          onChange={(e) => setRosyTone(Number(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setRosyTone((prev) => Math.min(100, prev + 5))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Tăng sắc hồng 5%"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 4. Làm sáng mắt & Khử quầng thâm (0% đến 100%) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>👁️ Làm sáng mắt & Khử quầng thâm</span>
                        </span>
                        <span className="font-mono font-bold text-sky-700 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200/80 text-[11px]">
                          {eyeBrightening}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEyeBrightening((prev) => Math.max(0, prev - 5))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Giảm độ sáng mắt 5%"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={eyeBrightening}
                          onChange={(e) =>
                            setEyeBrightening(Number(e.target.value))
                          }
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEyeBrightening((prev) => Math.min(100, prev + 5))
                          }
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition shrink-0 shadow-2xs"
                          title="Tăng độ sáng mắt 5%"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nút chuyển sang Tab 3 */}
                <div className="pt-2 flex justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("size_bg")}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
                  >
                    ← Quay lại: Cỡ & Nền
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("export")}
                    className="flex-1 sm:flex-initial min-h-[46px] px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <span>Tiếp theo: Xuất & In</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: XUẤT ẢNH & IN ẤN ---------------- */}
            {activeTab === "export" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Bảng tóm tắt thông số bức ảnh đã tạo */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Thông số bộ ảnh thẻ của bạn
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Đạt chuẩn 300 DPI
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <div className="text-slate-500 text-xs">Kích thước</div>
                      <div className="font-bold text-slate-900">
                        {currentDim.dimensionsCm}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-xs">Màu phông nền</div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: bgColor }}
                        />
                        <span>{currentBgObj.label}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-xs">
                        Làm đẹp da AI
                      </div>
                      <div className="font-bold text-slate-900">
                        {currentBeautyObj.label}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-xs">
                        Vỉ in kèm theo
                      </div>
                      <div className="font-bold text-blue-600">
                        Khổ 10x15cm ({currentDim.sheetCount} ảnh)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trạng thái tài khoản hiện tại */}
                <div className="px-4 py-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-blue-950 font-medium">
                    {userPlan.isVip ? (
                      <>
                        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          Bạn đang dùng{" "}
                          <strong>Gói Pro Studio (Tải không giới hạn)</strong>
                        </span>
                      </>
                    ) : userPlan.credits > 0 ? (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Bạn còn{" "}
                          <strong>
                            {userPlan.credits} lượt tải ảnh Ultra HD
                          </strong>{" "}
                          (Không logo chìm)
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Mở khóa tải ảnh gốc Ultra HD + Vỉ in 10x15cm chỉ từ{" "}
                          <strong>4.900đ/ảnh</strong>
                        </span>
                      </>
                    )}
                  </div>

                  {!userPlan.isVip && (
                    <button
                      type="button"
                      onClick={() => onOpenPricing("family")}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2"
                    >
                      + Thêm lượt
                    </button>
                  )}
                </div>

                {/* Nút lớn nổi bật: Xem trước bản in hoàn chỉnh (Full Preview) */}
                <button
                  type="button"
                  onClick={handleOpenPrintPreview}
                  className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base border border-slate-700 shadow-md transition flex items-center justify-center gap-2.5 group"
                >
                  <Eye className="w-5 h-5 text-blue-400 group-hover:text-blue-300 shrink-0" />
                  <span>
                    🔍 Xem trước bản in hoàn chỉnh (Full Preview)
                  </span>
                </button>

                {/* Nhóm nút Tải Ảnh Đơn & Vỉ In HD Chuẩn Lab */}
                <div className="space-y-3 pt-1">
                  {/* Nút chính to, nổi bật: Tải trọn bộ 2 file */}
                  <button
                    type="button"
                    onClick={handleDownloadHdBundle}
                    disabled={isExporting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2.5"
                  >
                    <Download className="w-5 h-5 shrink-0" />
                    <span>
                      Tải Trọn Bộ: Ảnh HD & Vỉ In 10x15cm (Không Watermark)
                    </span>
                  </button>

                  {/* 2 nút tải riêng biệt tránh lỗi trình duyệt chặn popup trên Safari / Chrome di động */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadSingleHd}
                      disabled={isExporting}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-blue-300 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
                      title="Chỉ tải 1 file ảnh thẻ đơn độ phân giải cao để nộp hồ sơ online"
                    >
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Tải riêng Ảnh Thẻ Đơn HD</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadSheetHd}
                      disabled={isExporting}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-blue-300 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
                      title="Chỉ tải 1 file vỉ in 10x15cm để mang ra tiệm ảnh in ngay"
                    >
                      <Printer className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Tải riêng Vỉ In 10x15cm</span>
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-500">
                    💡 Khuyên dùng cho di động: Bấm <strong>Tải riêng</strong> từng file để không bao giờ bị trình duyệt chặn tải.
                  </p>

                  {/* Nút phụ nhỏ bên dưới: Tải ảnh xem trước miễn phí */}
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={handleDownloadFreePreview}
                      disabled={isExporting}
                      className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 py-2 px-4 rounded-lg hover:bg-slate-100 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Tải ảnh xem trước miễn phí (Có nhãn chìm)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL XEM TRƯỚC BẢN IN HOÀN CHỈNH ================= */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        singlePhotoDataUrl={previewSingleDataUrl}
        sheetPhotoDataUrl={previewSheetDataUrl}
        size={size}
        onDownloadBundle={handleDownloadHdBundle}
        isExporting={isExporting}
      />
    </div>
  );
}
